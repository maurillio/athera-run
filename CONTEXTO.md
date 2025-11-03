# 🎯 CONTEXTO COMPLETO - Athera Run

> **ARQUIVO PRINCIPAL DE CONTEXTO** - Leia apenas este arquivo para entender tudo sobre o projeto

**Última atualização:** 03 de Novembro de 2025 17:56  
**Versão:** 1.1.0  
**Status:** 🟢 Produção Estável

---

## ⚡ TL;DR (Para IA)

**Athera Run** = Plataforma SaaS de treinamento de corrida com IA que gera planos 100% personalizados.

**Stack:**
- Frontend/Backend: Next.js 14 (App Router) + TypeScript
- Hosting: 100% Vercel (CI/CD automático via Git)
- Banco: PostgreSQL no servidor 45.232.21.67 (compartilhado dev/prod)
- IA: OpenAI GPT-4o direto (não Abacus!)
- Auth: NextAuth.js (Email + Google OAuth obrigatório)
- Integrações: Stripe (pagamentos) + Strava (atividades)
- Deploy: Git push → Vercel build → atherarun.com

**Ambiente Local:**
- Usado APENAS para escrever código
- Conecta no MESMO banco de dados do Vercel
- Não há servidor local de produção
- URLs produção: sempre atherarun.com (não localhost!)

---

## 📋 Checklist Rápida

Ao iniciar trabalho:
- [ ] Li este arquivo (CONTEXTO.md)
- [ ] Entendi: Vercel 100%, OpenAI direto, banco compartilhado
- [ ] Sei que devo atualizar documentação junto com código
- [ ] Vou rodar `./scripts/check-docs.sh` antes de commit

---

## 🏗️ INFRAESTRUTURA

### Hosting e Deploy
- **100% Vercel** (não há servidor local de produção)
- **CI/CD:** Git push → Vercel build automático → Deploy
- **Domínio:** atherarun.com (via GoDaddy)
- **Monitoramento:** Vercel Analytics

### Banco de Dados
- **PostgreSQL** no servidor próprio: `45.232.21.67`
- **Compartilhado:** Dev local e produção usam o MESMO banco
- **ORM:** Prisma 6.18.0
- **Futuro:** Migrar para solução escalável (Vercel Postgres, Supabase, etc)

### Variáveis de Ambiente
**Todas no Vercel Dashboard** (não localmente!):

