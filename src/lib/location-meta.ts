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
  (s) => `${s} is served by multiple competing internet providers across every region. Compare plans, check availability at your address, and find the right option in one search.`,
  (s) => `Fiber internet is available in ${s} from providers including AT&T Fiber, Frontier, and Google Fiber. Check availability at your address and find the fastest local plan.`,
  (s) => `High-speed internet in ${s} reaches speeds up to 5 Gbps in fiber-served areas. Check availability at your address and compare fast local plans in one search.`,
  (s) => `5G home internet is available in ${s} from T-Mobile and Verizon with no annual contract. Check availability at your address and compare wireless broadband options.`,
  (s) => `Home WiFi providers in ${s} offer plans starting under $30/mo for qualifying households. Check availability at your address and find the best local WiFi option.`,
  (s) => `Home internet in ${s} is offered by cable, fiber, DSL, and wireless providers competing for your address. Compare all plans in one search to find the best deal.`,
  (s) => `Cheap internet in ${s} starts at $25/mo from providers like T-Mobile and Spectrum. Check availability at your address and find the lowest price near you.`,
  (s) => `Internet service in ${s} is available at your address from national and regional providers. One search shows every plan, speed, and price near you — completely free.`,
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
  (c, sf) => `${c}, ${sf} is served by multiple internet providers including cable, fiber, and wireless options. Check availability at your address and find the right plan in one search.`,
  (c, sf) => `Fiber internet is available in parts of ${c}, ${sf} from local and national providers. Check availability at your address — one search shows every local fiber plan.`,
  (c, sf) => `High-speed internet in ${c}, ${sf} reaches up to 5 Gbps in fiber-served neighborhoods. Check availability at your address and compare fast local plans in one search.`,
  (c, sf) => `5G home internet is available in ${c}, ${sf} from T-Mobile and Verizon with no installation required. Check availability at your address for a same-week connection.`,
  (c, sf) => `Home WiFi in ${c}, ${sf} is offered by cable, fiber, and wireless providers competing for your address. Find the best local plan in one search — completely free.`,
  (c, sf) => `Internet service in ${c}, ${sf} is provided by both regional and nationwide ISPs. Check availability at your address and compare every plan and price near you.`,
  (c, sf) => `Cheap internet in ${c}, ${sf} starts at $25/mo from providers like T-Mobile and Spectrum. Check availability at your address and find the lowest price in your area.`,
  (c, sf) => `Internet providers in ${c}, ${sf} offer plans from budget to gigabit speeds. Check availability at your address now — one search shows every local provider near you.`,
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
  (z, c, sf) => `ZIP code ${z} in ${c}, ${sf} is served by multiple internet providers with plans starting under $50/mo. Check availability at your exact address in one free search.`,
  (z, c, sf) => `Fiber internet is available in ZIP code ${z}, ${c}, ${sf} from local and national providers. Check your exact address — one search shows every fiber plan near you.`,
  (z, c, sf) => `High-speed internet in ZIP code ${z}, ${c}, ${sf} reaches up to 5 Gbps in fiber-served streets. Compare fast local plans by entering your address — one search.`,
  (z, c, sf) => `5G home internet is available in ${z}, ${c}, ${sf} from T-Mobile and Verizon without a technician visit. Check availability at your address for available plans.`,
  (z, c, sf) => `Home WiFi in ZIP code ${z}, ${c}, ${sf} is offered by cable, fiber, and wireless providers. Check your exact address and find the best local plan — completely free.`,
  (z, c, sf) => `Internet service in ${z}, ${c}, ${sf} is provided by both regional and nationwide ISPs. Check availability at your address and compare every plan and price near you.`,
  (z, c, sf) => `Cheap internet in ZIP code ${z}, ${c}, ${sf} starts at $25/mo from providers offering no-contract plans. Check your address and find the lowest price available now.`,
  (z, c, sf) => `Internet providers in ${z}, ${c}, ${sf} offer plans from basic to gigabit speeds. Check availability at your exact address now — one search shows every local option.`,
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
  (n, c) => `${n} in ${c} is served by multiple internet providers offering cable, fiber, and wireless plans. Check availability at your address to see every local option in one search.`,
  (n, c) => `Fiber internet is available in parts of ${n}, ${c} from local and national providers. Check availability at your exact address — one search shows every local plan.`,
  (n, c) => `High-speed internet in ${n}, ${c} includes cable and fiber options with speeds up to 5 Gbps. Check availability at your address and compare fast local plans.`,
  (n, c) => `5G home internet is available in ${n}, ${c} from T-Mobile and Verizon with no annual contract. Check availability at your address for the latest wireless plans.`,
  (n, c) => `Home WiFi in ${n}, ${c} is offered by cable, fiber, and wireless providers. Check availability at your address and find the best local plan — completely free.`,
  (n, c) => `Internet service in ${n}, ${c} is provided by regional and nationwide ISPs with plans starting under $50/mo. Check your address and compare every available plan.`,
  (n, c) => `Cheap internet in ${n}, ${c} starts at $25/mo from providers offering no-contract monthly plans. Check availability at your address to find the best local price.`,
  (n, c) => `Internet providers in ${n}, ${c} offer plans from basic broadband to multi-gigabit fiber. Check availability at your exact address now — one search, all local options.`,
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
