// src/lib/location-meta.ts
// Deterministic meta title/description generation for ~70K location pages.
//
// SYSTEM: Independent hashing for titles and descriptions.
//   titleIdx   = hashPath(pagePath) % T           (T variants)
//   descIdx    = hashPath(pagePath + '\x01') % D  (D variants)
//   Combos     = T × D  (e.g. 12 × 24 = 288 per page type)
//
// COPY VOICE: conversion-first, not information-first.
//   Formula: [keyword + location] + [deal/price hook] + [sign-up action]
//   Required: at least one of deals/promo/price/save
//   Required: explicit signup/installation action (not vague "get connected fast")
//   Banned: "served by multiple providers", "cable, fiber, and wireless options",
//           "one search", "completely free", soft vague closers

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
  if (candidate.length <= 60) return candidate;
  if (base.length <= 60) return base;
  return truncateAtWordBoundary(base, 60);
}

function truncateAtWordBoundary(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const clipped = text.slice(0, maxChars + 1);
  const lastSpace = clipped.lastIndexOf(' ');
  if (lastSpace > 0) return clipped.slice(0, lastSpace).trimEnd();
  return text.slice(0, maxChars).trimEnd();
}

// ─── A) STATE PAGES (12 titles × 24 descs = 288 combos) ─────────────────────

const stateTitles: ((s: string) => string)[] = [
  (s) => `Internet Providers in ${s} — Plans From $25/mo*`,
  (s) => `Cheap Internet in ${s} — No Contract, No Deposit`,
  (s) => `Cheapest Internet in ${s} — From $29.99/mo. Sign Up Online.`,
  (s) => `Internet Deals in ${s} — Special Offers Available Now`,
  (s) => `High Speed Internet in ${s} — Promo Pricing, Order Online`,
  (s) => `Fiber Internet in ${s} — From $30/mo. Get Connected Fast.`,
  (s) => `Internet Plans in ${s} — Compare & Order Online Today`,
  (s) => `Best Internet Providers in ${s} — From $25/mo. Order Online Today.`,
  (s) => `Broadband Internet in ${s} — Cheap Plans & Fast Install`,
  (s) => `WiFi Providers in ${s} — From $35/mo, Special Offers`,
  (s) => `Fiber & 5G Internet in ${s} — Cheap Plans Available Now`,
  (s) => `Affordable Internet in ${s} — From $29.99/mo, No Hidden Fees`,
];

const stateDescs: ((s: string) => string)[] = [
  (s) => `${s} internet from $25/mo* — no annual contract on select plans. Promo pricing available statewide. Sign up online and get installed this week.`,
  (s) => `Internet deals in ${s} from $29.99/mo* — no deposit required on select plans. High speed options available across the state. Order online today.`,
  (s) => `Limited-time internet promos in ${s} start at $30/mo*. No setup fee on select plans. Pick your speed and schedule installation online.`,
  (s) => `High speed internet in ${s} from $35/mo*. Fiber, cable, and 5G plans available statewide. Sign up today — same-week installation at qualifying addresses.`,
  (s) => `Cheapest internet plans in ${s} from $25/mo*. No long-term lock-in on select plans. Check availability at your address and get started today.`,
  (s) => `${s} internet plans from $29.99/mo* — speeds up to 5 Gig available. Current promos are live. Order online and get installation on the calendar.`,
  (s) => `Get internet in ${s} from $30/mo* — no deposit and no annual contract on select plans. Sign up online and get installed this week at qualifying addresses.`,
  (s) => `Internet service in ${s} from $25/mo* — speeds up to 5 Gig available. No hidden fees on select plans. Sign up online in minutes and get connected.`,
  (s) => `Fiber, cable, and 5G internet in ${s} starting at $35/mo*. Limited-time promos available — sign up online and schedule your installation today.`,
  (s) => `Sign up for internet in ${s} — promo plans from $29.99/mo* available now. No annual contract on select plans. Get installed this week.`,
  (s) => `Internet plans in ${s} from $25/mo* — speeds up to 5 Gig with same-week installation at qualifying addresses. Start your order online today.`,
  (s) => `${s} internet deals from $30/mo* — no hidden fees, no runaround. Limited-time promo pricing available now. Order online and get connected fast.`,
  (s) => `Cheap internet in ${s} from $29.99/mo*. Compare plans, choose your install date, and get service started with no deposit required.`,
  (s) => `5 Gig internet plans in ${s} from $35/mo*. Promo pricing available for new customers. Sign up online today and get same-week installation.`,
  (s) => `Internet in ${s} from $25/mo* — sign up online in minutes, no sales calls required. Same-week installation available at qualifying addresses.`,
  (s) => `New customer internet deals in ${s} from $30/mo*. No annual contract, no deposit on select plans. Sign up online and start service today.`,
  (s) => `Internet promo plans in ${s} from $29.99/mo* — no long-term contract required. Current deals are live now. Sign up and get installed this week.`,
  (s) => `Lowest internet prices in ${s} from $25/mo*. No setup fee on select plans. Order online now and get installation scheduled this week.`,
  (s) => `${s} internet service from $35/mo*. Fiber and cable options available now — no deposit on select plans. Order online and get connected today.`,
  (s) => `Internet plans in ${s} from $29.99/mo* — high speed, no annual contract, no hidden fees. Sign up online now and schedule installation fast.`,
  (s) => `Limited-time internet specials in ${s} from $30/mo*. Speeds up to 5 Gig available at your address. Sign up today and get service started fast.`,
  (s) => `${s} internet from $25/mo* — no long waits, no hassle, no annual contract. Sign up online today and get installation on the calendar.`,
  (s) => `Cable, fiber, and 5G internet in ${s} from $35/mo*. New customer promo pricing available now — sign up online and get installed this week.`,
  (s) => `Check internet availability in ${s} — plans from $29.99/mo* with same-week installation. No deposit on select plans. Start your order now.`,
];

