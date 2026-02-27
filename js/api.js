// ============================================
// Internet 4 ALL — BroadbandMap.com API Integration
// Real-time provider availability via BroadbandMap API v1
// Geocoding via zippopotam.us + Nominatim fallback
// Geolocation via navigator.geolocation
// ============================================

const BroadbandAPI = (() => {
    // ------- Configuration -------
    const CONFIG = {
        broadbandMap: {
            internetUrl: 'https://broadbandmap.com/api/v1/location/internet',
            cellUrl: 'https://broadbandmap.com/api/v1/location/cell',
        },
        geocoder: {
            zippopotamUrl: 'https://api.zippopotam.us/us',
            nominatimUrl: 'https://nominatim.openstreetmap.org/search',
        },
        cache: {
            precision: 3,       // decimal places for rounding (~111m grid)
            ttl: 60 * 60 * 1000, // 1 hour
            storageKey: 'i4a_cache',
        },
        timeout: 10000,
    };

    // In-memory cache
    const memCache = new Map();

    // ------- Provider Name Normalization -------
    // Maps API-returned names (lowercase) to our partner IDs
    const NAME_MAP = {
        'charter': 'spectrum',
        'charter communications': 'spectrum',
        'charter communications inc': 'spectrum',
        'spectrum': 'spectrum',
        'at&t': 'att',
        'att': 'att',
        'at&t inc': 'att',
        'at&t services': 'att',
        'at&t corp': 'att',
        'bellsouth': 'att',
        'at&t internet': 'att',
        'at&t fiber': 'att',
        'at&t air': 'att-air',
        'att air': 'att-air',
        't-mobile fiber': 'tmobile',
        'metronet': 'tmobile',
        'metronet holdings': 'tmobile',
        'metronet inc': 'tmobile',
        'metronet communications': 'tmobile',
        't-mobile': 'tmobile-5g',
        'tmobile': 'tmobile-5g',
        't-mobile usa': 'tmobile-5g',
        't-mobile us': 'tmobile-5g',
        't-mobile home internet': 'tmobile-5g',
        'verizon': 'verizon',
        'verizon communications': 'verizon',
        'verizon fios': 'verizon',
        'verizon business': 'verizon',
        'mci': 'verizon',
        'windstream': 'windstream',
        'windstream holdings': 'windstream',
        'windstream communications': 'windstream',
        'kinetic': 'windstream',
        'kinetic by windstream': 'windstream',
        'altice': 'optimum',
        'altice usa': 'optimum',
        'optimum': 'optimum',
        'optimum by altice': 'optimum',
        'cablevision': 'optimum',
        'suddenlink': 'optimum',
        'suddenlink communications': 'optimum',
        'frontier': 'frontier',
        'frontier communications': 'frontier',
        'frontier communications corp': 'frontier',
        'earthlink': 'earthlink',
        'earthlink inc': 'earthlink',
        'earthlink llc': 'earthlink',
        'brightspeed': 'brightspeed',
        'lumen': 'brightspeed',
        'lumen technologies': 'brightspeed',
        'centurylink': 'brightspeed',
        'centurytel': 'brightspeed',
        'altafiber': 'altafiber',
        'alta fiber': 'altafiber',
        'cincinnati bell': 'altafiber',
        'cincinnati bell inc': 'altafiber',
        'hawaiian telcom': 'altafiber',
        'xfinity': 'xfinity',
        'comcast': 'xfinity',
        'comcast cable': 'xfinity',
        'comcast communications': 'xfinity',
        'xfinity internet': 'xfinity',
        'starlink': 'starlink',
        'starlink services': 'starlink',
        'spacex': 'starlink',
        'space exploration technologies': 'starlink',
        'viasat': 'viasat',
        'viasat inc': 'viasat',
        'exede': 'viasat',
        'hughesnet': 'hughesnet',
        'hughes network systems': 'hughesnet',
        'hughes': 'hughesnet',
        'minternet': 'minternet',
        'mint internet': 'minternet',
    };

    // ------- Geocoding: ZIP → lat/lng -------
    async function geocodeZip(zip) {
        // Strategy 1: zippopotam.us (purpose-built for ZIP codes, free, CORS-friendly)
        try {
            const url = `${CONFIG.geocoder.zippopotamUrl}/${zip}`;
            const resp = await fetchWithTimeout(url, 6000);
            if (resp.ok) {
                const data = await resp.json();
                if (data.places && data.places.length > 0) {
                    const place = data.places[0];
                    return {
                        lat: parseFloat(place.latitude),
                        lng: parseFloat(place.longitude),
                        city: place['place name'] || 'Your Area',
                        state: place['state abbreviation'] || place.state || '',
                        source: 'zippopotam',
                    };
                }
            }
        } catch (e) {
            console.warn('[Geo] zippopotam.us failed:', e.message);
        }

        // Strategy 2: Nominatim (OpenStreetMap)
        try {
            const url = `${CONFIG.geocoder.nominatimUrl}?postalcode=${zip}&country=US&format=json&limit=1`;
            const resp = await fetchWithTimeout(url, 8000);
            if (resp.ok) {
                const data = await resp.json();
                if (data && data.length > 0) {
                    const parts = (data[0].display_name || '').split(',').map(s => s.trim());
                    return {
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon),
                        city: parts[0] || 'Your Area',
                        state: parts.length >= 2 ? parts[parts.length - 2] : '',
                        source: 'nominatim',
                    };
                }
            }
        } catch (e) {
            console.warn('[Geo] Nominatim failed:', e.message);
        }

        // Strategy 3: Use our local ZIP data for city/state (no lat/lng)
        if (typeof zipCodeMap !== 'undefined' && zipCodeMap[zip]) {
            const loc = zipCodeMap[zip];
            // Return null lat/lng to signal geocoding failure but provide location info
            return { lat: null, lng: null, city: loc.city, state: loc.state, source: 'local' };
        }

        const state = typeof getStateFromZipPrefix === 'function' ? getStateFromZipPrefix(zip) : '';
        return { lat: null, lng: null, city: 'Your Area', state, source: 'local' };
    }

    // ------- Browser Geolocation -------
    function getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                }),
                (err) => {
                    const messages = {
                        1: 'Location access denied. Please allow location access or enter your ZIP code.',
                        2: 'Location unavailable. Please enter your ZIP code instead.',
                        3: 'Location request timed out. Please enter your ZIP code instead.',
                    };
                    reject(new Error(messages[err.code] || 'Could not determine your location'));
                },
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
            );
        });
    }

    // Reverse geocode lat/lng → city/state for display
    async function reverseGeocode(lat, lng) {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`;
            const resp = await fetchWithTimeout(url, 8000);
            if (resp.ok) {
                const data = await resp.json();
                const addr = data?.address || {};
                return {
                    city: addr.city || addr.town || addr.village || addr.hamlet || addr.county || 'Your Area',
                    state: addr.state || '',
                    stateCode: addr['ISO3166-2-lvl4']?.split('-')[1] || '',
                    zip: addr.postcode || '',
                };
            }
        } catch (e) {
            console.warn('[Geo] Reverse geocode failed:', e.message);
        }
        return { city: 'Your Area', state: '', stateCode: '', zip: '' };
    }

    // ------- Cache Management -------
    function getCacheKey(lat, lng) {
        const p = CONFIG.cache.precision;
        return `${lat.toFixed(p)},${lng.toFixed(p)}`;
    }

    function getFromCache(key) {
        // Memory cache (fastest)
        const mem = memCache.get(key);
        if (mem && Date.now() - mem.ts < CONFIG.cache.ttl) {
            return mem.data;
        }
        // sessionStorage (survives page navigation)
        try {
            const stored = sessionStorage.getItem(CONFIG.cache.storageKey);
            if (stored) {
                const all = JSON.parse(stored);
                const entry = all[key];
                if (entry && Date.now() - entry.ts < CONFIG.cache.ttl) {
                    memCache.set(key, entry); // promote to memory
                    return entry.data;
                }
            }
        } catch (e) { /* quota or parsing error */ }
        return null;
    }

    function setCache(key, data) {
        const entry = { data, ts: Date.now() };
        memCache.set(key, entry);
        try {
            const stored = sessionStorage.getItem(CONFIG.cache.storageKey);
            const all = stored ? JSON.parse(stored) : {};
            // Evict oldest if over 30 entries
            const keys = Object.keys(all);
            if (keys.length >= 30) {
                let oldest = keys[0], oldestTs = Infinity;
                keys.forEach(k => { if (all[k].ts < oldestTs) { oldest = k; oldestTs = all[k].ts; } });
                delete all[oldest];
            }
            all[key] = entry;
            sessionStorage.setItem(CONFIG.cache.storageKey, JSON.stringify(all));
        } catch (e) { /* quota exceeded */ }
    }

    // ------- BroadbandMap API Calls -------
    async function fetchBroadbandMap(lat, lng) {
        const url = `${CONFIG.broadbandMap.internetUrl}?lat=${lat}&lng=${lng}`;
        const resp = await fetchWithTimeout(url, CONFIG.timeout);
        if (!resp.ok) {
            const text = await resp.text().catch(() => '');
            throw new Error(`BroadbandMap API HTTP ${resp.status}: ${text}`);
        }
        return await resp.json();
    }

    async function fetchCellCoverage(lat, lng) {
        try {
            const url = `${CONFIG.broadbandMap.cellUrl}?lat=${lat}&lng=${lng}`;
            const resp = await fetchWithTimeout(url, CONFIG.timeout);
            if (!resp.ok) return [];
            return await resp.json();
        } catch (e) {
            console.warn('[API] Cell coverage fetch failed:', e.message);
            return [];
        }
    }

    // ------- Main Search Functions -------

    // Search by ZIP code (geocode first, then search by coords)
    async function searchByZip(zip) {
        if (!isValidZip(zip)) {
            throw new Error('Please enter a valid 5-digit ZIP code.');
        }

        // Geocode ZIP → lat/lng
        const geo = await geocodeZip(zip);

        if (!geo || geo.lat === null || geo.lng === null) {
            // Geocoding failed — fall back to local data
            console.warn('[API] No coordinates for ZIP:', zip, '— using local data');
            return buildLocalResult(zip, geo);
        }

        // Search by coordinates
        const result = await searchByCoords(geo.lat, geo.lng);

        // Use geocoder's city/state (more accurate than reverse geocode)
        if (geo.city && geo.city !== 'Your Area') result.city = geo.city;
        if (geo.state) result.state = geo.state;
        result.zip = zip;

        // If API returned no providers, fall back to ZIP-specific local data
        if (!result.providers || result.providers.length === 0) {
            console.warn('[API] No API providers for', zip, '— using local ZIP data');
            return buildLocalResult(zip, geo);
        }

        return result;
    }

    // Search by coordinates (core function — used by both ZIP and geolocation paths)
    async function searchByCoords(lat, lng) {
        const cacheKey = getCacheKey(lat, lng);

        // Check cache first
        const cached = getFromCache(cacheKey);
        if (cached) {
            console.log('[API] Cache hit for', cacheKey);
            return { ...cached };
        }

        let apiProviders = [];
        let apiSource = 'local';
        let cellData = [];

        // Fetch real-time data from BroadbandMap.com
        try {
            const [internetData, cellRes] = await Promise.allSettled([
                fetchBroadbandMap(lat, lng),
                fetchCellCoverage(lat, lng),
            ]);

            if (internetData.status === 'fulfilled') {
                apiProviders = normalizeApiResponse(internetData.value);
                apiSource = 'broadbandmap';
                console.log(`[API] BroadbandMap returned ${apiProviders.length} raw providers`);
            } else {
                console.warn('[API] BroadbandMap internet fetch failed:', internetData.reason?.message);
            }

            if (cellRes.status === 'fulfilled') {
                cellData = Array.isArray(cellRes.value) ? cellRes.value : [];
            }
        } catch (e) {
            console.warn('[API] BroadbandMap fetch error:', e.message);
        }

        // Build result
        const result = {
            lat, lng,
            city: 'Your Area',
            state: '',
            zip: '',
            providers: [],
            cellCoverage: cellData,
            source: apiSource,
            timestamp: Date.now(),
        };

        if (apiProviders.length > 0) {
            // Merge API results with our partner data
            result.providers = enrichWithPartnerData(apiProviders);
            // Rank and assign badges
            result.providers = rankProviders(result.providers);
            // Only cache real API results, not fallback data
            setCache(cacheKey, result);
        } else {
            // API returned no data — signal failure so caller uses zip-specific local data
            result.providers = [];
            result.source = 'api-empty';
        }

        return result;
    }

    // ------- Normalize BroadbandMap API Response -------
    function normalizeApiResponse(data) {
        // API returns array of records; each has provider, technology, speeds
        const records = Array.isArray(data) ? data : (data?.results || data?.data || data?.providers || []);

        // Group by provider name (API may have multiple entries per provider per technology)
        const byProvider = new Map();

        records.forEach(rec => {
            const name = rec.provider || rec.provider_name || rec.name || rec.brand_name || '';
            if (!name) return;

            const key = name.toLowerCase().trim();
            if (!byProvider.has(key)) {
                byProvider.set(key, {
                    rawName: name,
                    technologies: [],
                    maxDownload: 0,
                    maxUpload: 0,
                });
            }
            const entry = byProvider.get(key);

            // Technology
            const tech = (rec.technology || rec.tech || rec.technology_type || '').toLowerCase();
            const mappedTech = mapTechnology(tech);
            if (mappedTech && !entry.technologies.includes(mappedTech)) {
                entry.technologies.push(mappedTech);
            }

            // Speeds — keep max across all technology entries
            const dl = parseFloat(rec.max_download_mbps || rec.max_download_speed || rec.max_download || rec.download_speed || rec.max_advertised_download_speed || 0) || 0;
            const ul = parseFloat(rec.max_upload_mbps || rec.max_upload_speed || rec.max_upload || rec.upload_speed || rec.max_advertised_upload_speed || 0) || 0;
            if (dl > entry.maxDownload) entry.maxDownload = dl;
            if (ul > entry.maxUpload) entry.maxUpload = ul;
        });

        return Array.from(byProvider.values()).map(entry => ({
            rawName: entry.rawName,
            name: entry.rawName,
            types: entry.technologies.length > 0 ? entry.technologies : ['cable'],
            maxSpeed: entry.maxDownload,
            maxUpload: entry.maxUpload,
            source: 'broadbandmap',
        }));
    }

    function mapTechnology(tech) {
        if (!tech) return null;
        const t = tech.toLowerCase();
        if (t.includes('fiber') || t === 'fttp' || t === 'ftth' || t === 'fttb') return 'fiber';
        if (t.includes('cable') || t.includes('docsis') || t === 'hfc' || t.includes('coax')) return 'cable';
        if (t.includes('dsl') || t.includes('adsl') || t.includes('vdsl') || t.includes('copper')) return 'dsl';
        if (t.includes('5g') || t.includes('nr')) return '5g';
        if (t.includes('fixed wireless') || t.includes('fixed_wireless') || t.includes('wisp') || t.includes('mmwave')) return '5g';
        if (t.includes('satellite')) return 'satellite';
        if (t.includes('wireless') || t.includes('lte') || t.includes('4g') || t.includes('cellular')) return '5g';
        return null;
    }

    // ------- Match & Enrich with Partner Data -------
    function enrichWithPartnerData(apiProviders) {
        if (typeof providers === 'undefined') return apiProviders;

        const enriched = [];
        const matchedPartnerIds = new Set();

        apiProviders.forEach(apiP => {
            const partnerId = matchProviderName(apiP.rawName);
            const partnerData = partnerId && typeof getProviderById === 'function' ? getProviderById(partnerId) : null;

            if (partnerData) {
                // We have local data for this provider (partner or not)
                matchedPartnerIds.add(partnerId);
                enriched.push({
                    id: partnerData.id,
                    name: partnerData.name,
                    types: mergeArrays(apiP.types, partnerData.types),
                    maxSpeed: Math.max(apiP.maxSpeed || 0, Math.max(...partnerData.plans.map(pl => pl.speed))),
                    maxUpload: Math.max(apiP.maxUpload || 0, Math.max(...partnerData.plans.map(pl => pl.uploadSpeed || 0))),
                    minPrice: Math.min(...partnerData.plans.map(pl => pl.promoPrice || pl.price)),
                    rating: partnerData.rating,
                    reviewCount: partnerData.reviewCount,
                    isPartner: partnerData.isPartner,
                    fullData: partnerData,
                    phone: partnerData.phone,
                    source: 'broadbandmap',
                    apiConfirmed: true,
                });
            } else {
                // Unknown provider — use API data as-is
                enriched.push({
                    name: apiP.rawName,
                    types: apiP.types,
                    maxSpeed: apiP.maxSpeed || 0,
                    maxUpload: apiP.maxUpload || 0,
                    minPrice: null,
                    rating: null,
                    isPartner: false,
                    source: 'broadbandmap',
                    apiConfirmed: true,
                });
            }
        });

        // DO NOT add nationwide partner providers that the API didn't confirm.
        // The entire point is to show REAL, location-specific results.
        // Adding unconfirmed nationwide providers makes every ZIP look the same.

        return enriched;
    }

    function matchProviderName(rawName) {
        if (!rawName) return null;
        const lower = rawName.toLowerCase().trim();

        // Exact match
        if (NAME_MAP[lower]) return NAME_MAP[lower];

        // Partial match: check if the raw name contains any known key
        for (const [key, id] of Object.entries(NAME_MAP)) {
            if (lower.includes(key) || key.includes(lower)) {
                return id;
            }
        }

        // Try matching against our provider names/ids directly
        if (typeof providers !== 'undefined') {
            const match = providers.find(p =>
                lower.includes(p.id) ||
                lower.includes(p.name.toLowerCase()) ||
                p.name.toLowerCase().includes(lower)
            );
            if (match) return match.id;
        }

        return null;
    }

    function mergeArrays(a, b) {
        return [...new Set([...(a || []), ...(b || [])])];
    }

    // ------- Ranking Algorithm -------
    // Assigns scores and Top 3 badges: Best Overall, Best Speed, Best Value
    function rankProviders(providerList) {
        if (providerList.length === 0) return providerList;

        const scored = providerList.map(p => {
            let score = 0;

            // Partner bonus (our contracted providers rank higher)
            if (p.isPartner) score += 20;

            // API-confirmed presence in the area
            if (p.apiConfirmed) score += 15;

            // Technology scoring: Fiber > 5G > Cable > DSL
            const types = p.types || [];
            if (types.includes('fiber')) score += 15;
            if (types.includes('5g')) score += 10;
            if (types.includes('cable')) score += 8;
            if (types.includes('dsl')) score += 3;

            // Speed scoring
            const speed = p.maxSpeed || 0;
            if (speed >= 2000) score += 14;
            else if (speed >= 1000) score += 12;
            else if (speed >= 500) score += 9;
            else if (speed >= 300) score += 6;
            else if (speed >= 100) score += 4;
            else if (speed >= 50) score += 2;

            // Upload speed bonus (important for WFH & gaming)
            const upload = p.maxUpload || 0;
            if (upload >= 1000) score += 8;
            else if (upload >= 500) score += 5;
            else if (upload >= 100) score += 3;

            // Rating
            if (p.rating) score += Math.floor(p.rating * 2);

            // Value: low price with decent speed rewards
            if (p.minPrice && p.minPrice > 0) {
                if (p.minPrice < 40) score += 6;
                else if (p.minPrice < 55) score += 4;
                else if (p.minPrice < 70) score += 2;
            }

            return { ...p, _score: score };
        });

        // Sort by score descending
        scored.sort((a, b) => b._score - a._score);

        // Assign Top 3 badges to partner providers only
        const partners = scored.filter(p => p.isPartner);

        // Best Overall: highest score
        if (partners.length >= 1) {
            partners[0].badge = 'best-overall';
        }

        // Best Speed: fastest max download among partners
        const bySpeed = [...partners].sort((a, b) => (b.maxSpeed || 0) - (a.maxSpeed || 0));
        if (bySpeed.length >= 1 && !bySpeed[0].badge) {
            bySpeed[0].badge = 'best-speed';
        } else if (bySpeed.length >= 2 && !bySpeed[1].badge) {
            bySpeed[1].badge = 'best-speed';
        }

        // Best Value: lowest price with at least 100 Mbps
        const byValue = [...partners]
            .filter(p => p.minPrice && p.minPrice > 0 && (p.maxSpeed || 0) >= 100)
            .sort((a, b) => {
                // Price-per-Mbps ratio (lower = better value)
                const ratioA = (a.minPrice || 999) / Math.max(a.maxSpeed || 1, 1);
                const ratioB = (b.minPrice || 999) / Math.max(b.maxSpeed || 1, 1);
                return ratioA - ratioB;
            });
        if (byValue.length >= 1 && !byValue[0].badge) {
            byValue[0].badge = 'best-value';
        } else if (byValue.length >= 2 && !byValue[1].badge) {
            byValue[1].badge = 'best-value';
        }

        return scored;
    }

    // ------- Local Data Fallback -------
    function buildLocalResult(zip, geo) {
        if (typeof getProvidersByZip === 'function') {
            const local = getProvidersByZip(zip);
            const mapped = local.providers.map(p => ({
                id: p.id,
                name: p.name,
                types: p.types,
                maxSpeed: Math.max(...p.plans.map(pl => pl.speed)),
                maxUpload: Math.max(...p.plans.map(pl => pl.uploadSpeed || 0)),
                minPrice: Math.min(...p.plans.map(pl => pl.promoPrice || pl.price)),
                rating: p.rating,
                reviewCount: p.reviewCount,
                isPartner: p.isPartner,
                fullData: p,
                phone: p.phone,
                source: 'local',
                apiConfirmed: false,
            }));
            return {
                zip,
                city: geo?.city || local.city,
                state: geo?.state || local.state,
                providers: rankProviders(mapped),
                source: 'local',
                timestamp: Date.now(),
            };
        }
        return { zip, city: geo?.city || 'Your Area', state: geo?.state || '', providers: [], source: 'local', timestamp: Date.now() };
    }

    function getAllPartnerProviders() {
        if (typeof providers === 'undefined') return [];
        return providers.filter(p => p.isPartner).map(p => ({
            id: p.id,
            name: p.name,
            types: p.types,
            maxSpeed: Math.max(...p.plans.map(pl => pl.speed)),
            maxUpload: Math.max(...p.plans.map(pl => pl.uploadSpeed || 0)),
            minPrice: Math.min(...p.plans.map(pl => pl.promoPrice || pl.price)),
            rating: p.rating,
            reviewCount: p.reviewCount,
            isPartner: p.isPartner,
            fullData: p,
            phone: p.phone,
            source: 'local',
            apiConfirmed: false,
        }));
    }

    // ------- Utility -------
    function isValidZip(zip) {
        return /^\d{5}$/.test(zip);
    }

    async function fetchWithTimeout(url, timeout, opts = {}) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        try {
            const resp = await fetch(url, { ...opts, signal: controller.signal });
            clearTimeout(timer);
            return resp;
        } catch (e) {
            clearTimeout(timer);
            throw e;
        }
    }

    // ------- Public API -------
    return {
        searchByZip,
        searchByCoords,
        getUserLocation,
        reverseGeocode,
        isValidZip,
        clearCache() {
            memCache.clear();
            try { sessionStorage.removeItem(CONFIG.cache.storageKey); } catch (e) {}
        },
    };
})();
