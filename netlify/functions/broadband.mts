import type { Config, Context } from '@netlify/functions'
import {
  isBrowserRequest,
  isCoveredRegion,
  parseCoords,
  readCache,
  recordEvent,
  releaseLookup,
  reserveLookup,
  writeCache,
  type GuardEvent,
} from '../lib/broadband-guard.mjs'

/**
 * The BroadbandMap credential.
 *
 * The environment variable always wins. The literal below is the key that was
 * previously committed directly into this file; it is kept only so availability
 * lookups keep working until BROADBANDMAP_API_KEY is configured.
 *
 * ACTION REQUIRED: this key exists in this repository's history, which means
 * anyone who can read the repository can spend the plan's credits directly and
 * bypass every limit in this function. Rotate it in the BroadbandMap dashboard,
 * set the replacement as the BROADBANDMAP_API_KEY environment variable, and
 * then delete the fallback below.
 */
const COMMITTED_FALLBACK_KEY = 'bbm_live_edW_9zFkVJKi3itKKVflsbG2NSreQGST-7qupZAYO_Q'

function broadbandMapKey(): string {
  return Netlify.env.get('BROADBANDMAP_API_KEY') || COMMITTED_FALLBACK_KEY
}

/**
 * Proxies location lookups to the BroadbandMap API so the API key stays
 * server-side. The client calls /api/broadband?lat=..&lng=..
 *
 * Every request passes through the layered spend protection in
 * ../lib/broadband-guard.mts before it is allowed to cost a metered credit.
 * See that file for the reasoning behind each layer and its limits.
 */
export default async (req: Request, context: Context) => {
  const url = new URL(req.url)

  const deny = (status: number, error: string, event: GuardEvent) => {
    context.waitUntil(recordEvent(event))
    return Response.json({ error, providers: [] }, { status, headers: NO_STORE })
  }

  if (req.method !== 'GET') {
    return deny(405, 'Method not allowed', 'blocked_bad_request')
  }

  // Layer 1 — the request must describe a location BroadbandMap can answer for.
  const coords = parseCoords(url)
  if (!coords) {
    return deny(400, 'A valid US lat/lng pair is required', 'blocked_bad_request')
  }

  // Layer 2 — must be our own page's fetch() from a real browser.
  if (!isBrowserRequest(req, url)) {
    return deny(403, 'Automated access to this endpoint is not permitted', 'blocked_not_browser')
  }

  // Layer 3 — a recent answer for this location costs nothing to reuse.
  const cached = await readCache(coords.key)
  if (cached) {
    context.waitUntil(recordEvent('served_cache'))
    return new Response(cached.body, {
      status: cached.status,
      headers: cached.status === 200 ? CACHEABLE : NO_STORE,
    })
  }

  // Requests from outside BroadbandMap's coverage are answered from cache only,
  // so they can never consume a credit.
  if (!isCoveredRegion(context.geo?.country?.code)) {
    return deny(403, 'Availability lookups are limited to US locations', 'blocked_outside_us')
  }

  const apiKey = broadbandMapKey()
  if (!apiKey) {
    console.error('[broadband] BROADBANDMAP_API_KEY is not set')
    return deny(503, 'Availability lookup is temporarily unavailable', 'storage_error')
  }

  // Layers 4 and 5 — per-client limits, then the global credit ceilings.
  const decision = await reserveLookup(context.ip)
  if (!decision.allowed) {
    const message =
      decision.event === 'blocked_rate_limit'
        ? 'Too many availability lookups from this connection. Please try again later.'
        : 'Availability lookups are temporarily paused. Please try again later.'
    return deny(decision.status, message, decision.event)
  }

  const upstream = `https://broadbandmap.com/api/v1/location/internet?lat=${encodeURIComponent(
    String(coords.lat),
  )}&lng=${encodeURIComponent(String(coords.lng))}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  try {
    const resp = await fetch(upstream, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    })
    const body = await resp.text()

    // Cache successes for weeks and failures for minutes, so a retry storm
    // against a broken location cannot drain credits either.
    context.waitUntil(writeCache(coords.key, body, resp.status))
    context.waitUntil(recordEvent(resp.ok ? 'served_upstream' : 'upstream_error'))

    return new Response(body, {
      status: resp.status,
      headers: resp.ok ? CACHEABLE : NO_STORE,
    })
  } catch (e: any) {
    // No answer means no credit was actually consumed, so hand the reservation
    // back rather than charging the budget for a failed call.
    context.waitUntil(releaseLookup())
    context.waitUntil(recordEvent('upstream_error'))
    const status = e?.name === 'AbortError' ? 504 : 502
    return Response.json({ error: 'Upstream request failed', providers: [] }, { status, headers: NO_STORE })
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Successful answers are held at the edge as well, so repeat lookups of a
 * popular ZIP are absorbed by the CDN and never even start the function.
 */
const CACHEABLE = {
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=3600',
  'Netlify-CDN-Cache-Control': 'public, durable, max-age=86400, stale-while-revalidate=604800',
  'X-Robots-Tag': 'noindex, nofollow',
}

const NO_STORE = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
}

export const config: Config = {
  path: '/api/broadband',
  method: ['GET'],
}
