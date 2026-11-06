-- ProFix accounts update: suspension / fraud reporting / legacy admin removal.
-- Run ONCE in the Neon SQL Editor (idempotent — safe to re-run).
-- Adds account status used by admin suspend, fraud reports filed by
-- customers, and deletes the legacy seeded admin (admin login is now the
-- owner email + ADMIN_PASSWORD env var on the backend).

ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspend_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS fraud_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_email TEXT NOT NULL,
  reported_email TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (reporter_email, reported_email)
);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_reported ON fraud_reports (reported_email);

-- Remove the legacy seeded admin account. Owner admin sign-in is now
-- alimukhtar@profix.com + the ADMIN_PASSWORD environment variable
-- (created automatically on first login), so this row is obsolete.
DELETE FROM users WHERE lower(email) = 'admin@profixservices.com' AND role = 'admin';
