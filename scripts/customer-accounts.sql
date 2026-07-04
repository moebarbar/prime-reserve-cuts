-- Self-service customer accounts + editable order line items.
-- Run once against production (Railway → Postgres → Query tab, or
-- psql "$DATABASE_PUBLIC_URL" -f scripts/customer-accounts.sql).
-- Idempotent — safe to re-run.

-- 1) Accounts customers create at checkout to manage their deliveries.
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
);

-- 2) Link orders to accounts, store structured (editable) line items, and the
--    Stripe subscription id so the dashboard can update/cancel it.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB NOT NULL DEFAULT '[]';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Verify
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'orders' AND column_name IN ('customer_id','items','stripe_subscription_id');
