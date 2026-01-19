export const COLORS = {
  primary: '#FFC72C',
  primaryDark: '#FFC72C',
  darkBg: '#000000',
  darkSecondary: '#1E1E1E',
  white: '#FFFFFF',
  gray: '#F1F3F4'
}

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
}

export const MOCK_CATEGORIES = [
  { 
    id: 'malai-tikka', 
    name: 'Malai Tikka', 
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
    description: 'Creamy and savory delight'
  },
  { 
    id: 'thin-crust', 
    name: 'Thin Crust Pizza', 
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500',
    description: 'Crispy and delicious'
  },
  { 
    id: 'starters', 
    name: 'Starters', 
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500',
    description: 'Perfect way to start'
  },
  { 
    id: 'somewhat-local', 
    name: 'Somewhat Local', 
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
    description: 'Local flavors you love'
  },
  { 
    id: 'cheezy-treats', 
    name: 'Cheezy Treats', 
    image: 'https://images.unsplash.com/photo-1548369937-47519962c11a?w=500',
    description: 'For the cheese lovers'
  },
  { 
    id: 'sandwiches', 
    name: 'Sandwiches', 
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500',
    description: 'Fresh and filling'
  }
]

export const BRANCHES = [
  {
    id: '1',
    name: "Burlays F-11 Markaz",
    timing: "11 AM - 3 AM",
    phone: "051-111-222-333",
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500',
    mapsUrl: "https://goo.gl/maps/dummy",
    address: "Shop # 12, Ground Floor, Select One Plaza, F-11 Markaz, Islamabad"
  },
  {
    id: '2',
    name: "Burlays Gulberg Greens",
    timing: "12 PM - 2 AM",
    phone: "051-444-555-666",
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500',
    mapsUrl: "https://goo.gl/maps/dummy",
    address: "Plot # 5, Civic Center, Gulberg Greens, Islamabad"
  },
  {
    id: '3',
    name: "Burlays Bahria Town",
    timing: "11 AM - 1 AM",
    phone: "051-777-888-999",
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500',
    mapsUrl: "https://goo.gl/maps/dummy",
    address: "Phase 4, Civic Center, Bahria Town, Rawalpindi"
  }
]

export const CATALOG = [
  {
    id: 'malai-tikka',
    name: 'Malai Tikka',
    products: [
      {
        id: 'mt-1',
        name: 'Malai Tikka',
        description: 'A Flavorful Pizza Loaded With Fresh BBQ Malai Tikka Chunks And Topped With A Swirl Of Creamy Sauce.',
        productPic: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
        price_pk: 1600,
        price_uk: 15
      },
      {
        id: 'mt-2',
        name: 'Special Malai Tikka',
        description: 'Extra cheese and double meat topping.',
        productPic: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
        price_pk: 1800,
        price_uk: 17
      }
    ]
  },
  {
    id: 'thin-crust',
    name: 'Thin Crust Pizza',
    products: [
      {
        id: 'tc-1',
        name: 'Chicken Fajita',
        description: 'Classic fajita with onions and capsicum.',
        productPic: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500',
        price_pk: 1400,
        price_uk: 12
      },
      {
        id: 'tc-2',
        name: 'Pepperoni',
        description: 'Loaded with pepperoni slices.',
        productPic: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
        price_pk: 1500,
        price_uk: 13
      }
    ]
  },
  {
    id: 'starters',
    name: 'Starters',
    products: [
      {
        id: 'st-1',
        name: 'Flaming Wings',
        description: 'Spicy wings with dip.',
        productPic: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500',
        price_pk: 600,
        price_uk: 5
      },
      {
        id: 'st-2',
        name: 'Garlic Bread',
        description: 'Buttery garlic bread sticks.',
        productPic: 'https://images.unsplash.com/photo-1573140247632-f84660f67627?w=500',
        price_pk: 400,
        price_uk: 3
      }
    ]
  },
  {
    id: 'somewhat-local',
    name: 'Somewhat Local',
    products: [
      {
        id: 'sl-1',
        name: 'Chicken Tikka',
        description: 'Traditional tikka flavor.',
        productPic: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
        price_pk: 1550,
        price_uk: 14
      }
    ]
  },
  {
    id: 'cheezy-treats',
    name: 'Cheezy Treats',
    products: [
      {
        id: 'ct-1',
        name: 'Cheezy Sticks',
        description: 'Mozzarella filled sticks.',
        productPic: 'https://images.unsplash.com/photo-1548369937-47519962c11a?w=500',
        price_pk: 800,
        price_uk: 7
      }
    ]
  },
  {
    id: 'sandwiches',
    name: 'Sandwiches',
    products: [
      {
        id: 'sd-1',
        name: 'Club Sandwich',
        description: 'Triple layered sandwich with fries.',
        productPic: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500',
        price_pk: 900,
        price_uk: 8
      }
    ]
  }
]

export function getCategories() {
  return MOCK_CATEGORIES.map(c => ({ id: c.id, name: c.name, imageUrl: c.image }))
}

export function getAllProducts() {
  return CATALOG;
}

export function getCategoryById(id) {
  return CATALOG.find(c => c.id === id) || null
}

export function getSubcategories(categoryId) {
  // Return empty array as we moved to flat structure
  return []; 
}

export function getProducts(categoryId) {
  const cat = getCategoryById(categoryId);
  return cat ? cat.products : [];
}
