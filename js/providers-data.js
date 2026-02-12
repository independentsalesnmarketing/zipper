// ============================================
// Internet 4 ALL - Provider Data
// ============================================

const PHONE_NUMBER = '1-888-555-0123';

const providers = [
    {
        id: 'spectrum',
        name: 'Spectrum',
        logo: 'https://logo.clearbit.com/spectrum.com',
        types: ['cable'],
        rating: 4.2,
        reviewCount: 45230,
        description: 'Spectrum is one of the largest cable internet providers in the US, offering reliable high-speed internet without data caps or contracts.',
        pros: ['No data caps', 'No contracts required', 'Free modem included', 'Nationwide availability'],
        cons: ['Price increases after promo period', 'Upload speeds could be faster'],
        coverage: ['NY', 'TX', 'CA', 'FL', 'OH', 'NC', 'WI', 'MO', 'KY', 'SC'],
        phone: '1-888-555-0101',
        plans: [
            { name: 'Spectrum Internet', speed: 300, uploadSpeed: 10, price: 49.99, promoPrice: 29.99, contract: 'None', dataCap: 'Unlimited', features: ['Free modem', 'No data caps', 'Free antivirus'] },
            { name: 'Spectrum Internet Ultra', speed: 500, uploadSpeed: 20, price: 69.99, promoPrice: 49.99, contract: 'None', dataCap: 'Unlimited', features: ['Free modem', 'Great for 4K streaming', 'No data caps'] },
            { name: 'Spectrum Internet Gig', speed: 1000, uploadSpeed: 35, price: 89.99, promoPrice: 69.99, contract: 'None', dataCap: 'Unlimited', features: ['Free modem', 'Perfect for large households', 'Gaming optimized'] }
        ]
    },
    {
        id: 'att',
        name: 'AT&T',
        logo: 'https://logo.clearbit.com/att.com',
        types: ['fiber', 'dsl'],
        rating: 4.4,
        reviewCount: 62150,
        description: 'AT&T offers both fiber and DSL internet services. AT&T Fiber delivers symmetrical speeds up to 5 Gbps in select areas.',
        pros: ['Symmetrical fiber speeds', 'No data caps on fiber', 'Price lock guarantee', 'Excellent reliability'],
        cons: ['Limited fiber availability', 'Equipment fee required'],
        coverage: ['TX', 'CA', 'FL', 'IL', 'GA', 'MI', 'OH', 'NC', 'TN', 'AL'],
        phone: '1-888-555-0102',
        plans: [
            { name: 'AT&T Fiber 300', speed: 300, uploadSpeed: 300, price: 55.00, promoPrice: 55.00, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['Symmetrical speeds', 'No data caps', 'Free installation'] },
            { name: 'AT&T Fiber 500', speed: 500, uploadSpeed: 500, price: 65.00, promoPrice: 65.00, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['Great for 4K streaming', 'Work from home ready', 'Gaming optimized'] },
            { name: 'AT&T Fiber 1 Gig', speed: 1000, uploadSpeed: 1000, price: 80.00, promoPrice: 80.00, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['1 Gig symmetrical', 'Smart Home Manager', 'Best for families'] },
            { name: 'AT&T Fiber 2 Gig', speed: 2000, uploadSpeed: 2000, price: 110.00, promoPrice: 110.00, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['Multi-gig speeds', 'Wi-Fi 6E gateway', 'Future-proof'] },
            { name: 'AT&T Fiber 5 Gig', speed: 5000, uploadSpeed: 5000, price: 180.00, promoPrice: 180.00, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['Ultra-fast speeds', 'Professional install', 'Best performance'] }
        ]
    },
    {
        id: 'tmobile',
        name: 'T-Mobile 5G Home Internet',
        logo: 'https://logo.clearbit.com/t-mobile.com',
        types: ['5g'],
        rating: 4.1,
        reviewCount: 28450,
        description: 'T-Mobile 5G Home Internet uses their extensive 5G network to deliver wireless home internet with no annual contracts.',
        pros: ['No contracts', 'No data caps', 'Simple pricing', 'Quick self-setup', 'Price lock guarantee'],
        cons: ['Speed varies by location', 'Requires 5G coverage'],
        coverage: ['Nationwide 5G coverage'],
        phone: '1-888-555-0103',
        plans: [
            { name: 'T-Mobile 5G Home Internet', speed: 245, uploadSpeed: 31, price: 50.00, promoPrice: 50.00, contract: 'None', dataCap: 'Unlimited', features: ['Price lock guarantee', 'Free gateway', '15-day test drive'] },
            { name: 'T-Mobile 5G (with phone plan)', speed: 245, uploadSpeed: 31, price: 40.00, promoPrice: 40.00, contract: 'None', dataCap: 'Unlimited', features: ['Bundle discount', 'Price lock guarantee', 'Free gateway'] }
        ]
    },
    {
        id: 'windstream',
        name: 'Kinetic by Windstream',
        logo: 'https://logo.clearbit.com/windstream.com',
        types: ['fiber', 'dsl'],
        rating: 3.9,
        reviewCount: 15680,
        description: 'Kinetic by Windstream offers fiber and DSL internet in rural and suburban areas across 18 states.',
        pros: ['Available in rural areas', 'No data caps', 'Price for life on fiber', 'Bundle options'],
        cons: ['Limited fiber availability', 'DSL speeds vary'],
        coverage: ['AR', 'GA', 'KY', 'NE', 'NM', 'NY', 'NC', 'OH', 'OK', 'PA', 'SC', 'TX'],
        phone: '1-888-555-0104',
        plans: [
            { name: 'Kinetic Internet 200', speed: 200, uploadSpeed: 200, price: 55.00, promoPrice: 55.00, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['Symmetrical speeds', 'Price for life', 'Free WiFi'] },
            { name: 'Kinetic Internet 500', speed: 500, uploadSpeed: 500, price: 65.00, promoPrice: 65.00, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['Work from home ready', 'Multiple 4K streams', 'Whole home WiFi'] },
            { name: 'Kinetic Gig', speed: 1000, uploadSpeed: 1000, price: 79.00, promoPrice: 79.00, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['Gig symmetrical', 'Price for life', 'Premium WiFi'] }
        ]
    },
    {
        id: 'earthlink',
        name: 'EarthLink',
        logo: 'https://logo.clearbit.com/earthlink.net',
        types: ['fiber', 'cable', 'dsl'],
        rating: 3.8,
        reviewCount: 12340,
        description: 'EarthLink partners with major providers to offer internet service with straightforward pricing and no data caps.',
        pros: ['No data caps', 'No contracts', 'Straightforward pricing', '24/7 support'],
        cons: ['Uses partner networks', 'Availability varies'],
        coverage: ['Nationwide (varies by area)'],
        phone: '1-888-555-0105',
        plans: [
            { name: 'EarthLink Internet', speed: 100, uploadSpeed: 10, price: 59.95, promoPrice: 59.95, contract: 'None', dataCap: 'Unlimited', features: ['No data caps', '24/7 support', 'No contracts'] },
            { name: 'EarthLink Fiber 300', speed: 300, uploadSpeed: 300, price: 69.95, promoPrice: 69.95, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['Symmetrical speeds', 'Price lock', 'Free install'] },
            { name: 'EarthLink Fiber 1000', speed: 1000, uploadSpeed: 1000, price: 99.95, promoPrice: 99.95, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['Gig speeds', 'Best for power users', 'No throttling'] }
        ]
    },
    {
        id: 'optimum',
        name: 'Optimum',
        logo: 'https://logo.clearbit.com/optimum.com',
        types: ['fiber', 'cable'],
        rating: 4.0,
        reviewCount: 31250,
        description: 'Optimum offers cable and fiber internet in the Northeast US with competitive pricing and bundle deals.',
        pros: ['No annual contracts', 'No data caps', 'Smart WiFi 6 included', 'Good bundle deals'],
        cons: ['Limited to Northeast', 'Price increases after year 1'],
        coverage: ['NY', 'NJ', 'CT', 'PA'],
        phone: '1-888-555-0106',
        plans: [
            { name: 'Optimum 300', speed: 300, uploadSpeed: 20, price: 60.00, promoPrice: 40.00, contract: 'None', dataCap: 'Unlimited', features: ['Smart WiFi 6', 'Free installation', 'Optimum app'] },
            { name: 'Optimum 500 Fiber', speed: 500, uploadSpeed: 500, price: 80.00, promoPrice: 60.00, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['Fiber speeds', 'Symmetrical upload', 'Great for streaming'] },
            { name: 'Optimum 1 Gig Fiber', speed: 1000, uploadSpeed: 1000, price: 100.00, promoPrice: 80.00, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['1 Gig symmetrical', 'Whole home WiFi', 'Gaming optimized'] },
            { name: 'Optimum 2 Gig Fiber', speed: 2000, uploadSpeed: 2000, price: 130.00, promoPrice: 100.00, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['2 Gig speeds', 'Multi-gig router', 'Premium WiFi'] }
        ]
    },
    {
        id: 'frontier',
        name: 'Frontier',
        logo: 'https://logo.clearbit.com/frontier.com',
        types: ['fiber'],
        rating: 4.1,
        reviewCount: 24680,
        description: 'Frontier offers fiber internet with no annual contracts and includes Amazon eero WiFi at no extra cost.',
        pros: ['No annual contracts', 'No data caps', 'Price for life', 'Free eero WiFi included'],
        cons: ['Fiber not everywhere', 'Limited bundle options'],
        coverage: ['CA', 'TX', 'FL', 'CT', 'NY', 'WV', 'IN', 'OH', 'PA', 'AZ'],
        phone: '1-888-555-0107',
        plans: [
            { name: 'Frontier Fiber 500', speed: 500, uploadSpeed: 500, price: 49.99, promoPrice: 49.99, contract: 'None', dataCap: 'Unlimited', features: ['Price for life', 'Free eero WiFi', 'Symmetrical speeds'] },
            { name: 'Frontier Fiber 1 Gig', speed: 1000, uploadSpeed: 1000, price: 74.99, promoPrice: 74.99, contract: 'None', dataCap: 'Unlimited', features: ['1 Gig symmetrical', 'Whole home WiFi', 'No price increase'] },
            { name: 'Frontier Fiber 2 Gig', speed: 2000, uploadSpeed: 2000, price: 99.99, promoPrice: 99.99, contract: 'None', dataCap: 'Unlimited', features: ['2 Gig symmetrical', 'eero 6E Pro mesh', 'Future-proof'] },
            { name: 'Frontier Fiber 5 Gig', speed: 5000, uploadSpeed: 5000, price: 154.99, promoPrice: 154.99, contract: 'None', dataCap: 'Unlimited', features: ['5 Gig ultra-fast', 'Premium mesh WiFi', 'Best available'] }
        ]
    },
    {
        id: 'brightspeed',
        name: 'Brightspeed',
        logo: 'https://logo.clearbit.com/brightspeed.com',
        types: ['fiber', 'dsl'],
        rating: 3.7,
        reviewCount: 8920,
        description: 'Brightspeed is expanding fiber in underserved areas, providing modern internet infrastructure to rural communities.',
        pros: ['Fiber expansion underway', 'No data caps', 'Simple pricing', 'Good for rural areas'],
        cons: ['Limited fiber availability', 'DSL speeds slower'],
        coverage: ['NC', 'SC', 'OH', 'PA', 'FL', 'TX', 'MN', 'WI', 'IL', 'IN'],
        phone: '1-888-555-0108',
        plans: [
            { name: 'Brightspeed Fiber 500', speed: 500, uploadSpeed: 500, price: 55.00, promoPrice: 55.00, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['Fiber symmetrical', 'Smart WiFi', 'Work from home ready'] },
            { name: 'Brightspeed Fiber 1 Gig', speed: 1000, uploadSpeed: 1000, price: 65.00, promoPrice: 65.00, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['1 Gig symmetrical', 'Whole home coverage', 'Gaming ready'] },
            { name: 'Brightspeed Fiber 2 Gig', speed: 2000, uploadSpeed: 2000, price: 79.00, promoPrice: 79.00, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['2 Gig speeds', 'Multi-gig ready', 'Premium performance'] }
        ]
    },
    {
        id: 'altafiber',
        name: 'altafiber',
        logo: 'https://logo.clearbit.com/altafiber.com',
        types: ['fiber'],
        rating: 4.3,
        reviewCount: 18450,
        description: 'altafiber provides true fiber-to-the-home internet in the Cincinnati area with competitive pricing and local support.',
        pros: ['True fiber to home', 'No data caps', 'Local customer service', 'Competitive pricing'],
        cons: ['Limited to Cincinnati area', 'Smaller coverage'],
        coverage: ['OH', 'KY', 'IN'],
        phone: '1-888-555-0109',
        plans: [
            { name: 'altafiber 250', speed: 250, uploadSpeed: 250, price: 49.99, promoPrice: 39.99, contract: 'None', dataCap: 'Unlimited', features: ['Symmetrical speeds', 'No data caps', 'Local support'] },
            { name: 'altafiber 500', speed: 500, uploadSpeed: 500, price: 59.99, promoPrice: 49.99, contract: 'None', dataCap: 'Unlimited', features: ['Great for streaming', 'Work from home', 'Multiple devices'] },
            { name: 'altafiber 1 Gig', speed: 1000, uploadSpeed: 1000, price: 69.99, promoPrice: 59.99, contract: 'None', dataCap: 'Unlimited', features: ['1 Gig symmetrical', 'Best for power users', 'Gaming optimized'] },
            { name: 'altafiber 2 Gig', speed: 2000, uploadSpeed: 2000, price: 99.99, promoPrice: 89.99, contract: 'None', dataCap: 'Unlimited', features: ['2 Gig ultra-fast', 'Premium WiFi', 'Future-proof'] }
        ]
    }
];

