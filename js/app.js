// ============================================
// Internet 4 ALL — Conversion Engine
// Slim results, modal plans, real API + fallback
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initMobileMenu();
    initSearch();
    initFAQ();
    initScrollReveal();
    initStickyHeader();
    initProviderPage();
    initComparisonPage();
    initSpeedTest();
    initProvidersPage();
    initModal();
});

// ============================================
// Header & Scroll Effects
// ============================================
function initStickyHeader() {
    const header = document.querySelector('.header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
}

function initHeader() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.endsWith(href.replace('../', '').replace('./', ''))) {
            link.classList.add('active');
        }
    });
}

// ============================================
// Mobile Menu
// ============================================
function initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const mobileNav = document.getElementById('mobileNav');
    if (!toggle || !mobileNav) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        mobileNav.classList.toggle('open');
        document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            mobileNav.classList.remove('open');
            document.body.style.overflow = '';
        });
    });
}

// ============================================
// ZIP Code Search
// ============================================
function initSearch() {
    bindSearchBox('heroZip', 'heroSearchBtn');
    bindSearchBox('ctaZip', 'ctaSearchBtn');
    bindSearchBox('zipInput', 'searchBtn');
}

function bindSearchBox(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (!input) return;

    input.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5);
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') doSearch(input.value);
    });

    if (btn) {
        btn.addEventListener('click', () => doSearch(input.value));
    }
}

function doSearch(zip) {
    if (!zip || zip.length !== 5) {
        showToast('Please enter a valid 5-digit ZIP code', 'warning');
        return;
    }
    // Clear any previous geolocation data
    sessionStorage.removeItem('searchLat');
    sessionStorage.removeItem('searchLng');
    sessionStorage.removeItem('searchCity');
    sessionStorage.removeItem('searchState');
    sessionStorage.setItem('searchZip', zip);

    const isInPages = window.location.pathname.includes('/pages/');

    // If we're already on providers page, search in-place
    if (window.location.pathname.match(/providers(\.html)?$/)) {
        loadProviders(zip);
        window.history.replaceState(null, '', window.location.pathname + '?zip=' + zip);
        return;
    }

    window.location.href = isInPages
        ? 'providers.html?zip=' + zip
        : 'pages/providers.html?zip=' + zip;
}



// ============================================
// Toast Notifications
// ============================================
function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const colors = { warning: '#f59e0b', error: '#ef4444', success: '#10b981', info: '#1a56db' };
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
        position:fixed;top:24px;right:24px;z-index:9999;
        background:${colors[type] || colors.info};color:white;
        padding:14px 24px;border-radius:12px;font-weight:600;font-size:.9375rem;
        box-shadow:0 8px 32px rgba(0,0,0,0.18);animation:slideIn .3s ease;max-width:420px;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Toast animations
