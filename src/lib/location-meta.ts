// src/lib/location-meta.ts
// Deterministic meta title/description generation for ~70K location pages.
// See MetaPlan_HumanIntent_2026.md for the full specification.

/** Simple stable hash — deterministic across builds. */
function hashPath(path: string): number {
  let h = 0;
  for (let i = 0; i < path.length; i++) {
    h = ((h << 5) - h + path.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Append (year) to title only if total ≤ 60 chars. */
function withYear(base: string): string {
  const year = new Date().getFullYear();
  const candidate = `${base} (${year})`;
  return candidate.length <= 60 ? candidate : base;
}

function truncateAtWordBoundary(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const clipped = text.slice(0, maxChars + 1);
  const lastSpace = clipped.lastIndexOf(' ');
  if (lastSpace > 0) return clipped.slice(0, lastSpace).trimEnd();
  return text.slice(0, maxChars).trimEnd();
}

// ─── A) STATE PAGES ─────────────────────────────────────────────

const stateTitles: ((s: string) => string)[] = [
  (s) => `Internet Providers in ${s}`,
  (s) => `Fiber Internet Providers in ${s}`,
  (s) => `High Speed Internet in ${s}`,
  (s) => `5G Home Internet in ${s}`,
  (s) => `Home WiFi Providers in ${s}`,
  (s) => `Home Internet Providers in ${s}`,
  (s) => `Cheap Internet in ${s}`,
  (s) => `Get Fast Internet in ${s}`,
];

const stateDescs: ((s: string) => string)[] = [
  (s) => `Best local internet options near you in ${s}. Check availability at your address and find the right plan — one search shows every provider.`,
  (s) => `Fast fiber internet available near you in ${s}. Check availability at your address and find local fiber plans — one search, every provider.`,
  (s) => `High speed internet deals near you in ${s}. Check availability at your address and find fast local plans — one search shows every provider.`,
  (s) => `5G home internet available near you in ${s}. Check availability at your address and find local plans — one quick search, every provider.`,
  (s) => `Best home WiFi options near you in ${s}. Check availability at your address and find the best local WiFi plans — one search, all providers.`,
  (s) => `Cheap fast home internet near you in ${s}. Check availability at your address and find affordable local plans — one search, every provider.`,
  (s) => `Cheapest internet deals near you in ${s}. Check availability at your address and find affordable plans from local providers — one search.`,
  (s) => `Get fast internet today in ${s}. Check availability at your address now — one search shows every local internet provider and plan near you.`,
];

export function buildStateMeta(pagePath: string, state: string) {
  const i = hashPath(pagePath) % 8;
  return {
    title: withYear(stateTitles[i](state)),
    description: stateDescs[i](state),
  };
}

// ─── B) CITY PAGES ──────────────────────────────────────────────

const cityTitles: ((c: string, st: string) => string)[] = [
  (c, st) => `Internet Providers in ${c}, ${st}`,
  (c, st) => `Fiber Internet Providers in ${c}, ${st}`,
  (c, st) => `High Speed Internet in ${c}, ${st}`,
  (c, st) => `5G Home Internet in ${c}, ${st}`,
  (c, st) => `Home WiFi Providers in ${c}, ${st}`,
  (c, st) => `Home Internet in ${c}, ${st}`,
  (c, st) => `Cheap Internet in ${c}, ${st}`,
  (c, st) => `Get Fast Internet in ${c}, ${st}`,
];

const cityDescs: ((c: string, sf: string) => string)[] = [
  (c, sf) => `Best local internet options near you in ${c}, ${sf}. Check availability at your address and find the right plan — one search shows every provider.`,
  (c, sf) => `Fast fiber internet available near you in ${c}, ${sf}. Check availability at your address — one search shows every local fiber provider.`,
  (c, sf) => `High speed internet deals near you in ${c}, ${sf}. Check availability at your address and find fast local plans — one search, all providers.`,
  (c, sf) => `5G home internet available near you in ${c}, ${sf}. Check availability at your address — one quick search shows every local provider.`,
  (c, sf) => `Best home WiFi options near you in ${c}, ${sf}. Check availability at your address and find the best local WiFi plans — one search.`,
  (c, sf) => `Cheap fast home internet near you in ${c}, ${sf}. Check availability at your address and find affordable local plans — one search.`,
  (c, sf) => `Cheapest internet deals near you in ${c}, ${sf}. Check availability at your address and find affordable plans from local providers.`,
  (c, sf) => `Get fast internet today in ${c}, ${sf}. Check availability at your address now — one search shows every local provider near you.`,
];

export function buildCityMeta(
  pagePath: string,
  city: string,
  stateAbbr: string,
  stateFull: string,
) {
  const i = hashPath(pagePath) % 8;
  return {
    title: withYear(cityTitles[i](city, stateAbbr)),
    description: cityDescs[i](city, stateFull),
  };
}

// ─── C) ZIP PAGES ───────────────────────────────────────────────

const zipTitles: ((z: string, c: string, st: string) => string)[] = [
  (z, c, st) => `Internet Providers in ${z} — ${c}, ${st}`,
  (z, c, st) => `Fiber Internet in ${z} — ${c}, ${st}`,
  (z, c, st) => `High Speed Internet in ${z} — ${c}, ${st}`,
  (z, c, st) => `5G Home Internet in ${z} — ${c}, ${st}`,
  (z, c, st) => `Home WiFi in ${z} — ${c}, ${st}`,
  (z, c, st) => `Home Internet in ${z} — ${c}, ${st}`,
  (z, c, st) => `Cheap Internet in ${z} — ${c}, ${st}`,
  (z, c, st) => `Get Fast Internet in ${z} — ${c}, ${st}`,
];

const zipDescs: ((z: string, c: string, sf: string) => string)[] = [
  (z, c, sf) => `Best local internet options in ${z}, ${c}, ${sf}. Check availability at your address — one search shows every provider near you.`,
  (z, c, sf) => `Fast fiber internet available in ${z}, ${c}, ${sf}. Check availability at your address — one search shows every local provider.`,
  (z, c, sf) => `High speed internet deals in ${z}, ${c}, ${sf}. Check availability at your address and find fast plans — one search, all providers.`,
  (z, c, sf) => `5G home internet available in ${z}, ${c}, ${sf}. Check availability at your address — one quick search shows every local provider.`,
  (z, c, sf) => `Best home WiFi options in ${z}, ${c}, ${sf}. Check availability at your address and find the best local plans — one search.`,
  (z, c, sf) => `Cheap fast home internet in ${z}, ${c}, ${sf}. Check availability at your address and find affordable local plans — one search.`,
  (z, c, sf) => `Cheapest internet deals in ${z}, ${c}, ${sf}. Check availability at your address and find affordable plans from local providers.`,
  (z, c, sf) => `Get fast internet today in ${z}, ${c}, ${sf}. Check availability at your address now — one search shows every local provider.`,
];

export function buildZipMeta(
  pagePath: string,
  zip: string,
  city: string,
  stateAbbr: string,
  stateFull: string,
) {
  const i = hashPath(pagePath) % 8;
  return {
    title: withYear(zipTitles[i](zip, city, stateAbbr)),
    description: zipDescs[i](zip, city, stateFull),
  };
}

// ─── D) NEIGHBORHOOD PAGES ─────────────────────────────────────

const nhTitles: ((n: string, st: string) => string)[] = [
  (n, st) => `Internet Providers in ${n}, ${st}`,
  (n, st) => `Fiber Internet in ${n}, ${st}`,
  (n, st) => `High Speed Internet in ${n}, ${st}`,
  (n, st) => `5G Home Internet in ${n}, ${st}`,
  (n, st) => `Home WiFi Providers in ${n}, ${st}`,
  (n, st) => `Home Internet in ${n}, ${st}`,
  (n, st) => `Cheap Internet in ${n}, ${st}`,
  (n, st) => `Get Fast Internet in ${n}, ${st}`,
];

const nhDescs: ((n: string, c: string) => string)[] = [
  (n, c) => `Best local internet options near you in ${n}, ${c}. Check availability at your address — one search shows every provider.`,
  (n, c) => `Fast fiber internet available near you in ${n}, ${c}. Check availability at your address — one search shows local providers.`,
  (n, c) => `High speed internet deals near you in ${n}, ${c}. Check availability at your address — one search shows every provider.`,
  (n, c) => `5G home internet available near you in ${n}, ${c}. Check availability at your address — one search shows local providers.`,
  (n, c) => `Best home WiFi options near you in ${n}, ${c}. Check availability at your address — one search shows every local plan.`,
  (n, c) => `Cheap fast home internet near you in ${n}, ${c}. Check availability at your address — one search shows every local provider.`,
  (n, c) => `Cheapest internet deals near you in ${n}, ${c}. Check availability at your address — one search shows affordable local plans.`,
  (n, c) => `Get fast internet today in ${n}, ${c}. Check availability at your address now — one search shows every local provider.`,
];

/** Build neighborhood title with long-name fallback per plan rules. */
function buildNhTitle(i: number, neighborhood: string, stateAbbr: string): string {
  // 1. Try full name with year
  const full = nhTitles[i](neighborhood, stateAbbr);
  const withYr = withYear(full);
  if (withYr.length <= 60) return withYr;

  // 2. Full name without year
  if (full.length <= 60) return full;

  // 3. Truncate neighborhood to 28 chars + "..." (word boundary)
  const truncated = truncateAtWordBoundary(neighborhood, 28) + '...';
  return withYear(nhTitles[i](truncated, stateAbbr));
}

export function buildNeighborhoodMeta(
  pagePath: string,
  neighborhood: string,
  stateAbbr: string,
  parentCity: string,
) {
  const i = hashPath(pagePath) % 8;
  return {
    title: buildNhTitle(i, neighborhood, stateAbbr),
    description: nhDescs[i](neighborhood, parentCity),
  };
}

// ─── E) CHEAP INTERNET STATE PAGES ─────────────────────────────

const cheapTitles: ((s: string) => string)[] = [
  (s) => `Cheap Internet in ${s}`,
  (s) => `Affordable Internet in ${s}`,
  (s) => `Low Cost Internet in ${s}`,
  (s) => `Cheap Home Internet in ${s}`,
  (s) => `Internet Deals in ${s}`,
  (s) => `Budget Internet Providers in ${s}`,
];

const cheapDescs: ((s: string) => string)[] = [
  (s) => `Cheapest internet plans near you in ${s}. Check availability at your address and find the best cheap internet deals from local providers.`,
  (s) => `Low cost internet options near you in ${s}. Check availability at your address and find affordable local plans — one quick search.`,
  (s) => `Best internet deals near you in ${s}. Find cheap fast internet plans available at your address from local providers — one search.`,
];

export function buildCheapStateMeta(pagePath: string, state: string) {
  const i = hashPath(pagePath) % 6;
  const descIdx = i < 2 ? 0 : i < 4 ? 1 : 2; // 0,1→Budget  2,3→Low-Cost  4,5→Deals
  return {
    title: withYear(cheapTitles[i](state)),
    description: cheapDescs[descIdx](state),
  };
}
