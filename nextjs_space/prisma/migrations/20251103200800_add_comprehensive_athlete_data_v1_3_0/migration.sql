-- AlterTable AthleteProfile - Add comprehensive athlete data fields for v1.3.0

-- Fisiologia e Recuperação
ALTER TABLE "athlete_profiles" ADD COLUMN IF NOT EXISTS "restingHeartRate" INTEGER;
ALTER TABLE "athlete_profiles" ADD COLUMN IF NOT EXISTS "sleepQuality" INTEGER;
ALTER TABLE "athlete_profiles" ADD COLUMN IF NOT EXISTS "stressLevel" INTEGER;

-- Outros Esportes (Base Aeróbica)
ALTER TABLE "athlete_profiles" ADD COLUMN IF NOT EXISTS "otherSportsExperience" TEXT;
ALTER TABLE "athlete_profiles" ADD COLUMN IF NOT EXISTS "otherSportsYears" INTEGER;

-- Lesões Detalhadas
ALTER TABLE "athlete_profiles" ADD COLUMN IF NOT EXISTS "injuryDetails" JSONB;
ALTER TABLE "athlete_profiles" ADD COLUMN IF NOT EXISTS "injuryRecoveryStatus" TEXT;
ALTER TABLE "athlete_profiles" ADD COLUMN IF NOT EXISTS "lastInjuryDate" TIMESTAMP(3);

-- Performance Detalhada
ALTER TABLE "athlete_profiles" ADD COLUMN IF NOT EXISTS "bestTimes" JSONB;
ALTER TABLE "athlete_profiles" ADD COLUMN IF NOT EXISTS "lastVDOTUpdate" TIMESTAMP(3);

-- Infraestrutura e Recursos
ALTER TABLE "athlete_profiles" ADD COLUMN IF NOT EXISTS "hasGymAccess" BOOLEAN DEFAULT false;
ALTER TABLE "athlete_profiles" ADD COLUMN IF NOT EXISTS "hasPoolAccess" BOOLEAN DEFAULT false;
ALTER TABLE "athlete_profiles" ADD COLUMN IF NOT EXISTS "hasTrackAccess" BOOLEAN DEFAULT false;

-- Preferências e Motivação
ALTER TABLE "athlete_profiles" ADD COLUMN IF NOT EXISTS "trainingPreferences" JSONB;
ALTER TABLE "athlete_profiles" ADD COLUMN IF NOT EXISTS "motivationFactors" JSONB;
