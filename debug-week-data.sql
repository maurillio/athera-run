-- Verificar dados da semana atual
SELECT 
  cw.id as custom_workout_id,
  cw.date,
  cw.title,
  cw."isCompleted",
  cw."wasSubstitution",
  cw."executedWorkoutId",
  cw."completedWorkoutId",
  comp.id as completed_id,
  comp.date as completed_date,
  comp.distance as completed_distance,
  comp."wasSubstitution" as completed_wasSubstitution
FROM custom_workouts cw
LEFT JOIN completed_workouts comp ON cw."completedWorkoutId" = comp.id
WHERE cw.date >= NOW() - INTERVAL '7 days'
ORDER BY cw.date;
