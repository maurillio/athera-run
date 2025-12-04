-- DEBUG: Verificar executed workouts na semana 29/11 - 05/12

-- 1. Ver custom_workouts do período
SELECT 
  id,
  title,
  date,
  type,
  "isCompleted",
  "completedWorkoutId",
  "executedWorkoutId"
FROM custom_workouts
WHERE date >= '2025-11-29' AND date <= '2025-12-05'
ORDER BY date;

-- 2. Ver completed_workouts do período
SELECT 
  id,
  date,
  distance,
  duration,
  source,
  "plannedWorkoutId"
FROM completed_workouts
WHERE date >= '2025-11-29' AND date <= '2025-12-05'
ORDER BY date;

-- 3. Ver relacionamentos
SELECT 
  cw.date as planned_date,
  cw.title,
  cw."isCompleted",
  cw."completedWorkoutId",
  cw."executedWorkoutId",
  comp.id as completed_id,
  comp.date as completed_date,
  comp.distance
FROM custom_workouts cw
LEFT JOIN completed_workouts comp ON comp.id = cw."executedWorkoutId"
WHERE cw.date >= '2025-11-29' AND cw.date <= '2025-12-05'
ORDER BY cw.date;
