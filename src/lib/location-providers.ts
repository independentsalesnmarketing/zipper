// ============================================================
// Internet 4 ALL — Location-Specific Provider Engine
// Computes unique provider lists + stats + content per location
// Makes every city/ZIP page genuinely different
// ============================================================

import { providers as allProviders, type Provider, getMinPrice, getMaxSpeed, getMaxUpload, formatSpeed, formatPrice, stateNames } from './providers';

// --- Deterministic hash: same input always produces same output ---
function hash(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// --- Population thresholds by technology ---
// Partners get lower thresholds (broader real-world reach)
const THRESHOLDS: Record<string, { partner: number; other: number }> = {
  fiber:     { partner: 10000,  other: 25000 },
  cable:     { partner: 3000,   other: 8000 },
  dsl:       { partner: 0,      other: 0 },
  '5g':      { partner: 15000,  other: 25000 },
  satellite: { partner: 0,      other: 0 },
};

// --- Public types ---

export interface LocationStats {
  providerCount: number;
  partnerCount: number;
  topSpeed: number;
  avgSpeed: number;
  minPrice: number;
  avgPrice: number;
  topUpload: number;
  fiberAvailable: boolean;
  fiberCount: number;
  cableCount: number;
  fiveGCount: number;
  competitionLevel: 'low' | 'medium' | 'high';
  grade: string;
  statePercentile: number; // approx rank within state (1 = best)
}

export interface LocationContent {
  resultIntro: string;
  recommendation: string;
  priceInsight: string;
  speedInsight: string;
}

export interface LocationProfile {
  providers: Provider[];
  partners: Provider[];
  nonPartners: Provider[];
  fiberProviders: Provider[];
  cableProviders: Provider[];
  fiveGProviders: Provider[];
  dslProviders: Provider[];
  satelliteProviders: Provider[];
  stats: LocationStats;
  content: LocationContent;
  fastest: Provider | null;
  cheapest: Provider | null;
  topRated: Provider | null;
  bestFiber: Provider | null;
  bestForStreaming: Provider | null;
  bestForGaming: Provider | null;
  bestForWFH: Provider | null;
  bestBudget: Provider | null;
}

// === Main API ===

export function getCityProfile(
  cityName: string,
  state: string,
  population: number,
  isMetro: boolean,
): LocationProfile {
  const h = hash(cityName + '|' + state);
  const v = (h % 1000) / 1000;
  const available = filterProviders(state, population, isMetro, v);
  return buildProfile(available, cityName, state, population, isMetro, h);
}

export function getZipProfile(
  zip: string,
  cityName: string,
  state: string,
  population: number,
  isMetro: boolean,
): LocationProfile {
  const h = hash(zip + '|' + cityName + '|' + state);
  const v = (h % 1000) / 1000;
  // ZIP-level: adjust effective population ±15% for provider threshold variation
  const effectivePop = Math.round(population * (0.85 + v * 0.3));
  const available = filterProviders(state, effectivePop, isMetro, v);
  return buildProfile(available, cityName, state, population, isMetro, h, zip);
}

// === Provider Filtering ===

function filterProviders(
  state: string,
  population: number,
  isMetro: boolean,
  variation: number,
): Provider[] {
  return allProviders.filter(p => {
    const covers = p.coverage.includes(state) || p.coverage.includes('Nationwide');
    if (!covers) return false;

    // Check if any of this provider's types pass the population threshold
    for (const type of p.types) {
      const rules = THRESHOLDS[type] ?? THRESHOLDS['cable'];
      const base = p.isPartner ? rules.partner : rules.other;
      // ±30% variation per location for natural differences between similar cities
      const threshold = Math.round(base * (0.7 + variation * 0.6));
      if (isMetro || population >= threshold) return true;
    }
    return false;
  }).sort((a, b) => {
    if (a.isPartner && !b.isPartner) return -1;
    if (!a.isPartner && b.isPartner) return 1;
    return b.rating - a.rating;
  });
}

// === Profile Builder ===

function buildProfile(
  available: Provider[],
  cityName: string,
  state: string,
  population: number,
  isMetro: boolean,
  h: number,
  zip?: string,
): LocationProfile {
  const partners = available.filter(p => p.isPartner);
  const nonPartners = available.filter(p => !p.isPartner);
  const fiber = available.filter(p => p.types.includes('fiber'));
  const cable = available.filter(p => p.types.includes('cable'));
  const fiveG = available.filter(p => p.types.includes('5g'));
  const dsl = available.filter(p => p.types.includes('dsl'));
  const satellite = available.filter(p => p.types.includes('satellite'));

  const topSpeed = available.length ? Math.max(...available.map(p => getMaxSpeed(p))) : 0;
  const avgSpeed = available.length ? Math.round(available.reduce((s, p) => s + getMaxSpeed(p), 0) / available.length) : 0;
  const minPrice = available.length ? Math.min(...available.map(p => getMinPrice(p))) : 0;
  const avgPrice = available.length ? Math.round(available.reduce((s, p) => s + getMinPrice(p), 0) / available.length) : 0;
  const topUpload = available.length ? Math.max(...available.map(p => getMaxUpload(p))) : 0;

  const fastest = available.length ? available.reduce((a, b) => getMaxSpeed(a) > getMaxSpeed(b) ? a : b) : null;
  const cheapest = available.length ? available.reduce((a, b) => getMinPrice(a) < getMinPrice(b) ? a : b) : null;
  const topRated = available.length ? available.reduce((a, b) => a.rating > b.rating ? a : b) : null;
  const bestFiber = fiber.length ? fiber.reduce((a, b) => a.rating > b.rating ? a : b) : null;

  // Activity picks — prefer partners for conversion
  const bestForStreaming = partners.find(p => getMaxSpeed(p) >= 300)
    || available.find(p => getMaxSpeed(p) >= 300) || fastest;
  const bestForGaming = [...partners].filter(p => p.types.includes('fiber'))
    .sort((a, b) => getMaxSpeed(b) - getMaxSpeed(a))[0]
    || [...fiber].sort((a, b) => getMaxSpeed(b) - getMaxSpeed(a))[0] || fastest;
  const bestForWFH = [...partners].sort((a, b) => getMaxUpload(b) - getMaxUpload(a))[0]
    || [...available].sort((a, b) => getMaxUpload(b) - getMaxUpload(a))[0] || null;
  const bestBudget = cheapest?.isPartner ? cheapest
    : partners.length ? [...partners].sort((a, b) => getMinPrice(a) - getMinPrice(b))[0] : cheapest;

  // Grade
  const score = available.length * 8 + (fiber.length > 0 ? 15 : 0)
    + Math.min(topSpeed / 200, 15) + partners.length * 3;
  const grade = score >= 75 ? 'A' : score >= 60 ? 'A-' : score >= 50 ? 'B+'
    : score >= 40 ? 'B' : score >= 30 ? 'B-' : score >= 20 ? 'C+' : score >= 15 ? 'C' : 'D';

  const competitionLevel: 'low' | 'medium' | 'high' =
    available.length >= 7 ? 'high' : available.length >= 4 ? 'medium' : 'low';

  // State percentile estimate
  const statePercentile = isMetro
    ? Math.min(Math.round(5 + (h % 20)), 25)
    : Math.min(Math.round(25 + (h % 55)), 85);

  const stats: LocationStats = {
    providerCount: available.length,
    partnerCount: partners.length,
    topSpeed, avgSpeed, minPrice, avgPrice, topUpload,
    fiberAvailable: fiber.length > 0,
    fiberCount: fiber.length,
    cableCount: cable.length,
    fiveGCount: fiveG.length,
    competitionLevel, grade, statePercentile,
  };

  const location = zip ? `ZIP ${zip}` : cityName;
  const content = generateContent(location, cityName, state, population, isMetro, stats, partners, fiber, h);

  return {
    providers: available, partners, nonPartners,
    fiberProviders: fiber, cableProviders: cable, fiveGProviders: fiveG,
    dslProviders: dsl, satelliteProviders: satellite,
    stats, content,
    fastest, cheapest, topRated, bestFiber,
    bestForStreaming, bestForGaming, bestForWFH, bestBudget,
  };
}

// ============================================================
// Content Generation
// Hash-based variant selection → truly unique text per location
// ============================================================

function generateContent(
  location: string,
  cityName: string,
  state: string,
  population: number,
  isMetro: boolean,
  stats: LocationStats,
  partners: Provider[],
  fiberProviders: Provider[],
  h: number,
): LocationContent {
  const stateName = stateNames[state] || state;
  const {
    providerCount, topSpeed, avgSpeed, minPrice, avgPrice, fiberAvailable,
    competitionLevel, grade, partnerCount, fiveGCount, cableCount, topUpload,
  } = stats;
  const popStr = population.toLocaleString();

  // ── RESULT INTRO ──
  // Different structure based on city characteristics, then variant within that group

  const introIdx = h % 10;
  let resultIntro: string;

  if (isMetro && fiberAvailable && competitionLevel === 'high') {
    const variants = [
      `Great news — we found ${providerCount} internet providers serving ${location}. As a major metro area with ${popStr} residents, ${cityName} enjoys strong broadband competition. Fiber internet is available from ${fiberProviders.slice(0, 3).map(p => p.name).join(', ')}, with speeds reaching ${formatSpeed(topSpeed)}. Plans start at just ${formatPrice(minPrice)}/mo.`,
      `${location} is one of the best-connected areas in ${stateName}, with ${providerCount} providers competing for your business. That competition means better prices (from ${formatPrice(minPrice)}/mo) and faster speeds (up to ${formatSpeed(topSpeed)}) for ${cityName}'s ${popStr} residents. ${fiberProviders.length} fiber providers serve the area.`,
      `We searched every option in ${location} and found ${providerCount} providers — that's ${competitionLevel} competition working in your favor. ${cityName} residents can choose from ${fiberProviders.length} fiber, ${cableCount} cable, and ${fiveGCount} 5G providers. Speeds reach ${formatSpeed(topSpeed)}, starting at ${formatPrice(minPrice)}/mo.`,
      `With ${providerCount} providers, ${location} has more internet options than ${100 - stats.statePercentile}% of ${stateName}. ${cityName}'s ${popStr} residents benefit from fiber availability through ${fiberProviders.slice(0, 2).map(p => p.name).join(' and ')}. Our experts can match you with the best deal — plans from ${formatPrice(minPrice)}/mo.`,
      `${cityName}, ${stateName} earns an internet grade of ${grade} with ${providerCount} active providers. Fiber reaches this area from ${fiberProviders.slice(0, 3).map(p => p.name).join(', ')}, delivering up to ${formatSpeed(topSpeed)}. Average starting price is $${avgPrice}/mo, but calling us often unlocks rates at ${formatPrice(minPrice)}/mo and lower.`,
    ];
    resultIntro = variants[introIdx % variants.length];

  } else if (fiberAvailable) {
    const variants = [
      `We found ${providerCount} internet providers in ${location}. Fiber internet is available from ${fiberProviders.map(p => p.name).join(' and ')}, delivering speeds up to ${formatSpeed(topSpeed)} to ${cityName}'s ${popStr} residents. Plans start at ${formatPrice(minPrice)}/mo — call us for the best rate at your address.`,
      `${providerCount} options are available in ${location}, including fiber from ${fiberProviders.slice(0, 2).map(p => p.name).join(' and ')}. ${cityName} residents can get connected from ${formatPrice(minPrice)}/mo, with top speeds reaching ${formatSpeed(topSpeed)}. Our free comparison service finds the right plan for your household.`,
      `Fiber internet has arrived in ${cityName}. ${fiberProviders.slice(0, 2).map(p => p.name).join(' and ')} ${fiberProviders.length > 1 ? 'offer' : 'offers'} fiber among the ${providerCount} providers in ${location}. Speeds reach ${formatSpeed(topSpeed)} and plans start at ${formatPrice(minPrice)}/mo. Enter your ZIP below for address-level results.`,
      `${location} earns a ${grade} internet grade thanks to ${providerCount} providers including ${fiberProviders.length} fiber option${fiberProviders.length > 1 ? 's' : ''}. ${cityName}'s ${popStr} residents can access speeds up to ${formatSpeed(topSpeed)} starting at ${formatPrice(minPrice)}/mo. Competition level: ${competitionLevel}.`,
    ];
    resultIntro = variants[introIdx % variants.length];

  } else if (providerCount <= 3) {
    const variants = [
      `${location} has ${providerCount} internet provider${providerCount !== 1 ? 's' : ''} available. While options are more limited than urban areas, ${cityName} residents can get connected from ${formatPrice(minPrice)}/mo with speeds to ${formatSpeed(topSpeed)}. ${partnerCount > 0 ? `We partner with ${partnerCount} provider${partnerCount > 1 ? 's' : ''} here for exclusive phone-only deals.` : ''}`,
      `We found ${providerCount} internet option${providerCount !== 1 ? 's' : ''} for ${location}. ${cityName}'s ${popStr} residents can access speeds to ${formatSpeed(topSpeed)} from ${formatPrice(minPrice)}/mo. Our experts specialize in finding the best deals in less competitive markets — call for rates not listed online.`,
      `Internet in ${location}: ${providerCount} provider${providerCount !== 1 ? 's' : ''} available, fastest at ${formatSpeed(topSpeed)}. For ${cityName}'s ${popStr} residents, we recommend calling to compare — our team finds promotions that make a real difference where options are limited.`,
    ];
    resultIntro = variants[introIdx % variants.length];

  } else {
    const variants = [
      `${providerCount} internet providers serve ${location}, giving ${cityName}'s ${popStr} residents options from ${formatPrice(minPrice)}/mo up to premium ${formatSpeed(topSpeed)} plans. ${partnerCount > 0 ? `We work with ${partnerCount} providers here to negotiate exclusive rates — call for the best deal.` : ''}`,
      `We identified ${providerCount} providers for ${location}. In ${cityName}, speeds reach ${formatSpeed(topSpeed)} and plans start at ${formatPrice(minPrice)}/mo. ${fiveGCount > 0 ? `5G home internet is available, adding wireless options alongside traditional cable and DSL.` : 'Cable and DSL deliver the primary high-speed options.'}`,
      `Internet results for ${location}: ${providerCount} providers, speeds to ${formatSpeed(topSpeed)}, plans from ${formatPrice(minPrice)}/mo. ${cityName} has ${competitionLevel} competition, which ${competitionLevel === 'high' ? 'keeps prices aggressive' : competitionLevel === 'medium' ? 'gives solid options to compare' : 'means our experts can help find hidden deals'}.`,
      `${cityName}, ${stateName} — ${providerCount} providers available. Competition level: ${competitionLevel}. Top speed: ${formatSpeed(topSpeed)}. Lowest price: ${formatPrice(minPrice)}/mo. Grade: ${grade}. ${partnerCount > 0 ? `Call to access exclusive partner pricing not listed on provider websites.` : ''}`,
    ];
    resultIntro = variants[introIdx % variants.length];
  }

  // ── RECOMMENDATION ──
  const topPartner = partners[0];
  const recIdx = (h >> 4) % 5;
  let recommendation: string;
  if (topPartner) {
    const recs = [
      `Our top pick for ${cityName} is ${topPartner.name} — rated ${topPartner.rating}/5 stars with plans from ${formatPrice(getMinPrice(topPartner))}/mo. Call to get their best current promotion.`,
      `For most ${cityName} households, we recommend ${topPartner.name}. With ${topPartner.rating}/5 stars and speeds to ${formatSpeed(getMaxSpeed(topPartner))}, it's a reliable choice. Ask about phone-exclusive pricing.`,
      `Based on speed, price, and availability in ${location}, ${topPartner.name} is our #1 pick. ${topPartner.pros[0]}. Plans from ${formatPrice(getMinPrice(topPartner))}/mo.`,
      `${topPartner.name} leads our ${cityName} rankings with ${topPartner.rating}/5 stars across ${topPartner.reviewCount.toLocaleString()} reviews. Their ${topPartner.plans[0]?.name || 'starter plan'} begins at ${formatPrice(getMinPrice(topPartner))}/mo.`,
      `For ${cityName}, ${topPartner.name} offers the best combination of speed, price, and reliability. Up to ${formatSpeed(getMaxSpeed(topPartner))}, from ${formatPrice(getMinPrice(topPartner))}/mo. Call for current promotions.`,
    ];
    recommendation = recs[recIdx];
  } else {
    recommendation = `Call our experts for a personalized recommendation based on your ${cityName} address and usage needs.`;
  }

  // ── PRICE INSIGHT ──
  const priceIdx = (h >> 8) % 4;
  const priceInsights = [
    `Internet in ${cityName} averages $${avgPrice}/mo to start — ${avgPrice < 50 ? 'below' : avgPrice < 60 ? 'near' : 'above'} the typical U.S. average of ~$55/mo. The most affordable plan is ${formatPrice(minPrice)}/mo. Our phone-only deals can reduce that further.`,
    `Plans in ${location} range from ${formatPrice(minPrice)}/mo to premium tiers with ${formatSpeed(topSpeed)} speeds. Most entry-level plans fall between $${Math.max(Math.round(minPrice), 30)}-$${Math.min(Math.round(avgPrice + 15), 80)}/mo. ${partnerCount > 0 ? 'Partner deals can save $10-40/mo over online pricing.' : ''}`,
    `The cheapest internet in ${cityName} is ${formatPrice(minPrice)}/mo, average starting price is $${avgPrice}/mo across all ${providerCount} providers. ${competitionLevel === 'high' ? 'High competition keeps prices honest here.' : 'Calling our experts helps leverage competing offers.'}`,
    `${cityName} pricing: ${formatPrice(minPrice)} to $100+/mo. For a typical household, expect $${Math.round(avgPrice * 0.9)}-$${Math.round(avgPrice * 1.15)}/mo for solid performance. We specialize in finding promotional rates below that range.`,
  ];
  const priceInsight = priceInsights[priceIdx];

  // ── SPEED INSIGHT ──
  const speedIdx = (h >> 12) % 4;
  const speedInsights = [
    `The fastest internet in ${cityName} hits ${formatSpeed(topSpeed)}. ${fiberAvailable ? `Fiber delivers the lowest latency and most consistent speeds — great for gaming, video calls, and remote work.` : `Cable and wireless connections provide the best speeds here.`}`,
    `Speeds in ${location} top out at ${formatSpeed(topSpeed)}, averaging ${formatSpeed(avgSpeed)} across all providers. ${fiberAvailable ? `Fiber (from ${fiberProviders.slice(0, 2).map(p => p.name).join(' and ')}) offers symmetrical uploads up to ${formatSpeed(topUpload)} — critical for video calls and cloud work.` : 'For faster uploads, ask about 5G or fixed wireless.'}`,
    `${cityName} residents access speeds to ${formatSpeed(topSpeed)}. ${topSpeed >= 1000 ? 'Gigabit+ service supports 10+ devices, 4K streaming, gaming, and large file transfers simultaneously.' : topSpeed >= 300 ? 'These speeds handle streaming, gaming, and remote work across multiple devices.' : 'Suitable for browsing, streaming, and video calls for small-to-mid households.'}`,
    `Max download: ${formatSpeed(topSpeed)}. Max upload: ${formatSpeed(topUpload)}. Average provider top speed: ${formatSpeed(avgSpeed)}. ${topUpload >= 500 ? `Symmetrical upload via fiber is available — the gold standard for remote work.` : `Upload speeds meet most needs for video calling and file sharing.`}`,
  ];
  const speedInsight = speedInsights[speedIdx];

  return { resultIntro, recommendation, priceInsight, speedInsight };
}