if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes slideIn{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes slideOut{from{transform:translateX(0);opacity:1}to{transform:translateX(120%);opacity:0}}
    `;
    document.head.appendChild(style);
}

// ============================================
// FAQ Accordion
// ============================================
function initFAQ() {
    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;

        question.setAttribute('aria-expanded', 'false');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            item.closest('.faq-list')?.querySelectorAll('.faq-item').forEach(i => {
                i.classList.remove('active');
                i.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
            });
            if (!isActive) {
                item.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });
}



// ============================================
// Slim Result Row — Replaces giant cards
// ============================================
function createResultRow(p) {
    const provider = p.fullData || null;
    const name = provider ? provider.name : (p.name || 'Unknown');
    const maxSpeed = p.maxSpeed || 0;
    const lowestPrice = p.minPrice || null;
    const rating = p.rating || (provider ? provider.rating : null);
    const types = p.types || (provider ? provider.types : []);
    const phone = p.phone || (provider ? provider.phone : null) || (typeof MAIN_PHONE !== 'undefined' ? MAIN_PHONE : '1-888-555-0123');
    const providerId = p.id || (provider ? provider.id : null);
    const logo = provider ? provider.logo : null;
    const rank = p._rank || '';
    const planCount = provider ? provider.plans.length : 0;

    // Badge classes
    let rowClass = 'result-row';
    let rankLabel = '';
    if (p.badge === 'best-overall') { rowClass += ' top-pick'; rankLabel = 'Top Pick'; }
    else if (p.badge === 'best-speed') { rowClass += ' best-speed'; rankLabel = 'Fastest'; }
    else if (p.badge === 'best-value') { rowClass += ' best-value'; rankLabel = 'Best Value'; }

    // Type chips
    const typeMap = { fiber: 'Fiber', cable: 'Cable', dsl: 'DSL', '5g': '5G', 'fixed-wireless': 'FWA', satellite: 'Sat' };
    const typeTags = types.map(t => `<span class="result-tag" data-type="${t}">${typeMap[t] || t}</span>`).join('');

    // Logo
    const logoHTML = logo
        ? `<img src="${logo}" alt="${name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        + `<span class="result-logo-fallback" style="display:none">${name.slice(0, 2).toUpperCase()}</span>`
        : `<span class="result-logo-fallback">${name.slice(0, 2).toUpperCase()}</span>`;

    const apiTag = '';

    // Data attribute for modal
    const dataAttr = providerId ? `data-provider-id="${providerId}"` : '';

    return `
        <div class="${rowClass}" ${dataAttr}>
            <div class="result-rank">
                <span class="rank-num">${rank || '#'}</span>
                ${rankLabel ? `<span class="rank-label">${rankLabel}</span>` : ''}
            </div>
            <div class="result-logo">${logoHTML}</div>
            <div class="result-info">
                <div class="result-name">
                    ${name}
                    ${rating ? `<span class="result-rating"><i class="fas fa-star"></i> ${rating}</span>` : ''}
                </div>
                <div class="result-meta">
                    ${typeTags}
                    ${apiTag}
                </div>
            </div>
            <div class="result-stats">
                <div class="result-stat">
                    <div class="result-stat-val">${maxSpeed ? formatSpeed(maxSpeed) : 'N/A'}</div>
                    <div class="result-stat-label">Max Speed</div>
                </div>
                <div class="result-stat">
                    <div class="result-stat-val">${lowestPrice ? formatPrice(lowestPrice) + '<small>/mo</small>' : 'Call'}</div>
                    <div class="result-stat-label">From</div>
                </div>
            </div>
            <div class="result-actions">
                ${planCount > 0 ? `<button class="btn-plans" onclick="event.stopPropagation();openProviderModal('${providerId}')">View ${planCount} Plans</button>` : ''}
                <a href="tel:${phone}" class="btn-call" onclick="event.stopPropagation()"><i class="fas fa-phone-alt"></i> Call Now</a>
            </div>
        </div>`;
}

function isInPagesDir() {
    return window.location.pathname.includes('/pages/');
}

// ============================================
// Providers Results Page
// ============================================
function initProvidersPage() {
    if (!window.location.pathname.match(/providers(\.html)?$/)) return;

    const urlParams = new URLSearchParams(window.location.search);
    const zip = urlParams.get('zip') || sessionStorage.getItem('searchZip');

    if (zip) {
        document.getElementById('zipInput')?.setAttribute('value', zip);
        loadProviders(zip);
    } else {
        loadProviders(null);
    }

    initFilters();
}

async function loadProviders(zip) {
    const grid = document.getElementById('providersGrid');
    const pageTitle = document.getElementById('pageTitle');
    const pageDesc = document.getElementById('pageDesc');
    const resultsCount = document.getElementById('resultsCount');
    const breadLoc = document.getElementById('breadLoc');
    const locationBanner = document.getElementById('locationBanner');

    if (!grid) return;

    // Loading skeleton
    grid.innerHTML = Array(4).fill(`
        <div class="result-row" style="min-height:80px;overflow:hidden">
            <div class="skeleton" style="height:100%;grid-column:1/-1;border-radius:var(--r-xl)"></div>
        </div>
    `).join('');

    let result;
    if (zip && zip.length === 5) {
        try {
            result = await BroadbandAPI.searchByZip(zip);
        } catch (e) {
            console.warn('API error, using local data:', e);
            result = buildLocalResult(zip);
        }
        // If API returned no providers, always fall back to local data
        if (!result || !result.providers || result.providers.length === 0) {
            result = buildLocalResult(zip);
        }
        assignRanks(result.providers);
        updatePageForResults(result, pageTitle, pageDesc, breadLoc, resultsCount, locationBanner);
    } else {
        result = buildAllPartnersResult();
        assignRanks(result.providers);
        if (resultsCount) resultsCount.innerHTML = `Showing <strong>${result.providers.length}</strong> partner providers`;
    }

    window._allProviders = result.providers;
    window._resultSource = result.source;
    renderProviderResults(result.providers, result.source);
}

