import fs from 'fs';

const files = ['AllconnectKeywords.txt','BroadbandnowKeywords.txt','BroadbandsearchKeywords.txt','EasyconnectKeywords.txt','SmartmoveKeywords.txt'];

// Merge all keywords, dedup by keyword name (keep highest volume)
const kwMap = {};
for (const f of files) {
  const lines = fs.readFileSync(f,'utf8').split('\n').slice(1).filter(l=>l.trim());
  for (const line of lines) {
    const parts = line.split('\t');
    const kw = parts[0]?.trim().toLowerCase();
    const vol = parseInt(parts[2]?.replace(/,/g,'')) || 0;
    const comp = parts[5]?.trim() || '';
    const cpc_low = parts[7]?.trim() || '';
    const cpc_high = parts[8]?.trim() || '';
    if (!kw) continue;
    if (!kwMap[kw] || kwMap[kw].vol < vol) {
      kwMap[kw] = { kw, vol, comp, cpc_low, cpc_high, source: f.replace('Keywords.txt','') };
    }
  }
}

const allKws = Object.values(kwMap).sort((a,b)=>b.vol-a.vol);
console.log('Total unique keywords:', allKws.length);
console.log('');

// Category definitions with regex patterns
const categories = {
  '1. LOCATION-BASED (City/State/ZIP/Near Me)': kw => 
    /near me|in my area|by address|by zip/i.test(kw.kw) ||
    /internet providers? (?:in|near|around|for) /i.test(kw.kw) ||
    /\b(isp|cable|fiber|broadband|providers?|companies?) (?:in|near|for|around) /i.test(kw.kw) ||
    /internet (?:in|for) (?:new york|nyc|chicago|dallas|houston|los angeles|denver|atlanta|miami|san diego|austin|portland|seattle|nashville|jacksonville|columbus|indianapolis|detroit|las vegas|memphis|baltimore|milwaukee|boston|tampa|sacramento|kansas city|tulsa|raleigh|st\.? louis|pittsburgh|orlando|colorado springs)/i.test(kw.kw) ||
    /best internet (?:provider )?in (?:texas|florida|california|ohio|virginia|georgia|north carolina|new jersey|pennsylvania|michigan|illinois|indiana|tennessee|maryland|wisconsin|minnesota|missouri|alabama|louisiana|massachusetts|colorado|arizona|nevada|oregon|washington)/i.test(kw.kw) ||
    /\bavailability\b/i.test(kw.kw) ||
    /\bcheck.*address\b/i.test(kw.kw),

  '2. PROVIDER-SPECIFIC': kw =>
    /\b(xfinity|comcast|spectrum|verizon|fios|at&t|att |t-mobile|tmobile|cox |frontier |centurylink|century link|windstream|mediacom|optimum|altice|suddenlink|armstrong|breezeline|astound|earthlink|hughesnet|starlink|viasat|google fiber|metronet|brightspeed|ziply|sonic|grande|wave |tachus|ting |us cellular|dish |directv|fubo|rcn|lumen)/i.test(kw.kw),

  '3. TECHNOLOGY / CONNECTION TYPE': kw =>
    /\b(fiber optic|fiber internet|cable internet|dsl internet|dsl provider|satellite internet|5g internet|5g home|wireless internet|fixed wireless|broadband internet|wifi internet|hotspot|mesh wifi)/i.test(kw.kw),

  '4. USE-CASE / AUDIENCE-NEED': kw =>
    /\b(senior|elderly|gaming|gamer|work from home|working from home|remote work|streaming|student|apartment|rental|rural|farm|small town|business internet|home office|large household|family|low income|disabled|military)/i.test(kw.kw),

  '5. COMPARISON / VS': kw =>
    /\b(vs\.? |versus |compare |comparison|better than|alternative|instead of)/i.test(kw.kw),

  '6. SPEED-RELATED': kw =>
    /\b(speed test|speedtest|mbps|gbps|gigabit|upload speed|download speed|fastest|internet speed|slow internet|bandwidth|latency|ping|jitter)/i.test(kw.kw),

  '7. PRICE / COST': kw =>
    /\b(cheap|cheapest|affordable|low.?cost|budget|pricing|deal[s ]|discount|coupon|promo|savings?|free internet|lowest price|best price|how much.*cost|overpaying|internet under)/i.test(kw.kw),

  '8. BUNDLE (TV + Internet + Phone)': kw =>
    /\b(bundle|package|combo|tv and internet|internet and tv|cable and internet|internet and cable|phone and internet|triple play|double play|internet and phone|tv internet|cable tv|tv service|tv provider)/i.test(kw.kw),

  '9. SERVICE / SIGNUP': kw =>
    /\b(sign up|setup|install|activation|no contract|month.to.month|self.install|same day|transfer service|cancel |switch provider|move internet|moving|new service|order internet|get internet|hook up|no data cap|unlimited data|no commitment)/i.test(kw.kw),

  '10. INFORMATIONAL / EDUCATIONAL': kw =>
    /\b(what is|how to|how much speed|do i need|guide|tips|difference between|explain|understand|faq|review|rating|best internet|cord.?cut|cut.?the.?cord|cable alternative|what internet)/i.test(kw.kw),
};

for (const [catName, matchFn] of Object.entries(categories)) {
  const matches = allKws.filter(matchFn);
  console.log('═'.repeat(70));
  console.log(catName);
  console.log('Total matching keywords:', matches.length);
  console.log('─'.repeat(70));
  const top20 = matches.slice(0, 25);
  for (const k of top20) {
    console.log(`  ${k.vol.toLocaleString().padStart(12)}  ${k.kw.padEnd(55)} [${k.source}]`);
  }
  console.log('');
}

// Uncategorized
const categorized = new Set();
for (const matchFn of Object.values(categories)) {
  for (const kw of allKws) {
    if (matchFn(kw)) categorized.add(kw.kw);
  }
}
const uncategorized = allKws.filter(k => !categorized.has(k.kw));
console.log('═'.repeat(70));
console.log('UNCATEGORIZED:', uncategorized.length);
console.log('─'.repeat(70));
for (const k of uncategorized.slice(0, 40)) {
  console.log(`  ${k.vol.toLocaleString().padStart(12)}  ${k.kw.padEnd(55)} [${k.source}]`);
}
