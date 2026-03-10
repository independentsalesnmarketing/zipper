#!/usr/bin/env node
// ============================================================
// Internet 4 ALL — Neighborhood Data Generator
// Maps ZIP codes to their neighborhoods, communities, and CDPs
// using GeoNames place data + zipcodes package centroids.
//
// Many ZIPs serve distinct communities that differ from the USPS
// "preferred city" (e.g., ZIP 45240 → USPS says "Cincinnati"
// but the actual community is Forest Park, OH). This script
// identifies those neighborhoods so ZIP pages can rank for
// neighborhood-level searches like "internet in Forest Park".
//
// Data source: GeoNames cities1000 (CC BY 4.0) + Census ACS
// Run: node scripts/generate-neighborhoods.mjs
// Output: src/data/neighborhoods.ts
// ============================================================

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { get as httpsGet } from 'https';
import { createUnzip } from 'zlib';
import { join } from 'path';

// ── Config ──
const NEARBY_RADIUS_MI = 4;       // max distance to consider a place a "neighborhood"
const METRO_RADIUS_MI = 25;       // max distance to find metro parent
const MIN_POP = 1000;             // minimum population for a city/CDP
const METRO_POP_THRESHOLD = 75000; // population threshold for "metro" city
const MAX_NEIGHBORHOODS = 8;      // max neighborhoods per ZIP
const GEONAMES_CACHE = '/tmp/cities1000.txt';
const US_DATA_CACHE = '/tmp/US.txt';

// ── State FIPS → Abbreviation ──
const STATE_FIPS = {
  AL:'01',AK:'02',AZ:'04',AR:'05',CA:'06',CO:'08',CT:'09',DE:'10',DC:'11',
  FL:'12',GA:'13',HI:'15',ID:'16',IL:'17',IN:'18',IA:'19',KS:'20',KY:'21',
  LA:'22',ME:'23',MD:'24',MA:'25',MI:'26',MN:'27',MS:'28',MO:'29',MT:'30',
  NE:'31',NV:'32',NH:'33',NJ:'34',NM:'35',NY:'36',NC:'37',ND:'38',OH:'39',
  OK:'40',OR:'41',PA:'42',RI:'44',SC:'45',SD:'46',TN:'47',TX:'48',UT:'49',
  VT:'50',VA:'51',WA:'53',WV:'54',WI:'55',WY:'56'
};

const VALID_STATES = new Set(Object.keys(STATE_FIPS));

