-- Verificar quais tabelas do Strava Enhancement existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'strava_%'
ORDER BY table_name;