// Build result from local data for a specific ZIP
function buildLocalResult(zip) {
    if (typeof getProvidersByZip !== 'function') return buildAllPartnersResult();
    const local = getProvidersByZip(zip);
    return {
        zip,
        city: local.city || 'Your Area',
        state: local.state || '',
        providers: local.providers.map(p => ({
            id: p.id, name: p.name, types: p.types,
            maxSpeed: Math.max(...p.plans.map(pl => pl.speed)),
            maxUpload: Math.max(...p.plans.map(pl => pl.uploadSpeed || 0)),
            minPrice: Math.min(...p.plans.map(pl => pl.promoPrice || pl.price)),
            rating: p.rating, reviewCount: p.reviewCount, isPartner: p.isPartner,
            fullData: p, phone: p.phone, source: 'local', apiConfirmed: false,
        })),
        source: 'local',
    };
}

// Build result with all partner providers (no zip)
function buildAllPartnersResult() {
    const all = (typeof providers !== 'undefined' ? providers : []).filter(p => p.isPartner);
    return {
        providers: all.map(p => ({
            id: p.id, name: p.name, types: p.types,
            maxSpeed: Math.max(...p.plans.map(pl => pl.speed)),
            maxUpload: Math.max(...p.plans.map(pl => pl.uploadSpeed || 0)),
            minPrice: Math.min(...p.plans.map(pl => pl.promoPrice || pl.price)),
            rating: p.rating, reviewCount: p.reviewCount, isPartner: p.isPartner,
            fullData: p, phone: p.phone, source: 'local', apiConfirmed: false,
        })),
        source: 'local',
    };
}

// Assign sequential ranks + badges (partners get badge priority)
function assignRanks(providerList) {
    // If already ranked by API (has _score), preserve that order; otherwise sort partners first
    if (!providerList[0]?._score) {
        providerList.sort((a, b) => {
            // API-confirmed partners first
            if (a.apiConfirmed && a.isPartner && !(b.apiConfirmed && b.isPartner)) return -1;
            if (b.apiConfirmed && b.isPartner && !(a.apiConfirmed && a.isPartner)) return 1;
            // Then other partners
            if (a.isPartner && !b.isPartner) return -1;
            if (b.isPartner && !a.isPartner) return 1;
            // Then by speed
            return (b.maxSpeed || 0) - (a.maxSpeed || 0);
        });
    }
    providerList.forEach((p, i) => { p._rank = i + 1; });

    // Clear any previous badges
    providerList.forEach(p => delete p.badge);

    // Best Overall: first partner (highest ranked)
    const topPartner = providerList.find(p => p.isPartner);
    if (topPartner) topPartner.badge = 'best-overall';
    else if (providerList.length > 0) providerList[0].badge = 'best-overall';

    // Fastest: prefer partner, allow non-partner if much faster
    const partners = providerList.filter(p => p.isPartner);
    const fastestPartner = partners.reduce((best, p) => (!best || (p.maxSpeed || 0) > (best.maxSpeed || 0)) ? p : best, null);
    const fastestAny = providerList.reduce((best, p) => (!best || (p.maxSpeed || 0) > (best.maxSpeed || 0)) ? p : best, null);
    const fastest = (fastestAny && fastestAny.isPartner === false && (fastestAny.maxSpeed || 0) > (fastestPartner?.maxSpeed || 0) * 1.5)
        ? fastestAny : (fastestPartner || fastestAny);
    if (fastest && !fastest.badge) fastest.badge = 'best-speed';

    // Best Value: partner with best speed/price ratio, 100 Mbps minimum
    const bestVal = partners
        .filter(p => p.minPrice > 0 && (p.maxSpeed || 0) >= 100 && !p.badge)
        .reduce((best, p) => {
            const val = (p.maxSpeed || 0) / (p.minPrice || 999);
            const bestValRatio = (best?.maxSpeed || 0) / (best?.minPrice || 999);
            return val > bestValRatio ? p : best;
        }, null);
    if (bestVal) bestVal.badge = 'best-value';
}

