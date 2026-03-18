# Internet 4 ALL — Meta Title & Description Plan (Final)

Version: March 2026 | Scope: ~70K location pages

---

## THE CORE PRINCIPLE

The meta title **is** the search query. "Fiber Internet Providers in Columbus, OH (2026)" matches the search "fiber internet providers in Columbus OH" — direct hit, they click.

The description sells the click with **keyword-stacked emotional hooks**. Every word in the description is a real search term — fast, cheap, best, deals, near you, available, today. No filler. No tech listing. No promises that vary by address.

The I4A competitive differentiator — "check availability at your address" — is itself a keyword phrase (5K monthly vol, $20.46 CPC). It does double duty: tells the user what the page does AND matches what people actually search.

---

## LANGUAGE RULES

**Banned — never use in any title or description:**

| Phrase | Reason |
|---|---|
| compare plans / compare providers | Not a search term. Sounds like homework. |
| don't overpay | Clickbait. People scroll past. |
| exclusive deals | Generic. Nobody believes it. |
| plans from $X/mo | Price varies by address — cannot claim site-wide. |
| speeds to X Mbps | Speed varies by provider and address — cannot claim. |
| experts will match you | Zero keyword value. Wastes character budget. |
| Internet 4 ALL (in title) | Brand name wastes keyword space. Use noSuffix on all location pages. |
| fiber confirmed | Hard availability claim before address check. |
| fiber, 5G, and cable (tech list in desc) | Title carries the tech signal. Description carries emotion + local + action. |

**Always use — these are real search terms with real volume:**

| Keyword | Where | Monthly Vol / CPC |
|---|---|---|
| internet providers | titles | 500K |
| fiber internet / fiber optic internet | titles | 500K (+900% YoY), comp=2 |
| high speed internet | titles | 500K (+900% YoY), comp=1 |
| 5G home internet | titles | 50K |
| home WiFi | titles | 50K, $40-46 CPC premium |
| home internet | titles | 50K, $34.99 CPC |
| cheap internet | titles | 50K, comp=20 |
| get internet / get fast internet | titles | $40-82 CPC (highest intent) |
| best | descriptions | 5K vol — "best internet near me" |
| local | descriptions | 5K vol — "local internet providers near me" |
| fast | descriptions | 5K vol — "fast internet near me" |
| cheap / cheapest | descriptions | 50K vol — "cheap internet near me" |
| deals | descriptions | 5K vol — "internet deals near me" |
| available | descriptions | 5K vol — "internet available near me" |
| near you | descriptions | maps to 500K "near me" family |
| today | descriptions | $51.68 CPC — "get internet today" |
| check availability at your address | descriptions | 5K vol, $20.46 CPC — I4A hook IS the keyword |

---

## YEAR RULE

Year goes in the **title only**. Not in the description — title handles freshness, description handles emotion + keywords.

1. Build title string without year.
2. Try appending " (2026)" — measure total length.
3. If ≤ 60 characters → keep (2026).
4. If > 60 characters → drop (2026), publish without.
5. Never shorten or abbreviate the title to force year in.

```ts
function withYear(base: string): string {
  const candidate = `${base} (${new Date().getFullYear()})`;
  return candidate.length <= 60 ? candidate : base;
}
```

---

## VARIANT SYSTEM

**8 clusters assigned by `hash(pagePath) % 8`.**

Hash the full page path (not just the location name) so different page types for the same location get different clusters. Deterministic — same result on every build.

| # | Cluster | Title Keyword | Vol | Comp | Description Hook |
|---|---------|--------------|-----|------|-----------------|
| 0 | Core | internet providers | 500K | 81 | best local options near you |
| 1 | Fiber | fiber internet | 500K | 2-11 | fast fiber available near you |
| 2 | High Speed | high speed internet | 500K | 1 | high speed deals near you |
| 3 | 5G | 5G home internet | 50K | 23 | 5G home internet available near you |
| 4 | WiFi | home WiFi | 50K | 65-91 | best home WiFi options near you |
| 5 | Home | home internet | 50K | 49-96 | cheap fast home internet near you |
| 6 | Cheap | cheap internet | 50K | 20-92 | cheapest deals near you |
| 7 | Urgency | get internet | $40-82 CPC | 84-89 | get fast internet today |

**Why these 8 and not more:**
- Every cluster is backed by 50K+ volume keywords
- Adding clusters 9+ forces 500-5K volume keywords into titles — weaker signal
- 8 clusters × 5 page types = 35+ unique description templates
- Competitors use 1-2 templates per page type — we use 8

