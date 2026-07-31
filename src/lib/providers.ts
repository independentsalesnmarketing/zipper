// Provider data helpers
import data from '@data/providers.json';

export interface Plan {
  name: string;
  speed: number;
  uploadSpeed: number;
  price: number;
  promoPrice: number;
  pricePrefix?: string;
  contract: string;
  dataCap: string;
  type?: string;
  features: string[];
}

export interface Provider {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  types: string[];
  rating: number;
  reviewCount: number;
  isPartner: boolean;
  description: string;
  pros: string[];
  cons: string[];
  coverage: string[];
  plans: Plan[];
  topCities?: string[];
  promo?: string;
  reviewSource?: string;
  reviewUrl?: string;
  callForPricing?: boolean;
}

export const providers: Provider[] = data.providers as Provider[];

export function getProviderById(id: string | null | undefined): Provider | undefined {
  if (!id || typeof id !== 'string') return undefined;
  return providers.find(p => p.id === id);
}

export function getProviderBySlug(slug: string | null | undefined): Provider | undefined {
  if (!slug || typeof slug !== 'string') return undefined;
  return providers.find(p => p.slug === slug);
}

export function getPartnerProviders(): Provider[] {
  return providers.filter(p => p.isPartner);
}

export function getAllProviders(): Provider[] {
  return providers;
}

export function getProvidersByType(type: string): Provider[] {
  return providers.filter(p => p.types.includes(type));
}

export function getProvidersByState(state: string): Provider[] {
  return providers.filter(p =>
    p.coverage.includes(state) || p.coverage.includes('Nationwide')
  );
}

export function getMinPrice(provider: Provider): number {
  if (!provider.plans || provider.plans.length === 0) return 0;
  return Math.min(...provider.plans.map(p => p.promoPrice || p.price));
}

export function getMaxSpeed(provider: Provider): number {
  if (!provider.plans || provider.plans.length === 0) return 0;
  return Math.max(...provider.plans.map(p => p.speed));
}

export function getMaxUpload(provider: Provider): number {
  if (!provider.plans || provider.plans.length === 0) return 0;
  return Math.max(...provider.plans.map(p => p.uploadSpeed || 0));
}

export function formatSpeed(speed: number): string {
  if (speed >= 1000) {
    const gbps = speed / 1000;
    return (gbps % 1 === 0 ? gbps.toFixed(0) : gbps.toFixed(1)) + ' Gbps';
  }
  return speed + ' Mbps';
}

export function getSpeedValue(speed: number): string {
  if (speed >= 1000) {
    const gbps = speed / 1000;
    return gbps % 1 === 0 ? gbps.toFixed(0) : gbps.toFixed(1);
  }
  return String(speed);
}

export function getSpeedUnit(speed: number): string {
  return speed >= 1000 ? 'Gbps' : 'Mbps';
}

export function formatPrice(price: number): string {
  return '$' + price.toFixed(2);
}

// Some providers advertise "Call for current offer!" instead of a fixed
// starting rate. Use this label wherever a provider's headline price is shown.
export const CALL_FOR_PRICING_LABEL = 'Call for current offer!';

export function isCallForPricing(provider: Provider): boolean {
  return provider.callForPricing === true;
}

// Headline price label for a provider, e.g. "$29.99/mo" or the call-for-offer text.
export function getPriceLabel(provider: Provider): string {
  if (isCallForPricing(provider)) return CALL_FOR_PRICING_LABEL;
  return formatPrice(getMinPrice(provider)) + '/mo';
}

export function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    fiber: 'Fiber',
    cable: 'Cable',
    dsl: 'DSL',
    '5g': '5G',
    satellite: 'Satellite',
    'fixed-wireless': 'Fixed Wireless',
  };
  return labels[type] || type;
}

export function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    fiber: 'green',
    cable: 'blue',
    dsl: 'amber',
    '5g': 'cyan',
    satellite: 'purple',
    'fixed-wireless': 'teal',
  };
  return colors[type] || 'blue';
}