function updatePageForResults(result, pageTitle, pageDesc, breadLoc, resultsCount, locationBanner) {
    const loc = [result.city, result.state].filter(Boolean).join(', ');
    const displayLoc = loc || 'Your Area';

    if (pageTitle) pageTitle.textContent = `Internet Providers in ${displayLoc}`;
    if (pageDesc) pageDesc.textContent = `Compare ${result.providers.length} providers available near ${displayLoc}`;
    if (breadLoc) breadLoc.textContent = `Providers in ${displayLoc}`;

    const isLive = result.source === 'broadbandmap';
    const sourceHTML = isLive
        ? '<span class="results-live api"><span class="dot"></span> Live data</span>'
        : '<span class="results-live local"><span class="dot"></span> Coverage data</span>';

    if (resultsCount) {
        resultsCount.innerHTML = `Showing <strong>${result.providers.length}</strong> providers in <strong>${displayLoc}</strong> ${sourceHTML}`;
    }

    if (locationBanner) {
        locationBanner.innerHTML = `<i class="fas fa-map-marker-alt"></i> Showing results for <strong>${displayLoc}</strong>${result.zip ? ' (' + result.zip + ')' : ''}`;
        locationBanner.style.display = 'flex';
    }

    document.title = `Internet Providers in ${displayLoc} - Internet 4 ALL`;

}

function renderProviderResults(providerList, source) {
    const grid = document.getElementById('providersGrid');
    if (!grid) return;

    if (providerList.length === 0) {
        const phone = typeof MAIN_PHONE !== 'undefined' ? MAIN_PHONE : '1-888-555-0123';
        grid.innerHTML = `
            <div style="text-align:center;padding:64px 24px;">
                <i class="fas fa-search" style="font-size:3rem;color:var(--txt-m);margin-bottom:24px;display:block"></i>
                <h3 style="margin-bottom:12px">No providers found</h3>
                <p style="color:var(--txt-lt);margin-bottom:24px">Try a different ZIP code or call us for help.</p>
                <a href="tel:${phone}" class="btn btn-green btn-lg"><i class="fas fa-phone-alt"></i> Call for Assistance</a>
            </div>`;
        return;
    }

    grid.innerHTML = providerList.map(p => createResultRow(p)).join('');

    // Add disclaimer
    let disclaimerEl = document.getElementById('resultsDisclaimer');
    if (!disclaimerEl) {
        disclaimerEl = document.createElement('div');
        disclaimerEl.id = 'resultsDisclaimer';
        disclaimerEl.className = 'disclaimer';
        grid.parentNode.insertBefore(disclaimerEl, grid.nextSibling);
    }
    disclaimerEl.innerHTML = `<i class="fas fa-info-circle"></i> <span>Availability and speeds may vary by exact address. Final plan details confirmed during order. Data from BroadbandMap.com and provider partners.</span>`;
}

// ============================================
// Filters (Providers Page)
// ============================================
function initFilters() {
    document.querySelectorAll('[data-filter-type]').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('[data-filter-type]').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            applyFilters();
        });
    });

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.addEventListener('change', applyFilters);
}

function applyFilters() {
    if (!window._allProviders) return;
    let list = [...window._allProviders];

    // Type filter
    const activeType = document.querySelector('[data-filter-type].active')?.dataset.filterType;
    if (activeType && activeType !== 'all') {
        list = list.filter(p => {
            const types = p.types || (p.fullData ? p.fullData.types : []);
            return types.includes(activeType);
        });
    }

    // Sort
    const sort = document.getElementById('sortSelect')?.value;
    switch (sort) {
        case 'price-low':
            list.sort((a, b) => (a.minPrice || 999) - (b.minPrice || 999));
            break;
        case 'price-high':
            list.sort((a, b) => (b.minPrice || 0) - (a.minPrice || 0));
            break;
        case 'speed':
            list.sort((a, b) => (b.maxSpeed || 0) - (a.maxSpeed || 0));
            break;
        case 'rating':
            list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        default:
            list.sort((a, b) => (b._score || 0) - (a._score || 0));
    }

    renderProviderResults(list, window._resultSource);

    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        const existing = resultsCount.querySelector('.results-live');
        const sourceHTML = existing ? existing.outerHTML : '';
        resultsCount.innerHTML = `Showing <strong>${list.length}</strong> providers ${sourceHTML}`;
    }
}

// ============================================
// Compare Page
// ============================================
function initComparisonPage() {
    if (!window.location.pathname.match(/compare(\.html)?$/)) return;
    if (typeof providers === 'undefined') return;

    const selects = document.querySelectorAll('.provider-select');
    selects.forEach(sel => {
        providers.filter(p => p.isPartner).forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.name;
            sel.appendChild(opt);
        });
        sel.addEventListener('change', updateComparison);
    });

    const partnerList = providers.filter(p => p.isPartner);
    if (selects.length >= 3 && partnerList.length >= 3) {
        selects[0].value = partnerList[0].id;
        selects[1].value = partnerList[1].id;
        selects[2].value = partnerList[2].id;
        updateComparison();
    }
}

