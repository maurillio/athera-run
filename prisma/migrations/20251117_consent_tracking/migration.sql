CREATE TABLE IF NOT EXISTS user_consents (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type VARCHAR NOT NULL,
  consented_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address VARCHAR,
  user_agent TEXT,
  version VARCHAR NOT NULL DEFAULT '1.0',
  revoked_at TIMESTAMP,
  UNIQUE(user_id, consent_type, version)
);

CREATE INDEX idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX idx_user_consents_type ON user_consents(consent_type);