// ── Haversine distance (miles) ──
function haversine(lat1, lng1, lat2, lng2) {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Download helper ──
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    httpsGet(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// ── Step 1: Load GeoNames US place data (cities + neighborhoods) ──
async function loadGeoNames() {
  console.log('📍 Loading GeoNames place data...');

  // --- Layer 1: cities1000.txt (incorporated places, CDPs with pop ≥ 1000) ---
  let text;
  if (existsSync(GEONAMES_CACHE)) {
    console.log('  Using cached /tmp/cities1000.txt');
    text = readFileSync(GEONAMES_CACHE, 'utf-8');
  } else {
    console.log('  Downloading cities1000.zip from GeoNames...');
    const { execSync } = await import('child_process');
    execSync('curl -sL "https://download.geonames.org/export/dump/cities1000.zip" -o /tmp/cities1000.zip && cd /tmp && unzip -o cities1000.zip', { stdio: 'pipe' });
    text = readFileSync(GEONAMES_CACHE, 'utf-8');
  }

  const places = [];
  const seenNames = new Map(); // "name|state" → best-pop entry index

  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    const f = line.split('\t');
    if (f[8] !== 'US') continue;
    const state = f[10];
    if (!VALID_STATES.has(state)) continue;
    const pop = parseInt(f[14]) || 0;
    if (pop < MIN_POP) continue;
    const lat = parseFloat(f[4]);
    const lng = parseFloat(f[5]);
    if (isNaN(lat) || isNaN(lng)) continue;

    const name = f[2] || f[1]; 
    const key = `${name.toLowerCase()}|${state}`;
    const existing = seenNames.get(key);
    if (existing !== undefined && places[existing].pop >= pop) continue;
    
    const entry = { name, state, lat, lng, pop, type: 'city' };
    if (existing !== undefined) {
      places[existing] = entry;
    } else {
      seenNames.set(key, places.length);
      places.push(entry);
    }
  }

  const cityCount = places.length;
  console.log(`  ✅ ${cityCount.toLocaleString()} US cities/CDPs with pop ≥ ${MIN_POP}`);

  // --- Layer 2: US.txt PPLX entries (real neighborhood names within cities) ---
  let usText;
  if (existsSync(US_DATA_CACHE)) {
    console.log('  Using cached /tmp/US.txt');
    usText = readFileSync(US_DATA_CACHE, 'utf-8');
  } else {
    console.log('  Downloading US.zip from GeoNames (full US dataset)...');
    const { execSync } = await import('child_process');
    execSync('curl -sL "https://download.geonames.org/export/dump/US.zip" -o /tmp/US.zip && cd /tmp && unzip -o US.zip', { stdio: 'pipe' });
    usText = readFileSync(US_DATA_CACHE, 'utf-8');
  }

  let pplxCount = 0;
  for (const line of usText.split('\n')) {
    if (!line.trim()) continue;
    const f = line.split('\t');
    // field 6 = feature class (P = populated place)
    // field 7 = feature code (PPLX = section of populated place = neighborhood)
    if (f[6] !== 'P' || f[7] !== 'PPLX') continue;
    const state = f[10];
    if (!VALID_STATES.has(state)) continue;
    const lat = parseFloat(f[4]);
    const lng = parseFloat(f[5]);
    if (isNaN(lat) || isNaN(lng)) continue;

    const name = f[2] || f[1];
    const key = `${name.toLowerCase()}|${state}`;
    
    // Skip if we already have this as a city (avoid duplicates)
    if (seenNames.has(key)) continue;

    seenNames.set(key, places.length);
    places.push({
      name,
      state,
      lat,
      lng,
      pop: parseInt(f[14]) || 0, // PPLX often has 0 pop — that's OK
      type: 'neighborhood',
    });
    pplxCount++;
  }

  console.log(`  ✅ ${pplxCount.toLocaleString()} PPLX neighborhood entries added`);
  console.log(`  ✅ ${places.length.toLocaleString()} total places for matching`);
  return places;
}

// ── Step 2: Load ZIP centroids from zipcodes package ──
async function loadZipCentroids() {
  console.log('📦 Loading ZIP centroids...');

  let zipModule;
  try {
    zipModule = await import('zipcodes');
  } catch {
    const { execSync } = await import('child_process');
    execSync('npm install zipcodes --no-save', { stdio: 'inherit' });
    zipModule = await import('zipcodes');
  }
  const zipcodes = zipModule.default || zipModule;

  const zips = [];
  const allStates = [...VALID_STATES];
  for (const state of allStates) {
    const stateZips = zipcodes.lookupByState(state);
    if (!stateZips) continue;
    for (const z of stateZips) {
      if (!z.zip || !z.city || !z.latitude || !z.longitude) continue;
      zips.push({
        zip: z.zip,
        city: z.city,
        state: z.state,
        lat: z.latitude,
        lng: z.longitude,
      });
    }
  }

  console.log(`  ✅ ${zips.length.toLocaleString()} ZIP centroids loaded`);
  return zips;
}

// ── Step 3: Build spatial grid for fast proximity lookups ──
function buildSpatialGrid(places) {
  console.log('🗺️  Building spatial index...');
  const grid = new Map();
  const CELL = 0.1; // ~7 miles per cell at mid-latitudes

  for (const place of places) {
    const key = `${Math.floor(place.lat / CELL)},${Math.floor(place.lng / CELL)}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(place);
  }

  console.log(`  ✅ ${grid.size.toLocaleString()} grid cells`);
  return { grid, CELL };
}

function getNearbyPlaces(lat, lng, spatialIndex, radiusMi) {
  const { grid, CELL } = spatialIndex;
  const cellLat = Math.floor(lat / CELL);
  const cellLng = Math.floor(lng / CELL);
  // Check surrounding cells (radius ~0.1° ≈ 7mi, so check ±1 cells for 4mi, ±4 for 25mi)
  const cellRange = Math.ceil(radiusMi / 7) + 1;
  const results = [];

  for (let dLat = -cellRange; dLat <= cellRange; dLat++) {
    for (let dLng = -cellRange; dLng <= cellRange; dLng++) {
      const key = `${cellLat + dLat},${cellLng + dLng}`;
      const cell = grid.get(key);
      if (!cell) continue;
      for (const place of cell) {
        const dist = haversine(lat, lng, place.lat, place.lng);
        if (dist <= radiusMi) {
          results.push({ ...place, dist });
        }
      }
    }
  }

  return results.sort((a, b) => a.dist - b.dist);
}

// ── Step 4: Match ZIPs to neighborhoods ──
function matchNeighborhoods(zips, spatialIndex) {
  console.log('🏘️  Matching ZIPs to neighborhoods...');

  const results = new Map(); // zip → { neighborhoods, metro, metroSlug }
  let enriched = 0;
  let metroFound = 0;

  for (const z of zips) {
    const cityNorm = z.city.toLowerCase().trim();

    // Find nearby places within NEARBY_RADIUS_MI
    const nearby = getNearbyPlaces(z.lat, z.lng, spatialIndex, NEARBY_RADIUS_MI);

    // Filter: different name from ZIP's assigned city, same state
    const neighborhoods = nearby
      .filter(p => {
        if (p.state !== z.state) return false;
        const nameNorm = p.name.toLowerCase().trim();
        // Skip if same as assigned city (with fuzzy matching)
        if (nameNorm === cityNorm) return false;
        if (cityNorm.includes(nameNorm) || nameNorm.includes(cityNorm)) return false;
        return true;
      })
      // Sort: PPLX neighborhoods first (closer to the user's search intent),
      // then by distance. This ensures "Price Hill" beats "Cheviot" for 45205.
      .sort((a, b) => {
        // Within 1.5mi both are very close — prefer PPLX type
        if (a.dist < 1.5 && b.dist < 1.5) {
          if (a.type === 'neighborhood' && b.type !== 'neighborhood') return -1;
          if (b.type === 'neighborhood' && a.type !== 'neighborhood') return 1;
        }
        return a.dist - b.dist;
      })
      .slice(0, MAX_NEIGHBORHOODS);

    // Find metro parent: nearest city with pop > METRO_POP_THRESHOLD within METRO_RADIUS_MI
    let metro = null;
    if (z.city.length > 0) {
      // Check if the assigned city IS the metro
      const assignedInNearby = getNearbyPlaces(z.lat, z.lng, spatialIndex, 1)
        .find(p => p.name.toLowerCase().trim() === cityNorm && p.state === z.state);

      if (assignedInNearby && assignedInNearby.pop >= METRO_POP_THRESHOLD) {
        // The assigned city is already the metro — no separate metro needed
        metro = null;
      } else {
        // Find the nearest large city as the metro parent
        const metroCandidates = getNearbyPlaces(z.lat, z.lng, spatialIndex, METRO_RADIUS_MI)
          .filter(p => p.pop >= METRO_POP_THRESHOLD && p.state === z.state);
        if (metroCandidates.length > 0) {
          const m = metroCandidates[0]; // closest
          // Only set metro if it's different from the ZIP's city
          if (m.name.toLowerCase().trim() !== cityNorm) {
            metro = m.name;
          }
        }
      }
    }

    // Determine the "primary place" — the closest neighborhood that's
    // more specific than the assigned city. This handles cases like
    // ZIP 45240 → USPS says "Cincinnati" but Forest Park is closer.
    let primaryPlace = null;
    if (neighborhoods.length > 0) {
      const assignedCityInGeo = getNearbyPlaces(z.lat, z.lng, spatialIndex, METRO_RADIUS_MI)
        .find(p => p.name.toLowerCase().trim() === cityNorm && p.state === z.state);
      const assignedDist = assignedCityInGeo ? assignedCityInGeo.dist : Infinity;

      const closest = neighborhoods[0];
      // For PPLX (true neighborhood names), no population threshold needed.
      // For cities/CDPs, require pop ≥ 2000 to be "primary".
      const popOk = closest.type === 'neighborhood' || closest.pop >= 2000;
      if (closest.dist < assignedDist && popOk) {
        primaryPlace = closest.name;
      }
    }

    // Only store entries that have useful data
    if (primaryPlace || neighborhoods.length > 0 || metro) {
      const entry = {
        n: [], // neighborhood names
      };

      // Put primary place first
      if (primaryPlace) {
        entry.n.push(primaryPlace);
      }

      // Add remaining neighborhoods
      for (const nb of neighborhoods) {
        if (nb.name !== primaryPlace && entry.n.length < MAX_NEIGHBORHOODS) {
          entry.n.push(nb.name);
        }
      }

      // Set metro if found and different from primary
      if (metro && metro !== primaryPlace) {
        entry.m = metro;
        entry.ms = makeSlug(metro, z.state);
        metroFound++;
      }

      if (entry.n.length > 0 || entry.m) {
        results.set(z.zip, entry);
        enriched++;
      }
    }
  }

  console.log(`  ✅ ${enriched.toLocaleString()} ZIPs enriched with neighborhood data`);
  console.log(`  ✅ ${metroFound.toLocaleString()} ZIPs have metro parent context`);
  return results;
}

// ── Slug helpers ──
function makeSlug(city, state) {
  return `${slugify(city)}-${state.toLowerCase()}`;
}
function slugify(name) {
  return name.toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ── Step 5b: Build reverse map — neighborhood → ZIPs (for dedicated pages) ──
function buildNeighborhoodPages(neighborhoods, zips, places) {
  console.log('🏘️  Building neighborhood page data...');

  // Build ZIP→state and ZIP→city lookups
  const zipState = new Map();
  const zipCity = new Map();
  for (const z of zips) {
    zipState.set(z.zip, z.state);
    zipCity.set(z.zip, z.city);
  }

  // Build place coordinate lookup (name|state → best entry)
  const placeLookup = new Map();
  for (const p of places) {
    const key = `${p.name.toLowerCase()}|${p.state}`;
    if (!placeLookup.has(key) || p.pop > (placeLookup.get(key).pop || 0)) {
      placeLookup.set(key, p);
    }
  }

  // Reverse: iterate neighborhoods map, collect unique (name, state) → ZIPs
  const nhMap = new Map(); // "name|state" → data
  for (const [zip, data] of neighborhoods) {
    const state = zipState.get(zip);
    if (!state) continue;
    for (const nhName of data.n) {
      if (!nhName) continue;
      const key = `${nhName.toLowerCase()}|${state}`;
      if (!nhMap.has(key)) {
        const place = placeLookup.get(key);
        nhMap.set(key, {
          name: nhName,
          state,
          zips: new Set(),
          cities: new Map(),
          lat: place?.lat || 0,
          lng: place?.lng || 0,
          pop: place?.pop || 0,
          metro: null,
          metroSlug: null,
        });
      }
      const entry = nhMap.get(key);
      entry.zips.add(zip);
      const city = zipCity.get(zip);
      if (city) entry.cities.set(city, (entry.cities.get(city) || 0) + 1);
      if (data.m && !entry.metro) {
        entry.metro = data.m;
        entry.metroSlug = data.ms;
      }
    }
  }

  // Deduplicate slugs per state (keep higher-pop entry if collision)
  const slugsByState = new Map(); // state → Map(slug → key)
  const pages = [];

  for (const [key, data] of nhMap) {
    const slug = slugify(data.name);
    if (!slug) continue;
    const stKey = `${data.state}|${slug}`;
    const existing = slugsByState.get(stKey);
    if (existing) {
      const existingData = nhMap.get(existing);
      if (existingData && existingData.pop >= data.pop) continue;
      // Replace: remove old entry from pages
      const idx = pages.findIndex(p => p.slug === slug && p.state === data.state);
      if (idx >= 0) pages.splice(idx, 1);
    }
    slugsByState.set(stKey, key);

    // Find most common parent city among the ZIPs
    let parentCity = '';
    let maxCount = 0;
    for (const [city, count] of data.cities) {
      if (count > maxCount) { maxCount = count; parentCity = city; }
    }

    pages.push({
      name: data.name,
      slug,
      state: data.state,
      zips: [...data.zips].sort(),
      parentCity,
      parentCitySlug: parentCity ? makeSlug(parentCity, data.state) : '',
      lat: data.lat,
      lng: data.lng,
      pop: data.pop,
      metro: data.metro,
      metroSlug: data.metroSlug,
    });
  }

  pages.sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name));
  console.log(`  ✅ ${pages.length.toLocaleString()} unique neighborhood pages`);
  return pages;
}

// ── Step 5c: Generate neighborhood-pages.ts ──
function generateNeighborhoodPagesTS(pages) {
  console.log('📝 Generating src/data/neighborhood-pages.ts...');

  let entries = '';
  for (const p of pages) {
    const zArr = `[${p.zips.map(z => `'${z}'`).join(',')}]`;
    let line = `{n:'${p.name.replace(/'/g, "\\'")}',s:'${p.slug}',st:'${p.state}',z:${zArr},pc:'${p.parentCity.replace(/'/g, "\\'")}',pcs:'${p.parentCitySlug}'`;
    if (p.lat) line += `,lat:${p.lat.toFixed(4)}`;
    if (p.lng) line += `,lng:${p.lng.toFixed(4)}`;
    if (p.pop) line += `,pop:${p.pop}`;
    if (p.metro) line += `,m:'${p.metro.replace(/'/g, "\\'")}',ms:'${p.metroSlug}'`;
    line += '},';
    entries += line + '\n';
  }

  // Count per state for header
  const stateCounts = new Map();
  for (const p of pages) {
    stateCounts.set(p.state, (stateCounts.get(p.state) || 0) + 1);
  }

  const ts = `// ============================================================
// Internet 4 ALL — Neighborhood Page Data
// AUTO-GENERATED — Reverse map of neighborhoods to their ZIP codes.
// Each entry becomes a dedicated SEO page at /internet-providers/{state}/{slug}
// Generated: ${new Date().toISOString().split('T')[0]}
// Total neighborhoods: ${pages.length.toLocaleString()} across ${stateCounts.size} states
// DO NOT EDIT — regenerate with: node scripts/generate-neighborhoods.mjs
// ============================================================

export interface NeighborhoodPage {
  /** Display name */
  n: string;
  /** URL slug (no state prefix) */
  s: string;
  /** State abbreviation (uppercase) */
  st: string;
  /** ZIP codes served by this neighborhood */
  z: string[];
  /** Most common USPS parent city */
  pc: string;
  /** Parent city page slug */
  pcs: string;
  /** Latitude */
  lat?: number;
  /** Longitude */
  lng?: number;
  /** Population from GeoNames */
  pop?: number;
  /** Metro parent city name */
  m?: string;
  /** Metro parent city page slug */
  ms?: string;
}

export const neighborhoodPages: NeighborhoodPage[] = [
${entries}];

/** Lookup: state abbreviation (lowercase) → neighborhood pages */
const _byState = new Map<string, NeighborhoodPage[]>();
for (const p of neighborhoodPages) {
  const st = p.st.toLowerCase();
  if (!_byState.has(st)) _byState.set(st, []);
  _byState.get(st)!.push(p);
}
export function getNeighborhoodsByState(stateAbbr: string): NeighborhoodPage[] {
  return _byState.get(stateAbbr.toLowerCase()) || [];
}

/** Lookup by state+slug for individual page resolution */
const _bySlug = new Map<string, NeighborhoodPage>();
for (const p of neighborhoodPages) {
  _bySlug.set(\`\${p.st.toLowerCase()}/\${p.s}\`, p);
}
export function getNeighborhoodPage(stateAbbr: string, slug: string): NeighborhoodPage | undefined {
  return _bySlug.get(\`\${stateAbbr.toLowerCase()}/\${slug}\`);
}

/** Get all unique state abbreviations that have neighborhood pages */
export function getNeighborhoodStates(): string[] {
  return [..._byState.keys()];
}
`;

  writeFileSync('src/data/neighborhood-pages.ts', ts, 'utf-8');
  console.log(`  ✅ Written src/data/neighborhood-pages.ts (${pages.length.toLocaleString()} entries, ${stateCounts.size} states)`);
}

// ── Step 5: Generate TypeScript output ──
function generateTS(neighborhoods) {
  console.log('📝 Generating src/data/neighborhoods.ts...');

  // Sort by ZIP for deterministic output
  const sortedZips = [...neighborhoods.keys()].sort();

  let entries = '';
  for (const zip of sortedZips) {
    const d = neighborhoods.get(zip);
    const nArr = `[${d.n.map(n => `'${n.replace(/'/g, "\\'")}'`).join(',')}]`;
    let line = `'${zip}':{n:${nArr}`;
    if (d.m) {
      line += `,m:'${d.m.replace(/'/g, "\\'")}',ms:'${d.ms}'`;
    }
    line += '},';
    entries += line + '\n';
  }

  const ts = `// ============================================================
// Internet 4 ALL — Neighborhood Data
// AUTO-GENERATED — Maps ZIP codes to their neighborhoods,
// communities, and metro parent cities.
// Generated: ${new Date().toISOString().split('T')[0]}
// Data source: GeoNames (CC BY 4.0) + US Census + USPS
// Enriched ZIPs: ${neighborhoods.size.toLocaleString()}
// DO NOT EDIT — regenerate with: node scripts/generate-neighborhoods.mjs
// ============================================================

export interface ZipNeighborhoodData {
  /** Neighborhood/community names, primary first */
  n: string[];
  /** Metro parent city name (if ZIP is in a suburb) */
  m?: string;
  /** Metro parent city page slug */
  ms?: string;
}

/**
 * Sparse map: only ZIPs with meaningful neighborhood data get entries.
 * If a ZIP is not in this map, the USPS city name is the best label.
 */
export const zipNeighborhoods: Record<string, ZipNeighborhoodData> = {
${entries}};

/** Get neighborhood data for a ZIP, or undefined if no enrichment exists */
export function getNeighborhoodData(zip: string): ZipNeighborhoodData | undefined {
  return zipNeighborhoods[zip];
}
`;

  writeFileSync('src/data/neighborhoods.ts', ts, 'utf-8');
  console.log(`  ✅ Written src/data/neighborhoods.ts (${neighborhoods.size.toLocaleString()} entries)`);
}