**Why not data-driven assignment:**
Provider data comes from the broadband API at search time, not at build time. We cannot know at build time which technologies serve a specific address. The hash system with keyword-stacked descriptions is the correct approach — titles match search queries, descriptions frame the page as an availability-check tool, and Google treats tool/aggregator pages (Zillow, Kayak, BroadbandNow) differently from content-farm pages.

---

## DESCRIPTION FORMULA

Every description follows this structure:

**[Emotional keyword hook matching cluster] + [Location + "near you"] + ["check availability at your address"] + [convenience close]**

Every word is a keyword. Proof:

| Word in Description | Actual Search Term | Volume | CPC |
|---|---|---|---|
| best | best internet near me | 5K | $27.64 |
| local | local internet providers near me | 5K | $26.49 |
| fast | fast internet near me | 5K | $26.69 |
| cheap / cheapest | cheap internet near me | 5K | $28.56 |
| deals | internet deals near me | 500 | $25.38 |
| available | internet available near me | 5K | $26.49 |
| near you | internet providers near me | 500K | $27.88 |
| today | get internet today | 500 | $51.68 |
| check availability at your address | check internet availability by address | 5K | $20.46 |
| one search | Convenience hook — makes I4A feel fast | — | — |

**Overflow rule:** If description > 160 chars due to long location name → use state abbreviation. If still over 160 → shorten the convenience close.

---

## A) STATE PAGES (51 pages)

Year always fits for every US state (Massachusetts at 13 chars is the longest).

### Titles

| # | Cluster | Template | Ohio Example | Chars |
|---|---------|----------|-------------|-------|
| 0 | Core | Internet Providers in {State} ({year}) | Internet Providers in Ohio (2026) | 33 |
| 1 | Fiber | Fiber Internet Providers in {State} ({year}) | Fiber Internet Providers in Ohio (2026) | 39 |
| 2 | High Speed | High Speed Internet in {State} ({year}) | High Speed Internet in Ohio (2026) | 34 |
| 3 | 5G | 5G Home Internet in {State} ({year}) | 5G Home Internet in Ohio (2026) | 31 |
| 4 | WiFi | Home WiFi Providers in {State} ({year}) | Home WiFi Providers in Ohio (2026) | 34 |
| 5 | Home | Home Internet Providers in {State} ({year}) | Home Internet Providers in Ohio (2026) | 38 |
| 6 | Cheap | Cheap Internet in {State} ({year}) | Cheap Internet in Ohio (2026) | 29 |
| 7 | Urgency | Get Fast Internet in {State} ({year}) | Get Fast Internet in Ohio (2026) | 31 |

Longest state check: "Home Internet Providers in Massachusetts (2026)" = 47 chars ✓

### Descriptions

| # | Cluster | Description |
|---|---------|-------------|
| 0 | Core | Best local internet options near you in {State}. Check availability at your address and find the right plan — one search shows every provider. |
| 1 | Fiber | Fast fiber internet available near you in {State}. Check availability at your address and find local fiber plans — one search, every provider. |
| 2 | High Speed | High speed internet deals near you in {State}. Check availability at your address and find fast local plans — one search shows every provider. |
| 3 | 5G | 5G home internet available near you in {State}. Check availability at your address and find local plans — one quick search, every provider. |
| 4 | WiFi | Best home WiFi options near you in {State}. Check availability at your address and find the best local WiFi plans — one search, all providers. |
| 5 | Home | Cheap fast home internet near you in {State}. Check availability at your address and find affordable local plans — one search, every provider. |
| 6 | Cheap | Cheapest internet deals near you in {State}. Check availability at your address and find affordable plans from local providers — one search. |
| 7 | Urgency | Get fast internet today in {State}. Check availability at your address now — one search shows every local internet provider and plan near you. |

---

## B) CITY PAGES (19,184 pages)

Titles use 2-letter state abbreviation ({ST}) to save character space for keywords.
Descriptions use full state name ({State}) for local feel.
Year auto-drops if title exceeds 60 chars.

### Titles

