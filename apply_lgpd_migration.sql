-- LGPD Migration - User Consents
-- Data: 17/Nov/2025

-- Tabela de Consentimentos
CREATE TABLE IF NOT EXISTS user_consents (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  consent_type VARCHAR NOT NULL,
  consented_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address VARCHAR,
  user_agent TEXT,
  version VARCHAR NOT NULL DEFAULT '1.0',
  revoked_at TIMESTAMP,
  
  CONSTRAINT user_consents_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT user_consents_unique_key
    UNIQUE(user_id, consent_type, version)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_type ON user_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_user_consents_revoked ON user_consents(revoked_at) WHERE revoked_at IS NULL;

-- Tabela de Logs de Auditoria (Fase 3 - preparando)
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR,
  action VARCHAR NOT NULL,
  entity_type VARCHAR,
  entity_id INT,
  ip_address VARCHAR,
  user_agent TEXT,
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Comentários
COMMENT ON TABLE user_consents IS 'Registro de consentimentos LGPD - Art. 18';
COMMENT ON TABLE audit_logs IS 'Logs de auditoria para compliance LGPD';
