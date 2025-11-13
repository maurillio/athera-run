-- ============================================================================
-- MIGRAÇÃO CONSOLIDADA v2.0.0 + v3.0.0 - NEON DATABASE
-- ============================================================================
-- Data: 13/NOV/2025
-- Objetivo: Aplicar migrations pendentes em produção
-- ============================================================================

BEGIN;

-- ============================================================================
-- PARTE 1: v2.0.0 - Sistema Avançado de Apresentação de Treinos
-- ============================================================================

-- Adicionar novos campos de estrutura detalhada
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

-- Comentários de documentação v2.0.0
COMMENT ON COLUMN "custom_workouts"."warmUpStructure" IS 'Estrutura detalhada do aquecimento (fase 1) em JSON';
COMMENT ON COLUMN "custom_workouts"."mainWorkoutStruct" IS 'Estrutura detalhada da parte principal (fase 2) em JSON';
COMMENT ON COLUMN "custom_workouts"."coolDownStructure" IS 'Estrutura detalhada do desaquecimento (fase 3) em JSON';
COMMENT ON COLUMN "custom_workouts"."objective" IS 'Objetivo fisiológico do treino';
COMMENT ON COLUMN "custom_workouts"."scientificBasis" IS 'Fundamento científico que embasa o treino';
COMMENT ON COLUMN "custom_workouts"."tips" IS 'Array de dicas práticas em JSON';
COMMENT ON COLUMN "custom_workouts"."commonMistakes" IS 'Erros comuns a evitar em JSON';
COMMENT ON COLUMN "custom_workouts"."successCriteria" IS 'Critérios de sucesso em JSON';
COMMENT ON COLUMN "custom_workouts"."intensityLevel" IS 'Nível de intensidade (1=Muito Leve, 5=Muito Intenso)';
COMMENT ON COLUMN "custom_workouts"."expectedRPE" IS 'Rate of Perceived Exertion esperado (1-10)';
COMMENT ON COLUMN "custom_workouts"."heartRateZones" IS 'Zonas de frequência cardíaca por fase em JSON';
COMMENT ON COLUMN "custom_workouts"."intervals" IS 'Estrutura de intervalos se aplicável em JSON';
COMMENT ON COLUMN "custom_workouts"."expectedDuration" IS 'Duração total esperada em minutos';

-- ============================================================================
-- PARTE 2: v3.0.0 - Perfil Multi-Dimensional do Atleta
-- ============================================================================

ALTER TABLE "athlete_profiles" 
ADD COLUMN IF NOT EXISTS "hasRunBefore" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "currentlyInjured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "avgSleepHours" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "tracksMenstrualCycle" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "avgCycleLength" INTEGER,
ADD COLUMN IF NOT EXISTS "lastPeriodDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "workDemand" TEXT,
ADD COLUMN IF NOT EXISTS "familyDemand" TEXT;

-- Comentários para documentação v3.0.0
COMMENT ON COLUMN "athlete_profiles"."hasRunBefore" IS 'v3.0.0 - Distingue iniciante absoluto (nunca correu) de iniciante com base';
COMMENT ON COLUMN "athlete_profiles"."currentlyInjured" IS 'v3.0.0 - Flag rápido para lesão ativa/recuperação';
COMMENT ON COLUMN "athlete_profiles"."avgSleepHours" IS 'v3.0.0 - Horas médias de sono por noite (ex: 6.5)';
COMMENT ON COLUMN "athlete_profiles"."tracksMenstrualCycle" IS 'v3.0.0 - Tracking ciclo menstrual (women only, opcional)';
COMMENT ON COLUMN "athlete_profiles"."avgCycleLength" IS 'v3.0.0 - Duração média ciclo menstrual em dias';
COMMENT ON COLUMN "athlete_profiles"."lastPeriodDate" IS 'v3.0.0 - Data última menstruação para cálculo fase';
COMMENT ON COLUMN "athlete_profiles"."workDemand" IS 'v3.0.0 - Demanda trabalho: sedentary/moderate/physical';
COMMENT ON COLUMN "athlete_profiles"."familyDemand" IS 'v3.0.0 - Responsabilidades familiares: low/moderate/high';

COMMIT;

-- ============================================================================
-- VERIFICAÇÃO - Execute separadamente após o COMMIT acima
-- ============================================================================

-- Verificar colunas custom_workouts
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'custom_workouts'
  AND column_name IN (
    'warmUpStructure', 'mainWorkoutStruct', 'coolDownStructure',
    'objective', 'scientificBasis', 'tips', 'commonMistakes', 
    'successCriteria', 'intensityLevel', 'expectedRPE', 
    'heartRateZones', 'intervals', 'expectedDuration'
  )
ORDER BY ordinal_position;

-- Verificar colunas athlete_profiles
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'athlete_profiles'
  AND column_name IN (
    'hasRunBefore', 'currentlyInjured', 'avgSleepHours',
    'tracksMenstrualCycle', 'avgCycleLength', 'lastPeriodDate',
    'workDemand', 'familyDemand'
  )
ORDER BY ordinal_position;

-- ============================================================================
-- INSTRUÇÕES DE USO:
-- ============================================================================
-- 1. Acessar: https://console.neon.tech/
-- 2. Selecionar projeto "Athera Run"
-- 3. Clicar em "SQL Editor"
-- 4. Copiar/Colar TODO O BLOCO BEGIN...COMMIT (linhas 10-84)
-- 5. Executar (Run)
-- 6. Verificar output: se retornou sem erro = ✅ SUCESSO
-- 7. Executar SEPARADAMENTE os 2 SELECTs de verificação (linhas 90-114)
-- 8. Confirmar que retornam as colunas esperadas
-- ============================================================================
