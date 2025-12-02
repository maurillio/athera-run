-- ============================================================================
-- ATHERA FLEX v3.3.0 - FASE 3: MACHINE LEARNING ENHANCEMENT (FIXED)
-- Migration: ML Data Collection & Adaptive Learning
-- Data: 02/DEZ/2025
-- Versão: v3.3.0-ml-fixed
-- FIX: user_id agora é VARCHAR (cuid) não INTEGER
-- ============================================================================

-- DESCRIÇÃO:
-- Esta migration adiciona 3 tabelas para o sistema de Machine Learning:
-- 1. user_decision_patterns - Registra todas decisões do usuário
-- 2. ml_confidence_calibration - Calibração de threshold automática
-- 3. user_score_weights - Pesos personalizados dos scores

-- ============================================================================
-- STEP 0: LIMPAR TENTATIVA ANTERIOR (SE NECESSÁRIO)
-- Execute APENAS se você já tentou rodar a migration anterior
-- ============================================================================

-- DROP TABLE IF EXISTS user_decision_patterns CASCADE;
-- DROP TABLE IF EXISTS ml_confidence_calibration CASCADE;
-- DROP TABLE IF EXISTS user_score_weights CASCADE;

-- ============================================================================
-- STEP 1: VERIFICAÇÃO PRÉ-MIGRATION
-- Execute ANTES de aplicar a migration
-- ============================================================================

-- Verificar se tabelas já existem
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'user_decision_patterns'
) as decision_patterns_exists;

SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'ml_confidence_calibration'
) as calibration_exists;

SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'user_score_weights'
) as score_weights_exists;

-- Verificar tipo de user_id (deve ser text/varchar)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'id';

-- Verificar usuários ativos para popular weights iniciais
SELECT COUNT(*) as total_users_with_flex 
FROM user_flex_settings 
WHERE auto_adjust_enabled IS NOT NULL;

-- ============================================================================
-- STEP 2: MIGRATION - CRIAR TABELAS
-- Execute COM CUIDADO (uma por vez se preferir)
-- ============================================================================

