-- ==========================================
-- MIGRATION v3.2.1 - STRAVA INTEGRATION COMPLETE
-- Data: 2025-11-24
-- Descrição: Adiciona campos faltantes para importação completa Strava
-- ==========================================

-- 1. ADICIONAR CAMPOS AO ATHLETE_PROFILES
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS strava_zones JSONB;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS strava_profile_data JSONB;

-- 2. ADICIONAR CAMPOS AO STRAVA_GEAR
ALTER TABLE strava_gear ADD COLUMN IF NOT EXISTS converted_distance VARCHAR(50);
ALTER TABLE strava_gear ADD COLUMN IF NOT EXISTS notification_distance FLOAT;

-- 3. ADICIONAR COMENTÁRIOS
COMMENT ON COLUMN athlete_profiles.strava_zones IS 'v3.2.1 - Zonas de frequência cardíaca importadas do Strava';
COMMENT ON COLUMN athlete_profiles.strava_profile_data IS 'v3.2.1 - Dados completos do perfil Strava (peso, sexo, cidade, FTP, premium, etc)';
COMMENT ON COLUMN strava_gear.converted_distance IS 'v3.2.1 - Distância formatada retornada pela API Strava';
COMMENT ON COLUMN strava_gear.notification_distance IS 'v3.2.1 - Quilometragem para alertar sobre troca de equipamento';

-- 4. VERIFICAÇÃO
SELECT 
  'athlete_profiles' as tabela,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'athlete_profiles' 
  AND column_name IN ('strava_zones', 'strava_profile_data')
UNION ALL
SELECT 
  'strava_gear' as tabela,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'strava_gear' 
  AND column_name IN ('converted_distance', 'notification_distance');

