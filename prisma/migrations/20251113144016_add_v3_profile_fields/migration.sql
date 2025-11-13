-- AlterTable
ALTER TABLE "athlete_profiles" 
ADD COLUMN "hasRunBefore" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "currentlyInjured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "avgSleepHours" DOUBLE PRECISION,
ADD COLUMN "tracksMenstrualCycle" BOOLEAN DEFAULT false,
ADD COLUMN "avgCycleLength" INTEGER,
ADD COLUMN "lastPeriodDate" TIMESTAMP(3),
ADD COLUMN "workDemand" TEXT,
ADD COLUMN "familyDemand" TEXT;

-- Comentários para documentação
COMMENT ON COLUMN "athlete_profiles"."hasRunBefore" IS 'v3.0.0 - Distingue iniciante absoluto (nunca correu) de iniciante com base';
COMMENT ON COLUMN "athlete_profiles"."currentlyInjured" IS 'v3.0.0 - Flag rápido para lesão ativa/recuperação';
COMMENT ON COLUMN "athlete_profiles"."avgSleepHours" IS 'v3.0.0 - Horas médias de sono por noite (ex: 6.5)';
COMMENT ON COLUMN "athlete_profiles"."tracksMenstrualCycle" IS 'v3.0.0 - Tracking ciclo menstrual (women only, opcional)';
COMMENT ON COLUMN "athlete_profiles"."avgCycleLength" IS 'v3.0.0 - Duração média ciclo menstrual em dias';
COMMENT ON COLUMN "athlete_profiles"."lastPeriodDate" IS 'v3.0.0 - Data última menstruação para cálculo fase';
COMMENT ON COLUMN "athlete_profiles"."workDemand" IS 'v3.0.0 - Demanda trabalho: sedentary/moderate/physical';
COMMENT ON COLUMN "athlete_profiles"."familyDemand" IS 'v3.0.0 - Responsabilidades familiares: low/moderate/high';