/** H1 prefixes (keyword phrase before the location) — index-aligned with *Titles arrays. */
const h1Prefixes: string[] = [
  'Internet Providers in',
  'Cheap Internet in',
  'Cheapest Internet in',
  'Internet Deals in',
  'High Speed Internet in',
  'Fiber Internet in',
  'Internet Plans in',
  'Best Internet Providers in',
  'Broadband Internet in',
  'WiFi Providers in',
  'Fiber & 5G Internet in',
  'Affordable Internet in',
];

/**
 * Price tier for each title slot — null when the title carries no explicit price.
 * Index must stay aligned with *Titles arrays (slots 0-11).
 */
const titlePrices: (string | null)[] = [
  '$25/mo*',    // 0  Plans From $25/mo*
  null,         // 1  Deals & Low Monthly Rates
  '$29.99/mo*', // 2  From $29.99/mo. Sign Up Online.
  null,         // 3  Special Offers Available Now
  null,         // 4  Promo Pricing, Order Online
  '$30/mo*',    // 5  From $30/mo. Get Connected Fast.
  null,         // 6  Low Rates & Online Signup
  '$25/mo*',    // 7  From $25/mo. Order Online Today.
  null,         // 8  Cheap Plans & Fast Install
  '$35/mo*',    // 9  From $35/mo, Special Offers
  null,         // 10 Low Monthly Rates Available
  '$29.99/mo*', // 11 From $29.99/mo, No Hidden Fees
];

/** Price tier for cheapTitles slots (0-7). */
const cheapTitlePrices: (string | null)[] = [
  '$25/mo*',    // 0  Plans From $25/mo*
  null,         // 1  Deals & Low Monthly Rates
  '$29.99/mo*', // 2  From $29.99/mo. Sign Up Online.
  null,         // 3  Special Offers Available Now
  null,         // 4  Promo Pricing, Order Online
  '$25/mo*',    // 5  From $25/mo. Order Online Today.
  null,         // 6  Low Rates & Online Signup
  '$29.99/mo*', // 7  From $29.99/mo, No Hidden Fees
];

/**
 * When the title asserts a specific price, replace any $/mo* figure in the
 * description with the same price so title and SERP snippet always agree.
 */
function harmonizePrice(desc: string, price: string | null): string {
  if (!price) return desc;
  return desc.replace(/\$\d+(?:\.\d+)?\/mo\*/g, price);
}

export function buildStateMeta(pagePath: string, state: string) {
  const ti = hashPath(pagePath) % stateTitles.length;
  const di = hashPath(pagePath + '\x01') % stateDescs.length;
  return {
    title: withYear(stateTitles[ti](state)),
    description: harmonizePrice(stateDescs[di](state), titlePrices[ti]),
    h1Prefix: h1Prefixes[ti],
  };
}