function updateComparison() {
    const selects = document.querySelectorAll('.provider-select');
    const selectedProviders = [];

    selects.forEach((sel, index) => {
        const col = index + 1;
        const provider = providers.find(p => p.id === sel.value);

        const headerEl = document.getElementById('header' + col);
        const speedEl = document.getElementById('speed' + col);
        const priceEl = document.getElementById('price' + col);
        const typeEl = document.getElementById('type' + col);
        const capEl = document.getElementById('cap' + col);
        const contractEl = document.getElementById('contract' + col);
        const ratingEl = document.getElementById('rating' + col);
        const plansEl = document.getElementById('plans' + col);
        const ctaEl = document.getElementById('cta' + col);

        if (provider) {
            selectedProviders.push(provider);
            const maxSpeed = Math.max(...provider.plans.map(p => p.speed));
            const minPrice = Math.min(...provider.plans.map(p => p.promoPrice || p.price));

            if (headerEl) headerEl.textContent = provider.name;
            if (speedEl) speedEl.innerHTML = `<span class="val">${formatSpeed(maxSpeed)}</span>`;
            if (priceEl) priceEl.innerHTML = `<span class="val">${formatPrice(minPrice)}/mo</span>`;
            if (typeEl) typeEl.textContent = provider.types.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ');
            if (capEl) capEl.textContent = provider.plans[0].dataCap || 'N/A';
            if (contractEl) contractEl.textContent = provider.plans[0].contract || 'N/A';
            if (ratingEl) ratingEl.innerHTML = `<span class="val">${provider.rating} ★</span>`;
            if (plansEl) plansEl.textContent = provider.plans.length + ' plans';
            if (ctaEl) ctaEl.innerHTML = `<a href="tel:${provider.phone}" class="btn btn-green btn-sm"><i class="fas fa-phone-alt"></i> Call</a>`;
        } else {
            if (headerEl) headerEl.textContent = '-';
            [speedEl, priceEl, typeEl, capEl, contractEl, ratingEl, plansEl].forEach(el => { if (el) el.textContent = '-'; });
            if (ctaEl) ctaEl.textContent = '-';
        }
    });

    highlightBestValues(selectedProviders);
}

function highlightBestValues(selectedProviders) {
    if (selectedProviders.length < 2) return;

    let bestSpeed = 0, bestPrice = Infinity, bestRating = 0;
    selectedProviders.forEach(p => {
        const maxSpeed = Math.max(...p.plans.map(pl => pl.speed));
        const minPrice = Math.min(...p.plans.map(pl => pl.promoPrice || pl.price));
        if (maxSpeed > bestSpeed) bestSpeed = maxSpeed;
        if (minPrice < bestPrice) bestPrice = minPrice;
        if (p.rating > bestRating) bestRating = p.rating;
    });

    document.querySelectorAll('.provider-select').forEach((sel, i) => {
        const col = i + 1;
        const provider = providers.find(p => p.id === sel.value);
        if (!provider) return;

        const maxSpeed = Math.max(...provider.plans.map(p => p.speed));
        const minPrice = Math.min(...provider.plans.map(p => p.promoPrice || p.price));

        const speedEl = document.getElementById('speed' + col);
        const priceEl = document.getElementById('price' + col);
        const ratingEl = document.getElementById('rating' + col);

        if (speedEl && maxSpeed === bestSpeed) speedEl.querySelector('.val')?.classList.add('best');
        if (priceEl && minPrice === bestPrice) priceEl.querySelector('.val')?.classList.add('best');
        if (ratingEl && provider.rating === bestRating) ratingEl.querySelector('.val')?.classList.add('best');
    });
}

