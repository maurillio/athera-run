-- AlterTable: Make goalDistance and targetRaceDate optional in CustomTrainingPlan
-- This allows users to complete onboarding without selecting a race goal
-- Version: v1.5.3
-- Date: 2025-11-07

-- Make goalDistance optional
ALTER TABLE "custom_training_plans" ALTER COLUMN "goalDistance" DROP NOT NULL;

-- Make targetRaceDate optional  
ALTER TABLE "custom_training_plans" ALTER COLUMN "targetRaceDate" DROP NOT NULL;
