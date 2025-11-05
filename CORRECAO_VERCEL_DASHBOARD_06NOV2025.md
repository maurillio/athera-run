# 🚀 GUIA: Corrigir Deploy no Vercel - 06 NOV 2025

## 🔴 PROBLEMA

```
Build Failed
The specified Root Directory "nextjs_space" does not exist.
Please update your Project Settings.
```

## ✅ SOLUÇÃO

O projeto foi reestruturado e agora está **na raiz**, mas o Dashboard do Vercel ainda aponta para `nextjs_space` (que não existe mais).

---

## 📋 PASSO A PASSO - CORREÇÃO NO VERCEL DASHBOARD

### 1️⃣ Acessar o Dashboard do Vercel

1. Vá para: https://vercel.com/dashboard
2. Faça login com sua conta
3. Selecione o projeto **athera-run**

### 2️⃣ Abrir Settings do Projeto

1. No projeto `athera-run`, clique na aba **"Settings"** (no topo)
2. No menu lateral esquerdo, clique em **"General"**

### 3️⃣ Remover Root Directory

Role até a seção **"Root Directory"**

**Estado Atual (ERRADO):**
```
Root Directory: nextjs_space
```

**Estado Correto:**
```
Root Directory: .
```
ou deixe vazio (o que significa raiz do repositório)

**AÇÃO:**
1. Clique no botão **"Edit"** ao lado de "Root Directory"
2. **DELETE** o texto `nextjs_space`
3. Deixe vazio OU coloque apenas `.` (ponto)
4. Clique em **"Save"**

### 4️⃣ Confirmar Build Command

Na mesma página de Settings, verifique a seção **"Build & Development Settings"**

**Build Command deve ser:**
```bash
npx prisma generate && npx prisma migrate deploy && npm run build
```

**Install Command deve ser:**
```bash
npm install --force
```

**Framework Preset:**
```
Next.js
```

Se algo estiver diferente, clique em **"Override"** e ajuste.

### 5️⃣ Fazer Redeploy

1. Volte para a aba **"Deployments"**
2. Clique nos 3 pontinhos (⋮) ao lado do último deploy
3. Clique em **"Redeploy"**
4. Confirme clicando em **"Redeploy"** novamente

**OU** simplesmente faça um novo push no Git:
```bash
git commit --allow-empty -m "trigger: redeploy after fixing root directory"
git push origin main
```

---

## ✅ VALIDAÇÃO

Após o redeploy, você deve ver:

### Build Logs (Esperado)
```
✓ Cloning completed
✓ Running "npm install --force"
✓ Running "npx prisma generate"
✓ Running "npx prisma migrate deploy"
✓ Running "npm run build"
✓ Compiled successfully
✓ Build completed
```

### Deploy Success
```
✅ Deployment Ready
   https://atherarun.com
```

---

## 🔍 TROUBLESHOOTING

### Se ainda der erro de "Root Directory"

1. **Limpar Cache do Vercel:**
   - Settings → General → scroll até o fim
   - Clique em **"Clear Cache"**
   - Faça redeploy

2. **Verificar no repositório Git:**
   ```bash
   # Na raiz do projeto local
   ls -la

   # Você DEVE ver:
   # - package.json
   # - next.config.js
   # - app/
   # - prisma/
   # - components/
   ```

3. **Reconectar repositório:**
   - Settings → Git
   - Disconnect and reconnect the repository
   - Refazer configurações

### Se der erro de variáveis de ambiente

Verifique em **Settings → Environment Variables** que todas estão configuradas:

**Essenciais:**
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `OPENAI_API_KEY`
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`

---

## 📊 ESTRUTURA DO PROJETO (Atual - Correto)

```
athera-run/                  ← Raiz do repositório
├── .git/
├── .vercel/
├── app/                     ← Next.js App Router
│   ├── [locale]/
│   └── api/
├── components/
├── lib/
├── prisma/
│   └── schema.prisma
├── public/
├── package.json             ← Na RAIZ
├── next.config.js           ← Na RAIZ
├── tsconfig.json
├── vercel.json              ← Configuração Vercel
└── README.md
```

**❌ NÃO existe mais:**
```
athera-run/
└── nextjs_space/  ← REMOVIDO! Tudo foi movido para a raiz
```

---

## 🎯 RESUMO DA CORREÇÃO

1. ✅ Código está correto na raiz
2. ✅ `vercel.json` local está correto
3. ✅ Build local funciona
4. ⚠️ **Dashboard Vercel precisa ser atualizado manualmente**
   - Remover `Root Directory: nextjs_space`
   - Deixar vazio ou colocar `.`
5. ✅ Fazer redeploy

---

## 📞 SE PRECISAR DE AJUDA

Se após seguir todos os passos ainda houver problemas:

1. **Capture screenshots:**
   - Settings → General → Root Directory
   - Build logs do último deploy

2. **Compartilhe comigo** para análise

3. **Logs úteis:**
   - Vercel Dashboard → Deployments → Click no deploy → View Function Logs

---

**Criado em:** 06 NOV 2025 - 20:30 (Horário de Brasília)
**Autor:** Claude Code (Anthropic)
**Status:** ✅ Solução validada localmente
