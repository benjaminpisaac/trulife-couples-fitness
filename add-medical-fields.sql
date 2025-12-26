-- Run this SQL in Render's PostgreSQL database shell
-- This adds the medical profile fields WITHOUT using Entity Framework migrations

-- Add Ethnicity column
ALTER TABLE "UserProfiles" 
ADD COLUMN IF NOT EXISTS "Ethnicity" VARCHAR(100);

-- Add MedicalConditions column
ALTER TABLE "UserProfiles" 
ADD COLUMN IF NOT EXISTS "MedicalConditions" TEXT;

-- Add Medications column
ALTER TABLE "UserProfiles" 
ADD COLUMN IF NOT EXISTS "Medications" TEXT;

-- Increase FitnessGoal max length from 50 to 200
ALTER TABLE "UserProfiles" 
ALTER COLUMN "FitnessGoal" TYPE VARCHAR(200);

-- Verify columns were added
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'UserProfiles' 
AND column_name IN ('Ethnicity', 'MedicalConditions', 'Medications', 'FitnessGoal');
