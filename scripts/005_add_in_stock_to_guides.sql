-- Add in_stock flag to guides to manage availability

ALTER TABLE guides
ADD COLUMN IF NOT EXISTS in_stock BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN guides.in_stock IS 'Availability flag: TRUE means purchasable, FALSE shows out of stock';
