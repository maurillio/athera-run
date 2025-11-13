-- ============================================================================
-- MIGRAÇÃO SEGURA v3.0.1 - Aplicar via Neon SQL Editor
-- ============================================================================
-- Data: 13/NOV/2025
-- Objetivo: Adicionar APENAS campos v3.0.0 que faltam
-- Nota: custom_workouts já tem campos v2.0.0 no schema Prisma
-- ============================================================================

-- IMPORTANTE: Campos v2.0.0 em custom_workouts JÁ EXISTEM no schema.prisma
-- mas podem não existir no banco. Vamos adicionar COM SEGURANÇA

-- PARTE 1: custom_workouts - Adicionar campos v2.0.0 SE NÃO EXISTIREM
-- ============================================================================

DO $$
BEGIN
    -- v2.0.0 - Estrutura Detalhada
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'custom_workouts' AND column_name = 'warmUpStructure'
    ) THEN
        ALTER TABLE custom_workouts ADD COLUMN "warmUpStructure" JSONB;
        RAISE NOTICE 'Coluna warmUpStructure adicionada';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'custom_workouts' AND column_name = 'mainWorkoutStruct'
    ) THEN
        ALTER TABLE custom_workouts ADD COLUMN "mainWorkoutStruct" JSONB;
        RAISE NOTICE 'Coluna mainWorkoutStruct adicionada';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'custom_workouts' AND column_name = 'coolDownStructure'
    ) THEN
        ALTER TABLE custom_workouts ADD COLUMN "coolDownStructure" JSONB;
        RAISE NOTICE 'Coluna coolDownStructure adicionada';
    END IF;

    -- v2.0.0 - Enriquecimento Educacional
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'custom_workouts' AND column_name = 'objective'
    ) THEN
        ALTER TABLE custom_workouts ADD COLUMN "objective" TEXT;
        RAISE NOTICE 'Coluna objective adicionada';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'custom_workouts' AND column_name = 'scientificBasis'
    ) THEN
        ALTER TABLE custom_workouts ADD COLUMN "scientificBasis" TEXT;
        RAISE NOTICE 'Coluna scientificBasis adicionada';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'custom_workouts' AND column_name = 'tips'
    ) THEN
        ALTER TABLE custom_workouts ADD COLUMN "tips" JSONB;
        RAISE NOTICE 'Coluna tips adicionada';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'custom_workouts' AND column_name = 'commonMistakes'
    ) THEN
        ALTER TABLE custom_workouts ADD COLUMN "commonMistakes" JSONB;
        RAISE NOTICE 'Coluna commonMistakes adicionada';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'custom_workouts' AND column_name = 'successCriteria'
    ) THEN
        ALTER TABLE custom_workouts ADD COLUMN "successCriteria" JSONB;
        RAISE NOTICE 'Coluna successCriteria adicionada';
    END IF;

    -- v2.0.0 - Métricas Avançadas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'custom_workouts' AND column_name = 'intensityLevel'
    ) THEN
        ALTER TABLE custom_workouts ADD COLUMN "intensityLevel" INTEGER CHECK ("intensityLevel" >= 1 AND "intensityLevel" <= 5);
        RAISE NOTICE 'Coluna intensityLevel adicionada';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'custom_workouts' AND column_name = 'expectedRPE'
    ) THEN
        ALTER TABLE custom_workouts ADD COLUMN "expectedRPE" INTEGER CHECK ("expectedRPE" >= 1 AND "expectedRPE" <= 10);
        RAISE NOTICE 'Coluna expectedRPE adicionada';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'custom_workouts' AND column_name = 'heartRateZones'
    ) THEN
        ALTER TABLE custom_workouts ADD COLUMN "heartRateZones" JSONB;
        RAISE NOTICE 'Coluna heartRateZones adicionada';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'custom_workouts' AND column_name = 'intervals'
    ) THEN
        ALTER TABLE custom_workouts ADD COLUMN "intervals" JSONB;
        RAISE NOTICE 'Coluna intervals adicionada';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'custom_workouts' AND column_name = 'expectedDuration'
    ) THEN
        ALTER TABLE custom_workouts ADD COLUMN "expectedDuration" INTEGER;
        RAISE NOTICE 'Coluna expectedDuration adicionada';
    END IF;
