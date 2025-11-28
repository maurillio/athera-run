# 🔄 Plano de Separação: Ambientes Dev e Produção

**Data:** 28/Nov/2025  
**Versão Atual:** v3.2.7  
**Status:** 📋 PLANEJAMENTO

---

## 🎯 Objetivo

Separar completamente os ambientes de **desenvolvimento** e **produção** para permitir testes seguros sem afetar usuários reais.

### 📍 URLs Alvo

| Ambiente | URL | Banco de Dados | Branch |
|----------|-----|----------------|--------|
| **Produção** | `atherarun.com` | Neon Production | `main` |
| **Development** | `athera-run.vercel.app` | Neon Development | `develop` |

---

## ✅ Sim, é Possível!

O Vercel permite múltiplos ambientes através de:
1. **Production deployment** - Branch `main` → `atherarun.com`
2. **Preview deployments** - Branch `develop` → `athera-run-*.vercel.app`
3. **Environment Variables** - Diferentes variáveis por ambiente

---

## 📋 Checklist de Implementação

### Fase 1: Preparação (15 min)

#### 1.1 Criar Branch de Desenvolvimento
```bash
# Criar branch develop a partir da main
git checkout main
git pull origin main
git checkout -b develop
git push origin develop
```

#### 1.2 Criar Banco de Dados Development no Neon
- [ ] Acessar Neon Console (https://console.neon.tech)
- [ ] Criar novo projeto: `athera-run-dev`
- [ ] Região: `US East (Virginia)` (mesma da produção)
- [ ] PostgreSQL 16.9
- [ ] Copiar connection string

#### 1.3 Aplicar Schema no Banco Development
```sql
-- Rodar manualmente no Neon Console SQL Editor
-- Copiar todo o schema de:
-- prisma/schema.prisma → gerar SQL com npx prisma migrate diff

-- OU executar migrations existentes:
-- Copiar queries de APLICAR_MIGRATION_MANUAL_NEON.sql
```

---

### Fase 2: Configuração Vercel (20 min)

#### 2.1 Configurar Git Integration
No Vercel Dashboard:
1. **Settings** → **Git**
2. **Production Branch**: `main`
3. **Preview Branches**: `develop` e `feature/*`

#### 2.2 Configurar Environment Variables

##### 🔴 Production (atherarun.com)
Environment: `Production`  
Branch: `main`

```env
# Database (Neon Production)
DATABASE_URL=postgresql://neondb_owner:...@...-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
DIRECT_URL=postgresql://neondb_owner:...@ep-...us-east-2.aws.neon.tech/neondb?sslmode=require

# NextAuth (Production)
NEXTAUTH_URL=https://atherarun.com
NEXTAUTH_SECRET=<production_secret_diferente>

# Strava (Production App)
STRAVA_CLIENT_ID=<production_app_id>
STRAVA_CLIENT_SECRET=<production_app_secret>

# Stripe (Production Keys)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# OpenAI (Production)
OPENAI_API_KEY=<production_key>
```

##### 🟢 Development (athera-run.vercel.app)
Environment: `Preview`  
Branch: `develop`

```env
# Database (Neon Development)
DATABASE_URL=postgresql://...@...-pooler.us-east-2.aws.neon.tech/neondb_dev?sslmode=require&pgbouncer=true
DIRECT_URL=postgresql://...@ep-...us-east-2.aws.neon.tech/neondb_dev?sslmode=require

# NextAuth (Development)
NEXTAUTH_URL=https://athera-run-git-develop-maurillios-projects.vercel.app
NEXTAUTH_SECRET=<development_secret_diferente>

# Strava (Development App)
STRAVA_CLIENT_ID=<development_app_id>
STRAVA_CLIENT_SECRET=<development_app_secret>

# Stripe (Test Keys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# OpenAI (Development)
OPENAI_API_KEY=<development_key_ou_mesmo>
```

#### 2.3 Configurar Domain
1. **Production** → **Domains** → `atherarun.com` (já configurado)
2. **Preview** → usar URL automática do Vercel

---

### Fase 3: Configuração Strava (30 min)

#### 3.1 Criar App Strava de Development
1. Acessar: https://www.strava.com/settings/api
2. **Create New Application**
   - **Application Name**: `Athera Run Dev`
   - **Category**: Training
   - **Website**: `https://athera-run-git-develop-maurillios-projects.vercel.app`
   - **Authorization Callback Domain**: `athera-run-git-develop-maurillios-projects.vercel.app`

3. Copiar credenciais:
   - `Client ID`
   - `Client Secret`

#### 3.2 Atualizar App Strava de Production
Verificar se callback URL está correto:
- **Authorization Callback Domain**: `atherarun.com`

---

### Fase 4: Ajustes no Código (15 min)

#### 4.1 Criar arquivo de configuração de ambiente

**Arquivo:** `lib/config/environment.ts`
```typescript
export const ENV = {
  isProd: process.env.VERCEL_ENV === 'production',
  isDev: process.env.VERCEL_ENV === 'preview',
  isLocal: process.env.NODE_ENV === 'development',
  
  // URLs
  appUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  
  // Database
  databaseUrl: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_URL,
  
  // Features (habilitadas por ambiente)
  features: {
    enableAnalytics: process.env.VERCEL_ENV === 'production',
    enableDebugLogs: process.env.VERCEL_ENV !== 'production',
    enableTestData: process.env.VERCEL_ENV === 'preview',
  }
} as const;

export type Environment = typeof ENV;
```

#### 4.2 Adicionar indicador visual no dev

**Arquivo:** `app/layout.tsx`
```typescript
import { ENV } from '@/lib/config/environment';

// Adicionar no body (apenas em dev)
{ENV.isDev && (
  <div className="fixed bottom-4 left-4 z-50 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
    🚧 DEVELOPMENT
  </div>
)}
```

#### 4.3 Atualizar .gitignore
```gitignore
# Environment variables - já existe
.env
.env.local
.env.*.local

# Adicionar explicitamente
.env.development
.env.production
```

---

### Fase 5: Workflow de Deploy (10 min)

#### 5.1 Criar arquivo de configuração

**Arquivo:** `vercel.json`
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "installCommand": "npm install --force",
  "git": {
    "deploymentEnabled": {
      "main": true,
      "develop": true
    }
  }
}
```

#### 5.2 Workflow de Branches

```
main (production)
├── atherarun.com
├── Auto-deploy on push
└── Protegida (requer PR)

