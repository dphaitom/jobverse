-- V8__enforce_one_company_per_employer.sql
-- Enforce 1:1 relationship between employer user and company

-- Step 1: Handle employers with multiple companies
-- First, reassign jobs from duplicate companies to the primary company (lowest ID)
UPDATE jobs j
SET company_id = (
    SELECT MIN(c2.id) 
    FROM companies c2 
    WHERE c2.owner_id = (SELECT owner_id FROM companies WHERE id = j.company_id)
)
WHERE EXISTS (
    SELECT 1 FROM companies c1
    WHERE c1.id = j.company_id
    AND EXISTS (
        SELECT 1 FROM companies c2 
        WHERE c2.owner_id = c1.owner_id 
        AND c2.id < c1.id
    )
);

-- Step 2: Now safely delete duplicate companies (keeping the one with lowest ID)
DELETE FROM companies c1
WHERE EXISTS (
    SELECT 1 FROM companies c2 
    WHERE c2.owner_id = c1.owner_id 
    AND c2.id < c1.id
);

-- Step 3: Add unique constraint to enforce 1:1 relationship
-- This ensures each employer can only have one company
ALTER TABLE companies DROP CONSTRAINT IF EXISTS uk_companies_owner_id;
ALTER TABLE companies ADD CONSTRAINT uk_companies_owner_id UNIQUE (owner_id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies(owner_id);
