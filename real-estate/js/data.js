// Data Management for Real Estate Properties

// Mock data fallback in case fetch fails
const fallbackProperties = [
    {
        "id": 1,
        "title": "Modern Luxury Villa",
        "price": 2500000,
        "beds": 4,
        "baths": 3.5,
        "sqft": 4500,
        "location": "Beverly Hills, CA",
        "description": "Stunning modern villa with panoramic city views, infinity pool, and state-of-the-art smart home features.",
        "image": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
        "featured": true,
        "type": "house"
    },
    {
        "id": 2,
        "title": "Downtown Penthouse",
        "price": 1850000,
        "beds": 3,
        "baths": 3,
        "sqft": 2800,
        "location": "Downtown Metropolis",
        "description": "Luxurious penthouse featuring floor-to-ceiling windows, private rooftop terrace, and premium finishes.",
        "image": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        "featured": true,
        "type": "apartment"
    },
    {
        "id": 3,
        "title": "Coastal Retreat",
        "price": 3200000,
        "beds": 5,
        "baths": 4,
        "sqft": 5200,
        "location": "Malibu, CA",
        "description": "Oceanfront property with private beach access, expansive decks, and a contemporary open-concept design.",
        "image": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
        "featured": true,
        "type": "house"
    },
    {
        "id": 4,
        "title": "Suburban Oasis",
        "price": 950000,
        "beds": 4,
        "baths": 2.5,
        "sqft": 3100,
        "location": "Oak Park, IL",
        "description": "Beautifully renovated family home with a large backyard, custom kitchen, and finished basement.",
        "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        "featured": false,
        "type": "house"
    },
    {
        "id": 5,
        "title": "Urban Loft",
        "price": 750000,
        "beds": 2,
        "baths": 2,
        "sqft": 1500,
        "location": "Arts District, NY",
        "description": "Industrial-chic loft with exposed brick walls, high ceilings, and a chef's kitchen.",
        "image": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
        "featured": false,
        "type": "apartment"
    },
    {
        "id": 6,
        "title": "Mountain View Estate",
        "price": 4100000,
        "beds": 6,
        "baths": 5.5,
        "sqft": 6800,
        "location": "Aspen, CO",
        "description": "Spectacular mountain estate with ski-in/ski-out access, home theater, and heated driveways.",
        "image": "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
        "featured": false,
        "type": "house"
    }
];

class DataManager {
    constructor() {
        this.properties = [];
    }

    async loadProperties() {
        try {
            const response = await fetch('./data/properties.json');
            if (!response.ok) {
                throw new Error('Failed to fetch properties data');
            }
            this.properties = await response.json();
            return this.properties;
        } catch (error) {
            console.warn('Using fallback data due to fetch error:', error);
            this.properties = fallbackProperties;
            return this.properties;
        }
    }

    getProperties() {
        return this.properties;
    }

    getFeaturedProperties() {
        return this.properties.filter(prop => prop.featured);
    }

    getPropertyById(id) {
        return this.properties.find(prop => prop.id === parseInt(id));
    }

    filterProperties(criteria) {
        return this.properties.filter(prop => {
            let matches = true;

            if (criteria.location && criteria.location.trim() !== '') {
                matches = matches && prop.location.toLowerCase().includes(criteria.location.toLowerCase());
            }
            if (criteria.type && criteria.type !== 'all') {
                matches = matches && prop.type === criteria.type;
            }
            if (criteria.minPrice) {
                matches = matches && prop.price >= parseInt(criteria.minPrice);
            }
            if (criteria.maxPrice) {
                matches = matches && prop.price <= parseInt(criteria.maxPrice);
            }
            if (criteria.beds && criteria.beds !== 'any') {
                matches = matches && prop.beds >= parseInt(criteria.beds);
            }

            return matches;
        });
    }

    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(price);
    }
}

// Export a singleton instance
const dataManager = new DataManager();
