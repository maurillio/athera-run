# 📚 Athera Run - Documentação Completa

> Plataforma inteligente de treinamento de corrida com IA

**Última atualização:** 27 de Novembro de 2025  
**Versão:** 3.2.4 (Strava Sync Idempotent)  
**URL Produção:** https://atherarun.com
**Status:** ✅ Sistema 100% funcional - Sincronização Strava idempotente

---

## 🎯 Atualizações Recentes

### v3.2.4 - Sincronização Idempotente (27/Nov/2025)
- 🐛 **BUGFIX**: Corrigido erro de constraint de unicidade em `stravaActivityId`
- ✅ Verificação de existência antes de criar `CompletedWorkout`
- ✅ Sincronização pode rodar múltiplas vezes sem erros
- ✅ Logs diferenciados para novos syncs vs já sincronizados
- 📄 Status: Operacional em produção

### v3.2.3 - Correção Sincronização Strava (27/Nov/2025)
- 🐛 **BUGFIX**: Corrigido erro `Cannot read properties of undefined (reading 'athleteProfile')`
- ✅ Query Prisma agora usa `CustomWorkout` com relacionamentos corretos
- ✅ Treinos do Strava marcam automaticamente workouts do plano como completos
- ✅ Criação de `CompletedWorkout` com dados do Strava (distância, pace, FC, etc)
- ✅ Vinculação bidirecional entre `CustomWorkout` ↔ `CompletedWorkout`
- 📄 Ver: [SESSAO_27NOV2025_RESUMO.md](SESSAO_27NOV2025_RESUMO.md)

### v3.2.2 - Logo e Brand Identity (26/Nov/2025)
- ✨ Implementado logo oficial do Athera Run
- ✅ Componente `<Logo />` reutilizável
- ✅ Favicon SVG com gradiente da marca
- ✅ Consistência visual em toda aplicação

### v1.7.5 - Correção Crítica Race Day (10/Nov/2025)
- 🚨 **CRITICAL**: Corridas alvo agora são consideradas na geração do plano
- ✅ Query busca status 'active' E 'upcoming' (onboarding usa 'upcoming')
- ✅ No dia da corrida, aparece a corrida cadastrada (não mais treino)
- ✅ IA gera tapering e estratégia correta para a corrida alvo
- 📄 Ver: [CORRECAO_CRITICA_RACE_DAY_v1.7.5.md](CORRECAO_CRITICA_RACE_DAY_v1.7.5.md)

### v1.7.3 - Melhorias Step 6 Disponibilidade (09/Nov/2025)
- ✅ UX redesenhada para mobile-first
- ✅ Múltiplas atividades por dia (corrida + musculação + outros)
- ✅ Seleção de longão integrada sem clique duplo
- ✅ Visual simples e intuitivo para iniciantes

### v1.7.2 - Semanas Segunda→Domingo (09/Nov/2025)
- ✅ Calendário sempre exibe semanas Segunda→Domingo
- ✅ Compatível com padrão universal de calendários
- ✅ Dias antes do início marcados como "Preparação"

### v1.7.1 - Calendário com Datas Customizadas (08/Nov/2025)
- ✅ Sistema de datas 100% funcional
- ✅ dayOfWeek sempre corresponde ao date correto

### v1.5.1 - Correção Crítica (06/Nov/2025)
- ✅ **CRÍTICO**: Restaurados campos de Race Goal no onboarding
- ✅ Sistema end-to-end funcional novamente
- ✅ Usuários podem gerar planos após completar onboarding
- 📄 Ver: [CORRECAO_ONBOARDING_06NOV2025.md](CORRECAO_ONBOARDING_06NOV2025.md)

### v1.5.0 - Sistema i18n Completo (06/Nov/2025)
- ✅ Onboarding 100% traduzido em 3 idiomas
- ✅ Navegação multilíngua funcional

### v1.4.0 - Multilinguagem (05/Nov/2025)
- ✅ Suporte pt-BR, en, es
- ✅ 85% do sistema internacionalizado

---