| # | Cluster | Template | Columbus, OH Example | Chars |
|---|---------|----------|---------------------|-------|
| 0 | Core | Internet Providers in {City}, {ST} ({year}) | Internet Providers in Columbus, OH (2026) | 42 |
| 1 | Fiber | Fiber Internet Providers in {City}, {ST} ({year}) | Fiber Internet Providers in Columbus, OH (2026) | 48 |
| 2 | High Speed | High Speed Internet in {City}, {ST} ({year}) | High Speed Internet in Columbus, OH (2026) | 43 |
| 3 | 5G | 5G Home Internet in {City}, {ST} ({year}) | 5G Home Internet in Columbus, OH (2026) | 39 |
| 4 | WiFi | Home WiFi Providers in {City}, {ST} ({year}) | Home WiFi Providers in Columbus, OH (2026) | 43 |
| 5 | Home | Home Internet in {City}, {ST} ({year}) | Home Internet in Columbus, OH (2026) | 36 |
| 6 | Cheap | Cheap Internet in {City}, {ST} ({year}) | Cheap Internet in Columbus, OH (2026) | 37 |
| 7 | Urgency | Get Fast Internet in {City}, {ST} ({year}) | Get Fast Internet in Columbus, OH (2026) | 41 |

Year overflow: "Fiber Internet Providers in Rancho Santa Margarita, CA (2026)" = 61 chars → year drops → "Fiber Internet Providers in Rancho Santa Margarita, CA" = 54 ✓
Most cities keep year. Longest common cities (Colorado Springs, CO) still fit at 55 chars.

### Descriptions

| # | Cluster | Description |
|---|---------|-------------|
| 0 | Core | Best local internet options near you in {City}, {State}. Check availability at your address and find the right plan — one search shows every provider. |
| 1 | Fiber | Fast fiber internet available near you in {City}, {State}. Check availability at your address — one search shows every local fiber provider. |
| 2 | High Speed | High speed internet deals near you in {City}, {State}. Check availability at your address and find fast local plans — one search, all providers. |
| 3 | 5G | 5G home internet available near you in {City}, {State}. Check availability at your address — one quick search shows every local provider. |
| 4 | WiFi | Best home WiFi options near you in {City}, {State}. Check availability at your address and find the best local WiFi plans — one search. |
| 5 | Home | Cheap fast home internet near you in {City}, {State}. Check availability at your address and find affordable local plans — one search. |
| 6 | Cheap | Cheapest internet deals near you in {City}, {State}. Check availability at your address and find affordable plans from local providers. |
| 7 | Urgency | Get fast internet today in {City}, {State}. Check availability at your address now — one search shows every local provider near you. |

---

## C) ZIP PAGES (31,043 pages)

Titles use em dash format: {Keyword} in {ZIP} — {City}, {ST}.
Descriptions use full state name.
Year applied per page via rule — most ZIPs have room for (2026).

### Titles

| # | Cluster | Template | 43215, Columbus OH Example | Chars |
|---|---------|----------|---------------------------|-------|
| 0 | Core | Internet Providers in {ZIP} — {City}, {ST} ({year}) | Internet Providers in 43215 — Columbus, OH (2026) | 50 |
| 1 | Fiber | Fiber Internet in {ZIP} — {City}, {ST} ({year}) | Fiber Internet in 43215 — Columbus, OH (2026) | 46 |
| 2 | High Speed | High Speed Internet in {ZIP} — {City}, {ST} ({year}) | High Speed Internet in 43215 — Columbus, OH (2026) | 51 |
| 3 | 5G | 5G Home Internet in {ZIP} — {City}, {ST} ({year}) | 5G Home Internet in 43215 — Columbus, OH (2026) | 48 |
| 4 | WiFi | Home WiFi in {ZIP} — {City}, {ST} ({year}) | Home WiFi in 43215 — Columbus, OH (2026) | 41 |
| 5 | Home | Home Internet in {ZIP} — {City}, {ST} ({year}) | Home Internet in 43215 — Columbus, OH (2026) | 45 |
| 6 | Cheap | Cheap Internet in {ZIP} — {City}, {ST} ({year}) | Cheap Internet in 43215 — Columbus, OH (2026) | 46 |
| 7 | Urgency | Get Fast Internet in {ZIP} — {City}, {ST} ({year}) | Get Fast Internet in 43215 — Columbus, OH (2026) | 49 |

All examples under 52 chars. Year always fits for ZIP pages.

### Descriptions

| # | Cluster | Description |
|---|---------|-------------|
| 0 | Core | Best local internet options in {ZIP}, {City}, {State}. Check availability at your address — one search shows every provider near you. |
| 1 | Fiber | Fast fiber internet available in {ZIP}, {City}, {State}. Check availability at your address — one search shows every local provider. |
| 2 | High Speed | High speed internet deals in {ZIP}, {City}, {State}. Check availability at your address and find fast plans — one search, all providers. |
| 3 | 5G | 5G home internet available in {ZIP}, {City}, {State}. Check availability at your address — one quick search shows every local provider. |
| 4 | WiFi | Best home WiFi options in {ZIP}, {City}, {State}. Check availability at your address and find the best local plans — one search. |
| 5 | Home | Cheap fast home internet in {ZIP}, {City}, {State}. Check availability at your address and find affordable local plans — one search. |
| 6 | Cheap | Cheapest internet deals in {ZIP}, {City}, {State}. Check availability at your address and find affordable plans from local providers. |
| 7 | Urgency | Get fast internet today in {ZIP}, {City}, {State}. Check availability at your address now — one search shows every local provider. |

