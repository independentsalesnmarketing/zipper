# Internet4All Residential Conversion SEO Plan (Non-Location Pages)

Updated: 2026-03-17  
Scope: Residential only, conversion-first, non-location pages only  
Exclusions: No business keyword targeting, no new blog strategy

## 1) Hard Guardrails
- Primary goal is partner-provider conversions, not informational traffic.
- Residential intent only. Remove or de-prioritize business intent terms/pages.
- No blog expansion recommendations.
- Every page must map to a conversion action: address check, compare plans, claim deal, switch, or start signup.

## 2) Residential Keyword Stacks To Reuse Everywhere

### Stack A: Address + Availability (highest buy intent)
- internet providers for my address
- internet availability by address
- internet options by address
- check internet availability
- internet providers near me

### Stack B: Plans + Price (high conversion intent)
- internet plans
- high speed internet plans
- cable internet plans
- fiber internet plans
- cheapest internet plans

### Stack C: Urgency / Today (highest CPC intent)
- sign up for internet
- get home internet today
- same day internet provider
- get wifi today
- internet same day installation

### Stack D: Fiber / Speed Tier
- fiber internet
- fiber optic internet
- fiber internet providers
- gigabit internet
- 1 gig internet

### Stack E: Wireless Home Internet
- wireless home internet
- 5g home internet
- fixed wireless internet
- no contract home internet

### Stack F: Deal + Switch
- internet deals
- internet promotions
- new customer internet deals
- switch internet providers
- cancel and switch internet

### Stack G: Affordability
- cheap internet
- affordable internet
- cheap home internet
- low-income internet
- no credit check internet

### Stack H: Speed Test Conversion Bridge
- internet speed test
- speed test
- test my internet speed
- check internet speed
- [provider] speed test

## 3) Current Non-Location Meta Assessment (What To Fix)

Strong and keepable base:
- `src/pages/deals/[slug].astro`
- `src/pages/compare/[slug].astro`
- `src/pages/provider/[slug].astro`
- `src/pages/speed-test.astro`
- `src/pages/speed-test/[provider].astro`

Needs keyword-stack tightening:
- `src/pages/internet-types/[type].astro` (too generic formula)
- `src/pages/internet-for/[audience].astro` (formula misses top transactional phrases)
- `src/pages/check-availability.astro` (title should lead with by-address phrase)
- `src/pages/home-internet.astro` (good but can include plans+price stack)
- `src/pages/get-connected.astro` and `src/pages/movers.astro` (should target urgency stack harder)
- `src/pages/wireless-internet.astro` (needs stronger 5G + no-contract phrasing)

Out of scope / de-prioritize for primary funnel:
- `src/pages/business-internet.astro` (residential site mismatch)
- blog routes under `src/pages/blog/` (no expansion)

## 4) Full Meta Plan For Existing Non-Location Static Routes

Use these as target replacements (or close variants if UI copy constraints require).

