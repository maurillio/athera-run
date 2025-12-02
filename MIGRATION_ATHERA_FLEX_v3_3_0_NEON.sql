-- ============================================================================
-- MIGRATION: ATHERA FLEX v3.3.0 - Sistema Inteligente de Flexibilidade
-- Data: 02/DEZ/2025 13:40 UTC
-- VERSÃO LIMPA (SEM SELECTS) - Para Neon Console
-- ============================================================================

-- PARTE 1: Adicionar campos em CustomWorkout
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

-- PARTE 2: Adicionar campos em CompletedWorkout
ALTER TABLE completed_workouts
ADD COLUMN IF NOT EXISTS was_planned BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS planned_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS was_substitution BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS substituted_workout_id INTEGER,
ADD COLUMN IF NOT EXISTS volume_variance DOUBLE PRECISION;

-- PARTE 3: Criar tabela WorkoutAdjustment
CREATE TABLE IF NOT EXISTS workout_adjustments (
  id SERIAL PRIMARY KEY,
  workout_id INTEGER NOT NULL,
  adjustment_type VARCHAR(50) NOT NULL,
  original_date TIMESTAMP WITH TIME ZONE NOT NULL,
  new_date TIMESTAMP WITH TIME ZONE,
  original_distance DOUBLE PRECISION,
  new_distance DOUBLE PRECISION,
  triggered_by VARCHAR(50) NOT NULL,
  reason TEXT,
  confidence DOUBLE PRECISION,
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

CREATE INDEX IF NOT EXISTS idx_workout_adjustments_workout_id ON workout_adjustments(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_adjustments_created_at ON workout_adjustments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_adjustments_adjustment_type ON workout_adjustments(adjustment_type);

-- PARTE 4: Criar tabela UserFlexSettings
CREATE TABLE IF NOT EXISTS user_flex_settings (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  auto_adjust_enabled BOOLEAN DEFAULT false,
  auto_adjust_threshold INTEGER DEFAULT 90,
  notify_before_adjust BOOLEAN DEFAULT true,
  email_on_auto_adjust BOOLEAN DEFAULT true,
  email_on_suggestion BOOLEAN DEFAULT true,
  in_app_notifications BOOLEAN DEFAULT true,
  flexibility_window INTEGER DEFAULT 3,
  allow_volume_increase BOOLEAN DEFAULT true,
  allow_volume_decrease BOOLEAN DEFAULT true,
  max_volume_variance INTEGER DEFAULT 50,
  prefer_same_day BOOLEAN DEFAULT false,
  auto_accept_high_confidence BOOLEAN DEFAULT false,
  learning_mode BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user
    FOREIGN KEY (user_id) 
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_flex_settings_user_id ON user_flex_settings(user_id);

-- PARTE 5: Criar tabela de histórico de decisões (ML)
CREATE TABLE IF NOT EXISTS workout_match_decisions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  completed_workout_id INTEGER NOT NULL,
  suggested_workout_id INTEGER NOT NULL,
  confidence DOUBLE PRECISION NOT NULL,
  date_score DOUBLE PRECISION,
  type_score DOUBLE PRECISION,
  volume_score DOUBLE PRECISION,
  intensity_score DOUBLE PRECISION,
  action VARCHAR(50) NOT NULL,
  action_taken_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  day_of_week INTEGER,
  week_of_plan INTEGER,
  user_energy_level INTEGER,
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

CREATE INDEX IF NOT EXISTS idx_match_decisions_user_id ON workout_match_decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_match_decisions_action ON workout_match_decisions(action);
CREATE INDEX IF NOT EXISTS idx_match_decisions_confidence ON workout_match_decisions(confidence);

-- PARTE 6: Popular configurações padrão
INSERT INTO user_flex_settings (user_id, auto_adjust_enabled, auto_adjust_threshold)
SELECT id, false, 90
FROM users
WHERE id NOT IN (SELECT user_id FROM user_flex_settings)
ON CONFLICT (user_id) DO NOTHING;

-- PARTE 7: Trigger para auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_workout_adjustments_updated_at ON workout_adjustments;
CREATE TRIGGER update_workout_adjustments_updated_at
  BEFORE UPDATE ON workout_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_flex_settings_updated_at ON user_flex_settings;
CREATE TRIGGER update_user_flex_settings_updated_at
  BEFORE UPDATE ON user_flex_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
