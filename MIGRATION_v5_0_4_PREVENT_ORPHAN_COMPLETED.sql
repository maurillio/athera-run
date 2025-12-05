-- =====================================================
-- MIGRATION: Prevenir isCompleted sem executedWorkoutId
-- Data: 05/12/2025
-- Versão: v5.0.4
-- Autor: Sistema
-- =====================================================

-- Adicionar constraint: isCompleted só pode ser true se executedWorkoutId não for null
ALTER TABLE "CustomWorkout"
ADD CONSTRAINT "chk_completed_has_executed"
CHECK (
  ("isCompleted" = false) OR 
  ("isCompleted" = true AND "executedWorkoutId" IS NOT NULL)
);

-- Validar dados existentes
SELECT 
  COUNT(*) as total_bugs,
  STRING_AGG(id::text, ', ') as bug_ids
FROM "CustomWorkout"
WHERE "isCompleted" = true AND "executedWorkoutId" IS NULL;