// ─── B) CITY PAGES (12 titles × 24 descs = 288 combos) ──────────────────────

const cityTitles: ((c: string, st: string) => string)[] = [
  (c, st) => `Internet Providers in ${c}, ${st} — Plans From $25/mo*`,
  (c, st) => `Cheap Internet in ${c}, ${st} — No Contract, No Deposit`,
  (c, st) => `Cheapest Internet in ${c}, ${st} — From $29.99/mo. Sign Up Online.`,
  (c, st) => `Internet Deals in ${c}, ${st} — Special Offers Available Now`,
  (c, st) => `High Speed Internet in ${c}, ${st} — Promo Pricing, Order Online`,
  (c, st) => `Fiber Internet in ${c}, ${st} — From $30/mo. Get Connected Fast.`,
  (c, st) => `Internet Plans in ${c}, ${st} — Compare & Order Online Today`,
  (c, st) => `Best Internet Providers in ${c}, ${st} — From $25/mo. Order Online Today.`,
  (c, st) => `Broadband Internet in ${c}, ${st} — Cheap Plans & Fast Install`,
  (c, st) => `WiFi Providers in ${c}, ${st} — From $35/mo, Special Offers`,
  (c, st) => `Fiber & 5G Internet in ${c}, ${st} — Cheap Plans Available Now`,
  (c, st) => `Affordable Internet in ${c}, ${st} — From $29.99/mo, No Hidden Fees`,
];

const cityDescs: ((c: string, sf: string) => string)[] = [
  (c, sf) => `${c}, ${sf} internet from $25/mo* — no annual contract on select plans. Sign up online and get installed this week at qualifying addresses.`,
  (c, sf) => `Internet deals in ${c} from $29.99/mo* — no deposit required on select plans. High speed options available. Order online and get connected fast.`,
  (c, sf) => `Limited-time internet promos in ${c} start at $30/mo*. No setup fee on select plans. Choose your speed and schedule installation online today.`,
  (c, sf) => `High speed internet in ${c}, ${sf} from $35/mo*. Fiber, cable, and 5G plans available. Sign up today — same-week installation at most addresses.`,
  (c, sf) => `Cheapest internet plans in ${c} from $25/mo*. No long-term lock-in on select plans. Check availability at your address and get started today.`,
  (c, sf) => `${c}, ${sf} internet plans from $29.99/mo* — speeds up to 5 Gig available. Current promos are live. Order online and get installation on the calendar.`,
  (c, sf) => `Get internet in ${c} from $30/mo* — no deposit and no annual contract on select plans. Sign up online and get installed this week at qualifying addresses.`,
  (c, sf) => `Internet service in ${c}, ${sf} from $25/mo* — speeds up to 5 Gig available. No hidden fees on select plans. Sign up online in minutes and get connected.`,
  (c, sf) => `Fiber, cable, and 5G internet in ${c} starting at $35/mo*. Limited-time promos available — sign up online and schedule your installation today.`,
  (c, sf) => `Sign up for internet in ${c}, ${sf} — promo plans from $29.99/mo* available now. No annual contract on select plans. Get installed this week.`,
  (c, sf) => `Internet plans in ${c} from $25/mo* — speeds up to 5 Gig with same-week installation at qualifying addresses. Start your order online today.`,
  (c, sf) => `${c} internet deals from $30/mo* — no hidden fees, no runaround. Limited-time promo pricing available now. Order online and get connected fast.`,
  (c, sf) => `Cheap internet in ${c}, ${sf} from $29.99/mo*. Pick your plan, choose your install date, and get service started with no deposit required.`,
  (c, sf) => `5 Gig internet plans in ${c} from $35/mo*. Promo pricing available for new customers. Sign up online today and get same-week installation.`,
  (c, sf) => `Internet in ${c} from $25/mo* — sign up online in minutes, no sales calls required. Same-week installation available at qualifying addresses.`,
  (c, sf) => `New customer internet deals in ${c}, ${sf} from $30/mo*. No annual contract, no deposit on select plans. Sign up online and start service today.`,
  (c, sf) => `Internet promo plans in ${c} from $29.99/mo* — no long-term contract required. Current deals are live now. Sign up and get installed this week.`,
  (c, sf) => `Lowest internet prices in ${c}, ${sf} from $25/mo*. No setup fee on select plans. Order online now and get installation scheduled this week.`,
  (c, sf) => `${c}, ${sf} internet service from $35/mo*. Fiber and cable options available now — no deposit on select plans. Order online and get connected today.`,
  (c, sf) => `Internet plans in ${c} from $29.99/mo* — high speed, no annual contract, no hidden fees. Sign up online now and schedule installation fast.`,
  (c, sf) => `Limited-time internet specials in ${c} from $30/mo*. Speeds up to 5 Gig available at your address. Sign up today and get service started fast.`,
  (c, sf) => `${c} internet from $25/mo* — no long waits, no hassle, no annual contract. Sign up online today and get installation on the calendar this week.`,
  (c, sf) => `Cable, fiber, and 5G internet in ${c}, ${sf} from $35/mo*. New customer promo pricing available now — sign up online and get installed this week.`,
  (c, sf) => `Check internet availability in ${c}, ${sf} — plans from $29.99/mo* with same-week installation. No deposit on select plans. Start your order now.`,
];

