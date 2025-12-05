-- =====================================================
-- MIGRATION: Constraint isCompleted Validation
-- Data: 05/12/2025
-- Versão: v5.0.4
-- Autor: Sistema
-- =====================================================

-- Adicionar constraint: isCompleted só pode ser true SE executedWorkoutId não for null
ALTER TABLE custom_workouts
ADD CONSTRAINT check_completed_has_executed
CHECK (
  (is_completed = false) OR 
  (is_completed = true AND executed_workout_id IS NOT NULL)
);

-- Validação
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_completed = true AND executed_workout_id IS NOT NULL) as completed_with_executed,
  COUNT(*) FILTER (WHERE is_completed = true AND executed_workout_id IS NULL) as completed_without_executed
FROM custom_workouts;
