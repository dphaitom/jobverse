-- Add Quick Apply and Anonymous Application columns to applications table

ALTER TABLE applications ADD COLUMN IF NOT EXISTS is_quick_apply BOOLEAN DEFAULT FALSE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;

-- Add index for quick filtering
CREATE INDEX IF NOT EXISTS idx_applications_quick_apply ON applications(is_quick_apply);
CREATE INDEX IF NOT EXISTS idx_applications_anonymous ON applications(is_anonymous);

-- Update existing applications to have default values
UPDATE applications SET is_quick_apply = FALSE WHERE is_quick_apply IS NULL;
UPDATE applications SET is_anonymous = FALSE WHERE is_anonymous IS NULL;