-- TABELA 1: user_decision_patterns
-- Registra TODAS decisões (aceitar/rejeitar) com contexto completo
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_decision_patterns (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id INTEGER REFERENCES workout_match_decisions(id) ON DELETE SET NULL,
  
  -- Decision context
  decision_type VARCHAR(20) NOT NULL CHECK (decision_type IN ('accepted', 'rejected', 'ignored')),
  confidence_at_decision DECIMAL(5,2) NOT NULL CHECK (confidence_at_decision BETWEEN 0 AND 100),
  
  -- Scores at decision (4 dimensions)
  date_score DECIMAL(5,2) CHECK (date_score BETWEEN 0 AND 100),
  type_score DECIMAL(5,2) CHECK (type_score BETWEEN 0 AND 100),
  volume_score DECIMAL(5,2) CHECK (volume_score BETWEEN 0 AND 100),
  intensity_score DECIMAL(5,2) CHECK (intensity_score BETWEEN 0 AND 100),
  
  -- Temporal patterns
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=domingo, 6=sábado
  hour_of_day INTEGER CHECK (hour_of_day BETWEEN 0 AND 23),
  time_to_race_weeks INTEGER, -- semanas até próxima prova alvo
  
  -- Workout context
  workout_type VARCHAR(50),
  planned_distance DECIMAL(10,2),
  executed_distance DECIMAL(10,2),
  distance_variance_percent DECIMAL(5,2), -- % de diferença
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes otimizados
CREATE INDEX IF NOT EXISTS idx_udp_user_decision ON user_decision_patterns(user_id, decision_type);
CREATE INDEX IF NOT EXISTS idx_udp_confidence_range ON user_decision_patterns(user_id, confidence_at_decision);
CREATE INDEX IF NOT EXISTS idx_udp_created_at ON user_decision_patterns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_udp_workout_type ON user_decision_patterns(user_id, workout_type);
CREATE INDEX IF NOT EXISTS idx_udp_day_of_week ON user_decision_patterns(user_id, day_of_week);

COMMENT ON TABLE user_decision_patterns IS 'ML: Registra todas decisões do usuário com contexto completo para análise de padrões';
COMMENT ON COLUMN user_decision_patterns.decision_type IS 'accepted: aplicou, rejected: rejeitou, ignored: não interagiu';
COMMENT ON COLUMN user_decision_patterns.confidence_at_decision IS 'Confidence do match no momento da decisão';
COMMENT ON COLUMN user_decision_patterns.day_of_week IS '0=domingo, 1=segunda, ..., 6=sábado';

-- ============================================================================
-- TABELA 2: ml_confidence_calibration
-- Calibração automática de threshold baseada em histórico
-- ============================================================================

CREATE TABLE IF NOT EXISTS ml_confidence_calibration (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Analysis period
  analysis_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  analysis_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_decisions INTEGER NOT NULL DEFAULT 0,
  
  -- Acceptance rate by confidence range
  range_60_70_total INTEGER DEFAULT 0,
  range_60_70_accepted INTEGER DEFAULT 0,
  range_70_80_total INTEGER DEFAULT 0,
  range_70_80_accepted INTEGER DEFAULT 0,
  range_80_90_total INTEGER DEFAULT 0,
  range_80_90_accepted INTEGER DEFAULT 0,
  range_90_100_total INTEGER DEFAULT 0,
  range_90_100_accepted INTEGER DEFAULT 0,
  
  -- Recommendations
  recommended_threshold DECIMAL(5,2) CHECK (recommended_threshold BETWEEN 60 AND 100),
  current_threshold DECIMAL(5,2) CHECK (current_threshold BETWEEN 60 AND 100),
  expected_precision_improvement DECIMAL(5,2), -- % de melhoria esperada
  improvement_reason TEXT, -- Explicação da sugestão
  
  -- Status
  was_applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMP WITH TIME ZONE,
  applied_by VARCHAR(50), -- 'user', 'auto', 'system'
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_date_range CHECK (analysis_end_date >= analysis_start_date),
  CONSTRAINT valid_improvement CHECK (expected_precision_improvement IS NULL OR expected_precision_improvement >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mcc_user_created ON ml_confidence_calibration(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mcc_was_applied ON ml_confidence_calibration(user_id, was_applied);

COMMENT ON TABLE ml_confidence_calibration IS 'ML: Análise e calibração automática de threshold baseada em padrões';
COMMENT ON COLUMN ml_confidence_calibration.expected_precision_improvement IS 'Percentual de melhoria esperada na precisão';

-- ============================================================================
-- TABELA 3: user_score_weights
-- Pesos personalizados para cálculo de confidence
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_score_weights (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Personalized weights (MUST sum to 1.0)
  date_weight DECIMAL(5,2) NOT NULL DEFAULT 0.25 CHECK (date_weight BETWEEN 0.10 AND 0.50),
  type_weight DECIMAL(5,2) NOT NULL DEFAULT 0.25 CHECK (type_weight BETWEEN 0.10 AND 0.50),
  volume_weight DECIMAL(5,2) NOT NULL DEFAULT 0.25 CHECK (volume_weight BETWEEN 0.10 AND 0.50),
  intensity_weight DECIMAL(5,2) NOT NULL DEFAULT 0.25 CHECK (intensity_weight BETWEEN 0.10 AND 0.50),
  
  -- Optimization metadata
  decisions_analyzed INTEGER DEFAULT 0, -- quantas decisões foram usadas
  last_optimization_at TIMESTAMP WITH TIME ZONE,
  optimization_trigger VARCHAR(50), -- 'auto', 'manual', 'threshold_change', 'initial'
  optimization_notes TEXT, -- Explicação dos ajustes
  
  -- Validation: weights must sum to 1.0 (allowing 0.01 tolerance)
  CONSTRAINT weights_sum_to_one CHECK (
    ABS((date_weight + type_weight + volume_weight + intensity_weight) - 1.0) < 0.01
  ),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One record per user
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_usw_user ON user_score_weights(user_id);

COMMENT ON TABLE user_score_weights IS 'ML: Pesos personalizados dos scores para cada usuário (devem somar 1.0)';
COMMENT ON COLUMN user_score_weights.date_weight IS 'Peso do score de data (0.10-0.50, default 0.25)';
COMMENT ON COLUMN user_score_weights.optimization_trigger IS 'O que disparou a otimização: auto, manual, threshold_change, initial';

-- ============================================================================
-- STEP 3: POPULAR DADOS INICIAIS
-- Criar records de user_score_weights para usuários existentes
-- ============================================================================

-- Inserir pesos default para todos usuários com flex settings
INSERT INTO user_score_weights (
  user_id,
  date_weight,
  type_weight,
  volume_weight,
  intensity_weight,
  decisions_analyzed,
  optimization_trigger,
  optimization_notes
)
SELECT 
  user_id,
  0.25,
  0.25,
  0.25,
  0.25,
  0,
  'initial',
  'Pesos iniciais padrão. Serão personalizados com uso.'
FROM user_flex_settings
WHERE NOT EXISTS (
  SELECT 1 FROM user_score_weights WHERE user_score_weights.user_id = user_flex_settings.user_id
)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- STEP 4: VALIDAÇÃO PÓS-MIGRATION
-- Execute APÓS aplicar a migration
-- ============================================================================

-- Verificar tabelas criadas
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_name IN ('user_decision_patterns', 'ml_confidence_calibration', 'user_score_weights')
ORDER BY table_name;

-- Verificar indexes criados
SELECT tablename, indexname 
FROM pg_indexes 
WHERE tablename IN ('user_decision_patterns', 'ml_confidence_calibration', 'user_score_weights')
ORDER BY tablename, indexname;

-- Verificar user_score_weights populado
SELECT 
  COUNT(*) as total_users_with_weights,
  SUM(CASE WHEN date_weight = 0.25 THEN 1 ELSE 0 END) as users_with_default_weights
FROM user_score_weights;

-- Verificar constraints
SELECT 
  conname as constraint_name,
  conrelid::regclass as table_name
FROM pg_constraint
WHERE conrelid::regclass::text IN ('user_decision_patterns', 'ml_confidence_calibration', 'user_score_weights')
ORDER BY table_name, constraint_name;

-- Teste de insert (deve funcionar)
DO $$
DECLARE
  test_user_id VARCHAR(255);
BEGIN
  -- Pegar primeiro usuário com flex settings
  SELECT user_id INTO test_user_id FROM user_flex_settings LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Testar insert em user_decision_patterns
    INSERT INTO user_decision_patterns (
      user_id, decision_type, confidence_at_decision,
      date_score, type_score, volume_score, intensity_score,
      day_of_week, hour_of_day, workout_type
    ) VALUES (
      test_user_id, 'accepted', 85.5,
      90, 85, 80, 88,
      1, 18, 'endurance'
    );
    
    RAISE NOTICE 'Test insert successful for user_id: %', test_user_id;
    
    -- Deletar teste
    DELETE FROM user_decision_patterns WHERE user_id = test_user_id AND workout_type = 'endurance';
  ELSE
    RAISE NOTICE 'No users with flex settings found for testing';
  END IF;
END $$;

-- Ver sample de dados
SELECT 
  usw.user_id,
  u.email,
  usw.date_weight,
  usw.type_weight,
  usw.volume_weight,
  usw.intensity_weight
FROM user_score_weights usw
JOIN users u ON u.id = usw.user_id
LIMIT 5;

-- ============================================================================
-- STEP 5: ROLLBACK (SE NECESSÁRIO)
-- Execute APENAS se houver problemas e precisar reverter
-- ============================================================================

-- ATENÇÃO: Isso vai DELETAR todas as tabelas e dados!
-- Descomente apenas se realmente precisar reverter

-- DROP TABLE IF EXISTS user_decision_patterns CASCADE;
-- DROP TABLE IF EXISTS ml_confidence_calibration CASCADE;
-- DROP TABLE IF EXISTS user_score_weights CASCADE;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