// ── Main ──
async function main() {
  console.log('🏘️  Internet 4 ALL — Neighborhood Data Generator\n');

  const geoPlaces = await loadGeoNames();
  const zips = await loadZipCentroids();
  const spatialIndex = buildSpatialGrid(geoPlaces);
  const neighborhoods = matchNeighborhoods(zips, spatialIndex);
  generateTS(neighborhoods);

  // Build reverse map for dedicated neighborhood pages
  const nhPages = buildNeighborhoodPages(neighborhoods, zips, geoPlaces);
  generateNeighborhoodPagesTS(nhPages);

  // Print sample output for verification
  console.log('\n📊 Sample ZIP entries:');
  const samples = ['45240', '45205', '10001', '90210', '30301', '60601', '77001', '98101', '33101'];
  for (const zip of samples) {
    const d = neighborhoods.get(zip);
    if (d) {
      console.log(`  ${zip}: ${d.n.join(', ')}${d.m ? ` (metro: ${d.m})` : ''}`);
    } else {
      const z = zips.find(z => z.zip === zip);
      console.log(`  ${zip}: ${z ? z.city + ' (no neighborhoods)' : 'not found'}`);
    }
  }

  console.log('\n📊 Sample neighborhood pages:');
  const nhSamples = nhPages.filter(p =>
    ['Forest Park', 'Price Hill', 'East Price Hill', 'Astoria', 'Capitol Hill', 'Koreatown'].includes(p.name)
  ).slice(0, 8);
  for (const p of nhSamples) {
    console.log(`  /${p.state.toLowerCase()}/${p.slug} → ${p.name}, ${p.state} (${p.zips.length} ZIPs, parent: ${p.parentCity})`);
  }

  console.log('\n✅ Done!');
}

main().catch(err => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
