/**
 * One-shot product refresh — point an EXISTING database at the current
 * per-pound catalog (the exact lineup the client signed off on).
 *
 *   npx tsx scripts/update-products.ts
 *
 * What it does:
 *   1. Widens the price / price_per_week columns to NUMERIC (decimals for $/lb)
 *   2. Replaces every product row with the 9-item per-pound catalog below
 *
 * Safe to run more than once — it always converges to exactly these 9 products.
 * Orders reference cuts by text (no foreign key), so replacing products is safe.
 */
import { Pool } from 'pg'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// name, grade, detail, price/lb, img, category
const PRODUCTS: [string, string, string, number, string, string][] = [
  ['Bone-in Ribeye',        'Local Beef', 'Bone-in · richly marbled',              31.99, '/ribeye-raw.jpg',                                                                              'steak'],
  ['New York Strip',        'Local Beef', 'Firm, classic steakhouse cut',          27.99, '/ny-strip-raw.jpg',                                                                            'steak'],
  ['Filet',                 'Local Beef', 'Center-cut tenderloin · butter-tender', 39.99, '/tenderloin-raw.jpg',                                                                          'steak'],
  ['Sirloin',               'Local Beef', 'Lean & beefy · quick weeknight sear',   19.99, 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80&fit=crop&crop=center',    'steak'],
  ['Round Steak / Cutlets', 'Local Beef', 'Thin-sliced · cutlets & milanesa',      14.99, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80&fit=crop&crop=center', 'steak'],
  ['Flank / Skirt',         'Local Beef', 'Bold grain · fajitas & stir-fry',       24.99, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80&fit=crop&crop=center',    'steak'],
  ['Roasts',                'Local Beef', 'Sunday pot roast · low and slow',       14.99, 'https://i.imgur.com/16gBTVR.jpg',                                                              'slow_cook'],
  ['Brisket',               'Local Beef', 'The heart of Texas BBQ',                14.99, 'https://i.imgur.com/2SI0S49.jpg',                                                              'slow_cook'],
  ['Ground Beef',           'Local Beef', 'Fresh-ground · the everyday staple',    12.99, 'https://i.imgur.com/n2wjXBV.jpg',                                                              'daily'],
]

async function run() {
  console.log('🐄 Automatic Cow — refreshing products to the per-pound catalog...\n')

  // 1. Decimal-safe price columns
  await pool.query(`ALTER TABLE products ALTER COLUMN price TYPE NUMERIC(8,2)`)
  await pool.query(`ALTER TABLE products ALTER COLUMN price_per_week TYPE NUMERIC(8,2)`)
  console.log('✓ price columns are NUMERIC')

  // 2. Replace all products with the canonical lineup (transactional)
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM products')
    for (const [name, grade, detail, price, img, category] of PRODUCTS) {
      await client.query(
        `INSERT INTO products (name, grade, detail, weight, price, price_per_week, img, available, category)
         VALUES ($1, $2, $3, '', $4, $4, $5, TRUE, $6)`,
        [name, grade, detail, price, img, category],
      )
      console.log(`  + ${name} — $${price.toFixed(2)}/lb (${category})`)
    }
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }

  console.log(`\n✅ Done. ${PRODUCTS.length} products live, priced per pound.`)
  await pool.end()
}

run().catch(err => {
  console.error('Product refresh failed:', err)
  process.exit(1)
})
