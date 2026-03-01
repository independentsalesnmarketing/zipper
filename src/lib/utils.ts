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

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
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
