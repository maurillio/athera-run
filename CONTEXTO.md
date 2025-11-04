# 🎯 CONTEXTO COMPLETO - Athera Run

> **ARQUIVO PRINCIPAL DE CONTEXTO** - Leia apenas este arquivo para entender tudo sobre o projeto

**Última atualização:** 04 de Novembro de 2025 21:30 UTC  
**Versão Atual:** 1.3.0 (100% Implementado, Auditado e Testado)  
**Próxima Versão:** 1.4.0 (Internacionalização - i18n) - EM IMPLEMENTAÇÃO (92%)  
**Status:** ✅ v1.3.0 Produção Completa | 🌐 v1.4.0 Perfil 100% ✅

> **🚀 NOVA SESSÃO?** Leia primeiro: [PROXIMA_SESSAO.md](./PROXIMA_SESSAO.md)  
> **🌐 i18n v1.4.0:** Perfil 100% Completo - Ver: [SESSAO_04NOV2025_i18n_FASE9.5_PERFIL.md](./SESSAO_04NOV2025_i18n_FASE9.5_PERFIL.md)

### 🎉 V1.3.0 COMPLETO E TESTADO - AUDIT PASSED + ONBOARDING REVISADO (04/Nov/2025 12:56)
1. ✅ **Database Schema** - 38 campos, 13 novos v1.3.0, migração aplicada
2. ✅ **Utility Libraries** - 1,795 linhas científicas (5 bibliotecas)
3. ✅ **Onboarding v1.3.0** - 8 componentes, 7 fases, **100% COBERTURA CAMPOS** (revisado 04/Nov)
4. ✅ **Profile Tabs v1.3.0** - 7 componentes integrados, -64% código
5. ✅ **AI Context Builder** - 9 seções, 100% dados utilizados
6. ✅ **APIs Updated** - Create, Update, Generate, Auto-Adjust
7. ✅ **Build Success** - Zero erros TypeScript
8. ✅ **Convergence 100%** - Todos os campos rastreados
9. ✅ **Google OAuth** - Funcionando (callback fix aplicado)
10. ✅ **Admin Access** - Restaurado e testado
11. ✅ **Mobile /perfil** - Corrigido (Safari iOS)
12. ✅ **Production Ready** - Live at atherarun.com
13. ✅ **User Tested** - mmaurillio2@gmail.com confirmou funcionamento
14. ✅ **Onboarding Revision** - 3 componentes atualizados, +290 linhas, 100% campos coletados

### 🌐 V1.4.0 EM ANDAMENTO - i18n Multi-idioma (04/Nov/2025 21:30)
1. ✅ **Build System Fix** - Webpack alias configurado + TypeScript 5.9.3 instalado
2. ✅ **Path Resolution** - @/ imports funcionando (components, lib, hooks)
3. ✅ **Infraestrutura Completa** - lib/i18n/, config, hooks, middleware
4. ✅ **Translations BASE** - 1000+ keys × 3 idiomas (pt-BR, en, es) = 3000+ keys
5. ✅ **[locale] Structure** - app/[locale]/ layout e routing
6. ✅ **LanguageSwitcher** - Component completo com cookie persistence
7. ✅ **Login/Signup Pages** - 100% i18n em 3 idiomas, build passando
8. ✅ **Onboarding 100% COMPLETO (7/7 steps)** ⭐
   - ✅ Main Page - Estrutura completa (7 steps, progress bar, navigation)
   - ✅ Step1BasicData - Age, gender, weight, height, physiological data
   - ✅ Step2SportBackground - Running experience, other sports
   - ✅ Step3Performance - Best times, VDOT calculation
   - ✅ Step4Health - Injuries, recovery status, physiological data
   - ✅ Step5Goals - Primary/secondary goals, motivations
   - ✅ Step6Availability - Training days, activities, infrastructure, preferences
   - ✅ Step7Review - Summary, confirmation, generate plan
9. ✅ **Dashboard 100% COMPLETO** ⭐
   - ✅ Welcome section, generate plan card, quick stats
   - ✅ Upcoming workouts (hoje/amanhã)
   - ✅ Quick access menu, advanced features
   - ✅ Workout log dialog componentizado
10. ✅ **Plano 100% COMPLETO** ⭐
   - ✅ Summary cards (4: goal, week, progress, duration)
   - ✅ Week navigation (anterior/próxima/atual)
   - ✅ Workout list com estados visuais
   - ✅ Week focus, quick actions, no plan state
11. ✅ **Perfil 100% COMPLETO** ⭐
   - ✅ 4 tabs (Profile, Medical, Races, Actions)
   - ✅ Regenerate Plan e Delete Profile actions
   - ✅ Toast messages e dialogs traduzidos
12. ⏳ **Components Globais** - Header, Footer (PRÓXIMO - 2h)
13. ⏳ **Backend Integration** - User.locale field, API updates
14. ⏳ **Deploy e Testes** - 3 idiomas funcionais em produção

