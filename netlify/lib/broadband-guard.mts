/**
 * Abuse protection for the BroadbandMap proxy (/api/broadband).
 *
 * The BroadbandMap plan is metered (10,000 lookups/month), so an unprotected
 * proxy is a way for crawlers to spend real money. Protection is layered so the
 * cheapest checks run first and a lookup only ever reaches the paid upstream
 * when every layer agrees it is a genuine visitor asking about a location we
 * have not seen recently:
 *
 *   1. request shape      — GET only, coordinates must be inside the US
 *   2. browser gate       — same-origin fetch from a real browser, no crawlers
 *   3. response cache     — repeat lookups are served from Blobs, free
 *   4. per-client limits   — hourly/daily caps per IP
 *   5. global credit caps — hard daily/monthly ceilings, atomic in Postgres
 *
 * Layers 4 and 5 are only consulted on a cache miss, so database traffic is
 * proportional to *distinct* locations — which is exactly what costs credits.
 */

import { createHash } from 'node:crypto'
import { getStore } from '@netlify/blobs'
import { getDatabase } from '@netlify/database'

/** Every limit is env-overridable so the caps can be tuned without a deploy. */
function envInt(name: string, fallback: number): number {
  const raw = Netlify.env.get(name)
  if (!raw) return fallback
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

export const LIMITS = {
  /** Ceiling for a single UTC day. Caps the damage of one bad day. */
  get perDay() {
    return envInt('BROADBAND_MAX_PER_DAY', 400)
  },
  /** Ceiling for a UTC month, kept under the 10,000 plan as a safety reserve. */
  get perMonth() {
    return envInt('BROADBAND_MAX_PER_MONTH', 8000)
  },
  /**
   * Fresh lookups allowed from one IP per hour. Set generously on purpose:
   * mobile carriers put many real visitors behind one shared address, and the
   * global caps below — not this one — are what bound the monthly bill.
   */
  get perIpHour() {
    return envInt('BROADBAND_MAX_PER_IP_HOUR', 15)
  },
  /** Fresh lookups allowed from one IP per day. */
  get perIpDay() {
    return envInt('BROADBAND_MAX_PER_IP_DAY', 60)
  },
  /** How long a successful upstream answer stays reusable, in days. */
  get cacheDays() {
    return envInt('BROADBAND_CACHE_DAYS', 30)
  },
}

/**
 * Outcomes recorded per day so consumption and blocked traffic can be reviewed
 * later without keeping a row per request (a flood must not grow the table).
 */
export type GuardEvent =
  | 'served_cache'
  | 'served_upstream'
  | 'blocked_bad_request'
  | 'blocked_not_browser'
  | 'blocked_outside_us'
  | 'blocked_rate_limit'
  | 'blocked_budget'
  | 'upstream_error'
  | 'storage_error'

// ── Coordinate handling ───────────────────────────────────────────────────────

/**
 * Bounding boxes for the areas BroadbandMap actually covers. Anything outside
 * these cannot produce a useful answer, so it is rejected before it costs a
 * credit — coordinate-enumerating crawlers rarely stay inside them.
 */
const US_BOUNDS = [
  { latMin: 24.4, latMax: 49.5, lngMin: -125.0, lngMax: -66.9 }, // contiguous
  { latMin: 51.0, latMax: 71.6, lngMin: -168.2, lngMax: -129.9 }, // Alaska
  { latMin: 18.8, latMax: 22.3, lngMin: -160.3, lngMax: -154.7 }, // Hawaii
  { latMin: 17.8, latMax: 18.6, lngMin: -67.4, lngMax: -64.5 }, // PR / USVI
]

/**
 * Rounds to ~11 m. Two visitors at the same address share a cache entry while
 * the precision stays finer than any real service boundary.
 */
const CACHE_PRECISION = 4

export type Coords = { lat: number; lng: number; key: string }

/** A real client sends a plain decimal. Anything else is a probe, not a visitor. */
const DECIMAL = /^-?\d{1,3}(\.\d{1,10})?$/

export function parseCoords(url: URL): Coords | null {
  const rawLat = url.searchParams.get('lat') ?? ''
  const rawLng = url.searchParams.get('lng') ?? ''
  if (!DECIMAL.test(rawLat) || !DECIMAL.test(rawLng)) return null

  const lat = Number.parseFloat(rawLat)
  const lng = Number.parseFloat(rawLng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (!US_BOUNDS.some((b) => lat >= b.latMin && lat <= b.latMax && lng >= b.lngMin && lng <= b.lngMax)) {
    return null
  }
  const rLat = lat.toFixed(CACHE_PRECISION)
  const rLng = lng.toFixed(CACHE_PRECISION)
  return { lat: Number.parseFloat(rLat), lng: Number.parseFloat(rLng), key: `v1/${rLat}_${rLng}` }
}

// ── Layer 2: browser gate ────────────────────────────────────────────────────

/**
 * Clients that identify themselves as automation. Well-behaved crawlers are
 * caught here; the layers below handle the ones that lie about who they are.
 */
const AUTOMATED_UA =
  /bot\b|bot\/|crawl|spider|slurp|scrapy|curl|wget|python|java\/|go-http|okhttp|httpclient|libwww|perl|ruby|php|axios|node-fetch|undici|headless|phantom|puppeteer|playwright|selenium|ahrefs|semrush|mj12|dotbot|petalbot|bytespider|gptbot|claudebot|ccbot|amazonbot|dataforseo|serpstat|screaming|monitoring|uptime|pingdom|lighthouse|preview|fetcher/i

/** Territories BroadbandMap covers, as reported by Netlify geolocation. */
const US_COUNTRIES = new Set(['US', 'PR', 'VI', 'GU', 'AS', 'MP'])

function hostsMatch(a: string, b: string): boolean {
  const strip = (h: string) => h.replace(/^www\./i, '').toLowerCase()
  return strip(a) === strip(b)
}

/**
 * Confirms the request looks like `fetch()` from our own page in a real
 * browser. This is the layer that stops the bulk of unwanted traffic, and it
 * costs nothing: no upstream call, no database, no blob read.
 */
export function isBrowserRequest(req: Request, url: URL): boolean {
  const ua = req.headers.get('user-agent') ?? ''

  // Real browsers always send a UA, and it always starts with "Mozilla/".
  if (ua.length < 20 || !ua.includes('Mozilla/')) return false
  if (AUTOMATED_UA.test(ua)) return false

  // A top-level navigation is never our own JS — it is a crawler following a
  // link or a URL pasted into an address bar.
  const mode = req.headers.get('sec-fetch-mode')
  if (mode === 'navigate') return false

  // Chrome, Firefox and current Safari all label the request's origin
  // relationship. When present it must say the request came from our own site.
  const site = req.headers.get('sec-fetch-site')
  if (site) return site === 'same-origin' || site === 'same-site'

  // Older browsers omit Sec-Fetch-*; fall back to the Referer, which a
  // same-origin fetch always carries under the default referrer policy.
  const referer = req.headers.get('referer')
  if (!referer) return false
  try {
    return hostsMatch(new URL(referer).hostname, url.hostname)
  } catch {
    return false
  }
}

/** Lookups from outside US territories are served from cache but never billed. */
export function isCoveredRegion(country: string | undefined): boolean {
  return !country || US_COUNTRIES.has(country.toUpperCase())
}

// ── Layer 3: response cache ──────────────────────────────────────────────────

/**
 * FCC availability data behind BroadbandMap changes on a months-long cycle, so
 * a long TTL is safe and makes the common case — several visitors checking the
 * same ZIP centroid — completely free.
 */
type CacheEntry = { body: string; status: number; fetchedAt: number }

function cacheStore() {
  return getStore('broadband-cache')
}

export async function readCache(key: string): Promise<CacheEntry | null> {
  try {
    const entry = (await cacheStore().get(key, { type: 'json' })) as CacheEntry | null
    if (!entry?.body || typeof entry.fetchedAt !== 'number') return null
    // Failures are remembered only briefly so a transient upstream outage does
    // not poison a location for a month.
    const ttlMs = entry.status === 200 ? LIMITS.cacheDays * 86_400_000 : 600_000
    if (Date.now() - entry.fetchedAt > ttlMs) return null
    return entry
  } catch {
    return null
  }
}

export async function writeCache(key: string, body: string, status: number): Promise<void> {
  try {
    await cacheStore().setJSON(key, { body, status, fetchedAt: Date.now() } satisfies CacheEntry)
  } catch {
    // A cache write failure must not fail the visitor's lookup.
  }
}

// ── Period keys ──────────────────────────────────────────────────────────────

/** All windows are UTC so every region of the platform agrees on the boundary. */
export function periodKeys(now = new Date()) {
  const iso = now.toISOString()
  return {
    day: iso.slice(0, 10), // 2026-08-01
    month: iso.slice(0, 7), // 2026-08
    hour: iso.slice(0, 13), // 2026-08-01T14
  }
}

// ── Layers 4 & 5: rate limits and credit budget ──────────────────────────────

function hashIp(ip: string): string {
  const salt = Netlify.env.get('BROADBAND_IP_SALT') ?? 'internet4all-broadband'
  // A missing IP should not silently merge every visitor into one bucket, but it
  // also must not be trusted, so it gets its own clearly-labelled bucket.
  const subject = ip && ip.length > 2 ? ip : 'unknown-client'
  return createHash('sha256').update(`${salt}:${subject}`).digest('hex').slice(0, 32)
}

/**
 * Increments a counter only while it is below `cap`, and reports whether the
 * caller may proceed.
 *
 * The check and the increment are a single atomic statement: the conditional
 * `ON CONFLICT ... DO UPDATE ... WHERE` returns no row once the cap is reached,
 * so concurrent requests cannot race past the ceiling the way a read-then-write
 * counter would. That is what makes the caps a real guarantee under a flood
 * rather than an approximation.
 */
async function reserve(table: 'limit' | 'credit', key: string, cap: number, expiresAt?: Date): Promise<boolean> {
  if (cap <= 0) return false
  const db = getDatabase()
  const rows =
    table === 'credit'
      ? await db.sql`
          INSERT INTO broadband_credit_usage (period_key, credits)
          VALUES (${key}, 1)
          ON CONFLICT (period_key) DO UPDATE
            SET credits = broadband_credit_usage.credits + 1, updated_at = NOW()
            WHERE broadband_credit_usage.credits < ${cap}
          RETURNING credits
        `
      : await db.sql`
          INSERT INTO broadband_rate_limit (bucket_key, hits, expires_at)
          VALUES (${key}, 1, ${expiresAt!.toISOString()}::timestamptz)
          ON CONFLICT (bucket_key) DO UPDATE
            SET hits = broadband_rate_limit.hits + 1, updated_at = NOW()
            WHERE broadband_rate_limit.hits < ${cap}
          RETURNING hits
        `
  return rows.length > 0
}

/** Returns a reserved credit when a later check in the same request refuses. */
async function refundCredit(key: string): Promise<void> {
  try {
    const db = getDatabase()
    await db.sql`
      UPDATE broadband_credit_usage
      SET credits = GREATEST(credits - 1, 0), updated_at = NOW()
      WHERE period_key = ${key}
    `
  } catch {
    // Failing to refund only makes the budget more conservative, never less.
  }
}

export type Decision = { allowed: true } | { allowed: false; event: GuardEvent; status: number }

/**
 * Decides whether this request may spend one BroadbandMap credit.
 *
 * Storage problems deliberately fail closed. A visitor then falls back to the
 * provider data the site already ships, which is a far better outcome than an
 * outage silently disabling the spending limits.
 */
export async function reserveLookup(ip: string): Promise<Decision> {
  const { day, month, hour } = periodKeys()
  const client = hashIp(ip)

  try {
    const hourOk = await reserve('limit', `${client}:h:${hour}`, LIMITS.perIpHour, new Date(Date.now() + 7_200_000))
    if (!hourOk) return { allowed: false, event: 'blocked_rate_limit', status: 429 }

    const dayOk = await reserve('limit', `${client}:d:${day}`, LIMITS.perIpDay, new Date(Date.now() + 172_800_000))
    if (!dayOk) return { allowed: false, event: 'blocked_rate_limit', status: 429 }

    const monthOk = await reserve('credit', `month:${month}`, LIMITS.perMonth)
    if (!monthOk) return { allowed: false, event: 'blocked_budget', status: 503 }

    const dailyOk = await reserve('credit', `day:${day}`, LIMITS.perDay)
    if (!dailyOk) {
      await refundCredit(`month:${month}`)
      return { allowed: false, event: 'blocked_budget', status: 503 }
    }

    return { allowed: true }
  } catch (err) {
    console.error('[broadband] limit storage unavailable, refusing to spend a credit:', err)
    return { allowed: false, event: 'storage_error', status: 503 }
  }
}

/** Releases both credit reservations when the upstream call never happened. */
export async function releaseLookup(): Promise<void> {
  const { day, month } = periodKeys()
  await refundCredit(`day:${day}`)
  await refundCredit(`month:${month}`)
}

// ── Daily outcome counters ───────────────────────────────────────────────────

export async function recordEvent(event: GuardEvent): Promise<void> {
  try {
    const db = getDatabase()
    await db.sql`
      INSERT INTO broadband_event_counts (day, event, count)
      VALUES (${periodKeys().day}::date, ${event}, 1)
      ON CONFLICT (day, event) DO UPDATE
        SET count = broadband_event_counts.count + 1, updated_at = NOW()
    `
  } catch {
    // Metrics are best-effort and must never affect the response.
  }
}
