-- v3.1.0 Convergência Total de Dados
-- Migration para consolidar e limpar dados duplicados

-- ============================================================================
-- PARTE 1: MIGRAR goalDistance, targetRaceDate, targetTime para RaceGoal
-- ============================================================================

-- Migrar dados de AthleteProfile para RaceGoal (apenas se não existir)
INSERT INTO "race_goals" (
  "athleteId",
  "raceName",
  "distance",
  "raceDate",
  "targetTime",
  "location",
  "priority",
  "autoClassified",
  "status",
  "isPrimary",
  "createdAt",
  "updatedAt"
)
SELECT 
  ap."id" as "athleteId",
  'Corrida Principal' as "raceName",
  ap."goalDistance" as "distance",
  ap."targetRaceDate" as "raceDate",
  ap."targetTime",
  NULL as "location",
  'A' as "priority",
  FALSE as "autoClassified",
  'active' as "status",
  TRUE as "isPrimary",
  NOW() as "createdAt",
  NOW() as "updatedAt"
FROM "athlete_profiles" ap
WHERE 
  ap."goalDistance" IS NOT NULL 
  AND ap."targetRaceDate" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "race_goals" rg 
    WHERE rg."athleteId" = ap."id" 
    AND rg."isPrimary" = TRUE
  );

-- ============================================================================
-- PARTE 2: LIMPAR CAMPOS ANTIGOS (marcar como deprecated)
-- ============================================================================

-- Comentar campos deprecated (não remover ainda para não quebrar)
COMMENT ON COLUMN "athlete_profiles"."goalDistance" IS 'DEPRECATED v3.1.0 - Use race_goals table';
COMMENT ON COLUMN "athlete_profiles"."targetRaceDate" IS 'DEPRECATED v3.1.0 - Use race_goals table';
COMMENT ON COLUMN "athlete_profiles"."targetTime" IS 'DEPRECATED v3.1.0 - Use race_goals table';
COMMENT ON COLUMN "athlete_profiles"."injuries" IS 'DEPRECATED v3.1.0 - Use injuryDetails instead';
COMMENT ON COLUMN "athlete_profiles"."injuryHistory" IS 'DEPRECATED v3.1.0 - Use injuryDetails instead';
COMMENT ON COLUMN "athlete_profiles"."weeklyAvailability" IS 'DEPRECATED v3.1.0 - Use trainingSchedule instead';
COMMENT ON COLUMN "athlete_profiles"."trainingActivities" IS 'DEPRECATED v3.1.0 - Use trainingSchedule instead';

-- ============================================================================
-- PARTE 3: ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índice para buscas por campos v3.0.0
CREATE INDEX IF NOT EXISTS "idx_athlete_profiles_hasRunBefore" ON "athlete_profiles"("hasRunBefore");
CREATE INDEX IF NOT EXISTS "idx_athlete_profiles_currentlyInjured" ON "athlete_profiles"("currentlyInjured");

-- Índice para race goals por prioridade
CREATE INDEX IF NOT EXISTS "idx_race_goals_priority_status" ON "race_goals"("priority", "status");

-- ============================================================================
-- VERIFICAÇÃO DE INTEGRIDADE
-- ============================================================================

-- Verificar se migration foi bem sucedida
DO $$
DECLARE
  total_migrated INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_migrated
  FROM "race_goals"
  WHERE "raceName" = 'Corrida Principal';
  
  RAISE NOTICE 'v3.1.0 Migration: % race goals migrated from athlete_profiles', total_migrated;
END $$;
