// Builds a compact ZIP → [lat, lng] lookup at build time.
// Served as /data/zip-geo.json — fetched client-side for FCC API calls.
// Uses the `zipcodes` npm package which is already a project dependency.
import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  // Dynamic import — zipcodes is a CJS module, access its lookup function
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const zips = require('zipcodes');
  const allZips: string[] = zips.codes || Object.keys(zips.zipCodes || {});

  const lookup: Record<string, [number, number]> = {};
  for (const z of allZips) {
    const info = zips.lookup(z);
    if (info && info.latitude != null && info.longitude != null) {
      // Round to 4 decimal places to keep the file compact (~600KB raw, ~200KB gzip)
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
