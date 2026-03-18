# Deployment & Google Search Console Setup

## Build & Sitemap (Automated)

```bash
npm run build
```

This now runs two steps automatically:
1. `astro build` — generates all 19K+ city/ZIP pages in `dist/`
2. `node scripts/generate-sitemap.mjs` — crawls `dist/`, generates `dist/sitemap.xml` (or `dist/sitemap-1.xml` ... `dist/sitemap-N.xml` + index if >10K URLs), and writes `dist/robots.txt`

**The `robots.txt` and `sitemap.xml` in `public/` are development-only placeholders.** The real production files are written to `dist/` during the build.

---

## Google Search Console: One-Time Setup

### Step 1 — Verify ownership
Go to https://search.google.com/search-console → add property `https://internet-4-all.com`

Choose **HTML file verification**:
1. Download the verification file (e.g. `googleXXXXXXXXXXXXXXXX.html`)
2. Place it in `/workspaces/zipper/public/`
3. Run `npm run build` to include it in `dist/`
4. Deploy and click **Verify** in GSC

### Step 2 — Submit the sitemap
Once verified:
1. In GSC → **Sitemaps** (left sidebar)
2. Enter: `sitemap.xml`
3. Click **Submit**

GSC will crawl the sitemap index, discover all child sitemaps, and begin indexing.

### Step 3 — Request indexing for priority pages
For the highest-value pages, manually request indexing via the URL Inspection tool:
- `https://internet-4-all.com/` (homepage)
- `https://internet-4-all.com/providers`
- `https://internet-4-all.com/affordable-internet`
- `https://internet-4-all.com/low-income-internet`
- `https://internet-4-all.com/bill-shock`
- `https://internet-4-all.com/internet-affordability-index`
- `https://internet-4-all.com/internet-monopoly-report`
- Top 10 state pages (e.g. `/internet-providers/texas`)

---

## Sitemap Structure (after build)

| File | Contents | URLs |
|------|----------|------|
| `sitemap.xml` | Sitemap index | Points to child sitemaps |
| `sitemap-1.xml` | Homepage + core pages | Priority 1.0–0.9 |
| `sitemap-2.xml` | State pages, provider pages | Priority 0.8 |
| `sitemap-3.xml` | City pages | Priority 0.7 |
| `sitemap-4+.xml` | ZIP code pages | Priority 0.5 |

Total expected: ~50,000+ URLs across 5–6 sitemap files.

---

## Redeployment Checklist

- [ ] Run `npm run build` (auto-runs sitemap generator)
- [ ] Verify `dist/sitemap.xml` is a sitemap index (not a single-file)
- [ ] Verify `dist/robots.txt` references `https://internet-4-all.com/sitemap.xml`
- [ ] Deploy `dist/` to production host
- [ ] In GSC → Sitemaps → re-submit `sitemap.xml` if you get "Couldn't fetch" errors
- [ ] Check GSC Coverage report 48hrs later for indexing progress