```bash
# Database
DATABASE_URL=postgresql://user:pass@45.232.21.67:5432/atherarun

# NextAuth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://atherarun.com

# OpenAI (NÃO Abacus!)
OPENAI_API_KEY=sk-...
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o

# Google OAuth (OBRIGATÓRIO - feature crítica)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Strava
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...
STRAVA_REDIRECT_URI=https://atherarun.com/api/strava/callback

# Stripe (modo TEST)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 💻 STACK TECNOLÓGICO

### Frontend
- Next.js 14.2.28 (App Router)
- React 18.2.0
- TypeScript 5.2.2
- Tailwind CSS 3.4.18
- Shadcn UI + Radix UI
- Zustand 5.0 (state client)
- React Query 5.0 (state server)

### Backend
- Next.js API Routes (REST)
- Node.js 18+
- PostgreSQL 14+
- Prisma ORM 6.18.0
- NextAuth.js 4.24.11

### IA & Integrações
- **OpenAI GPT-4o** (geração de planos) - NÃO Abacus!
- **Stripe 19.2** (pagamentos e assinaturas)
- **Strava API** (OAuth 2.0 + webhooks)

---

## 🎯 PRODUTO

### O Que É
Plataforma SaaS que usa IA (GPT-4o) para gerar planos de treino de corrida 100% personalizados.

### Diferenciais
- Planos únicos (não templates)
- Sistema multi-corrida (classificação A/B/C automática)
- Integração Strava (sincronização automática)
- Periodização científica (VDOT Jack Daniels)
- Ajustes inteligentes da IA

### Funcionalidades Principais
1. **Onboarding** (5 etapas): Dados → Experiência → Disponibilidade → Corridas → Geração
2. **Geração de Planos**: IA cria plano semana a semana respeitando disponibilidade real
3. **Dashboard**: Visualização semanal, treinos do dia, progresso
4. **Multi-Corrida**: Gerencia várias provas (A/B/C), IA classifica automaticamente
5. **Strava**: OAuth + sincronização automática de atividades
6. **Stripe**: Assinaturas mensais/anuais + customer portal
7. **Chat IA**: Treinador virtual 24/7

### Planos
- **Free:** Dashboard básico, 1 plano simples
- **Premium Mensal:** R$ 29,90/mês - Tudo ilimitado
- **Premium Anual:** R$ 288/ano - 20% desconto

---

## 📂 ESTRUTURA DO CÓDIGO

```
athera-run/
├── nextjs_space/              # Aplicação principal
│   ├── app/                   # Next.js 14 App Router
│   │   ├── api/              # API Routes
│   │   │   ├── auth/         # NextAuth
│   │   │   ├── profile/      # Perfil atleta
│   │   │   ├── plan/         # Geração de planos
│   │   │   ├── race-goals/   # Multi-corrida
│   │   │   ├── workouts/     # Treinos
│   │   │   ├── subscription/ # Stripe
│   │   │   ├── strava/       # Strava OAuth
│   │   │   └── stripe/       # Stripe webhooks
│   │   ├── dashboard/        # Dashboard UI
│   │   ├── onboarding/       # Fluxo 5 etapas
│   │   ├── plano/            # Visualização plano
│   │   └── perfil/           # Perfil usuário
│   │
│   ├── lib/                   # Lógica de negócio
│   │   ├── ai-plan-generator.ts        # Gerador principal
│   │   ├── multi-race-plan-generator.ts # Sistema multi-corrida
│   │   ├── race-classifier.ts          # Classificador A/B/C
│   │   ├── llm-client.ts               # Cliente OpenAI
│   │   ├── strava.ts                   # Cliente Strava
│   │   ├── stripe.ts                   # Cliente Stripe
│   │   ├── subscription-service.ts     # Lógica assinaturas
│   │   └── vdotTables.ts               # Tabelas VDOT
│   │
│   └── prisma/
│       ├── schema.prisma     # Schema completo
│       └── migrations/       # Histórico
│
└── [DOCUMENTAÇÃO]            # 7 documentos principais
    ├── CONTEXTO.md           # 🎯 ESTE ARQUIVO (leia só ele!)
    ├── README.md             # Visão geral
    ├── LEIA_PRIMEIRO.md      # Navegação
    ├── DOCUMENTACAO.md       # Produto completo
    ├── GUIA_TECNICO.md       # Guia técnico
    ├── ROADMAP.md            # Features futuras
    └── MANUTENCAO_DOCUMENTACAO.md # Como manter
