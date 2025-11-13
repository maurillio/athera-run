-- ============================================================================
-- MIGRAÇÃO URGENTE v3.0.1 - Aplicar via Neon SQL Editor
-- ============================================================================
-- Data: 13/NOV/2025
-- Objetivo: Adicionar campos v2.0.0 + v3.0.0 que faltam
-- ============================================================================

-- PARTE 1: v2.0.0 - Estrutura Detalhada de Workouts
-- ============================================================================

-- Adicionar campos de estrutura detalhada
ALTER TABLE "custom_workouts" 
  ADD COLUMN IF NOT EXISTS "warmUpStructure" JSONB,
  ADD COLUMN IF NOT EXISTS "mainWorkoutStruct" JSONB,
  ADD COLUMN IF NOT EXISTS "coolDownStructure" JSONB;

-- Adicionar campos de enriquecimento educacional
ALTER TABLE "custom_workouts"
  ADD COLUMN IF NOT EXISTS "objective" TEXT,
  ADD COLUMN IF NOT EXISTS "scientificBasis" TEXT,
  ADD COLUMN IF NOT EXISTS "tips" JSONB,
  ADD COLUMN IF NOT EXISTS "commonMistakes" JSONB,
  ADD COLUMN IF NOT EXISTS "successCriteria" JSONB;

-- Adicionar métricas avançadas
ALTER TABLE "custom_workouts"
  ADD COLUMN IF NOT EXISTS "intensityLevel" INTEGER CHECK ("intensityLevel" >= 1 AND "intensityLevel" <= 5),
  ADD COLUMN IF NOT EXISTS "expectedRPE" INTEGER CHECK ("expectedRPE" >= 1 AND "expectedRPE" <= 10),
  ADD COLUMN IF NOT EXISTS "heartRateZones" JSONB,
  ADD COLUMN IF NOT EXISTS "intervals" JSONB,
  ADD COLUMN IF NOT EXISTS "expectedDuration" INTEGER;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS "custom_workouts_intensity_idx" ON "custom_workouts"("intensityLevel");
CREATE INDEX IF NOT EXISTS "custom_workouts_type_idx" ON "custom_workouts"("type");
CREATE INDEX IF NOT EXISTS "custom_workouts_date_idx" ON "custom_workouts"("date");

-- PARTE 2: v3.0.0 - Campos de Profile Multi-Dimensional
-- ============================================================================

-- Já aplicado anteriormente, mas garantir que existe
ALTER TABLE "athlete_profiles"
  ADD COLUMN IF NOT EXISTS "hasRunBefore" BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS "currentlyInjured" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "avgSleepHours" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "tracksMenstrualCycle" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "avgCycleLength" INTEGER,
  ADD COLUMN IF NOT EXISTS "lastPeriodDate" TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "workDemand" TEXT,
  ADD COLUMN IF NOT EXISTS "familyDemand" TEXT;

-- PARTE 3: Verificação
-- ============================================================================

-- Verificar se colunas foram criadas em custom_workouts
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'custom_workouts'
  AND column_name IN (
    'warmUpStructure', 
    'mainWorkoutStruct', 
    'coolDownStructure',
    'objective',
    'scientificBasis',
    'tips',
    'commonMistakes',
    'successCriteria',
    'intensityLevel',
    'expectedRPE',
    'heartRateZones',
    'intervals',
    'expectedDuration'
  )
ORDER BY column_name;

-- Verificar se colunas foram criadas em athlete_profiles
SELECT column_name, data_type, is_nullable, column_default
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

-- ============================================================================
-- INSTRUÇÕES DE USO:
-- ============================================================================
-- 1. Acessar: https://console.neon.tech/
-- 2. Selecionar projeto "Athera Run"
-- 3. Clicar em "SQL Editor"
-- 4. Colar este script COMPLETO
-- 5. Executar (Run)
-- 6. Verificar que as 2 queries SELECT no final retornam linhas
-- 7. Se retornar linhas = ✅ SUCESSO!
-- ============================================================================
