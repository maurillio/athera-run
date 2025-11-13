-- ============================================================================
-- SCRIPT DE VERIFICAÇÃO PÓS-MIGRATION
-- ============================================================================
-- Executar APÓS aplicar APPLY_MIGRATIONS_NEON.sql
-- Valida que tudo foi aplicado corretamente
-- ============================================================================

-- ============================================================================
-- 1. VERIFICAÇÃO DE ESTRUTURA
-- ============================================================================

-- 1.1 Verificar todas as colunas de custom_workouts (v2.0.0)
SELECT 
  '✅ custom_workouts' AS tabela,
  column_name, 
  data_type,
  CASE 
    WHEN is_nullable = 'YES' THEN '✓ Nullable'
    ELSE '✗ Not Null'
  END AS nullable_status,
  COALESCE(column_default, 'Sem default') AS default_value
FROM information_schema.columns
WHERE table_name = 'custom_workouts'
  AND column_name IN (
    'warmUpStructure', 'mainWorkoutStruct', 'coolDownStructure',
    'objective', 'scientificBasis', 'tips', 'commonMistakes', 
    'successCriteria', 'intensityLevel', 'expectedRPE', 
    'heartRateZones', 'intervals', 'expectedDuration'
  )
ORDER BY ordinal_position;

-- Resultado esperado: 13 linhas

-- 1.2 Verificar todas as colunas de athlete_profiles (v3.0.0)
SELECT 
  '✅ athlete_profiles' AS tabela,
  column_name, 
  data_type,
  CASE 
    WHEN is_nullable = 'YES' THEN '✓ Nullable'
    ELSE '✗ Not Null'
  END AS nullable_status,
  COALESCE(column_default, 'Sem default') AS default_value
FROM information_schema.columns
WHERE table_name = 'athlete_profiles'
  AND column_name IN (
    'hasRunBefore', 'currentlyInjured', 'avgSleepHours',
    'tracksMenstrualCycle', 'avgCycleLength', 'lastPeriodDate',
    'workDemand', 'familyDemand'
  )
ORDER BY ordinal_position;

-- Resultado esperado: 8 linhas

-- ============================================================================
-- 2. VERIFICAÇÃO DE ÍNDICES
-- ============================================================================

SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'custom_workouts'
  AND indexname IN (
    'custom_workouts_intensity_idx',
    'custom_workouts_type_idx',
    'custom_workouts_date_idx'
  )
ORDER BY indexname;

-- Resultado esperado: 3 índices

-- ============================================================================
-- 3. VERIFICAÇÃO DE DADOS EXISTENTES (não deve quebrar)
-- ============================================================================

-- 3.1 Contar workouts existentes
SELECT 
  '📊 Workouts Existentes' AS metrica,
  COUNT(*) AS total,
  COUNT(CASE WHEN "warmUpStructure" IS NOT NULL THEN 1 END) AS com_estrutura_v2,
  COUNT(CASE WHEN "objective" IS NOT NULL THEN 1 END) AS com_objetivo
FROM custom_workouts;

-- 3.2 Contar perfis existentes
SELECT 
  '📊 Perfis Existentes' AS metrica,
  COUNT(*) AS total,
  COUNT(CASE WHEN "hasRunBefore" = true THEN 1 END) AS ja_correram,
  COUNT(CASE WHEN "hasRunBefore" = false THEN 1 END) AS nunca_correram,
  COUNT(CASE WHEN "currentlyInjured" = true THEN 1 END) AS lesionados,
  COUNT(CASE WHEN "avgSleepHours" IS NOT NULL THEN 1 END) AS com_info_sono
FROM athlete_profiles;

-- ============================================================================
-- 4. TESTE DE INSERÇÃO (OPCIONAL - não executar em produção se não necessário)
-- ============================================================================

-- 4.1 Teste de inserção em athlete_profiles
-- Descomentar apenas se quiser validar inserção
/*
INSERT INTO athlete_profiles (
  "userId", 
  weight, 
  height, 
  "runningLevel",
  "hasRunBefore",
  "currentlyInjured",
  "avgSleepHours"
)
VALUES (
  'test_migration_v3',
  70.0,
  175.0,
  'beginner',
  false,  -- Nunca correu
  false,  -- Sem lesão
  7.5     -- 7.5h de sono
)
RETURNING id, "userId", "hasRunBefore", "avgSleepHours";
*/

-- 4.2 Limpar teste (se executou o insert acima)
-- DELETE FROM athlete_profiles WHERE "userId" = 'test_migration_v3';

-- ============================================================================
-- 5. RESUMO FINAL
-- ============================================================================

SELECT 
  'RESUMO VALIDAÇÃO' AS status,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = 'custom_workouts' 
   AND column_name IN ('warmUpStructure', 'mainWorkoutStruct', 'coolDownStructure',
                       'objective', 'scientificBasis', 'tips', 'commonMistakes', 
                       'successCriteria', 'intensityLevel', 'expectedRPE', 
                       'heartRateZones', 'intervals', 'expectedDuration')
  ) AS colunas_v2_ok,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = 'athlete_profiles' 
   AND column_name IN ('hasRunBefore', 'currentlyInjured', 'avgSleepHours',
                       'tracksMenstrualCycle', 'avgCycleLength', 'lastPeriodDate',
                       'workDemand', 'familyDemand')
  ) AS colunas_v3_ok,
  (SELECT COUNT(*) FROM pg_indexes 
   WHERE tablename = 'custom_workouts'
   AND indexname IN ('custom_workouts_intensity_idx', 'custom_workouts_type_idx', 'custom_workouts_date_idx')
  ) AS indices_ok;

-- ============================================================================
-- RESULTADO ESPERADO DO RESUMO:
-- ============================================================================
-- | status             | colunas_v2_ok | colunas_v3_ok | indices_ok |
-- |--------------------|---------------|---------------|------------|
-- | RESUMO VALIDAÇÃO   | 13            | 8             | 3          |
-- ============================================================================

-- ✅ Se o resumo mostrar 13, 8, 3 = MIGRATION 100% SUCESSO!
-- ❌ Se algum número diferente = Revisar passos anteriores
