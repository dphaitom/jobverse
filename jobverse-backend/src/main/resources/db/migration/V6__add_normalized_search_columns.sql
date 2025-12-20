-- Add normalized search columns for Vietnamese accent-insensitive search
-- This allows searching "Hồ Chí Minh" to match "Ho Chi Minh", "hồ chí minh", etc.

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS title_normalized VARCHAR(255);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS description_normalized TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location_normalized VARCHAR(255);

-- Create indexes for faster searching
CREATE INDEX IF NOT EXISTS idx_jobs_title_normalized ON jobs(title_normalized);
CREATE INDEX IF NOT EXISTS idx_jobs_description_normalized_gin ON jobs USING GIN(to_tsvector('simple', description_normalized));
CREATE INDEX IF NOT EXISTS idx_jobs_location_normalized ON jobs(location_normalized);

-- Populate existing data with normalized values
-- This will be handled by @PrePersist/@PreUpdate hooks in the application
-- But we update existing records here
UPDATE jobs SET
    title_normalized = LOWER(UNACCENT(title)),
    description_normalized = LOWER(UNACCENT(description)),
    location_normalized = LOWER(UNACCENT(location))
WHERE title_normalized IS NULL;

-- Note: PostgreSQL's UNACCENT function requires the unaccent extension
-- If not available, the Java application will handle normalization
