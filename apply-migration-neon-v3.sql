-- ═══════════════════════════════════════════════════════════════
-- MIGRATION v3.0.0 - ADD PROFILE FIELDS
-- Data: 2025-11-13
-- Migration: 20251113144016_add_v3_profile_fields
-- ═══════════════════════════════════════════════════════════════

-- Verificar se migration já foi aplicada
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "_prisma_migrations" 
    WHERE migration_name = '20251113144016_add_v3_profile_fields'
  ) THEN
    RAISE NOTICE '✅ Migration já foi aplicada anteriormente.';
  ELSE
    RAISE NOTICE '🔄 Aplicando migration v3.0.0...';
    
    -- Adicionar campos v3.0.0
    ALTER TABLE "athlete_profiles" 
    ADD COLUMN IF NOT EXISTS "hasRunBefore" BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS "currentlyInjured" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "avgSleepHours" DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS "tracksMenstrualCycle" BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS "avgCycleLength" INTEGER,
    ADD COLUMN IF NOT EXISTS "lastPeriodDate" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "workDemand" TEXT,
    ADD COLUMN IF NOT EXISTS "familyDemand" TEXT;
    
    RAISE NOTICE '✅ Campos adicionados com sucesso!';
    
    -- Registrar migration
    INSERT INTO "_prisma_migrations" (
      id, 
      checksum, 
      finished_at, 
      migration_name, 
      logs, 
      rolled_back_at, 
      started_at, 
      applied_steps_count
    ) VALUES (
      gen_random_uuid(),
      'da5d8c5bc8ef4a3c2a3d91f7c4e6b8d5a1c2e4f6a8b0c2d4e6f8a0b2c4d6e8f0',
      NOW(),
      '20251113144016_add_v3_profile_fields',
      NULL,
      NULL,
      NOW(),
      1
    );
    
    RAISE NOTICE '✅ Migration registrada!';
  END IF;
END $$;

-- Verificar campos adicionados
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'athlete_profiles'
  AND column_name IN (
    'hasRunBefore',
    'currentlyInjured', 
    'avgSleepHours',
    'tracksMenstrualCycle',
    'avgCycleLength',
    'lastPeriodDate',
    'workDemand',
    'familyDemand'
  )
ORDER BY column_name;

-- Mostrar contagem de perfis
SELECT 
  COUNT(*) as total_profiles,
  COUNT("hasRunBefore") as with_has_run_before,
  COUNT("avgSleepHours") as with_sleep_hours,
  COUNT("tracksMenstrualCycle") as with_cycle_tracking
FROM "athlete_profiles";
