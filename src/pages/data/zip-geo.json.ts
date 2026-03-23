// Builds a compact ZIP → [lat, lng] lookup at build time.
// Served as /data/zip-geo.json — fetched client-side for FCC API calls.
// Only includes ZIPs that the site actually serves (from getZipPages).
import { createRequire } from 'node:module';
import type { APIRoute } from 'astro';
import { getZipPages } from '@data/locations';

// `zipcodes` is a CommonJS module. createRequire bridges ESM → CJS correctly.
const require = createRequire(import.meta.url);

export const GET: APIRoute = () => {
  const zips = require('zipcodes');

  // Use the site's own ZIP list — avoids relying on undocumented package internals.
  // De-duplicate in case getZipPages returns the same ZIP from multiple cities.
  const uniqueZips = [...new Set(getZipPages().map(z => z.zip))];

  const lookup: Record<string, [number, number]> = {};
  for (const z of uniqueZips) {
    const info = zips.lookup(z);
    if (info && info.latitude != null && info.longitude != null) {
      // Round to 4 decimal places to keep the file compact
      lookup[z] = [
        Math.round(info.latitude * 1e4) / 1e4,
        Math.round(info.longitude * 1e4) / 1e4,
      ];
    }
  }

  return new Response(JSON.stringify(lookup), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
