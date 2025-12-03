-- MIGRATION: Adicionar Campos de Localização
-- Data: 03/12/2025
-- Versão: v4.0.0
-- Descrição: Adiciona campos de localização automática ao AthleteProfile para Weather Widget

-- =============================================
-- 1. VERIFICAÇÃO PRÉ-MIGRATION
-- =============================================
SELECT COUNT(*) as total_profiles FROM athlete_profiles;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'athlete_profiles' AND column_name IN ('city', 'latitude', 'longitude', 'lastLocationUpdate');

-- =============================================
-- 2. MIGRATION
-- =============================================

-- Adicionar campos de localização
ALTER TABLE athlete_profiles 
  ADD COLUMN IF NOT EXISTS city VARCHAR(255),
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "lastLocationUpdate" TIMESTAMP(3);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_city ON athlete_profiles(city);
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_location ON athlete_profiles(latitude, longitude);

-- =============================================
-- 3. VALIDAÇÃO PÓS-MIGRATION
-- =============================================
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'athlete_profiles' 
  AND column_name IN ('city', 'latitude', 'longitude', 'lastLocationUpdate');

SELECT COUNT(*) as profiles_with_city FROM athlete_profiles WHERE city IS NOT NULL;

-- =============================================
-- 4. ROLLBACK (se necessário)
-- =============================================
/*
ALTER TABLE athlete_profiles 
  DROP COLUMN IF EXISTS city,
  DROP COLUMN IF EXISTS latitude,
  DROP COLUMN IF EXISTS longitude,
  DROP COLUMN IF EXISTS "lastLocationUpdate";

DROP INDEX IF EXISTS idx_athlete_profiles_city;
DROP INDEX IF EXISTS idx_athlete_profiles_location;
*/
