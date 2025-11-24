-- ═══════════════════════════════════════════════════════════════════════════
-- 🔧 MIGRATION MANUAL v3.1.0 - Convergência Total de Dados
-- ═══════════════════════════════════════════════════════════════════════════
-- 
-- ⚠️  IMPORTANTE: Execute no Neon SQL Editor (https://console.neon.tech)
-- 
-- Esta migration:
-- 1. Migra goalDistance, targetRaceDate, targetTime → race_goals
-- 2. Marca 7 campos como DEPRECATED
-- 3. Cria 4 índices de performance
-- 4. Registra migration em _prisma_migrations
--
-- Tempo estimado: ~30 segundos
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PARTE 1: MIGRAR DADOS PARA race_goals
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
  true as "autoClassified",
  'active' as "status",
  true as "isPrimary",
  NOW() as "createdAt",
  NOW() as "updatedAt"
FROM "athlete_profiles" ap
WHERE ap."goalDistance" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "race_goals" rg 
    WHERE rg."athleteId" = ap."id" 
    AND rg."autoClassified" = true
  );

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PARTE 2: MARCAR CAMPOS COMO DEPRECATED
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. goalDistance
COMMENT ON COLUMN "athlete_profiles"."goalDistance" IS 'DEPRECATED v3.1.0 - usar tabela race_goals dedicada';

-- 2. targetRaceDate
COMMENT ON COLUMN "athlete_profiles"."targetRaceDate" IS 'DEPRECATED v3.1.0 - usar tabela race_goals dedicada';

-- 3. targetTime
COMMENT ON COLUMN "athlete_profiles"."targetTime" IS 'DEPRECATED v3.1.0 - usar tabela race_goals dedicada';

-- 4. injuries
COMMENT ON COLUMN "athlete_profiles"."injuries" IS 'DEPRECATED v3.1.0 - usar injuryDetails (suporta múltiplas lesões estruturadas)';

-- 5. injuryHistory
COMMENT ON COLUMN "athlete_profiles"."injuryHistory" IS 'DEPRECATED v3.1.0 - usar injuryDetails (suporta múltiplas lesões estruturadas)';

-- 6. weeklyAvailability
COMMENT ON COLUMN "athlete_profiles"."weeklyAvailability" IS 'DEPRECATED v3.1.0 - usar trainingSchedule (mais completo e estruturado)';

-- 7. trainingActivities
COMMENT ON COLUMN "athlete_profiles"."trainingActivities" IS 'DEPRECATED v3.1.0 - usar trainingSchedule (integrado com disponibilidade)';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PARTE 3: CRIAR ÍNDICES DE PERFORMANCE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. Índice para VDOT (usado em análises de performance)
CREATE INDEX IF NOT EXISTS "idx_athlete_vdot" 
ON "athlete_profiles"("currentVDOT") 
WHERE "currentVDOT" IS NOT NULL;

-- 2. Índice para data da corrida (queries por período)
CREATE INDEX IF NOT EXISTS "idx_race_date" 
ON "race_goals"("raceDate") 
WHERE "raceDate" IS NOT NULL;

-- 3. Índice para distância de corrida (filtros por distância)
CREATE INDEX IF NOT EXISTS "idx_race_goals_distance" 
ON "race_goals"("distance") 
WHERE "distance" IS NOT NULL;

-- 4. Índice composto para status + prioridade (queries de corridas ativas)
CREATE INDEX IF NOT EXISTS "idx_race_goals_status_priority" 
ON "race_goals"("status", "priority") 
WHERE "status" = 'active';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PARTE 4: REGISTRAR MIGRATION NO HISTÓRICO
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSERT INTO "_prisma_migrations" (
  "id",
  "checksum",
  "finished_at",
  "migration_name",
  "logs",
  "rolled_back_at",
  "started_at",
  "applied_steps_count"
) VALUES (
  gen_random_uuid(),
  'manual_v3_1_0_convergence',
  NOW(),
  '20251124_convergence_v3_1_0',
  'Migration aplicada manualmente via SQL Editor - v3.1.0 Convergência Total',
  NULL,
  NOW(),
  1
);

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ MIGRATION CONCLUÍDA!
-- ═══════════════════════════════════════════════════════════════════════════
--
-- O que foi feito:
-- ✅ Dados migrados para race_goals
-- ✅ 7 campos marcados como DEPRECATED
-- ✅ 4 índices criados
-- ✅ Migration registrada em _prisma_migrations
--
-- Próximo passo: Execute a query de verificação:
-- Ver arquivo: CHECK_MIGRATION_NEON.sql (seção 5)
-- ═══════════════════════════════════════════════════════════════════════════
