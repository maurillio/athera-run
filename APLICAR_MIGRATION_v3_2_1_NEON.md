# 🚀 MIGRATION v3.2.1 - APLICAR NO NEON

## ⚠️ INSTRUÇÕES

1. **Acesse o Neon Console**: https://console.neon.tech
2. **Selecione o database**: atherarun
3. **Abra o SQL Editor**
4. **Cole e execute o SQL abaixo**:

```sql
-- ==========================================
-- MIGRATION v3.2.1 - STRAVA INTEGRATION COMPLETE
-- Data: 2025-11-26
-- ==========================================

-- 1. ADICIONAR CAMPOS AO ATHLETE_PROFILES
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS strava_zones JSONB;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS strava_stats JSONB;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS strava_gear JSONB;

-- 2. ADICIONAR CAMPOS AO STRAVA_GEAR
ALTER TABLE strava_gear ADD COLUMN IF NOT EXISTS converted_distance VARCHAR(50);
ALTER TABLE strava_gear ADD COLUMN IF NOT EXISTS notification_distance FLOAT;

-- 3. ADICIONAR COMENTÁRIOS
COMMENT ON COLUMN athlete_profiles.strava_zones IS 'v3.2.1 - Zonas de frequência cardíaca importadas do Strava';
COMMENT ON COLUMN athlete_profiles.strava_stats IS 'v3.2.1 - Estatísticas de corrida do Strava (recent, ytd, all time)';
COMMENT ON COLUMN athlete_profiles.strava_gear IS 'v3.2.1 - Equipamentos (tênis) cadastrados no Strava';
COMMENT ON COLUMN strava_gear.converted_distance IS 'v3.2.1 - Distância formatada retornada pela API Strava';
COMMENT ON COLUMN strava_gear.notification_distance IS 'v3.2.1 - Quilometragem para alertar sobre troca de equipamento';

-- 4. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_athlete_strava_zones ON athlete_profiles USING GIN (strava_zones);
CREATE INDEX IF NOT EXISTS idx_athlete_strava_stats ON athlete_profiles USING GIN (strava_stats);
CREATE INDEX IF NOT EXISTS idx_athlete_strava_gear ON athlete_profiles USING GIN (strava_gear);

-- 5. VERIFICAÇÃO (execute depois)
SELECT 
  'athlete_profiles' as tabela,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'athlete_profiles' 
  AND column_name IN ('strava_zones', 'strava_stats', 'strava_gear')
UNION ALL
SELECT 
  'strava_gear' as tabela,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'strava_gear' 
  AND column_name IN ('converted_distance', 'notification_distance');
```

## ✅ RESULTADO ESPERADO

Deve retornar 5 linhas confirmando as colunas:

```
tabela             | column_name           | data_type | is_nullable
-------------------|-----------------------|-----------|------------
athlete_profiles   | strava_zones          | jsonb     | YES
athlete_profiles   | strava_stats          | jsonb     | YES
athlete_profiles   | strava_gear           | jsonb     | YES
strava_gear        | converted_distance    | varchar   | YES
strava_gear        | notification_distance | float8    | YES
```

## 🔄 DEPOIS DE APLICAR

Faça deploy no Vercel para aplicar as mudanças em produção.
