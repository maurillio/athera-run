# 🔧 HOTFIX v2.0.3 - Plan Generation Error Handling & Logging

**Data:** 11 de Novembro de 2025 01:00 UTC  
**Versão:** v2.0.3  
**Tipo:** Melhoria de Diagnóstico  
**Status:** ✅ Deploy em andamento

---

## 📋 Problema Reportado

**Usuário:** `Teste0101019@teste.com`  
**Sintoma:** Erro 500 ao tentar gerar plano após finalizar onboarding  
**URL:** `/api/plan/generate`  
**Erro no console:** `Failed to load resource: the server responded with a status of 500 ()`

---

## 🔍 Diagnóstico Realizado

### ✅ Dados do Usuário (Verificados)
```
✅ Perfil completo: SIM
✅ Goal Distance: 5k
✅ Target Race Date: 2025-12-28
✅ Running Level: beginner  
✅ Training Schedule: Configurado (7 dias com corrida + cross-training)
✅ Training Activities: [0,1,2,3,4,5,6]
✅ Long Run Day: 0 (Domingo)
✅ Race Goals: 1 corrida (Priority A, 5k em 28/12/2025)
```

### ✅ Variáveis de Ambiente no Vercel (Verificadas)
```bash
✅ OPENAI_API_KEY: Configurada (encrypted)
✅ LLM_PROVIDER: Configurada (openai)
✅ LLM_MODEL: Configurada (gpt-4o)
✅ DATABASE_URL: Configurada (Neon PostgreSQL)
```

### ✅ Código da API (Verificado)
```
✅ Validações: Implementadas e corretas
✅ Query de race goals: Busca 'active' e 'upcoming'
✅ Estrutura de dados: Completa e válida
✅ Fluxo de geração: Correto
```

---

## 🎯 Possíveis Causas Identificadas

### 1. 💰 Quota/Limite da OpenAI
- **Provável:** A API Key pode ter atingido limite de uso
- **Sintoma:** OpenAI retorna 429 (Too Many Requests) ou 402 (Payment Required)
- **Verificar:** https://platform.openai.com/usage

### 2. ⏱️ Timeout no Vercel
- **Provável:** Geração de plano demora muito (>10s)
- **Sintoma:** Vercel mata a request antes de completar
- **Limite:** 
  - Hobby: 10 segundos
  - Pro: 60 segundos

### 3. 🔧 Formato da Resposta da OpenAI
- **Possível:** IA retorna JSON inválido ou incompleto
- **Sintoma:** Parser JSON falha
- **Causa:** Modelo pode estar gerando texto fora do formato esperado

### 4. ❌ Erro na Validação do Plano
- **Possível:** Plano gerado não passa nas regras de validação
- **Sintoma:** `validateAIPlan()` retorna `valid: false`
- **Causa:** IA não seguiu todas as diretrizes do prompt

---

## ✅ Melhorias Implementadas

### 1. Logging Detalhado na API de Geração
**Arquivo:** `app/api/plan/generate/route.ts`

```typescript
// ANTES: Erro genérico
catch (genError) {
  console.error('[AI PLAN] ❌ ERRO:', genError);
  throw new Error(`Falha: ${genError.message}`);
}

// DEPOIS: Erro detalhado com context
catch (genError) {
  console.error('[AI PLAN] ❌ ERRO CRÍTICO ao gerar plano');
  console.error('[AI PLAN] Erro:', genError);
  console.error('[AI PLAN] Tipo:', typeof genError);
  console.error('[AI PLAN] Nome:', genError.name);
  console.error('[AI PLAN] Mensagem:', genError.message);
  console.error('[AI PLAN] Stack:', genError.stack);
  
  return NextResponse.json({
    success: false,
    error: 'Erro ao gerar plano com IA',
    details: genError.message,
    type: genError.name,
    hint: 'Possíveis causas: quota OpenAI, timeout, formato inválido'
  }, { status: 500 });
}
```

**Benefícios:**
- ✅ Identifica exatamente onde o erro ocorreu
- ✅ Tipo e nome do erro para diagnóstico rápido
- ✅ Stack trace completo para debug
- ✅ Mensagem amigável com hint de possíveis causas

### 2. Tratamento de Erros Específicos no LLM Client
**Arquivo:** `lib/llm-client.ts`

```typescript
// ANTES: Erro genérico
if (!response.ok) {
  throw new Error(`API failed: ${response.status}`);
}

// DEPOIS: Erros específicos por código
if (!response.ok) {
  const errorText = await response.text();
  console.error(`[LLM] ❌ API retornou erro ${response.status}:`, errorText);
  
  if (response.status === 401) {
    throw new Error('Autenticação falhou: API Key inválida ou expirada. Verifique OPENAI_API_KEY no Vercel.');
  } else if (response.status === 429) {
    throw new Error('Limite de requisições excedido: Quota atingida. Verifique platform.openai.com/usage');
  } else if (response.status >= 500) {
    throw new Error(`OpenAI temporariamente indisponível: ${response.status}`);
  }
  
  throw new Error(`API request failed: ${response.status} ${errorText}`);
}
```

**Benefícios:**
- ✅ 401: Indica problema com API Key (fácil de resolver)
- ✅ 429: Indica quota excedida (precisa upgrade de plano)
- ✅ 500+: Indica problema no servidor da OpenAI (aguardar)
- ✅ Log do erro completo no Vercel

