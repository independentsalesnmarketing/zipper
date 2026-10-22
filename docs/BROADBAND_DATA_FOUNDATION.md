# Internet 4 ALL national broadband data foundation — phase 1

**This change is research-only.** It neither changes the live website nor submits customer orders.

## What already exists
The Stance offline placement tool (dataset built Oct 20 2026) contains estimates for **35,728 ZIP areas**, **60,324 provider/technology/ZIP records**, and eight network groups. This is NOT a complete national all-provider catalog or exact address serviceability data. The current website reads selected provider ZIP lists. Its older script `scripts/research-fcc-data.mjs` only probes endpoints and should not be mistaken for a production extractor.

## Official sources
- FCC data downloads: https://broadbandmap.fcc.gov/data-download
- FCC BDC reference documentation: https://help.bdc.fcc.gov/
- Esri Living Atlas item e1343efcefc344709057260ee57290a0: verify reporting vintage in live item metadata before importing.
- Census geography: https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html

## Phase 1 workflow
Run the GitHub Actions **Broadband source discovery** job manually. It outputs the live service URL, layers, tables and retrieval date as a downloadable artifact. Review the schema before attempting data download. Never rely on an undocumented endpoint as an official stable API.

The full local starter package (provided separately) includes:
- `extract_stance_seed.py`: export public-compatible ZIP estimates from the offline Stance tool, excluding payouts.
- `fcc_provider_registry.py`: parse an official FCC provider ID workbook; match priority consumer names conservatively; do not auto-approve fuzzy matches.
- `national_inventory.mjs`: metadata and table pagination research with record-count safety limits.
- `data/zip_areas.csv`, `zip_provider_coverage.csv`, and `geography_provider_coverage.csv`: historical starting datasets.
- Priority roster: 107 retail brands/networks; **not** a nationwide completeness cap.

## Planned national import
1. Verify newest public FCC BDC reporting period, schema, distribution terms and current downloadable files.
2. Ingest **all** fixed residential reporting-provider IDs and preserve exact IDs and reporting entity names. Map retail brands separately; keep mergers and alternate branding as dated relationships.
3. Ingest nationwide fixed availability by reporting period, provider ID, technology and serviceable-location identifier or authorized aggregate. Never claim access to Fabric street addresses.
4. Aggregate accurately using ZIP-area and city boundaries and a documented weighting method, not an unweighted ZIP presence flag. Store source counts, denominators, and uncertainty.
5. Maintain a separate verified retail plan catalog and an independently permissioned Stance sales catalog.
6. Generate local-page facts, source citations and diffs between reporting periods; publish after QA. Existing URLs and site layout remain unchanged.

## Critical limitations
- A ZIP record is not proof of availability at every address.
- The placement seed's city totals are grouped by primary ZIP city. They are **not** precise municipal geographic clips and can overlap.
- Do not publish Stance internal payout/dealer data.
- The source discovery workflow does not yet perform a full national download or certify ISP/brand matching.
- Availability must be separated from retail pricing and order eligibility.