export function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.3;
  const empty = 5 - full - (half ? 1 : 0);
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// State abbreviation to full name
export const stateNames: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'Washington DC', FL: 'Florida',
  GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana',
  IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine',
  MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
  OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island',
  SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah',
  VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};

// State → default providers mapping
export const stateProviders: Record<string, string[]> = {
  NY: ['spectrum','xfinity','optimum','frontier','kinetic','earthlink','tmobile-5g','astound','consolidated-communications','starlink'],
  NJ: ['xfinity','optimum','earthlink','tmobile-5g','astound','starlink'],
  CT: ['xfinity','frontier','optimum','earthlink','tmobile-5g','starlink'],
  PA: ['xfinity','optimum','frontier','brightspeed','kinetic','earthlink','tmobile-5g','astound','consolidated-communications','starlink'],
  MA: ['xfinity','earthlink','tmobile-5g','consolidated-communications','starlink'],
  RI: ['xfinity','cox','earthlink','tmobile-5g','starlink'],
  VA: ['xfinity','brightspeed','earthlink','tmobile-5g','cox','astound','google-fiber','starlink'],
  MD: ['xfinity','earthlink','tmobile-5g','astound','starlink'],
  DC: ['xfinity','att','earthlink','tmobile-5g','astound','starlink'],
  DE: ['xfinity','earthlink','tmobile-5g','starlink'],
  CA: ['xfinity','spectrum','att','frontier','earthlink','tmobile-5g','tmobile','fidium','google-fiber','geolinks','astound','consolidated-communications','starlink'],
  TX: ['xfinity','att','spectrum','frontier','kinetic','brightspeed','earthlink','tmobile-5g','optimum','fidium','google-fiber','geolinks','astound','lumen','metronet','mediacom','sparklight','consolidated-communications','starlink'],
  FL: ['xfinity','att','spectrum','frontier','brightspeed','kinetic','earthlink','tmobile-5g','tmobile','cox','wow','lumen','mediacom','consolidated-communications','starlink'],
  IL: ['xfinity','att','brightspeed','earthlink','tmobile-5g','tmobile','frontier','wow','google-fiber','metronet','astound','consolidated-communications','mediacom','starlink'],
  OH: ['xfinity','spectrum','att','altafiber','frontier','brightspeed','kinetic','earthlink','tmobile-5g','wow','google-fiber','metronet','consolidated-communications','mediacom','starlink'],
  GA: ['xfinity','att','spectrum','kinetic','earthlink','tmobile-5g','cox','wow','google-fiber','metronet','mediacom','starlink'],
  NC: ['xfinity','spectrum','att','brightspeed','kinetic','frontier','earthlink','tmobile-5g','google-fiber','mediacom','starlink'],
  SC: ['xfinity','spectrum','att','brightspeed','kinetic','frontier','earthlink','tmobile-5g','wow','starlink'],
  MI: ['xfinity','att','spectrum','earthlink','tmobile-5g','wow','metronet','starlink'],
  TN: ['xfinity','att','spectrum','brightspeed','frontier','earthlink','tmobile-5g','wow','google-fiber','lumen','metronet','mediacom','uscellular','starlink'],
  AL: ['xfinity','att','spectrum','brightspeed','frontier','kinetic','earthlink','tmobile-5g','cox','google-fiber','lumen','sparklight','mediacom','starlink'],
  IN: ['xfinity','att','spectrum','altafiber','frontier','brightspeed','earthlink','tmobile-5g','wow','google-fiber','metronet','consolidated-communications','mediacom','lumen','starlink'],
  KY: ['xfinity','att','spectrum','altafiber','kinetic','earthlink','tmobile-5g','wow','metronet','mediacom','starlink'],
  WI: ['xfinity','spectrum','att','brightspeed','earthlink','tmobile-5g','lumen','metronet','sparklight','mediacom','consolidated-communications','uscellular','starlink'],
  MN: ['xfinity','brightspeed','kinetic','frontier','earthlink','tmobile-5g','lumen','metronet','sparklight','consolidated-communications','starlink'],
  MO: ['xfinity','att','spectrum','brightspeed','earthlink','tmobile-5g','wow','google-fiber','lumen','metronet','sparklight','consolidated-communications','mediacom','starlink'],
  LA: ['xfinity','att','kinetic','brightspeed','earthlink','tmobile-5g','cox','lumen','mediacom','starlink'],
  AR: ['xfinity','att','kinetic','brightspeed','earthlink','tmobile-5g','wow','lumen','metronet','sparklight','mediacom','starlink'],
  OK: ['att','kinetic','earthlink','tmobile-5g','cox','google-fiber','metronet','sparklight','starlink'],
  MS: ['xfinity','att','kinetic','brightspeed','earthlink','tmobile-5g','wow','sparklight','mediacom','starlink'],
  NE: ['xfinity','kinetic','earthlink','tmobile-5g','cox','google-fiber','lumen','metronet','sparklight','consolidated-communications','starlink'],
  IA: ['xfinity','kinetic','frontier','earthlink','tmobile-5g','google-fiber','lumen','metronet','sparklight','consolidated-communications','mediacom','uscellular','starlink'],
  NM: ['xfinity','kinetic','frontier','brightspeed','earthlink','tmobile-5g','lumen','sparklight','starlink'],
  WV: ['xfinity','frontier','kinetic','optimum','earthlink','tmobile-5g','starlink'],
  AZ: ['xfinity','att','frontier','earthlink','tmobile-5g','cox','google-fiber','geolinks','lumen','sparklight','starlink'],
  CO: ['xfinity','spectrum','att','frontier','brightspeed','earthlink','tmobile-5g','tmobile','google-fiber','geolinks','lumen','sparklight','starlink'],
  OR: ['xfinity','spectrum','frontier','earthlink','tmobile-5g','ziply','google-fiber','astound','lumen','sparklight','consolidated-communications','starlink'],
  WA: ['xfinity','spectrum','frontier','earthlink','tmobile-5g','ziply','google-fiber','astound','lumen','sparklight','consolidated-communications','starlink'],
  NV: ['xfinity','att','spectrum','earthlink','tmobile-5g','cox','geolinks','lumen','starlink'],
  HI: ['spectrum','tmobile-5g','starlink','viasat','hughesnet'],
  AK: ['earthlink','tmobile-5g','starlink','viasat','hughesnet'],
  KS: ['xfinity','att','brightspeed','earthlink','tmobile-5g','google-fiber','metronet','sparklight','consolidated-communications','mediacom','starlink'],
  NH: ['xfinity','spectrum','earthlink','tmobile-5g','fidium','consolidated-communications','starlink'],
  ME: ['xfinity','spectrum','earthlink','tmobile-5g','fidium','consolidated-communications','uscellular','starlink'],
  VT: ['xfinity','spectrum','frontier','earthlink','tmobile-5g','consolidated-communications','starlink'],
  SD: ['earthlink','tmobile-5g','lumen','sparklight','consolidated-communications','starlink','viasat','hughesnet'],
  ND: ['earthlink','tmobile-5g','lumen','sparklight','consolidated-communications','starlink','viasat','hughesnet'],
  MT: ['earthlink','tmobile-5g','geolinks','lumen','sparklight','consolidated-communications','starlink','viasat','hughesnet'],
  WY: ['earthlink','tmobile-5g','geolinks','lumen','sparklight','starlink','viasat','hughesnet'],
  ID: ['xfinity','frontier','earthlink','tmobile-5g','ziply','lumen','sparklight','consolidated-communications','starlink'],
  UT: ['xfinity','frontier','earthlink','tmobile-5g','google-fiber','geolinks','lumen','mediacom','starlink'],
};