export function buildCityMeta(
  pagePath: string,
  city: string,
  stateAbbr: string,
  stateFull: string,
) {
  const ti = hashPath(pagePath) % cityTitles.length;
  const di = hashPath(pagePath + '\x01') % cityDescs.length;
  return {
    title: withYear(cityTitles[ti](city, stateAbbr)),
    description: harmonizePrice(cityDescs[di](city, stateFull), titlePrices[ti]),
    h1Prefix: h1Prefixes[ti],
  };
}

// ─── C) ZIP PAGES (12 titles × 24 descs = 288 combos) ───────────────────────

const zipTitles: ((z: string, c: string, st: string) => string)[] = [
  (z, c, st) => `Internet Providers in ${z}, ${c} ${st} — Plans From $25/mo*`,
  (z, c, st) => `Cheap Internet in ${z}, ${c} ${st} — No Contract, No Deposit`,
  (z, c, st) => `Cheapest Internet in ZIP ${z}, ${c} — From $29.99/mo. Sign Up Online.`,
  (z, c, st) => `Internet Deals in ZIP ${z}, ${c} — Special Offers Available Now`,
  (z, c, st) => `High Speed Internet ZIP ${z}, ${c} ${st} — Promo Pricing, Order Online`,
  (z, c, st) => `Fiber Internet in ZIP ${z}, ${c} — From $30/mo. Get Connected Fast.`,
  (z, c, st) => `Internet Plans in ZIP ${z}, ${c} — Compare & Order Online Today`,
  (z, c, st) => `Best Internet in ZIP ${z}, ${c} ${st} — From $25/mo. Order Online Today.`,
  (z, c, st) => `Broadband Internet in ZIP ${z}, ${c} — Cheap Plans & Fast Install`,
  (z, c, st) => `WiFi Providers in ZIP ${z}, ${c} — From $35/mo, Special Offers`,
  (z, c, st) => `Fiber & 5G Internet in ZIP ${z}, ${c} ${st} — Cheap Plans Available Now`,
  (z, c, st) => `Affordable Internet in ZIP ${z}, ${c} — From $29.99/mo, No Hidden Fees`,
];

