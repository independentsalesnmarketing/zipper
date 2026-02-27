// Test BroadbandMap API for ZIP 45240 (Cincinnati, OH)
const LAT = 39.2851;
const LNG = -84.5288;

async function test() {
  console.log(`\n=== Testing BroadbandMap API for ZIP 45240 (${LAT}, ${LNG}) ===\n`);
  
  try {
    const resp = await fetch(`https://broadbandmap.com/api/v1/location/internet?lat=${LAT}&lng=${LNG}`);
    if (!resp.ok) {
      console.error('HTTP Error:', resp.status, resp.statusText);
      const text = await resp.text();
      console.error('Body:', text.slice(0, 500));
      return;
    }
    
    const data = await resp.json();
    console.log('API Response count:', data.count);
    console.log('H3 hex:', data.h3_hex);
    console.log('\nProviders returned by API:');
    console.log('─'.repeat(80));
    
    if (data.providers && data.providers.length > 0) {
      data.providers.forEach((p, i) => {
        console.log(`  ${i+1}. ${p.name.padEnd(30)} | ${(p.technology || '?').padEnd(20)} | Down: ${String(p.max_download_mbps || '?').padEnd(6)} Mbps | Up: ${p.max_upload_mbps || '?'} Mbps`);
      });
    } else {
      console.log('  (no providers returned)');
    }
    
    // Now check which of these match our partner list
    const PARTNERS = ['Spectrum','Verizon','T-Mobile','AT&T','Windstream','Optimum','Frontier','EarthLink','Brightspeed','altafiber'];
    const NAME_MAP = {
      'charter': 'Spectrum', 'spectrum': 'Spectrum',
      'at&t': 'AT&T', 'att': 'AT&T',
      'verizon': 'Verizon',
      't-mobile': 'T-Mobile', 'tmobile': 'T-Mobile',
      'windstream': 'Windstream', 'kinetic': 'Windstream',
      'optimum': 'Optimum', 'altice': 'Optimum', 'suddenlink': 'Optimum',
      'frontier': 'Frontier',
      'earthlink': 'EarthLink',
      'brightspeed': 'Brightspeed', 'centurylink': 'Brightspeed', 'lumen': 'Brightspeed',
      'altafiber': 'altafiber', 'cincinnati bell': 'altafiber',
    };
    
    console.log('\n─'.repeat(80));
    console.log('\nPartner matches found:');
    
    const matched = new Set();
    if (data.providers) {
      data.providers.forEach(p => {
        const lower = p.name.toLowerCase().trim();
        for (const [key, partner] of Object.entries(NAME_MAP)) {
          if (lower.includes(key)) {
            matched.add(partner);
            console.log(`  ✓ "${p.name}" → ${partner}`);
            break;
          }
        }
      });
    }
    
    console.log('\nPartners NOT in API results:');
    PARTNERS.forEach(p => {
      if (!matched.has(p)) console.log(`  ✗ ${p}`);
    });
    
    console.log('\nExpected for 45240 (Cincinnati, OH): altafiber, Spectrum, AT&T should be present');
    
  } catch (e) {
    console.error('Fetch error:', e.message);
  }
}

test();
