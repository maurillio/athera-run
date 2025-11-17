# 🧪 GUIA COMPLETO DE TESTES LGPD

**Data:** 17/Novembro/2025  
**Versão:** 1.0  
**Tempo Estimado:** 1 hora

---

## 📋 PRÉ-REQUISITOS

Antes de começar os testes:

- [ ] Deploy Vercel concluído (status: Ready ✅)
- [ ] Migration aplicada no Neon (`apply_lgpd_migration.sql`)
- [ ] Cache do navegador limpo (Ctrl+Shift+R)
- [ ] Conta de teste preparada (novo email)

---

## 🧪 TESTE 1: Páginas Legais (5 min)

### Objetivo
Validar que as páginas de privacidade e termos estão acessíveis e bem formatadas.

### Passos
```
1. Acessar: https://atherarun.com/privacy-policy
   ✓ Página carrega corretamente
   ✓ Conteúdo está formatado
   ✓ Todos os 12 tópicos aparecem
   ✓ Links de email funcionam

2. Acessar: https://atherarun.com/terms-of-service
   ✓ Página carrega corretamente
   ✓ Conteúdo está formatado
   ✓ Todos os 12 tópicos aparecem
   ✓ Links de contato funcionam

3. Testar em mobile (opcional)
   ✓ Layout responsivo
   ✓ Texto legível
```

### Resultado Esperado
✅ Ambas as páginas carregam perfeitamente  
✅ Conteúdo claro e bem formatado  
✅ Links funcionais

### Se Der Erro
- **404 Not Found:** Aguardar deploy completar
- **Formatação quebrada:** Limpar cache do navegador
- **Texto cortado:** Bug de CSS (não crítico)

---

## 🧪 TESTE 2: Signup com Consentimentos (15 min)

### Objetivo
Validar que o signup exige consentimentos e os registra corretamente.

### Passos

#### 2.1 Validação de Checkboxes
```
1. Acessar: https://atherarun.com/signup

2. Preencher dados:
   - Nome: Teste LGPD
   - Email: teste-lgpd-[timestamp]@teste.com
   - Senha: Senha123
   - Confirmar Senha: Senha123

3. NÃO MARCAR os checkboxes

4. Tentar criar conta
   ✓ DEVE BLOQUEAR com mensagem de erro
   ✓ Mensagem: "Você deve aceitar os Termos..."
   ✓ Botão desabilitado ou erro visível

5. Marcar apenas 1 checkbox (termos)
   ✓ DEVE CONTINUAR BLOQUEANDO

6. Marcar ambos os checkboxes
   ✓ Botão fica habilitado
   ✓ Permite criar conta
```

#### 2.2 Funcionalidade dos Links
```
7. Clicar no link "Termos de Uso"
   ✓ Abre em nova aba
   ✓ Mostra página de termos

8. Clicar no link "Política de Privacidade"
   ✓ Abre em nova aba
   ✓ Mostra página de privacidade
```

#### 2.3 Criação de Conta
```
9. Marcar ambos checkboxes
10. Criar conta
    ✓ Cadastro é realizado
    ✓ Redireciona para /onboarding
    ✓ Login automático funciona
```

#### 2.4 Verificação no Banco
```sql
-- Executar no Neon SQL Editor:

-- Ver usuário criado
SELECT id, name, email, created_at 
FROM users 
WHERE email = 'teste-lgpd-XXX@teste.com';

-- Ver consentimentos registrados (DEVE TER 2)
SELECT 
  consent_type, 
  consented_at, 
  version,
  revoked_at
FROM user_consents 
WHERE user_id = '[ID_DO_USUARIO]'
ORDER BY consented_at DESC;

-- Resultado esperado:
-- 1. terms     | 2025-11-17... | 1.0 | NULL
-- 2. privacy   | 2025-11-17... | 1.0 | NULL
```

### Resultado Esperado
✅ Checkboxes obrigatórios funcionando  
✅ Links abrindo em nova aba  
✅ Cadastro só funciona com consentimentos  
✅ **2 consentimentos** registrados no banco  

### Se Der Erro
- **Checkboxes não aparecem:** Limpar cache (Ctrl+Shift+R)
- **Botão sempre desabilitado:** Verificar console do navegador (F12)
- **Consentimentos não salvos:** Verificar que migration foi aplicada
- **Erro 500:** Ver logs Vercel Dashboard

---

## 🧪 TESTE 3: Onboarding Step 4 - Dados Sensíveis (20 min)

### Objetivo
Validar aviso LGPD e consentimento específico para dados de saúde.

### Passos