**Progresso:** 15% → 92% (Perfil 100% completo) ⭐  
**Rotas i18n:** Login, Signup, Onboarding, Dashboard, Plano, Perfil (6 rotas × 3 idiomas = 18 rotas)  
**Translation Keys Totais:** ~3,000 implementadas  
**Cobertura Detalhada:**
  - Common: 40 keys × 3 = 120
  - Auth: 45 keys × 3 = 135
  - Onboarding: 300 keys × 3 = 900
  - Dashboard: 70 keys × 3 = 210
  - Plano: 70 keys × 3 = 210
  - Perfil: 60 keys × 3 = 180
  - **Total: ~585 unique keys × 3 idiomas = ~1,755 translation keys**
**Documentação:** [SESSAO_04NOV2025_i18n_FASE9.5_PERFIL.md](./SESSAO_04NOV2025_i18n_FASE9.5_PERFIL.md)  
**Próximo:** FASE 9.6 - Components Globais (Header, Footer) - 2h  
**Estimativa:** 5-7h restantes (~1 sessão)  
**Build:** ✅ Passing (warnings esperados para páginas dinâmicas)

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

## 📊 STATUS V1.3.0 - ✅ 100% COMPLETO

**Ver detalhes completos:** [V1.3.0_AUDIT_CONVERGENCE.md](./V1.3.0_AUDIT_CONVERGENCE.md)

### Resumo Executivo

| Componente | Status | Detalhes |
|------------|--------|----------|
| **Database Schema** | ✅ 100% | 38 campos (25→38, +13 novos) |
| **Utility Libraries** | ✅ 100% | 1,795 linhas científicas |
| **Onboarding v1.3.0** | ✅ 100% | 8 componentes, 7 fases |
| **Profile Tabs v1.3.0** | ✅ 100% | 7 componentes, -64% código |
| **AI Integration** | ✅ 100% | 9 seções análise, 100% dados |
| **APIs** | ✅ 100% | 4 endpoints atualizados |
| **Build** | ✅ 100% | Zero erros TypeScript |
| **Convergence** | ✅ 100% | Todos campos rastreados |
| **Documentation** | ✅ 100% | Audit report completo |
| **Production** | ✅ 100% | Live at atherarun.com |

### Campos Novos v1.3.0 (13 total) - ✅ 100% COLETADOS NO ONBOARDING

**Fisiologia (3):** ✅
- `restingHeartRate` - FC repouso (40-80 bpm) - Step4Health
- `sleepQuality` - Qualidade sono (1-5) - Step4Health
- `stressLevel` - Nível estresse (1-5) - Step4Health

**Base Aeróbica (2):** ✅
- `otherSportsExperience` - Outros esportes - Step2SportBackground
- `otherSportsYears` - Anos em outros esportes - Step2SportBackground

**Lesões Detalhadas (3):** ✅
- `injuryDetails` - Array completo lesões - Step4Health (revisado 04/Nov)
- `injuryRecoveryStatus` - Status recuperação - Step4Health (revisado 04/Nov)
- `lastInjuryDate` - Data última lesão - Step4Health (revisado 04/Nov)

**Performance (2):** ✅
- `bestTimes` - Melhores tempos por distância - Step3Performance
- `lastVDOTUpdate` - Última atualização VDOT - Auto-calculado

**Infraestrutura (3):** ✅
- `hasGymAccess` - Acesso academia/musculação - Step6Availability (adicionado 04/Nov)
- `hasPoolAccess` - Acesso piscina/natação - Step6Availability (adicionado 04/Nov)
- `hasTrackAccess` - Acesso pista atletismo - Step6Availability (adicionado 04/Nov)

**Preferências (2):** ✅
- `trainingPreferences` - Preferências treino (locations, preferred, group, indoor) - Step6Availability (expandido 04/Nov)
- `motivationFactors` - Motivação e objetivos (primary, secondary, goals) - Step5Goals (estruturado 04/Nov)

---

## 📊 ANTIGA SEÇÃO STATUS V1.3.0 (DEPRECATED)

### Implementado (70%)
- ✅ Onboarding 3-fase claro e intuitivo
- ✅ Sexo apenas M/F (correto)
- ✅ Rest day sem botão concluir
- ✅ Auto-adjust API corrigida
- ✅ Perfil editável (interface pronta)
- ✅ Build + Deploy bem-sucedido

### Pendente (30%)
- ⏳ Auto-ajuste com trigger automático
- ⏳ Rest day com sugestões IA
- ⏳ Perfil 100% editável (faltam UIs)
- ⏳ Validação de inconsistências

**Ver detalhes:** `V1.3.0_VALIDATION_FINAL.md`

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

## 💎 RECURSOS PREMIUM vs FREE