---

## D) NEIGHBORHOOD PAGES (19,251 pages)

Titles use 2-letter state abbreviation ({ST}).
Descriptions use parent city name ({City}) — city provides local context without needing state.
Year applied via rule. Long name fallback below.

### Titles

| # | Cluster | Template | Short North, OH Example | Chars |
|---|---------|----------|------------------------|-------|
| 0 | Core | Internet Providers in {Neighborhood}, {ST} ({year}) | Internet Providers in Short North, OH (2026) | 45 |
| 1 | Fiber | Fiber Internet in {Neighborhood}, {ST} ({year}) | Fiber Internet in Short North, OH (2026) | 40 |
| 2 | High Speed | High Speed Internet in {Neighborhood}, {ST} ({year}) | High Speed Internet in Short North, OH (2026) | 46 |
| 3 | 5G | 5G Home Internet in {Neighborhood}, {ST} ({year}) | 5G Home Internet in Short North, OH (2026) | 43 |
| 4 | WiFi | Home WiFi Providers in {Neighborhood}, {ST} ({year}) | Home WiFi Providers in Short North, OH (2026) | 46 |
| 5 | Home | Home Internet in {Neighborhood}, {ST} ({year}) | Home Internet in Short North, OH (2026) | 39 |
| 6 | Cheap | Cheap Internet in {Neighborhood}, {ST} ({year}) | Cheap Internet in Short North, OH (2026) | 40 |
| 7 | Urgency | Get Fast Internet in {Neighborhood}, {ST} ({year}) | Get Fast Internet in Short North, OH (2026) | 44 |

**Long name fallback (in order):**
1. Try with (2026) — if ≤ 60 chars, done.
2. Drop (2026) — if ≤ 60 chars, done.
3. Truncate neighborhood to 28 chars + "..." — done.

### Descriptions

| # | Cluster | Description |
|---|---------|-------------|
| 0 | Core | Best local internet options near you in {Neighborhood}, {City}. Check availability at your address — one search shows every provider. |
| 1 | Fiber | Fast fiber internet available near you in {Neighborhood}, {City}. Check availability at your address — one search shows local providers. |
| 2 | High Speed | High speed internet deals near you in {Neighborhood}, {City}. Check availability at your address — one search shows every provider. |
| 3 | 5G | 5G home internet available near you in {Neighborhood}, {City}. Check availability at your address — one search shows local providers. |
| 4 | WiFi | Best home WiFi options near you in {Neighborhood}, {City}. Check availability at your address — one search shows every local plan. |
| 5 | Home | Cheap fast home internet near you in {Neighborhood}, {City}. Check availability at your address — one search shows every local provider. |
| 6 | Cheap | Cheapest internet deals near you in {Neighborhood}, {City}. Check availability at your address — one search shows affordable local plans. |
| 7 | Urgency | Get fast internet today in {Neighborhood}, {City}. Check availability at your address now — one search shows every local provider. |

---

## E) CHEAP INTERNET STATE PAGES (51 pages)

Price-intent keywords used directly as titles. "Cheap internet" (50K vol, comp=20) and "affordable internet" (5K vol, +900% YoY) are the actual search terms. hash(pagePath) % 6 selects the title. Year always fits.

### Titles (6 variants)

| # | Template | Ohio Example | Chars |
|---|----------|-------------|-------|
| 0 | Cheap Internet in {State} ({year}) | Cheap Internet in Ohio (2026) | 29 |
| 1 | Affordable Internet in {State} ({year}) | Affordable Internet in Ohio (2026) | 34 |
| 2 | Low Cost Internet in {State} ({year}) | Low Cost Internet in Ohio (2026) | 32 |
| 3 | Cheap Home Internet in {State} ({year}) | Cheap Home Internet in Ohio (2026) | 34 |
| 4 | Internet Deals in {State} ({year}) | Internet Deals in Ohio (2026) | 28 |
| 5 | Budget Internet Providers in {State} ({year}) | Budget Internet Providers in Ohio (2026) | 40 |

Longest state: "Budget Internet Providers in Massachusetts (2026)" = 49 chars ✓

