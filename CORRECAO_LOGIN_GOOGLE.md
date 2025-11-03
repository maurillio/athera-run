# 🔧 CORREÇÃO - Erro Login Google

**Problema:** "Erro no callback de autenticação" ao tentar login com Google  
**Data:** 03 de Novembro de 2025 22:45 UTC

---

## 🎯 CAUSA MAIS PROVÁVEL

O erro acontece porque uma das seguintes configurações está incorreta:

1. **NEXTAUTH_URL** no Vercel está incorreta (provavelmente localhost)
2. **Redirect URI** não está autorizada no Google Cloud Console
3. **NEXTAUTH_SECRET** ausente ou inválido

---

## ✅ SOLUÇÃO - PASSO A PASSO

### 1️⃣ ADICIONAR VARIÁVEL NEXTAUTH_URL NO VERCEL ⚠️

**🚨 VOCÊ CONFIRMOU QUE ELA NÃO EXISTE - ESSE É O PROBLEMA!**

**Acesse:** https://vercel.com/maurillios-projects/athera-run/settings/environment-variables

**Clique em "Add New" e adicione:**

| Name | Value |
|------|-------|
| `NEXTAUTH_URL` | `https://atherarun.com` |

**Clique em "Save"**

**⚠️ ATENÇÃO:**
- Digite **EXATAMENTE**: `https://atherarun.com`
- SEM barra no final
- SEM espaços
- Environment: **Production, Preview, Development** (marque todos)

---

### 1.2️⃣ VERIFICAR OUTRAS VARIÁVEIS

**Verificar se ESTAS já existem (não precisa adicionar se já tiver):**

- ✅ `NEXTAUTH_SECRET` (string longa qualquer)
- ✅ `GOOGLE_CLIENT_ID` (seu client id do Google)
- ✅ `GOOGLE_CLIENT_SECRET` (seu secret do Google)

---

### 2️⃣ VERIFICAR GOOGLE CLOUD CONSOLE

**Acesse:** https://console.cloud.google.com/apis/credentials

**Passos:**

1. Clique no seu **OAuth 2.0 Client ID** (o que você está usando)
2. Role até **"Authorized redirect URIs"**
3. **VERIFICAR** se existe esta URL:
   ```
   https://atherarun.com/api/auth/callback/google
   ```

**Se NÃO existir:**

4. Clique em **"+ ADD URI"**
5. Cole: `https://atherarun.com/api/auth/callback/google`
6. Clique em **"SAVE"**

**⚠️ ATENÇÃO:**
- A URL deve ser **EXATAMENTE** como mostrado acima
- Não pode ter espaços ou barra no final
- Deve começar com `https://`

---

### 3️⃣ REDEPLOY NO VERCEL

**Acesse:** https://vercel.com/maurillios-projects/athera-run/deployments

**Passos:**

1. Clique no deployment mais recente (primeiro da lista)
2. Clique nos **3 pontinhos** (⋮) no canto superior direito
3. Clique em **"Redeploy"**
4. Confirme o redeploy
5. Aguarde o build completar (1-2 minutos)

---

## 🧪 TESTAR

Após fazer as correções acima:

1. Acesse: https://atherarun.com/login
2. Clique em **"Continuar com Google"**
3. Faça login com sua conta Google
4. Deve redirecionar para o dashboard SEM erros

---

## 🔍 SE AINDA NÃO FUNCIONAR

### Verificar Logs do Vercel

1. Acesse: https://vercel.com/maurillios-projects/athera-run/logs
2. Clique em **"Functions"**
3. Procure por erros com `[AUTH]` no log
4. Me envie a mensagem de erro completa

### Limpar Cache do Navegador

1. Abra DevTools (F12)
2. Clique com botão direito no ícone de refresh
3. Selecione **"Empty Cache and Hard Reload"**
4. Tente o login novamente

---

## 📋 CHECKLIST COMPLETO

### No Vercel (Environment Variables)
- [ ] `NEXTAUTH_URL=https://atherarun.com` (sem barra final)
- [ ] `NEXTAUTH_SECRET=(string longa qualquer)`
- [ ] `GOOGLE_CLIENT_ID=(seu client id)`
- [ ] `GOOGLE_CLIENT_SECRET=(seu secret)`

### No Google Cloud Console
- [ ] Redirect URI: `https://atherarun.com/api/auth/callback/google`
- [ ] Credenciais salvas

### Após Correções
- [ ] Redeploy feito no Vercel
- [ ] Build completado com sucesso
- [ ] Login testado e funcionando

---

## 💡 EXPLICAÇÃO TÉCNICA

O erro acontece porque:

1. **NextAuth** tenta redirecionar o usuário de volta após autenticação Google
2. A URL de callback deve bater EXATAMENTE com o que está configurado no Google
3. Se `NEXTAUTH_URL` estiver errada, o callback vai para URL incorreta
4. Google rejeita a requisição porque a URL não está autorizada

**Fluxo Correto:**
```
Usuário clica em "Login Google"
  ↓
Google autentica
  ↓
Google redireciona para: https://atherarun.com/api/auth/callback/google
  ↓
NextAuth processa o callback
  ↓
Usuário é logado e vai para /dashboard
```

---

## 🚀 AÇÃO IMEDIATA

**FAÇA AGORA:**

1. Verifique `NEXTAUTH_URL` no Vercel
2. Se estiver errada, corrija para `https://atherarun.com`
3. Adicione redirect URI no Google Cloud Console
4. Redeploy no Vercel
5. Teste o login

**Tempo estimado:** 5 minutos

---

**Status:** ⏳ Aguardando correção  
**URL:** https://atherarun.com/login
