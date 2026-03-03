#!/usr/bin/env node
// ============================================================
// Internet 4 ALL — Location Data Generator
// Pulls real data from US Census Bureau API + USPS ZIP database
// Generates src/data/locations.ts with ~5,000 cities & ~40,000 ZIPs
// ============================================================

import { writeFileSync } from 'fs';
import { get as httpsGet } from 'https';
import { get as httpGet } from 'http';

// ----- State FIPS codes (Census Bureau uses these) -----
const STATE_FIPS = {
  AL:'01',AK:'02',AZ:'04',AR:'05',CA:'06',CO:'08',CT:'09',DE:'10',DC:'11',
  FL:'12',GA:'13',HI:'15',ID:'16',IL:'17',IN:'18',IA:'19',KS:'20',KY:'21',
  LA:'22',ME:'23',MD:'24',MA:'25',MI:'26',MN:'27',MS:'28',MO:'29',MT:'30',
  NE:'31',NV:'32',NH:'33',NJ:'34',NM:'35',NY:'36',NC:'37',ND:'38',OH:'39',
  OK:'40',OR:'41',PA:'42',RI:'44',SC:'45',SD:'46',TN:'47',TX:'48',UT:'49',
  VT:'50',VA:'51',WA:'53',WV:'54',WI:'55',WY:'56'
};

const FIPS_TO_STATE = Object.fromEntries(Object.entries(STATE_FIPS).map(([k,v]) => [v, k]));

// ----- Fetch helper with retry -----
function fetchUrl(url, maxRetries = 3) {
  return new Promise((resolve, reject) => {
    const getter = url.startsWith('https') ? httpsGet : httpGet;
    const attempt = (retryCount) => {
      getter(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return attempt(retryCount); // follow redirect
        }
        if (res.statusCode !== 200) {
          if (retryCount < maxRetries) {
            setTimeout(() => attempt(retryCount + 1), 1000 * (retryCount + 1));
            return;
          }
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', (err) => {
        if (retryCount < maxRetries) {
          setTimeout(() => attempt(retryCount + 1), 1000 * (retryCount + 1));
        } else {
          reject(err);
        }
      });
    };
    attempt(0);
  });
}

async function fetchJson(url) {
  const text = await fetchUrl(url);
  return JSON.parse(text);
}

// ----- Step 1: Load ZIP code data from the installed zipcodes package -----
async function loadZipData() {
  console.log('📦 Loading ZIP code database...');
  // The zipcodes package stores data in lib/codes.js as a plain object
  // We dynamically import it
  let zipModule;
  try {
    zipModule = await import('zipcodes');
  } catch (e) {
    console.error('zipcodes package not found, installing...');
    const { execSync } = await import('child_process');
    execSync('npm install zipcodes --no-save', { stdio: 'inherit' });
    zipModule = await import('zipcodes');
  }
  
  const zipcodes = zipModule.default || zipModule;
  
  // Collect all ZIPs by iterating all states
  const allStates = Object.keys(STATE_FIPS);
  const cityMap = new Map(); // "city|state" -> { city, state, zips: [], lat, lng }
  let totalZips = 0;
  
  for (const state of allStates) {
    const stateZips = zipcodes.lookupByState(state);
    if (!stateZips || !stateZips.length) {
      console.warn(`  ⚠️  No ZIPs found for ${state}`);
      continue;
    }
    
    for (const z of stateZips) {
      if (!z.city || !z.zip) continue;
      totalZips++;
      const key = `${z.city}|${z.state}`;
      if (!cityMap.has(key)) {
        cityMap.set(key, {
          city: z.city,
          state: z.state,
          zips: [],
          lat: z.latitude,
          lng: z.longitude,
        });
      }
      cityMap.get(key).zips.push(z.zip);
    }
  }
  
  console.log(`  ✅ Loaded ${totalZips.toLocaleString()} ZIP codes across ${cityMap.size.toLocaleString()} cities`);
  return cityMap;
}

