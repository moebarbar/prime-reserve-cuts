/**
 * One-shot seed update — run AFTER migrate.ts on databases that were seeded
 * with the original product lineup.
 *
 *   npx tsx scripts/update-seeds.ts
 *
 * What it does (non-destructively):
 *   1. Renames the old "Short Ribs"          → "Shank (Osso Buco)"
 *   2. Renames the old "Ground Chuck 80/20"  → "Ground Beef"
 *   3. Renames the old "Ground Sirloin 90/10"→ "Beef Tallow / Suet"
 *   4. Renames the old "Burger Patties"      → "Marrow Bones"
 *   5. Inserts "Sirloin" into Steak if missing
 *   6. Inserts the three Slow Cook + Daily items if any are still missing
 *
 * Safe to run more than once. Leaves Tenderloin, A5 Wagyu, Tomahawk and any
 * custom products you've added in admin completely untouched.
 */
import { Pool } from 'pg'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function run() {
  console.log('🐄 Automatic Cow — updating product seeds to new lineup...\n')

  // ── 1. SLOW COOK: Short Ribs → Shank (Osso Buco) ───────────────────────────
  const r1 = await pool.query(`
    UPDATE products
    SET name   = 'Shank (Osso Buco)',
        detail = 'Cross-cut shank · marrow + collagen for the longest braise',
        weight = '3-4 lb',
        updated_at = NOW()
    WHERE name = 'Short Ribs' AND category = 'slow_cook'
  `)
  console.log(`✓ slow cook · renamed Short Ribs → Shank (${r1.rowCount} row${r1.rowCount === 1 ? '' : 's'})`)

  // ── 2. DAILY: Ground Chuck 80/20 → Ground Beef ─────────────────────────────
  const r2 = await pool.query(`
    UPDATE products
    SET name   = 'Ground Beef',
        detail = 'Fresh-ground beef · the everyday staple',
        weight = '1 lb pack',
        updated_at = NOW()
    WHERE name = 'Ground Chuck 80/20' AND category = 'daily'
  `)
  console.log(`✓ daily · renamed Ground Chuck 80/20 → Ground Beef (${r2.rowCount} row${r2.rowCount === 1 ? '' : 's'})`)

  // ── 3. DAILY: Ground Sirloin 90/10 → Beef Tallow / Suet ────────────────────
  const r3 = await pool.query(`
    UPDATE products
    SET name   = 'Beef Tallow / Suet',
        detail = 'Pure rendered beef fat · for searing, frying, baking',
        weight = '16 oz jar',
        updated_at = NOW()
    WHERE name = 'Ground Sirloin 90/10' AND category = 'daily'
  `)
  console.log(`✓ daily · renamed Ground Sirloin 90/10 → Beef Tallow / Suet (${r3.rowCount} row${r3.rowCount === 1 ? '' : 's'})`)

  // ── 4. DAILY: Burger Patties → Marrow Bones ────────────────────────────────
  const r4 = await pool.query(`
    UPDATE products
    SET name   = 'Marrow Bones',
        detail = 'Cross-cut marrow & soup bones · stocks, broths, roasts',
        weight = '2-3 lb',
        updated_at = NOW()
    WHERE name = 'Burger Patties' AND category = 'daily'
  `)
  console.log(`✓ daily · renamed Burger Patties → Marrow Bones (${r4.rowCount} row${r4.rowCount === 1 ? '' : 's'})`)

  // ── 5. STEAK: ensure Sirloin exists ────────────────────────────────────────
  const r5 = await pool.query(`
    INSERT INTO products (name, grade, detail, weight, price, price_per_week, img, available, category)
    SELECT 'Sirloin', 'USDA Prime', 'Top sirloin · Lean, beefy, quick weeknight sear',
           '12 oz (340g)', 79, 39,
           'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80&fit=crop&crop=center',
           TRUE, 'steak'
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Sirloin' AND category = 'steak')
  `)
  console.log(`✓ steak · ensured Sirloin (${r5.rowCount} added)`)

  // ── 6. Backstop: insert any Slow Cook items still missing ──────────────────
  const slowCookSeeds = [
    { name: 'Brisket',           detail: 'Whole packer brisket · the heart of Texas BBQ',              weight: '12-14 lb', img: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80&fit=crop&crop=center' },
    { name: 'Chuck Roast',       detail: 'Boneless chuck · the perfect Sunday pot roast',              weight: '4-5 lb',   img: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80&fit=crop&crop=center' },
    { name: 'Shank (Osso Buco)', detail: 'Cross-cut shank · marrow + collagen for the longest braise', weight: '3-4 lb',   img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80&fit=crop&crop=center' },
  ]
  for (const s of slowCookSeeds) {
    const res = await pool.query(`
      INSERT INTO products (name, grade, detail, weight, price, price_per_week, img, available, category)
      SELECT $1, 'USDA Prime', $2, $3, 0, 0, $4, FALSE, 'slow_cook'
      WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = $1 AND category = 'slow_cook')
    `, [s.name, s.detail, s.weight, s.img])
    if (res.rowCount) console.log(`✓ slow cook · added ${s.name}`)
  }

  // ── 7. Backstop: insert any Daily items still missing ──────────────────────
  const dailySeeds = [
    { name: 'Ground Beef',        detail: 'Fresh-ground beef · the everyday staple',               weight: '1 lb pack', img: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&q=80&fit=crop&crop=center' },
    { name: 'Beef Tallow / Suet', detail: 'Pure rendered beef fat · for searing, frying, baking',  weight: '16 oz jar', img: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80&fit=crop&crop=center' },
    { name: 'Marrow Bones',       detail: 'Cross-cut marrow & soup bones · stocks, broths, roasts', weight: '2-3 lb',    img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&q=80&fit=crop&crop=center' },
  ]
  for (const d of dailySeeds) {
    const res = await pool.query(`
      INSERT INTO products (name, grade, detail, weight, price, price_per_week, img, available, category)
      SELECT $1, 'USDA Prime', $2, $3, 0, 0, $4, FALSE, 'daily'
      WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = $1 AND category = 'daily')
    `, [d.name, d.detail, d.weight, d.img])
    if (res.rowCount) console.log(`✓ daily · added ${d.name}`)
  }

  console.log('\n✅ Seed update complete. Untouched: Tenderloin, A5 Wagyu, Tomahawk, and any custom products.')
  console.log('   Manage them in /admin/products if you want to hide or remove them.')
  await pool.end()
}

run().catch(err => {
  console.error('Seed update failed:', err)
  process.exit(1)
})