const zipDescs: ((z: string, c: string, sf: string) => string)[] = [
  (z, c, sf) => `Internet from $25/mo* in ZIP ${z}, ${c} — no annual contract on select plans. Sign up online and get installed this week at qualifying addresses.`,
  (z, c, sf) => `Internet deals in ZIP ${z} from $29.99/mo* — no deposit required on select plans. High speed options available. Order online and get connected fast.`,
  (z, c, sf) => `Limited-time internet promos in ${c} (${z}) start at $30/mo*. No setup fee on select plans. Choose your speed and schedule installation online today.`,
  (z, c, sf) => `High speed internet in ZIP ${z}, ${c} from $35/mo*. Fiber, cable, and 5G plans available. Sign up today — same-week installation at most addresses.`,
  (z, c, sf) => `Cheapest internet plans in ZIP ${z} from $25/mo*. No long-term lock-in on select plans. Check availability at your address and get started today.`,
  (z, c, sf) => `ZIP ${z} internet plans from $29.99/mo* — speeds up to 5 Gig available. Current promos are live. Order online and get installation on the calendar.`,
  (z, c, sf) => `Get internet in ZIP ${z}, ${c} from $30/mo* — no deposit and no annual contract. Sign up online and get installed this week at qualifying addresses.`,
  (z, c, sf) => `Internet service in ZIP ${z}, ${sf} from $25/mo* — speeds up to 5 Gig available. No hidden fees on select plans. Sign up online and get connected.`,
  (z, c, sf) => `Fiber, cable, and 5G internet in ZIP ${z} starting at $35/mo*. Limited-time promos available — sign up online and schedule your installation today.`,
  (z, c, sf) => `Sign up for internet in ZIP ${z}, ${c} — promo plans from $29.99/mo* available now. No annual contract on select plans. Get installed this week.`,
  (z, c, sf) => `Internet plans for ZIP ${z}, ${c} from $25/mo* — speeds up to 5 Gig with same-week installation at qualifying addresses. Start your order today.`,
  (z, c, sf) => `ZIP ${z} internet deals from $30/mo* — no hidden fees, no runaround. Limited-time promo pricing available now. Order online and get connected fast.`,
  (z, c, sf) => `Cheap internet in ZIP ${z}, ${sf} from $29.99/mo*. Pick your plan, choose your install date, and get service started — no deposit required.`,
  (z, c, sf) => `5 Gig internet in ZIP ${z}, ${c} from $35/mo*. Promo pricing for new customers — sign up online today and get same-week installation.`,
  (z, c, sf) => `Internet in ZIP ${z} from $25/mo* — sign up online in minutes, no sales calls required. Same-week installation available at qualifying addresses.`,
  (z, c, sf) => `New customer internet deals in ZIP ${z}, ${c} from $30/mo*. No annual contract, no deposit on select plans. Start service online today.`,
  (z, c, sf) => `Internet promo plans in ZIP ${z} from $29.99/mo* — no long-term contract required. Current deals are live. Sign up and get installed this week.`,
  (z, c, sf) => `Lowest internet prices in ZIP ${z}, ${c} from $25/mo*. No setup fee on select plans. Order online now and get installation scheduled this week.`,
  (z, c, sf) => `ZIP ${z}, ${sf} internet from $35/mo*. Fiber and cable options available now — no deposit on select plans. Order online and get connected today.`,
  (z, c, sf) => `Internet plans in ZIP ${z} from $29.99/mo* — high speed, no annual contract, no hidden fees. Sign up online now and schedule installation fast.`,
  (z, c, sf) => `Limited-time internet specials in ZIP ${z}, ${c} from $30/mo*. Speeds up to 5 Gig at your address. Sign up today and get service started fast.`,
  (z, c, sf) => `ZIP ${z}, ${c} internet from $25/mo* — no long waits, no hassle, no annual contract. Sign up online and get installation on the calendar.`,
  (z, c, sf) => `Cable, fiber, and 5G internet in ZIP ${z}, ${c} from $35/mo*. New customer promos available now — sign up online and get installed this week.`,
  (z, c, sf) => `Check internet availability for ZIP ${z}, ${c} — plans from $29.99/mo* with same-week installation. No deposit on select plans. Order now.`,
];

export function buildZipMeta(
  pagePath: string,
  zip: string,
  city: string,
  stateAbbr: string,
  stateFull: string,
) {
  const ti = hashPath(pagePath) % zipTitles.length;
  const di = hashPath(pagePath + '\x01') % zipDescs.length;
  return {
    title: withYear(zipTitles[ti](zip, city, stateAbbr)),
    description: harmonizePrice(zipDescs[di](zip, city, stateFull), titlePrices[ti]),
    h1Prefix: h1Prefixes[ti],
  };
}

// ─── D) NEIGHBORHOOD PAGES (12 titles × 24 descs = 288 combos) ──────────────

const nhTitles: ((n: string, st: string) => string)[] = [
  (n, st) => `Internet Providers in ${n}, ${st} — Plans From $25/mo*`,
  (n, st) => `Cheap Internet in ${n}, ${st} — No Contract, No Deposit`,
  (n, st) => `Cheapest Internet in ${n}, ${st} — From $29.99/mo. Sign Up Online.`,
  (n, st) => `Internet Deals in ${n}, ${st} — Special Offers Available Now`,
  (n, st) => `High Speed Internet in ${n}, ${st} — Promo Pricing, Order Online`,
  (n, st) => `Fiber Internet in ${n}, ${st} — From $30/mo. Get Connected Fast.`,
  (n, st) => `Internet Plans in ${n}, ${st} — Compare & Order Online Today`,
  (n, st) => `Best Internet in ${n}, ${st} — From $25/mo. Order Online Today.`,
  (n, st) => `Broadband Internet in ${n}, ${st} — Cheap Plans & Fast Install`,
  (n, st) => `WiFi Providers in ${n}, ${st} — From $35/mo, Special Offers`,
  (n, st) => `Fiber & 5G Internet in ${n}, ${st} — Cheap Plans Available Now`,
  (n, st) => `Affordable Internet in ${n}, ${st} — From $29.99/mo, No Hidden Fees`,
];

