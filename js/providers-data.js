// ============================================
// Internet 4 ALL — Provider Data
// All 10 contracted providers + comprehensive ZIP mapping
// ============================================

const MAIN_PHONE = '1-888-555-0123';

const providers = [
    {
        id: 'spectrum',
        name: 'Spectrum',
        logo: 'https://logo.clearbit.com/spectrum.com',
        types: ['cable'],
        rating: 4.2,
        reviewCount: 45230,
        isPartner: true,
        description: 'Spectrum is one of the largest cable internet providers in the US, offering reliable high-speed internet with no data caps or contracts required.',
        pros: ['No data caps', 'No contracts required', 'Free modem included', 'Wide nationwide availability', '30-day money-back guarantee'],
        cons: ['Price increases after promo period', 'Upload speeds slower than fiber'],
        coverage: ['NY', 'TX', 'CA', 'FL', 'OH', 'NC', 'WI', 'MO', 'KY', 'SC', 'GA', 'TN', 'AL', 'IN', 'LA', 'MS', 'ME', 'MA', 'MN', 'NE', 'NV', 'NH', 'NJ', 'NM', 'OR', 'WA', 'WV', 'HI'],
        phone: '1-888-555-0101',
        plans: [
            { name: 'Spectrum Internet', speed: 300, uploadSpeed: 10, price: 49.99, promoPrice: 29.99, contract: 'None', dataCap: 'Unlimited', features: ['Free modem', 'No data caps', 'Free antivirus'] },
            { name: 'Spectrum Internet Ultra', speed: 500, uploadSpeed: 20, price: 69.99, promoPrice: 49.99, contract: 'None', dataCap: 'Unlimited', features: ['Free modem', 'Great for 4K streaming', 'No data caps'] },
            { name: 'Spectrum Internet Gig', speed: 1000, uploadSpeed: 35, price: 89.99, promoPrice: 69.99, contract: 'None', dataCap: 'Unlimited', features: ['Free modem', 'Perfect for large households', 'Gaming optimized'] },
            { name: 'Spectrum Internet 2 Gig', speed: 2000, uploadSpeed: 100, price: 109.99, promoPrice: 89.99, contract: 'None', dataCap: 'Unlimited', features: ['Free modem', 'Fastest Spectrum plan', 'Advanced WiFi router', 'Best for power users'] }
        ]
    },
    {
        id: 'att',
        name: 'AT&T Fiber',
        logo: 'https://logo.clearbit.com/att.com',
        types: ['fiber'],
        rating: 4.4,
        reviewCount: 62150,
        isPartner: true,
        description: 'AT&T Fiber delivers blazing-fast symmetrical internet speeds up to 2 Gbps. No data caps, no annual contracts, and a price lock guarantee on every plan.',
        pros: ['Symmetrical upload/download speeds', 'No data caps', 'Price lock guarantee', 'Speeds up to 2 Gig', 'Wi-Fi 6E gateway included'],
        cons: ['Fiber not available in all areas', 'Professional install required'],
        coverage: ['TX', 'CA', 'FL', 'IL', 'GA', 'MI', 'OH', 'NC', 'TN', 'AL', 'AR', 'IN', 'KS', 'KY', 'LA', 'MO', 'MS', 'NV', 'OK', 'SC', 'WI'],
        phone: '1-888-555-0102',
        plans: [
            { name: 'AT&T Fiber 300', speed: 300, uploadSpeed: 300, price: 55.00, promoPrice: 55.00, contract: 'None', dataCap: 'Unlimited', features: ['Symmetrical speeds', 'No data caps', 'Free installation'] },
            { name: 'AT&T Fiber 500', speed: 500, uploadSpeed: 500, price: 65.00, promoPrice: 65.00, contract: 'None', dataCap: 'Unlimited', features: ['Great for 4K streaming', 'Work from home ready', 'Gaming optimized'] },
            { name: 'AT&T Fiber 1 Gig', speed: 1000, uploadSpeed: 1000, price: 80.00, promoPrice: 80.00, contract: 'None', dataCap: 'Unlimited', features: ['1 Gig symmetrical', 'Smart Home Manager', 'Best for families'] },
            { name: 'AT&T Fiber 2 Gig', speed: 2000, uploadSpeed: 2000, price: 110.00, promoPrice: 110.00, contract: 'None', dataCap: 'Unlimited', features: ['Multi-gig speeds', 'Wi-Fi 6E gateway', 'Future-proof'] }
        ]
    },
    {
        id: 'att-air',
        name: 'AT&T Air',
        logo: 'https://logo.clearbit.com/att.com',
        types: ['5g'],
        rating: 4.2,
        reviewCount: 15300,
        isPartner: true,
        description: 'AT&T Air is fixed wireless internet powered by AT&T\'s 5G and LTE network. Fast setup, no annual contract, and no equipment fees — internet in minutes, not days.',
        pros: ['Quick self-install', 'No annual contract', 'No equipment fees', 'No data caps', 'Available where fiber isn\'t'],
        cons: ['Speeds vary by location and congestion', 'Requires compatible wireless coverage'],
        coverage: ['Nationwide'],
        phone: '1-888-555-0102',
        plans: [
            { name: 'AT&T Air', speed: 200, uploadSpeed: 30, price: 55.00, promoPrice: 55.00, contract: 'None', dataCap: 'Unlimited', features: ['No annual contract', 'No equipment fees', 'Self-install', 'AT&T All-Fi gateway'] },
            { name: 'AT&T Air (with phone bundle)', speed: 200, uploadSpeed: 30, price: 45.00, promoPrice: 45.00, contract: 'None', dataCap: 'Unlimited', features: ['Bundle discount', 'No annual contract', 'No equipment fees', 'Self-install'] }
        ]
    },
    {
        id: 'tmobile',
        name: 'T-Mobile Fiber',
        logo: 'https://logo.clearbit.com/t-mobile.com',
        types: ['fiber'],
        rating: 4.3,
        reviewCount: 18200,
        isPartner: true,
        description: 'T-Mobile Fiber (formerly Metronet) delivers ultra-fast fiber internet with speeds up to 2 Gigs. Symmetrical upload and download speeds, no contracts, no data caps, and Wi-Fi 7 included.',
        pros: ['Speeds up to 2 Gigs', 'Symmetrical upload/download', 'No contracts', 'No data caps', 'Wi-Fi 7 gateway included', 'Price lock guarantee'],
        cons: ['Fiber availability limited to select markets', 'New to some areas (expanding)'],
        coverage: ['Select markets — IN, OH, MI, WI, MN, TX, FL, NC, VA and expanding'],
        phone: '1-888-555-0103',
        plans: [
            { name: 'T-Mobile Fiber 2 Gig', speed: 2000, uploadSpeed: 2000, price: 70.00, promoPrice: 55.00, contract: 'None', dataCap: 'Unlimited', features: ['Symmetrical upload/download', 'Wi-Fi 7 gateway included', 'No data caps', 'Price lock guarantee'] },
            { name: 'T-Mobile Fiber 1 Gig', speed: 1000, uploadSpeed: 1000, price: 60.00, promoPrice: 50.00, contract: 'None', dataCap: 'Unlimited', features: ['Symmetrical upload/download', 'Wi-Fi 7 gateway included', 'No data caps', 'Price lock guarantee'] },
            { name: 'T-Mobile Fiber 500', speed: 500, uploadSpeed: 500, price: 40.00, promoPrice: 35.00, contract: 'None', dataCap: 'Unlimited', features: ['Symmetrical upload/download', 'Wi-Fi 7 gateway included', 'No data caps'] }
        ]
    },
    {
        id: 'tmobile-5g',
        name: 'T-Mobile 5G Wireless',
        logo: 'https://logo.clearbit.com/t-mobile.com',
        types: ['5g'],
        rating: 4.1,
        reviewCount: 28450,
        isPartner: false,
        description: 'T-Mobile 5G Home Internet delivers wireless broadband via their extensive 5G network. No contracts, no data caps, no equipment fees.',
        pros: ['No contracts', 'No data caps', 'Simple pricing', 'Quick self-setup'],
        cons: ['Speed varies by location and congestion', 'Requires 5G/LTE coverage at address'],
        coverage: ['Nationwide'],
        phone: '1-888-555-0103',
        plans: [
            { name: 'T-Mobile 5G Home Internet', speed: 245, uploadSpeed: 31, price: 50.00, promoPrice: 50.00, contract: 'None', dataCap: 'Unlimited', features: ['Price lock guarantee', 'Free gateway device', '15-day test drive'] },
            { name: 'T-Mobile All Access (with phone)', speed: 245, uploadSpeed: 31, price: 40.00, promoPrice: 40.00, contract: 'None', dataCap: 'Unlimited', features: ['Bundle discount', 'Price lock guarantee', 'Free gateway'] }
        ]
    },
    {
        id: 'verizon',
        name: 'Verizon',
        logo: 'https://logo.clearbit.com/verizon.com',
        types: ['fiber', '5g'],
        rating: 4.5,
        reviewCount: 72340,
        isPartner: true,
        description: 'Verizon offers Fios fiber internet with symmetrical speeds up to 2 Gbps, plus 5G Home Internet in select areas powered by their ultra-fast 5G network.',
        pros: ['Fios: True symmetrical fiber', 'No data caps', 'No annual contracts', '5G Home: No installation needed', 'Highly rated customer service'],
        cons: ['Fios availability limited to Northeast', '5G Home: Coverage still expanding'],
        coverage: ['NY', 'NJ', 'CT', 'PA', 'MA', 'RI', 'VA', 'MD', 'DC', 'DE', 'Nationwide 5G'],
        phone: '1-888-555-0110',
        plans: [
            { name: 'Verizon Fios 300', speed: 300, uploadSpeed: 300, price: 49.99, promoPrice: 49.99, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['Symmetrical upload/download', 'No data caps', 'Free router for 3 years'] },
            { name: 'Verizon Fios 500', speed: 500, uploadSpeed: 500, price: 69.99, promoPrice: 69.99, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['Great for streaming + gaming', 'Whole-home Wi-Fi', 'No annual contract'] },
            { name: 'Verizon Fios Gigabit', speed: 1000, uploadSpeed: 1000, price: 89.99, promoPrice: 89.99, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['1 Gig symmetrical', 'Wi-Fi 6E router', 'Best for power users'] },
            { name: 'Verizon Fios 2 Gig', speed: 2000, uploadSpeed: 2000, price: 119.99, promoPrice: 119.99, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['2 Gig symmetrical', 'Premium Wi-Fi 6E', 'Future-proof'] },
            { name: 'Verizon 5G Home', speed: 300, uploadSpeed: 50, price: 60.00, promoPrice: 50.00, contract: 'None', dataCap: 'Unlimited', type: '5g', features: ['No installation required', 'Self-setup in minutes', 'Prism Wi-Fi included'] },
            { name: 'Verizon 5G Home Plus', speed: 1000, uploadSpeed: 100, price: 80.00, promoPrice: 70.00, contract: 'None', dataCap: 'Unlimited', type: '5g', features: ['Ultra Wideband 5G', 'VPN access included', 'Cloud storage'] }
        ]
    },
    {
        id: 'windstream',
        name: 'Kinetic by Windstream',
        logo: 'https://logo.clearbit.com/windstream.com',
        types: ['fiber', 'dsl'],
        rating: 3.9,
        reviewCount: 15680,
        isPartner: true,
        description: 'Kinetic by Windstream offers fiber and DSL internet across 18 states, specializing in bringing broadband to rural and suburban communities.',
        pros: ['Available in rural areas', 'No data caps', 'Price for life on fiber plans', 'Bundle options available'],
        cons: ['Limited fiber availability', 'DSL speeds vary by distance'],
        coverage: ['AR', 'GA', 'KY', 'NE', 'NM', 'NY', 'NC', 'OH', 'OK', 'PA', 'SC', 'TX', 'FL', 'IA', 'MN', 'AL', 'MS', 'WV'],
        phone: '1-888-555-0104',
        plans: [
            { name: 'Kinetic Internet 200', speed: 200, uploadSpeed: 200, price: 55.00, promoPrice: 55.00, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['Symmetrical speeds', 'Price for life', 'Free WiFi modem'] },
            { name: 'Kinetic Internet 500', speed: 500, uploadSpeed: 500, price: 65.00, promoPrice: 65.00, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['Work from home ready', 'Multiple 4K streams', 'Whole home WiFi'] },
            { name: 'Kinetic Gig', speed: 1000, uploadSpeed: 1000, price: 79.00, promoPrice: 79.00, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['Gig symmetrical', 'Price for life', 'Premium WiFi 6'] }
        ]
    },
    {
        id: 'optimum',
        name: 'Optimum',
        logo: 'https://logo.clearbit.com/optimum.com',
        types: ['fiber', 'cable'],
        rating: 4.0,
        reviewCount: 31250,
        isPartner: true,
        description: 'Optimum provides cable and fiber internet primarily in the Northeastern US, with competitive pricing and Smart WiFi 6 included.',
        pros: ['No annual contracts', 'No data caps', 'Smart WiFi 6 included', 'Good bundle deals'],
        cons: ['Limited to Northeast region', 'Price increases after year 1'],
        coverage: ['NY', 'NJ', 'CT', 'PA'],
        phone: '1-888-555-0106',
        plans: [
            { name: 'Optimum 300', speed: 300, uploadSpeed: 20, price: 60.00, promoPrice: 40.00, contract: 'None', dataCap: 'Unlimited', features: ['Smart WiFi 6', 'Free installation', 'Optimum app'] },
            { name: 'Optimum 500 Fiber', speed: 500, uploadSpeed: 500, price: 80.00, promoPrice: 60.00, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['Fiber symmetrical', 'Great for streaming', 'WiFi 6 router'] },
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
        isPartner: true,
        description: 'Frontier offers fiber internet with no annual contracts, no data caps, and includes a free Amazon eero WiFi system.',
        pros: ['No annual contracts', 'No data caps', 'Price for life guarantee', 'Free eero WiFi included'],
        cons: ['Fiber not available everywhere', 'Limited bundle options'],
        coverage: ['CA', 'TX', 'FL', 'CT', 'NY', 'WV', 'IN', 'OH', 'PA', 'AZ', 'AL', 'IL', 'SC', 'TN', 'NM', 'GA', 'NC', 'MN', 'WI', 'MS', 'NE', 'IA'],
        phone: '1-888-555-0107',
        plans: [
            { name: 'Frontier Fiber 500', speed: 500, uploadSpeed: 500, price: 49.99, promoPrice: 49.99, contract: 'None', dataCap: 'Unlimited', features: ['Price for life', 'Free eero WiFi', 'Symmetrical speeds'] },
            { name: 'Frontier Fiber 1 Gig', speed: 1000, uploadSpeed: 1000, price: 74.99, promoPrice: 74.99, contract: 'None', dataCap: 'Unlimited', features: ['1 Gig symmetrical', 'Whole home WiFi', 'No price increase'] },
            { name: 'Frontier Fiber 2 Gig', speed: 2000, uploadSpeed: 2000, price: 99.99, promoPrice: 99.99, contract: 'None', dataCap: 'Unlimited', features: ['2 Gig symmetrical', 'eero 6E Pro mesh', 'Future-proof'] },
            { name: 'Frontier Fiber 5 Gig', speed: 5000, uploadSpeed: 5000, price: 154.99, promoPrice: 154.99, contract: 'None', dataCap: 'Unlimited', features: ['5 Gig ultra-fast', 'Premium mesh WiFi', 'Best available'] }
        ]
    },
    {
        id: 'earthlink',
        name: 'EarthLink',
        logo: 'https://logo.clearbit.com/earthlink.net',
        types: ['fiber', 'cable', 'dsl'],
        rating: 3.8,
        reviewCount: 12340,
        isPartner: true,
        description: 'EarthLink delivers internet across the country through partnerships with major providers, offering straightforward pricing with no data caps.',
        pros: ['No data caps', 'No contracts', 'Straightforward pricing', '24/7 customer support'],
        cons: ['Uses partner networks', 'Availability varies by area'],
        coverage: ['Nationwide'],
        phone: '1-888-555-0105',
        plans: [
            { name: 'EarthLink Internet', speed: 100, uploadSpeed: 10, price: 59.95, promoPrice: 49.95, contract: 'None', dataCap: 'Unlimited', features: ['No data caps', '24/7 support', 'No contracts'] },
            { name: 'EarthLink Fiber 300', speed: 300, uploadSpeed: 300, price: 69.95, promoPrice: 69.95, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['Symmetrical speeds', 'Price lock', 'Free install'] },
            { name: 'EarthLink Fiber 1000', speed: 1000, uploadSpeed: 1000, price: 99.95, promoPrice: 99.95, contract: 'None', dataCap: 'Unlimited', type: 'fiber', features: ['Gig speeds', 'Best for power users', 'No throttling'] }
        ]
    },
    {
        id: 'brightspeed',
        name: 'Brightspeed',
        logo: 'https://logo.clearbit.com/brightspeed.com',
        types: ['fiber', 'dsl'],
        rating: 3.7,
        reviewCount: 8920,
        isPartner: true,
        description: 'Brightspeed is rapidly expanding fiber to underserved areas, bringing modern internet infrastructure to rural communities across 20 states.',
        pros: ['Aggressive fiber expansion', 'No data caps', 'Simple pricing', 'Focus on rural areas'],
        cons: ['Fiber still limited in many areas', 'DSL speeds on legacy network are slower'],
        coverage: ['NC', 'SC', 'OH', 'PA', 'FL', 'TX', 'MN', 'WI', 'IL', 'IN', 'VA', 'TN', 'AL', 'MS', 'MO', 'KS', 'OK', 'AR', 'LA', 'NM'],
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
        isPartner: true,
        description: 'altafiber provides true fiber-to-the-home internet in the Greater Cincinnati area with competitive pricing and local customer support.',
        pros: ['True fiber to the home', 'No data caps', 'Local customer service', 'Competitive pricing'],
        cons: ['Limited to Cincinnati metro area', 'Smaller service footprint'],
        coverage: ['OH', 'KY', 'IN'],
        phone: '1-888-555-0109',
        plans: [
            { name: 'altafiber 250', speed: 250, uploadSpeed: 250, price: 49.99, promoPrice: 39.99, contract: 'None', dataCap: 'Unlimited', features: ['Symmetrical speeds', 'No data caps', 'Local support'] },
            { name: 'altafiber 500', speed: 500, uploadSpeed: 500, price: 59.99, promoPrice: 49.99, contract: 'None', dataCap: 'Unlimited', features: ['Great for streaming', 'Work from home', 'Multiple devices'] },
            { name: 'altafiber 1 Gig', speed: 1000, uploadSpeed: 1000, price: 69.99, promoPrice: 59.99, contract: 'None', dataCap: 'Unlimited', features: ['1 Gig symmetrical', 'Best for power users', 'Gaming optimized'] },
            { name: 'altafiber 2 Gig', speed: 2000, uploadSpeed: 2000, price: 99.99, promoPrice: 89.99, contract: 'None', dataCap: 'Unlimited', features: ['2 Gig ultra-fast', 'Premium WiFi 6', 'Future-proof'] }
        ]
    },
    {
        id: 'xfinity',
        name: 'Xfinity',
        logo: 'https://logo.clearbit.com/xfinity.com',
        types: ['cable', 'fiber'],
        rating: 3.9,
        reviewCount: 72000,
        isPartner: false,
        description: 'Xfinity by Comcast offers cable and fiber internet with speeds up to 2 Gbps in select areas.',
        pros: ['Wide availability', 'Fast speeds', 'Bundle options with TV/mobile'],
        cons: ['Data cap of 1.2 TB on most plans', 'Price increases after promo'],
        coverage: ['Nationwide'],
        phone: '1-888-555-0123',
        plans: [
            { name: 'Xfinity Connect', speed: 75, uploadSpeed: 5, price: 49.99, promoPrice: 19.99, contract: 'None', dataCap: '1.2 TB', features: ['Good for basic browsing'] },
            { name: 'Xfinity Connect More', speed: 200, uploadSpeed: 10, price: 60.00, promoPrice: 35.00, contract: 'None', dataCap: '1.2 TB', features: ['Streaming-ready', 'Multiple devices'] },
            { name: 'Xfinity Fast', speed: 400, uploadSpeed: 10, price: 70.00, promoPrice: 55.00, contract: 'None', dataCap: '1.2 TB', features: ['4K streaming', 'Work from home'] },
            { name: 'Xfinity Superfast', speed: 800, uploadSpeed: 20, price: 80.00, promoPrice: 65.00, contract: 'None', dataCap: '1.2 TB', features: ['Large households', 'Gaming'] },
            { name: 'Xfinity Gigabit', speed: 1000, uploadSpeed: 35, price: 90.00, promoPrice: 75.00, contract: 'None', dataCap: '1.2 TB', features: ['Gig speeds', 'Advanced WiFi'] },
            { name: 'Xfinity Gigabit Extra', speed: 2000, uploadSpeed: 200, price: 120.00, promoPrice: 100.00, contract: 'None', dataCap: 'Unlimited', features: ['2 Gig speeds', 'Unlimited data included'] }
        ]
    },
    {
        id: 'starlink',
        name: 'Starlink',
        logo: 'https://logo.clearbit.com/starlink.com',
        types: ['satellite'],
        rating: 4.0,
        reviewCount: 32000,
        isPartner: false,
        description: 'Starlink by SpaceX provides low-latency satellite internet virtually anywhere, ideal for rural and underserved areas.',
        pros: ['Available almost anywhere', 'Low latency for satellite', 'No contracts'],
        cons: ['$599 equipment cost', 'Speeds vary with congestion', 'Weather can affect signal'],
        coverage: ['Nationwide'],
        phone: '1-888-555-0123',
        plans: [
            { name: 'Starlink Standard', speed: 100, uploadSpeed: 10, price: 120.00, promoPrice: 120.00, contract: 'None', dataCap: '1 TB priority', features: ['Low latency', 'Self-install', 'No contract'] },
            { name: 'Starlink Priority', speed: 220, uploadSpeed: 25, price: 250.00, promoPrice: 250.00, contract: 'None', dataCap: '40 GB priority', features: ['Faster speeds', 'Priority access', 'Business-ready'] }
        ]
    },
    {
        id: 'viasat',
        name: 'Viasat',
        logo: 'https://logo.clearbit.com/viasat.com',
        types: ['satellite'],
        rating: 3.4,
        reviewCount: 18500,
        isPartner: false,
        description: 'Viasat offers satellite internet across the country including the most rural areas. Speeds up to 150 Mbps depending on plan and location.',
        pros: ['Available everywhere', 'Built-in WiFi modem', 'Bundle with phone'],
        cons: ['High latency', 'Data caps on all plans', 'Speeds slow after cap'],
        coverage: ['Nationwide'],
        phone: '1-888-555-0123',
        plans: [
            { name: 'Viasat Unleashed 25', speed: 25, uploadSpeed: 3, price: 49.99, promoPrice: 49.99, contract: '2-year', dataCap: '60 GB', features: ['Basic browsing', 'Email and social media'] },
            { name: 'Viasat Unleashed 50', speed: 50, uploadSpeed: 5, price: 74.99, promoPrice: 74.99, contract: '2-year', dataCap: '100 GB', features: ['Streaming capable', 'Multiple devices'] },
            { name: 'Viasat Unleashed 100', speed: 100, uploadSpeed: 10, price: 99.99, promoPrice: 99.99, contract: '2-year', dataCap: '150 GB', features: ['HD streaming', 'Video calls'] },
            { name: 'Viasat Unleashed 150', speed: 150, uploadSpeed: 10, price: 149.99, promoPrice: 149.99, contract: '2-year', dataCap: '200 GB', features: ['Best Viasat speeds', 'Families'] }
        ]
    },
    {
        id: 'hughesnet',
        name: 'HughesNet',
        logo: 'https://logo.clearbit.com/hughesnet.com',
        types: ['satellite'],
        rating: 3.2,
        reviewCount: 12500,
        isPartner: false,
        description: 'HughesNet offers satellite internet to customers nationwide, including the most remote locations. Plans with up to 100 Mbps speeds.',
        pros: ['Available everywhere in the US', 'No hard data caps', 'Built-in WiFi'],
        cons: ['High latency', 'Speeds reduced after data threshold', '2-year contract required'],
        coverage: ['Nationwide'],
        phone: '1-888-555-0123',
        plans: [
            { name: 'HughesNet Select', speed: 50, uploadSpeed: 5, price: 49.99, promoPrice: 49.99, contract: '2-year', dataCap: '100 GB', features: ['Basic satellite internet', 'Built-in WiFi'] },
            { name: 'HughesNet Elite', speed: 100, uploadSpeed: 5, price: 74.99, promoPrice: 74.99, contract: '2-year', dataCap: '200 GB', features: ['Faster speeds', 'More data', 'Video streaming'] }
        ]
    },
    {
        id: 'minternet',
        name: 'MINTernet',
        logo: null,
        types: ['5g'],
        rating: 3.8,
        reviewCount: 4200,
        isPartner: false,
        description: 'MINTernet offers affordable 5G/4G LTE home internet powered by T-Mobile\'s network. Low-cost wireless broadband with no contracts.',
        pros: ['Very affordable', 'No contracts', 'Uses T-Mobile network', 'Quick setup'],
        cons: ['Speeds vary by coverage area', 'Limited customer support'],
        coverage: ['Nationwide'],
        phone: '1-888-555-0123',
        plans: [
            { name: 'MINTernet Unlimited', speed: 200, uploadSpeed: 20, price: 30.00, promoPrice: 30.00, contract: 'None', dataCap: 'Unlimited', features: ['No contract', 'Affordable', '5G/4G LTE'] }
        ]
    }
];

// ============================================
// Comprehensive ZIP Code Mapping
// Uses ZIP3 prefixes for wide coverage + exact ZIP5 for major metros
// ============================================

const zipCodeMap = {
    '10001': { city: 'New York', state: 'NY', providers: ['spectrum', 'optimum', 'verizon', 'earthlink', 'tmobile'] },
    '10002': { city: 'New York', state: 'NY', providers: ['spectrum', 'optimum', 'verizon', 'earthlink', 'tmobile'] },
    '10003': { city: 'New York', state: 'NY', providers: ['spectrum', 'optimum', 'verizon', 'earthlink', 'tmobile'] },
    '10004': { city: 'New York', state: 'NY', providers: ['spectrum', 'optimum', 'verizon', 'earthlink', 'tmobile'] },
    '10005': { city: 'New York', state: 'NY', providers: ['spectrum', 'optimum', 'verizon', 'earthlink', 'tmobile'] },
    '10010': { city: 'New York', state: 'NY', providers: ['spectrum', 'optimum', 'verizon', 'earthlink', 'tmobile'] },
    '11201': { city: 'Brooklyn', state: 'NY', providers: ['spectrum', 'optimum', 'verizon', 'earthlink', 'tmobile'] },
    '07001': { city: 'Newark', state: 'NJ', providers: ['optimum', 'verizon', 'earthlink', 'tmobile'] },
    '07102': { city: 'Newark', state: 'NJ', providers: ['optimum', 'verizon', 'earthlink', 'tmobile'] },
    '06101': { city: 'Hartford', state: 'CT', providers: ['frontier', 'optimum', 'verizon', 'earthlink', 'tmobile'] },
    '19101': { city: 'Philadelphia', state: 'PA', providers: ['verizon', 'optimum', 'earthlink', 'tmobile', 'frontier', 'brightspeed'] },
    '19103': { city: 'Philadelphia', state: 'PA', providers: ['verizon', 'optimum', 'earthlink', 'tmobile', 'frontier'] },
    '20001': { city: 'Washington', state: 'DC', providers: ['verizon', 'att', 'earthlink', 'tmobile'] },
    '20005': { city: 'Washington', state: 'DC', providers: ['verizon', 'att', 'earthlink', 'tmobile'] },
    '21201': { city: 'Baltimore', state: 'MD', providers: ['verizon', 'earthlink', 'tmobile'] },
    '02101': { city: 'Boston', state: 'MA', providers: ['verizon', 'earthlink', 'tmobile', 'spectrum'] },
    '02201': { city: 'Boston', state: 'MA', providers: ['verizon', 'earthlink', 'tmobile', 'spectrum'] },
    '90001': { city: 'Los Angeles', state: 'CA', providers: ['spectrum', 'att', 'frontier', 'earthlink', 'tmobile'] },
    '90005': { city: 'Los Angeles', state: 'CA', providers: ['spectrum', 'att', 'frontier', 'earthlink', 'tmobile'] },
    '90012': { city: 'Los Angeles', state: 'CA', providers: ['spectrum', 'att', 'frontier', 'earthlink', 'tmobile'] },
    '90210': { city: 'Beverly Hills', state: 'CA', providers: ['spectrum', 'att', 'frontier', 'earthlink', 'tmobile'] },
    '94102': { city: 'San Francisco', state: 'CA', providers: ['att', 'earthlink', 'tmobile', 'frontier', 'spectrum'] },
    '94105': { city: 'San Francisco', state: 'CA', providers: ['att', 'earthlink', 'tmobile', 'frontier'] },
    '92101': { city: 'San Diego', state: 'CA', providers: ['spectrum', 'att', 'earthlink', 'tmobile'] },
    '95101': { city: 'San Jose', state: 'CA', providers: ['att', 'earthlink', 'tmobile', 'frontier'] },
    '60601': { city: 'Chicago', state: 'IL', providers: ['att', 'earthlink', 'tmobile', 'brightspeed'] },
    '60602': { city: 'Chicago', state: 'IL', providers: ['att', 'earthlink', 'tmobile', 'brightspeed'] },
    '60611': { city: 'Chicago', state: 'IL', providers: ['att', 'earthlink', 'tmobile', 'brightspeed'] },
    '77001': { city: 'Houston', state: 'TX', providers: ['att', 'spectrum', 'earthlink', 'tmobile', 'windstream', 'frontier'] },
    '77002': { city: 'Houston', state: 'TX', providers: ['att', 'spectrum', 'earthlink', 'tmobile', 'frontier'] },
    '75201': { city: 'Dallas', state: 'TX', providers: ['att', 'spectrum', 'frontier', 'earthlink', 'tmobile'] },
    '75202': { city: 'Dallas', state: 'TX', providers: ['att', 'spectrum', 'frontier', 'earthlink', 'tmobile'] },
    '78201': { city: 'San Antonio', state: 'TX', providers: ['att', 'spectrum', 'earthlink', 'tmobile'] },
    '73301': { city: 'Austin', state: 'TX', providers: ['att', 'spectrum', 'earthlink', 'tmobile', 'frontier'] },
    '33101': { city: 'Miami', state: 'FL', providers: ['att', 'spectrum', 'earthlink', 'tmobile', 'frontier'] },
    '33130': { city: 'Miami', state: 'FL', providers: ['att', 'spectrum', 'earthlink', 'tmobile'] },
    '33301': { city: 'Fort Lauderdale', state: 'FL', providers: ['att', 'spectrum', 'earthlink', 'tmobile'] },
    '32801': { city: 'Orlando', state: 'FL', providers: ['spectrum', 'att', 'earthlink', 'tmobile', 'brightspeed'] },
    '33602': { city: 'Tampa', state: 'FL', providers: ['spectrum', 'frontier', 'att', 'earthlink', 'tmobile'] },
    '30301': { city: 'Atlanta', state: 'GA', providers: ['att', 'earthlink', 'tmobile', 'spectrum', 'windstream'] },
    '30303': { city: 'Atlanta', state: 'GA', providers: ['att', 'earthlink', 'tmobile', 'spectrum'] },
    '85001': { city: 'Phoenix', state: 'AZ', providers: ['earthlink', 'tmobile', 'frontier'] },
    '80201': { city: 'Denver', state: 'CO', providers: ['earthlink', 'tmobile'] },
    '98101': { city: 'Seattle', state: 'WA', providers: ['spectrum', 'earthlink', 'tmobile'] },
    '97201': { city: 'Portland', state: 'OR', providers: ['spectrum', 'earthlink', 'tmobile', 'frontier'] },
    '89101': { city: 'Las Vegas', state: 'NV', providers: ['att', 'earthlink', 'tmobile', 'spectrum'] },
    '37201': { city: 'Nashville', state: 'TN', providers: ['att', 'spectrum', 'earthlink', 'tmobile', 'brightspeed'] },
    '28202': { city: 'Charlotte', state: 'NC', providers: ['spectrum', 'att', 'brightspeed', 'tmobile', 'windstream', 'earthlink'] },
    '27601': { city: 'Raleigh', state: 'NC', providers: ['att', 'spectrum', 'earthlink', 'tmobile', 'brightspeed'] },
    '29401': { city: 'Charleston', state: 'SC', providers: ['spectrum', 'att', 'earthlink', 'tmobile', 'brightspeed'] },
    '23219': { city: 'Richmond', state: 'VA', providers: ['verizon', 'earthlink', 'tmobile', 'brightspeed'] },
    '48201': { city: 'Detroit', state: 'MI', providers: ['att', 'earthlink', 'tmobile', 'spectrum'] },
    '55401': { city: 'Minneapolis', state: 'MN', providers: ['earthlink', 'tmobile', 'brightspeed', 'windstream'] },
    '53201': { city: 'Milwaukee', state: 'WI', providers: ['spectrum', 'att', 'earthlink', 'tmobile', 'brightspeed'] },
    '63101': { city: 'St. Louis', state: 'MO', providers: ['att', 'spectrum', 'earthlink', 'tmobile', 'brightspeed'] },
    '64101': { city: 'Kansas City', state: 'MO', providers: ['att', 'spectrum', 'earthlink', 'tmobile'] },
    '46201': { city: 'Indianapolis', state: 'IN', providers: ['att', 'spectrum', 'earthlink', 'tmobile', 'brightspeed', 'frontier', 'altafiber'] },
    '44101': { city: 'Cleveland', state: 'OH', providers: ['spectrum', 'att', 'earthlink', 'tmobile', 'brightspeed', 'frontier'] },
    '43201': { city: 'Columbus', state: 'OH', providers: ['spectrum', 'att', 'earthlink', 'tmobile', 'windstream', 'brightspeed'] },
    '45202': { city: 'Cincinnati', state: 'OH', providers: ['altafiber', 'spectrum', 'att', 'tmobile', 'earthlink'] },
    '45203': { city: 'Cincinnati', state: 'OH', providers: ['altafiber', 'spectrum', 'att', 'tmobile'] },
    '40201': { city: 'Louisville', state: 'KY', providers: ['att', 'spectrum', 'earthlink', 'tmobile', 'windstream'] },
    '35201': { city: 'Birmingham', state: 'AL', providers: ['att', 'spectrum', 'earthlink', 'tmobile', 'brightspeed'] },
    '70112': { city: 'New Orleans', state: 'LA', providers: ['att', 'earthlink', 'tmobile', 'windstream'] },
    '73101': { city: 'Oklahoma City', state: 'OK', providers: ['att', 'earthlink', 'tmobile', 'windstream'] },
    '72201': { city: 'Little Rock', state: 'AR', providers: ['att', 'earthlink', 'tmobile', 'windstream', 'brightspeed'] },
    '39201': { city: 'Jackson', state: 'MS', providers: ['att', 'earthlink', 'tmobile', 'windstream', 'brightspeed'] },
    '68101': { city: 'Omaha', state: 'NE', providers: ['earthlink', 'tmobile', 'windstream'] },
    '50301': { city: 'Des Moines', state: 'IA', providers: ['earthlink', 'tmobile', 'windstream', 'frontier'] },
    '87101': { city: 'Albuquerque', state: 'NM', providers: ['earthlink', 'tmobile', 'windstream', 'frontier'] },
    '96801': { city: 'Honolulu', state: 'HI', providers: ['spectrum', 'tmobile'] },
    '23451': { city: 'Virginia Beach', state: 'VA', providers: ['verizon', 'earthlink', 'tmobile', 'spectrum', 'brightspeed'] },
    '02903': { city: 'Providence', state: 'RI', providers: ['verizon', 'earthlink', 'tmobile'] },
    '19801': { city: 'Wilmington', state: 'DE', providers: ['verizon', 'earthlink', 'tmobile'] },
};

// ZIP3 prefix-to-state mapping for broad coverage
const zip3ToState = {
    '006':'PR','007':'PR','008':'PR','009':'PR',
    '010':'MA','011':'MA','012':'MA','013':'MA','014':'MA','015':'MA','016':'MA','017':'MA','018':'MA','019':'MA',
    '020':'MA','021':'MA','022':'MA','023':'MA','024':'MA','025':'MA','026':'MA','027':'MA',
    '028':'RI','029':'RI',
    '030':'NH','031':'NH','032':'NH','033':'NH','034':'NH','035':'NH','036':'NH','037':'NH','038':'NH',
    '039':'ME','040':'ME','041':'ME','042':'ME','043':'ME','044':'ME','045':'ME','046':'ME','047':'ME','048':'ME','049':'ME',
    '050':'VT','051':'VT','052':'VT','053':'VT','054':'VT','055':'VT','056':'VT','057':'VT','058':'VT','059':'VT',
    '060':'CT','061':'CT','062':'CT','063':'CT','064':'CT','065':'CT','066':'CT','067':'CT','068':'CT','069':'CT',
    '070':'NJ','071':'NJ','072':'NJ','073':'NJ','074':'NJ','075':'NJ','076':'NJ','077':'NJ','078':'NJ','079':'NJ','080':'NJ','081':'NJ','082':'NJ','083':'NJ','084':'NJ','085':'NJ','086':'NJ','087':'NJ','088':'NJ','089':'NJ',
    '100':'NY','101':'NY','102':'NY','103':'NY','104':'NY','105':'NY','106':'NY','107':'NY','108':'NY','109':'NY','110':'NY','111':'NY','112':'NY','113':'NY','114':'NY','115':'NY','116':'NY','117':'NY','118':'NY','119':'NY','120':'NY','121':'NY','122':'NY','123':'NY','124':'NY','125':'NY','126':'NY','127':'NY','128':'NY','129':'NY','130':'NY','131':'NY','132':'NY','133':'NY','134':'NY','135':'NY','136':'NY','137':'NY','138':'NY','139':'NY','140':'NY','141':'NY','142':'NY','143':'NY','144':'NY','145':'NY','146':'NY','147':'NY','148':'NY','149':'NY',
    '150':'PA','151':'PA','152':'PA','153':'PA','154':'PA','155':'PA','156':'PA','157':'PA','158':'PA','159':'PA','160':'PA','161':'PA','162':'PA','163':'PA','164':'PA','165':'PA','166':'PA','167':'PA','168':'PA','169':'PA','170':'PA','171':'PA','172':'PA','173':'PA','174':'PA','175':'PA','176':'PA','177':'PA','178':'PA','179':'PA','180':'PA','181':'PA','182':'PA','183':'PA','184':'PA','185':'PA','186':'PA','187':'PA','188':'PA','189':'PA','190':'PA','191':'PA','192':'PA','193':'PA','194':'PA','195':'PA','196':'PA',
    '197':'DE','198':'DE','199':'DE',
    '200':'DC','201':'VA','202':'DC','203':'DC','204':'DC','205':'DC',
    '206':'MD','207':'MD','208':'MD','209':'MD','210':'MD','211':'MD','212':'MD','214':'MD','215':'MD','216':'MD','217':'MD','218':'MD','219':'MD',
    '220':'VA','221':'VA','222':'VA','223':'VA','224':'VA','225':'VA','226':'VA','227':'VA','228':'VA','229':'VA','230':'VA','231':'VA','232':'VA','233':'VA','234':'VA','235':'VA','236':'VA','237':'VA','238':'VA','239':'VA','240':'VA','241':'VA','242':'VA','243':'VA','244':'VA','245':'VA','246':'WV',
    '247':'WV','248':'WV','249':'WV','250':'WV','251':'WV','252':'WV','253':'WV','254':'WV','255':'WV','256':'WV','257':'WV','258':'WV','259':'WV','260':'WV','261':'WV','262':'WV','263':'WV','264':'WV','265':'WV','266':'WV','267':'WV','268':'WV',
    '270':'NC','271':'NC','272':'NC','273':'NC','274':'NC','275':'NC','276':'NC','277':'NC','278':'NC','279':'NC','280':'NC','281':'NC','282':'NC','283':'NC','284':'NC','285':'NC','286':'NC','287':'NC','288':'NC','289':'NC',
    '290':'SC','291':'SC','292':'SC','293':'SC','294':'SC','295':'SC','296':'SC','297':'SC','298':'SC','299':'SC',
    '300':'GA','301':'GA','302':'GA','303':'GA','304':'GA','305':'GA','306':'GA','307':'GA','308':'GA','309':'GA','310':'GA','311':'GA','312':'GA','313':'GA','314':'GA','315':'GA','316':'GA','317':'GA','318':'GA','319':'GA',
    '320':'FL','321':'FL','322':'FL','323':'FL','324':'FL','325':'FL','326':'FL','327':'FL','328':'FL','329':'FL','330':'FL','331':'FL','332':'FL','333':'FL','334':'FL','335':'FL','336':'FL','337':'FL','338':'FL','339':'FL',
    '340':'VI',
    '350':'AL','351':'AL','352':'AL','354':'AL','355':'AL','356':'AL','357':'AL','358':'AL','359':'AL','360':'AL','361':'AL','362':'AL','363':'AL','364':'AL','365':'AL','366':'AL','367':'AL','368':'AL','369':'AL',
    '370':'TN','371':'TN','372':'TN','373':'TN','374':'TN','375':'TN','376':'TN','377':'TN','378':'TN','379':'TN','380':'TN','381':'TN','382':'TN','383':'TN','384':'TN','385':'TN',
    '386':'MS','387':'MS','388':'MS','389':'MS','390':'MS','391':'MS','392':'MS','393':'MS','394':'MS','395':'MS','396':'MS','397':'MS',
    '400':'KY','401':'KY','402':'KY','403':'KY','404':'KY','405':'KY','406':'KY','407':'KY','408':'KY','409':'KY','410':'KY','411':'KY','412':'KY','413':'KY','414':'KY','415':'KY','416':'KY','417':'KY','418':'KY',
    '420':'KY','421':'KY','422':'KY','423':'KY','424':'KY','425':'KY','426':'KY','427':'KY',
    '430':'OH','431':'OH','432':'OH','433':'OH','434':'OH','435':'OH','436':'OH','437':'OH','438':'OH','439':'OH','440':'OH','441':'OH','442':'OH','443':'OH','444':'OH','445':'OH','446':'OH','447':'OH','448':'OH','449':'OH','450':'OH','451':'OH','452':'OH','453':'OH','454':'OH','455':'OH','456':'OH','457':'OH','458':'OH',
    '460':'IN','461':'IN','462':'IN','463':'IN','464':'IN','465':'IN','466':'IN','467':'IN','468':'IN','469':'IN','470':'IN','471':'IN','472':'IN','473':'IN','474':'IN','475':'IN','476':'IN','477':'IN','478':'IN','479':'IN',
    '480':'MI','481':'MI','482':'MI','483':'MI','484':'MI','485':'MI','486':'MI','487':'MI','488':'MI','489':'MI','490':'MI','491':'MI','492':'MI','493':'MI','494':'MI','495':'MI','496':'MI','497':'MI','498':'MI','499':'MI',
    '500':'IA','501':'IA','502':'IA','503':'IA','504':'IA','505':'IA','506':'IA','507':'IA','508':'IA','509':'IA','510':'IA','511':'IA','512':'IA','513':'IA','514':'IA','515':'IA','516':'IA','520':'IA','521':'IA','522':'IA','523':'IA','524':'IA','525':'IA','526':'IA','527':'IA','528':'IA',
    '530':'WI','531':'WI','532':'WI','534':'WI','535':'WI','537':'WI','538':'WI','539':'WI','540':'WI','541':'WI','542':'WI','543':'WI','544':'WI','545':'WI','546':'WI','547':'WI','548':'WI','549':'WI',
    '550':'MN','551':'MN','553':'MN','554':'MN','555':'MN','556':'MN','557':'MN','558':'MN','559':'MN','560':'MN','561':'MN','562':'MN','563':'MN','564':'MN','565':'MN','566':'MN','567':'MN',
    '570':'SD','571':'SD','572':'SD','573':'SD','574':'SD','575':'SD','576':'SD','577':'SD',
    '580':'ND','581':'ND','582':'ND','583':'ND','584':'ND','585':'ND','586':'ND','587':'ND','588':'ND',
    '590':'MT','591':'MT','592':'MT','593':'MT','594':'MT','595':'MT','596':'MT','597':'MT','598':'MT','599':'MT',
    '600':'IL','601':'IL','602':'IL','603':'IL','604':'IL','605':'IL','606':'IL','607':'IL','608':'IL','609':'IL','610':'IL','611':'IL','612':'IL','613':'IL','614':'IL','615':'IL','616':'IL','617':'IL','618':'IL','619':'IL','620':'IL','621':'IL','622':'IL','623':'IL','624':'IL','625':'IL','626':'IL','627':'IL','628':'IL','629':'IL',
    '630':'MO','631':'MO','633':'MO','634':'MO','635':'MO','636':'MO','637':'MO','638':'MO','639':'MO','640':'MO','641':'MO','644':'MO','645':'MO','646':'MO','647':'MO','648':'MO','649':'MO','650':'MO','651':'MO','652':'MO','653':'MO','654':'MO','655':'MO','656':'MO','657':'MO','658':'MO',
    '660':'KS','661':'KS','662':'KS','664':'KS','665':'KS','666':'KS','667':'KS','668':'KS','669':'KS','670':'KS','671':'KS','672':'KS','673':'KS','674':'KS','675':'KS','676':'KS','677':'KS','678':'KS','679':'KS',
    '680':'NE','681':'NE','683':'NE','684':'NE','685':'NE','686':'NE','687':'NE','688':'NE','689':'NE','690':'NE','691':'NE','692':'NE','693':'NE',
    '700':'LA','701':'LA','703':'LA','704':'LA','705':'LA','706':'LA','707':'LA','708':'LA','710':'LA','711':'LA','712':'LA','713':'LA','714':'LA',
    '716':'AR','717':'AR','718':'AR','719':'AR','720':'AR','721':'AR','722':'AR','723':'AR','724':'AR','725':'AR','726':'AR','727':'AR','728':'AR','729':'AR',
    '730':'OK','731':'OK','734':'OK','735':'OK','736':'OK','737':'OK','738':'OK','739':'OK','740':'OK','741':'OK','743':'OK','744':'OK','745':'OK','746':'OK','747':'OK','748':'OK','749':'OK',
    '750':'TX','751':'TX','752':'TX','753':'TX','754':'TX','755':'TX','756':'TX','757':'TX','758':'TX','759':'TX','760':'TX','761':'TX','762':'TX','763':'TX','764':'TX','765':'TX','766':'TX','767':'TX','768':'TX','769':'TX','770':'TX','771':'TX','772':'TX','773':'TX','774':'TX','775':'TX','776':'TX','777':'TX','778':'TX','779':'TX','780':'TX','781':'TX','782':'TX','783':'TX','784':'TX','785':'TX','786':'TX','787':'TX','788':'TX','789':'TX','790':'TX','791':'TX','792':'TX','793':'TX','794':'TX','795':'TX','796':'TX','797':'TX','798':'TX','799':'TX',
    '800':'CO','801':'CO','802':'CO','803':'CO','804':'CO','805':'CO','806':'CO','807':'CO','808':'CO','809':'CO','810':'CO','811':'CO','812':'CO','813':'CO','814':'CO','815':'CO','816':'CO',
    '820':'WY','821':'WY','822':'WY','823':'WY','824':'WY','825':'WY','826':'WY','827':'WY','828':'WY','829':'WY','830':'WY','831':'WY',
    '832':'ID','833':'ID','834':'ID','835':'ID','836':'ID','837':'ID','838':'ID',
    '840':'UT','841':'UT','842':'UT','843':'UT','844':'UT','845':'UT','846':'UT','847':'UT',
    '850':'AZ','851':'AZ','852':'AZ','853':'AZ','855':'AZ','856':'AZ','857':'AZ','859':'AZ','860':'AZ',
    '863':'AZ','864':'AZ','865':'AZ',
    '870':'NM','871':'NM','873':'NM','874':'NM','875':'NM','877':'NM','878':'NM','879':'NM','880':'NM','881':'NM','882':'NM','883':'NM','884':'NM',
    '889':'NV','890':'NV','891':'NV','893':'NV','894':'NV','895':'NV','896':'NV','897':'NV','898':'NV',
    '900':'CA','901':'CA','902':'CA','903':'CA','904':'CA','905':'CA','906':'CA','907':'CA','908':'CA','910':'CA','911':'CA','912':'CA','913':'CA','914':'CA','915':'CA','916':'CA','917':'CA','918':'CA','919':'CA','920':'CA','921':'CA','922':'CA','923':'CA','924':'CA','925':'CA','926':'CA','927':'CA','928':'CA',
    '930':'CA','931':'CA','932':'CA','933':'CA','934':'CA','935':'CA','936':'CA','937':'CA','938':'CA','939':'CA','940':'CA','941':'CA','942':'CA','943':'CA','944':'CA','945':'CA','946':'CA','947':'CA','948':'CA','949':'CA','950':'CA','951':'CA','952':'CA','953':'CA','954':'CA','955':'CA','956':'CA','957':'CA','958':'CA','959':'CA','960':'CA','961':'CA',
    '967':'HI','968':'HI',
    '970':'OR','971':'OR','972':'OR','973':'OR','974':'OR','975':'OR','976':'OR','977':'OR','978':'OR','979':'OR',
    '980':'WA','981':'WA','982':'WA','983':'WA','984':'WA','985':'WA','986':'WA','988':'WA','989':'WA','990':'WA','991':'WA','992':'WA','993':'WA','994':'WA',
    '995':'AK','996':'AK','997':'AK','998':'AK','999':'AK'
};

// State → default providers mapping
const stateProviders = {
    'NY': ['spectrum', 'optimum', 'verizon', 'earthlink', 'tmobile', 'frontier', 'windstream'],
    'NJ': ['optimum', 'verizon', 'earthlink', 'tmobile'],
    'CT': ['frontier', 'optimum', 'verizon', 'earthlink', 'tmobile'],
    'PA': ['verizon', 'optimum', 'frontier', 'earthlink', 'tmobile', 'brightspeed', 'windstream'],
    'MA': ['verizon', 'spectrum', 'earthlink', 'tmobile'],
    'RI': ['verizon', 'earthlink', 'tmobile'],
    'VA': ['verizon', 'earthlink', 'tmobile', 'brightspeed'],
    'MD': ['verizon', 'earthlink', 'tmobile'],
    'DC': ['verizon', 'att', 'earthlink', 'tmobile'],
    'DE': ['verizon', 'earthlink', 'tmobile'],
    'CA': ['spectrum', 'att', 'frontier', 'earthlink', 'tmobile'],
    'TX': ['att', 'spectrum', 'frontier', 'earthlink', 'tmobile', 'windstream', 'brightspeed'],
    'FL': ['att', 'spectrum', 'frontier', 'earthlink', 'tmobile', 'brightspeed', 'windstream'],
    'IL': ['att', 'earthlink', 'tmobile', 'brightspeed'],
    'OH': ['spectrum', 'att', 'altafiber', 'frontier', 'earthlink', 'tmobile', 'brightspeed', 'windstream'],
    'GA': ['att', 'spectrum', 'earthlink', 'tmobile', 'windstream'],
    'NC': ['spectrum', 'att', 'brightspeed', 'earthlink', 'tmobile', 'windstream', 'frontier'],
    'SC': ['spectrum', 'att', 'brightspeed', 'earthlink', 'tmobile', 'windstream', 'frontier'],
    'MI': ['att', 'spectrum', 'earthlink', 'tmobile'],
    'TN': ['att', 'spectrum', 'earthlink', 'tmobile', 'brightspeed', 'frontier'],
    'AL': ['att', 'spectrum', 'earthlink', 'tmobile', 'brightspeed', 'frontier'],
    'IN': ['att', 'spectrum', 'altafiber', 'frontier', 'earthlink', 'tmobile', 'brightspeed'],
    'KY': ['att', 'spectrum', 'altafiber', 'earthlink', 'tmobile', 'windstream'],
    'WI': ['spectrum', 'att', 'earthlink', 'tmobile', 'brightspeed'],
    'MN': ['earthlink', 'tmobile', 'brightspeed', 'windstream', 'frontier'],
    'MO': ['att', 'spectrum', 'earthlink', 'tmobile', 'brightspeed'],
    'LA': ['att', 'earthlink', 'tmobile', 'windstream', 'brightspeed'],
    'AR': ['att', 'earthlink', 'tmobile', 'windstream', 'brightspeed'],
    'OK': ['att', 'earthlink', 'tmobile', 'windstream'],
    'MS': ['att', 'earthlink', 'tmobile', 'windstream', 'brightspeed'],
    'NE': ['earthlink', 'tmobile', 'windstream'],
    'IA': ['earthlink', 'tmobile', 'windstream', 'frontier'],
    'NM': ['earthlink', 'tmobile', 'windstream', 'frontier'],
    'WV': ['frontier', 'earthlink', 'tmobile', 'windstream'],
    'AZ': ['earthlink', 'tmobile', 'frontier'],
    'CO': ['earthlink', 'tmobile'],
    'OR': ['spectrum', 'earthlink', 'tmobile', 'frontier'],
    'WA': ['spectrum', 'earthlink', 'tmobile', 'frontier'],
    'NV': ['att', 'spectrum', 'earthlink', 'tmobile'],
    'HI': ['spectrum', 'tmobile'],
    'KS': ['att', 'earthlink', 'tmobile', 'brightspeed'],
    'NH': ['earthlink', 'tmobile', 'spectrum'],
    'ME': ['spectrum', 'earthlink', 'tmobile'],
    'VT': ['earthlink', 'tmobile'],
    'SD': ['earthlink', 'tmobile'],
    'ND': ['earthlink', 'tmobile'],
    'MT': ['earthlink', 'tmobile'],
    'WY': ['earthlink', 'tmobile'],
    'ID': ['earthlink', 'tmobile'],
    'UT': ['earthlink', 'tmobile'],
};

// ============================================
// Helper Functions
// ============================================

function getProviderById(id) {
    return providers.find(p => p.id === id);
}

function getStateFromZipPrefix(zip) {
    const prefix = zip.substring(0, 3);
    return zip3ToState[prefix] || '';
}

function getProvidersByZip(zip) {
    // 1. Exact match
    if (zipCodeMap[zip]) {
        const loc = zipCodeMap[zip];
        return {
            city: loc.city,
            state: loc.state,
            providers: loc.providers.map(id => getProviderById(id)).filter(Boolean)
        };
    }

    // 2. State-based match via ZIP3 prefix
    const state = getStateFromZipPrefix(zip);
    if (state && stateProviders[state]) {
        const providerIds = stateProviders[state];
        return {
            city: 'Your Area',
            state: state,
            providers: providerIds.map(id => getProviderById(id)).filter(Boolean)
        };
    }

    // 3. Fallback: show all partners (T-Mobile + EarthLink are nationwide)
    return {
        city: 'Your Area',
        state: '',
        providers: providers.filter(p =>
            p.id === 'tmobile' || p.id === 'earthlink' || p.id === 'spectrum' || p.id === 'att'
        )
    };
}

function formatSpeed(speed) {
    if (speed >= 1000) {
        const gbps = speed / 1000;
        return (gbps % 1 === 0 ? gbps.toFixed(0) : gbps.toFixed(1)) + ' Gbps';
    }
    return speed + ' Mbps';
}

function formatPrice(price) {
    return '$' + price.toFixed(2);
}
