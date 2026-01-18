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
    image: 'https://cheezious.com/wp-content/uploads/2021/01/Malai-Tikka-Pizza.jpg',
    description: 'Creamy and savory delight'
  },
  { 
    id: 'thin-crust', 
    name: 'Thin Crust Pizza', 
    image: 'https://cheezious.com/wp-content/uploads/2021/01/Chicken-Fajita-Pizza.jpg',
    description: 'Crispy and delicious'
  },
  { 
    id: 'starters', 
    name: 'Starters', 
    image: 'https://cheezious.com/wp-content/uploads/2021/01/Flaming-Wings.jpg',
    description: 'Perfect way to start'
  },
  { 
    id: 'somewhat-local', 
    name: 'Somewhat Local', 
    image: 'https://cheezious.com/wp-content/uploads/2021/01/Chicken-Tikka-Pizza.jpg',
    description: 'Local flavors you love'
  },
  { 
    id: 'cheezy-treats', 
    name: 'Cheezy Treats', 
    image: 'https://cheezious.com/wp-content/uploads/2021/01/Cheezy-Sticks.jpg',
    description: 'For the cheese lovers'
  },
  { 
    id: 'sandwiches', 
    name: 'Sandwiches', 
    image: 'https://cheezious.com/wp-content/uploads/2021/01/Club-Sandwich.jpg',
    description: 'Fresh and filling'
  }
]

export const BRANCHES = [
  {
    id: 1,
    name: "Al-Riaz Bakers, Fast Food, Restaurant & General Store",
    timing: "6 AM - 11 PM",
    phone: "03445556665",
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500',
    mapsUrl: "https://maps.app.goo.gl/u2vxz2gsrenRcVi29",
    address: "Main Bazaar Charhoi, Gornal, District Kotli, Azad Kashmir, Pakistan"
  },
  {
    id: 2,
    name: "Riaz Bakers & Restaurant Branch-2",
    timing: "6 AM - 11 PM",
    phone: "03445556665",
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500',
    mapsUrl: "https://maps.app.goo.gl/cxESpHMGZ5hLiJLK7",
    address: "Branch 2 Location, Pakistan"
  },
  {
    id: 3,
    name: "Riaz Bakery UK Branch",
    timing: "8 AM - 10 PM",
    phone: "92-3445556665",
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500',
    mapsUrl: "https://maps.app.goo.gl/JxCEYg7v6v1DuDB39",
    address: "Working, UK"
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
        productPic: 'https://cheezious.com/wp-content/uploads/2021/01/Malai-Tikka-Pizza.jpg',
        price_pk: 1600,
        price_uk: 15
      },
      {
        id: 'mt-2',
        name: 'Special Malai Tikka',
        description: 'Extra cheese and double meat topping.',
        productPic: 'https://cheezious.com/wp-content/uploads/2021/01/Malai-Tikka-Pizza.jpg',
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
        productPic: 'https://cheezious.com/wp-content/uploads/2021/01/Chicken-Fajita-Pizza.jpg',
        price_pk: 1400,
        price_uk: 12
      },
      {
        id: 'tc-2',
        name: 'Pepperoni',
        description: 'Loaded with pepperoni slices.',
        productPic: 'https://cheezious.com/wp-content/uploads/2021/01/Chicken-Fajita-Pizza.jpg',
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
        productPic: 'https://cheezious.com/wp-content/uploads/2021/01/Flaming-Wings.jpg',
        price_pk: 600,
        price_uk: 5
      },
      {
        id: 'st-2',
        name: 'Garlic Bread',
        description: 'Buttery garlic bread sticks.',
        productPic: 'https://cheezious.com/wp-content/uploads/2021/01/Cheezy-Sticks.jpg',
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
        productPic: 'https://cheezious.com/wp-content/uploads/2021/01/Chicken-Tikka-Pizza.jpg',
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
        productPic: 'https://cheezious.com/wp-content/uploads/2021/01/Cheezy-Sticks.jpg',
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
        productPic: 'https://cheezious.com/wp-content/uploads/2021/01/Club-Sandwich.jpg',
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
