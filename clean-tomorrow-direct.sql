-- Limpar treino de amanhã (07/DEZ/2025) marcado incorretamente
-- Data: 06/DEZ/2025 18:50 UTC
-- Versão: v5.0.16

-- 1. Verificar estado atual
SELECT 
    cw.id as custom_workout_id,
    cw.title,
    cw.date,
    cw."isCompleted",
    cw."wasSubstitution",
    cw."executedWorkoutId",
    comp.id as completed_id,
    comp."wasPlanned",
    comp."wasSubstitution" as comp_was_substitution
FROM custom_workouts cw
LEFT JOIN completed_workouts comp ON cw."executedWorkoutId" = comp.id
WHERE cw.date >= '2025-12-07T00:00:00Z' 
  AND cw.date < '2025-12-08T00:00:00Z';

-- 2. Limpar CustomWorkouts de amanhã
UPDATE custom_workouts
SET 
    "isCompleted" = false,
    "wasSubstitution" = false,
    "executedWorkoutId" = NULL
WHERE date >= '2025-12-07T00:00:00Z' 
  AND date < '2025-12-08T00:00:00Z'
  AND ("isCompleted" = true OR "executedWorkoutId" IS NOT NULL);

-- 3. Limpar CompletedWorkouts relacionados (se existirem)
UPDATE completed_workouts
SET 
    "wasPlanned" = false,
    "plannedDate" = NULL,
    "wasSubstitution" = false
WHERE id IN (
    SELECT "executedWorkoutId" 
    FROM custom_workouts 
    WHERE date >= '2025-12-07T00:00:00Z' 
      AND date < '2025-12-08T00:00:00Z'
      AND "executedWorkoutId" IS NOT NULL
);

-- 4. Verificar resultado
SELECT 
    cw.id as custom_workout_id,
    cw.title,
    cw.date,
    cw."isCompleted",
    cw."wasSubstitution",
    cw."executedWorkoutId",
    'LIMPO' as status
FROM custom_workouts cw
WHERE cw.date >= '2025-12-07T00:00:00Z' 
  AND cw.date < '2025-12-08T00:00:00Z';
