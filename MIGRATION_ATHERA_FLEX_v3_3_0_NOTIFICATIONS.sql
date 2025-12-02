-- MIGRATION: Athera Flex v3.3.0 - Notification System
-- Data: 02/DEZ/2025
-- Versão: v3.3.0
-- Descrição: Sistema completo de notificações (Email, Push, In-App)

-- ====================
-- 1. VERIFICAÇÃO PRÉ-MIGRATION
-- ====================

SELECT 'Notification System Migration - Pre-Check' as status;

-- Verificar se tabelas já existem
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'notification_preferences'
) as notification_preferences_exists;

-- ====================
-- 2. NOTIFICATION PREFERENCES
-- ====================

CREATE TABLE IF NOT EXISTS notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Email preferences
  email_enabled BOOLEAN DEFAULT true,
  email_match_found BOOLEAN DEFAULT true,
  email_match_pending BOOLEAN DEFAULT true,
  email_auto_accepted BOOLEAN DEFAULT true,
  email_adjustment_applied BOOLEAN DEFAULT true,
  email_weekly_summary BOOLEAN DEFAULT true,
  email_prediction_insight BOOLEAN DEFAULT false,
  
  -- Push preferences
  push_enabled BOOLEAN DEFAULT true,
  push_match_found BOOLEAN DEFAULT true,
  push_match_pending BOOLEAN DEFAULT true,
  push_auto_accepted BOOLEAN DEFAULT true,
  push_adjustment_applied BOOLEAN DEFAULT false,
  
  -- In-app preferences
  in_app_enabled BOOLEAN DEFAULT true,
  in_app_all BOOLEAN DEFAULT true,
  
  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start VARCHAR(5) DEFAULT '22:00',
  quiet_hours_end VARCHAR(5) DEFAULT '08:00',
  quiet_hours_timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notification_prefs_user ON notification_preferences(user_id);

-- ====================
-- 3. IN-APP NOTIFICATIONS
-- ====================

CREATE TABLE IF NOT EXISTS in_app_notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  variant VARCHAR(20) DEFAULT 'info', -- info, success, warning, error
  
  action_url TEXT,
  action_label VARCHAR(100),
  data JSONB,
  
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_in_app_notif_user ON in_app_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_in_app_notif_read ON in_app_notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_in_app_notif_created ON in_app_notifications(created_at DESC);

-- ====================
-- 4. NOTIFICATION QUEUE
-- ====================

CREATE TABLE IF NOT EXISTS notification_queue (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  channels TEXT[] NOT NULL,
  payload JSONB NOT NULL,
  
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notif_queue_scheduled ON notification_queue(scheduled_for) WHERE NOT processed;
CREATE INDEX IF NOT EXISTS idx_notif_queue_user ON notification_queue(user_id);

-- ====================
-- 5. NOTIFICATION LOG
-- ====================

CREATE TABLE IF NOT EXISTS notification_log (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  channels TEXT[] NOT NULL,
  sent JSONB NOT NULL, -- { email: bool, push: bool, in_app: bool }
  success BOOLEAN NOT NULL,
  payload JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notif_log_user ON notification_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_log_created ON notification_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_log_type ON notification_log(type);

-- ====================
-- 6. USER DEVICES (para push tokens)
-- ====================

CREATE TABLE IF NOT EXISTS user_devices (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  device_type VARCHAR(20) NOT NULL, -- web, ios, android
  device_id VARCHAR(255) NOT NULL,
  push_token TEXT,
  
  user_agent TEXT,
  app_version VARCHAR(20),
  os_version VARCHAR(20),
  
  active BOOLEAN DEFAULT true,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_user_devices_user ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_active ON user_devices(user_id, active);

-- ====================
-- 7. VALIDAÇÃO PÓS-MIGRATION
-- ====================

-- Verificar tabelas criadas
SELECT 
  'notification_preferences' as table_name,
  COUNT(*) as records
FROM notification_preferences
UNION ALL
SELECT 'in_app_notifications', COUNT(*) FROM in_app_notifications
UNION ALL
SELECT 'notification_queue', COUNT(*) FROM notification_queue
UNION ALL
SELECT 'notification_log', COUNT(*) FROM notification_log
UNION ALL
SELECT 'user_devices', COUNT(*) FROM user_devices;

-- Verificar índices
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN (
  'notification_preferences',
  'in_app_notifications',
  'notification_queue',
  'notification_log',
  'user_devices'
)
ORDER BY tablename, indexname;

-- ====================
-- 8. ROLLBACK (SE NECESSÁRIO)
-- ====================

-- DROP TABLE IF EXISTS user_devices CASCADE;
-- DROP TABLE IF EXISTS notification_log CASCADE;
-- DROP TABLE IF EXISTS notification_queue CASCADE;
-- DROP TABLE IF EXISTS in_app_notifications CASCADE;
-- DROP TABLE IF EXISTS notification_preferences CASCADE;

-- ====================
-- 9. POPULAR PREFERÊNCIAS PADRÃO
-- ====================

-- Criar preferências padrão para usuários existentes que tem flex habilitado
INSERT INTO notification_preferences (
  user_id,
  email_enabled,
  email_match_found,
  email_auto_accepted,
  push_enabled,
  push_match_found,
  in_app_enabled
)
SELECT 
  user_id,
  true,
  true,
  true,
  true,
  true,
  true
FROM user_flex_settings
WHERE enabled = true
ON CONFLICT (user_id) DO NOTHING;

SELECT 'Migration completed successfully!' as status;
