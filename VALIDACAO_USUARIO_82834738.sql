-- ============================================
-- VALIDAÇÃO LGPD - Usuário 82834738teste@teste.com
-- Data: 17/Novembro/2025 20:30 UTC
-- ============================================

-- 1️⃣ VERIFICAR USUÁRIO CRIADO
-- ============================================
SELECT 
  '1️⃣ DADOS DO USUÁRIO' as secao,
  id,
  name,
  email,
  created_at,
  CASE 
    WHEN created_at > NOW() - INTERVAL '1 hour' THEN '🆕 Criado há menos de 1h'
    WHEN created_at > NOW() - INTERVAL '24 hours' THEN '✅ Criado hoje'
    ELSE '⏰ Criado há mais de 1 dia'
  END as status_tempo
FROM users
WHERE email = '82834738teste@teste.com';

-- ============================================
-- 2️⃣ VERIFICAR CONSENTIMENTOS
-- ============================================
SELECT 
  '2️⃣ CONSENTIMENTOS LGPD' as secao,
  uc.id,
  uc.consent_type as tipo,
  uc.consented_at as consentido_em,
  uc.version as versao,
  uc.ip_address as ip,
  CASE 
    WHEN uc.revoked_at IS NULL THEN '✅ ATIVO'
    ELSE '❌ REVOGADO em ' || uc.revoked_at::text
  END as status
FROM user_consents uc
JOIN users u ON uc.user_id = u.id
WHERE u.email = '82834738teste@teste.com'
ORDER BY uc.consented_at DESC;

-- ============================================
-- 3️⃣ CONTAGEM DE CONSENTIMENTOS
-- ============================================
SELECT 
  '3️⃣ RESUMO' as secao,
  COUNT(*) as total_consentimentos,
  COUNT(CASE WHEN consent_type = 'terms' THEN 1 END) as tem_terms,
  COUNT(CASE WHEN consent_type = 'privacy' THEN 1 END) as tem_privacy,
  COUNT(CASE WHEN consent_type = 'health_data' THEN 1 END) as tem_health,
  CASE 
    WHEN COUNT(*) >= 2 THEN '✅ OK - Signup completo'
    WHEN COUNT(*) = 1 THEN '⚠️ INCOMPLETO - Falta 1 consentimento'
    ELSE '❌ ERRO - Nenhum consentimento'
  END as diagnostico
FROM user_consents uc
JOIN users u ON uc.user_id = u.id
WHERE u.email = '82834738teste@teste.com';

-- ============================================
-- 4️⃣ PERFIL DO ATLETA (Se existir)
-- ============================================
SELECT 
  '4️⃣ PERFIL ATLETA' as secao,
  ap.id,
  ap.goal_race_distance as distancia_corrida,
  ap.goal_race_date as data_corrida,
  ap.created_at as perfil_criado,
  CASE 
    WHEN ap.id IS NOT NULL THEN '✅ Onboarding iniciado'
    ELSE '⏳ Onboarding não iniciado'
  END as status_onboarding
FROM users u
LEFT JOIN athlete_profiles ap ON u.id = ap.user_id
WHERE u.email = '82834738teste@teste.com';

-- ============================================
-- 5️⃣ DIAGNÓSTICO COMPLETO
-- ============================================
SELECT 
  '5️⃣ DIAGNÓSTICO FINAL' as secao,
  CASE 
    WHEN u.id IS NULL THEN '❌ ERRO: Usuário não encontrado!'
    WHEN NOT EXISTS (
      SELECT 1 FROM user_consents uc2 WHERE uc2.user_id = u.id
    ) THEN '❌ CRÍTICO: Usuário existe mas SEM consentimentos!'
    WHEN (
      SELECT COUNT(*) FROM user_consents uc2 
      WHERE uc2.user_id = u.id AND uc2.consent_type IN ('terms', 'privacy')
    ) < 2 THEN '⚠️ INCOMPLETO: Faltam consentimentos de signup'
    WHEN EXISTS (
      SELECT 1 FROM athlete_profiles ap2 WHERE ap2.user_id = u.id
    ) THEN '✅ PERFEITO: Usuário + Consentimentos + Perfil'
    ELSE '✅ BOM: Usuário + Consentimentos (Onboarding pendente)'
  END as resultado,
  
  (SELECT COUNT(*) FROM user_consents uc3 WHERE uc3.user_id = u.id) as total_consentimentos,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM athlete_profiles ap3 WHERE ap3.user_id = u.id)
    THEN '✅ Sim'
    ELSE '❌ Não'
  END as tem_perfil_atleta

FROM users u
WHERE u.email = '82834738teste@teste.com';

-- ============================================
-- 📊 INTERPRETAÇÃO DOS RESULTADOS
-- ============================================

/*
RESULTADOS ESPERADOS:

1️⃣ DADOS DO USUÁRIO:
   - Deve mostrar: id, name, email, created_at
   - Status tempo: 🆕 ou ✅

2️⃣ CONSENTIMENTOS LGPD:
   ✅ ESPERADO (Signup funcionando):
      - 2 linhas
      - tipo: terms + privacy
      - status: ✅ ATIVO (ambos)
   
   ❌ PROBLEMA (API não salvou):
      - 0 linhas
      - Verificar logs Vercel

3️⃣ RESUMO:
   ✅ ESPERADO:
      - total_consentimentos: 2
      - tem_terms: 1
      - tem_privacy: 1
      - tem_health: 0 (ainda não fez onboarding)
      - diagnostico: ✅ OK - Signup completo

4️⃣ PERFIL ATLETA:
   - Se não iniciou onboarding: ⏳ Onboarding não iniciado
   - Se já começou: ✅ Onboarding iniciado

5️⃣ DIAGNÓSTICO FINAL:
   ✅ CENÁRIO IDEAL (Signup OK):
      - resultado: ✅ BOM: Usuário + Consentimentos
      - total_consentimentos: 2
      - tem_perfil_atleta: ❌ Não (ainda)
   
   ✅ CENÁRIO PERFEITO (Onboarding completo):
      - resultado: ✅ PERFEITO: Usuário + Consentimentos + Perfil
      - total_consentimentos: 3 (terms + privacy + health_data)
      - tem_perfil_atleta: ✅ Sim
   
   ❌ PROBLEMA:
      - resultado: ❌ ou ⚠️
      - Investigar API /api/consent/record
*/

-- ============================================
-- 🔍 QUERIES ADICIONAIS DE DEBUG (Se necessário)
-- ============================================

-- Se aparecer 0 consentimentos, executar:
-- SELECT COUNT(*) FROM user_consents; -- Ver se tabela tem dados

-- Se a tabela estiver vazia:
-- Ver logs Vercel: https://vercel.com/dashboard
-- Filtrar por: /api/consent/record
-- Procurar erros na requisição POST

-- ============================================
-- ✅ TUDO OK? PRÓXIMOS PASSOS:
-- ============================================

/*
1. ✅ Se 2 consentimentos aparecerem:
   - PARABÉNS! Sistema LGPD funcionando 100%
   - Próximo: Testar onboarding Step 4
   
2. ⚠️ Se 0 consentimentos:
   - API não está salvando
   - Ver logs Vercel
   - Verificar /api/consent/record
   
3. 🎯 Após validar:
   - Continuar onboarding
   - Testar Step 4 (dados de saúde)
   - Rodar este script de novo
   - Deve aparecer 3 consentimentos
*/
