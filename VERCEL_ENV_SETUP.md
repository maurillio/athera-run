# 🔐 Configuração de Variáveis de Ambiente - Athera Flex

## Variáveis Novas Necessárias

### 1. OPENWEATHER_API_KEY (OBRIGATÓRIA)
**Para que serve:** Detectar clima e ajustar sugestões de treino  
**Como obter:**
1. Acesse: https://openweathermap.org/api
2. Crie conta gratuita
3. Vá em: My API Keys
4. Copie sua chave

**Adicionar no Vercel:**
```bash
vercel env add OPENWEATHER_API_KEY
# Cole o valor quando solicitado
# Selecione: Production, Preview, Development
```

---

### 2. CRON_SECRET (OBRIGATÓRIA)
**Para que serve:** Proteger endpoints de cron jobs  
**Como gerar:**
```bash
# Gere um token seguro
openssl rand -base64 32
```

**Adicionar no Vercel:**
```bash
vercel env add CRON_SECRET
# Cole o token gerado
# Selecione: Production, Preview, Development
```

---

### 3. OPENAI_API_KEY (RECOMENDADA)
**Para que serve:** Coach Chat e Explain Adjustment (IA conversacional)  
**Como obter:**
1. Acesse: https://platform.openai.com/api-keys
2. Crie uma API Key
3. Copie a chave (começa com sk-...)

**Custo estimado:** ~$0.01 por conversa (modelo gpt-4o-mini)

**Adicionar no Vercel:**
```bash
vercel env add OPENAI_API_KEY
# Cole a chave sk-...
# Selecione: Production, Preview, Development
```

---

### 4. LLM_PROVIDER e LLM_MODEL (OPCIONAL)
**Para que serve:** Configurar qual LLM usar  

**Opções:**
- `openai` + `gpt-4o` (padrão, mais inteligente)
- `openai` + `gpt-4o-mini` (mais barato, 90% da qualidade)
- `openrouter` + modelo customizado (agregador)

**Adicionar no Vercel:**
```bash
vercel env add LLM_PROVIDER production
# Digite: openai

vercel env add LLM_MODEL production
# Digite: gpt-4o-mini
```

---

## 📝 Resumo Rápido - Via Vercel Dashboard

Se preferir via interface:

1. Acesse: https://vercel.com/maurillios-projects/athera-run/settings/environment-variables

2. Adicione uma por uma:
   - **OPENWEATHER_API_KEY**: [sua chave]
   - **CRON_SECRET**: [token seguro gerado]
   - **OPENAI_API_KEY**: [sk-...] (opcional)
   - **LLM_PROVIDER**: openai (opcional)
   - **LLM_MODEL**: gpt-4o-mini (opcional)

3. Marque: ✅ Production, ✅ Preview, ✅ Development

4. Clique em **Save**

5. **IMPORTANTE:** Faça um redeploy após adicionar:
   ```bash
   vercel --prod
   ```

---

## 🚨 Comportamento Sem as Variáveis

### Sem OPENWEATHER_API_KEY:
- ❌ Context Awareness de clima não funciona
- ✅ Resto do Athera Flex funciona normalmente

### Sem CRON_SECRET:
- ❌ Cron jobs rejeitam requests (erro 401)
- ✅ Features manuais funcionam

### Sem OPENAI_API_KEY:
- ❌ Coach Chat retorna erro
- ❌ Explain Adjustment não funciona
- ✅ Resto do Athera Flex funciona

---

## ✅ Verificação Pós-Configuração

Após adicionar as variáveis e fazer redeploy, teste:

1. **Clima:**
   - Abra página de plano
   - Verifique console por erros de WeatherService

2. **Coach Chat:**
   - Abra modal de ajuste
   - Clique em "Perguntar ao Coach"
   - Deve responder (não dar erro)

3. **Explain:**
   - Clique em "Explicar este ajuste"
   - Deve mostrar explicação detalhada

---

## 🔑 Onde Guardar as Chaves

**NUNCA commitar no código!**

✅ Vercel Dashboard  
✅ Vercel CLI (`vercel env add`)  
✅ `.env.local` (local development, já no .gitignore)  

❌ `.env`  
❌ GitHub  
❌ Código fonte  

---

## 📞 Suporte

Se tiver dúvidas sobre alguma variável, me pergunte!
