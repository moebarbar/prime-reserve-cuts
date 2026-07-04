// ─────────────────────────────────────────────────────────────────────────────
// CANONICAL PRODUCT CATALOG. Products are DB-driven at runtime (the funnel,
// checkout, and admin all read/write the `products` table). This file is the
// seed + SEO source + funnel fallback, kept in sync with the DB seed/sync script
// (scripts/migrate.ts seed + scripts/update-products.ts).
//
// Two collections:
//   • 'automatic' — the weekly staples. Two grade options (Local / USDA Choice),
//                    orderable on a subscription OR one-time.
//   • 'special'   — à-la-carte cuts. Local only, one-time only.
//
// Pricing is per-pound (the customer picks pounds and we multiply). Automatic
// products carry a second price (`priceChoice`) for the USDA Choice grade.
//
// NOTE: prices below are market-competitive PLACEHOLDERS — confirm/adjust in the
// admin before launch. Local beef · weekly delivery · cancel anytime.
// ─────────────────────────────────────────────────────────────────────────────

export type Category = 'automatic' | 'special'
export type Grade = 'Local' | 'USDA Choice'

export const GRADES: Grade[] = ['Local', 'USDA Choice']

export interface Product {
  id: string
  name: string
  category: Category
  pricePerLb: number        // Local price (base)
  priceChoice?: number      // USDA Choice price — automatic products only
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
  /** automatic = subscribe or one-time; special = one-time only */
  oneTimeOnly: boolean
}

export const CATEGORY_META: CategoryMeta[] = [
  {
    key: 'automatic',
    title: 'Automatic',
    tagline: 'Subscribe weekly or buy once · Local or USDA Choice',
    img: '/ribeye-raw.jpg',
    intro: 'Your weekly staples, on repeat. Set it and forget it.',
    oneTimeOnly: false,
  },
  {
    key: 'special',
    title: 'Special Cuts',
    tagline: 'One-time only · Local',
    img: '/brisket-raw.jpg',
    intro: 'The à-la-carte cuts — order them whenever the craving hits.',
    oneTimeOnly: true,
  },
]

const UNSPLASH_SIRLOIN = 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80&fit=crop&crop=center'
const UNSPLASH_ROUND   = 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80&fit=crop&crop=center'
const UNSPLASH_FLANK   = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80&fit=crop&crop=center'

export const PRODUCTS: Product[] = [
  // ── Automatic (Local + USDA Choice; subscription or one-time) ─────────────
  { id: 'ground',  name: 'Ground Beef 80/20',     category: 'automatic', pricePerLb: 8.99,  priceChoice: 10.99, detail: 'Fresh-ground 80/20 · the everyday staple', img: '/ground-beef-raw.jpg', available: true },
  { id: 'ribeye',  name: 'Ribeye',                category: 'automatic', pricePerLb: 18.99, priceChoice: 23.99, detail: 'Richly marbled · the weekend centerpiece',  img: '/ribeye-raw.jpg',      available: true },
  { id: 'nystrip', name: 'New York Strip',        category: 'automatic', pricePerLb: 16.99, priceChoice: 20.99, detail: 'Firm, classic steakhouse cut',              img: '/ny-strip-raw.jpg',    available: true },
  { id: 'sirloin', name: 'Sirloin',               category: 'automatic', pricePerLb: 11.99, priceChoice: 14.99, detail: 'Lean & beefy · quick weeknight sear',        img: UNSPLASH_SIRLOIN,       available: true },
  { id: 'round',   name: 'Round Steak / Cutlets', category: 'automatic', pricePerLb: 9.99,  priceChoice: 11.99, detail: 'Thin-sliced · cutlets & milanesa',           img: UNSPLASH_ROUND,         available: true },

  // ── Special Cuts (Local only, one-time only) ──────────────────────────────
  { id: 'filet',    name: 'Filet',              category: 'special', pricePerLb: 26.99, detail: 'Center-cut tenderloin · butter-tender', img: '/tenderloin-raw.jpg', available: true },
  { id: 'roasts',   name: 'Roasts',             category: 'special', pricePerLb: 10.99, detail: 'Sunday pot roast · low and slow',       img: '/roasts-raw.jpg',     available: true },
  { id: 'burger',   name: 'Burger Patties',     category: 'special', pricePerLb: 9.99,  detail: 'Hand-pressed · grill-ready',            img: '/ground-beef-raw.jpg', available: true },
  { id: 'stew',     name: 'Stew Meat',          category: 'special', pricePerLb: 8.99,  detail: 'Cubed & trimmed · low-and-slow braises', img: '/brisket-raw.jpg',   available: true },
  { id: 'fajita',   name: 'Fajita Steak Meat',  category: 'special', pricePerLb: 12.99, detail: 'Marinade-ready · sizzling fajitas',      img: UNSPLASH_FLANK,       available: true },
  { id: 'shortrib', name: 'Beef Short Ribs',    category: 'special', pricePerLb: 11.99, detail: 'Meaty & rich · braise or BBQ',           img: '/roasts-raw.jpg',    available: true },
  { id: 'brisket',  name: 'Brisket',            category: 'special', pricePerLb: 9.99,  detail: 'The heart of Texas BBQ',                 img: '/brisket-raw.jpg',   available: true },
  { id: 'flank',    name: 'Flank / Skirt',      category: 'special', pricePerLb: 15.99, detail: 'Bold grain · fajitas & stir-fry',        img: UNSPLASH_FLANK,       available: true },
]

export const productsByCategory = (cat: Category): Product[] =>
  PRODUCTS.filter(p => p.category === cat && p.available)

/** Grades a product can be ordered in (automatic → Local + USDA Choice). */
export const gradesFor = (p: Pick<Product, 'priceChoice'>): Grade[] =>
  p.priceChoice != null ? ['Local', 'USDA Choice'] : ['Local']

/** Per-pound price for a product at a given grade. */
export const priceFor = (p: Pick<Product, 'pricePerLb' | 'priceChoice'>, grade: Grade): number =>
  grade === 'USDA Choice' && p.priceChoice != null ? p.priceChoice : p.pricePerLb

/** Automatic products can go on a subscription; special cuts are one-time only. */
export const isSubscribable = (p: Pick<Product, 'category'>): boolean => p.category === 'automatic'
