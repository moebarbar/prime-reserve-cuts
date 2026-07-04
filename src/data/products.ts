// ─────────────────────────────────────────────────────────────────────────────
// CANONICAL PRODUCT CATALOG. Products are DB-driven at runtime (the funnel,
// checkout, and admin all read/write the `products` table). This file is the
// seed + SEO source + funnel fallback, kept in sync with the DB seed/sync script
// (scripts/migrate.ts seed + scripts/update-products.ts).
//
// Pricing is per-pound; the customer picks pounds-per-week and the site
// multiplies. Local beef · weekly delivery · cancel anytime.
//
// Category note: the DB uses three category keys — 'steak', 'slow_cook' and
// 'daily'. We surface 'daily' as the "Ground Beef" section in the UI.
// ─────────────────────────────────────────────────────────────────────────────

export type Category = 'steak' | 'slow_cook' | 'daily'

export interface Product {
  id: string
  name: string
  category: Category
  pricePerLb: number
  detail: string
  img: string
  available: boolean
}

export interface CategoryMeta {
  key: Category
  title: string
  tagline: string
  img: string
  intro: string
}

export const CATEGORY_META: CategoryMeta[] = [
  {
    key: 'steak',
    title: 'Steaks',
    tagline: 'Ribeye · NY Strip · Filet · Sirloin · more',
    img: '/ribeye-raw.jpg',
    intro: 'Sear hot. Rest patient. Serve proud.',
  },
  {
    key: 'slow_cook',
    title: 'Roasts / Slow Cuts',
    tagline: 'Roasts · Brisket',
    img: '/source-ranch.jpg',
    intro: 'Low. Slow. Worth the wait.',
  },
  {
    key: 'daily',
    title: 'Ground Beef',
    tagline: 'Fresh-ground, by the pound',
    img: '/ground-beef-raw.jpg',
    intro: 'Always in the fridge. Always reaching for it.',
  },
]

export const PRODUCTS: Product[] = [
  // ── Steaks ──────────────────────────────────────────────────────────────
  { id: 'ribeye',  name: 'Bone-in Ribeye',        category: 'steak', pricePerLb: 31.99, detail: 'Bone-in · richly marbled',             img: '/ribeye-raw.jpg',    available: true },
  { id: 'nystrip', name: 'New York Strip',        category: 'steak', pricePerLb: 27.99, detail: 'Firm, classic steakhouse cut',          img: '/ny-strip-raw.jpg',  available: true },
  { id: 'filet',   name: 'Filet',                 category: 'steak', pricePerLb: 39.99, detail: 'Center-cut tenderloin · butter-tender', img: '/tenderloin-raw.jpg', available: true },
  { id: 'sirloin', name: 'Sirloin',               category: 'steak', pricePerLb: 19.99, detail: 'Lean & beefy · quick weeknight sear',   img: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80&fit=crop&crop=center', available: true },
  { id: 'round',   name: 'Round Steak / Cutlets', category: 'steak', pricePerLb: 14.99, detail: 'Thin-sliced · cutlets & milanesa',      img: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80&fit=crop&crop=center', available: true },
  { id: 'flank',   name: 'Flank / Skirt',         category: 'steak', pricePerLb: 24.99, detail: 'Bold grain · fajitas & stir-fry',       img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80&fit=crop&crop=center', available: true },

  // ── Roasts / Slow Cuts ──────────────────────────────────────────────────
  { id: 'roasts',  name: 'Roasts',                category: 'slow_cook', pricePerLb: 14.99, detail: 'Sunday pot roast · low and slow', img: '/roasts-raw.jpg', available: true },
  { id: 'brisket', name: 'Brisket',               category: 'slow_cook', pricePerLb: 14.99, detail: 'The heart of Texas BBQ',           img: '/brisket-raw.jpg', available: true },

  // ── Ground Beef (DB category 'daily') ───────────────────────────────────
  { id: 'ground',  name: 'Ground Beef',           category: 'daily', pricePerLb: 12.99, detail: 'Fresh-ground · the everyday staple', img: '/ground-beef-raw.jpg', available: true },
]

export const productsByCategory = (cat: Category): Product[] =>
  PRODUCTS.filter(p => p.category === cat && p.available)