```

---

## 🔑 BANCO DE DADOS (Schema Resumido)

### Models Principais

**Autenticação:**
- `User` → `AthleteProfile` (1:1)
- `User` → `Subscription` (1:1)

**Corridas:**
- `AthleteProfile` → `RaceGoal[]` (1:N)
- `RaceGoal.priority`: 'A' | 'B' | 'C' (classificação automática)

**Planos:**
- `AthleteProfile` → `CustomTrainingPlan` (1:1)
- `CustomTrainingPlan` → `CustomWeek[]` (1:N)
- `CustomWeek` → `CustomWorkout[]` (1:N)

**Tracking:**
- `AthleteProfile` → `CompletedWorkout[]` (1:N)
- `CompletedWorkout.source`: 'manual' | 'strava'

---

## 🤖 GERAÇÃO DE PLANOS (Como Funciona)

### Fluxo
1. Usuário completa onboarding (5 etapas)
2. Sistema coleta: perfil + corridas + disponibilidade
3. IA classifica corridas (A/B/C)
4. Sistema calcula periodização (Base → Build → Peak → Taper)
5. **OpenAI GPT-4o** gera plano semana a semana
6. Sistema valida e salva no banco
7. Usuário acessa no dashboard

### Prompt para IA
```typescript
// Simplificado
`Você é treinador de corrida. Gere plano personalizado.

PERFIL: nível, experiência, volume atual
DISPONIBILIDADE: dias de corrida, musculação, etc
OBJETIVO: distância, data, meta tempo
CORRIDAS: A (principal), B (preparatórias), C (volume)

RESPEITE dias disponíveis!
PROGRESSÃO segura (max 10%/semana)
PERIODIZAÇÃO: Base → Build → Peak → Taper

RETORNE JSON com semanas e treinos`
```

### Provider
- ✅ **OpenAI GPT-4o** (direto, não Abacus!)
- Variáveis: `OPENAI_API_KEY`, `LLM_PROVIDER=openai`, `LLM_MODEL=gpt-4o`

---

## 🔐 AUTENTICAÇÃO

### Providers
- **Email/Senha** (bcryptjs)
- **Google OAuth** ✅ (OBRIGATÓRIO - feature crítica, não remover!)

### NextAuth.js
- Strategy: JWT
- Session: 30 dias
- Callbacks personalizados para Premium check

---

## 🔗 INTEGRAÇÕES

### Stripe (Pagamentos)
- **Modo:** TEST (ambiente de testes)
- **Webhook:** `https://atherarun.com/api/stripe/webhook`
- **Eventos:** subscription.*, invoice.*, checkout.session.completed
- **Customer Portal:** Gerenciar assinatura

### Strava (Atividades)
- **OAuth 2.0:** Authorization Callback Domain: `atherarun.com`
- **Callback:** `https://atherarun.com/api/strava/callback`
- **Scopes:** read, activity:read, activity:read_all
- **Webhook:** Sincronização automática de novas atividades
- **Tokens:** Refresh automático

---

## 🚀 FLUXO DE DESENVOLVIMENTO

### 1. Desenvolvimento Local
```bash
cd nextjs_space
yarn dev  # localhost:3000
# ⚠️ Conecta no MESMO banco do Vercel (45.232.21.67)
```

### 2. Commit & Push
```bash
git add .
git commit -m "feat: nova feature

- Mudança 1
- Mudança 2

Docs atualizadas:
- DOCUMENTACAO.md
- GUIA_TECNICO.md"

git push origin main
```

### 3. Deploy Automático
- Vercel detecta push
- Build automático
- Deploy em ~2-3 min
- Live: atherarun.com

### 4. Verificação
```bash
# SEMPRE rode antes de commit
./scripts/check-docs.sh
```

---

## ⚠️ REGRAS IMPORTANTES

### ✅ SEMPRE
1. **URLs produção:** `https://atherarun.com` (não localhost!)
2. **OpenAI direto** (não Abacus!)
3. **Google OAuth:** Manter sempre (feature crítica)
4. **Banco compartilhado:** Dev e prod no mesmo servidor
5. **Docs + código:** Commit juntos sempre
6. **Verificação:** Rodar `./scripts/check-docs.sh`

### ❌ NUNCA
1. **Abacus.AI:** Não usar, não mencionar
2. **localhost em produção:** Sempre atherarun.com
3. **PM2:** Não é mais usado
4. **Banco local:** Não existe, é compartilhado
5. **Docs desatualizados:** Atualizar junto com código
6. **Criar docs temporários:** Usar só os 7 principais

---

## 🐛 TROUBLESHOOTING RÁPIDO

### Plano não gera
1. Verificar `OPENAI_API_KEY` no Vercel
2. Confirmar `LLM_PROVIDER=openai` e `LLM_MODEL=gpt-4o`
3. Ver logs no Vercel

### Erro de banco
1. Verificar `DATABASE_URL` no Vercel
2. Confirmar acesso ao servidor 45.232.21.67
3. Testar: `yarn prisma db push`

### Strava não conecta
1. Verificar callback: `https://atherarun.com/api/strava/callback`
2. Confirmar Authorization Callback Domain: `atherarun.com`
3. Ver tokens no banco (criptografados)

