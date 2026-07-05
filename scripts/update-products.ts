/**
 * One-shot product refresh — point an EXISTING database at the current
 * two-collection catalog.
 *
 *   npx tsx scripts/update-products.ts
 *
 * What it does:
 *   1. Ensures decimal price columns + the price_choice (USDA Choice) column
 *   2. Moves the category CHECK to ('automatic','special')
 *   3. Replaces every product row with the catalog below
 *
 * Prices are market-competitive PLACEHOLDERS — adjust in the admin before launch.
 * Safe to re-run; orders reference cuts by text (no FK), so replacing is safe.
 */
import { Pool } from 'pg'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// name, detail, priceLocal, priceChoice (null = Local-only), img, category
type Row = [string, string, number, number | null, string, 'automatic' | 'special']
const UNSPLASH_SIRLOIN = 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80&fit=crop&crop=center'
const UNSPLASH_ROUND   = 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80&fit=crop&crop=center'
const UNSPLASH_FLANK   = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80&fit=crop&crop=center'

const PRODUCTS: Row[] = [
  ['Ground Beef 80/20',     'Fresh-ground 80/20 · the everyday staple',  8.99, 10.99, '/ground-beef-raw.jpg', 'automatic'],
  ['Ribeye',                'Richly marbled · the weekend centerpiece', 18.99, 23.99, '/ribeye-raw.jpg',      'automatic'],
  ['New York Strip',        'Firm, classic steakhouse cut',             16.99, 20.99, '/ny-strip-raw.jpg',    'automatic'],
  ['Sirloin',               'Lean & beefy · quick weeknight sear',      11.99, 14.99, UNSPLASH_SIRLOIN,       'automatic'],
  ['Round Steak / Cutlets', 'Thin-sliced · cutlets & milanesa',          9.99, 11.99, UNSPLASH_ROUND,        'automatic'],
  ['Filet',                 'Center-cut tenderloin · butter-tender',    26.99, null,  '/tenderloin-raw.jpg',  'special'],
  ['Roasts',                'Sunday pot roast · low and slow',          10.99, null,  '/roasts-raw.jpg',      'special'],
  ['Burger Patties',        'Hand-pressed · grill-ready',                9.99, null,  '/placeholder-cut.svg', 'special'],
  ['Stew Meat',             'Cubed & trimmed · low-and-slow braises',    8.99, null,  '/placeholder-cut.svg', 'special'],
  ['Fajita Steak Meat',     'Marinade-ready · sizzling fajitas',        12.99, null,  '/placeholder-cut.svg', 'special'],
  ['Beef Short Ribs',       'Meaty & rich · braise or BBQ',             11.99, null,  '/placeholder-cut.svg', 'special'],
  ['Brisket',               'The heart of Texas BBQ',                    9.99, null,  '/brisket-raw.jpg',     'special'],
  ['Flank / Skirt',         'Bold grain · fajitas & stir-fry',          15.99, null,  UNSPLASH_FLANK,         'special'],
]

async function run() {
  console.log('🐄 Automatic Cow — refreshing products to the two-collection catalog...\n')

  await pool.query(`ALTER TABLE products ALTER COLUMN price TYPE NUMERIC(8,2)`)
  await pool.query(`ALTER TABLE products ALTER COLUMN price_per_week TYPE NUMERIC(8,2)`)
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS price_choice NUMERIC(8,2)`)
  console.log('✓ price columns ready (incl. price_choice)')

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(`ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check`)
    await client.query('DELETE FROM products')
    for (const [name, detail, price, priceChoice, img, category] of PRODUCTS) {
      await client.query(
        `INSERT INTO products (name, grade, detail, weight, price, price_choice, price_per_week, img, available, category)
         VALUES ($1, 'Local', $2, '', $3, $4, $3, $5, TRUE, $6)`,
        [name, detail, price, priceChoice, img, category],
      )
      const tag = priceChoice != null ? `$${price.toFixed(2)}/$${priceChoice.toFixed(2)}` : `$${price.toFixed(2)}`
      console.log(`  + ${name} — ${tag}/lb (${category})`)
    }
    await client.query(`ALTER TABLE products ADD CONSTRAINT products_category_check CHECK (category IN ('automatic','special'))`)
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }

  console.log(`\n✅ Done. ${PRODUCTS.length} products live (placeholder pricing).`)
  await pool.end()
}

run().catch(err => {
  console.error('Product refresh failed:', err)
  process.exit(1)
})
