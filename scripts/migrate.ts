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
      price          NUMERIC(8,2) NOT NULL,
      price_choice   NUMERIC(8,2),
      price_per_week NUMERIC(8,2) NOT NULL DEFAULT 0,
      img            TEXT NOT NULL DEFAULT '',
      category       TEXT NOT NULL DEFAULT 'automatic'
                       CHECK (category IN ('automatic','special')),
      available      BOOLEAN DEFAULT TRUE,
      created_at     TIMESTAMPTZ DEFAULT NOW(),
      updated_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS weight TEXT NOT NULL DEFAULT ''`)
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS price_per_week NUMERIC(8,2) NOT NULL DEFAULT 0`)
  // USDA Choice price for automatic products (NULL for Local-only special cuts)
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS price_choice NUMERIC(8,2)`)
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'automatic'`)
  // Per-pound pricing needs decimals — widen the legacy INTEGER price columns (idempotent)
  await pool.query(`ALTER TABLE products ALTER COLUMN price TYPE NUMERIC(8,2)`)
  await pool.query(`ALTER TABLE products ALTER COLUMN price_per_week TYPE NUMERIC(8,2)`)
  // Move to the two-collection model: drop the old CHECK, map any legacy
  // categories to 'special', then assert the new CHECK. (Production refreshes the
  // catalog via scripts/update-products.sql, which wipes + reinserts.)
  await pool.query(`ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check`)
  await pool.query(`UPDATE products SET category = 'special' WHERE category NOT IN ('automatic','special')`)
  await pool.query(`ALTER TABLE products ADD CONSTRAINT products_category_check CHECK (category IN ('automatic','special'))`)
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
      price              NUMERIC(10,2) NOT NULL,
      kind               TEXT NOT NULL DEFAULT 'subscription'
                           CHECK (kind IN ('subscription','one_time')),
      status             TEXT NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('active','paused','cancelled','pending','completed')),
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
  // Per-pound totals are decimals — widen the legacy INTEGER price column (idempotent)
  await pool.query(`ALTER TABLE orders ALTER COLUMN price TYPE NUMERIC(10,2)`)
  // One-time purchases vs weekly subscriptions
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'subscription'`)
  await pool.query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'orders_kind_check'
      ) THEN
        ALTER TABLE orders ADD CONSTRAINT orders_kind_check
          CHECK (kind IN ('subscription','one_time'));
      END IF;
    END $$;
  `)
  // One-time orders finish as 'completed' after delivery — widen the status
  // CHECK on tables that predate it (drop + re-add is idempotent)
  await pool.query(`ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check`)
  await pool.query(`
    ALTER TABLE orders ADD CONSTRAINT orders_status_check
      CHECK (status IN ('active','paused','cancelled','pending','completed'))
  `)
  console.log('✓ orders table')

  // ── CUSTOMERS (self-service accounts) ──────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email         TEXT UNIQUE NOT NULL,
      username      TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name          TEXT NOT NULL DEFAULT '',
      phone         TEXT,
      building      TEXT NOT NULL DEFAULT '',
      unit          TEXT NOT NULL DEFAULT '',
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  // Link orders to accounts + structured, editable line items + the Stripe
  // subscription id (so the dashboard can manage/cancel it).
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID`)
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB NOT NULL DEFAULT '[]'`)
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT`)
  console.log('✓ customers table + order links')

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
  // Two collections: 'automatic' (Local + USDA Choice via price_choice) and
  // 'special' (Local only). Prices are market-competitive PLACEHOLDERS. Only
  // seeds a fresh products table; to refresh an existing DB run
  // scripts/update-products.ts (or scripts/update-products.sql).
  await pool.query(`
    INSERT INTO products (name, grade, detail, weight, price, price_choice, price_per_week, img, available, category)
    SELECT * FROM (VALUES
      ('Ground Beef 80/20',     'Local', 'Fresh-ground 80/20 · the everyday staple', '',  8.99, 10.99,  8.99, '/ground-beef-raw.jpg',                                                                            TRUE, 'automatic'),
      ('Ribeye',                'Local', 'Richly marbled · the weekend centerpiece', '', 18.99, 23.99, 18.99, '/ribeye-raw.jpg',                                                                                 TRUE, 'automatic'),
      ('New York Strip',        'Local', 'Firm, classic steakhouse cut',             '', 16.99, 20.99, 16.99, '/ny-strip-raw.jpg',                                                                               TRUE, 'automatic'),
      ('Sirloin',               'Local', 'Lean & beefy · quick weeknight sear',      '', 11.99, 14.99, 11.99, 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80&fit=crop&crop=center',       TRUE, 'automatic'),
      ('Round Steak / Cutlets', 'Local', 'Thin-sliced · cutlets & milanesa',         '',  9.99, 11.99,  9.99, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80&fit=crop&crop=center',    TRUE, 'automatic'),
      ('Filet',                 'Local', 'Center-cut tenderloin · butter-tender',    '', 26.99, NULL,  26.99, '/tenderloin-raw.jpg',                                                                             TRUE, 'special'),
      ('Roasts',                'Local', 'Sunday pot roast · low and slow',          '', 10.99, NULL,  10.99, '/roasts-raw.jpg',                                                                                 TRUE, 'special'),
      ('Burger Patties',        'Local', 'Hand-pressed · grill-ready',               '',  9.99, NULL,   9.99, '/placeholder-cut.svg', TRUE, 'special'),
      ('Stew Meat',             'Local', 'Cubed & trimmed · low-and-slow braises',   '',  8.99, NULL,   8.99, '/placeholder-cut.svg', TRUE, 'special'),
      ('Fajita Steak Meat',     'Local', 'Marinade-ready · sizzling fajitas',        '', 12.99, NULL,  12.99, '/placeholder-cut.svg', TRUE, 'special'),
      ('Beef Short Ribs',       'Local', 'Meaty & rich · braise or BBQ',             '', 11.99, NULL,  11.99, '/placeholder-cut.svg', TRUE, 'special'),
      ('Brisket',               'Local', 'The heart of Texas BBQ',                   '',  9.99, NULL,   9.99, '/brisket-raw.jpg',                                                                                TRUE, 'special'),
      ('Flank / Skirt',         'Local', 'Bold grain · fajitas & stir-fry',          '', 15.99, NULL,  15.99, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80&fit=crop&crop=center',       TRUE, 'special')
    ) AS v(name, grade, detail, weight, price, price_choice, price_per_week, img, available, category)
    WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1)
  `)
  console.log('✓ products seeded')

  console.log('\n✅ All migrations complete.')
  await pool.end()
}

run().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
