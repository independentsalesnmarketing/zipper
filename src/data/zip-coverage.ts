// ============================================================
// Internet 4 ALL — ZIP-Level Provider Coverage Data
// Parses provider ZIP files at build time (Astro SSG runs in Node)
// ============================================================

import { readFileSync } from 'fs';
import { resolve } from 'path';

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

// ── Parse helpers ──
function readTSV(filename: string): string[][] {
  const filePath = resolve(process.cwd(), filename);
  try {
    const raw = readFileSync(filePath, 'utf-8');
    return raw.trim().split('\n').map(line => line.split('\t'));
  } catch {
    console.warn(`[zip-coverage] Could not read ${filename}, skipping`);
    return [];
  }
}

function parseSimple(
  filename: string,
  providerId: string,
  fiber: boolean,
  hasHeader: boolean,
): ZipCoverageEntry[] {
  const rows = readTSV(filename);
  if (!rows.length) return [];
  const startIdx = hasHeader ? 1 : 0;
  const seen = new Set<string>();
  const results: ZipCoverageEntry[] = [];
  for (let i = startIdx; i < rows.length; i++) {
    const zip = (rows[i][0] || '').trim().padStart(5, '0');
    if (!/^\d{5}$/.test(zip) || seen.has(zip)) continue;
    seen.add(zip);
    results.push({ id: providerId, fiber });
    // Store zip in a way we can retrieve
    (results[results.length - 1] as any)._zip = zip;
  }
  return results;
}

// ── Build the map ──
function buildCoverageMap(): Record<string, ZipCoverageEntry[]> {
  const map: Record<string, ZipCoverageEntry[]> = {};

  function add(zip: string, entry: ZipCoverageEntry) {
    if (!map[zip]) map[zip] = [];
    // Avoid duplicate provider per ZIP
    if (map[zip].some(e => e.id === entry.id)) return;
    map[zip].push(entry);
  }

  // --- Spectrum: ZIP_Code\tCITY_NAME (has header) ---
  {
    const rows = readTSV('SpectrumZips.txt');
    const seen = new Set<string>();
    for (let i = 1; i < rows.length; i++) {
      const zip = (rows[i][0] || '').trim().padStart(5, '0');
      if (!/^\d{5}$/.test(zip) || seen.has(zip)) continue;
      seen.add(zip);
      add(zip, { id: 'spectrum', fiber: false });
    }
  }

  // --- Kinetic/Windstream: ZIP_Code\tCITY\tSTATE_ABBREV\tPRODUCT (has header) ---
  {
    const rows = readTSV('KineticZips.txt');
    const seen = new Set<string>();
    for (let i = 1; i < rows.length; i++) {
      const zip = (rows[i][0] || '').trim().padStart(5, '0');
      if (!/^\d{5}$/.test(zip) || seen.has(zip)) continue;
      seen.add(zip);
      add(zip, { id: 'windstream', fiber: false });
    }
  }

  // --- Optimum: ZIP_Code\tCITY_NAME\tST_ABBREV(region)\tSERVICE_Avail (has header) ---
  {
    const rows = readTSV('OptimumZips.txt');
    const seen = new Set<string>();
    for (let i = 1; i < rows.length; i++) {
      const zip = (rows[i][0] || '').trim().padStart(5, '0');
      if (!/^\d{5}$/.test(zip) || seen.has(zip)) continue;
      seen.add(zip);
      const region = (rows[i][2] || '').trim();
      const tier = (rows[i][3] || '').trim();
      const fiber = tier === '8 GIG' || tier === '1 GIG';
      add(zip, { id: 'optimum', fiber, tier: tier || undefined, region: region || undefined });
    }
  }

  // --- Altafiber: ZIP_Code\tCITY_NAME\t"State - XX"\tSERVICE_Avail (has header) ---
  {
    const rows = readTSV('AltafiberZips.txt');
    const seen = new Set<string>();
    for (let i = 1; i < rows.length; i++) {
      const zip = (rows[i][0] || '').trim().padStart(5, '0');
      if (!/^\d{5}$/.test(zip) || seen.has(zip)) continue;
      seen.add(zip);
      add(zip, { id: 'altafiber', fiber: true });
    }
  }

  // --- Standard fiber files ---
  const fiberFiles: [string, string, boolean][] = [
    ['FrontierFiberZips.txt', 'frontier', false],  // no header row
    ['At&tFiberZips.txt', 'att', true],
    ['BrightspeedFiberZip.txt', 'brightspeed', true],
    ['TFiberZips.txt', 'tmobile', true],
  ];

  for (const [filename, providerId, hasHeader] of fiberFiles) {
    const rows = readTSV(filename);
    if (!rows.length) continue;
    const startIdx = hasHeader || /zip/i.test(rows[0]?.[0] || '') ? 1 : 0;
    const seen = new Set<string>();
    for (let i = startIdx; i < rows.length; i++) {
      const zip = (rows[i][0] || '').trim().padStart(5, '0');
      if (!/^\d{5}$/.test(zip) || seen.has(zip)) continue;
      seen.add(zip);
      add(zip, { id: providerId, fiber: true });
    }
  }

  return map;
}

// Build once at module load (build time)
export const zipCoverage: Record<string, ZipCoverageEntry[]> = buildCoverageMap();
