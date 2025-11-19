-- ═══════════════════════════════════════════════════════════
-- QUERIES DE DIAGNÓSTICO - LGPD ATHERA RUN
-- ═══════════════════════════════════════════════════════════
-- Data: 17/Nov/2025
-- Uso: Executar no Neon SQL Editor para validar implementação
-- ═══════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────
-- 1. VERIFICAR SE TABELAS EXISTEM
-- ───────────────────────────────────────────────────────────

SELECT 
  tablename,
  CASE 
    WHEN tablename IN ('user_consents', 'audit_logs') THEN '🆕 Nova (LGPD)'
    ELSE '✅ Existente'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'athlete_profiles', 'user_consents', 'audit_logs')
ORDER BY tablename;

-- Resultado esperado:
-- audit_logs         | 🆕 Nova (LGPD)
-- athlete_profiles   | ✅ Existente
-- user_consents      | 🆕 Nova (LGPD)
-- users              | ✅ Existente


-- ───────────────────────────────────────────────────────────
-- 2. VERIFICAR ESTRUTURA DA TABELA user_consents
-- ───────────────────────────────────────────────────────────

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_consents'
ORDER BY ordinal_position;

-- Deve ter 8 colunas:
-- id, user_id, consent_type, consented_at, ip_address, 
-- user_agent, version, revoked_at


-- ───────────────────────────────────────────────────────────
-- 3. VERIFICAR ÍNDICES CRIADOS
-- ───────────────────────────────────────────────────────────

SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'user_consents'
ORDER BY indexname;

-- Deve ter 4 índices:
-- user_consents_pkey (PRIMARY KEY)
-- idx_user_consents_user_id
-- idx_user_consents_type
-- idx_user_consents_revoked


-- ───────────────────────────────────────────────────────────
-- 4. CONTAR CONSENTIMENTOS REGISTRADOS
-- ───────────────────────────────────────────────────────────

SELECT 
  consent_type,
  COUNT(*) as total,
  COUNT(CASE WHEN revoked_at IS NULL THEN 1 END) as ativos,
  COUNT(CASE WHEN revoked_at IS NOT NULL THEN 1 END) as revogados
FROM user_consents
GROUP BY consent_type
ORDER BY total DESC;

-- Tipos esperados após testes:
-- terms       | 10 | 10 | 0
-- privacy     | 10 | 10 | 0
-- health_data | 5  | 4  | 1


-- ───────────────────────────────────────────────────────────
-- 5. VER ÚLTIMOS CONSENTIMENTOS REGISTRADOS
-- ───────────────────────────────────────────────────────────

SELECT 
  uc.id,
  u.name as user_name,
  u.email,
  uc.consent_type,
  uc.version,
  uc.consented_at,
  CASE 
    WHEN uc.revoked_at IS NULL THEN '✅ Ativo'
    ELSE '❌ Revogado'
  END as status,
  uc.revoked_at
FROM user_consents uc
JOIN users u ON uc.user_id = u.id
ORDER BY uc.consented_at DESC
LIMIT 20;


-- ───────────────────────────────────────────────────────────
-- 6. VERIFICAR CONSENTIMENTOS DE UM USUÁRIO ESPECÍFICO
-- ───────────────────────────────────────────────────────────

-- Substituir 'EMAIL_DO_USUARIO' pelo email real
SELECT 
  u.name,
  u.email,
  uc.consent_type,
  uc.consented_at,
  uc.version,
  CASE 
    WHEN uc.revoked_at IS NULL THEN '✅ Ativo'
    ELSE '❌ Revogado em ' || TO_CHAR(uc.revoked_at, 'DD/MM/YYYY HH24:MI')
  END as status
FROM users u
LEFT JOIN user_consents uc ON u.id = uc.user_id
WHERE u.email = 'EMAIL_DO_USUARIO'
ORDER BY uc.consented_at DESC;

-- Deve retornar:
-- terms, privacy (sempre)
-- health_data (se forneceu dados de saúde)


