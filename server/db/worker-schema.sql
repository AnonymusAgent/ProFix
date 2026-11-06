-- ProFix worker profiles + booking payouts
-- Workers (plumbers / electricians) sign in with Neon Auth; this table is
-- the ProFix-side profile the API joins against their Neon email.
-- Run AFTER schema.sql. Safe to run more than once.

CREATE TABLE IF NOT EXISTS worker_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neon_user_id  TEXT,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  phone         TEXT,
  trade         TEXT NOT NULL CHECK (trade IN ('plumber', 'electrician')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_trade ON worker_profiles (trade);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS worker_email TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payout_cents INTEGER;
CREATE INDEX IF NOT EXISTS idx_bookings_worker ON bookings (worker_email);
