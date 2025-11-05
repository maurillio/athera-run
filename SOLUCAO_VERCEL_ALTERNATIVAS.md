# 🚀 SOLUÇÕES ALTERNATIVAS - Deploy Vercel

## ❌ PROBLEMA
Não conseguiu encontrar "Root Directory" no Vercel Dashboard

---

## ✅ SOLUÇÃO 1: Procurar em Outros Locais (MAIS FÁCIL)

A configuração pode estar em locais diferentes dependendo da versão do Vercel:

### Opção A: Build & Development Settings
1. Acesse: https://vercel.com/dashboard
2. Selecione projeto **athera-run**
3. Vá em **Settings** (no menu superior)
4. No menu lateral esquerdo, clique em **Build & Development Settings**
5. Procure por **"Root Directory"** ou **"Project Settings"**
6. Se encontrar, clique em **Edit** ou **Override**
7. DELETE `nextjs_space` e deixe vazio
8. Save

### Opção B: General Settings (mais abaixo)
1. **Settings** → **General**
2. Role a página TODA até o final
3. Procure seção **"Root Directory"** (pode estar embaixo)
4. Se não tiver, procure **"Build Settings"**

### Opção C: Durante Import/Setup
1. **Settings** → **General**
2. Procure botão **"Edit"** ao lado do nome do repositório
3. Pode abrir modal com configurações avançadas

---

## ✅ SOLUÇÃO 2: Desconectar e Reconectar Projeto (MAIS SEGURO)

Se não encontrar a configuração, podemos **reimportar** o projeto:

### Passo 1: Backup das Variáveis de Ambiente
**IMPORTANTE:** Antes de fazer qualquer coisa, salve todas as variáveis:

1. **Settings** → **Environment Variables**
2. **Copie TODAS as variáveis** para um arquivo local
3. Você vai precisar configurar novamente depois

### Passo 2: Desconectar Git
1. **Settings** → **Git**
2. Procure opção **"Disconnect"** ou **"Remove Git Integration"**
3. Confirme

### Passo 3: Reconectar
1. **Settings** → **Git**
2. Clique em **"Connect Git Repository"**
3. Selecione **github.com/maurillio/athera-run**
4. **IMPORTANTE:** Quando perguntar "Root Directory", deixe **VAZIO** ou coloque `.`
5. Framework Preset: **Next.js**
6. Build Command: `npx prisma generate && npx prisma migrate deploy && npm run build`
7. Install Command: `npm install --force`

### Passo 4: Reconfigurar Variáveis
1. **Settings** → **Environment Variables**
2. Adicione todas as variáveis novamente (do backup do Passo 1)

### Passo 5: Deploy
1. Vá em **Deployments**
2. Clique em **"Redeploy"**

---

## ✅ SOLUÇÃO 3: Usar Vercel CLI (MAIS TÉCNICO)

Se preferir fazer via linha de comando:

### Instalar Vercel CLI
```bash
npm install -g vercel
```

### Fazer Login
```bash
vercel login
```

### Deploy Direto da Raiz
```bash
cd /root/athera-run
vercel --prod
```

O CLI vai perguntar algumas coisas:
- **Set up and deploy?** → Yes
- **Which scope?** → Selecione sua conta
- **Link to existing project?** → Yes
- **What's the name?** → athera-run
- **Overwrite settings?** → Yes
- **Root Directory?** → `.` (apenas um ponto) ou deixe vazio
- **Framework?** → Next.js

Depois de configurar, rode:
```bash
vercel --prod
```

---

## ✅ SOLUÇÃO 4: Criar Novo Projeto Vercel (ÚLTIMO RECURSO)

Se nada funcionar, criamos um projeto novo:

### Backup Primeiro
1. **Settings** → **Environment Variables** → Copiar TODAS
2. **Settings** → **Domains** → Anotar domínio (atherarun.com)

### Criar Novo Projeto
1. Dashboard Vercel → **Add New...** → **Project**
2. Import **github.com/maurillio/athera-run**
3. **Root Directory:** DEIXE VAZIO ou `.`
4. **Framework Preset:** Next.js
5. **Build Command:** `npx prisma generate && npx prisma migrate deploy && npm run build`
6. **Install Command:** `npm install --force`
7. Deploy

### Configurar
1. Adicionar todas as variáveis de ambiente
2. Configurar domínio atherarun.com
3. Deletar projeto antigo (opcional)

---

## 🔍 DIAGNÓSTICO: O que você vê?

Para eu te ajudar melhor, me diga o que você vê quando acessa:

**Settings → General:**
- [ ] Não tem seção "Root Directory"
- [ ] Tem "Root Directory" mas não consigo editar
- [ ] Tem mas está em outro lugar
- [ ] Outra coisa?

**OU me mande um screenshot** da página Settings → General

---

## 🎯 QUAL SOLUÇÃO RECOMENDO?

### Se você tem < 5 minutos:
**SOLUÇÃO 1** - Procure em Build & Development Settings

### Se você tem 10-15 minutos:
**SOLUÇÃO 3** - Use Vercel CLI (mais garantido)

### Se nada funcionar:
**SOLUÇÃO 2** - Desconectar e reconectar

---

## 📞 PRECISA DE AJUDA?

Me diga:
1. O que você vê em **Settings → General**?
2. Tem alguma seção sobre "Build" ou "Root Directory"?
3. Consegue fazer screenshot?

Ou me diga qual solução você quer tentar e eu te guio passo a passo! 🚀