### 3. Validação de Estrutura da Resposta
```typescript
// DEPOIS: Valida estrutura da resposta
let data: LLMResponse;
try {
  data = await response.json();
} catch (jsonError) {
  console.error('[LLM] ❌ Erro ao fazer parse do JSON:', jsonError);
  throw new Error('Resposta da API em formato inválido');
}

if (!data.choices?.[0]?.message?.content) {
  console.error('[LLM] ❌ Estrutura inválida:', JSON.stringify(data).substring(0, 200));
  throw new Error('Resposta não contém "choices[0].message.content"');
}

console.log(`[LLM] ✅ Resposta OK (${data.choices[0].message.content.length} chars)`);
```

**Benefícios:**
- ✅ Detecta JSON mal formado
- ✅ Detecta estrutura incompleta da OpenAI
- ✅ Log do tamanho da resposta para debug

### 4. Logging de Cada Etapa do LLM Call
```typescript
console.log(`[LLM] 🔄 Chamando ${provider} API...`);
// ... fetch ...
console.log(`[LLM] ✅ Resposta recebida (${chars} caracteres)`);
```

**Benefícios:**
- ✅ Rastro completo da chamada
- ✅ Identifica em qual etapa falhou
- ✅ Facilita debug em produção

---

## 📊 Como Usar os Novos Logs

### 1. Acessar Logs do Vercel
```bash
vercel logs atherarun.com --since 1h --token=YOUR_TOKEN
```

### 2. Procurar por Erros Específicos
```bash
# Erro de autenticação
grep "401\|API Key inválida" logs.txt

# Erro de quota
grep "429\|Quota atingida" logs.txt

# Erro de timeout
grep "timeout\|ETIMEDOUT" logs.txt

# Erro de parsing
grep "parse\|JSON inválido" logs.txt
```

### 3. Interpretar os Logs
```
[LLM] 🔄 Chamando openai API...
[LLM] ❌ API retornou erro 429: ...
[AI PLAN] ❌ ERRO CRÍTICO ao gerar plano
[AI PLAN] Nome: Error
[AI PLAN] Mensagem: Limite de requisições excedido: Quota atingida
```

**Diagnóstico:** Quota da OpenAI atingida  
**Solução:** Upgrade do plano OpenAI ou aguardar reset mensal

---

## 🚀 Próximos Passos

### Para o Usuário Teste0101019
1. ✅ **IMEDIATO:** Aguardar deploy (2-3 minutos)
2. ✅ **TESTE:** Tentar gerar plano novamente
3. ✅ **VERIFICAR:** Logs no Vercel para erro específico
4. ✅ **AGIR:** Resolver causa raiz (quota, timeout, etc)

### Ações Recomendadas (Pós-Debug)

**SE O ERRO FOR:**

1. **401 (API Key)**
   - Verificar OPENAI_API_KEY no Vercel
   - Gerar nova chave em platform.openai.com/api-keys
   - Atualizar variável no Vercel
   - Redeploy

2. **429 (Quota)**
   - Verificar uso em platform.openai.com/usage
   - Upgrade de plano se necessário
   - Implementar sistema de fila/retry
   - Considerar caching de planos

3. **Timeout**
   - Upgrade para Vercel Pro (60s timeout)
   - Otimizar prompt da IA (menor resposta)
   - Implementar geração assíncrona
   - Adicionar progress indicator

4. **JSON Parsing**
   - Revisar prompt da IA
   - Adicionar exemplos de formato correto
   - Implementar retry com prompt mais específico

---

## 📝 Arquivos Modificados

```
app/api/plan/generate/route.ts  (+15 linhas de logging)
lib/llm-client.ts               (+35 linhas de error handling)
```

**Commit:** `ac119e38`  
**Mensagem:** "fix(plan-generation): improve error handling and logging"

---

## 🧪 Como Testar

### 1. Criar Novo Usuário
```
Email: teste-debug-001@teste.com
Senha: test123456
```

### 2. Completar Onboarding
- Goal: 5k
- Date: 2 meses no futuro
- Level: beginner
- Schedule: 3 dias de corrida

### 3. Gerar Plano
- Clicar em "Gerar Plano"
- Observar console do browser
- Verificar logs do Vercel

### 4. Analisar Resultado
```javascript
// Se sucesso:
{
  success: true,
  plan: { ... },
  vdot: 42,
  paces: { ... }
}

// Se erro:
{
  success: false,
  error: "Erro ao gerar plano com IA",
  details: "Limite de requisições excedido: Quota atingida",
  type: "Error",
  hint: "Possíveis causas: quota OpenAI, timeout, formato inválido"
}
```

---

## ✅ Checklist Pós-Deploy

- [ ] Deploy concluído no Vercel
- [ ] Teste com usuário Teste0101019
- [ ] Verificar logs específicos do erro
- [ ] Identificar causa raiz (401, 429, timeout, parsing)
- [ ] Aplicar correção apropriada
- [ ] Testar novamente
- [ ] Atualizar documentação com causa e solução
- [ ] Considerar melhorias preventivas

---

## 📚 Documentação Relacionada

- `CONTEXTO.md` - Contexto geral do sistema
- `HISTORICO_COMPLETO_10NOV2025.md` - Histórico de correções
- `CHANGELOG.md` - Log de mudanças

---

**Status:** ✅ Melhorias implementadas e em deploy  
**Impacto:** Alta visibilidade de erros para diagnóstico rápido  
**Próximo:** Aguardar teste e identificar causa raiz específica  

---

**© 2025 Athera Run - Sistema de Treinamento Inteligente**
