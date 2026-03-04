-- Create table for 6-week challenge paid registrations
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS challenge_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    email TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 16 AND age <= 100),
    payment_option TEXT NOT NULL CHECK (payment_option IN ('member', 'non_member')),
    base_price INTEGER NOT NULL CHECK (base_price >= 0),
    amount_paid INTEGER NOT NULL CHECK (amount_paid >= 0),
    discount_code TEXT,
    discount_applied BOOLEAN NOT NULL DEFAULT FALSE,
    discount_amount INTEGER NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    payment_reference TEXT NOT NULL UNIQUE,
    emergency_contact_name TEXT NOT NULL,
    emergency_contact_number TEXT NOT NULL,
    challenge_goal TEXT NOT NULL CHECK (challenge_goal IN ('lose_body_fat', 'maintain', 'build_muscle')),
    dietary_preferences TEXT[] NOT NULL DEFAULT '{}',
    foods_disliked TEXT,
    medical_conditions TEXT,
    activity_level TEXT NOT NULL CHECK (activity_level IN ('sedentary', 'lightly_active', 'heavily_active')),
    alcohol_frequency TEXT NOT NULL,
    instagram_handle TEXT,
    guardian_name TEXT,
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    liability_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    agreement_signature TEXT NOT NULL,
    agreement_date DATE NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'paid',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenge_registrations_created_at
  ON challenge_registrations (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_challenge_registrations_payment_status
  ON challenge_registrations (payment_status);

CREATE INDEX IF NOT EXISTS idx_challenge_registrations_discount_applied
  ON challenge_registrations (discount_applied);

COMMENT ON TABLE challenge_registrations IS 'Paid applications for the 6-week glutes and core challenge.';
COMMENT ON COLUMN challenge_registrations.payment_option IS 'member = current member, non_member = non-member';
COMMENT ON COLUMN challenge_registrations.payment_status IS 'paid, refunded, cancelled etc.';
