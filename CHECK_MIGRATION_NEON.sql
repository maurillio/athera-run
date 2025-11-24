-- ✅ QUERY COMPLETA DE VERIFICAÇÃO - Migration v3.1.0
-- Execute no Neon SQL Editor: https://console.neon.tech
-- Deve retornar resultados em todas as seções se migration funcionou

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1️⃣  VERIFICAR SE MIGRATION FOI APLICADA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT 
    '✅ MIGRATION APLICADA' as status,
    migration_name,
    finished_at,
    applied_steps_count
FROM _prisma_migrations
WHERE migration_name = '20251124_convergence_v3_1_0';

-- Resultado esperado: 1 linha com status 'applied'


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2️⃣  VERIFICAR CAMPOS DEPRECATED (deve retornar 7 linhas)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT 
    c.column_name as campo,
    pgd.description as status
FROM pg_catalog.pg_statio_all_tables as st
INNER JOIN pg_catalog.pg_description pgd ON (pgd.objoid = st.relid)
INNER JOIN information_schema.columns c ON (
    pgd.objsubid = c.ordinal_position AND
    c.table_schema = st.schemaname AND
    c.table_name = st.relname
)
WHERE pgd.description LIKE '%DEPRECATED%'
  AND c.table_name = 'athlete_profiles'
ORDER BY c.column_name;

-- Resultado esperado: 7 campos
-- goalDistance, targetRaceDate, targetTime, injuries, injuryHistory, 
-- weeklyAvailability, trainingActivities


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3️⃣  VERIFICAR ÍNDICES CRIADOS (deve retornar 4 linhas)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT 
    indexname as indice,
    tablename as tabela
FROM pg_indexes
WHERE tablename IN ('athlete_profiles', 'race_goals')
  AND indexname LIKE 'idx_%'
ORDER BY indexname;

-- Resultado esperado: 4 índices
-- idx_athlete_vdot, idx_race_date, 
-- idx_race_goals_distance, idx_race_goals_status_priority


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4️⃣  VERIFICAR DADOS MIGRADOS PARA RACE_GOALS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT 
    COUNT(*) as total_migrados,
    COUNT(CASE WHEN "isPrimary" = true THEN 1 END) as primarios
FROM race_goals
WHERE "autoClassified" = true;

-- Resultado esperado: Número de race goals migrados de AthleteProfile


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5️⃣  RESUMO COMPLETO (1 query única para tudo)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WITH migration_check AS (
    SELECT 
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM _prisma_migrations 
                WHERE migration_name = '20251124_convergence_v3_1_0'
            ) THEN '✅'
            ELSE '❌'
        END as migration_aplicada
),
deprecated_check AS (
    SELECT COUNT(*) as campos_deprecated
    FROM pg_catalog.pg_statio_all_tables as st
    INNER JOIN pg_catalog.pg_description pgd ON (pgd.objoid = st.relid)
    INNER JOIN information_schema.columns c ON (
        pgd.objsubid = c.ordinal_position AND
        c.table_schema = st.schemaname AND
        c.table_name = st.relname
    )
    WHERE pgd.description LIKE '%DEPRECATED%'
      AND c.table_name = 'athlete_profiles'
),
index_check AS (
    SELECT COUNT(*) as indices_criados
    FROM pg_indexes
    WHERE tablename IN ('athlete_profiles', 'race_goals')
      AND indexname LIKE 'idx_%'
),
racegoal_check AS (
    SELECT COUNT(*) as goals_migrados
    FROM race_goals
    WHERE "autoClassified" = true
)
SELECT 
    mc.migration_aplicada,
    dc.campos_deprecated || ' / 7 esperados' as deprecated,
    ic.indices_criados || ' / 4 esperados' as indices,
    rc.goals_migrados || ' migrados' as race_goals,
    CASE 
        WHEN mc.migration_aplicada = '✅' 
         AND dc.campos_deprecated = 7
         AND ic.indices_criados = 4
        THEN '✅ TUDO OK!'
        ELSE '⚠️ Verificar detalhes'
    END as resultado_final
FROM migration_check mc, deprecated_check dc, index_check ic, racegoal_check rc;

-- Resultado esperado:
-- migration_aplicada | deprecated | indices | race_goals | resultado_final
-- ✅                 | 7 / 7      | 4 / 4   | X migrados | ✅ TUDO OK!
