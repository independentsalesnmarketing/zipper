#!/usr/bin/env node
/**
 * Research FCC Broadband Data Collection (BDC) bulk download options.
 * 
 * The FCC publishes Fixed Broadband data at:
 * https://broadbandmap.fcc.gov/data-download/fixed
 * 
 * This script attempts to:
 * 1. Probe known FCC BDC API endpoints for bulk data
 * 2. Check the BroadbandMap.com API (the one we already use)
 * 3. Test alternate data sources
 */

const endpoints = [
  // FCC BDC public API endpoints (documented)
  { name: 'FCC BDC API - Fixed broadband', url: 'https://broadbandmap.fcc.gov/api/public/map/listAvailabilityFixed?latitude=39.91&longitude=-86.103&category=residential&speed_download=25000&speed_upload=3000&technology_code=0' },
  
  // FCC BDC data download catalog
  { name: 'FCC BDC Download Catalog', url: 'https://broadbandmap.fcc.gov/api/public/data-download' },
  
  // FCC BDC download - fixed broadband filing (known pattern)
  { name: 'FCC BDC Filing List', url: 'https://broadbandmap.fcc.gov/api/public/data-download/fixed' },
  
  // FCC Open Data
  { name: 'FCC Open Data JSONL', url: 'https://opendata.fcc.gov/resource/4kuc-phrr.json?$limit=5' },
  
  // BroadbandMap.com - our existing API (test rate limit)
  { name: 'BroadbandMap.com API', url: 'https://broadbandmap.com/api/v1/location/internet?lat=39.91&lng=-86.103' },
  
  // FCC BDC National Broadband Map API (alternate)
  { name: 'FCC NBM Location Summary', url: 'https://broadbandmap.fcc.gov/location-summary/fixed?location_id=1100232166893&addr=Indianapolis%2C+IN&lat=39.7684&lon=-86.1581&zoom=12' },
  
  // FCC USAC broadband data
  { name: 'FCC USAC Data', url: 'https://data.usac.org/publicreports/FundBeneficiaryFiler/FundBeneficiaryFiler/GetData' },

  // FCC BDC bulk data - check availability listing  
  { name: 'FCC BDC Availability', url: 'https://broadbandmap.fcc.gov/api/public/map/listAvailabilityFixed?latitude=39.91&longitude=-86.103&category=residential&speed_download=0&speed_upload=0&technology_code=0' },
];

async function probe(endpoint) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  
  try {
    const resp = await fetch(endpoint.url, {
      signal: controller.signal,
      headers: { 
        'User-Agent': 'Mozilla/5.0 (research)',
        'Accept': 'application/json, text/html, */*'
      }
    });
    clearTimeout(timeout);
    
    const contentType = resp.headers.get('content-type') || '';
    const status = resp.status;
    
    let bodyPreview = '';
    try {
      const text = await resp.text();
      bodyPreview = text.substring(0, 1500);
      
      // Try to parse as JSON
      try {
        const json = JSON.parse(text);
        if (Array.isArray(json)) {
          bodyPreview = `[Array of ${json.length} items] First item keys: ${json[0] ? Object.keys(json[0]).join(', ') : 'empty'}`;
          if (json[0]) bodyPreview += '\nFirst item: ' + JSON.stringify(json[0], null, 2).substring(0, 800);
        } else if (typeof json === 'object') {
          const keys = Object.keys(json);
          bodyPreview = `{Object with keys: ${keys.join(', ')}}`;
          bodyPreview += '\n' + JSON.stringify(json, null, 2).substring(0, 800);
        }
      } catch { /* not JSON */ }
    } catch { bodyPreview = '[could not read body]'; }
    
    return { name: endpoint.name, status, contentType, bodyPreview, error: null };
  } catch (e) {
    clearTimeout(timeout);
    return { name: endpoint.name, status: 0, contentType: '', bodyPreview: '', error: e.message };
  }
}

async function main() {
  console.log('=== FCC Broadband Data Research ===\n');
  
  for (const ep of endpoints) {
    console.log(`--- ${ep.name} ---`);
    console.log(`URL: ${ep.url}`);
    const result = await probe(ep);
    if (result.error) {
      console.log(`ERROR: ${result.error}`);
    } else {
      console.log(`Status: ${result.status}`);
      console.log(`Content-Type: ${result.contentType}`);
      console.log(`Response:\n${result.bodyPreview}`);
    }
    console.log();
  }
}

main().catch(console.error);
