-- ============================================================================
-- MIGRATION: ATHERA FLEX v3.3.0 - Sistema Inteligente de Flexibilidade
-- Data: 02/DEZ/2025 13:40 UTC
-- Descrição: Adiciona sistema completo de detecção e ajuste inteligente de treinos
-- ============================================================================

-- 1. VERIFICAÇÃO PRÉ-MIGRATION (executar ANTES)
-- ============================================================================
SELECT 'PRE-CHECK: Verificando estrutura atual' as step;

SELECT COUNT(*) as total_custom_workouts FROM custom_workouts;
SELECT COUNT(*) as total_completed_workouts FROM completed_workouts;
SELECT COUNT(*) as total_users FROM users;

-- 2. BACKUP RECOMENDADO (executar ANTES)
-- ============================================================================
-- IMPORTANTE: Fazer backup antes de aplicar migration
-- No Neon Console: Settings > Backups > Create Backup

-- 3. MIGRATION - PARTE 1: Adicionar campos em CustomWorkout
-- ============================================================================
SELECT 'STEP 1: Adicionando campos de flexibilidade em CustomWorkout' as step;

ALTER TABLE custom_workouts 
ADD COLUMN IF NOT EXISTS is_flexible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS flexibility_window INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS can_substitute BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS min_volume_percent INTEGER DEFAULT 70,
ADD COLUMN IF NOT EXISTS max_volume_percent INTEGER DEFAULT 150,
ADD COLUMN IF NOT EXISTS was_rescheduled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS original_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rescheduled_by VARCHAR(50),
ADD COLUMN IF NOT EXISTS rescheduled_reason TEXT,
ADD COLUMN IF NOT EXISTS executed_workout_id INTEGER UNIQUE;

-- 4. MIGRATION - PARTE 2: Adicionar campos em CompletedWorkout
-- ============================================================================
SELECT 'STEP 2: Adicionando contexto de execução em CompletedWorkout' as step;

ALTER TABLE completed_workouts
ADD COLUMN IF NOT EXISTS was_planned BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS planned_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS was_substitution BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS substituted_workout_id INTEGER,
ADD COLUMN IF NOT EXISTS volume_variance DOUBLE PRECISION;

-- 5. MIGRATION - PARTE 3: Criar tabela WorkoutAdjustment
-- ============================================================================
SELECT 'STEP 3: Criando tabela de histórico de ajustes' as step;

