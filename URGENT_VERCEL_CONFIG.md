# 🚨 URGENTE: CONFIGURAÇÃO DO VERCEL

**Data:** 01/11/2025 21:27 UTC  
**Prioridade:** 🔴 CRÍTICA

---

## ⚠️ PROBLEMA IDENTIFICADO

O `NEXTAUTH_URL` no arquivo `.env` local está configurado como:
```
NEXTAUTH_URL=https://atherarun.com
```

Mas você está usando **VERCEL** agora! Precisa atualizar no Vercel Dashboard.

---

## 🔧 CORREÇÃO URGENTE

### 1. Acessar Vercel Dashboard

1. Ir para: https://vercel.com/dashboard
2. Selecionar projeto: **athera-run**
3. Ir em **Settings** > **Environment Variables**

### 2. Atualizar NEXTAUTH_URL

**Encontrar variável:** `NEXTAUTH_URL`

**Valor deve ser:** `https://SEU-PROJETO.vercel.app`

Exemplo:
```
NEXTAUTH_URL=https://athera-run-xxxx.vercel.app
```

**IMPORTANTE:** Use a URL EXATA do Vercel, não `atherarun.com`

### 3. Atualizar Google OAuth

Depois de atualizar NEXTAUTH_URL, também precisa atualizar no Google:

1. Acessar: https://console.cloud.google.com/apis/credentials
2. Editar OAuth 2.0 Client ID
3. **Authorized redirect URIs**, adicionar:
   ```
   https://SEU-PROJETO.vercel.app/api/auth/callback/google
   ```
4. Salvar

### 4. Redeploy no Vercel

Após atualizar variáveis:
1. No Vercel Dashboard, ir em **Deployments**
2. Clicar nos 3 pontos do último deployment
3. Clicar em **Redeploy**

---

## 📋 OUTRAS VARIÁVEIS IMPORTANTES NO VERCEL

Verificar se TODAS essas estão configuradas:

```env
# Auth
NEXTAUTH_URL=https://seu-projeto.vercel.app
NEXTAUTH_SECRET=seu_secret_aqui

# Google OAuth
GOOGLE_CLIENT_ID=758125025535-677gg04ripanm44lav7ikg44db0v1jfc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Database
DATABASE_URL=sua_connection_string_aqui

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...

# OpenAI
OPENAI_API_KEY=sk-proj-...
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini

# Strava (se usar)
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...
STRAVA_REDIRECT_URI=https://seu-projeto.vercel.app/api/strava/callback
```

---

## 🎯 APÓS CORREÇÃO

### O usuário precisa:

1. **Limpar cookies do browser**
   - Chrome: Settings > Privacy > Clear browsing data
   - Firefox: Settings > Privacy > Clear Data
   - Safari: Preferences > Privacy > Manage Website Data

2. **Acessar aplicação novamente**
   - URL do Vercel: https://seu-projeto.vercel.app

3. **Fazer login com Google**
   - Deve funcionar agora

4. **Verificar Premium Badge**
   - Após login, deve aparecer badge "Premium"

---

## ✅ VERIFICAÇÃO RÁPIDA

Execute para ver a URL atual do Vercel:

```bash
vercel ls
```

Ou veja no Dashboard do Vercel qual é a URL de produção.

---

## 🔴 AÇÃO IMEDIATA NECESSÁRIA

1. [ ] Ver URL do projeto no Vercel Dashboard
2. [ ] Atualizar NEXTAUTH_URL com URL do Vercel
3. [ ] Atualizar callback no Google Console
4. [ ] Fazer redeploy
5. [ ] Testar login com Google
6. [ ] Confirmar que Premium Badge aparece

---

**Sem essa correção, o login com Google NÃO VAI FUNCIONAR!**

**Tempo estimado:** 5 minutos  
**Dificuldade:** Fácil  
**Impacto:** 🔴 CRÍTICO
