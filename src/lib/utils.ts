// Utility helpers
export function isValidZip(zip: string): boolean {
  return /^\d{5}$/.test(zip);
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len).trim() + '…';
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || singular + 's');
}

export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

export function formatPhoneForTel(phone: string): string {
  return 'tel:+1' + phone.replace(/\D/g, '');
}

export function formatPhoneDisplay(phone: string): string {
  return phone;
}

// Simple schema.org JSON-LD generators
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Internet 4 ALL',
    url: 'https://internet4all.com',
    description: 'Find the best internet providers in your area. Compare plans, prices, and speeds.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://internet4all.com/providers?zip={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateFAQSchema(
  faqs: { question: string; answer: string }[],
  datePublished?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    datePublished: datePublished ?? new Date().toISOString().split('T')[0],
    dateModified: new Date().toISOString().split('T')[0],
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Internet 4 ALL',
    url: 'https://internet4all.com',
    logo: 'https://internet4all.com/logo.png',
    description: 'Find the best internet providers in your area. Compare plans, prices, and speeds from 24+ providers.',
    sameAs: [
      'https://facebook.com/internet4all',
      'https://twitter.com/internet4all',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      telephone: '+1-888-555-0123',
      areaServed: 'US',
      availableLanguage: 'en',
      hoursAvailable: 'Mon-Fri 8AM-10PM EST, Sat-Sun 9AM-8PM EST',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      bestRating: '5',
      worstRating: '1',
      ratingCount: '500',
    },
  };
}

export function generateHowToSchema(opts: {
  name: string;
  description: string;
  totalTime?: string;
  steps: { name: string; text: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: opts.name,
    description: opts.description,
    ...(opts.totalTime ? { totalTime: opts.totalTime } : {}),
    step: opts.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function generateProviderSchema(provider: {
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  slug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: provider.name,
    description: provider.description,
    url: `https://internet4all.com/provider/${provider.slug}`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: provider.rating.toFixed(1),
      bestRating: '5',
      ratingCount: provider.reviewCount,
    },
  };
}

export function generateProductSchema(provider: {
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  slug: string;
  plans: Array<{ name: string; price: number; promoPrice: number; speed: number }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${provider.name} Internet Service`,
    description: provider.description,
    url: `https://internet4all.com/provider/${provider.slug}`,
    brand: {
      '@type': 'Brand',
      name: provider.name,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: provider.rating.toFixed(1),
      bestRating: '5',
      worstRating: '1',
      ratingCount: provider.reviewCount,
    },
    offers: provider.plans.map(plan => ({
      '@type': 'Offer',
      name: plan.name,
      price: (plan.promoPrice < plan.price ? plan.promoPrice : plan.price).toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `https://internet4all.com/provider/${provider.slug}`,
    })),
  };
}

export function generateItemListSchema(items: Array<{ name: string; url: string; description?: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: item.url,
      ...(item.description && { description: item.description }),
    })),
  };
}

export function generateArticleSchema(opts: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  authorUrl?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    author: {
      '@type': 'Person',
      name: opts.authorName,
      ...(opts.authorUrl && { url: opts.authorUrl }),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Internet 4 ALL',
      url: 'https://internet4all.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://internet4all.com/logo.png',
      },
    },
  };
}

export function generateLocalBusinessSchema(opts: {
  city: string;
  state: string;
  zip?: string;
  providerCount: number;
  topSpeed: number;
  minPrice: number;
  providerNames: string[];
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `https://internet4all.com${opts.url}`,
    name: `Internet Providers in ${opts.city}, ${opts.state}`,
    description: `Compare ${opts.providerCount} internet providers in ${opts.city}, ${opts.state}. Speeds up to ${opts.topSpeed} Mbps, starting at $${opts.minPrice}/mo. Providers include ${opts.providerNames.slice(0, 5).join(', ')}.`,
    url: `https://internet4all.com${opts.url}`,
    telephone: '+1-888-555-0123',
    address: {
      '@type': 'PostalAddress',
      addressLocality: opts.city,
      addressRegion: opts.state,
      ...(opts.zip && { postalCode: opts.zip }),
      addressCountry: 'US',
    },
    areaServed: {
      '@type': 'City',
      name: opts.city,
      containedInPlace: {
        '@type': 'State',
        name: opts.state,
      },
    },
    priceRange: `$${opts.minPrice}+/mo`,
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '22:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '09:00',
        closes: '20:00',
      },
    ],
  };
}