CREATE TABLE IF NOT EXISTS workout_adjustments (
  id SERIAL PRIMARY KEY,
  workout_id INTEGER NOT NULL,
  adjustment_type VARCHAR(50) NOT NULL, -- 'reschedule' | 'substitute' | 'modify' | 'mark_done'
  original_date TIMESTAMP WITH TIME ZONE NOT NULL,
  new_date TIMESTAMP WITH TIME ZONE,
  original_distance DOUBLE PRECISION,
  new_distance DOUBLE PRECISION,
  triggered_by VARCHAR(50) NOT NULL, -- 'athlete_manual' | 'ai_suggestion' | 'ai_auto' | 'coach'
  reason TEXT,
  confidence DOUBLE PRECISION, -- Score 0-100 do match
  auto_applied BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  undone_at TIMESTAMP WITH TIME ZONE,
  undo_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_workout
    FOREIGN KEY (workout_id) 
    REFERENCES custom_workouts(id)
    ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_workout_adjustments_workout_id ON workout_adjustments(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_adjustments_created_at ON workout_adjustments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_adjustments_adjustment_type ON workout_adjustments(adjustment_type);

-- 6. MIGRATION - PARTE 4: Criar tabela UserFlexSettings (Premium)
-- ============================================================================
SELECT 'STEP 4: Criando tabela de configurações de flexibilidade' as step;

CREATE TABLE IF NOT EXISTS user_flex_settings (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  
  -- Configurações de automação
  auto_adjust_enabled BOOLEAN DEFAULT false,
  auto_adjust_threshold INTEGER DEFAULT 90, -- Confidence mínimo para auto-aplicar
  notify_before_adjust BOOLEAN DEFAULT true,
  
  -- Notificações
  email_on_auto_adjust BOOLEAN DEFAULT true,
  email_on_suggestion BOOLEAN DEFAULT true,
  in_app_notifications BOOLEAN DEFAULT true,
  
  -- Preferências de flexibilidade
  flexibility_window INTEGER DEFAULT 3, -- Janela padrão de ±N dias
  allow_volume_increase BOOLEAN DEFAULT true, -- Permite treinos com + volume
  allow_volume_decrease BOOLEAN DEFAULT true, -- Permite treinos com - volume
  max_volume_variance INTEGER DEFAULT 50, -- % máximo de variação
  
  -- Configurações avançadas
  prefer_same_day BOOLEAN DEFAULT false, -- Prioriza sugestões no mesmo dia
  auto_accept_high_confidence BOOLEAN DEFAULT false, -- Auto-aceita >= 95%
  learning_mode BOOLEAN DEFAULT true, -- Sistema aprende com decisões
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user
    FOREIGN KEY (user_id) 
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_user_flex_settings_user_id ON user_flex_settings(user_id);

-- 7. MIGRATION - PARTE 5: Criar tabela de histórico de decisões (ML)
-- ============================================================================
SELECT 'STEP 5: Criando tabela de aprendizado de máquina' as step;

CREATE TABLE IF NOT EXISTS workout_match_decisions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  completed_workout_id INTEGER NOT NULL,
  suggested_workout_id INTEGER NOT NULL,
  confidence DOUBLE PRECISION NOT NULL,
  
  -- Score details
  date_score DOUBLE PRECISION,
  type_score DOUBLE PRECISION,
  volume_score DOUBLE PRECISION,
  intensity_score DOUBLE PRECISION,
  
  -- Decisão do usuário
  action VARCHAR(50) NOT NULL, -- 'accepted' | 'rejected' | 'modified' | 'ignored'
  action_taken_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Contexto da decisão
  day_of_week INTEGER, -- 0-6 (domingo-sábado)
  week_of_plan INTEGER,
  user_energy_level INTEGER, -- 1-5 se disponível
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user_decision
    FOREIGN KEY (user_id) 
    REFERENCES users(id)
    ON DELETE CASCADE,
    
  CONSTRAINT fk_completed_workout
    FOREIGN KEY (completed_workout_id)
    REFERENCES completed_workouts(id)
    ON DELETE CASCADE,
    
  CONSTRAINT fk_suggested_workout
    FOREIGN KEY (suggested_workout_id)
    REFERENCES custom_workouts(id)
    ON DELETE CASCADE
);

-- Índices para ML queries
CREATE INDEX IF NOT EXISTS idx_match_decisions_user_id ON workout_match_decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_match_decisions_action ON workout_match_decisions(action);
CREATE INDEX IF NOT EXISTS idx_match_decisions_confidence ON workout_match_decisions(confidence);

-- 8. MIGRATION - PARTE 6: Popular configurações padrão
-- ============================================================================
SELECT 'STEP 6: Populando configurações padrão para usuários existentes' as step;

INSERT INTO user_flex_settings (user_id, auto_adjust_enabled, auto_adjust_threshold)
SELECT id, false, 90
FROM users
WHERE id NOT IN (SELECT user_id FROM user_flex_settings)
ON CONFLICT (user_id) DO NOTHING;

-- 9. MIGRATION - PARTE 7: Trigger para auto-update timestamps
-- ============================================================================
SELECT 'STEP 7: Criando triggers para updated_at' as step;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para workout_adjustments
DROP TRIGGER IF EXISTS update_workout_adjustments_updated_at ON workout_adjustments;
CREATE TRIGGER update_workout_adjustments_updated_at
  BEFORE UPDATE ON workout_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para user_flex_settings
DROP TRIGGER IF EXISTS update_user_flex_settings_updated_at ON user_flex_settings;
CREATE TRIGGER update_user_flex_settings_updated_at
  BEFORE UPDATE ON user_flex_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. VALIDAÇÃO PÓS-MIGRATION (executar APÓS)
-- ============================================================================
SELECT 'POST-CHECK: Validando migration' as step;

-- Verificar novos campos em custom_workouts
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'custom_workouts'
  AND column_name IN ('is_flexible', 'flexibility_window', 'was_rescheduled', 'executed_workout_id')
ORDER BY column_name;

-- Verificar novos campos em completed_workouts
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'completed_workouts'
  AND column_name IN ('was_planned', 'planned_date', 'was_substitution', 'volume_variance')
ORDER BY column_name;

-- Verificar novas tabelas criadas
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('workout_adjustments', 'user_flex_settings', 'workout_match_decisions')
ORDER BY table_name;

-- Verificar settings criados
SELECT COUNT(*) as users_with_flex_settings FROM user_flex_settings;
SELECT COUNT(*) as total_users FROM users;

-- Verificar índices criados
SELECT 
  indexname,
  tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND (indexname LIKE '%workout_adjustment%' 
    OR indexname LIKE '%flex_settings%'
    OR indexname LIKE '%match_decision%')
ORDER BY tablename, indexname;

-- 11. ROLLBACK (se necessário - CUIDADO!)
-- ============================================================================
-- ATENÇÃO: Só execute em caso de problemas críticos
-- Backup dos dados antes de fazer rollback

/*
-- Rollback completo (CUIDADO: PERDA DE DADOS!)
DROP TABLE IF EXISTS workout_match_decisions CASCADE;
DROP TABLE IF EXISTS user_flex_settings CASCADE;
DROP TABLE IF EXISTS workout_adjustments CASCADE;

ALTER TABLE custom_workouts
  DROP COLUMN IF EXISTS is_flexible,
  DROP COLUMN IF EXISTS flexibility_window,
  DROP COLUMN IF EXISTS can_substitute,
  DROP COLUMN IF EXISTS min_volume_percent,
  DROP COLUMN IF EXISTS max_volume_percent,
  DROP COLUMN IF EXISTS was_rescheduled,
  DROP COLUMN IF EXISTS original_date,
  DROP COLUMN IF EXISTS rescheduled_by,
  DROP COLUMN IF EXISTS rescheduled_reason,
  DROP COLUMN IF EXISTS executed_workout_id;

ALTER TABLE completed_workouts
  DROP COLUMN IF EXISTS was_planned,
  DROP COLUMN IF EXISTS planned_date,
  DROP COLUMN IF EXISTS was_substitution,
  DROP COLUMN IF EXISTS substituted_workout_id,
  DROP COLUMN IF EXISTS volume_variance;

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
*/

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

SELECT 'MIGRATION COMPLETA! ✅' as status, 
       CURRENT_TIMESTAMP as completed_at;

-- Próximos passos:
-- 1. Atualizar schema.prisma
-- 2. Executar: npx prisma db pull
-- 3. Executar: npx prisma generate
-- 4. Testar APIs
