-- Adds one-time-purchase support to the orders table.
-- Run once against the production database (Railway → Postgres → Query tab,
-- or psql with the public URL). Idempotent — safe to re-run.

-- 1) Per-pound order totals are decimals, not whole dollars.
ALTER TABLE orders ALTER COLUMN price TYPE NUMERIC(10,2);

-- 2) Distinguish weekly subscriptions from one-time orders.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'subscription';

-- Idempotent without a DO/PL-pgSQL block (Railway's query bar can't parse those):
-- drop-if-exists then add. Run these two as separate statements in Railway.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_kind_check;
ALTER TABLE orders ADD CONSTRAINT orders_kind_check CHECK (kind IN ('subscription','one_time'));

-- 3) One-time orders finish as 'completed' once their delivery date passes.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('active','paused','cancelled','pending','completed'));

-- Verify
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'orders' AND column_name IN ('price','kind');