### Stripe webhook falha
1. Verificar URL: `https://atherarun.com/api/stripe/webhook`
2. Confirmar `STRIPE_WEBHOOK_SECRET` no Vercel
3. Testar eventos no Dashboard Stripe

---

## 📊 STATUS ATUAL (Nov 2025)

### ✅ Implementado
- [x] Autenticação (Email + Google OAuth)
- [x] Onboarding 5 etapas
- [x] Geração de planos com IA (GPT-4o)
- [x] Sistema multi-corrida (A/B/C)
- [x] Dashboard interativo
- [x] Integração Strava completa
- [x] Sistema de assinaturas Stripe
- [x] Customer Portal
- [x] Chat com treinador virtual
- [x] Calculadoras (VDOT, nutrição)

### 🚧 Em Desenvolvimento (Q4 2025)
- [ ] Ajustes inteligentes automáticos
- [ ] Notificações e lembretes
- [ ] Analytics avançados
- [ ] Relatórios semanais por email

### 🔮 Roadmap 2026
- Q1: Badges, Garmin/Polar
- Q2: App mobile, social features
- Q3: Marketplace treinadores
- Q4: Internacionalização (EN, ES)

---

## 📚 DOCUMENTAÇÃO COMPLETA

Se precisar de mais detalhes, consulte:

| Documento | Quando Usar |
|-----------|-------------|
| **CONTEXTO.md** | ✅ **Sempre primeiro** (este arquivo) |
| **README.md** | Visão geral rápida do projeto |
| **LEIA_PRIMEIRO.md** | Navegação entre documentos |
| **DOCUMENTACAO.md** | Detalhes completos do produto |
| **GUIA_TECNICO.md** | Setup, APIs, integrações detalhadas |
| **ROADMAP.md** | Features futuras planejadas |
| **MANUTENCAO_DOCUMENTACAO.md** | Como manter docs atualizados |

---

## 🎯 CHECKLIST ANTES DE IMPLEMENTAR

```
□ Li CONTEXTO.md completo
□ Entendi: Vercel 100%, OpenAI direto, banco compartilhado
□ Sei qual documentação atualizar
□ Vou rodar ./scripts/check-docs.sh antes de commit
□ Vou commitar código + docs juntos
□ Sei que URLs são atherarun.com (não localhost)
□ Sei que é OpenAI GPT-4o (não Abacus)
```

---

## 💡 DICA PARA IA

Quando eu disser:
- **"Leia o contexto"** → Leia apenas este arquivo (CONTEXTO.md)
- **"Veja detalhes em X"** → Aí sim leia DOCUMENTACAO.md ou GUIA_TECNICO.md
- **"Como fazer Y?"** → Consulte GUIA_TECNICO.md

Este arquivo (CONTEXTO.md) contém 80% do que você precisa saber!

---

## 🔄 MANUTENÇÃO DESTE ARQUIVO

### Quando Atualizar CONTEXTO.md

⚠️ **SEMPRE** que mudar:
- Stack tecnológico (provider, banco, hosting)
- Infraestrutura (servidor, URLs)
- Integrações (adicionar/remover)
- Fluxo de desenvolvimento
- Regras importantes

### Versionamento
- Incrementar versão no topo
- Adicionar entrada em ATUALIZACAO_DOCUMENTACAO.md
- Commit: "docs: atualização de contexto v1.X.X"

---

## ✅ VERSÃO ATUAL

```
Versão: 1.1.0
Data: 03/Nov/2025 17:56
Stack: Next.js 14 + OpenAI GPT-4o + PostgreSQL + Vercel
Status: 🟢 Produção Estável
URL: https://atherarun.com
```

---

**© 2025 Athera Run**

---

# 🚀 INÍCIO RÁPIDO PARA IA

Cole isto quando iniciar sessão:

```
Leia CONTEXTO.md
```

Pronto! Você terá todo o contexto necessário. 🎯
