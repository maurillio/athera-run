-- Verificar treino de amanhã (07/12/2025)
-- Data de amanhã em UTC
SELECT 
    w.id as workout_id,
    w."dayName",
    w.type,
    w.distance,
    w.pace,
    w.description,
    cw.id as completed_id,
    cw."completedAt",
    cw."isCompleted",
    cw."wasManualMatch",
    cw."wasSubstitution",
    cw."substitutionReason",
    cw."originalWorkoutId",
    cw."userId"
FROM workouts w
LEFT JOIN completed_workouts cw ON w.id = cw."originalWorkoutId"
WHERE w."dayName" = 'Sábado'
  AND w."weekId" = 22
ORDER BY w.id, cw."completedAt" DESC;