// ----- Step 2: Fetch Census population data -----
async function fetchCensusPopulation() {
  console.log('🏛️  Fetching Census Bureau population data...');
  const allPlaces = new Map(); // "CityName|ST" -> population
  
  const stateEntries = Object.entries(STATE_FIPS);
  const BATCH_SIZE = 8;
  
  for (let i = 0; i < stateEntries.length; i += BATCH_SIZE) {
    const batch = stateEntries.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async ([stateAbbr, fips]) => {
      const url = `https://api.census.gov/data/2022/acs/acs5?get=NAME,B01003_001E&for=place:*&in=state:${fips}`;
      try {
        const data = await fetchJson(url);
        // data[0] is header, rest are rows: ["Birmingham city, Alabama", "200733", "01", "07000"]
        const places = [];
        for (let r = 1; r < data.length; r++) {
          const row = data[r];
          const fullName = row[0];
          const pop = parseInt(row[1]) || 0;
          
          // Extract city name: remove "city", "town", "village", "CDP", "borough", "municipality" suffix
          let name = fullName.split(',')[0]
            .replace(/ city$/i, '')
            .replace(/ town$/i, '')
            .replace(/ village$/i, '')
            .replace(/ CDP$/i, '')
            .replace(/ borough$/i, '')
            .replace(/ municipality$/i, '')
            .replace(/ (urban|metro) township$/i, '')
            .replace(/ township$/i, '')
            .replace(/ comunidad$/i, '')
            .replace(/ zona urbana$/i, '')
            .trim();
          
          places.push({ name, population: pop, state: stateAbbr });
          allPlaces.set(`${name}|${stateAbbr}`, pop);
        }
        console.log(`  ✅ ${stateAbbr}: ${places.length} places`);
        return places;
      } catch (e) {
        console.error(`  ❌ ${stateAbbr}: ${e.message}`);
        return [];
      }
    });
    
    await Promise.all(promises);
    
    // Small delay between batches to be nice to Census API
    if (i + BATCH_SIZE < stateEntries.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  console.log(`  ✅ Total Census places: ${allPlaces.size.toLocaleString()}`);
  return allPlaces;
}

// ----- Step 3: Merge ZIP data with Census population -----
function mergeData(cityMap, censusPop) {
  console.log('🔗 Merging ZIP codes with Census population data...');
  
  const cities = [];
  let matched = 0, estimated = 0;
  
  for (const [key, data] of cityMap) {
    const { city, state, zips, lat, lng } = data;
    
    // Try exact match first
    let pop = censusPop.get(`${city}|${state}`);
    
    // Try common name variations
    if (!pop) {
      // "St." -> "Saint", "Ft." -> "Fort", etc.
      const variations = [
        city.replace(/^St\.?\s/, 'Saint '),
        city.replace(/^Ft\.?\s/, 'Fort '),
        city.replace(/^Mt\.?\s/, 'Mount '),
        city.replace(/\bSt\.?\s/, 'Saint '),
        city.replace(/\bFt\.?\s/, 'Fort '),
        city.replace(/\bMt\.?\s/, 'Mount '),
        city.replace(/Saint\s/, 'St. '),
        city.replace(/Fort\s/, 'Ft. '),
        city.replace(/Mount\s/, 'Mt. '),
      ];
      for (const v of variations) {
        pop = censusPop.get(`${v}|${state}`);
        if (pop) break;
      }
    }
    
    if (pop) {
      matched++;
    } else {
      // Estimate population from number of ZIPs (rough: ~7,500 per ZIP code on average)
      pop = Math.max(zips.length * 7500, 1000);
      estimated++;
    }
    
    // Skip very small cities/towns (fewer than 2 ZIPs and low population)
    if (pop < 1000 && zips.length < 2) continue;
    
    cities.push({
      name: city,
      state,
      population: pop,
      zips: zips.sort(),
      lat,
      lng,
      isMetro: false, // will be set later
    });
  }
  
  console.log(`  ✅ Matched: ${matched.toLocaleString()}, Estimated: ${estimated.toLocaleString()}, Total: ${cities.length.toLocaleString()}`);
  return cities;
}

// ----- Step 4: Determine metro status and sort -----
function classifyAndSort(cities) {
  console.log('🏙️  Classifying metro areas...');
  
  // Sort by population descending
  cities.sort((a, b) => b.population - a.population);
  
  // Top 750 by population are "metro"
  const METRO_THRESHOLD = 750;
  for (let i = 0; i < Math.min(METRO_THRESHOLD, cities.length); i++) {
    cities[i].isMetro = true;
  }
  
  // Also mark any city with pop > 30,000 as metro
  for (const city of cities) {
    if (city.population >= 30000) city.isMetro = true;
  }
  
  const metroCount = cities.filter(c => c.isMetro).length;
  console.log(`  ✅ Metro cities: ${metroCount}, Total cities: ${cities.length.toLocaleString()}`);
  return cities;
}

// ----- Step 5: Calculate nearby cities using haversine distance -----
function calculateNearbyCities(cities) {
  console.log('📍 Calculating nearby city relationships...');
  
  // Haversine distance in miles
  function haversine(lat1, lng1, lat2, lng2) {
    const R = 3959; // Earth radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
  
  // Only compute nearby for cities with pop > 25,000 (keeps it manageable)
  const significantCities = cities.filter(c => c.population >= 25000);
  const MAX_NEARBY = 4;
  const MAX_DISTANCE = 150; // miles
  
  for (const city of significantCities) {
    if (!city.lat || !city.lng) continue;
    
    const distances = significantCities
      .filter(other => other !== city && other.state !== city.state || (other.state === city.state && other.name !== city.name))
      .filter(other => other.lat && other.lng)
      .map(other => ({
        slug: makeSlug(other.name, other.state),
        distance: haversine(city.lat, city.lng, other.lat, other.lng),
        pop: other.population,
      }))
      .filter(d => d.distance <= MAX_DISTANCE && d.distance > 0)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, MAX_NEARBY);
    
    city.nearbyCity = distances.map(d => d.slug);
  }
  
  const withNearby = cities.filter(c => c.nearbyCity && c.nearbyCity.length > 0).length;
  console.log(`  ✅ ${withNearby.toLocaleString()} cities have nearby links`);
  return cities;
}

// ----- Slug generator -----
function makeSlug(city, state) {
  const citySlug = city.toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${citySlug}-${state.toLowerCase()}`;
}

// ----- Step 6: Generate the TypeScript file -----
function generateTypeScript(cities) {
  console.log('📝 Generating src/data/locations.ts...');
  
  // Group cities by state for organized output
  const byState = new Map();
  for (const city of cities) {
    if (!byState.has(city.state)) byState.set(city.state, []);
    byState.get(city.state).push(city);
  }
  
  // Sort states alphabetically, cities within state by population desc
  const sortedStates = [...byState.keys()].sort();
  for (const state of sortedStates) {
    byState.get(state).sort((a, b) => b.population - a.population);
  }
  
  let totalZips = 0;
  
  // Build the city entries
  let cityEntries = '';
  for (const state of sortedStates) {
    const stateCities = byState.get(state);
    cityEntries += `\n  // --- ${state} (${stateCities.length} cities) ---\n`;
    
    for (const city of stateCities) {
      const slug = makeSlug(city.name, city.state);
      const zipStr = city.zips.map(z => `'${z}'`).join(',');
      totalZips += city.zips.length;
      
      let nearby = '';
      if (city.nearbyCity && city.nearbyCity.length > 0) {
        nearby = `, nearbyCity: [${city.nearbyCity.map(n => `'${n}'`).join(',')}]`;
      }
      
      // Escape single quotes in city names
      const safeName = city.name.replace(/'/g, "\\'");
      
      const latLng = (city.lat && city.lng) ? `, lat: ${city.lat.toFixed(4)}, lng: ${city.lng.toFixed(4)}` : '';
      cityEntries += `  { name: '${safeName}', state: '${city.state}', slug: '${slug}', population: ${city.population}, isMetro: ${city.isMetro}, zipCodes: [${zipStr}]${latLng}${nearby} },\n`;
    }
  }
  
  const ts = `// ============================================================
// Internet 4 ALL — Location Data Engine
// AUTO-GENERATED from US Census Bureau + USPS ZIP data
// Generated: ${new Date().toISOString().split('T')[0]}
// Cities: ${cities.length.toLocaleString()} | ZIP codes: ${totalZips.toLocaleString()}
// DO NOT EDIT — regenerate with: node scripts/generate-locations.mjs
// ============================================================

import { stateProviders, stateNames } from '@lib/providers';

// ----- Types -----
export interface CityData {
  name: string;
  state: string; // abbreviation
  slug: string;  // url slug: "charlotte-nc"
  population: number;
  isMetro: boolean; // top metro areas by population
  providers?: string[]; // override state-level (optional)
  zipCodes: string[];
  lat?: number;  // latitude (from ZIP centroid)
  lng?: number;  // longitude (from ZIP centroid)
  nearbyCity?: string[]; // slugs of nearby cities for interlinking
}

export interface StatePageData {
  abbr: string;
  name: string;
  slug: string; // lowercase, hyphenated: "new-york"
  providers: string[];
  cities: CityData[];
  avgSpeed?: number;
  fiberPct?: number;
  avgPrice?: number;
}

export interface ZipData {
  zip: string;
  city: string;
  state: string; // abbreviation
  citySlug: string;
  providers?: string[]; // override
}

// ----- Helpers -----
function slugifyState(name: string): string {
  return name.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ----- ${cities.length.toLocaleString()} Cities with ${totalZips.toLocaleString()} ZIP codes -----
export const cities: CityData[] = [${cityEntries}];

// ----- Build state page data -----
export function getStatePages(): StatePageData[] {
  return Object.entries(stateNames).map(([abbr, name]) => {
    const providerIds = stateProviders[abbr] || [];
    const stateCities = cities.filter(c => c.state === abbr);
    return {
      abbr,
      name,
      slug: slugifyState(name),
      providers: providerIds,
      cities: stateCities,
    };
  });
}

// ----- Build city page data -----
export function getCityPages(): CityData[] {
  return cities;
}

// ----- Build ZIP page data -----
export function getZipPages(): ZipData[] {
  const result: ZipData[] = [];
  for (const city of cities) {
    for (const zip of city.zipCodes) {
      result.push({
        zip,
        city: city.name,
        state: city.state,
        citySlug: city.slug,
        providers: city.providers,
      });
    }
  }
  return result;
}

// ----- Get providers for a location -----
export function getProvidersForState(abbr: string): string[] {
  return stateProviders[abbr] || [];
}

export function getProvidersForCity(city: CityData): string[] {
  return city.providers || stateProviders[city.state] || [];
}

// ----- Get nearby cities for interlinking -----
export function getNearbyCities(city: CityData): CityData[] {
  if (!city.nearbyCity) return [];
  return city.nearbyCity
    .map(slug => cities.find(c => c.slug === slug))
    .filter((c): c is CityData => !!c);
}

// ----- Get state from abbreviation -----
export function getStateName(abbr: string): string {
  return stateNames[abbr] || abbr;
}

export function getStateSlug(abbr: string): string {
  const name = stateNames[abbr];
  return name ? slugifyState(name) : abbr.toLowerCase();
}

// ----- Get all cities in a state -----
export function getCitiesInState(abbr: string): CityData[] {
  return cities.filter(c => c.state === abbr);
}

// ----- Get all metro cities -----
export function getMetroCities(): CityData[] {
  return cities.filter(c => c.isMetro);
}
`;
  
  writeFileSync('src/data/locations.ts', ts, 'utf-8');
  
  console.log(`\n🎉 Generated src/data/locations.ts`);
  console.log(`   ${cities.length.toLocaleString()} cities across ${sortedStates.length} states`);
  console.log(`   ${totalZips.toLocaleString()} ZIP codes`);
  console.log(`   ${cities.filter(c => c.isMetro).length} metro areas`);
  console.log(`   ${cities.filter(c => c.nearbyCity?.length > 0).length} cities with nearby links`);
}

// ----- Main -----
async function main() {
  console.log('🚀 Internet 4 ALL — Location Data Generator\n');
  
  try {
    // Step 1: Load ZIP database
    const cityMap = await loadZipData();
    
    // Step 2: Fetch Census population data
    const censusPop = await fetchCensusPopulation();
    
    // Step 3: Merge data
    let cities = mergeData(cityMap, censusPop);
    
    // Step 4: Classify metro/non-metro
    cities = classifyAndSort(cities);
    
    // Step 5: Calculate nearby cities
    cities = calculateNearbyCities(cities);
    
    // Step 6: Generate TypeScript
    generateTypeScript(cities);
    
    console.log('\n✅ Done! Run `npm run build` to generate all pages.');
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