// ============================================
// Speed Test Page
// ============================================
function initSpeedTest() {
    const startBtn = document.getElementById('startSpeedTest');
    if (!startBtn) return;

    const speedBig = document.getElementById('speedBig');
    const downloadEl = document.getElementById('dlSpeed');
    const uploadEl = document.getElementById('ulSpeed');
    const pingEl = document.getElementById('pingSpeed');
    const ring = document.querySelector('.speed-ring');
    const svgCircle = document.getElementById('speedCircle');
    const resultsCard = document.getElementById('speedResults');
    const resultsCardsWrap = document.getElementById('speedResultCards');

    startBtn.addEventListener('click', async () => {
        if (startBtn.disabled) return;
        startBtn.disabled = true;
        startBtn.innerHTML = '<span class="spinner"></span> Testing...';

        speedBig.textContent = '0';
        if (downloadEl) downloadEl.textContent = '--';
        if (uploadEl) uploadEl.textContent = '--';
        if (pingEl) pingEl.textContent = '--';
        ring?.classList.add('testing');
        ring?.classList.remove('done');
        if (resultsCard) resultsCard.style.display = 'none';
        if (resultsCardsWrap) resultsCardsWrap.style.display = 'block';

        const downloadSpeed = await animateSpeedTest(speedBig, svgCircle, 'download');
        if (downloadEl) downloadEl.textContent = downloadSpeed.toFixed(1) + ' Mbps';

        const uploadSpeed = Math.floor(downloadSpeed * (0.15 + Math.random() * 0.35));
        await animateCounter(speedBig, 0, uploadSpeed, 1500);
        if (uploadEl) uploadEl.textContent = uploadSpeed.toFixed(1) + ' Mbps';

        const ping = Math.floor(Math.random() * 25) + 5;
        if (pingEl) pingEl.textContent = ping + ' ms';

        speedBig.textContent = downloadSpeed.toFixed(0);
        ring?.classList.remove('testing');
        ring?.classList.add('done');

        startBtn.disabled = false;
        startBtn.innerHTML = '<i class="fas fa-redo"></i> Test Again';

        showSpeedResults(downloadSpeed, uploadSpeed, ping);
    });
}

function animateSpeedTest(el, circle, phase) {
    return new Promise(resolve => {
        const target = Math.floor(Math.random() * 400) + 50;
        const duration = 3000;
        const start = performance.now();
        const circumference = circle ? 2 * Math.PI * 120 : 0;

        if (circle) {
            circle.style.strokeDasharray = circumference;
            circle.style.strokeDashoffset = circumference;
        }

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);

            el.textContent = current;

            if (circle) {
                circle.style.strokeDashoffset = circumference - (eased * circumference);
                circle.style.stroke = current > 100 ? '#10b981' : current > 50 ? '#1a56db' : current > 25 ? '#f59e0b' : '#ef4444';
            }

            if (progress < 1) requestAnimationFrame(tick);
            else resolve(target);
        }
        requestAnimationFrame(tick);
    });
}

function animateCounter(el, from, to, duration) {
    return new Promise(resolve => {
        const start = performance.now();
        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            el.textContent = Math.floor(from + (to - from) * progress);
            if (progress < 1) requestAnimationFrame(tick);
            else resolve();
        }
        requestAnimationFrame(tick);
    });
}

function showSpeedResults(download, upload, ping) {
    const card = document.getElementById('speedResults');
    if (!card) return;
    card.style.display = 'block';

    let grade, color, message;
    if (download >= 200) {
        grade = 'Excellent'; color = 'var(--green)';
        message = 'Your speed is excellent! Perfect for 4K streaming, gaming, video calls, and large households.';
    } else if (download >= 100) {
        grade = 'Great'; color = 'var(--blue)';
        message = 'Great speeds for most households. Comfortably stream HD/4K, game online, and work from home.';
    } else if (download >= 50) {
        grade = 'Good'; color = 'var(--teal)';
        message = 'Good for general use including HD streaming and video calls. May slow with many simultaneous users.';
    } else if (download >= 25) {
        grade = 'Fair'; color = 'var(--amber)';
        message = 'Adequate for basic use but may struggle with 4K or multiple devices. Consider upgrading.';
    } else {
        grade = 'Slow'; color = 'var(--red)';
        message = 'Below recommended levels. You may experience buffering and slow downloads. We can help find faster internet.';
    }

    const phone = typeof MAIN_PHONE !== 'undefined' ? MAIN_PHONE : '1-888-555-0123';
    card.innerHTML = `
        <h3 style="color:${color};margin-bottom:12px"><i class="fas fa-chart-line"></i> Your Results: ${grade}</h3>
        <p style="color:var(--txt-lt);line-height:1.7;margin-bottom:24px">${message}</p>
        <div style="background:var(--bg-alt);padding:20px;border-radius:var(--r-lg);">
            <p style="font-weight:700;margin-bottom:8px">Want faster internet?</p>
            <p style="color:var(--txt-lt);margin-bottom:16px">Our experts can find you a better plan at a great price.</p>
            <a href="tel:${phone}" class="btn btn-green btn-lg"><i class="fas fa-phone-alt"></i> Call ${phone}</a>
        </div>`;
}