END $$;

-- PARTE 2: athlete_profiles - Campos v3.0.0
-- ============================================================================

DO $$
BEGIN
    -- v3.0.0 - Profile Multi-Dimensional
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'athlete_profiles' AND column_name = 'hasRunBefore'
    ) THEN
        ALTER TABLE athlete_profiles ADD COLUMN "hasRunBefore" BOOLEAN DEFAULT true;
        RAISE NOTICE 'Coluna hasRunBefore adicionada';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'athlete_profiles' AND column_name = 'currentlyInjured'
    ) THEN
        ALTER TABLE athlete_profiles ADD COLUMN "currentlyInjured" BOOLEAN DEFAULT false;
        RAISE NOTICE 'Coluna currentlyInjured adicionada';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'athlete_profiles' AND column_name = 'avgSleepHours'
    ) THEN
        ALTER TABLE athlete_profiles ADD COLUMN "avgSleepHours" DOUBLE PRECISION;
        RAISE NOTICE 'Coluna avgSleepHours adicionada';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'athlete_profiles' AND column_name = 'tracksMenstrualCycle'
    ) THEN
        ALTER TABLE athlete_profiles ADD COLUMN "tracksMenstrualCycle" BOOLEAN DEFAULT false;
        RAISE NOTICE 'Coluna tracksMenstrualCycle adicionada';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'athlete_profiles' AND column_name = 'avgCycleLength'
    ) THEN
        ALTER TABLE athlete_profiles ADD COLUMN "avgCycleLength" INTEGER;
        RAISE NOTICE 'Coluna avgCycleLength adicionada';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'athlete_profiles' AND column_name = 'lastPeriodDate'
    ) THEN
        ALTER TABLE athlete_profiles ADD COLUMN "lastPeriodDate" TIMESTAMP;
        RAISE NOTICE 'Coluna lastPeriodDate adicionada';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'athlete_profiles' AND column_name = 'workDemand'
    ) THEN
        ALTER TABLE athlete_profiles ADD COLUMN "workDemand" TEXT;
        RAISE NOTICE 'Coluna workDemand adicionada';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'athlete_profiles' AND column_name = 'familyDemand'
    ) THEN
        ALTER TABLE athlete_profiles ADD COLUMN "familyDemand" TEXT;
        RAISE NOTICE 'Coluna familyDemand adicionada';
    END IF;
END $$;

-- PARTE 3: Criar índices para melhor performance (SE NÃO EXISTIREM)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'custom_workouts_intensity_idx'
    ) THEN
        CREATE INDEX "custom_workouts_intensity_idx" ON custom_workouts("intensityLevel");
        RAISE NOTICE 'Índice custom_workouts_intensity_idx criado';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'custom_workouts_type_idx'
    ) THEN
        CREATE INDEX "custom_workouts_type_idx" ON custom_workouts("type");
        RAISE NOTICE 'Índice custom_workouts_type_idx criado';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'custom_workouts_date_idx'
    ) THEN
        CREATE INDEX "custom_workouts_date_idx" ON custom_workouts("date");
        RAISE NOTICE 'Índice custom_workouts_date_idx criado';
    END IF;
END $$;

-- PARTE 4: Verificação Final
-- ============================================================================

-- Verificar custom_workouts
SELECT 
    'custom_workouts' as tabela,
    column_name,
    data_type,
    is_nullable
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

-- Verificar athlete_profiles
SELECT 
    'athlete_profiles' as tabela,
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

-- ============================================================================
-- ✅ FIM DA MIGRAÇÃO - Verificar se as 2 queries SELECT retornam linhas
-- ============================================================================