const nhDescs: ((n: string, c: string) => string)[] = [
  (n, c) => `${n}, ${c} internet from $25/mo* — no annual contract on select plans. Sign up online and get installed this week at qualifying addresses.`,
  (n, c) => `Internet deals in ${n} from $29.99/mo* — no deposit required on select plans. High speed options available in ${c}. Order online and get connected.`,
  (n, c) => `Limited-time internet promos in ${n}, ${c} start at $30/mo*. No setup fee on select plans. Pick your speed and schedule installation online today.`,
  (n, c) => `High speed internet in ${n}, ${c} from $35/mo*. Fiber, cable, and 5G plans available. Sign up today — same-week installation at most addresses.`,
  (n, c) => `Cheapest internet plans in ${n} from $25/mo*. No long-term lock-in on select plans. Check availability at your address and get started today.`,
  (n, c) => `${n} internet plans from $29.99/mo* — speeds up to 5 Gig available. Current promos are live. Order online and get installation on the calendar.`,
  (n, c) => `Get internet in ${n}, ${c} from $30/mo* — no deposit and no annual contract. Sign up online and get installed this week at qualifying addresses.`,
  (n, c) => `Internet service in ${n}, ${c} from $25/mo* — speeds up to 5 Gig available. No hidden fees on select plans. Sign up online in minutes.`,
  (n, c) => `Fiber, cable, and 5G internet in ${n} starting at $35/mo*. Limited-time promos in ${c} — sign up online and schedule your installation today.`,
  (n, c) => `Sign up for internet in ${n}, ${c} — promo plans from $29.99/mo* available now. No annual contract on select plans. Get installed this week.`,
  (n, c) => `Internet plans in ${n} from $25/mo* — speeds up to 5 Gig with same-week installation at qualifying addresses. Start your order online today.`,
  (n, c) => `${n} internet deals from $30/mo* — no hidden fees, no runaround. Limited-time promo pricing available now. Order online and get connected fast.`,
  (n, c) => `Cheap internet in ${n}, ${c} from $29.99/mo*. Pick your plan, choose your install date, and get service started — no deposit required.`,
  (n, c) => `5 Gig internet in ${n}, ${c} from $35/mo*. Promo pricing for new customers — sign up online today and get same-week installation.`,
  (n, c) => `Internet in ${n} from $25/mo* — sign up online in minutes, no sales calls required. Same-week installation available at qualifying addresses.`,
  (n, c) => `New customer internet deals in ${n}, ${c} from $30/mo*. No annual contract, no deposit on select plans. Sign up online and start service today.`,
  (n, c) => `Internet promo plans in ${n} from $29.99/mo* — no long-term contract required. Current deals are live now. Sign up and get installed this week.`,
  (n, c) => `Lowest internet prices in ${n}, ${c} from $25/mo*. No setup fee on select plans. Order online now and get installation scheduled this week.`,
  (n, c) => `${n}, ${c} internet from $35/mo*. Fiber and cable options available now — no deposit on select plans. Order online and get connected today.`,
  (n, c) => `Internet plans in ${n} from $29.99/mo* — high speed, no annual contract, no hidden fees. Sign up online now and schedule installation fast.`,
  (n, c) => `Limited-time internet specials in ${n} from $30/mo*. Speeds up to 5 Gig available in ${c}. Sign up today and get service started fast.`,
  (n, c) => `${n} internet from $25/mo* — no long waits, no hassle, no annual contract. Sign up online today and get installation on the calendar.`,
  (n, c) => `Cable, fiber, and 5G internet in ${n}, ${c} from $35/mo*. New customer promo pricing available now — sign up online and get installed this week.`,
  (n, c) => `Check internet availability in ${n}, ${c} — plans from $29.99/mo* with same-week installation. No deposit on select plans. Start your order now.`,
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
  const ti = hashPath(pagePath) % nhTitles.length;
  const di = hashPath(pagePath + '\x01') % nhDescs.length;
  return {
    title: buildNhTitle(ti, neighborhood, stateAbbr),
    description: harmonizePrice(nhDescs[di](neighborhood, parentCity), titlePrices[ti]),
    h1Prefix: h1Prefixes[ti],
  };
}

