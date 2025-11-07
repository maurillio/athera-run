-- AlterTable
-- Make goalDistance optional to allow progressive onboarding
-- Users can complete profile without selecting a race distance immediately
ALTER TABLE "athlete_profiles" ALTER COLUMN "goalDistance" DROP NOT NULL;
