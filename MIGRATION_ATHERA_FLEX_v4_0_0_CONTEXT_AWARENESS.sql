-- =====================================================
-- MIGRATION: ATHERA FLEX v4.0.0 - Context Awareness
-- Data: 02/DEZ/2025
-- Versão: v4.0.0
-- Descrição: Adiciona sistema de consciência contextual
-- =====================================================

-- 1. VERIFICAÇÃO PRÉ-MIGRATION (executar ANTES)
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_flex_settings FROM user_flex_settings;
SELECT COUNT(*) as total_workouts FROM custom_workouts;

-- 2. MIGRATION (executar COM CUIDADO)

-- Tabela: Contextos de Usuário
CREATE TABLE IF NOT EXISTS user_contexts (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Weather Awareness
  weather_api_enabled BOOLEAN DEFAULT false,
  avoid_outdoor_rain BOOLEAN DEFAULT true,
  avoid_outdoor_extreme_heat BOOLEAN DEFAULT true,
  temperature_threshold_cold INTEGER DEFAULT 5, -- °C
  temperature_threshold_hot INTEGER DEFAULT 35, -- °C
  
  -- Calendar Integration
  calendar_api_enabled BOOLEAN DEFAULT false,
  calendar_provider VARCHAR(50), -- 'google', 'outlook', 'apple'
  calendar_sync_token TEXT,
  respect_important_events BOOLEAN DEFAULT true,
  
  -- Energy/Recovery Tracking
  track_energy_levels BOOLEAN DEFAULT true,
  track_sleep_quality BOOLEAN DEFAULT true,
  fatigue_threshold INTEGER DEFAULT 70, -- 0-100
  
  -- Recovery Rules
  mandatory_rest_locked BOOLEAN DEFAULT true,
  min_recovery_hours INTEGER DEFAULT 24,
  
  -- Smart Timing
  preferred_workout_time VARCHAR(20), -- 'morning', 'afternoon', 'evening'
  avoid_back_to_back_hard BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id)
);

-- Tabela: Registros de Energia/Fadiga
CREATE TABLE IF NOT EXISTS energy_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  energy_level INTEGER CHECK (energy_level >= 0 AND energy_level <= 100),
  sleep_hours DECIMAL(3,1),
  sleep_quality VARCHAR(20), -- 'poor', 'fair', 'good', 'excellent'
  stress_level INTEGER CHECK (stress_level >= 0 AND stress_level <= 100),
  soreness_level INTEGER CHECK (soreness_level >= 0 AND soreness_level <= 100),
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, date)
);

-- Tabela: Eventos Importantes do Calendário
CREATE TABLE IF NOT EXISTS calendar_events (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  external_id VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  
  is_important BOOLEAN DEFAULT false,
  blocks_workout BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, external_id)
);

-- Tabela: Histórico de Clima
CREATE TABLE IF NOT EXISTS weather_history (
  id SERIAL PRIMARY KEY,
  location VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  
  temperature_celsius DECIMAL(4,1),
  condition VARCHAR(50), -- 'sunny', 'cloudy', 'rainy', 'stormy', 'snowy'
  precipitation_probability INTEGER,
  wind_speed_kmh DECIMAL(4,1),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(location, date)
);

-- Tabela: Decisões Contextuais (Audit Log)
CREATE TABLE IF NOT EXISTS context_decisions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workout_id INTEGER REFERENCES custom_workouts(id) ON DELETE SET NULL,
  
  decision_type VARCHAR(50) NOT NULL, -- 'weather_skip', 'calendar_conflict', 'fatigue_defer', 'recovery_protect'
  original_date DATE NOT NULL,
  suggested_date DATE,
  
  context_data JSONB, -- { weather, calendar, energy, etc }
  was_accepted BOOLEAN,
  user_override_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_energy_logs_user_date ON energy_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_time ON calendar_events(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_weather_history_location_date ON weather_history(location, date DESC);
CREATE INDEX IF NOT EXISTS idx_context_decisions_user_date ON context_decisions(user_id, created_at DESC);

-- Seed inicial para usuários com Flex ativo
INSERT INTO user_contexts (user_id, track_energy_levels, mandatory_rest_locked)
SELECT user_id, true, true
FROM user_flex_settings
WHERE NOT EXISTS (
  SELECT 1 FROM user_contexts WHERE user_contexts.user_id = user_flex_settings.user_id
);

-- 3. VALIDAÇÃO PÓS-MIGRATION (executar APÓS)
SELECT 
  'user_contexts' as table_name,
  COUNT(*) as total_records
FROM user_contexts
UNION ALL
SELECT 
  'energy_logs' as table_name,
  COUNT(*) as total_records
FROM energy_logs
UNION ALL
SELECT 
  'calendar_events' as table_name,
  COUNT(*) as total_records
FROM calendar_events
UNION ALL
SELECT 
  'weather_history' as table_name,
  COUNT(*) as total_records
FROM weather_history
UNION ALL
SELECT 
  'context_decisions' as table_name,
  COUNT(*) as total_records
FROM context_decisions;

-- Verificar estrutura
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_contexts'
ORDER BY ordinal_position;

-- 4. ROLLBACK (se necessário)
/*
DROP INDEX IF EXISTS idx_context_decisions_user_date;
DROP INDEX IF EXISTS idx_weather_history_location_date;
DROP INDEX IF EXISTS idx_calendar_events_user_time;
DROP INDEX IF EXISTS idx_energy_logs_user_date;

DROP TABLE IF EXISTS context_decisions;
DROP TABLE IF EXISTS weather_history;
DROP TABLE IF EXISTS calendar_events;
DROP TABLE IF EXISTS energy_logs;
DROP TABLE IF EXISTS user_contexts;
*/
