-- Migration: Add Strava Enhanced Fields
-- Version: 2.6.0
-- Date: 2025-11-20

-- Add new Strava-related columns to athlete_profile
ALTER TABLE "athlete_profile" 
ADD COLUMN IF NOT EXISTS "strava_profile_data" JSONB,
ADD COLUMN IF NOT EXISTS "strava_stats_data" JSONB,
ADD COLUMN IF NOT EXISTS "strava_last_sync" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "personal_records" JSONB,
ADD COLUMN IF NOT EXISTS "training_zones" JSONB,
ADD COLUMN IF NOT EXISTS "shoe_rotation" JSONB,
ADD COLUMN IF NOT EXISTS "preferred_routes" JSONB,
ADD COLUMN IF NOT EXISTS "training_preferences" JSONB;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "athlete_profile_strava_last_sync_idx" ON "athlete_profile"("strava_last_sync");
CREATE INDEX IF NOT EXISTS "athlete_profile_strava_connected_idx" ON "athlete_profile"("stravaConnected");

-- Add comments for documentation
COMMENT ON COLUMN "athlete_profile"."strava_profile_data" IS 'Raw Strava profile data including clubs, bikes, shoes';
COMMENT ON COLUMN "athlete_profile"."strava_stats_data" IS 'Strava statistics: recent runs, YTD, all-time totals';
COMMENT ON COLUMN "athlete_profile"."strava_last_sync" IS 'Last time Strava data was synchronized';
COMMENT ON COLUMN "athlete_profile"."personal_records" IS 'Personal records/PRs from Strava and manual entries';
COMMENT ON COLUMN "athlete_profile"."training_zones" IS 'Heart rate and pace zones';
COMMENT ON COLUMN "athlete_profile"."shoe_rotation" IS 'Running shoes tracking with mileage';
COMMENT ON COLUMN "athlete_profile"."preferred_routes" IS 'Favorite running routes';
COMMENT ON COLUMN "athlete_profile"."training_preferences" IS 'Training preferences: surface, time of day, etc';