### Descriptions (3 sub-intents, mapped by title index)

Titles 0, 1 → Budget description
Titles 2, 3 → Low-Cost description
Titles 4, 5 → Deals description

| Sub-Intent | Description |
|------------|-------------|
| Budget | Cheapest internet plans near you in {State}. Check availability at your address and find the best cheap internet deals from local providers. |
| Low-Cost | Low cost internet options near you in {State}. Check availability at your address and find affordable local plans — one quick search. |
| Deals | Best internet deals near you in {State}. Find cheap fast internet plans available at your address from local providers — one search. |

---

## TITLE VALIDATION — 5-POINT CHECK

1. **Length ≤ 60** — If over: drop (2026) first. Still over (neighborhood): truncate name to 28 chars + "...". Never abbreviate keywords.
2. **Cluster keyword present** — Title contains its cluster keyword (fiber, high speed, WiFi, cheap, home, get fast, etc.).
3. **Location present** — Title contains state, city, ZIP, or neighborhood. No keyword-only titles.
4. **No banned language** — Scan against banned list at top of this document.
5. **Description 140–160 chars** — Under 140 is thin. Over 160: use state abbreviation. Over 165 gets cut by Google mid-sentence.

---

## SCALE MATH — GOOGLE SAFETY

| Metric | Our Plan | Top Competitor (BroadbandNow) | Safety |
|--------|----------|-------------------------------|--------|
| Total pages | 69,580 | ~40,000 | — |
| Unique titles | 69,580 (100%) | ~40,000 (100%) | ✓ Equal |
| Description templates | 35 (8×4 + 3) | 4-5 (1 per page type) | **7x more varied** |
| Max pages per template | ~3,880 (ZIP) | ~40,000 | **10x better** |
| Description keyword density | Every word is a search term | Generic "compare" language | **Higher relevance** |
| Hard claims in meta | Zero | Speed/price claims | **Safer** |
| Page unique value | Live address-check tool | Static provider list | ✓ |

**Why 8 clusters is optimal:**
- All 8 are backed by 50K+ volume keywords
- Adding clusters 9+ forces 500-5K volume keywords into titles — weaker signal
- 8 clusters distribute evenly across 70K pages (~8,700 per cluster)
- Each cluster gets enough pages to build topical authority for that keyword family

**Google Scaled Content Abuse check:**
- Titles: 100% unique (location names guarantee uniqueness) ✓
- Descriptions: 35 templates across 70K pages (competitors use 4-5) ✓
- Page body: Live API tool with unique results per address ✓
- No false claims ✓
- Tool/aggregator page pattern (same as Zillow, Kayak, BroadbandNow) ✓

---

## WHAT CHANGES IN THE CODE

| File | Current Problem | Fix |
|------|----------------|-----|
| src/pages/internet-providers/[state].astro | Single title variant, speed/price claims in description | 8-cluster rotation, keyword-stacked description |
| src/pages/internet-providers/[city].astro | Single title variant for 19K+ pages — never ranks for fiber/5G/cheap | 8-cluster rotation |
| src/pages/internet-providers/zip/[zip].astro | "Fiber confirmed" + price claims in description | Remove all conditional claims, 8-cluster rotation |
| src/pages/internet-providers/[stateAbbr]/[neighborhood].astro | "Don't Overpay" in title | Clean 8-cluster title, keyword-stacked description |
| src/pages/cheap-internet/[state].astro | From $X/mo in title and description | Price-intent keywords, no dollar amounts, 6-title / 3-description rotation |

### Implementation

Create one utility module: **src/lib/location-meta.ts**

```ts
// Hash function: deterministic, stable across builds
function hashPath(path: string): number { ... }

// Year rule: append (year) if total ≤ 60 chars
function withYear(base: string): string {
  const candidate = `${base} (${new Date().getFullYear()})`;
  return candidate.length <= 60 ? candidate : base;
}

// Title + description builders per page type
export function buildStateMeta(path: string, state: string):
  { title: string; description: string }

export function buildCityMeta(path: string, city: string, stateAbbr: string, stateFull: string):
  { title: string; description: string }

export function buildZipMeta(path: string, zip: string, city: string, stateAbbr: string, stateFull: string):
  { title: string; description: string }

export function buildNeighborhoodMeta(path: string, neighborhood: string, stateAbbr: string, parentCity: string):
  { title: string; description: string }

export function buildCheapStateMeta(path: string, state: string):
  { title: string; description: string }
```

Each builder returns `{ title, description }`. Each page template calls the builder and passes the result to `<Base title={meta.title} description={meta.description} noSuffix>`.
