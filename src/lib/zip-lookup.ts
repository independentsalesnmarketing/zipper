// ============================================================
// Internet 4 ALL — ZIP Coverage Lookup Helpers
// Thin layer between zip-coverage.ts data and page templates
// ============================================================

import { zipCoverage, type ZipCoverageEntry } from '@data/zip-coverage';

/** Get confirmed provider entries for a ZIP code */
export function getConfirmedProviders(zip: string): ZipCoverageEntry[] {
  return zipCoverage[zip] || [];
}

/** Check if a specific provider is confirmed in a ZIP */
export function isProviderConfirmed(zip: string, providerId: string): boolean {
  return (zipCoverage[zip] || []).some(e => e.id === providerId);
}

/** Get IDs of confirmed fiber providers in a ZIP */
export function getConfirmedFiberProviders(zip: string): string[] {
  return (zipCoverage[zip] || []).filter(e => e.fiber).map(e => e.id);
}

/** Get Optimum tier for a ZIP (e.g. "8 GIG"), or undefined */
export function getOptimumTier(zip: string): string | undefined {
  return (zipCoverage[zip] || []).find(e => e.id === 'optimum')?.tier;
}

/** Get Optimum region for a ZIP (e.g. "Tri-State"), or undefined */
export function getOptimumRegion(zip: string): string | undefined {
  return (zipCoverage[zip] || []).find(e => e.id === 'optimum')?.region;
}

/** Scan nearby ZIPs for the first one that has confirmed fiber */
export function getNearestFiberZip(
  currentZip: string,
  siblingZips: string[],
): { zip: string; providerIds: string[] } | null {
  for (const z of siblingZips) {
    if (z === currentZip) continue;
    const fiberIds = getConfirmedFiberProviders(z);
    if (fiberIds.length > 0) {
      return { zip: z, providerIds: fiberIds };
    }
  }
  return null;
}

/** Aggregate confirmed provider IDs across multiple ZIPs (for city pages) */
export function getConfirmedProvidersForZips(zips: string[]): Set<string> {
  const ids = new Set<string>();
  for (const zip of zips) {
    for (const entry of (zipCoverage[zip] || [])) {
      ids.add(entry.id);
    }
  }
  return ids;
}

/** Aggregate confirmed fiber provider IDs across multiple ZIPs (for city pages) */
export function getConfirmedFiberForZips(zips: string[]): Set<string> {
  const ids = new Set<string>();
  for (const zip of zips) {
    for (const entry of (zipCoverage[zip] || [])) {
      if (entry.fiber) ids.add(entry.id);
    }
  }
  return ids;
}

/** Get per-ZIP coverage summary for city pages */
export function getZipCoverageSummary(zips: string[]): {
  zip: string;
  providers: { id: string; fiber: boolean }[];
}[] {
  return zips
    .map(zip => ({
      zip,
      providers: (zipCoverage[zip] || []).map(e => ({ id: e.id, fiber: e.fiber })),
    }))
    .filter(z => z.providers.length > 0);
}