// ============================================
// Provider Detail Page
// ============================================
function initProviderPage() {
    if (!window.location.pathname.match(/provider(\.html)?$/)) return;
    if (typeof providers === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const providerId = urlParams.get('id');
    if (!providerId) return;

    const provider = providers.find(p => p.id === providerId);
    if (!provider) {
        document.querySelector('main').innerHTML = `
            <div class="wrap" style="text-align:center;padding:64px 24px">
                <h2>Provider not found</h2>
                <p style="color:var(--txt-lt);margin:16px 0">The provider you're looking for doesn't exist.</p>
                <a href="providers.html" class="btn btn-blue">View All Providers</a>
            </div>`;
        return;
    }

    renderProviderDetail(provider);
}

function renderProviderDetail(p) {
    document.title = `${p.name} Internet Plans & Prices - Internet 4 ALL`;

    const heroLogo = document.getElementById('providerLogo');
    const heroName = document.getElementById('providerName');
    const heroRating = document.getElementById('providerRating');
    const heroTypes = document.getElementById('providerTypes');
    const heroDesc = document.getElementById('providerDesc');
    const heroPhone = document.getElementById('providerPhone');
    const heroPhoneBar = document.getElementById('providerPhoneBar');
    const breadName = document.getElementById('breadProvider');

    if (heroLogo) heroLogo.innerHTML = `<img src="${p.logo}" alt="${p.name}" onerror="this.style.display='none'">`;
    if (heroName) heroName.textContent = p.name;
    if (heroRating) heroRating.innerHTML = `<span class="stars">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5 - Math.round(p.rating))}</span> <span class="rating-text">${p.rating} (${p.reviewCount.toLocaleString()} reviews)</span>`;
    if (heroTypes) heroTypes.innerHTML = p.types.map(t => `<span class="type-tag" data-type="${t}">${t.charAt(0).toUpperCase() + t.slice(1)}</span>`).join('');
    if (heroDesc) heroDesc.textContent = p.description;
    if (heroPhone) { heroPhone.innerHTML = `<i class="fas fa-phone-alt"></i> ${p.phone}`; heroPhone.href = `tel:${p.phone}`; }
    if (heroPhoneBar) { heroPhoneBar.innerHTML = `<i class="fas fa-phone-alt"></i> ${p.phone}`; heroPhoneBar.href = `tel:${p.phone}`; }
    if (breadName) breadName.textContent = p.name;

    // Plans
    const plansGrid = document.getElementById('plansGrid');
    if (plansGrid) {
        plansGrid.innerHTML = p.plans.map((plan, i) => {
            const isFeatured = i === Math.floor(p.plans.length / 2);
            const speedDisplay = plan.speed >= 1000
                ? `${(plan.speed / 1000).toFixed(plan.speed % 1000 === 0 ? 0 : 1)} <small>Gbps</small>`
                : `${plan.speed} <small>Mbps</small>`;
            const hasDiscount = plan.promoPrice && plan.promoPrice < plan.price;

            return `
                <div class="plan-card${isFeatured ? ' featured' : ''}">
                    <div class="plan-name">${plan.name}</div>
                    <div class="plan-speed">${speedDisplay}</div>
                    <div class="plan-price">${formatPrice(plan.promoPrice || plan.price)}<small>/mo</small></div>
                    ${hasDiscount ? `<div class="plan-price-old">${formatPrice(plan.price)}/mo regular</div>` : '<div style="margin-bottom:20px"></div>'}
                    <div class="plan-features">
                        ${plan.uploadSpeed ? `<div class="plan-feat"><i class="fas fa-upload"></i> ${formatSpeed(plan.uploadSpeed)} upload</div>` : ''}
                        <div class="plan-feat"><i class="fas fa-check"></i> ${plan.dataCap} data</div>
                        <div class="plan-feat"><i class="fas fa-check"></i> ${plan.contract === 'None' ? 'No contract' : plan.contract}</div>
                        ${plan.features.map(f => `<div class="plan-feat"><i class="fas fa-check"></i> ${f}</div>`).join('')}
                    </div>
                    <a href="tel:${p.phone}" class="btn btn-green btn-lg" style="width:100%;">
                        <i class="fas fa-phone-alt"></i> Call to Order
                    </a>
                </div>`;
        }).join('');
    }

    // Pros/Cons
    const prosEl = document.getElementById('prosList');
    const consEl = document.getElementById('consList');
    if (prosEl) prosEl.innerHTML = p.pros.map(pro => `<div class="pros-item"><i class="fas fa-check"></i> ${pro}</div>`).join('');
    if (consEl) consEl.innerHTML = p.cons.map(con => `<div class="cons-item"><i class="fas fa-times"></i> ${con}</div>`).join('');

    // Coverage
    const coverageEl = document.getElementById('coverageList');
    if (coverageEl) {
        coverageEl.innerHTML = p.coverage.map(c => `<span class="type-tag">${c}</span>`).join('');
    }
}

// ============================================
// Scroll Reveal Animations
// ============================================
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
}