#### 3.1 Navegação Inicial
```
1. Com a conta criada no teste anterior, fazer onboarding:
   - Step 1 (Básico): Preencher normalmente
   - Step 2 (Nível): Selecionar qualquer nível
   - Step 3 (Corrida): Preencher dados

2. Avançar para Step 4 (Saúde)
```

#### 3.2 Aviso LGPD
```
3. No Step 4, verificar:
   ✓ Aviso laranja aparece no topo
   ✓ Título: "⚠️ Dados Sensíveis de Saúde (LGPD)"
   ✓ Texto explica que é OPCIONAL
   ✓ Checkbox de consentimento aparece
   ✓ Checkbox NÃO está marcado por padrão
```

#### 3.3 Sem Consentimento
```
4. NÃO marcar o checkbox de dados de saúde

5. Verificar:
   ✓ Campos de lesões estão OCULTOS
   ✓ Campos de ciclo menstrual estão OCULTOS
   ✓ Campos de sono estão OCULTOS
   ✓ Aviso azul aparece: "Sem problema! Você pode pular..."
   
6. Clicar em "Avançar"
   ✓ DEVE FUNCIONAR normalmente
   ✓ Vai para próximo step
   ✓ Não registra consentimento health_data
```

#### 3.4 Com Consentimento
```
7. Voltar para Step 4

8. Marcar o checkbox de dados de saúde

9. Verificar:
   ✓ Campos de lesões APARECEM
   ✓ Campos de ciclo menstrual APARECEM (se mulher)
   ✓ Campos de sono APARECEM
   ✓ Todos os campos estão preenchíveis

10. Preencher alguns dados:
    - Histórico de lesões: Sim
    - Selecionar uma lesão: Canelite
    - Horas de sono: 7

11. Clicar em "Avançar"
    ✓ Dados são salvos
    ✓ Vai para próximo step
```

#### 3.5 Verificação no Banco
```sql
-- Executar no Neon SQL Editor:

-- Ver consentimentos (DEVE TER 3 agora)
SELECT 
  consent_type, 
  consented_at,
  version
FROM user_consents 
WHERE user_id = '[ID_DO_USUARIO]'
ORDER BY consented_at DESC;

-- Resultado esperado:
-- 1. health_data | 2025-11-17... | 1.0  ← NOVO!
-- 2. terms       | 2025-11-17... | 1.0
-- 3. privacy     | 2025-11-17... | 1.0

-- Ver dados de saúde salvos
SELECT 
  has_injury_history,
  injuries,
  tracks_menstrual_cycle,
  avg_sleep_hours
FROM athlete_profiles
WHERE user_id = '[ID_DO_USUARIO]';
```

### Resultado Esperado
✅ Aviso laranja aparece e é claro  
✅ Campos condicionais funcionam perfeitamente  
✅ Pode pular etapa sem consentir  
✅ **3 consentimentos** no banco (se consentiu)  
✅ Dados salvos apenas se consentiu

### Se Der Erro
- **Aviso não aparece:** Limpar cache
- **Campos sempre visíveis:** Erro no código (verificar console)
- **Não salva consentimento:** Verificar API /api/consent/record
- **Erro ao avançar:** Ver logs no console (F12)

---

## 🧪 TESTE 4: APIs de Privacidade (15 min)

### Objetivo
Validar que as APIs de privacidade estão funcionando.

### Ferramenta
Use Thunder Client, Postman ou curl.

### 4.1 API: Listar Consentimentos
```bash
GET https://atherarun.com/api/privacy/consents

# Headers:
Cookie: next-auth.session-token=[SEU_TOKEN]

# Resultado esperado:
{
  "success": true,
  "consents": [
    {
      "type": "health_data",
      "consentedAt": "2025-11-17...",
      "isActive": true,
      "canRevoke": true
    },
    {
      "type": "terms",
      "consentedAt": "2025-11-17...",
      "isActive": true,
      "canRevoke": false
    },
    {
      "type": "privacy",
      "consentedAt": "2025-11-17...",
      "isActive": true,
      "canRevoke": false
    }
  ],
  "total": 3,
  "active": 3
}
```

### 4.2 API: Visualizar Meus Dados
```bash
GET https://atherarun.com/api/privacy/my-data

# Resultado esperado:
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "Teste LGPD",
      "email": "teste-lgpd-...@teste.com",
      "createdAt": "..."
    },
    "profile": { ... },
    "consents": [ ... ],
    "stats": {
      "accountAge": 0,
      "hasProfile": true
    }
  }
}
```

