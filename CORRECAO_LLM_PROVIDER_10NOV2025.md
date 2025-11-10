# 🔧 Correção do Provider LLM - 10/NOV/2025

## 📋 Resumo
Removidas todas as referências ao Abacus AI e configurado OpenAI como provider padrão.

## ❌ Problema Identificado
- O código ainda tinha Abacus AI como fallback padrão
- Causava erro 500 na geração de planos
- Usuário reportou múltiplas vezes que não usa mais Abacus AI

## ✅ Correções Realizadas

### 1. **lib/llm-client.ts**
```typescript
// ANTES (ERRADO):
case 'abacusai':
default:
  url = 'https://apps.abacus.ai/v1/chat/completions';
  headers = {
    'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
  };

// DEPOIS (CORRETO):
case 'openai':
default:
  url = 'https://api.openai.com/v1/chat/completions';
  headers = {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
  };
```

### 2. **Configuração do Provider**
- **Provider Padrão**: OpenAI
- **Modelo Padrão**: gpt-4o
- **Fallback**: OpenAI (não mais Abacus AI)

## 🔐 Variáveis de Ambiente no Vercel

**Obrigatórias:**
```bash
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o
OPENAI_API_KEY=sk-proj-xxxxx
```

**Opcional (se usar OpenRouter):**
```bash
LLM_PROVIDER=openrouter
LLM_MODEL=openai/gpt-4o
OPENROUTER_API_KEY=sk-or-xxxxx
```

## 🎯 Provider Suportados

1. **OpenAI** (Padrão)
   - URL: `https://api.openai.com/v1/chat/completions`
   - Modelo: `gpt-4o` ou `gpt-4o-mini`
   - Requer: `OPENAI_API_KEY`

2. **OpenRouter** (Alternativo)
   - URL: `https://openrouter.ai/api/v1/chat/completions`
   - Modelo: `openai/gpt-4o`
   - Requer: `OPENROUTER_API_KEY`

## ✅ Validação

### Código Limpo
- ✅ Sem referências ao Abacus AI no código fonte
- ✅ OpenAI como provider padrão
- ✅ Fallback correto para OpenAI

### Deploy
```bash
git add lib/llm-client.ts
git commit -m "fix: Remove Abacus AI references, use OpenAI as default LLM provider"
git push
```

## 🧪 Como Testar

1. **Criar novo usuário**
2. **Completar onboarding**
3. **Verificar geração do plano**
4. **Confirmar que não há erro 500**

## 📝 Commit
- **SHA**: `6f88f18c`
- **Mensagem**: "fix: Remove Abacus AI references, use OpenAI as default LLM provider"
- **Data**: 10/NOV/2025

## ⚠️ Importante

**NÃO USAR MAIS ABACUS AI**
- Sistema migrado completamente para OpenAI
- Abacus AI não é mais suportado
- Todas as chamadas LLM usam OpenAI ou OpenRouter

## 🚀 Próximos Passos

1. ✅ **Deploy realizado**
2. ⏳ **Aguardar deploy no Vercel**
3. ⏳ **Testar com usuário teste47474@teste.com**
4. ⏳ **Confirmar que plano é gerado corretamente**

---

**Status**: ✅ Correção implementada e enviada para produção
**Versão**: v2.0.1
