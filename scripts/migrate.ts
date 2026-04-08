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
      img        TEXT NOT NULL,
      hero_img   TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  console.log('✓ buildings table')

  // ── PRODUCTS ───────────────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name       TEXT NOT NULL,
      grade      TEXT NOT NULL,
      detail     TEXT NOT NULL,
      price      INTEGER NOT NULL,
      img        TEXT NOT NULL,
      available  BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
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

  // ── ORDERS ─────────────────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer       TEXT NOT NULL,
      email          TEXT NOT NULL,
      building       TEXT NOT NULL,
      unit           TEXT NOT NULL,
      cut            TEXT NOT NULL,
      price          INTEGER NOT NULL,
      status         TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('active','paused','cancelled','pending')),
      start_date     DATE,
      next_delivery  DATE,
      created_at     TIMESTAMPTZ DEFAULT NOW(),
      updated_at     TIMESTAMPTZ DEFAULT NOW()
    )
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
    INSERT INTO products (name, grade, detail, price, img, available)
    SELECT * FROM (VALUES
      ('Ribeye',       'USDA Prime', '16oz bone-in · 21-day dry-aged',        89,  'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&q=80&fit=crop&crop=center', TRUE),
      ('Filet Mignon', 'USDA Prime', '8oz center-cut tenderloin',              119, 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&q=80&fit=crop&crop=center', TRUE),
      ('NY Strip',     'USDA Prime', '14oz dry-aged New York strip',           99,  'https://images.pexels.com/photos/3535383/pexels-photo-3535383.jpeg?auto=compress&cs=tinysrgb&w=400', TRUE),
      ('A5 Wagyu',     'A5 Wagyu',   '12oz Japanese Miyazaki striploin',      189, 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80&fit=crop&crop=center', TRUE),
      ('Tomahawk',     'Heritage',   '40oz long-bone cowboy cut',              229, 'https://images.pexels.com/photos/12261087/pexels-photo-12261087.jpeg?auto=compress&cs=tinysrgb&w=400', TRUE)
    ) AS v(name, grade, detail, price, img, available)
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
