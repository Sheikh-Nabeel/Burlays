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
    id: '1', 
    name: 'Cakes', 
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    description: 'Delicious cakes for every occasion'
  },
  { 
    id: '2', 
    name: 'Breads', 
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    description: 'Fresh baked breads daily'
  },
  { 
    id: '3', 
    name: 'Pastries', 
    image: 'https://images.unsplash.com/photo-1555507036-ab794f575995?w=400',
    description: 'Flaky and buttery pastries'
  },
  { 
    id: '4', 
    name: 'Cookies', 
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400',
    description: 'Crispy and soft cookies'
  },
  { 
    id: '5', 
    name: 'Pizza', 
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    description: 'Wood-fired gourmet pizzas'
  },
  { 
    id: '6', 
    name: 'Fast Food', 
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
    description: 'Quick and tasty meals'
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
    id: 'cakes',
    name: 'Cakes',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
    subcategories: [
      {
        id: 'birthday',
        name: 'Birthday',
        products: [
          {
            id: 'cake1',
            name: 'Chocolate Fudge Cake',
            description: 'Rich chocolate fudge layered cake',
            productPic: 'https://images.unsplash.com/photo-1606313564200-c1b3570a0f1e?w=800',
            inStock: true,
            price_pk: 2500,
            price_uk: 22,
            colors: ['#6b4423', '#3d2b1f']
          },
          {
            id: 'cake2',
            name: 'Vanilla Cream Cake',
            description: 'Classic vanilla sponge with cream',
            productPic: 'https://images.unsplash.com/photo-1542826438-8c78b3f1e84a?w=800',
            inStock: true,
            price_pk: 2200,
            price_uk: 18,
            colors: ['#faf3e0', '#fff']
          }
        ]
      },
      {
        id: 'wedding',
        name: 'Wedding',
        products: [
          {
            id: 'cake3',
            name: 'Red Velvet',
            description: 'Velvety red cake with cream cheese frosting',
            productPic: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=800',
            inStock: false,
            price_pk: 4500,
            price_uk: 40,
            colors: ['#9d2c3f', '#fff']
          }
        ]
      }
    ]
  },
  {
    id: 'breads',
    name: 'Breads',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    subcategories: [
      {
        id: 'artisan',
        name: 'Artisan',
        products: [
          {
            id: 'bread1',
            name: 'Sourdough Loaf',
            description: 'Crusty sourdough loaf',
            productPic: 'https://images.unsplash.com/photo-1549931263-5a6b00bd8c87?w=800',
            inStock: true,
            price_pk: 450,
            price_uk: 4,
            colors: ['#c69c6d']
          }
        ]
      }
    ]
  }
]

export function getCategories() {
  return CATALOG.map(c => ({ id: c.id, name: c.name, imageUrl: c.imageUrl }))
}

export function getCategoryById(id) {
  return CATALOG.find(c => c.id === id) || null
}

export function getSubcategories(categoryId) {
  const cat = getCategoryById(categoryId)
  return cat ? cat.subcategories.map(s => ({ id: s.id, name: s.name })) : []
}

export function getProducts(categoryId, subId) {
  const cat = getCategoryById(categoryId)
  if (!cat) return []
  const sub = cat.subcategories.find(s => s.id === subId)
  return sub ? sub.products : []
}