## 📖 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Funcionalidades](#funcionalidades)
4. [Stack Tecnológico](#stack-tecnológico)
5. [Fluxo de Usuário](#fluxo-de-usuário)
6. [Integrações](#integrações)
7. [Banco de Dados](#banco-de-dados)
8. [Monetização](#monetização)

---

## 🎯 Visão Geral

### O que é Athera Run?

**Athera Run** é uma plataforma SaaS de treinamento de corrida que utiliza IA para gerar planos personalizados. Diferente de templates genéricos, cada plano é único e considera:

- **Perfil completo do atleta** (nível, peso, idade, experiência)
- **Disponibilidade real** (dias disponíveis para cada modalidade)
- **Múltiplas corridas** (sistema A/B/C de classificação automática)
- **Metodologia científica** (VDOT de Jack Daniels)
- **Integração com Strava** (sincronização automática de atividades)

### Diferenciais Competitivos

✅ **Planos 100% personalizados** - Não são templates, são gerados por IA  
✅ **Sistema multi-corrida** - Gerencia várias provas simultaneamente  
✅ **Classificação inteligente** - Identifica automaticamente corridas A/B/C  
✅ **Periodização científica** - Base, Build, Peak, Taper  
✅ **Integração Strava** - Sincronização automática de treinos  
✅ **Ajustes inteligentes** - IA monitora e ajusta o plano  
✅ **Chat com treinador virtual** - Suporte 24/7  

### Público-Alvo

- **Iniciantes** - Buscando estrutura para primeiras corridas
- **Intermediários** - Querendo melhorar tempos
- **Avançados** - Preparando para objetivos específicos
- **Corredores amadores** - 5K até Maratona

---

## 🏗️ Arquitetura

### Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  Next.js 14 (App Router) + React 18 + TypeScript            │
│  Tailwind CSS + Shadcn UI + Radix UI                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API LAYER                                │
│  Next.js API Routes (app/api/)                              │
│  - Authentication (NextAuth.js)                             │
│  - Profile Management                                        │
│  - Plan Generation                                           │
│  - Workout Tracking                                          │
│  - Race Goals                                                │
│  - Stripe Integration                                        │
│  - Strava Integration                                        │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   DATABASE       │ │   EXTERNAL APIs  │ │   AI SERVICES    │
│   PostgreSQL     │ │   - Strava       │ │   - Abacus.AI    │
│   via Prisma ORM │ │   - Stripe       │ │   - GPT-4o       │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

### Estrutura de Diretórios

```
nextjs_space/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Rotas de autenticação
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/                # Dashboard principal
│   ├── onboarding/               # Fluxo de cadastro (5 etapas)
│   │   ├── step1/               # Dados básicos
│   │   ├── step2/               # Nível e experiência
│   │   ├── step3/               # Disponibilidade
│   │   ├── step4/               # Corridas e objetivos
│   │   └── step5/               # Revisão e geração
│   ├── plano/                    # Visualização do plano
│   ├── perfil/                   # Perfil do atleta
│   ├── tracking/                 # Acompanhamento de treinos
│   └── api/                      # API Routes
│       ├── auth/                 # Autenticação
│       ├── profile/              # Perfil
│       ├── plan/                 # Geração e ajuste de planos
│       ├── race-goals/           # Múltiplas corridas
│       ├── workouts/             # Treinos
│       ├── subscription/         # Assinaturas
│       ├── strava/               # Integração Strava
│       └── stripe/               # Webhooks Stripe
│
├── components/                   # Componentes React
│   ├── ui/                      # Componentes Shadcn UI
│   ├── dashboard/               # Componentes do dashboard
│   ├── onboarding/              # Componentes do onboarding
│   └── plan/                    # Componentes do plano
│
├── lib/                         # Lógica de negócio
│   ├── ai-plan-generator.ts    # Gerador de planos com IA
│   ├── multi-race-plan-generator.ts  # Sistema multi-corrida
│   ├── race-classifier.ts       # Classificador A/B/C
│   ├── auto-adjust-service.ts   # Ajustes inteligentes
│   ├── strava.ts                # Cliente Strava
│   ├── stripe.ts                # Cliente Stripe
│   ├── subscription-service.ts  # Lógica de assinaturas
│   ├── llm-client.ts            # Cliente LLM (Abacus/OpenAI)
│   ├── vdotTables.ts            # Tabelas VDOT
│   ├── prisma.ts                # Cliente Prisma
│   └── utils.ts                 # Utilitários
│
├── prisma/                      # Banco de dados
│   ├── schema.prisma           # Schema do BD
│   └── migrations/             # Migrações
│
├── public/                      # Assets estáticos
└── scripts/                     # Scripts utilitários
```

---

## ⚡ Funcionalidades

### 1. Autenticação

- **Email/Senha** - Cadastro tradicional com bcrypt
- **Google OAuth** - Login social via NextAuth.js
- **Sessões seguras** - JWT tokens com refresh automático

### 2. Onboarding Inteligente (5 Etapas)

#### Step 1: Dados Básicos
- Nome, email, peso, altura, idade, gênero
- Validação em tempo real

#### Step 2: Nível e Experiência
- Nível de corrida (iniciante/intermediário/avançado)
- Anos de experiência
- Volume semanal atual
- Maior distância já corrida
- Descrição livre de experiências (analisada por IA)

#### Step 3: Disponibilidade
- Sistema flexível multi-modalidade
- Corrida: escolha os dias disponíveis
- Musculação/Força: dias separados
- Yoga, natação, outras modalidades
- Horário preferido por modalidade

#### Step 4: Corridas e Objetivos
- **Sistema Multi-Corrida**: Adicione várias corridas
- **Classificação Automática A/B/C**:
  - **A**: Corrida principal (objetivo máximo)
  - **B**: Preparatórias importantes (testes)
  - **C**: Volume/experiência (longões com chip)
- Para cada corrida: nome, distância, data, meta de tempo

#### Step 5: Revisão e Geração
- Revisão de todos os dados
- Geração do plano personalizado por IA
- Tempo de geração: ~30-60 segundos

### 3. Geração de Planos com IA

#### Processo de Geração

1. **Coleta de dados**: Perfil + Corridas + Disponibilidade
2. **Cálculo de periodização**: Baseado na corrida A
3. **Classificação de corridas**: IA classifica B e C automaticamente
4. **Geração semanal**: IA gera cada semana respeitando:
   - Disponibilidade real de dias
   - Progressão de volume
   - Fases (Base → Build → Peak → Taper)
   - Integração das corridas B e C
   - Treinos de força nos dias corretos
5. **Validação**: Sistema valida consistência
6. **Armazenamento**: Salva no banco de dados

#### Características dos Planos

- **Duração dinâmica**: Calculada automaticamente até a corrida A
- **Progressão segura**: 10% aumento semanal máximo
- **Periodização clássica**:
  - **Base (40-50%)**: Volume aeróbico, fortalecimento
  - **Build (30-35%)**: Treinos específicos, simulados
  - **Peak (10-15%)**: Treinos mais intensos
  - **Taper (5-10%)**: Redução de volume pré-prova
- **Treinos variados**:
  - Corrida fácil (Easy Run)
  - Longão (Long Run)
  - Treino de ritmo (Tempo Run)
  - Intervalados (Intervals)
  - Musculação/Força
  - Recuperação ativa
  - Descanso

### 4. Dashboard Interativo

#### Visão Semanal
- Semana atual destacada
- Treinos do dia
- Progresso semanal (%)
- Km totais da semana

#### Cartões de Treino
- Tipo, distância, pace alvo
- Descrição detalhada
- Checkbox para marcar como completo
- Botão para registrar treino

#### Métricas
- Volume acumulado
- Taxa de conclusão
- Semanas completadas
- Próxima corrida

### 5. Sistema Multi-Corrida

#### Classificação Automática (IA)

A IA analisa e classifica automaticamente:

```javascript
// Exemplo de classificação
{
  "A": {
    name: "Maratona de São Paulo",
    date: "2026-06-02",
    distance: "marathon",
    reason: "Corrida mais importante, maior distância"
  },
  "B": [
    {
      name: "Meia Maratona de SP",
      date: "2026-04-14",
      distance: "half_marathon",
      reason: "Preparatória importante, 7 semanas antes da A",
      weeksBeforeA: 7
    }
  ],
  "C": [
    {
      name: "10K Parque",
      date: "2026-03-10",
      distance: "10k",
      reason: "Corrida de volume na fase base",
      weeksBeforeA: 12
    }
  ]
}
```

#### Integração no Plano

- Corridas B viram semanas de teste/simulado
- Corridas C viram treinos longos intensificados
- Semanas de taper automáticas antes de cada corrida
- Recuperação pós-corrida

### 6. Integração Strava

#### OAuth 2.0
- Conexão segura via OAuth
- Tokens armazenados criptografados
- Refresh automático de tokens

#### Sincronização
- Atividades sincronizadas automaticamente
- Métricas: distância, duração, pace, FC, elevação
- Associação automática com treinos planejados

#### Webhooks
- Notificações em tempo real de novas atividades
- Atualização automática do dashboard

### 7. Ajustes Inteligentes

#### Análise Contínua
- IA monitora progresso
- Detecta overtraining
- Identifica lesões potenciais
- Avalia aderência ao plano

#### Ajustes Automáticos
- Redução de volume se necessário
- Recuperação extra
- Compensação de treinos perdidos
- Re-periodização

### 8. Chat com Treinador Virtual

- IA baseada em GPT-4o
- Contexto completo do atleta
- Respostas personalizadas
- Suporte 24/7

### 9. Calculadoras

#### Calculadora de Ritmos (VDOT)
- Baseada em performance recente
- Calcula todos os paces de treino
- Zonas de frequência cardíaca

#### Calculadora Nutricional
- Macros personalizados
- Calorias de manutenção/déficit/superávit
- Estratégias por fase de treino

---

## 🛠️ Stack Tecnológico

### Frontend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Next.js** | 14.2.28 | Framework React (App Router) |
| **React** | 18.2.0 | Biblioteca UI |
| **TypeScript** | 5.2.2 | Type safety |
| **Tailwind CSS** | 3.4.18 | Estilização |
| **Shadcn UI** | Latest | Componentes UI |
| **Radix UI** | Latest | Primitivas acessíveis |
| **Framer Motion** | 10.18.0 | Animações |
| **React Query** | 5.0.0 | State server |
| **Zustand** | 5.0.3 | State client |

### Backend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Node.js** | 18+ | Runtime |
| **Next.js API Routes** | 14.2.28 | Endpoints REST |
| **NextAuth.js** | 4.24.11 | Autenticação |
| **Prisma** | 6.18.0 | ORM |
| **PostgreSQL** | 14+ | Banco de dados |
| **bcryptjs** | 3.0.2 | Hash de senhas |

### IA e Integrações

| Serviço | Uso |
|---------|-----|
| **OpenAI GPT-4o** | Geração de planos com IA |
| **Strava API** | Sincronização de atividades |
| **Stripe** | Pagamentos e assinaturas |

### DevOps e Infraestrutura

| Componente | Detalhes |
|------------|----------|
| **Hosting** | Vercel (frontend + API routes) |
| **Banco de Dados** | PostgreSQL (servidor próprio) |
| **CI/CD** | Vercel (deploy automático via Git) |
| **Domínio** | atherarun.com (via GoDaddy) |
| **Controle de Versão** | Git + GitHub |

---

## 👤 Fluxo de Usuário

### Jornada Completa

```
1. LANDING PAGE (atherarun.com)
   ↓ Clique em "Começar"
   
2. SIGNUP/LOGIN
   ↓ Cadastro via email ou Google
   
3. ONBOARDING (5 etapas)
   Step 1: Dados básicos → 
   Step 2: Nível e experiência → 
   Step 3: Disponibilidade → 
   Step 4: Corridas e objetivos → 
   Step 5: Geração do plano
   ↓ IA gera plano (~30-60s)
   
4. DASHBOARD
   - Visualiza semana atual
   - Vê treinos do dia
   - Marca treinos como completos
   - Acessa plano completo
   ↓
   
5. PLANO COMPLETO
   - Navega por todas as semanas
   - Vê periodização completa
   - Acessa detalhes de cada treino
   ↓
   
6. INTEGRAÇÃO STRAVA (opcional)
   - Conecta conta Strava
   - Sincronização automática
   ↓
   
7. ACOMPANHAMENTO
   - IA analisa progresso
   - Recebe ajustes automáticos
   - Chat com treinador virtual
   ↓
   
8. CORRIDA!
   - Atinge objetivo
   - Celebra conquista
   - Cria novo plano
```

---

## 🔗 Integrações

### 1. Strava API

#### Configuração OAuth

1. **Developer Portal**: https://www.strava.com/settings/api
2. **Callback URL**: `https://atherarun.com/api/strava/callback`
3. **Scopes necessários**:
   - `read`: Ler dados do perfil
   - `activity:read`: Ler atividades
   - `activity:read_all`: Ler todas atividades

#### Endpoints Utilizados

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/oauth/authorize` | GET | Iniciar autorização |
| `/oauth/token` | POST | Trocar código por token |
| `/oauth/token` | POST | Refresh token |
| `/athlete` | GET | Dados do atleta |
| `/athlete/activities` | GET | Listar atividades |
| `/activities/{id}` | GET | Detalhes de atividade |

#### Fluxo de Autorização

```typescript
// 1. Usuário clica em "Conectar Strava"
// Redireciona para:
https://www.strava.com/oauth/authorize?
  client_id={CLIENT_ID}&
  redirect_uri={CALLBACK_URL}&
  response_type=code&
  scope=read,activity:read,activity:read_all

// 2. Usuário autoriza
// Strava redireciona para callback com code

// 3. Backend troca code por tokens
POST https://www.strava.com/oauth/token
{
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  code: CODE,
  grant_type: "authorization_code"
}

// 4. Salva tokens no banco (criptografados)
// 5. Sincroniza atividades
```

#### Sincronização de Atividades

```typescript
// Busca atividades recentes
GET https://www.strava.com/api/v3/athlete/activities
Headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }

// Para cada atividade:
// - Verifica se já existe (stravaActivityId)
// - Cria CompletedWorkout
// - Associa com treino planejado (se aplicável)
// - Atualiza métricas do atleta
```

### 2. Stripe (Pagamentos)

#### Configuração

1. **Dashboard**: https://dashboard.stripe.com
2. **Webhook URL**: `https://atherarun.com/api/stripe/webhook`
3. **Eventos necessários**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

#### Produtos e Preços

```javascript
// Plano Mensal
{
  id: "price_xxx",
  product: "Premium Monthly",
  amount: 2990, // R$ 29,90
  currency: "brl",
  interval: "month"
}

// Plano Anual (desconto de 20%)
{
  id: "price_yyy",
  product: "Premium Annual",
  amount: 28800, // R$ 288,00 (R$ 24/mês)
  currency: "brl",
  interval: "year"
}
```

#### Fluxo de Checkout

```typescript
// 1. Usuário clica em "Assinar Premium"
// Frontend cria Checkout Session

POST /api/subscription/create-checkout
{
  priceId: "price_xxx",
  userId: "user123"
}

// 2. Backend cria sessão Stripe
const session = await stripe.checkout.sessions.create({
  customer: stripeCustomerId,
  mode: "subscription",
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${NEXTAUTH_URL}/dashboard?success=true`,
  cancel_url: `${NEXTAUTH_URL}/perfil?canceled=true`,
});

// 3. Redireciona para Stripe Checkout
window.location.href = session.url;

// 4. Webhook processa evento
// customer.subscription.created
await prisma.subscription.update({
  where: { userId },
  data: {
    status: "ACTIVE",
    plan: "PREMIUM_MONTHLY",
    stripeSubscriptionId: subscription.id,
    stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
  }
});
```

#### Customer Portal

Permite usuário gerenciar assinatura:

```typescript
// Criar sessão do portal
POST /api/subscription/create-portal-session
{
  customerId: "cus_xxx"
}

// Stripe retorna URL
// Usuário pode: cancelar, atualizar cartão, ver faturas
```

---

## 🗄️ Banco de Dados

### Schema Principal

```prisma
// Autenticação
User {
  id, email, password, name
  isPremium, stripeCustomerId
  athleteProfile, subscription
}

Subscription {
  userId, status, plan
  stripeCustomerId, stripeSubscriptionId
  trialEndsAt, cancelAtPeriodEnd
}

// Perfil do Atleta
AthleteProfile {
  userId, weight, height, age, gender
  runningLevel, runningYears
  currentWeeklyKm, longestRun
  goalDistance, targetRaceDate
  weeklyAvailability, trainingActivities
  stravaConnected, stravaAccessToken
  hasCustomPlan, customPlanId
}

// Sistema Multi-Corrida
RaceGoal {
  athleteId, raceName, distance, raceDate
  priority (A/B/C), targetTime
  status, actualTime
  weeksBeforeA, periodPhase
}

// Plano Personalizado
CustomTrainingPlan {
  athleteId, goalDistance, runningLevel
  targetRaceDate, startDate, totalWeeks
  currentWeek, isActive
  primaryRaceGoalId, includesRaces
}

CustomWeek {
  planId, weekNumber, startDate, endDate
  totalDistance, phase, focus
}

CustomWorkout {
  weekId, dayOfWeek, date
  type, subtype, title, description
  distance, duration, targetPace
  isCompleted
}

// Tracking
CompletedWorkout {
  athleteId, plannedWorkoutId
  source (manual/strava), stravaActivityId
  date, type, distance, duration
  pace, avgHeartRate, perceivedEffort
}

// Análises IA
AIAnalysis {
  athleteId, analysisType
  startDate, endDate
  summary, insights, recommendations
}
```

### Relacionamentos

```
User (1) ←→ (1) AthleteProfile
User (1) ←→ (1) Subscription
AthleteProfile (1) ←→ (N) RaceGoal
AthleteProfile (1) ←→ (1) CustomTrainingPlan
CustomTrainingPlan (1) ←→ (N) CustomWeek
CustomWeek (1) ←→ (N) CustomWorkout
AthleteProfile (1) ←→ (N) CompletedWorkout
```

---

## 💰 Monetização

### Planos

| Plano | Preço | Recursos |
|-------|-------|----------|
| **Free** | R$ 0 | Dashboard básico, 1 plano simples |
| **Premium Mensal** | R$ 29,90/mês | Planos ilimitados, Multi-corrida, Strava, Chat IA |
| **Premium Anual** | R$ 288/ano | Tudo do Mensal + 20% desconto (R$ 24/mês) |

### Recursos por Plano

| Recurso | Free | Premium |
|---------|------|---------|
| Geração de plano | ✅ 1x | ✅ Ilimitado |
| Sistema multi-corrida | ❌ | ✅ |
| Integração Strava | ❌ | ✅ |
| Chat com treinador IA | ❌ | ✅ |
| Ajustes inteligentes | ❌ | ✅ |
| Análises avançadas | ❌ | ✅ |
| Calculadoras | ✅ | ✅ |
| Suporte prioritário | ❌ | ✅ |

### Trial Gratuito

- **Duração**: 7 dias
- **Recursos**: Acesso completo ao Premium
- **Cancelamento**: Automático se não assinar

---

## 🚀 Status do Projeto

### ✅ Implementado

- [x] Autenticação completa (email + Google OAuth)
- [x] Onboarding em 5 etapas
- [x] Geração de planos com IA (GPT-4o)
- [x] Sistema multi-corrida com classificação A/B/C
- [x] Dashboard interativo
- [x] Visualização completa do plano
- [x] Integração Strava (OAuth + Sincronização)
- [x] Sistema de assinaturas (Stripe)
- [x] Customer Portal (Stripe)
- [x] Tracking de treinos
- [x] Calculadoras (VDOT, Nutrição)
- [x] Chat com treinador virtual

### 🚧 Em Desenvolvimento

- [ ] Ajustes automáticos inteligentes
- [ ] Análises avançadas de progresso
- [ ] Notificações e lembretes
- [ ] Relatórios semanais por email

### 🔮 Roadmap Futuro

- [ ] App mobile nativo (React Native)
- [ ] Integração Garmin
- [ ] Integração Polar
- [ ] Apple Health / Google Fit
- [ ] Planos de força detalhados
- [ ] Comunidade e social features
- [ ] Marketplace de treinadores
- [ ] Versão internacional (EN, ES)

---

## 📞 Suporte

- **Website**: https://atherarun.com
- **Email**: suporte@atherarun.com
- **Documentação Técnica**: Ver [GUIA_TECNICO.md](GUIA_TECNICO.md)

---

**© 2025 Athera Run. Feito com ❤️ para corredores.**

---

## 🚀 ATUALIZAÇÕES v1.3.0 (03/Nov/2025)

### INTELLIGENT PERSONALIZATION

**Status:** Backend 100% | Frontend em Progresso  
**Deploy:** 03/Nov/2025 20:30 UTC

#### O QUE MUDOU

**1. Schema Database (+13 campos)**
```typescript
// Novos campos no AthleteProfile
restingHeartRate: Int?          // FC repouso
sleepQuality: Int?              // 1-5
stressLevel: Int?               // 1-5
otherSportsExperience: String?  // Outros esportes
otherSportsYears: Int?          // Anos praticando
injuryDetails: Json?            // Histórico lesões
injuryRecoveryStatus: String?   // Status recuperação
lastInjuryDate: DateTime?       // Última lesão
bestTimes: Json?                // Melhores tempos
lastVDOTUpdate: DateTime?       // Update VDOT
hasGymAccess: Boolean           // Academia
hasPoolAccess: Boolean          // Piscina  
hasTrackAccess: Boolean         // Pista
trainingPreferences: Json?      // Preferências
motivationFactors: Json?        // Motivação
```

**2. Utility Libraries (60KB)**
- `vdot-calculator.ts`: VDOT preciso, paces científicos, zonas FC
- `injury-analyzer.ts`: 50+ exercícios prevenção, análise risco
- `recovery-adjuster.ts`: Ajuste volume, capacidade recuperação
- `onboarding-validator.ts`: Validação inteligente, inconsistências
- `ai-context-builder.ts`: Contexto completo (9 seções)

**3. IA Aprimorada**
- **Antes:** 60% dos dados usados
- **Agora:** 100% dos dados usados
- Contexto de 9 seções científicas
- Ajuste automático por lesões/recuperação
- Paces precisos (Jack Daniels)

#### IMPACTO NOS PLANOS

Com v1.3.0 backend, os planos são:
- ✅ Mais inteligentes (100% dos dados)
- ✅ Mais seguros (ajuste por lesões)
- ✅ Mais científicos (VDOT preciso)
- ✅ Mais personalizados (sono, estresse)
- ✅ Melhor prevenção (50+ exercícios)

#### APIs ATUALIZADAS

```typescript
// POST /api/profile/create
// POST /api/profile/update
// Agora aceitam todos os 13 novos campos

// Exemplo:
{
  // ... campos existentes ...
  restingHeartRate: 55,
  sleepQuality: 4,
  stressLevel: 2,
  otherSportsExperience: "Natação, Ciclismo",
  otherSportsYears: 5,
  injuryDetails: [
    {
      type: "fascite_plantar",
      status: "recovered",
      date: "2025-01-15"
    }
  ],
  bestTimes: {
    "5k": { time: "00:22:30", date: "2025-10-01", vdot: 48 },
    "10k": { time: "00:47:00", date: "2025-09-15", vdot: 47 }
  },
  hasGymAccess: true,
  hasPoolAccess: false,
  hasTrackAccess: true,
  trainingPreferences: {
    location: ["rua", "parque"],
    groupTraining: false
  },
  motivationFactors: {
    primary: "competição",
    secondary: ["saúde", "desafio"]
  }
}
```

#### PRÓXIMAS ETAPAS

- [ ] Frontend v1.3.0 (Onboarding 7 etapas)
- [ ] Perfil com tabs (6 abas)
- [ ] Componentes polidos
- [ ] Testes completos

**Previsão:** 2-3 dias úteis para frontend completo

