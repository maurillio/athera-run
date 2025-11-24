-- v3.2.1 - Adicionar campos de zonas e perfil Strava
-- Data: 2025-11-24

-- Adicionar campos ao AthleteProfile
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS strava_zones JSONB;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS strava_profile_data JSONB;

-- Adicionar campos ao StravaGear
ALTER TABLE strava_gear ADD COLUMN IF NOT EXISTS converted_distance VARCHAR(50);
ALTER TABLE strava_gear ADD COLUMN IF NOT EXISTS notification_distance FLOAT;

-- Comentários
COMMENT ON COLUMN athlete_profiles.strava_zones IS 'Zonas de frequência cardíaca do Strava';
COMMENT ON COLUMN athlete_profiles.strava_profile_data IS 'Dados do perfil do atleta (peso, sexo, cidade, FTP, etc)';
COMMENT ON COLUMN strava_gear.converted_distance IS 'Distância formatada retornada pelo Strava';
COMMENT ON COLUMN strava_gear.notification_distance IS 'KM para alertar troca de equipamento';
