-- ============================================================
-- ProFix — PostgreSQL schema (Neon compatible)
-- Safe to run repeatedly: every statement is idempotent.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- users ----------
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'customer'
                CHECK (role IN ('customer', 'admin', 'technician')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (lower(email));

-- ---------- services ----------
CREATE TABLE IF NOT EXISTS services (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT NOT NULL DEFAULT 'Wrench',
  category    TEXT NOT NULL CHECK (category IN ('plumbing', 'electrical')),
  features    JSONB NOT NULL DEFAULT '[]'::jsonb,
  image       TEXT,
  price_label TEXT,
  price_cents INTEGER CHECK (price_cents IS NULL OR price_cents >= 0),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_services_category ON services (category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services (is_active);

-- ---------- bookings ----------
CREATE TABLE IF NOT EXISTS bookings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users (id) ON DELETE SET NULL,
  service_id     UUID REFERENCES services (id) ON DELETE SET NULL,
  service_slug   TEXT,
  name           TEXT NOT NULL,
  email          TEXT,
  phone          TEXT NOT NULL,
  address        TEXT,
  service_type   TEXT NOT NULL DEFAULT 'plumbing'
                 CHECK (service_type IN ('plumbing', 'electrical', 'emergency')),
  preferred_date DATE,
  preferred_time TEXT,
  urgency        TEXT NOT NULL DEFAULT 'normal'
                 CHECK (urgency IN ('normal', 'urgent', 'emergency')),
  description    TEXT,
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  assigned_to    TEXT,
  admin_notes    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings (created_at DESC);

-- ---------- contact messages ----------
CREATE TABLE IF NOT EXISTS contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  subject    TEXT,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_created ON contact_messages (created_at DESC);

-- ---------- testimonials / reviews ----------
CREATE TABLE IF NOT EXISTS testimonials (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users (id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'Customer',
  avatar       TEXT,
  rating       INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  text         TEXT NOT NULL,
  service      TEXT,
  is_approved  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials (is_approved);

-- ---------- faqs ----------
CREATE TABLE IF NOT EXISTS faqs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  category   TEXT NOT NULL DEFAULT 'General',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- pricing plans ----------
CREATE TABLE IF NOT EXISTS pricing_plans (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  description  TEXT NOT NULL,
  price_label  TEXT NOT NULL,
  unit         TEXT NOT NULL,
  features     JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_highlighted BOOLEAN NOT NULL DEFAULT FALSE,
  badge        TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- newsletter ----------
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- updated_at helper ----------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_services_updated ON services;
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_bookings_updated ON bookings;
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Worker profiles (Neon Auth identities; trade = plumber | electrician)
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
