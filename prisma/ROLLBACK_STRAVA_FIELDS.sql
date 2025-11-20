-- ROLLBACK: Remove Strava Enhanced Fields
-- Execute this in Neon Database to remove the columns that are causing errors
-- Date: 2025-11-20

-- Drop indexes first
DROP INDEX IF EXISTS "athlete_profile_strava_last_sync_idx";
DROP INDEX IF EXISTS "athlete_profile_strava_connected_idx";

-- Remove columns from athlete_profile
ALTER TABLE "athlete_profile" 
DROP COLUMN IF EXISTS "strava_profile_data",
DROP COLUMN IF EXISTS "strava_stats_data",
DROP COLUMN IF EXISTS "strava_last_sync",
DROP COLUMN IF EXISTS "personal_records",
DROP COLUMN IF EXISTS "training_zones",
DROP COLUMN IF EXISTS "shoe_rotation",
DROP COLUMN IF EXISTS "preferred_routes",
DROP COLUMN IF EXISTS "training_preferences";
