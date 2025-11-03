# 🛠️ Guia Técnico - Athera Run

> Documentação técnica completa para desenvolvedores

**Última atualização:** 03 de Novembro de 2025  
**Versão:** 1.2.0

---

## 📖 Índice

1. [Setup Inicial](#setup-inicial)
2. [Arquitetura do Código](#arquitetura-do-código)
3. [APIs e Endpoints](#apis-e-endpoints)
4. [Geração de Planos com IA](#geração-de-planos-com-ia)
5. [Autenticação](#autenticação)
6. [Integrações](#integrações)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Setup Inicial

### Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Yarn** (recomendado) ou npm
- **Git**

### Instalação

```bash
# 1. Clone o repositório
git clone <repository-url>
cd athera-run/nextjs_space

# 2. Instale dependências
yarn install
# ou: npm install

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# 4. Configure o banco de dados
yarn prisma generate
yarn prisma db push

# 5. (Opcional) Popule com dados de teste
yarn prisma db seed

# 6. Inicie o servidor de desenvolvimento
yarn dev

# Acesse: http://localhost:3000
```

### Variáveis de Ambiente

**⚠️ IMPORTANTE**: As variáveis oficiais estão configuradas no **Vercel Dashboard**. 
Para desenvolvimento local, você pode criar um `.env.local` mas ele deve conectar nos **mesmos serviços de produção** (mesmo banco de dados, etc).

#### Variáveis de Produção (Vercel)

```bash
# Database (PostgreSQL no servidor próprio)
DATABASE_URL='postgresql://user:password@45.232.21.67:5432/atherarun'

# NextAuth
NEXTAUTH_SECRET='seu-secret-gerado'
NEXTAUTH_URL='https://atherarun.com'

# Google OAuth (OBRIGATÓRIO - feature crítica)
GOOGLE_CLIENT_ID='seu-google-client-id'
GOOGLE_CLIENT_SECRET='seu-google-client-secret'

# OpenAI (geração de planos com IA)
OPENAI_API_KEY='sk-...'
LLM_PROVIDER='openai'
LLM_MODEL='gpt-4o'

# Strava API
STRAVA_CLIENT_ID='seu-strava-client-id'
STRAVA_CLIENT_SECRET='seu-strava-client-secret'
STRAVA_REDIRECT_URI='https://atherarun.com/api/strava/callback'
STRAVA_VERIFY_TOKEN='token-aleatorio-para-webhooks'

# Stripe (modo TEST)
STRIPE_SECRET_KEY='sk_test_...'
STRIPE_PUBLISHABLE_KEY='pk_test_...'
STRIPE_WEBHOOK_SECRET='whsec_...'
STRIPE_PRICE_MONTHLY='price_...'
STRIPE_PRICE_ANNUAL='price_...'
```

#### Para Desenvolvimento Local

```bash
# Crie .env.local na raiz de nextjs_space/
# IMPORTANTE: Conecta nos MESMOS serviços de produção

# Database (mesmo servidor)
DATABASE_URL='postgresql://user:password@45.232.21.67:5432/atherarun'

# NextAuth (use URL local apenas para OAuth redirects)
NEXTAUTH_SECRET='mesmo-secret-do-vercel'
NEXTAUTH_URL='http://localhost:3000'

# Demais variáveis: use as MESMAS do Vercel
# (copie do Vercel Dashboard → Settings → Environment Variables)
```

### Obtendo Credenciais

#### OpenAI
1. Acesse https://platform.openai.com
2. Crie conta e obtenha API Key
3. Configure no Vercel Dashboard

#### Google OAuth
1. Acesse https://console.cloud.google.com
2. Crie projeto e configure OAuth
3. Adicione Authorized redirect URIs: `https://atherarun.com/api/auth/callback/google`
4. Copie Client ID e Secret para o Vercel

#### Strava API
1. Acesse https://www.strava.com/settings/api
2. Crie aplicação
3. Configure Authorization Callback Domain: `atherarun.com`
4. Copie Client ID e Secret para o Vercel

#### Stripe
1. Acesse https://dashboard.stripe.com
2. Use **Live Mode** (produção)
3. Obtenha API Keys em Developers > API keys
4. Configure Webhook: `https://atherarun.com/api/stripe/webhook`
5. Copie todas as keys para o Vercel Dashboard

---

## 🏗️ Arquitetura do Código

### Estrutura Detalhada

```
nextjs_space/
├── app/                                # Next.js 14 App Router
│   ├── (auth)/                        # Grupo de rotas autenticadas
│   │   ├── login/page.tsx            # Página de login
│   │   └── signup/page.tsx           # Página de cadastro
│   │
│   ├── dashboard/                     # Dashboard principal
│   │   ├── page.tsx                  # Dashboard home
│   │   └── layout.tsx                # Layout do dashboard
│   │
│   ├── onboarding/                    # Fluxo de cadastro
│   │   ├── step1/page.tsx            # Dados básicos
│   │   ├── step2/page.tsx            # Nível e experiência
│   │   ├── step3/page.tsx            # Disponibilidade
│   │   ├── step4/page.tsx            # Corridas
│   │   └── step5/page.tsx            # Geração do plano
│   │
│   ├── plano/                         # Visualização do plano
│   │   └── page.tsx                  # Plano completo
│   │
│   ├── perfil/                        # Perfil do usuário
│   │   └── page.tsx                  # Edição de perfil
│   │
│   ├── tracking/                      # Acompanhamento
│   │   └── page.tsx                  # Tracking de treinos
│   │
│   └── api/                           # API Routes
│       ├── auth/                      # NextAuth.js
│       │   └── [...nextauth]/route.ts
│       │
│       ├── profile/                   # Profile endpoints
│       │   ├── create/route.ts       # POST: Criar perfil
│       │   ├── update/route.ts       # PUT: Atualizar perfil
│       │   ├── delete/route.ts       # DELETE: Deletar perfil
│       │   └── analyze-experience/route.ts  # POST: Analisar experiência
│       │
│       ├── plan/                      # Plan endpoints
│       │   ├── generate/route.ts     # POST: Gerar plano
│       │   ├── regenerate/route.ts   # POST: Re-gerar plano
│       │   ├── current/route.ts      # GET: Plano atual
│       │   ├── adjust/route.ts       # POST: Ajustar manualmente
│       │   ├── auto-adjust/route.ts  # POST: Ajustar automaticamente
│       │   └── [planId]/weeks/route.ts # GET: Semanas do plano
│       │
│       ├── race-goals/                # Race goals endpoints
│       │   ├── route.ts              # GET/POST: Listar/criar
│       │   ├── [id]/route.ts         # PUT/DELETE: Atualizar/deletar
│       │   ├── classify/route.ts     # POST: Classificar A/B/C
│       │   └── analyze/route.ts      # POST: Analisar corridas
│       │
│       ├── workouts/                  # Workouts endpoints
│       │   ├── weekly/route.ts       # GET: Treinos da semana
│       │   ├── complete/route.ts     # POST: Marcar como completo
│       │   ├── log/route.ts          # POST: Registrar treino
│       │   ├── stats/route.ts        # GET: Estatísticas
│       │   └── [workoutId]/route.ts  # GET/PUT/DELETE
│       │
│       ├── subscription/              # Subscription endpoints
│       │   ├── status/route.ts       # GET: Status da assinatura
│       │   ├── create-checkout/route.ts    # POST: Criar checkout
│       │   └── create-portal-session/route.ts  # POST: Portal
│       │
│       ├── strava/                    # Strava integration
│       │   ├── connect/route.ts      # GET: Iniciar OAuth
│       │   ├── callback/route.ts     # GET: Callback OAuth
│       │   ├── disconnect/route.ts   # POST: Desconectar
│       │   ├── sync/route.ts         # POST: Sincronizar
│       │   └── webhook/route.ts      # POST: Webhook Strava
│       │
│       └── stripe/                    # Stripe webhooks
│           └── webhook/route.ts      # POST: Processar eventos
│
├── components/                        # Componentes React
│   ├── ui/                           # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   │
│   ├── dashboard/                    # Dashboard components
│   │   ├── WeekView.tsx             # Visão semanal
│   │   ├── WorkoutCard.tsx          # Card de treino
│   │   └── ProgressBar.tsx          # Barra de progresso
│   │
│   ├── onboarding/                   # Onboarding components
│   │   ├── Step1Form.tsx
│   │   ├── Step2Form.tsx
│   │   └── ...
│   │
│   └── plan/                         # Plan components
│       ├── WeekList.tsx             # Lista de semanas
│       ├── WorkoutDetails.tsx       # Detalhes do treino
│       └── PhaseIndicator.tsx       # Indicador de fase
│
├── lib/                              # Lógica de negócio
│   ├── ai-plan-generator.ts         # Gerador principal
│   ├── multi-race-plan-generator.ts # Sistema multi-corrida
│   ├── race-classifier.ts           # Classificador A/B/C
│   ├── auto-adjust-service.ts       # Ajustes inteligentes
│   ├── llm-client.ts                # Cliente LLM
│   ├── strava.ts                    # Cliente Strava
│   ├── stripe.ts                    # Cliente Stripe
│   ├── subscription-service.ts      # Lógica de assinaturas
│   ├── premium-check.ts             # Verificação Premium
│   ├── vdotTables.ts                # Tabelas VDOT
│   ├── prisma.ts                    # Cliente Prisma
│   ├── auth.ts                      # Helpers de autenticação
│   └── utils.ts                     # Utilitários
│
├── prisma/
│   ├── schema.prisma                # Schema do banco
│   └── migrations/                  # Migrações
│
├── public/                           # Assets estáticos
│   ├── images/
│   └── icons/
│
├── scripts/                          # Scripts utilitários
│   ├── seed.ts                      # Seed do banco
│   └── comprehensive_test.ts        # Testes
│
├── middleware.ts                     # Middleware Next.js
├── next.config.js                    # Config Next.js
├── tailwind.config.ts                # Config Tailwind
├── tsconfig.json                     # Config TypeScript
└── package.json                      # Dependências
```

### Padrões de Código

#### Nomenclatura

- **Componentes**: PascalCase (`WeekView.tsx`)
- **Funções**: camelCase (`generatePlan()`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_WEEKS`)
- **Tipos**: PascalCase (`CustomTrainingPlan`)

#### Estrutura de Componentes

```typescript
// components/dashboard/WeekView.tsx
import { useState } from 'react';
import { Card } from '@/components/ui/card';

interface WeekViewProps {
  weekNumber: number;
  workouts: Workout[];
}

export function WeekView({ weekNumber, workouts }: WeekViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Card>
      {/* JSX */}
    </Card>
  );
}
```

#### API Routes

```typescript
// app/api/plan/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { generatePlan } from '@/lib/ai-plan-generator';

export async function POST(req: NextRequest) {
  try {
    // 1. Autenticação
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Validação
    const body = await req.json();
    // ... validar body

    // 3. Lógica de negócio
    const plan = await generatePlan(body);

    // 4. Resposta
    return NextResponse.json(plan, { status: 201 });
    
  } catch (error) {
    console.error('Error generating plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 📡 APIs e Endpoints

### Autenticação

#### POST `/api/auth/signup`
Criar nova conta

```typescript
// Request
{
  "email": "user@example.com",
  "password": "senha123",
  "name": "João Silva"
}

// Response 201
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "João Silva"
  }
}
```

#### POST `/api/auth/signin`
Login (via NextAuth.js)

### Perfil

#### POST `/api/profile/create`
Criar perfil de atleta

```typescript
// Request
{
  "weight": 75.5,
  "height": 180,
  "age": 30,
  "gender": "male",
  "runningLevel": "intermediate",
  "runningYears": 3,
  "currentWeeklyKm": 30,
  "weeklyAvailability": 5,
  "trainingActivities": [
    {
      "id": "running",
      "name": "Corrida",
      "availableDays": [0, 2, 4, 6],
      "preferredTime": "morning"
    },
    {
      "id": "strength",
      "name": "Musculação",
      "availableDays": [1, 3, 5],
      "preferredTime": "afternoon"
    }
  ]
}

// Response 201
{
  "profile": { /* AthleteProfile */ }
}
```

#### PUT `/api/profile/update`
Atualizar perfil

#### DELETE `/api/profile/delete`
Deletar perfil e todos os dados associados

### Corridas (Race Goals)

#### GET `/api/race-goals`
Listar corridas do atleta

```typescript
// Response 200
{
  "raceGoals": [
    {
      "id": 1,
      "raceName": "Maratona de SP",
      "distance": "marathon",
      "raceDate": "2026-06-02T00:00:00.000Z",
      "targetTime": "4:00:00",
      "priority": "A",
      "status": "active"
    },
    // ...
  ]
}
```

#### POST `/api/race-goals`
Criar nova corrida

```typescript
// Request
{
  "raceName": "10K Parque",
  "distance": "10k",
  "raceDate": "2026-03-10",
  "targetTime": "00:50:00",
  "location": "São Paulo"
}

// Response 201
{
  "raceGoal": { /* RaceGoal */ }
}
```

#### PUT `/api/race-goals/[id]`
Atualizar corrida

#### DELETE `/api/race-goals/[id]`
Deletar corrida

#### POST `/api/race-goals/classify`
Classificar corridas automaticamente (A/B/C)

```typescript
// Request
{
  "raceGoals": [ /* array de corridas */ ]
}

// Response 200
{
  "classification": {
    "A": { /* corrida principal */ },
    "B": [ /* preparatórias */ ],
    "C": [ /* volume */ ]
  }
}
```

### Planos

#### POST `/api/plan/generate`
Gerar novo plano personalizado

```typescript
// Request
{
  "athleteId": 123
}

// Response 201 (demora ~30-60s)
{
  "plan": {
    "id": 1,
    "totalWeeks": 16,
    "startDate": "2024-01-01",
    "weeks": [ /* array de semanas */ ]
  }
}
```

#### GET `/api/plan/current`
Obter plano atual do atleta

```typescript
// Response 200
{
  "plan": { /* CustomTrainingPlan */ },
  "currentWeek": { /* CustomWeek */ },
  "todayWorkouts": [ /* CustomWorkout[] */ ]
}
```

#### GET `/api/plan/[planId]/weeks`
Obter semanas de um plano

```typescript
// Response 200
{
  "weeks": [
    {
      "id": 1,
      "weekNumber": 1,
      "startDate": "2026-01-01",
      "phase": "base",
      "totalDistance": 30,
      "workouts": [ /* CustomWorkout[] */ ]
    },
    // ...
  ]
}
```

#### POST `/api/plan/regenerate`
Re-gerar plano (após mudanças em corridas)

### Treinos

#### GET `/api/workouts/weekly`
Treinos da semana atual

```typescript
// Query: ?weekNumber=1
// Response 200
{
  "week": { /* CustomWeek */ },
  "workouts": [
    {
      "id": 1,
      "dayOfWeek": 0,
      "date": "2026-01-01",
      "type": "running",
      "subtype": "long",
      "title": "Longão",
      "distance": 15,
      "targetPace": "6:00-6:30/km",
      "isCompleted": false
    },
    // ...
  ]
}
```

#### POST `/api/workouts/complete`
Marcar treino como completo

```typescript
// Request
{
  "workoutId": 1
}

// Response 200
{
  "success": true
}
```

#### POST `/api/workouts/log`
Registrar treino completado

```typescript
// Request
{
  "date": "2026-01-01",
  "type": "running",
  "distance": 10,
  "duration": 60,
  "pace": "6:00/km",
  "perceivedEffort": 7,
  "feeling": "good",
  "notes": "Ótimo treino!"
}

// Response 201
{
  "completedWorkout": { /* CompletedWorkout */ }
}
```

#### GET `/api/workouts/stats`
Estatísticas de treinos

```typescript
// Response 200
{
  "totalWorkouts": 50,
  "completionRate": 85,
  "totalDistance": 450,
  "avgPace": "5:45/km",
  "lastWeek": {
    "completed": 4,
    "planned": 5
  }
}
```

### Assinaturas

#### GET `/api/subscription/status`
Status da assinatura

```typescript
// Response 200
{
  "status": "ACTIVE",
  "plan": "PREMIUM_MONTHLY",
  "isPremium": true,
  "currentPeriodEnd": "2026-02-01T00:00:00.000Z"
}
```

#### POST `/api/subscription/create-checkout`
Criar sessão de checkout

```typescript
// Request
{
  "priceId": "price_xxx"
}

// Response 200
{
  "url": "https://checkout.stripe.com/..."
}
```

#### POST `/api/subscription/create-portal-session`
Criar sessão do customer portal

```typescript
// Response 200
{
  "url": "https://billing.stripe.com/..."
}
```

### Strava

#### GET `/api/strava/connect`
Iniciar conexão OAuth

Redireciona para Strava

#### GET `/api/strava/callback`
Callback OAuth

Processa autorização e salva tokens

#### POST `/api/strava/sync`
Sincronizar atividades

```typescript
// Response 200
{
  "synced": 15,
  "newActivities": 3
}
```

#### POST `/api/strava/disconnect`
Desconectar Strava

---

## 🤖 Geração de Planos com IA

### Arquivo Principal: `lib/ai-plan-generator.ts`

#### Função Principal: `generatePlan()`

```typescript
export async function generatePlan(athleteId: number): Promise<CustomTrainingPlan> {
  // 1. Buscar dados do atleta
  const profile = await prisma.athleteProfile.findUnique({
    where: { id: athleteId },
    include: { raceGoals: true }
  });

  // 2. Identificar corrida A (principal)
  const raceA = profile.raceGoals.find(r => r.priority === 'A');
  
  // 3. Calcular duração e periodização
  const { totalWeeks, startDate, periodization } = calculatePeriodization(
    raceA.raceDate,
    profile.runningLevel
  );

  // 4. Gerar semanas via IA
  const weeks = await generateWeeksWithAI(profile, periodization);

  // 5. Salvar no banco
  const plan = await savePlanToDatabase(profile, weeks);

  return plan;
}
```

#### Cálculo de Periodização

```typescript
function calculatePeriodization(raceDate: Date, level: string) {
  const today = new Date();
  const daysUntilRace = differenceInDays(raceDate, today);
  const totalWeeks = Math.ceil(daysUntilRace / 7);

  // Distribuição de fases baseada no nível
  const distribution = {
    beginner: { base: 0.50, build: 0.30, peak: 0.10, taper: 0.10 },
    intermediate: { base: 0.45, build: 0.35, peak: 0.12, taper: 0.08 },
    advanced: { base: 0.40, build: 0.35, peak: 0.15, taper: 0.10 }
  };

  const dist = distribution[level];
  
  return {
    totalWeeks,
    startDate: today,
    phases: {
      base: Math.ceil(totalWeeks * dist.base),
      build: Math.ceil(totalWeeks * dist.build),
      peak: Math.ceil(totalWeeks * dist.peak),
      taper: Math.floor(totalWeeks * dist.taper)
    }
  };
}
```

#### Geração de Semanas com IA

```typescript
async function generateWeeksWithAI(
  profile: AthleteProfile,
  periodization: Periodization
): Promise<CustomWeek[]> {
  const weeks: CustomWeek[] = [];
  
  // Gerar em lotes de 4 semanas para evitar timeouts
  const batchSize = 4;
  const totalWeeks = periodization.totalWeeks;
  
  for (let i = 0; i < totalWeeks; i += batchSize) {
    const batchStart = i + 1;
    const batchEnd = Math.min(i + batchSize, totalWeeks);
    
    // Prompt para a IA
    const prompt = buildPrompt(profile, periodization, batchStart, batchEnd);
    
    // Chamar LLM
    const response = await llmClient.generateCompletion(prompt);
    
    // Parsear resposta
    const parsedWeeks = parseWeeksFromAI(response);
    
    weeks.push(...parsedWeeks);
  }
  
  return weeks;
}
```

#### Prompt para IA

```typescript
function buildPrompt(
  profile: AthleteProfile,
  periodization: Periodization,
  startWeek: number,
  endWeek: number
): string {
  return `
Você é um treinador de corrida experiente. Gere um plano de treino personalizado.

**PERFIL DO ATLETA:**
- Nível: ${profile.runningLevel}
- Experiência: ${profile.runningYears} anos
- Volume atual: ${profile.currentWeeklyKm} km/semana
- Peso: ${profile.weight}kg, Altura: ${profile.height}cm, Idade: ${profile.age}
- Objetivo: ${profile.goalDistance} em ${format(profile.targetRaceDate, 'dd/MM/yyyy')}

**DISPONIBILIDADE:**
${JSON.stringify(profile.trainingActivities, null, 2)}

**PERIODIZAÇÃO:**
- Semanas totais: ${periodization.totalWeeks}
- Fase atual: ${getCurrentPhase(startWeek, periodization)}
- Semanas ${startWeek} a ${endWeek}

**INSTRUÇÕES:**
1. Respeite ESTRITAMENTE os dias disponíveis para cada atividade
2. Corrida apenas nos dias: ${getRunningDays(profile)}
3. Musculação apenas nos dias: ${getStrengthDays(profile)}
4. Progressão segura: máximo 10% aumento semanal
5. Varie tipos de treino: fácil, longão, ritmo, intervalado
6. Inclua recuperação adequada

**FORMATO DE RESPOSTA (JSON):**
{
  "weeks": [
    {
      "weekNumber": 1,
      "phase": "base",
      "focus": "Construção de base aeróbica",
      "totalDistance": 30,
      "workouts": [
        {
          "dayOfWeek": 0,
          "type": "running",
          "subtype": "long",
          "title": "Longão",
          "description": "Corrida longa e fácil",
          "distance": 12,
          "targetPace": "6:00-6:30/km"
        },
        // ... outros treinos
      ]
    }
  ]
}

Gere APENAS o JSON, sem explicações adicionais.
`;
}
```

### Sistema Multi-Corrida

#### Arquivo: `lib/multi-race-plan-generator.ts`

```typescript
export async function integrateRacesIntoPlan(
  plan: CustomTrainingPlan,
  raceGoals: RaceGoal[]
): Promise<CustomTrainingPlan> {
  // 1. Classificar corridas (A/B/C)
  const classification = await classifyRaces(raceGoals);
  
  // 2. Identificar semanas de corrida
  const raceWeeks = raceGoals.map(race => ({
    raceId: race.id,
    weekNumber: calculateWeekNumber(plan.startDate, race.raceDate),
    priority: race.priority
  }));
  
  // 3. Ajustar treinos nas semanas de corrida
  for (const raceWeek of raceWeeks) {
    await adjustWeekForRace(plan, raceWeek);
  }
  
  // 4. Adicionar semanas de taper antes de corridas A e B
  for (const race of classification.A.concat(classification.B)) {
    await addTaperWeek(plan, race);
  }
  
  return plan;
}
```

#### Classificador A/B/C

#### Arquivo: `lib/race-classifier.ts`

```typescript
export async function classifyRaces(
  races: RaceGoal[]
): Promise<RaceClassification> {
  // Preparar prompt para IA
  const prompt = `
Você é um treinador de corrida. Classifique as seguintes corridas:

A = Objetivo principal (mais importante)
B = Preparatórias (testes de ritmo, simulados)
C = Volume (treinos longos com chip)

**CORRIDAS:**
${races.map(r => `
- ${r.raceName}
  Distância: ${r.distance}
  Data: ${format(r.raceDate, 'dd/MM/yyyy')}
  Meta: ${r.targetTime || 'N/A'}
`).join('\n')}

Retorne JSON:
{
  "A": { "id": 1, "reason": "..." },
  "B": [ { "id": 2, "reason": "...", "weeksBeforeA": 7 } ],
  "C": [ { "id": 3, "reason": "...", "weeksBeforeA": 12 } ]
}
`;

  const response = await llmClient.generateCompletion(prompt);
  const classification = JSON.parse(response);
  
  // Salvar classificação no banco
  for (const race of races) {
    const priority = findPriority(race.id, classification);
    await prisma.raceGoal.update({
      where: { id: race.id },
      data: { priority, autoClassified: true }
    });
  }
  
  return classification;
}
```

---

## 🔐 Autenticação

### NextAuth.js Configuration

#### Arquivo: `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    // Email/Senha
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }
    }),
    
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  
  pages: {
    signIn: '/login',
    signUp: '/signup',
  },
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Protegendo Rotas

#### Middleware

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/plano/:path*',
    '/perfil/:path*',
    '/onboarding/:path*',
  ],
};
```

#### Em API Routes

```typescript
// app/api/plan/generate/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // ... resto da lógica
}
```

---

## 🔗 Integrações

### Strava API

#### Arquivo: `lib/strava.ts`

```typescript
import axios from 'axios';
import { prisma } from './prisma';

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

export class StravaClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // Obter perfil do atleta
  async getAthlete() {
    const response = await axios.get(`${STRAVA_API_BASE}/athlete`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
    return response.data;
  }

  // Listar atividades
  async getActivities(after?: number, before?: number, page = 1, perPage = 30) {
    const response = await axios.get(`${STRAVA_API_BASE}/athlete/activities`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
      params: { after, before, page, per_page: perPage }
    });
    return response.data;
  }

  // Detalhes de uma atividade
  async getActivity(id: number) {
    const response = await axios.get(`${STRAVA_API_BASE}/activities/${id}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
    return response.data;
  }

  // Refresh do token
  static async refreshToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_at: number;
  }> {
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    });
    return response.data;
  }
}

// Helper: Obter cliente Strava para um atleta
export async function getStravaClientForAthlete(athleteId: number) {
  const profile = await prisma.athleteProfile.findUnique({
    where: { id: athleteId }
  });

  if (!profile?.stravaAccessToken) {
    throw new Error('Strava not connected');
  }

  // Verificar se token expirou
  if (profile.stravaTokenExpiry && new Date() > profile.stravaTokenExpiry) {
    // Refresh token
    const tokens = await StravaClient.refreshToken(profile.stravaRefreshToken!);
    
    // Atualizar no banco
    await prisma.athleteProfile.update({
      where: { id: athleteId },
      data: {
        stravaAccessToken: tokens.access_token,
        stravaRefreshToken: tokens.refresh_token,
        stravaTokenExpiry: new Date(tokens.expires_at * 1000)
      }
    });

    return new StravaClient(tokens.access_token);
  }

  return new StravaClient(profile.stravaAccessToken);
}
```

#### Sincronização de Atividades

```typescript
// lib/strava-sync.ts
export async function syncStravaActivities(athleteId: number) {
  const client = await getStravaClientForAthlete(athleteId);
  const profile = await prisma.athleteProfile.findUnique({
    where: { id: athleteId }
  });

  // Buscar atividades dos últimos 30 dias
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
  const activities = await client.getActivities(thirtyDaysAgo);

  let syncedCount = 0;

  for (const activity of activities) {
    // Verificar se já existe
    const existing = await prisma.completedWorkout.findUnique({
      where: { stravaActivityId: String(activity.id) }
    });

    if (existing) continue;

    // Criar CompletedWorkout
    await prisma.completedWorkout.create({
      data: {
        athleteId,
        source: 'strava',
        stravaActivityId: String(activity.id),
        date: new Date(activity.start_date),
        type: mapStravaType(activity.type),
        subtype: inferSubtype(activity),
        distance: activity.distance / 1000, // metros -> km
        duration: Math.floor(activity.moving_time / 60), // segundos -> minutos
        pace: calculatePace(activity.distance, activity.moving_time),
        elevation: activity.total_elevation_gain,
        avgHeartRate: activity.average_heartrate,
        maxHeartRate: activity.max_heartrate,
        calories: activity.calories
      }
    });

    syncedCount++;
  }

  return { synced: syncedCount, total: activities.length };
}

function mapStravaType(type: string): string {
  const mapping: Record<string, string> = {
    'Run': 'running',
    'Ride': 'cycling',
    'Swim': 'swimming',
    'WeightTraining': 'strength',
    'Yoga': 'yoga'
  };
  return mapping[type] || 'other';
}
```

### Stripe

#### Arquivo: `lib/stripe.ts`

```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Criar ou obter customer
export async function getOrCreateStripeCustomer(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true }
  });

  if (user?.subscription?.stripeCustomerId) {
    return user.subscription.stripeCustomerId;
  }

  // Criar novo customer
  const customer = await stripe.customers.create({
    email: user!.email!,
    metadata: { userId }
  });

  // Salvar no banco
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: customer.id,
      status: 'FREE',
      plan: 'FREE'
    },
    update: {
      stripeCustomerId: customer.id
    }
  });

  return customer.id;
}

// Criar checkout session
export async function createCheckoutSession(
  userId: string,
  priceId: string
) {
  const customerId = await getOrCreateStripeCustomer(userId);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/perfil?canceled=true`,
    metadata: { userId }
  });

  return session;
}

// Criar portal session
export async function createPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXTAUTH_URL}/perfil`
  });

  return session;
}
```

#### Webhook Handler

```typescript
// app/api/stripe/webhook/route.ts
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;
  }

  return Response.json({ received: true });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  
  await prisma.subscription.update({
    where: { userId },
    data: {
      stripeSubscriptionId: subscription.id,
      status: mapStripeStatus(subscription.status),
      plan: mapStripePlan(subscription.items.data[0].price.id),
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    }
  });

  // Atualizar User.isPremium (legacy)
  await prisma.user.update({
    where: { id: userId },
    data: {
      isPremium: subscription.status === 'active',
      subscriptionStatus: subscription.status
    }
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  
  await prisma.subscription.update({
    where: { userId },
    data: {
      status: 'CANCELED',
      plan: 'FREE'
    }
  });

  await prisma.user.update({
    where: { id: userId },
    data: { isPremium: false, subscriptionStatus: 'canceled' }
  });
}

function mapStripeStatus(status: string): SubscriptionStatus {
  const mapping: Record<string, SubscriptionStatus> = {
    'active': 'ACTIVE',
    'past_due': 'PAST_DUE',
    'canceled': 'CANCELED',
    'incomplete': 'INCOMPLETE',
    'incomplete_expired': 'INCOMPLETE_EXPIRED',
    'unpaid': 'UNPAID',
    'trialing': 'TRIAL'
  };
  return mapping[status] || 'FREE';
}
```

---

## 🚀 Deployment

### Arquitetura de Deploy

**IMPORTANTE**: O projeto roda 100% no Vercel. Não há servidor local de produção.

```
Código Local (dev)
    ↓ git push
GitHub Repository
    ↓ webhook automático
Vercel Build & Deploy
    ↓
atherarun.com (produção)
```

### Fluxo de Trabalho

1. **Desenvolvimento Local**
   ```bash
   cd nextjs_space
   yarn dev  # Roda em localhost:3000
   # Conecta no MESMO banco de dados do Vercel
   ```

2. **Commit e Push**
   ```bash
   git add .
   git commit -m "feat: nova funcionalidade"
   git push origin main
   ```

3. **Deploy Automático**
   - Vercel detecta push
   - Faz build automático
   - Deploy em ~2-3 minutos
   - Live em atherarun.com

### Configurar Variáveis de Ambiente (Vercel)

**Dashboard da Vercel** → Settings → Environment Variables

⚠️ Todas as variáveis devem ser configuradas no Vercel, não localmente.

```bash
# Database
DATABASE_URL=postgresql://user:pass@45.232.21.67:5432/atherarun

# NextAuth
NEXTAUTH_SECRET=seu-secret-seguro
NEXTAUTH_URL=https://atherarun.com

# OpenAI (não Abacus!)
OPENAI_API_KEY=sk-live_...
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o

# Google OAuth
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

### Configurar Domínio

### Configuração de DNS (GoDaddy)

```
Type  Name  Value                    TTL
----  ----  -----                    ---
A     @     76.76.21.21             600
CNAME www   cname.vercel-dns.com.   600
```

### Banco de Dados (PostgreSQL)

#### Setup Atual
- **PostgreSQL** no servidor próprio (45.232.21.67)
- Compartilhado entre dev local e produção Vercel
- Conexão via `DATABASE_URL` no Vercel

#### Migração Futura (Planejado)
Para melhor escalabilidade e redundância, migrar para:

1. **Vercel Postgres** (integrado)
2. **Supabase** (gratuito até certo volume)
3. **AWS RDS** (enterprise)
4. **Railway** (boa relação custo/benefício)

#### Rodar Migrations

```bash
# Local ou CI/CD
npx prisma migrate deploy
```

### CI/CD Automático

O Vercel gerencia todo o CI/CD:
- **Push no `main`** → Deploy em produção (atherarun.com)
- **Push em outras branches** → Preview deploys
- **Build automático** com cache inteligente
- **Rollback fácil** pelo dashboard

### Verificação Pós-Deploy

```bash
# Testar produção
curl https://atherarun.com/api/health

# Verificar logs
vercel logs
```

---

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Erro de Build: "Module not found"

```bash
# Limpar cache e reinstalar
rm -rf node_modules .next
yarn install
yarn build
```

#### 2. Prisma: "Can't reach database server"

```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Testar conexão
yarn prisma db push
```

#### 3. NextAuth: "No secret provided"

```bash
# Gerar novo secret
openssl rand -base64 32

# Adicionar em .env
NEXTAUTH_SECRET="seu-secret-gerado"
```

#### 4. Strava: "Invalid OAuth callback"

Verificar:
- Callback URL no app Strava: `https://atherarun.com/api/strava/callback`
- `STRAVA_REDIRECT_URI` em `.env` deve ser exato

#### 5. Stripe: "No such webhook endpoint"

```bash
# Configurar webhook no dashboard Stripe
# URL: https://atherarun.com/api/stripe/webhook
# Eventos: customer.*, invoice.*, checkout.session.completed
```

#### 6. IA: Plano não gera ou dá timeout

- Verificar `OPENAI_API_KEY` no Vercel
- Confirmar `LLM_PROVIDER=openai` e `LLM_MODEL=gpt-4o`
- Planos muito longos (>40 semanas) podem demorar
- Verificar logs do Vercel para detalhes do erro

### Logs e Debug

#### Local

```bash
# Logs detalhados
DEBUG=* yarn dev

# Verificar variáveis
yarn ts-node scripts/check-env.ts
```

#### Produção (Vercel)

```bash
# Ver logs em tempo real
vercel logs --follow

# Logs de função específica
vercel logs --function=api/plan/generate
```

### Scripts de Teste

```bash
# Testar geração de plano
yarn ts-node test_plan_generation.ts

# Testar conexão LLM
yarn ts-node test_llm_connection.ts

# Testar OAuth Strava
yarn ts-node test_oauth.ts

# Verificar perfil de usuário
yarn ts-node check_profile_data.ts
```

---

## 💎 Recursos FREE vs PREMIUM

### Implementação Técnica

#### Auto-Ajuste Progressivo (FREE)

**Endpoint:** `POST /api/plan/auto-adjust`

**Características:**
- Disponível para TODOS os usuários
- **PRESERVA histórico** ao ajustar
- Usa transação atômica (rollback se falhar)
- Timeout de 90 segundos
- Feedback detalhado

**Fluxo Completo:**

```typescript
// 1. Identificar ponto de corte
const hoje = new Date();
const semanaAtual = await prisma.customWeek.findFirst({
  where: {
    planId: currentPlan.id,
    startDate: { lte: hoje },
    endDate: { gte: hoje }
  }
});

const cutoffDate = semanaAtual ? semanaAtual.startDate : hoje;

// 2. PRESERVAR passado + completados
const semanasFuturas = await prisma.customWeek.findMany({
  where: {
    planId: currentPlan.id,
    startDate: { gte: cutoffDate }
  },
  include: { workouts: true }
});

// Para cada semana futura:
for (const semana of semanasFuturas) {
  const completados = semana.workouts.filter(w => w.isCompleted);
  const naoCompletados = semana.workouts.filter(w => !w.isCompleted);
  
  // ✅ PRESERVA completados
  // ❌ REMOVE apenas não completados
  await tx.customWorkout.deleteMany({
    where: { id: { in: naoCompletados.map(w => w.id) } }
  });
  
  // Semana só é deletada se não tem completados
  if (completados.length === 0) {
    weekIdsToDelete.push(semana.id);
  }
}

// 3. REGENERAR futuro
const aiPlan = await generateAIPlan(updatedProfile);

// 4. CRIAR/ATUALIZAR semanas
for (const weekData of aiPlan.weeks) {
  const weekDate = new Date(weekData.startDate);
  
  // Pular semanas antes do cutoff (já preservadas)
  if (weekDate < cutoffDate) continue;
  
  const semanaExistente = semanasFuturas.find(s => 
    new Date(s.startDate).getTime() === weekDate.getTime()
  );
  
  if (semanaExistente && semanaExistente.workouts.some(w => w.isCompleted)) {
    // ATUALIZAR (tem completados)
    await tx.customWeek.update({ where: { id: semanaExistente.id }, data: {...} });
  } else {
    // CRIAR nova
    await tx.customWeek.create({ data: {...} });
  }
  
  // Criar workouts APENAS para datas sem completados
  const datasExistentes = new Set(
    semanaExistente?.workouts
      .filter(w => w.isCompleted)
      .map(w => new Date(w.date).toDateString())
  );
  
  const workoutsNovos = weekData.workouts.filter(workout => {
    return !datasExistentes.has(new Date(workout.date).toDateString());
  });
  
  await tx.customWorkout.createMany({ data: workoutsNovos });
}
```

**Resultado:**
- ✅ Histórico 100% preservado
- ✅ Taxa de conclusão mantida
- ✅ Gráficos de evolução funcionando
- ✅ Futuro ajustado com mudanças

**Validação de Disponibilidade:**

```typescript
// lib/ai-plan-generator.ts
function getActivityAvailability(profile) {
  // ✅ Apenas corrida tem fallback (essencial)
  const runningDays = configured || [0, 2, 4];
  
  // ✅ Outras atividades: SEM fallback
  const strengthDays = configured || []; // Vazio se não configurado
  const swimmingDays = configured || []; // Vazio se não configurado
  
  // ✅ Validação obrigatória
  if (runningDays.length === 0) {
    throw new Error('Configure pelo menos dias de corrida');
  }
}
```

#### IA em Dias de Descanso (FREE)

**Função:** `generateRestDaySuggestion()`

```typescript
// lib/ai-plan-generator.ts
function generateRestDaySuggestion(context: {
  phase: string;              // base, build, peak, taper
  isCutbackWeek: boolean;
  raceThisWeek?: any;
  hasStrength: boolean;       // Usuário faz musculação?
  hasSwimming: boolean;       // Usuário faz natação?
  hasOtherActivities: boolean;
}): string {
  
  // Gera descrição contextual baseada em:
  // - Fase do treino
  // - Proximidade de corridas
  // - Atividades disponíveis do usuário
  
  // Exemplos:
  
  // BASE:
  // "💤 Descanso - Dia de recuperação ativa.
  //  
  //  ✨ Sugestões: alongamento dinâmico, natação leve, yoga
  //  💡 Foco: hidratação 2-3L, sono 7-9h"
  
  // PEAK (3 dias antes corrida A):
  // "💤 Descanso estratégico. 🏁 Corrida A em 3 dias!
  //  
  //  🎯 DESCANSO ABSOLUTO:
  //  • Evite ficar em pé por longos períodos
  //  • Hidratação constante
  //  • Visualização mental da prova"
  
  // TAPER:
  // "💤 Descanso essencial para chegar fresco na prova.
  //  
  //  🏆 SEMANA DE TAPER:
  //  • Descanso é sua prioridade #1
  //  • Relaxe e confie no treinamento"
}
```

#### Análise Inteligente de Progresso (PREMIUM)

**Endpoint:** `POST /api/plan/analyze-progress`

```typescript
// Disponível APENAS para Premium
// Analisa automaticamente:
// - Taxa de conclusão de treinos (últimos 30 dias)
// - Feedbacks e relatos (fadiga, dor)
// - Dados do Strava (se conectado)
// - Padrões de performance

// Retorno para FREE:
{
  hasSuggestion: true,
  isPremiumFeature: true,
  teaser: "Taxa de conclusão abaixo do ideal",
  message: "Upgrade para ver sugestões completas"
}

// Retorno para PREMIUM:
{
  hasSuggestion: true,
  isPremiumFeature: false,
  suggestion: "Reduzir volume em 10% - sinais de fadiga",
  confidence: "high",
  reasons: ["Taxa conclusão 60%", "3 relatos de fadiga"],
  adjustmentType: "volume"
}
```

**Banner no Dashboard:**

```typescript
// components/progress-analysis-banner.tsx
// - FREE: Mostra teaser + botão "Upgrade Premium"
// - PREMIUM: Mostra sugestão completa + botão "Aplicar Ajuste"
```

---

## 📝 Checklist de Deploy

### Pré-Deploy

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Banco de dados de produção criado
- [ ] Migrations rodadas no banco de produção
- [ ] Strava app em modo produção (não sandbox)
- [ ] Stripe em modo TEST (usar test keys)
- [ ] Domínio configurado e DNS propagado

### Pós-Deploy

- [ ] Testar signup e login
- [ ] Testar geração de plano (apenas corrida)
- [ ] Testar adicionar atividade (auto-ajuste)
- [ ] Testar integração Strava (Premium)
- [ ] Testar análise de progresso (Premium vs FREE)
- [ ] Testar checkout Stripe
- [ ] Testar webhooks (Strava e Stripe)
- [ ] Monitorar logs por 24h

### Manutenção

- [ ] Backup do banco de dados (semanal)
- [ ] Monitorar uso de APIs (limites)
- [ ] Atualizar dependências (mensal)
- [ ] Revisar logs de erro (diário)
- [ ] Verificar análises Premium funcionando (semanal)

---

## 🔗 Links Úteis

- **Documentação**: [DOCUMENTACAO.md](DOCUMENTACAO.md)
- **Roadmap**: [ROADMAP.md](ROADMAP.md)
- **Website**: https://atherarun.com
- **Repositório**: (adicionar URL)

---

**© 2025 Athera Run. Feito com ❤️ para desenvolvedores.**
