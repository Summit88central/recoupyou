-- Add promo_code column to guides table for per-guide promo code
-- Run this in your Supabase SQL editor

ALTER TABLE guides
ADD COLUMN IF NOT EXISTS promo_code TEXT;

-- Optional: constrain discount to 0-100 via CHECK
ALTER TABLE guides
ADD CONSTRAINT guides_discount_range CHECK (discount >= 0 AND discount <= 100);

COMMENT ON COLUMN guides.promo_code IS 'Promo code required at checkout to apply this guide\'s discount';
