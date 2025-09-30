-- Add description column to bundles table
-- Run this in your Supabase SQL editor

ALTER TABLE bundles 
ADD COLUMN description TEXT;

-- Optional: Add a comment to document the column
COMMENT ON COLUMN bundles.description IS 'Description of what the bundle contains';