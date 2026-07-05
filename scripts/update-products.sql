-- Refresh the products table to the two-collection catalog:
--   • automatic  — Local + USDA Choice (price_choice), subscription or one-time
--   • special    — Local only, one-time only
-- Prices are market-competitive PLACEHOLDERS — adjust in the admin before launch.
--
-- Paste into Railway → your Postgres service → the "Query" tab, or run with:
--   psql "$DATABASE_PUBLIC_URL" -f scripts/update-products.sql
-- Idempotent: always converges to exactly these products.

-- 1) Columns: decimal prices + the USDA Choice price
ALTER TABLE products ALTER COLUMN price TYPE NUMERIC(8,2);
ALTER TABLE products ALTER COLUMN price_per_week TYPE NUMERIC(8,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_choice NUMERIC(8,2);

-- 2) Move to the two-collection model. Drop the old CHECK, wipe, reinsert,
--    then re-assert the CHECK (run these as separate statements in Railway).
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;

DELETE FROM products;
INSERT INTO products (name, grade, detail, weight, price, price_choice, price_per_week, img, available, category) VALUES
  ('Ground Beef 80/20',     'Local', 'Fresh-ground 80/20 · the everyday staple',  '',  8.99, 10.99,  8.99, '/ground-beef-raw.jpg',                                                                            TRUE, 'automatic'),
  ('Ribeye',                'Local', 'Richly marbled · the weekend centerpiece',  '', 18.99, 23.99, 18.99, '/ribeye-raw.jpg',                                                                                 TRUE, 'automatic'),
  ('New York Strip',        'Local', 'Firm, classic steakhouse cut',              '', 16.99, 20.99, 16.99, '/ny-strip-raw.jpg',                                                                               TRUE, 'automatic'),
  ('Sirloin',               'Local', 'Lean & beefy · quick weeknight sear',       '', 11.99, 14.99, 11.99, 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80&fit=crop&crop=center',       TRUE, 'automatic'),
  ('Round Steak / Cutlets', 'Local', 'Thin-sliced · cutlets & milanesa',          '',  9.99, 11.99,  9.99, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80&fit=crop&crop=center',    TRUE, 'automatic'),
  ('Filet',                 'Local', 'Center-cut tenderloin · butter-tender',     '', 26.99, NULL,  26.99, '/tenderloin-raw.jpg',                                                                             TRUE, 'special'),
  ('Roasts',                'Local', 'Sunday pot roast · low and slow',           '', 10.99, NULL,  10.99, '/roasts-raw.jpg',                                                                                 TRUE, 'special'),
  ('Burger Patties',        'Local', 'Hand-pressed · grill-ready',                '',  9.99, NULL,   9.99, '/placeholder-cut.svg', TRUE, 'special'),
  ('Stew Meat',             'Local', 'Cubed & trimmed · low-and-slow braises',    '',  8.99, NULL,   8.99, '/placeholder-cut.svg', TRUE, 'special'),
  ('Fajita Steak Meat',     'Local', 'Marinade-ready · sizzling fajitas',         '', 12.99, NULL,  12.99, '/placeholder-cut.svg', TRUE, 'special'),
  ('Beef Short Ribs',       'Local', 'Meaty & rich · braise or BBQ',              '', 11.99, NULL,  11.99, '/placeholder-cut.svg', TRUE, 'special'),
  ('Brisket',               'Local', 'The heart of Texas BBQ',                    '',  9.99, NULL,   9.99, '/brisket-raw.jpg',                                                                                TRUE, 'special'),
  ('Flank / Skirt',         'Local', 'Bold grain · fajitas & stir-fry',           '', 15.99, NULL,  15.99, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80&fit=crop&crop=center',       TRUE, 'special');

ALTER TABLE products ADD CONSTRAINT products_category_check CHECK (category IN ('automatic','special'));

-- Verify
SELECT name, category, price AS local_lb, price_choice AS choice_lb, available
FROM products ORDER BY category DESC, price DESC;
