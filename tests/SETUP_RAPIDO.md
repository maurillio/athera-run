# 🚀 Setup Rápido - Testes Automatizados

## Opção 1: GitHub Actions (Recomendado - Zero setup local)

### Passo 1: Configurar Secrets no GitHub

1. Vá para: **GitHub Repository → Settings → Secrets and variables → Actions**
2. Clique em **"New repository secret"**
3. Adicione os seguintes secrets (copie do Vercel Dashboard):

```
DATABASE_URL         = postgresql://...
NEXTAUTH_SECRET      = ...
NEXTAUTH_URL         = https://atherarun.com
OPENAI_API_KEY       = sk-...
```

### Passo 2: Commit o arquivo de workflow

```bash
git add .github/workflows/tests.yml
git commit -m "ci: add automated tests workflow"
git push origin main
```

### Passo 3: Ver resultados

1. GitHub → Actions tab
2. Veja os testes rodando em tempo real
3. ✅ Green = passou | ❌ Red = falhou

---

## Opção 2: Vercel Checks (Integrado ao deploy)

Adicione ao `vercel.json`:

```json
{
  "buildCommand": "npm run build && npm run test:health",
  "installCommand": "npm ci",
  "framework": "nextjs"
}
```

Agora a cada deploy:
1. Build → OK
2. Tests → OK
3. Deploy → OK

Se testes falharem → **Deploy é bloqueado!** ✅

---

## Opção 3: Rodar Local (quando tiver as vars)

### Setup único:

```bash
# Instale Vercel CLI
npm i -g vercel

# Login
vercel login

# Link ao projeto
vercel link

# Puxe as variáveis
vercel env pull .env.local
```

### Depois disso, sempre que quiser:

```bash
npm run test:health      # 30 segundos
npm run test:convergence # 2-3 minutos
npm run test:all         # Tudo
```

---

## 🎯 Recomendação Final

**Para você agora:**
1. ✅ Configure **GitHub Actions** (Opção 1)
2. ✅ Adicione secrets do Vercel no GitHub
3. ✅ Commit o workflow
4. ✅ A cada push → testes rodam automático
5. ✅ **Zero setup local necessário!**

**Benefícios:**
- ✅ Não precisa de .env.local
- ✅ Não precisa rodar manualmente
- ✅ Previne bugs em produção
- ✅ CI/CD profissional

---

## 📊 O que você vai ver

Toda vez que fizer push:

```
GitHub Actions
├─ ✅ Health Check (30s)
│  ├─ ✅ Database connected
│  ├─ ✅ Environment variables OK
│  └─ ✅ Schema valid
│
└─ ✅ Convergence Tests (2-3min)
   ├─ ✅ beginner_5k (89.4% convergence)
   └─ ✅ intermediate_half (91.2% convergence)

🎉 All tests passed! Ready to deploy.
```

---

**Quer que eu crie o arquivo do GitHub Actions agora?** Já criei! 
Está em `.github/workflows/tests.yml` ✅

Só falta você:
1. Adicionar os secrets no GitHub
2. Fazer commit e push
3. Ver a mágica acontecer! 🚀
