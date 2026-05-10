/**
 * Run with:  npx tsx scripts/migrate.ts
 *
 * Creates all tables and seeds initial data.
 * Safe to re-run — uses CREATE TABLE IF NOT EXISTS.
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
  console.log('🐄 Automatic Cow — running migrations...\n')

  // ── BUILDINGS ──────────────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS buildings (
      key        TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      name_html  TEXT NOT NULL,
      nbhd       TEXT NOT NULL,
      img        TEXT NOT NULL DEFAULT '',
      hero_img   TEXT NOT NULL DEFAULT '',
      active     BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  await pool.query(`ALTER TABLE buildings ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE`)
  console.log('✓ buildings table')

  // ── PRODUCTS ───────────────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name           TEXT NOT NULL,
      grade          TEXT NOT NULL,
      detail         TEXT NOT NULL,
      weight         TEXT NOT NULL DEFAULT '',
      price          INTEGER NOT NULL,
      price_per_week INTEGER NOT NULL DEFAULT 0,
      img            TEXT NOT NULL DEFAULT '',
      category       TEXT NOT NULL DEFAULT 'steak'
                       CHECK (category IN ('steak','slow_cook','daily')),
      available      BOOLEAN DEFAULT TRUE,
      created_at     TIMESTAMPTZ DEFAULT NOW(),
      updated_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS weight TEXT NOT NULL DEFAULT ''`)
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS price_per_week INTEGER NOT NULL DEFAULT 0`)
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'steak'`)
  // Add the CHECK constraint only if it doesn't already exist (idempotent)
  await pool.query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'products_category_check'
      ) THEN
        ALTER TABLE products ADD CONSTRAINT products_category_check
          CHECK (category IN ('steak','slow_cook','daily'));
      END IF;
    END $$;
  `)
  console.log('✓ products table')

  // ── LEADS ──────────────────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        TEXT NOT NULL,
      email       TEXT NOT NULL,
      phone       TEXT,
      building    TEXT NOT NULL,
      unit        TEXT NOT NULL,
      cut         TEXT,
      status      TEXT NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new','contacted','converted','lost')),
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  console.log('✓ leads table')

  // ── PARTNER INQUIRIES (property managers) ──────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS partner_inquiries (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      property_name TEXT NOT NULL,
      manager_name  TEXT NOT NULL,
      email         TEXT NOT NULL,
      phone         TEXT,
      units         TEXT,
      message       TEXT,
      status        TEXT NOT NULL DEFAULT 'new'
                      CHECK (status IN ('new','contacted','partnered','declined')),
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  console.log('✓ partner_inquiries table')

  // ── RANCHER INQUIRIES ──────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rancher_inquiries (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ranch_name      TEXT NOT NULL,
      owner_name      TEXT NOT NULL,
      email           TEXT NOT NULL,
      phone           TEXT,
      location        TEXT,
      herd_size       TEXT,
      grade           TEXT,
      breeds          TEXT,
      weekly_capacity TEXT,
      story           TEXT,
      status          TEXT NOT NULL DEFAULT 'new'
                        CHECK (status IN ('new','contacted','partnered','declined')),
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  console.log('✓ rancher_inquiries table')

  // ── ORDERS ─────────────────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer           TEXT NOT NULL,
      email              TEXT NOT NULL,
      building           TEXT NOT NULL,
      unit               TEXT NOT NULL,
      cut                TEXT NOT NULL,
      price              INTEGER NOT NULL,
      status             TEXT NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('active','paused','cancelled','pending')),
      start_date         DATE,
      next_delivery      DATE,
      stripe_session_id  TEXT UNIQUE,
      created_at         TIMESTAMPTZ DEFAULT NOW(),
      updated_at         TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  // Add stripe_session_id to existing tables that predate this migration
  await pool.query(`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT UNIQUE
  `)
  console.log('✓ orders table')

  // ── SEED BUILDINGS ─────────────────────────────────────────────────────────
  await pool.query(`
    INSERT INTO buildings (key, name, name_html, nbhd, img, hero_img) VALUES
      ('aspire',    'Aspire Post Oak',              'Aspire<br /><em>Post Oak</em>',         'Uptown · The Galleria',          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=700&q=80&fit=crop&crop=center', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1400&q=80&fit=crop&crop=center'),
      ('driscoll',  'The Driscoll',                 'The<br /><em>Driscoll</em>',             'River Oaks · 30 Stories',        'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=700&q=80&fit=crop&crop=center', 'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=1400&q=80&fit=crop&crop=center'),
      ('marketsq',  'Market Square Tower',          'Market Square<br /><em>Tower</em>',     'Downtown Houston',               'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=700&q=80&fit=crop&crop=center', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1400&q=80&fit=crop&crop=center'),
      ('parkside',  'Parkside at Discovery Green',  'Parkside<br /><em>Discovery Green</em>','Downtown · Discovery Green',     'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=700&q=80&fit=crop&crop=center', 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1400&q=80&fit=crop&crop=center'),
      ('elev8',     'Elev8 Downtown',               'Elev8<br /><em>Downtown</em>',          'Downtown Houston',               'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=700&q=80&fit=crop&crop=center', 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1400&q=80&fit=crop&crop=center'),
      ('autrypark', 'Hanover Autry Park',           'Hanover<br /><em>Autry Park</em>',      'Montrose · Autry Park',          'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=700&q=80&fit=crop&crop=center', 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=1400&q=80&fit=crop&crop=center')
    ON CONFLICT (key) DO NOTHING
  `)
  console.log('✓ buildings seeded')

  // ── SEED PRODUCTS ──────────────────────────────────────────────────────────
  await pool.query(`
    INSERT INTO products (name, grade, detail, weight, price, price_per_week, img, available, category)
    SELECT * FROM (VALUES
      ('NY Strip',     'USDA Prime', 'Center-cut New York Strip · Bold, beefy, perfect sear',              '14 oz (397g)',  99,  49, 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&q=80&fit=crop&crop=center', TRUE, 'steak'),
      ('Tenderloin',   'USDA Prime', 'Center-cut Filet Mignon · The most tender cut, silky clean',         '8 oz (227g)',   119, 59, 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&q=80&fit=crop&crop=center', TRUE, 'steak'),
      ('Ribeye',       'USDA Prime', 'Bone-in Ribeye · Rich marbling, buttery char',                       '16 oz (454g)',  89,  55, 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&q=80&fit=crop&crop=center', TRUE, 'steak'),
      ('A5 Wagyu',     'A5 Wagyu',   '12oz Japanese Miyazaki striploin · extraordinary marbling',          '12 oz (340g)',  189, 95, 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80&fit=crop&crop=center', TRUE, 'steak'),
      ('Tomahawk',     'Heritage',   '40oz long-bone cowboy cut · dry-aged Heritage breed',                '40 oz (1134g)', 229, 115,'https://images.pexels.com/photos/12261087/pexels-photo-12261087.jpeg?auto=compress&cs=tinysrgb&w=400', TRUE, 'steak')
    ) AS v(name, grade, detail, weight, price, price_per_week, img, available, category)
    WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1)
  `)
  console.log('✓ steak products seeded')

  // Backfill: any pre-existing rows from before category column existed
  await pool.query(`UPDATE products SET category = 'steak' WHERE category IS NULL OR category = ''`)

  // Slow-cook products — placeholder pricing, hidden until prices are set in admin
  await pool.query(`
    INSERT INTO products (name, grade, detail, weight, price, price_per_week, img, available, category)
    SELECT * FROM (VALUES
      ('Brisket',     'USDA Prime', 'Whole packer brisket · the heart of Texas BBQ',          '12-14 lb',  0, 0, 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80&fit=crop&crop=center', FALSE, 'slow_cook'),
      ('Chuck Roast', 'USDA Prime', 'Boneless chuck · the perfect Sunday pot roast',          '4-5 lb',    0, 0, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80&fit=crop&crop=center', FALSE, 'slow_cook'),
      ('Short Ribs',  'USDA Prime', 'Bone-in beef short ribs · braising heaven',              '3-4 lb',    0, 0, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80&fit=crop&crop=center', FALSE, 'slow_cook')
    ) AS v(name, grade, detail, weight, price, price_per_week, img, available, category)
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE category = 'slow_cook')
  `)
  console.log('✓ slow-cook products seeded')

  // Daily products — placeholder pricing, hidden
  await pool.query(`
    INSERT INTO products (name, grade, detail, weight, price, price_per_week, img, available, category)
    SELECT * FROM (VALUES
      ('Ground Chuck 80/20',  'USDA Prime', 'Fresh-ground chuck · 80% lean · the burger gold standard',  '1 lb pack', 0, 0, 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&q=80&fit=crop&crop=center', FALSE, 'daily'),
      ('Ground Sirloin 90/10','USDA Prime', 'Lean-ground sirloin · 90% lean · clean, robust flavor',     '1 lb pack', 0, 0, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80&fit=crop&crop=center', FALSE, 'daily'),
      ('Burger Patties',      'USDA Prime', 'Hand-pressed 6oz patties · ready for the grill',            '4 × 6 oz',  0, 0, 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&q=80&fit=crop&crop=center', FALSE, 'daily')
    ) AS v(name, grade, detail, weight, price, price_per_week, img, available, category)
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE category = 'daily')
  `)
  console.log('✓ daily products seeded')

  console.log('\n✅ All migrations complete.')
  await pool.end()
}

run().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