-- ───────────────────────────────────────────────────────────
-- 7. ESTATÍSTICAS GERAIS
-- ───────────────────────────────────────────────────────────

SELECT 
  'Total de usuários' as metrica,
  COUNT(*) as valor
FROM users

UNION ALL

SELECT 
  'Usuários com consentimentos',
  COUNT(DISTINCT user_id)
FROM user_consents

UNION ALL

SELECT 
  'Total de consentimentos',
  COUNT(*)
FROM user_consents

UNION ALL

SELECT 
  'Consentimentos ativos',
  COUNT(*)
FROM user_consents
WHERE revoked_at IS NULL

UNION ALL

SELECT 
  'Consentimentos revogados',
  COUNT(*)
FROM user_consents
WHERE revoked_at IS NOT NULL;


-- ───────────────────────────────────────────────────────────
-- 8. USUÁRIOS SEM CONSENTIMENTOS (PROBLEMA!)
-- ───────────────────────────────────────────────────────────

SELECT 
  u.id,
  u.name,
  u.email,
  u.created_at,
  '⚠️ Sem consentimentos registrados' as problema
FROM users u
LEFT JOIN user_consents uc ON u.id = uc.user_id
WHERE uc.id IS NULL
ORDER BY u.created_at DESC
LIMIT 10;

-- Se retornar usuários:
-- = Usuários criados ANTES da implementação LGPD
-- = Normal, não é erro


-- ───────────────────────────────────────────────────────────
-- 9. VERIFICAR DADOS DE SAÚDE vs CONSENTIMENTO
-- ───────────────────────────────────────────────────────────

SELECT 
  u.email,
  CASE 
    WHEN ap.has_injury_history = true 
      OR ap.tracks_menstrual_cycle = true 
      OR ap.current_health_conditions IS NOT NULL
    THEN '⚠️ Tem dados de saúde'
    ELSE '✅ Sem dados sensíveis'
  END as dados_saude,
  CASE 
    WHEN uc.id IS NOT NULL AND uc.revoked_at IS NULL 
    THEN '✅ Consentimento ativo'
    WHEN uc.id IS NOT NULL AND uc.revoked_at IS NOT NULL 
    THEN '❌ Consentimento revogado'
    ELSE '⚠️ Sem consentimento'
  END as status_consentimento
FROM users u
LEFT JOIN athlete_profiles ap ON u.id = ap.user_id
LEFT JOIN user_consents uc ON u.id = uc.user_id 
  AND uc.consent_type = 'health_data'
WHERE ap.id IS NOT NULL
ORDER BY u.created_at DESC
LIMIT 20;


-- ───────────────────────────────────────────────────────────
-- 10. TIMELINE DE CONSENTIMENTOS (ÚLTIMAS 24H)
-- ───────────────────────────────────────────────────────────

SELECT 
  TO_CHAR(consented_at, 'HH24:MI') as hora,
  consent_type,
  COUNT(*) as total
FROM user_consents
WHERE consented_at > NOW() - INTERVAL '24 hours'
GROUP BY TO_CHAR(consented_at, 'HH24:MI'), consent_type
ORDER BY hora DESC;


-- ═══════════════════════════════════════════════════════════
-- QUERIES DE MANUTENÇÃO
-- ═══════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────
-- LIMPAR DADOS DE TESTE (USAR COM CUIDADO!)
-- ───────────────────────────────────────────────────────────

-- Descomentar apenas se quiser limpar usuários de teste
-- DELETE FROM users WHERE email LIKE '%@teste.com%';
-- DELETE FROM users WHERE email LIKE 'teste-%';


-- ───────────────────────────────────────────────────────────
-- REVOGAR CONSENTIMENTO MANUALMENTE
-- ───────────────────────────────────────────────────────────

-- Substituir valores reais
-- UPDATE user_consents 
-- SET revoked_at = NOW()
-- WHERE user_id = 'USER_ID'
--   AND consent_type = 'health_data'
--   AND revoked_at IS NULL;


-- ═══════════════════════════════════════════════════════════
-- FIM DAS QUERIES
-- ═══════════════════════════════════════════════════════════
