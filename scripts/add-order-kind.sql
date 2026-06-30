-- Adds one-time-purchase support to the orders table.
-- Run once against the production database (Railway → Postgres → Query tab,
-- or psql with the public URL). Idempotent — safe to re-run.

-- 1) Per-pound order totals are decimals, not whole dollars.
ALTER TABLE orders ALTER COLUMN price TYPE NUMERIC(10,2);

-- 2) Distinguish weekly subscriptions from one-time orders.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'subscription';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_kind_check') THEN
    ALTER TABLE orders ADD CONSTRAINT orders_kind_check
      CHECK (kind IN ('subscription','one_time'));
  END IF;
END $$;

-- Verify
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'orders' AND column_name IN ('price','kind');
