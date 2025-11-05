# 🔍 DEBUG - Google OAuth Callback Error

**Error:** `Erro no callback de autenticação`  
**URL:** `https://atherarun.com/login?callbackUrl=https%3A%2F%2Fatherarun.com%2Fdashboard&error=Callback`  
**Date:** 05/Nov/2025 13:00 UTC

---

## 🎯 DIAGNÓSTICO RÁPIDO

### Causa Provável:
O erro `error=Callback` significa que o NextAuth falhou ao processar o callback do Google.

**Possíveis causas:**
1. ❌ Variáveis de ambiente faltando/incorretas no Vercel
2. ❌ Middleware bloqueando callback
3. ❌ Sessão/cookies corrompidos
4. ❌ Google Cloud Console ainda propagando mudanças

---

## ✅ SOLUÇÃO PASSO A PASSO

### 1️⃣ VERIFICAR VERCEL ENVIRONMENT VARIABLES (CRÍTICO)

**Acesse:** https://vercel.com/[seu-usuario]/athera-run/settings/environment-variables

**DEVE ter TODAS estas variáveis:**

```bash
NEXTAUTH_URL=https://atherarun.com
NEXTAUTH_SECRET=[algum-valor-longo-32-chars]
GOOGLE_CLIENT_ID=[seu-google-client-id.apps.googleusercontent.com]
GOOGLE_CLIENT_SECRET=[seu-google-client-secret]
DATABASE_URL=postgresql://...
```

**⚠️ ERROS COMUNS:**

❌ `NEXTAUTH_URL=https://atherarun.com/` (com barra no final)  
✅ `NEXTAUTH_URL=https://atherarun.com` (sem barra)

❌ `NEXTAUTH_SECRET` faltando ou vazio  
✅ `NEXTAUTH_SECRET=algum-hash-longo-gerado`

❌ `GOOGLE_CLIENT_ID` incompleto ou errado  
✅ `GOOGLE_CLIENT_ID=123456789-abc...apps.googleusercontent.com`

---

### 2️⃣ GERAR NOVO NEXTAUTH_SECRET (SE NECESSÁRIO)

Se `NEXTAUTH_SECRET` não existir ou estiver corrompido:

```bash
# Gerar novo secret
openssl rand -base64 32
```

**Copie o resultado e:**
1. Vá em Vercel > Settings > Environment Variables
2. Adicione/Edite `NEXTAUTH_SECRET`
3. Cole o valor gerado
4. Salve
5. Clique em **Redeploy**

---

### 3️⃣ VERIFICAR GOOGLE CLOUD CONSOLE

**Acesse:** https://console.cloud.google.com/apis/credentials

**Credenciais OAuth 2.0 Client:**

**URIs de redirecionamento autorizados DEVEM incluir:**
```
https://atherarun.com/api/auth/callback/google
```

**⚠️ Importante:**
- Exatamente essa URL (sem espaços, sem barra no final)
- Se você editou recentemente, aguarde **2-5 minutos** para propagar

---

### 4️⃣ LIMPAR CACHE E COOKIES

**No seu navegador:**

1. Abra **DevTools** (F12)
2. Vá em **Application** > **Cookies**
3. Delete TODOS os cookies de `atherarun.com`
4. Vá em **Application** > **Local Storage**
5. Delete tudo de `atherarun.com`
6. **Feche o navegador completamente**
7. Reabra em **janela anônima** (Ctrl+Shift+N)

---

### 5️⃣ FORÇAR REDEPLOY NO VERCEL

**Acesse:** https://vercel.com/[seu-usuario]/athera-run/deployments

1. Clique no último deployment
2. Clique nos 3 pontinhos (...)
3. Clique em **Redeploy**
4. Aguarde 2-3 minutos

---

### 6️⃣ TESTAR NOVAMENTE

**Em janela anônima:**

1. Vá para: https://atherarun.com/login
2. Clique em **"Continuar com Google"**
3. Selecione sua conta
4. Autorize

**✅ Deve funcionar agora!**

---

## 🐛 SE AINDA DER ERRO

### Ver logs detalhados no Vercel:

**Acesse:** https://vercel.com/[seu-usuario]/athera-run/logs

**Procure por:**
- `[AUTH]` - Logs de autenticação
- `Error` - Erros
- `callback` - Problemas no callback
- `NEXTAUTH_SECRET` - Variável faltando

**Copie e cole aqui o erro completo para análise.**

---

## 🔧 VERIFICAÇÃO TÉCNICA

### Testar endpoint callback manualmente:

```bash
curl -I https://atherarun.com/api/auth/callback/google
```

**Resposta esperada:**
```
HTTP/2 400
```
(400 é normal sem parâmetros, confirma que rota existe)

---

### Verificar se middleware está deployed:

```bash
curl -I https://atherarun.com/dashboard
```

**Resposta esperada:**
```
HTTP/2 307 (redirect para login se não autenticado)
```

---

## 📋 CHECKLIST COMPLETO

```
Vercel Environment Variables:
□ NEXTAUTH_URL = https://atherarun.com (sem barra no final)
□ NEXTAUTH_SECRET = [existe e tem 32+ chars]
□ GOOGLE_CLIENT_ID = [correto do Google Console]
□ GOOGLE_CLIENT_SECRET = [correto do Google Console]
□ DATABASE_URL = [correto]

Google Cloud Console:
□ URI https://atherarun.com/api/auth/callback/google cadastrada
□ Salvou e aguardou 2-5 minutos

Vercel Deployment:
□ Último deploy foi commit 7f7c7a9 (middleware fix)
□ Status: Ready ✅
□ Redeploy feito após adicionar env vars (se necessário)

Browser:
□ Cookies limpos
□ Cache limpo
□ Testado em janela anônima
□ Navegador atualizado

Teste:
□ Login com Google funciona
□ Redireciona para /dashboard
□ Sem erro "Callback"
```

---

## 🆘 SOLUÇÃO DEFINITIVA

Se NADA funcionar, faça isso:

### 1. Recriar variáveis do zero:

```bash
# 1. Deletar TODAS as env vars de auth no Vercel
# 2. Adicionar novamente:

NEXTAUTH_URL=https://atherarun.com
NEXTAUTH_SECRET=$(openssl rand -base64 32)
GOOGLE_CLIENT_ID=[copiar-do-google-console]
GOOGLE_CLIENT_SECRET=[copiar-do-google-console]

# 3. Redeploy
```

### 2. Verificar Google Client ID/Secret:

No Google Cloud Console:
1. Vá em Credentials
2. Clique no seu OAuth 2.0 Client
3. **Copie novamente** Client ID e Client Secret
4. **Cole no Vercel** (sobrescrever)
5. Redeploy

---

## 📞 PRÓXIMOS PASSOS

Depois de seguir TODOS os passos acima:

1. ✅ Funcionou? → Ótimo! Pode continuar desenvolvendo
2. ❌ Ainda com erro? → Me envie:
   - Screenshot do erro
   - Logs do Vercel (últimas 50 linhas)
   - Screenshot das env vars do Vercel (censurar secrets)
   - URL completa do erro

---

**Última atualização:** 05/Nov/2025 13:05 UTC
