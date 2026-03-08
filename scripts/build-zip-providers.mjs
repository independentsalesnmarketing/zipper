#!/usr/bin/env node
// ============================================================
// Internet 4 ALL — ZIP-Level Provider Coverage Builder
// Parses provider-specific ZIP text files and generates
// src/data/zip-coverage.ts — a per-ZIP confirmed provider map.
//
// Usage: node scripts/build-zip-providers.mjs
// ============================================================

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Load zipcodes package for state lookup (Spectrum has no state column) ──
let zipcodes;
try {
  const mod = await import('zipcodes');
  zipcodes = mod.default || mod;
} catch {
  console.error('zipcodes package not found. Run: npm install zipcodes --no-save');
  process.exit(1);
}

function lookupState(zip) {
  const info = zipcodes.lookup(zip);
  return info ? info.state : null;
}

// ── Parse helpers ──
function readTSV(filename) {
  const path = resolve(ROOT, filename);
  const raw = readFileSync(path, 'utf-8');
  return raw.trim().split('\n').map(line => line.split('\t'));
}

// ── File parsers — each returns [{zip, providerId, fiber, tier?, region?}] ──

function parseSpectrum() {
  const rows = readTSV('SpectrumZips.txt');
  // Format: ZIP_Code\tCITY_NAME — has header row
  const results = [];
  for (let i = 1; i < rows.length; i++) {
    const zip = (rows[i][0] || '').trim().padStart(5, '0');
    if (!/^\d{5}$/.test(zip)) continue;
    results.push({ zip, providerId: 'spectrum', fiber: false });
  }
  // Deduplicate (file has duplicate ZIPs with different city names)
  const seen = new Set();
  return results.filter(r => {
    if (seen.has(r.zip)) return false;
    seen.add(r.zip);
    return true;
  });
}

function parseKinetic() {
  const rows = readTSV('KineticZips.txt');
  // Format: ZIP_Code\tCITY\tSTATE_ABBREV\tPRODUCT — has header row
  // CITY has state prefix like "TX-SUGARLAND", PRODUCT is blank
  const results = [];
  const seen = new Set();
  for (let i = 1; i < rows.length; i++) {
    const zip = (rows[i][0] || '').trim().padStart(5, '0');
    if (!/^\d{5}$/.test(zip) || seen.has(zip)) continue;
    seen.add(zip);
    results.push({ zip, providerId: 'windstream', fiber: false });
  }
  return results;
}

function parseOptimum() {
  const rows = readTSV('OptimumZips.txt');
  // Format: ZIP_Code\tCITY_NAME\tST_ABBREV\tSERVICE_Avail — has header row
  // ST_ABBREV is region name (New York, Tri-State, Appalachia, etc.)
  // SERVICE_Avail: "8 GIG", "1 GIG", "500 MEG"
  const results = [];
  const seen = new Set();
  for (let i = 1; i < rows.length; i++) {
    const zip = (rows[i][0] || '').trim().padStart(5, '0');
    if (!/^\d{5}$/.test(zip) || seen.has(zip)) continue;
    seen.add(zip);
    const region = (rows[i][2] || '').trim();
    const tier = (rows[i][3] || '').trim();
    const fiber = tier === '8 GIG' || tier === '1 GIG';
    results.push({ zip, providerId: 'optimum', fiber, tier, region });
  }
  return results;
}

function parseAltafiber() {
  const rows = readTSV('AltafiberZips.txt');
  // Format: ZIP_Code\tCITY_NAME\tST_ABBREV\tSERVICE_Avail — has header row
  // ST_ABBREV: "Kentucky - KY", "Ohio - OH", "Indiana - IN"
  const results = [];
  const seen = new Set();
  for (let i = 1; i < rows.length; i++) {
    const zip = (rows[i][0] || '').trim().padStart(5, '0');
    if (!/^\d{5}$/.test(zip) || seen.has(zip)) continue;
    seen.add(zip);
    results.push({ zip, providerId: 'altafiber', fiber: true });
  }
  return results;
}

function parseStandardFiber(filename, providerId) {
  const rows = readTSV(filename);
  // Check if first row is a header (contains "ZIP" in first cell)
  const startIdx = /zip/i.test(rows[0]?.[0] || '') ? 1 : 0;
  const results = [];
  const seen = new Set();
  for (let i = startIdx; i < rows.length; i++) {
    const zip = (rows[i][0] || '').trim().padStart(5, '0');
    if (!/^\d{5}$/.test(zip) || seen.has(zip)) continue;
    seen.add(zip);
    results.push({ zip, providerId, fiber: true });
  }
  return results;
}

// ── Main ──

console.log('🔧 Building ZIP-level provider coverage data...\n');

const allEntries = [
  ...parseSpectrum(),
  ...parseKinetic(),
  ...parseOptimum(),
  ...parseAltafiber(),
  ...parseStandardFiber('FrontierFiberZips.txt', 'frontier'),
  ...parseStandardFiber('At&tFiberZips.txt', 'att'),
  ...parseStandardFiber('BrightspeedFiberZip.txt', 'brightspeed'),
  ...parseStandardFiber('TFiberZips.txt', 'tmobile'),
];

// Group by ZIP
const byZip = new Map();
for (const entry of allEntries) {
  if (!byZip.has(entry.zip)) byZip.set(entry.zip, []);
  byZip.get(entry.zip).push(entry);
}

// Stats
const providerCounts = {};
for (const entry of allEntries) {
  providerCounts[entry.providerId] = (providerCounts[entry.providerId] || 0) + 1;
}

console.log('Provider ZIP counts:');
for (const [id, count] of Object.entries(providerCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${id}: ${count.toLocaleString()} ZIPs`);
}
console.log(`\nTotal unique ZIPs with coverage data: ${byZip.size.toLocaleString()}`);

// Build output
let ts = `// ============================================================
// Internet 4 ALL — ZIP-Level Provider Coverage Data
// AUTO-GENERATED — do not edit manually
// Generated: ${new Date().toISOString().split('T')[0]}
// ZIPs with data: ${byZip.size.toLocaleString()}
// Run: node scripts/build-zip-providers.mjs
// ============================================================

export interface ZipCoverageEntry {
  /** Provider ID matching providers.json */
  id: string;
  /** True if confirmed fiber service */
  fiber: boolean;
  /** Optimum-only: speed tier (e.g. "8 GIG", "1 GIG", "500 MEG") */
  tier?: string;
  /** Optimum-only: regional network name */
  region?: string;
}

export const zipCoverage: Record<string, ZipCoverageEntry[]> = {\n`;

// Sort ZIPs for deterministic output
const sortedZips = [...byZip.keys()].sort();
for (const zip of sortedZips) {
  const entries = byZip.get(zip);
  const items = entries.map(e => {
    let obj = `{id:'${e.providerId}',fiber:${e.fiber}`;
    if (e.tier) obj += `,tier:'${e.tier}'`;
    if (e.region) obj += `,region:'${e.region}'`;
    obj += '}';
    return obj;
  });
  ts += `'${zip}':[${items.join(',')}],\n`;
}

ts += `};\n`;

const outPath = resolve(ROOT, 'src/data/zip-coverage.ts');
writeFileSync(outPath, ts, 'utf-8');
console.log(`\n✅ Written to ${outPath}`);