### 4.3 API: Exportar Dados (Portabilidade)
```bash
GET https://atherarun.com/api/privacy/export

# Resultado esperado:
# Baixa arquivo JSON: athera-run-dados-[ID]-[timestamp].json
# Conteúdo:
{
  "exported_at": "2025-11-17...",
  "user_id": "...",
  "lgpd_version": "1.0",
  "data": {
    "user": { ... },
    "consents": [ ... ]
  }
}
```

### 4.4 API: Revogar Consentimento
```bash
POST https://atherarun.com/api/privacy/revoke-consent
Content-Type: application/json

{
  "consentType": "health_data"
}

# Resultado esperado:
{
  "success": true,
  "message": "Consentimento health_data revogado com sucesso",
  "dataDeleted": true
}

# Verificar no banco:
SELECT * FROM user_consents 
WHERE user_id = '[ID]' AND consent_type = 'health_data';

# DEVE ter revoked_at preenchido!
```

### Resultado Esperado
✅ Todas as 4 APIs funcionando  
✅ Retornos JSON corretos  
✅ Export gera arquivo para download  
✅ Revoke marca consentimento como revogado

### Se Der Erro
- **401 Unauthorized:** Token de sessão inválido/expirado
- **500 Internal Error:** Ver logs Vercel
- **user_consents does not exist:** Migration não foi aplicada

---

## 🧪 TESTE 5: Teste End-to-End Completo (15 min)

### Objetivo
Validar fluxo completo de um usuário novo.

### Cenário
Simular um usuário real usando o sistema pela primeira vez.

### Passos
```
1. Limpar cookies e cache do navegador

2. Acessar https://atherarun.com

3. Clicar em "Criar Conta"

4. Preencher formulário:
   - Nome: João Silva
   - Email: joao-[timestamp]@teste.com
   - Senha: Senha123

5. Tentar cadastrar SEM marcar checkboxes
   ✓ Deve bloquear

6. Marcar checkboxes de termos e privacidade

7. Criar conta
   ✓ Sucesso

8. Fazer onboarding completo:
   Step 1: Dados básicos
   Step 2: Nível de corrida
   Step 3: Objetivo de corrida
   Step 4: MARCAR checkbox saúde + preencher dados
   Step 5: Disponibilidade
   Step 6: Gerar plano

9. Verificar no banco:
```sql
SELECT COUNT(*) as total_consents
FROM user_consents 
WHERE user_id = '[ID_JOAO]';

-- DEVE retornar: 3
-- (terms, privacy, health_data)
```

### Resultado Esperado
✅ Fluxo completo funciona sem erros  
✅ 3 consentimentos registrados  
✅ Plano gerado com sucesso  
✅ Dados de saúde salvos

---

## 📊 CHECKLIST FINAL DE VALIDAÇÃO

### Funcional
- [ ] Páginas /privacy-policy e /terms-of-service acessíveis
- [ ] Signup exige checkboxes
- [ ] Links abrem em nova aba
- [ ] Onboarding Step 4 tem aviso LGPD
- [ ] Campos condicionais funcionam
- [ ] Pode pular Step 4 sem consentir
- [ ] APIs de privacidade funcionam

### Banco de Dados
- [ ] Tabela user_consents existe
- [ ] Tabela audit_logs existe
- [ ] Consentimentos são registrados
- [ ] Revogação funciona (revoked_at)
- [ ] Dados sensíveis apagados ao revogar

### UX/UI
- [ ] Aviso laranja está destacado
- [ ] Textos são claros
- [ ] Cores e formatação OK
- [ ] Funciona em mobile
- [ ] Não há erros no console

---

## 🎯 CRITÉRIOS DE SUCESSO

Para considerar os testes **APROVADOS**, todos devem passar:

1. ✅ Páginas legais carregam (Teste 1)
2. ✅ Signup exige consentimentos (Teste 2)
3. ✅ Onboarding tem aviso LGPD (Teste 3)
4. ✅ APIs funcionam (Teste 4)
5. ✅ Fluxo end-to-end OK (Teste 5)

**Se TODOS passarem:** 🎉 Sistema 100% funcional e conforme LGPD!

---

## 📞 SUPORTE

### Documentos de Referência
- `LGPD_IMPLEMENTADO_HOJE.md` - Resumo completo
- `DEPLOY_LGPD_CONCLUIDO.md` - Status deploy
- `apply_lgpd_migration.sql` - Migration SQL

### Se Encontrar Bugs
1. Anotar o erro exato
2. Verificar console do navegador (F12)
3. Ver logs Vercel Dashboard
4. Verificar que migration foi aplicada

---

**Guia criado por:** GitHub Copilot CLI  
**Data:** 17/Novembro/2025  
**Versão:** 1.0  
**Status:** ✅ Pronto para usar

🧪 **Bons testes!**
