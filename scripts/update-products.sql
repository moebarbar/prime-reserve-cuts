-- Refresh the products table to the per-pound catalog (the exact 9-item lineup).
-- Paste this into Railway → your Postgres service → the "Query" / "Data" tab,
-- or run with:  psql "$DATABASE_PUBLIC_URL" -f scripts/update-products.sql
-- Idempotent: always converges to exactly these 9 products.

-- 1) Decimal-safe price columns ($/lb needs decimals)
ALTER TABLE products ALTER COLUMN price TYPE NUMERIC(8,2);
ALTER TABLE products ALTER COLUMN price_per_week TYPE NUMERIC(8,2);

-- 2) Replace the catalog with the per-pound lineup
BEGIN;
DELETE FROM products;
INSERT INTO products (name, grade, detail, weight, price, price_per_week, img, available, category) VALUES
  ('Bone-in Ribeye',        'Local Beef', 'Bone-in · richly marbled',              '', 31.99, 31.99, '/ribeye-raw.jpg',                                                                              TRUE, 'steak'),
  ('New York Strip',        'Local Beef', 'Firm, classic steakhouse cut',          '', 27.99, 27.99, '/ny-strip-raw.jpg',                                                                            TRUE, 'steak'),
  ('Filet',                 'Local Beef', 'Center-cut tenderloin · butter-tender', '', 39.99, 39.99, '/tenderloin-raw.jpg',                                                                          TRUE, 'steak'),
  ('Sirloin',               'Local Beef', 'Lean & beefy · quick weeknight sear',   '', 19.99, 19.99, 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80&fit=crop&crop=center',    TRUE, 'steak'),
  ('Round Steak / Cutlets', 'Local Beef', 'Thin-sliced · cutlets & milanesa',      '', 14.99, 14.99, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80&fit=crop&crop=center', TRUE, 'steak'),
  ('Flank / Skirt',         'Local Beef', 'Bold grain · fajitas & stir-fry',       '', 24.99, 24.99, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80&fit=crop&crop=center',    TRUE, 'steak'),
  ('Roasts',                'Local Beef', 'Sunday pot roast · low and slow',       '', 14.99, 14.99, '/roasts-raw.jpg',                                                              TRUE, 'slow_cook'),
  ('Brisket',               'Local Beef', 'The heart of Texas BBQ',                '', 14.99, 14.99, '/brisket-raw.jpg',                                                              TRUE, 'slow_cook'),
  ('Ground Beef',           'Local Beef', 'Fresh-ground · the everyday staple',    '', 12.99, 12.99, '/ground-beef-raw.jpg',                                                              TRUE, 'daily');
COMMIT;

-- Verify
SELECT name, price AS price_per_lb, category, available FROM products ORDER BY category, price DESC;
