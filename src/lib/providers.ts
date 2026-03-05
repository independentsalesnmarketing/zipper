// Provider data helpers
import data from '@data/providers.json';

export interface Plan {
  name: string;
  speed: number;
  uploadSpeed: number;
  price: number;
  promoPrice: number;
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
  phone: string;
  plans: Plan[];
  promo?: string;
  reviewSource?: string;
  reviewUrl?: string;
}

export const MAIN_PHONE = data.mainPhone;
export const providers: Provider[] = data.providers as Provider[];

export function getProviderById(id: string): Provider | undefined {
  return providers.find(p => p.id === id);
}

export function getProviderBySlug(slug: string): Provider | undefined {
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
  return Math.min(...provider.plans.map(p => p.promoPrice || p.price));
}

export function getMaxSpeed(provider: Provider): number {
  return Math.max(...provider.plans.map(p => p.speed));
}

export function getMaxUpload(provider: Provider): number {
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
  NY: ['spectrum','optimum','verizon','earthlink','tmobile','frontier','windstream'],
  NJ: ['optimum','verizon','earthlink','tmobile'],
  CT: ['frontier','optimum','verizon','earthlink','tmobile'],
  PA: ['verizon','optimum','frontier','earthlink','tmobile','brightspeed','windstream'],
  MA: ['verizon','spectrum','earthlink','tmobile'],
  RI: ['verizon','earthlink','tmobile'],
  VA: ['verizon','earthlink','tmobile','brightspeed'],
  MD: ['verizon','earthlink','tmobile'],
  DC: ['verizon','att','earthlink','tmobile'],
  DE: ['verizon','earthlink','tmobile'],
  CA: ['spectrum','att','frontier','earthlink','tmobile'],
  TX: ['att','spectrum','frontier','earthlink','tmobile','windstream','brightspeed'],
  FL: ['att','spectrum','frontier','earthlink','tmobile','brightspeed','windstream'],
  IL: ['att','earthlink','tmobile','brightspeed'],
  OH: ['spectrum','att','altafiber','frontier','earthlink','tmobile','brightspeed','windstream'],
  GA: ['att','spectrum','earthlink','tmobile','windstream'],
  NC: ['spectrum','att','brightspeed','earthlink','tmobile','windstream','frontier'],
  SC: ['spectrum','att','brightspeed','earthlink','tmobile','windstream','frontier'],
  MI: ['att','spectrum','earthlink','tmobile'],
  TN: ['att','spectrum','earthlink','tmobile','brightspeed','frontier'],
  AL: ['att','spectrum','earthlink','tmobile','brightspeed','frontier'],
  IN: ['att','spectrum','altafiber','frontier','earthlink','tmobile','brightspeed'],
  KY: ['att','spectrum','altafiber','earthlink','tmobile','windstream'],
  WI: ['spectrum','att','earthlink','tmobile','brightspeed'],
  MN: ['earthlink','tmobile','brightspeed','windstream','frontier'],
  MO: ['att','spectrum','earthlink','tmobile','brightspeed'],
  LA: ['att','earthlink','tmobile','windstream','brightspeed'],
  AR: ['att','earthlink','tmobile','windstream','brightspeed'],
  OK: ['att','earthlink','tmobile','windstream'],
  MS: ['att','earthlink','tmobile','windstream','brightspeed'],
  NE: ['earthlink','tmobile','windstream'],
  IA: ['earthlink','tmobile','windstream','frontier'],
  NM: ['earthlink','tmobile','windstream','frontier'],
  WV: ['frontier','earthlink','tmobile','windstream'],
  AZ: ['att','earthlink','tmobile','frontier'],
  CO: ['spectrum','att','earthlink','tmobile','frontier','brightspeed'],
  OR: ['spectrum','earthlink','tmobile','frontier'],
  WA: ['spectrum','earthlink','tmobile','frontier'],
  NV: ['att','spectrum','earthlink','tmobile'],
  HI: ['spectrum','tmobile'],
  AK: ['earthlink','tmobile'],
  KS: ['att','earthlink','tmobile','brightspeed'],
  NH: ['earthlink','tmobile','spectrum'],
  ME: ['spectrum','earthlink','tmobile'],
  VT: ['earthlink','tmobile','spectrum','frontier'],
  SD: ['earthlink','tmobile'],
  ND: ['earthlink','tmobile'],
  MT: ['earthlink','tmobile'],
  WY: ['earthlink','tmobile'],
  ID: ['earthlink','tmobile','frontier'],
  UT: ['earthlink','tmobile','frontier'],
};