develop (development)  
├── athera-run-*.vercel.app
├── Auto-deploy on push
└── Aceita push direto

feature/* (preview)
├── athera-run-*.vercel.app
├── Auto-deploy on push
└── Temporário (deletado após merge)
```

---

## 🔒 Segurança

### Proteção de Credenciais

#### ✅ O que ESTÁ seguro:
- Todas variáveis no Vercel (nunca commitadas)
- Secrets diferentes por ambiente
- Connection strings isoladas por banco

#### ❌ O que NÃO fazer:
- ❌ Commitar `.env` ou `.env.local`
- ❌ Usar mesmas credenciais em dev e prod
- ❌ Compartilhar tokens de produção
- ❌ Hardcoded secrets no código

---

## 📊 Validação

### Checklist Pós-Deploy

#### Production (atherarun.com)
- [ ] URL acessível
- [ ] Login funciona (NextAuth)
- [ ] Banco de dados conectado (Neon Production)
- [ ] Strava OAuth funciona
- [ ] Stripe (pagamentos reais)
- [ ] Sem badge "DEVELOPMENT"

#### Development (athera-run.vercel.app)
- [ ] URL acessível
- [ ] Login funciona (NextAuth)
- [ ] Banco de dados conectado (Neon Development)
- [ ] Strava OAuth funciona (app dev)
- [ ] Stripe (test mode)
- [ ] Badge "🚧 DEVELOPMENT" visível

---

## 🚀 Processo de Deploy

### Fluxo Recomendado

```bash
# 1. Desenvolvimento local
git checkout develop
# ... fazer mudanças ...
git add .
git commit -m "feat: nova feature"
git push origin develop
# ✅ Deploy automático para athera-run.vercel.app

# 2. Testar no ambiente de dev
# Acessar https://athera-run-*.vercel.app
# Validar todas as mudanças

# 3. Promover para produção
git checkout main
git merge develop --no-ff
git push origin main
# ✅ Deploy automático para atherarun.com
```

---

## 📝 Migrações de Banco

### Aplicar Migration em Dev
```bash
# 1. Testar migration localmente (opcional)
npx prisma migrate dev --name nome_da_migration

# 2. Gerar SQL para aplicar manualmente no Neon Dev
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma \
  --script > migration_dev.sql

# 3. Aplicar no Neon Dev Console
# Copiar conteúdo de migration_dev.sql
# Colar no SQL Editor do Neon Dev
# Executar

# 4. Testar no ambiente de dev
# Acessar athera-run.vercel.app
```

### Promover para Produção
```bash
# Apenas após validação completa em dev:

# 1. Gerar SQL para produção (mesmo arquivo)
# 2. Aplicar no Neon Production Console
# 3. Deploy da branch main
# 4. Validar em atherarun.com
```

---

## 🎯 Próximos Passos

### Ordem de Execução

1. **Criar branch develop** (5 min)
2. **Criar banco Neon Dev** (5 min)
3. **Aplicar schema no banco dev** (10 min)
4. **Configurar Vercel** (20 min)
   - Production/Preview branches
   - Environment variables
5. **Criar app Strava Dev** (10 min)
6. **Ajustar código** (15 min)
   - `lib/config/environment.ts`
   - Badge development em `app/layout.tsx`
7. **Primeiro deploy de teste** (5 min)
8. **Validação completa** (15 min)

**Tempo Total Estimado:** ~1h30min

---

## 📋 Query para Criar Schema no Banco Dev

```sql
-- Este SQL será executado manualmente no Neon Console (Development)
-- Depois de criado o banco athera-run-dev

-- Copiar e executar o schema completo do arquivo:
-- prisma/schema.prisma

-- OU usar as migrations existentes de:
-- APLICAR_MIGRATION_MANUAL_NEON.sql
-- MIGRATION_v3_2_1_STRAVA_COMPLETE.sql

-- Validar após execução:
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

---

## 📚 Documentação Atualizada

Após implementação, atualizar:

- [ ] `CONTEXTO.md` - Adicionar seção "Ambientes"
- [ ] `README.md` - Documentar URLs de dev
- [ ] `CHANGELOG.md` - Registrar v3.2.8 (dev environment)
- [ ] Criar `GUIA_AMBIENTES.md` - Guia completo para devs

---

## ❓ Perguntas Frequentes

### 1. Posso usar o mesmo banco para dev e prod?
❌ **NÃO recomendado**. Ambientes separados evitam:
- Corromper dados de produção
- Conflitos de schema
- Lentidão em testes
- Dados de teste misturados

### 2. Preciso de dois apps no Strava?
✅ **Sim**. Cada app tem seu callback URL único.

### 3. E se eu esquecer variáveis no dev?
⚠️ Build vai falhar. Sempre copiar todas as variáveis de prod para dev (com valores diferentes).

### 4. Como reverter deploy em produção?
```bash
# No Vercel Dashboard → Deployments → Find last good deployment → Promote to Production
```

### 5. Posso fazer push direto na main?
❌ **Não recomendado**. Usar PRs de `develop` → `main` para revisão.

---

## ✅ Resultado Final

```
┌─────────────────────────────────────────────┐
│  🔴 PRODUCTION (main)                       │
│  atherarun.com                              │
│  ✅ Usuários reais                          │
│  ✅ Banco Neon Production                   │
│  ✅ Strava App Production                   │
│  ✅ Stripe Live Keys                        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  🟢 DEVELOPMENT (develop)                   │
│  athera-run.vercel.app                      │
│  ✅ Testes seguros                          │
│  ✅ Banco Neon Development                  │
│  ✅ Strava App Development                  │
│  ✅ Stripe Test Keys                        │
│  ✅ Badge "🚧 DEVELOPMENT"                  │
└─────────────────────────────────────────────┘
```

---

**Status:** 📋 Pronto para implementação  
**Próxima Ação:** Criar branch develop e banco Neon Dev