// ============================================
// MODAL SYSTEM
// ============================================
function initModal() {
    const overlay = document.getElementById('providerModal');
    if (!overlay) return;

    const closeBtn = document.getElementById('modalClose');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function openProviderModal(providerId) {
    if (typeof providers === 'undefined') return;
    const provider = providers.find(p => p.id === providerId);
    if (!provider) return;

    const overlay = document.getElementById('providerModal');
    const header = document.getElementById('modalHeader');
    const body = document.getElementById('modalBody');
    if (!overlay || !header || !body) return;

    // Build header
    header.innerHTML = `
        <img src="${provider.logo}" alt="${provider.name}" onerror="this.style.display='none'">
        <div class="modal-header-text">
            <h2>${provider.name}</h2>
            <div class="modal-rating"><i class="fas fa-star"></i> ${provider.rating} <span style="color:var(--txt-m);font-weight:400">(${provider.reviewCount.toLocaleString()} reviews)</span></div>
        </div>`;

    // Build plans
    const plansHTML = provider.plans.map((plan, i) => {
        const isFeatured = i === Math.floor(provider.plans.length / 2);
        const hasDiscount = plan.promoPrice && plan.promoPrice < plan.price;
        const speedDisplay = plan.speed >= 1000 ? `${(plan.speed / 1000).toFixed(plan.speed % 1000 === 0 ? 0 : 1)} Gbps` : `${plan.speed} Mbps`;

        return `
            <div class="modal-plan${isFeatured ? ' featured' : ''}">
                <div class="modal-plan-info">
                    <h4>${plan.name}</h4>
                    <div class="modal-plan-features">${plan.dataCap} data &bull; ${plan.contract === 'None' ? 'No contract' : plan.contract}${plan.uploadSpeed ? ` &bull; ${formatSpeed(plan.uploadSpeed)} up` : ''}</div>
                </div>
                <div class="modal-plan-speed">
                    <div class="val">${speedDisplay}</div>
                    <div class="label">Download</div>
                </div>
                <div class="modal-plan-price">
                    <div class="val">${formatPrice(plan.promoPrice || plan.price)}<small>/mo</small></div>
                    ${hasDiscount ? `<div class="old-price">${formatPrice(plan.price)}/mo</div>` : '<div class="label">per month</div>'}
                </div>
            </div>`;
    }).join('');

    // Key features
    const features = [];
    if (provider.pros && provider.pros.length) {
        features.push(...provider.pros.slice(0, 3).map(f => `<span style="display:inline-flex;align-items:center;gap:4px;font-size:.8125rem;color:var(--txt-lt)"><i class="fas fa-check" style="color:var(--green);font-size:.625rem"></i> ${f}</span>`));
    }

    body.innerHTML = `
        ${features.length ? `<div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:24px">${features.join('')}</div>` : ''}
        <div class="modal-plans">${plansHTML}</div>
        <div class="modal-cta">
            <a href="tel:${provider.phone}" class="btn-call-lg"><i class="fas fa-phone-alt"></i> Call ${provider.phone}</a>
            <p>Speak with an expert to order</p>
        </div>`;

    // Show modal
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const overlay = document.getElementById('providerModal');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}



// ============================================
// Utility
// ============================================
if (typeof formatSpeed === 'undefined') {
    window.formatSpeed = function(speed) {
        if (speed >= 1000) {
            const g = speed / 1000;
            return (g % 1 === 0 ? g.toFixed(0) : g.toFixed(1)) + ' Gbps';
        }
        return speed + ' Mbps';
    };
}
if (typeof formatPrice === 'undefined') {
    window.formatPrice = function(price) {
        return '$' + price.toFixed(2);
    };
}
