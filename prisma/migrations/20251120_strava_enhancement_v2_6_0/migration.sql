-- Strava Enhancement v2.6.0
-- Adiciona tabelas para dados avançados do Strava
-- Data: 2025-11-20

-- Tabela de estatísticas do Strava
CREATE TABLE IF NOT EXISTS "strava_stats" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "allRunsTotals" JSONB,
    "recentRunsTotals" JSONB,
    "ytdRunsTotals" JSONB,
    "allRideTotals" JSONB,
    "recentRideTotals" JSONB,
    "ytdRideTotals" JSONB,
    "allSwimTotals" JSONB,
    "recentSwimTotals" JSONB,
    "ytdSwimTotals" JSONB,
    "avgDistance" DOUBLE PRECISION,
    "avgPace" TEXT,
    "avgHeartRate" DOUBLE PRECISION,
    "avgElevationGain" DOUBLE PRECISION,
    "weeklyFrequency" INTEGER,
    "monthlyFrequency" INTEGER,
    "lastSyncAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "strava_stats_pkey" PRIMARY KEY ("id")
);

-- Tabela de recordes pessoais
CREATE TABLE IF NOT EXISTS "strava_personal_records" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "time" INTEGER NOT NULL,
    "pace" TEXT NOT NULL,
    "activityId" TEXT,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "heartRate" INTEGER,
    "elevationGain" DOUBLE PRECISION,
    "temperature" DOUBLE PRECISION,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "raceName" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "strava_personal_records_pkey" PRIMARY KEY ("id")
);

-- Tabela de equipamentos
CREATE TABLE IF NOT EXISTS "strava_gear" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "gearId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "distance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "activityCount" INTEGER NOT NULL DEFAULT 0,
    "purchaseDate" TIMESTAMP(3),
    "retiredDate" TIMESTAMP(3),
    "isRetired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "strava_gear_pkey" PRIMARY KEY ("id")
);

-- Tabela de zonas de treinamento
CREATE TABLE IF NOT EXISTS "strava_training_zones" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "heartRateZones" JSONB,
    "maxHeartRate" INTEGER,
    "restingHeartRate" INTEGER,
    "powerZones" JSONB,
    "ftp" INTEGER,
    "paceZones" JSONB,
    "thresholdPace" TEXT,
    "stravaCalculated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "strava_training_zones_pkey" PRIMARY KEY ("id")
);

-- Tabela de atividades detalhadas
CREATE TABLE IF NOT EXISTS "strava_activities" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sportType" TEXT,
    "distance" DOUBLE PRECISION NOT NULL,
    "movingTime" INTEGER NOT NULL,
    "elapsedTime" INTEGER NOT NULL,
    "averageSpeed" DOUBLE PRECISION,
    "maxSpeed" DOUBLE PRECISION,
    "averagePace" TEXT,
    "averageHeartRate" DOUBLE PRECISION,
    "maxHeartRate" INTEGER,
    "hasHeartRate" BOOLEAN NOT NULL DEFAULT false,
    "totalElevationGain" DOUBLE PRECISION,
    "elevHigh" DOUBLE PRECISION,
    "elevLow" DOUBLE PRECISION,
    "averageTemp" DOUBLE PRECISION,
    "kudosCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "gearId" TEXT,
    "startLatLng" JSONB,
    "endLatLng" JSONB,
    "locationCity" TEXT,
    "locationState" TEXT,
    "locationCountry" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "startDateLocal" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT,
    "manual" BOOLEAN NOT NULL DEFAULT false,
    "trainer" BOOLEAN NOT NULL DEFAULT false,
    "commute" BOOLEAN NOT NULL DEFAULT false,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "calories" DOUBLE PRECISION,
    "deviceName" TEXT,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "strava_activities_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "strava_stats_userId_key" ON "strava_stats"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "strava_stats_athleteId_key" ON "strava_stats"("athleteId");
CREATE UNIQUE INDEX IF NOT EXISTS "strava_personal_records_userId_type_key" ON "strava_personal_records"("userId", "type");
CREATE UNIQUE INDEX IF NOT EXISTS "strava_gear_gearId_key" ON "strava_gear"("gearId");
CREATE UNIQUE INDEX IF NOT EXISTS "strava_training_zones_userId_key" ON "strava_training_zones"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "strava_training_zones_athleteId_key" ON "strava_training_zones"("athleteId");
CREATE UNIQUE INDEX IF NOT EXISTS "strava_activities_activityId_key" ON "strava_activities"("activityId");

-- Indexes
CREATE INDEX IF NOT EXISTS "strava_stats_userId_idx" ON "strava_stats"("userId");
CREATE INDEX IF NOT EXISTS "strava_stats_athleteId_idx" ON "strava_stats"("athleteId");
CREATE INDEX IF NOT EXISTS "strava_personal_records_userId_idx" ON "strava_personal_records"("userId");
CREATE INDEX IF NOT EXISTS "strava_personal_records_athleteId_idx" ON "strava_personal_records"("athleteId");
CREATE INDEX IF NOT EXISTS "strava_personal_records_type_idx" ON "strava_personal_records"("type");
CREATE INDEX IF NOT EXISTS "strava_gear_userId_idx" ON "strava_gear"("userId");
CREATE INDEX IF NOT EXISTS "strava_gear_athleteId_idx" ON "strava_gear"("athleteId");
CREATE INDEX IF NOT EXISTS "strava_gear_gearId_idx" ON "strava_gear"("gearId");
CREATE INDEX IF NOT EXISTS "strava_gear_type_idx" ON "strava_gear"("type");
CREATE INDEX IF NOT EXISTS "strava_training_zones_userId_idx" ON "strava_training_zones"("userId");
CREATE INDEX IF NOT EXISTS "strava_training_zones_athleteId_idx" ON "strava_training_zones"("athleteId");
CREATE INDEX IF NOT EXISTS "strava_activities_userId_idx" ON "strava_activities"("userId");
CREATE INDEX IF NOT EXISTS "strava_activities_athleteId_idx" ON "strava_activities"("athleteId");
CREATE INDEX IF NOT EXISTS "strava_activities_activityId_idx" ON "strava_activities"("activityId");
CREATE INDEX IF NOT EXISTS "strava_activities_startDate_idx" ON "strava_activities"("startDate");
CREATE INDEX IF NOT EXISTS "strava_activities_type_idx" ON "strava_activities"("type");
