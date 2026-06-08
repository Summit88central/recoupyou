-- Migration 007: Promo codes + payment event idempotency log + RPC
-- Run this in your Supabase SQL editor AFTER 006_create_challenge_registrations.sql

-- ─── 1. Promo codes ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promo_codes (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code            TEXT        NOT NULL UNIQUE,
    discount_percent INTEGER    NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    max_uses        INTEGER     NOT NULL CHECK (max_uses > 0),
    uses_count      INTEGER     NOT NULL DEFAULT 0 CHECK (uses_count >= 0),
    expires_at      TIMESTAMPTZ,          -- NULL = never expires
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE promo_codes IS 'Promo codes for challenge registration discounts.';
COMMENT ON COLUMN promo_codes.uses_count IS 'Atomically incremented. Never read-then-write.';

-- ─── 2. Atomic promo reservation function ────────────────────────────────────
-- Returns ONE row on success (slot reserved), ZERO rows if invalid/expired/full.
-- This is the ONLY correct way to reserve a promo slot without race conditions.
CREATE OR REPLACE FUNCTION reserve_promo_code(p_code TEXT)
RETURNS TABLE(id UUID, discount_percent INTEGER)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  UPDATE promo_codes
  SET uses_count = uses_count + 1
  WHERE code = p_code
    AND uses_count < max_uses
    AND (expires_at IS NULL OR expires_at > NOW())
  RETURNING id, discount_percent;
$$;

-- Preview-only check (no writes) — used by /api/challenge/promo
CREATE OR REPLACE FUNCTION preview_promo_code(p_code TEXT)
RETURNS TABLE(discount_percent INTEGER, uses_remaining INTEGER)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT
    discount_percent,
    (max_uses - uses_count) AS uses_remaining
  FROM promo_codes
  WHERE code = p_code
    AND uses_count < max_uses
    AND (expires_at IS NULL OR expires_at > NOW());
$$;

-- ─── 3. Payment events (idempotency log) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_events (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    paystack_reference  TEXT        NOT NULL UNIQUE,
    event_type          TEXT        NOT NULL,
    processed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_reference
    ON payment_events (paystack_reference);

COMMENT ON TABLE payment_events IS
  'One row per processed Paystack webhook event. Prevents double-saves on retries.';

-- ─── 4. Extend challenge_registrations ───────────────────────────────────────
ALTER TABLE challenge_registrations
    ADD COLUMN IF NOT EXISTS promo_code_used TEXT,
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'confirmed';

COMMENT ON COLUMN challenge_registrations.promo_code_used IS
  'The promo code applied at registration, if any.';
COMMENT ON COLUMN challenge_registrations.status IS
  'confirmed, refunded, cancelled etc.';

-- ─── 5. Sample promo code — uncomment to insert a test code ──────────────────
-- INSERT INTO promo_codes (code, discount_percent, max_uses, expires_at)
-- VALUES ('EARLYBIRD20', 20, 5, NOW() + INTERVAL '30 days')
-- ON CONFLICT (code) DO NOTHING;
