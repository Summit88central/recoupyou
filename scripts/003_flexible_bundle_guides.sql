-- Migration to support flexible number of guides in bundles
-- Run this in your Supabase SQL editor

-- Step 1: Create junction table for bundle-guide relationships
CREATE TABLE bundle_guides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bundle_id UUID NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
    guide_id UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(bundle_id, guide_id)
);

-- Step 2: Migrate existing data from guide1_id and guide2_id to junction table
INSERT INTO bundle_guides (bundle_id, guide_id)
SELECT id, guide1_id FROM bundles WHERE guide1_id IS NOT NULL
UNION ALL
SELECT id, guide2_id FROM bundles WHERE guide2_id IS NOT NULL;

-- Step 3: Remove the old guide1_id and guide2_id columns
ALTER TABLE bundles DROP COLUMN IF EXISTS guide1_id;
ALTER TABLE bundles DROP COLUMN IF EXISTS guide2_id;

-- Step 4: Add indexes for better performance
CREATE INDEX idx_bundle_guides_bundle_id ON bundle_guides(bundle_id);
CREATE INDEX idx_bundle_guides_guide_id ON bundle_guides(guide_id);

-- Optional: Add comments for documentation
COMMENT ON TABLE bundle_guides IS 'Junction table linking bundles to guides - supports multiple guides per bundle';
COMMENT ON COLUMN bundle_guides.bundle_id IS 'Reference to the bundle';
COMMENT ON COLUMN bundle_guides.guide_id IS 'Reference to the guide included in the bundle';