| Route | Recommended Title | Recommended Description |
|---|---|---|
| `/` | Internet Providers Near Me - Compare Plans by Address (2026) | Compare internet providers at your exact address. See fiber, cable, 5G and satellite plans, prices, and speeds. Find the best deal and sign up today. |
| `/about` | About Internet4All - Residential Internet Comparison | We help households compare residential internet providers, plans, and prices by address so you can choose the right service and connect fast. |
| `/affordable-internet` | Affordable Internet Plans - Compare Low-Cost Options (2026) | Find affordable internet plans from top providers, including no-contract and low-income options. Compare pricing and speeds available at your address. |
| `/best-internet` | Best Internet Providers (2026) - Ranked for Home Use | Compare top residential internet providers by speed, value, and reliability. See who performs best at your address and pick your plan. |
| `/bill-analyzer` | Internet Bill Analyzer - Check If You Are Overpaying | Analyze your current bill, identify hidden fees, and compare lower-cost residential plans available in your area. |
| `/bill-shock` | Internet Bill Shock Report (2026) - Price Hikes Explained | See how and when internet prices increase after promos, then compare alternatives so you can avoid overpaying at renewal. |
| `/bundles` | Internet and TV Bundle Deals - Compare Packages (2026) | Compare internet and TV bundles, promo pricing, and contract terms to find the best household package in your area. |
| `/cable-tv` | Cable TV and Internet Providers Near You (2026) | Compare cable TV and internet providers, channels, and bundle pricing by address to find the best value for your home. |
| `/cheap-internet` | Cheapest Internet Plans Near Me - From $25/mo (2026) | Compare cheap home internet plans, no-contract options, and discount programs by address. Find the lowest monthly price today. |
| `/check-availability` | Check Internet Availability by Address - All Providers | Enter your address to instantly see internet providers, plans, speeds, and pricing available at your location. |
| `/compare` | Compare Internet Providers - Plans, Prices and Speeds (2026) | Side-by-side internet comparison for residential households. Compare speed, monthly cost, fees, and contracts before you sign up. |
| `/contact` | Contact Internet4All - Residential Internet Help | Get support with provider comparisons, availability checks, and plan selection for your home internet setup. |
| `/deals` | Best Internet Deals and Promotions (2026) | Browse internet promotions, price-lock offers, and new customer deals from leading providers. Claim the best offer by address. |
| `/disconnected-internet` | Disconnected Internet? Get WiFi Today - No Credit Check Options | Lost service? Compare same-day and no-credit-check home internet options and reconnect quickly at your address. |
| `/fastest-internet` | Fastest Internet Providers - Gigabit and Multi-Gig Plans (2026) | Compare fastest residential internet plans, including fiber and multi-gig options, with prices and availability by address. |
| `/get-connected` | Get Home Internet Today - Fast Setup and Easy Signup | Compare providers, check availability, and sign up for home internet in minutes. Same-day options available in many areas. |
| `/home-internet` | Home Internet Plans - Compare Providers and Prices (2026) | Compare residential internet plans from fiber, cable, wireless, and satellite providers. Find speeds and pricing at your address. |
| `/internet-affordability-index` | Internet Affordability Index by State (2026) | See how internet costs compare to household income by state, and find low-cost plan options where affordability is tightest. |
| `/internet-and-phone` | Internet and Phone Bundles - Home Plan Comparison (2026) | Compare home internet and phone bundles, monthly pricing, and feature differences to choose the best household setup. |
| `/internet-monopoly-report` | Internet Monopoly Report (2026) - Where Choice Is Limited | Explore ZIP-level competition and identify areas with limited provider choice, then check alternatives available at your address. |
| `/low-income-internet` | Low-Income Internet Programs - Free and Discounted Plans (2026) | Compare Lifeline and provider discount internet programs. Check eligibility and find affordable service options in your area. |
| `/methodology` | Methodology - How We Rank Internet Providers | See how we score residential internet providers using plan pricing, speed data, and user-focused criteria. |
| `/movers` | Internet for Moving - Set Up Service at Your New Address | Moving soon? Check internet availability at your new home, compare plans, and schedule setup before move-in day. |
| `/no-contract-internet` | No-Contract Internet Plans - Cancel Anytime (2026) | Compare month-to-month home internet plans with no long-term contract, clear pricing, and flexible cancellation options. |
| `/privacy` | Privacy Policy - Internet4All | Learn how Internet4All collects and protects personal data when you compare providers and submit availability requests. |
| `/provider-programs` | Provider Discount Programs - Affordable Home Internet Help | Compare ISP discount programs for households, including low-income options and reduced-cost plans by provider. |
| `/providers` | Internet Service Providers Near Me - Full Comparison (2026) | Compare major residential internet providers by speed, price, and availability at your address. |
| `/quiz` | Internet Needs Quiz - Find the Right Home Plan | Answer a few quick questions to get a tailored residential internet recommendation based on your usage and budget. |
| `/resources` | Internet Resources and Tools - Compare, Save, Connect | Residential tools and guides to compare providers, cut monthly costs, and choose better home internet service. |
| `/speed-test` | Free Internet Speed Test - Download, Upload, Ping and Jitter | Run a free internet speed test, then compare faster or cheaper plans available at your address if your performance is low. |
| `/switch` | Switch Internet Providers - Save Money and Upgrade Speed | Compare alternatives, avoid downtime, and switch to a better residential internet plan with clear pricing and faster speeds. |
| `/terms` | Terms of Service - Internet4All | Terms and conditions for using Internet4All's residential internet comparison platform and tools. |
| `/tv-providers` | TV Providers Near Me - Compare Cable, Satellite and Streaming (2026) | Compare TV providers and packages by address, with internet bundle options and monthly pricing. |
| `/why-us` | Why Internet4All - Faster, Simpler Internet Comparison | See why households use Internet4All to compare providers by address, uncover better deals, and switch with less friction. |
| `/wireless-internet` | Wireless Home Internet - 5G and Fixed Wireless Plans (2026) | Compare 5G and fixed wireless home internet plans, pricing, and speeds. No cable required. Check availability by address. |
| `/404` | Page Not Found | This page is unavailable. Use our address search to find internet providers and plans in your area. |

## 5) Dynamic Template Meta Specs (Keep + Tighten)

