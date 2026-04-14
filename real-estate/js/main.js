// Main UI Logic for LuxEstate

// Common Functions
function initMobileMenu() {
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('show');
            mobileBtn.textContent = navLinks.classList.contains('show') ? '✕' : '☰';
        });
    }
}

function createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'property-card';

    // Format price
    const formattedPrice = dataManager.formatPrice(property.price);

    card.innerHTML = `
        <a href="property-details.html?id=${property.id}">
            <div class="property-img-wrapper">
                ${property.featured ? '<span class="property-badge">Featured</span>' : ''}
                <img src="${property.image}" alt="${property.title}">
            </div>
            <div class="property-content">
                <div class="property-price">${formattedPrice}</div>
                <h3 class="property-title">${property.title}</h3>
                <div class="property-location">
                    <span>📍</span> ${property.location}
                </div>
                <div class="property-features">
                    <div class="feature">🛏️ ${property.beds} Beds</div>
                    <div class="feature">🛁 ${property.baths} Baths</div>
                    <div class="feature">📐 ${property.sqft} sqft</div>
                </div>
            </div>
        </a>
    `;

    return card;
}

// Page Specific Initializers

// Home Page
async function loadFeaturedProperties() {
    const grid = document.getElementById('featured-properties-grid');
    const spinner = document.getElementById('loading-spinner');

    if (!grid) return;

    try {
        await dataManager.loadProperties();
        const featured = dataManager.getFeaturedProperties();

        spinner.classList.add('hidden');

        featured.forEach(property => {
            grid.appendChild(createPropertyCard(property));
        });
    } catch (error) {
        spinner.textContent = 'Error loading properties. Please try again later.';
        console.error(error);
    }
}

// Listings Page
async function initListingsPage() {
    const grid = document.getElementById('all-properties-grid');
    const spinner = document.getElementById('loading-spinner');
    const filterForm = document.getElementById('filter-form');
    const noResults = document.getElementById('no-results');
    const resetBtn = document.getElementById('reset-filters');

    if (!grid || !filterForm) return;

    // Parse URL parameters if arriving from Home search
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('location')) filterForm.elements['location'].value = urlParams.get('location');
    if (urlParams.has('type')) filterForm.elements['type'].value = urlParams.get('type');
    if (urlParams.has('maxPrice')) filterForm.elements['maxPrice'].value = urlParams.get('maxPrice');

    const renderProperties = (properties) => {
        grid.innerHTML = '';
        if (properties.length === 0) {
            noResults.classList.remove('hidden');
        } else {
            noResults.classList.add('hidden');
            properties.forEach(property => {
                grid.appendChild(createPropertyCard(property));
            });
        }
    };

    try {
        await dataManager.loadProperties();
        spinner.classList.add('hidden');

        // Initial render (apply URL filters if any)
        const initialCriteria = {
            location: filterForm.elements['location'].value,
            type: filterForm.elements['type'].value,
            maxPrice: filterForm.elements['maxPrice'].value,
            beds: filterForm.elements['beds'] ? filterForm.elements['beds'].value : 'any'
        };

        renderProperties(dataManager.filterProperties(initialCriteria));

        // Filter event
        filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const criteria = {
                location: filterForm.elements['location'].value,
                type: filterForm.elements['type'].value,
                maxPrice: filterForm.elements['maxPrice'].value,
                beds: filterForm.elements['beds'].value
            };
            renderProperties(dataManager.filterProperties(criteria));
        });

        // Reset event
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                filterForm.reset();
                renderProperties(dataManager.getProperties());
            });
        }

    } catch (error) {
        spinner.textContent = 'Error loading properties.';
    }
}

// Property Details Page
async function initPropertyDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const spinner = document.getElementById('loading-spinner');
    const content = document.getElementById('property-content');

    if (!id || !spinner || !content) return;

    try {
        await dataManager.loadProperties();
        const property = dataManager.getPropertyById(id);

        if (property) {
            // Populate DOM
            document.title = `${property.title} | LuxEstate`;
            document.getElementById('prop-title').textContent = property.title;
            document.getElementById('prop-location').innerHTML = `📍 ${property.location}`;
            document.getElementById('prop-price').textContent = dataManager.formatPrice(property.price);
            document.getElementById('prop-beds').textContent = property.beds;
            document.getElementById('prop-baths').textContent = property.baths;
            document.getElementById('prop-sqft').textContent = property.sqft.toLocaleString();
            document.getElementById('prop-type').textContent = property.type;
            document.getElementById('prop-desc').textContent = property.description;

            // Initialize 3D Viewer for this property (if function exists)
            if (typeof initProperty3D === 'function') {
                initProperty3D(property);
            }

            spinner.classList.add('hidden');
            content.classList.remove('hidden');
        } else {
            spinner.textContent = 'Property not found.';
        }
    } catch (error) {
        spinner.textContent = 'Error loading property details.';
    }
}

// Contact Form Validation
function initContactForm() {
    const form = document.getElementById('contact-form');
    const successMsg = document.getElementById('form-success');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let isValid = true;
        const fields = ['firstName', 'lastName', 'email', 'message'];

        // Simple validation
        fields.forEach(field => {
            const el = document.getElementById(field);
            const errorEl = document.getElementById(`${field}-error`);

            if (el.value.trim() === '') {
                isValid = false;
                errorEl.style.display = 'block';
                el.style.borderColor = '#e53e3e';
            } else if (field === 'email' && !/\S+@\S+\.\S+/.test(el.value)) {
                isValid = false;
                errorEl.style.display = 'block';
                el.style.borderColor = '#e53e3e';
            } else {
                errorEl.style.display = 'none';
                el.style.borderColor = 'var(--border-color)';
            }
        });

        if (isValid) {
            // Simulate form submission
            form.reset();
            successMsg.classList.remove('hidden');
            setTimeout(() => {
                successMsg.classList.add('hidden');
            }, 5000);
        }
    });

    // Clear errors on input
    form.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', function() {
            const errorEl = document.getElementById(`${this.id}-error`);
            if (errorEl) errorEl.style.display = 'none';
            this.style.borderColor = 'var(--border-color)';
        });
    });
}

// Global Init
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
});