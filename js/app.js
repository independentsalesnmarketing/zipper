// ============================================
// Internet 4 ALL - Main Application
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initSearch();
    initFAQ();
    initProviderCards();
    initMobileMenu();
});

// Search functionality
function initSearch() {
    const searchBox = document.getElementById('searchBox');
    const zipInput = document.getElementById('zipInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (zipInput && searchBtn) {
        zipInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5);
        });
        
        zipInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
        
        searchBtn.addEventListener('click', handleSearch);
    }
    
    // CTA search
    const ctaZipInput = document.getElementById('ctaZipInput');
    const ctaSearchBtn = document.getElementById('ctaSearchBtn');
    
    if (ctaZipInput && ctaSearchBtn) {
        ctaZipInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5);
        });
        
        ctaZipInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch(ctaZipInput.value);
        });
        
        ctaSearchBtn.addEventListener('click', () => handleSearch(ctaZipInput.value));
    }
}

function handleSearch(zipValue) {
    const zip = zipValue || document.getElementById('zipInput')?.value;
    
    if (!zip || zip.length !== 5) {
        alert('Please enter a valid 5-digit ZIP code');
        return;
    }
    
    // Store ZIP and redirect to providers page
    sessionStorage.setItem('searchZip', zip);
    window.location.href = window.location.pathname.includes('/pages/') 
        ? 'providers.html?zip=' + zip 
        : 'pages/providers.html?zip=' + zip;
}

// FAQ Accordion
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all
            faqItems.forEach(i => i.classList.remove('active'));
            
            // Toggle current
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Render provider cards on homepage
function initProviderCards() {
    const grid = document.getElementById('providersGrid');
    if (!grid || typeof providers === 'undefined') return;
    
    // Show first 6 providers
    const featured = providers.slice(0, 6);
    
    grid.innerHTML = featured.map(provider => createProviderCard(provider)).join('');
}

function createProviderCard(provider, showOffer = true) {
    const lowestPrice = Math.min(...provider.plans.map(p => p.promoPrice || p.price));
    const maxSpeed = Math.max(...provider.plans.map(p => p.speed));
    const types = provider.types.map(t => {
        const labels = { fiber: 'Fiber', cable: 'Cable', dsl: 'DSL', '5g': '5G' };
        return `<span class="provider-type"><span class="type-dot ${t}"></span>${labels[t] || t}</span>`;
    }).join('');
    
    const offerBadge = showOffer && provider.plans[0].promoPrice < provider.plans[0].price 
        ? `<span class="offer-badge"><i class="fas fa-tag"></i> Special Offer</span>` 
        : '';
    
    return `
        <div class="provider-card">
            <div class="provider-card-header">
                <div class="provider-logo">
                    <img src="${provider.logo}" alt="${provider.name}" onerror="this.outerHTML='<span class=\\'provider-logo-text\\'>${provider.name.slice(0,2).toUpperCase()}</span>'">
                </div>
                ${offerBadge}
            </div>
            <div class="provider-card-body">
                <h3>${provider.name}</h3>
                <div class="provider-meta">
                    ${types}
                    <span class="provider-rating">
                        <i class="fas fa-star"></i>
                        ${provider.rating} (${provider.reviewCount.toLocaleString()})
                    </span>
                </div>
                <div class="provider-highlights">
                    <div class="highlight">
                        <div class="highlight-value">${formatSpeed(maxSpeed)}</div>
                        <div class="highlight-label">Max Speed</div>
                    </div>
                    <div class="highlight">
                        <div class="highlight-value">${formatPrice(lowestPrice)}<span>/mo</span></div>
                        <div class="highlight-label">Starting Price</div>
                    </div>
                </div>
                <div class="provider-features">
                    <div class="feature">
                        <i class="fas fa-check"></i>
                        <span>${provider.plans[0].dataCap} data</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-check"></i>
                        <span>${provider.plans[0].contract === 'None' ? 'No contract required' : provider.plans[0].contract + ' contract'}</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-check"></i>
                        <span>${provider.plans.length} plans available</span>
                    </div>
                </div>
            </div>
            <div class="cta-section">
                <a href="tel:${provider.phone}" class="cta-phone">
                    <i class="fas fa-phone"></i>
                    ${provider.phone}
                </a>
                <div class="cta-subtext">Call to order or get more info</div>
            </div>
        </div>
    `;
}

// Mobile menu
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');
    
    if (btn && navLinks) {
        btn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            btn.classList.toggle('active');
        });
    }
}

// Utility: Get URL parameters
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Format helpers (also in providers-data.js but needed if loaded separately)
if (typeof formatSpeed === 'undefined') {
    function formatSpeed(speed) {
        if (speed >= 1000) {
            return (speed / 1000).toFixed(speed % 1000 === 0 ? 0 : 1) + ' Gbps';
        }
        return speed + ' Mbps';
    }
}

if (typeof formatPrice === 'undefined') {
    function formatPrice(price) {
        return '$' + price.toFixed(2);
    }
}
