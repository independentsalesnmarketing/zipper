import type { APIRoute } from 'astro';
import { zipCoverage } from '@data/zip-coverage';

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(zipCoverage), {
    headers: { 'Content-Type': 'application/json' },
  });
};
