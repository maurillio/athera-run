-- Buscar user
SELECT id, email FROM "User" WHERE email = 'mmaurillio2@gmail.com';

-- Treinos completados últimos 7 dias
SELECT 
  date,
  type,
  distance,
  title,
  "isCompleted"
FROM "CompletedWorkout"
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'mmaurillio2@gmail.com')
  AND date >= NOW() - INTERVAL '7 days'
ORDER BY date DESC;

-- Treinos planejados últimos 7 dias
SELECT 
  pw.date,
  pw.type,
  pw.distance,
  pw.title,
  pw."isCompleted",
  pw.id as workout_id
FROM "PlannedWorkout" pw
JOIN "CustomTrainingPlan" ctp ON pw."customTrainingPlanId" = ctp.id
JOIN "AthleteProfile" ap ON ctp."athleteProfileId" = ap.id
WHERE ap."userId" = (SELECT id FROM "User" WHERE email = 'mmaurillio2@gmail.com')
  AND pw.date >= NOW() - INTERVAL '7 days'
ORDER BY pw.date ASC;
