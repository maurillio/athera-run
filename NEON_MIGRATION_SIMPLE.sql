-- ═══════════════════════════════════════════════════════════════
-- MIGRATION v3.0.0 - VERSÃO SIMPLIFICADA (SEM TABELA DE CONTROLE)
-- Data: 2025-11-14
-- Use este se você teve erro: "_prisma_migrations does not exist"
-- ═══════════════════════════════════════════════════════════════

-- 1. CRIAR TABELA DE CONTROLE DO PRISMA (se não existir)
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) PRIMARY KEY,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMP(3),
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

-- 2. VERIFICAR SE CAMPOS JÁ EXISTEM (antes de adicionar)
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'athlete_profiles' 
  AND column_name IN ('hasRunBefore', 'currentlyInjured', 'avgSleepHours');

-- Se retornou 0 linhas, execute o próximo bloco:
-- Se retornou 3 linhas, PULE para o PASSO 4!

-- 3. ADICIONAR CAMPOS v3.0.0
ALTER TABLE "athlete_profiles" 
ADD COLUMN IF NOT EXISTS "hasRunBefore" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "currentlyInjured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "avgSleepHours" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "tracksMenstrualCycle" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "avgCycleLength" INTEGER,
ADD COLUMN IF NOT EXISTS "lastPeriodDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "workDemand" TEXT,
ADD COLUMN IF NOT EXISTS "familyDemand" TEXT;

-- 4. REGISTRAR MIGRATION (para controle)
INSERT INTO "_prisma_migrations" (
  id, 
  checksum, 
  finished_at, 
  migration_name, 
  started_at, 
  applied_steps_count
) 
SELECT 
  gen_random_uuid(),
  'da5d8c5bc8ef4a3c2a3d91f7c4e6b8d5a1c2e4f6a8b0c2d4e6f8a0b2c4d6e8f0',
  NOW(),
  '20251113144016_add_v3_profile_fields',
  NOW(),
  1
WHERE NOT EXISTS (
  SELECT 1 FROM "_prisma_migrations" 
  WHERE migration_name = '20251113144016_add_v3_profile_fields'
);

-- 5. VALIDAÇÃO - Verificar campos criados
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

-- Deve retornar 8 linhas!

-- 6. TESTE - Verificar perfis existentes
SELECT 
  id,
  "userId",
  "hasRunBefore",
  "currentlyInjured",
  "avgSleepHours",
  "createdAt"
FROM "athlete_profiles"
ORDER BY "createdAt" DESC
LIMIT 5;

-- Perfis antigos terão valores default:
-- hasRunBefore = true
-- currentlyInjured = false
-- avgSleepHours = NULL

-- ✅ SE TUDO ISSO FUNCIONOU, MIGRATION APLICADA COM SUCESSO!