// ZIP code mapping (sample data)
const zipCodeMap = {
    '10001': { city: 'New York', state: 'NY', providers: ['spectrum', 'optimum', 'earthlink', 'tmobile'] },
    '90210': { city: 'Beverly Hills', state: 'CA', providers: ['spectrum', 'att', 'frontier', 'earthlink', 'tmobile'] },
    '60601': { city: 'Chicago', state: 'IL', providers: ['att', 'earthlink', 'tmobile', 'brightspeed'] },
    '77001': { city: 'Houston', state: 'TX', providers: ['att', 'spectrum', 'earthlink', 'tmobile', 'windstream'] },
    '33101': { city: 'Miami', state: 'FL', providers: ['att', 'spectrum', 'earthlink', 'tmobile', 'frontier'] },
    '45202': { city: 'Cincinnati', state: 'OH', providers: ['altafiber', 'spectrum', 'att', 'tmobile'] },
    '28202': { city: 'Charlotte', state: 'NC', providers: ['spectrum', 'att', 'brightspeed', 'tmobile', 'windstream'] },
    '19101': { city: 'Philadelphia', state: 'PA', providers: ['optimum', 'earthlink', 'tmobile', 'frontier', 'brightspeed'] }
};

// Helper functions
function getProviderById(id) {
    return providers.find(p => p.id === id);
}

function getProvidersByZip(zip) {
    const location = zipCodeMap[zip];
    if (location) {
        return {
            city: location.city,
            state: location.state,
            providers: location.providers.map(id => getProviderById(id)).filter(Boolean)
        };
    }
    // Return random providers for unknown ZIP codes
    const shuffled = [...providers].sort(() => 0.5 - Math.random());
    return {
        city: 'Your Area',
        state: getStateFromZip(zip),
        providers: shuffled.slice(0, Math.floor(Math.random() * 4) + 4)
    };
}

function getStateFromZip(zip) {
    const firstDigit = parseInt(zip.charAt(0));
    const states = { 0: 'CT', 1: 'NY', 2: 'VA', 3: 'FL', 4: 'IN', 5: 'IA', 6: 'IL', 7: 'TX', 8: 'CO', 9: 'CA' };
    return states[firstDigit] || 'US';
}

function formatSpeed(speed) {
    if (speed >= 1000) {
        return (speed / 1000).toFixed(speed % 1000 === 0 ? 0 : 1) + ' Gbps';
    }
    return speed + ' Mbps';
}

function formatPrice(price) {
    return '$' + price.toFixed(2);
}