// ─── E) CHEAP INTERNET STATE PAGES (8 titles × 16 descs = 128 combos) ───────

const cheapTitles: ((s: string) => string)[] = [
  (s) => `Cheap Internet in ${s} — Plans From $25/mo*`,
  (s) => `Cheapest Internet in ${s} — No Contract, Order Online`,
  (s) => `Cheap Internet Plans in ${s} — From $29.99/mo. Sign Up Online.`,
  (s) => `Affordable Internet in ${s} — Special Offers Available Now`,
  (s) => `Low Income Internet in ${s} — Promo Pricing, Order Online`,
  (s) => `No Contract Internet in ${s} — From $25/mo. Order Online Today.`,
  (s) => `Cheap High Speed Internet in ${s} — Order Online, No Contract`,
  (s) => `Budget Internet Plans in ${s} — From $29.99/mo, No Hidden Fees`,
];

const cheapDescs: ((s: string) => string)[] = [
  (s) => `Cheap internet in ${s} from $25/mo* — no annual contract on select plans. Current promos available now. Sign up online and get installed this week.`,
  (s) => `${s} low-income internet from $25/mo* — no deposit and no annual contract. Promo pricing available. Sign up online and get connected fast.`,
  (s) => `Budget internet plans in ${s} from $25/mo*. No setup fee on select plans. Check availability at your address and get started today.`,
  (s) => `Affordable internet in ${s} from $29.99/mo* — no long-term contract required. Current deals are live. Sign up online and get installed this week.`,
  (s) => `Cheap high speed internet in ${s} from $25/mo*. No hidden fees on select plans. Sign up online in minutes and get connected this week.`,
  (s) => `${s} internet deals from $29.99/mo* — no deposit, no annual contract on select plans. Limited-time promos available. Start your order online today.`,
  (s) => `No contract internet in ${s} from $25/mo*. No deposit, no setup fee on select plans. Sign up online today and get installation on the calendar.`,
  (s) => `Cheapest internet plans in ${s} from $25/mo*. Promo pricing available now. Sign up online and get installed this week at qualifying addresses.`,
  (s) => `Internet deals in ${s} from $29.99/mo* — no long waits, no runaround, no annual contract. Order online today and get service started fast.`,
  (s) => `Get cheap internet in ${s} from $25/mo*. Limited-time specials available now — sign up online and get installation scheduled this week.`,
  (s) => `Low cost internet in ${s} from $29.99/mo* — no setup fee, no hidden fees on select plans. Sign up online now and get connected this week.`,
  (s) => `${s} internet from $25/mo* — no deposit required on select plans. Promo pricing available now. Sign up online and get installed this week.`,
  (s) => `Cheap home internet in ${s} from $29.99/mo*. No annual contract on select plans. Order online and get same-week installation at qualifying addresses.`,
  (s) => `Internet specials in ${s} from $25/mo* — no setup fee, no annual contract. Sign up online in minutes and get installation scheduled today.`,
  (s) => `Budget-friendly internet in ${s} from $29.99/mo*. No long-term lock-in on select plans. Sign up online and get installation on the calendar.`,
  (s) => `Lowest priced internet in ${s} from $25/mo* — no deposit, no annual contract on select plans. Order online today and get connected fast.`,
];

export function buildCheapStateMeta(pagePath: string, state: string) {
  const ti = hashPath(pagePath) % cheapTitles.length;
  const di = hashPath(pagePath + '\x01') % cheapDescs.length;
  const cheapH1Prefixes: string[] = [
    'Cheap Internet in',
    'Cheapest Internet in',
    'Cheap Internet Plans in',
    'Affordable Internet in',
    'Low Income Internet in',
    'No Contract Internet in',
    'Cheap High Speed Internet in',
    'Budget Internet Plans in',
  ];
  return {
    title: withYear(cheapTitles[ti](state)),
    description: harmonizePrice(cheapDescs[di](state), cheapTitlePrices[ti]),
    h1Prefix: cheapH1Prefixes[ti],
  };
}