### 🆓 Free (R$ 0)
- ✅ Geração de plano personalizado com IA (GPT-4o)
- ✅ Dashboard completo com visualização semanal
- ✅ Calculadoras (VDOT, nutrição, pace)
- ✅ Sistema multi-corridas (A/B/C)
- ✅ Chat com treinador virtual (IA)
- ✅ **Auto-ajuste progressivo** - Preserva histórico ao mudar disponibilidade
- ✅ **Atualização automática** - Regenera futuro, mantém passado
- ✅ **IA em descanso** - Sugestões personalizadas por fase
- ✅ **Validação de disponibilidade** - 100% escolha do usuário
- ❌ Integração Strava (sync automático)
- ❌ Análise inteligente de progresso
- ❌ Sugestões automáticas de ajuste baseadas em treinos/feedbacks

### ⭐ Premium (R$ 29,90/mês ou R$ 288/ano)
- ✅ **Tudo do Free +**
- ✅ **Integração Strava** - Sincronização automática de treinos
- ✅ **Análise Inteligente de Progresso** - IA analisa seus treinos e feedbacks
- ✅ **Ajustes Automáticos Inteligentes** baseados em:
  - Taxa de conclusão de treinos
  - Feedbacks e relatos de fadiga/dor
  - Dados do Strava (ritmo, frequência cardíaca)
  - Padrões de desempenho
- ✅ **Notificações Proativas** - Sistema avisa quando detecta necessidade de ajuste
- ✅ **Relatórios Detalhados** - Análise semanal do progresso

## 🔧 AUTO-AJUSTE PROGRESSIVO

### Como Funciona (FREE):
```
Usuário altera disponibilidade (ex: adiciona musculação)
    ↓
Sistema identifica: Hoje = Semana 5
    ↓
PRESERVA:
✅ Semanas 1-4 (passado completo)
✅ Treinos completados da semana 5
✅ Taxa de conclusão mantida (ex: 95%)
✅ Histórico de km/semana
✅ Gráficos de evolução
    ↓
AJUSTA:
🔄 Treinos futuros da semana 5
🔄 Todas as semanas 6-16
    ↓
RESULTADO:
✅ Histórico preservado
✅ Futuro adaptado às mudanças
💬 "Plano ajustado! 4 semanas anteriores preservadas."
```

### Vantagens:
- 🎯 **Correto conceitualmente**: Ajuste = mudar FUTURO
- 📊 **Preserva valor**: Histórico do atleta é precioso
- 📈 **Gráficos funcionam**: Evolução visível
- 🔢 **Estatísticas mantidas**: Taxa de conclusão real
- 💪 **Respeita esforço**: Treinos completados preservados

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

## 🚀 NOVIDADES v1.3.0 (03/Nov/2025)

### ✅ Backend 100% Implementado
- [x] **Schema expandido:** 38 campos (era 25)
- [x] **5 Utility Libraries:** 60KB de lógica científica
  - VDOT Calculator (Jack Daniels)
  - Injury Analyzer (50+ exercícios)
  - Recovery Adjuster (overtraining detection)
  - Onboarding Validator (smart validation)
  - AI Context Builder (100% data usage)
- [x] **APIs atualizadas:** Create + Update com todos os campos
- [x] **IA aprimorada:** Contexto completo (9 seções)

### 🔄 Frontend em Progresso
- [ ] Onboarding redesign (7 etapas)
- [ ] Perfil com tabs (6 abas)
- [ ] Componentes polidos

---

## 📊 STATUS ATUAL (Nov 2025)

### ✅ Implementado
- [x] Autenticação (Email + Google OAuth)
- [x] Onboarding 5 etapas
- [x] Geração de planos com IA (GPT-4o)
- [x] Sistema multi-corrida (A/B/C)
- [x] Dashboard interativo
- [x] Integração Strava completa (Premium)
- [x] Sistema de assinaturas Stripe
- [x] Customer Portal
- [x] Chat com treinador virtual
- [x] Calculadoras (VDOT, nutrição)
- [x] **Auto-ajuste progressivo (FREE)** - Preserva histórico
- [x] **Análise inteligente de progresso (Premium)**
- [x] **Validação de disponibilidade** (100% escolha do usuário)
- [x] **IA em dias de descanso** - Sugestões contextuais
- [x] **Consistência título/descrição** - KM sincronizados
- [x] **Transação atômica** - Plano nunca fica quebrado

### 🚧 Em Desenvolvimento (Q4 2025)
- [x] Ajustes inteligentes automáticos (Premium) ✅ CONCLUÍDO
- [x] Auto-ajuste progressivo (FREE) ✅ CONCLUÍDO
- [x] IA em dias de descanso ✅ CONCLUÍDO
- [ ] Notificações e lembretes por email
- [ ] Analytics avançados e dashboards
- [ ] Relatórios semanais por email automáticos

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
Versão: 1.2.0
Data: 03/Nov/2025 19:41
Stack: Next.js 14 + OpenAI GPT-4o + PostgreSQL + Vercel
Status: 🟢 Produção Estável
URL: https://atherarun.com

NOVIDADES v1.2.0:
✅ Auto-ajuste progressivo (preserva histórico)
✅ IA em dias de descanso (sugestões contextuais)
✅ Consistência título/descrição
✅ Transação atômica (plano nunca quebra)
✅ Gênero apenas M/F (precisão VDOT)
✅ Botão confirmação oculto em descanso
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
