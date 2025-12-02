-- ============================================================================
-- ATHERA FLEX v3.4.0 - FASE 4: Premium & Analytics
-- Migration: Premium Features + Analytics Cache + Onboarding
-- Data: 02/DEZ/2025
-- ============================================================================

-- ============================================================================
-- PARTE 1: PREMIUM FEATURES
-- ============================================================================

-- 1.1 Adicionar campos Premium em user_flex_settings
ALTER TABLE user_flex_settings 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_since TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'free';

-- 1.2 Índice para queries rápidas de premium
CREATE INDEX IF NOT EXISTS idx_user_flex_premium 
ON user_flex_settings(user_id, is_premium);

-- 1.3 Índice para busca por Stripe customer
CREATE INDEX IF NOT EXISTS idx_user_flex_stripe_customer 
ON user_flex_settings(stripe_customer_id);

-- ============================================================================
-- PARTE 2: ANALYTICS CACHE
-- ============================================================================

-- 2.1 Tabela para cache de analytics (evitar recalcular sempre)
CREATE TABLE IF NOT EXISTS flex_analytics_cache (
  user_id VARCHAR(255) PRIMARY KEY,
  stats JSONB NOT NULL,
  insights JSONB NOT NULL,
  patterns JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 hour',
  CONSTRAINT fk_analytics_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2.2 Índice para limpeza de cache expirado
CREATE INDEX IF NOT EXISTS idx_analytics_cache_expires 
ON flex_analytics_cache(expires_at);

-- 2.3 Índice para validação de cache
CREATE INDEX IF NOT EXISTS idx_analytics_cache_valid 
ON flex_analytics_cache(user_id, expires_at) 
WHERE expires_at > NOW();

-- ============================================================================
-- PARTE 3: ONBOARDING STATE
-- ============================================================================

-- 3.1 Rastrear progresso do onboarding
CREATE TABLE IF NOT EXISTS flex_onboarding_state (
  user_id VARCHAR(255) PRIMARY KEY,
  tutorial_completed BOOLEAN DEFAULT false,
  tutorial_step INTEGER DEFAULT 0,
  first_match_seen BOOLEAN DEFAULT false,
  first_insight_seen BOOLEAN DEFAULT false,
  dashboard_visited BOOLEAN DEFAULT false,
  upgrade_modal_shown BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_onboarding_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3.2 Índice para queries de onboarding
CREATE INDEX IF NOT EXISTS idx_onboarding_completed 
ON flex_onboarding_state(user_id, tutorial_completed);

-- ============================================================================
-- PARTE 4: PREMIUM TRIAL (Opcional - 7 dias grátis)
-- ============================================================================

-- 4.1 Campos para trial period
ALTER TABLE user_flex_settings 
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_used BOOLEAN DEFAULT false;

-- 4.2 Função para verificar se trial está ativo
CREATE OR REPLACE FUNCTION is_trial_active(p_user_id VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_flex_settings
    WHERE user_id = p_user_id
      AND trial_ends_at > NOW()
      AND NOT trial_used
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PARTE 5: ANALYTICS HELPER VIEWS
-- ============================================================================

-- 5.1 View: Estatísticas rápidas por usuário
CREATE OR REPLACE VIEW v_flex_user_stats AS
SELECT 
  wa.workout_id,
  cw.training_plan_id,
  tp.user_id,
  COUNT(*) as total_adjustments,
  SUM(CASE WHEN wa.auto_applied THEN 1 ELSE 0 END) as auto_accepted,
  SUM(CASE WHEN NOT wa.auto_applied THEN 1 ELSE 0 END) as manual_accepted,
  AVG(wa.confidence) as avg_confidence,
  DATE_TRUNC('day', wa.created_at) as adjustment_date
FROM workout_adjustments wa
JOIN custom_workouts cw ON wa.workout_id = cw.id
JOIN training_plans tp ON cw.training_plan_id = tp.id
WHERE wa.approved = true
GROUP BY 
  wa.workout_id,
  cw.training_plan_id,
  tp.user_id,
  DATE_TRUNC('day', wa.created_at);

-- 5.2 View: Padrões de dias da semana
CREATE OR REPLACE VIEW v_flex_day_patterns AS
SELECT 
  tp.user_id,
  EXTRACT(DOW FROM cw.date) as day_of_week,
  COUNT(*) as workout_count,
  ROUND(AVG(cw.distance), 2) as avg_distance
FROM custom_workouts cw
JOIN training_plans tp ON cw.training_plan_id = tp.id
WHERE cw.is_completed = true
  AND cw.executed_workout_id IS NOT NULL
GROUP BY tp.user_id, EXTRACT(DOW FROM cw.date);

-- ============================================================================
-- VALIDAÇÃO PÓS-MIGRATION
-- ============================================================================

-- Verificar tabelas criadas
SELECT 'Tables created:' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('flex_analytics_cache', 'flex_onboarding_state');

-- Verificar colunas adicionadas em user_flex_settings
SELECT 'Columns in user_flex_settings:' as status;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_flex_settings'
  AND column_name IN ('is_premium', 'premium_since', 'stripe_customer_id', 
                      'stripe_subscription_id', 'subscription_status',
                      'trial_started_at', 'trial_ends_at', 'trial_used')
ORDER BY column_name;

-- Verificar índices criados
SELECT 'Indexes created:' as status;
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%flex%';

-- Verificar views criadas
SELECT 'Views created:' as status;
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name LIKE 'v_flex%';

-- ============================================================================
-- ROLLBACK (se necessário)
-- ============================================================================

/*
-- ATENÇÃO: Executar apenas se precisar reverter!

-- Dropar views
DROP VIEW IF EXISTS v_flex_day_patterns;
DROP VIEW IF EXISTS v_flex_user_stats;

-- Dropar função
DROP FUNCTION IF EXISTS is_trial_active(VARCHAR);

-- Dropar tabelas
DROP TABLE IF EXISTS flex_onboarding_state;
DROP TABLE IF EXISTS flex_analytics_cache;

-- Remover colunas de user_flex_settings
ALTER TABLE user_flex_settings 
DROP COLUMN IF EXISTS is_premium,
DROP COLUMN IF EXISTS premium_since,
DROP COLUMN IF EXISTS stripe_customer_id,
DROP COLUMN IF EXISTS stripe_subscription_id,
DROP COLUMN IF EXISTS subscription_status,
DROP COLUMN IF EXISTS trial_started_at,
DROP COLUMN IF EXISTS trial_ends_at,
DROP COLUMN IF EXISTS trial_used;
*/

-- ============================================================================
-- FIM DA MIGRATION v3.4.0
-- ============================================================================

SELECT 'Migration v3.4.0 completed successfully!' as status;
