-- Reset domingo 30/11/2025 que está marcado como concluído incorretamente
-- Data: 05/12/2025

UPDATE custom_workouts
SET 
  "isCompleted" = FALSE,
  "executedWorkoutId" = NULL,
  "wasSubstitution" = FALSE
WHERE 
  date::date = '2025-11-30'
  AND type = 'running'
  AND title LIKE '%Longão%';

-- Verificar resultado
SELECT 
  id,
  title,
  date,
  type,
  "isCompleted",
  "executedWorkoutId",
  "wasSubstitution"
FROM custom_workouts
WHERE date::date = '2025-11-30';