### `/compare/[slug]`
- Title: `${providerA.name} vs ${providerB.name} - Plans, Price and Speed (2026)`
- Description: `Compare ${providerA.name} vs ${providerB.name} by speed, monthly price, fees, and customer fit. See which provider is better for your address.`

### `/deals/[slug]`
- Title: `${provider.name} Internet Deals - ${month} ${year}`
- Description: `${provider.name} deals and promotions: plans from ${formatPrice(minPrice)}/mo, speeds up to ${formatSpeed(maxSpeed)}, and current sign-up offers.`

### `/provider/[slug]`
- Title: `${provider.name} Internet Plans and Pricing (${year})`
- Description: `Compare ${provider.name} plans, speeds, and pricing. Check availability at your address and choose the best deal for your household.`

### `/speed-test/[provider]`
- Title: `${provider.name} Speed Test - Check Real Internet Speed (${year})`
- Description: `Test your ${provider.name} download and upload speed in seconds. If performance is low, compare better plans available at your address.`

### `/switch/[provider]`
- Title: `Switch From ${config.name} - Best Alternatives (${year})`
- Description: `Leaving ${config.name}? Compare faster, lower-cost alternatives and switch providers with minimal downtime.`

### `/internet-for/[audience]`
- Title: `${audience.h1} - Best Plans and Providers (${year})`
- Description: `${audience.description} Compare household plans, monthly pricing, and speeds from top providers in your area.`
- Note: Tune each audience object so the base phrase includes transactional terms (plans, pricing, availability).

### `/internet-types/[type]`
- Title: `${td.h1} Internet Plans - Providers and Pricing (${year})`
- Description: `Compare ${td.h1.toLowerCase()} internet providers, speeds, and monthly pricing in your area. Check availability and sign up online.`

### `/cheap-internet/[state]`
- Keep current `buildCheapStateMeta(...)`, but update variants in `src/lib/location-meta.ts` to include more Stack B + Stack G phrases naturally.

## 6) Pages To Build Next (Residential Conversion Only)

Build only pages that map to proven residential conversion stacks.

1. `/internet-plans` (P1)
- Why: Own Stack B cluster directly.
- Target terms: internet plans, high speed internet plans, cable internet plans, fiber internet plans.
- Core CTA: compare plans by address.

2. `/same-day-internet` (P1)
- Why: Own Stack C urgency intent with strongest conversion signal.
- Target terms: get home internet today, same day internet provider, internet same day installation, sign up for internet.
- Core CTA: same-day setup options by address.

3. `/fiber-internet` (P1)
- Why: Direct URL match for exploding fiber terms.
- Target terms: fiber internet, fiber optic internet, fiber internet providers, gigabit internet.
- Core CTA: check fiber availability at address.

4. `/rural-internet` (P1)
- Why: Large residential demand where options are constrained.
- Target terms: rural internet options, internet for rural areas, best internet for rural homes.
- Core CTA: compare available rural providers by address.

5. `/gigabit-internet` (P2)
- Why: Premium-speed buyers convert at higher ARPU.
- Target terms: gigabit internet, 1 gig internet, multi-gig internet, fastest home internet.
- Core CTA: find 1G+ plans by address.

6. `/wifi-providers-near-me` (P2)
- Why: WiFi phrasing shows stronger purchase intent in keyword set.
- Target terms: wifi providers near me, wifi for my address, home wifi providers.
- Core CTA: check wifi-capable plans by address.

7. `/internet-for-apartments` (P2)
- Why: Existing audience pattern can be converted into higher-intent standalone landing page.
- Target terms: internet for apartments, cheap internet for apartments, no-contract internet for renters.
- Core CTA: renter-friendly plans and quick install.

8. `/internet-for-seniors` (P3)
- Why: Existing audience has strong conversion potential when made pricing-forward.
- Target terms: internet for seniors, affordable internet for seniors, low-cost home internet.
- Core CTA: easy, low-cost household plan selection.

## 7) What To Remove / De-Prioritize

- Do not add new business pages or business keyword targeting.
- Do not add new blog pages/content strategy.
- De-prioritize business-intent terms in metadata and on-page headings.
- Keep speed-test pages, but position them as conversion bridges to plan comparison and switching.

## 8) Implementation Order (Fastest Revenue Impact)

1. Deploy meta updates for `/`, `/check-availability`, `/home-internet`, `/deals`, `/switch`, `/get-connected`, `/movers`, `/wireless-internet`.
2. Tighten dynamic templates for `/internet-types/[type]` and `/internet-for/[audience]`.
3. Build `/internet-plans`, `/same-day-internet`, `/fiber-internet`.
4. Build `/rural-internet`, `/gigabit-internet`, `/wifi-providers-near-me`.
5. Run sitemap update and monitor conversion events by landing page group.
