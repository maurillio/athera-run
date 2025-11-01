# 🚀 ROADMAP DE MONETIZAÇÃO E EXPANSÃO MOBILE - ATHERA RUN

**Data de Criação:** 01 de Novembro de 2025  
**Versão:** 1.0  
**Website:** https://atherarun.com

---

## 📑 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Estratégia de Monetização](#estratégia-de-monetização)
3. [Roadmap Técnico](#roadmap-técnico)
4. [Fase 1: Sistema de Assinaturas (4-6 semanas)](#fase-1-sistema-de-assinaturas)
5. [Fase 2: Features Premium (6-8 semanas)](#fase-2-features-premium)
6. [Fase 3: Aplicativo Mobile (12-16 semanas)](#fase-3-aplicativo-mobile)
7. [Fase 4: Otimização e Escala (contínuo)](#fase-4-otimização-e-escala)
8. [Métricas e KPIs](#métricas-e-kpis)
9. [Custos Estimados](#custos-estimados)
10. [Timeline Consolidado](#timeline-consolidado)

---

## 1. VISÃO GERAL

### 🎯 Objetivo Principal
Transformar o Athera Run de MVP gratuito para **plataforma monetizada** com modelo freemium, oferecendo planos **Free** e **Premium**, e expandir para **apps nativos iOS/Android**.

### 💰 Modelo de Negócio

#### **PLANO FREE** (Gratuito)
✅ Geração de plano de treino personalizado com IA  
✅ Visualização do plano completo  
✅ Lançamento manual de treinos  
✅ Dashboard básico com estatísticas  
✅ Calculadora VDOT  
✅ Glossário de termos  
❌ Sem integração Strava  
❌ Sem ajustes automáticos com IA  
❌ Sem análise avançada de performance  
❌ Sem chat com treinador virtual  
❌ Sem sincronização automática  

#### **PLANO PREMIUM** (R$ 29,90/mês ou R$ 159,90/ano)
✅ **TUDO do plano Free**  
✅ **Integração completa com Strava**  
✅ **Ajustes automáticos inteligentes com IA**  
✅ **Chat ilimitado com treinador virtual**  
✅ **Análise avançada de performance**  
✅ **Sincronização automática de treinos**  
✅ **Notificações e lembretes**  
✅ **Planejamento de múltiplas provas**  
✅ **Relatórios semanais personalizados**  
✅ **Suporte prioritário**  

**Desconto Anual:** 55% (R$ 358,80/ano → R$ 159,90/ano)

---

## 2. ESTRATÉGIA DE MONETIZAÇÃO

### 📊 Projeção de Receita (12 meses)

| Período | Usuários Free | Usuários Premium | Taxa Conversão | MRR | ARR |
|---------|---------------|------------------|----------------|-----|-----|
| Mês 1-2 | 50 | 5 | 10% | R$ 149,50 | R$ 1.794 |
| Mês 3-4 | 200 | 30 | 15% | R$ 897,00 | R$ 10.764 |
| Mês 5-6 | 500 | 100 | 20% | R$ 2.990,00 | R$ 35.880 |
| Mês 7-9 | 1.000 | 250 | 25% | R$ 7.475,00 | R$ 89.700 |
| Mês 10-12 | 2.000 | 600 | 30% | R$ 17.940,00 | R$ 215.280 |

**Meta Ano 1:** 600 assinantes Premium gerando **R$ 17.940 MRR**

### 🎯 Estratégia de Conversão Free → Premium

1. **Trial Premium (7 dias)**
   - Novos usuários experimentam todas as features
   - Notificação 2 dias antes do fim do trial
   - CTA claro para upgrade

2. **Limitações Estratégicas no Free**
   - Máximo 1 plano ativo por vez
   - Chat limitado a 5 mensagens/mês
   - Sem acesso a features de IA avançadas

3. **Gatilhos de Conversão**
   - Ao tentar conectar Strava → "Feature Premium"
   - Ao solicitar ajuste de treino → "Upgrade para ajustes automáticos"
   - Após 2 semanas de uso → "Veja seu potencial completo"

4. **Incentivos**
   - 20% OFF no anual se converter nos primeiros 30 dias
   - Referral program: 1 mês grátis para cada amigo convertido
   - Early adopter price: Lock R$ 24,90/mês (primeiros 100 usuários)

---

## 3. ROADMAP TÉCNICO

### 🏗️ Arquitetura da Solução

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYERS                          │
├─────────────────────────────────────────────────────────────┤
│  Web App (Next.js)  │  iOS App (React Native / Flutter)     │
│  atherarun.com      │  Android App (React Native / Flutter) │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                               │
│  Next.js API Routes + tRPC (para mobile apps)               │
│  - Autenticação (NextAuth + JWT)                            │
│  - Subscription Management (Stripe)                          │
│  - Feature Flags (Free vs Premium)                          │
│  - Rate Limiting (por tier)                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC                             │
│  - Plan Generator (IA)     - Strava Integration             │
│  - Auto-Adjust Service     - Notification Service           │
│  - Analytics Engine        - Payment Processing             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
│  PostgreSQL (Prisma ORM)                                    │
│  - Users, Profiles, Goals                                   │
│  - Subscriptions, Payments                                  │
│  - Plans, Workouts, Activities                              │
│  - Analytics, Logs                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. FASE 1: SISTEMA DE ASSINATURAS (4-6 semanas)

### 🎯 Objetivo
Implementar sistema completo de pagamentos e gestão de assinaturas.

### 📋 Tarefas

#### **Semana 1-2: Integração Stripe**

**Backend:**
- [ ] Configurar conta Stripe (modo test e produção)
- [ ] Criar produtos e preços no Stripe
  - Premium Mensal: R$ 29,90
  - Premium Anual: R$ 159,90
- [ ] Implementar webhooks do Stripe
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- [ ] Criar API routes:
  - `POST /api/stripe/create-checkout-session`
  - `POST /api/stripe/create-portal-session`
  - `POST /api/stripe/webhook`
  - `GET /api/subscription/status`
  - `POST /api/subscription/cancel`

**Modelo de Dados (Prisma Schema):**
```prisma
model Subscription {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  stripeCustomerId       String?  @unique
  stripeSubscriptionId   String?  @unique
  stripePriceId          String?
  stripeCurrentPeriodEnd DateTime?
  
  status            SubscriptionStatus @default(FREE)
  plan              SubscriptionPlan   @default(FREE)
  
  trialEndsAt       DateTime?
  cancelAtPeriodEnd Boolean  @default(false)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([userId])
  @@index([stripeCustomerId])
  @@index([stripeSubscriptionId])
}

enum SubscriptionStatus {
  FREE
  TRIAL
  ACTIVE
  PAST_DUE
  CANCELED
  INCOMPLETE
  INCOMPLETE_EXPIRED
  UNPAID
}

enum SubscriptionPlan {
  FREE
  PREMIUM_MONTHLY
  PREMIUM_ANNUAL
}
```

**Arquivos a Criar/Modificar:**
- `prisma/schema.prisma` - Adicionar modelo Subscription
- `lib/stripe.ts` - Cliente Stripe configurado
- `lib/subscription-service.ts` - Lógica de negócio
- `app/api/stripe/create-checkout-session/route.ts`
- `app/api/stripe/create-portal-session/route.ts`
- `app/api/stripe/webhook/route.ts`
- `app/api/subscription/status/route.ts`

#### **Semana 2-3: Frontend de Pagamentos**

**Páginas e Componentes:**
- [ ] Criar página `/pricing` - Apresentação dos planos
- [ ] Criar página `/checkout` - Fluxo de pagamento
- [ ] Criar página `/subscription` - Gestão de assinatura
- [ ] Componente `<UpgradeModal />` - Modal de upgrade
- [ ] Componente `<SubscriptionBadge />` - Badge de status
- [ ] Componente `<FeatureGate />` - Controle de acesso

**Design do `/pricing`:**
```tsx
// Exemplo de estrutura
<div className="grid md:grid-cols-2 gap-6">
  {/* Free Plan */}
  <Card>
    <h3>Free</h3>
    <p className="text-3xl font-bold">R$ 0</p>
    <ul>
      <li>✅ Geração de plano com IA</li>
      <li>✅ Lançamento manual de treinos</li>
      <li>❌ Sem integração Strava</li>
      <li>❌ Sem ajustes automáticos</li>
    </ul>
    <Button variant="outline">Começar Grátis</Button>
  </Card>
  
  {/* Premium Plan */}
  <Card className="border-primary">
    <Badge>Recomendado</Badge>
    <h3>Premium</h3>
    <div>
      <p className="text-3xl font-bold">R$ 29,90</p>
      <p className="text-sm text-muted">/mês</p>
    </div>
    <ul>
      <li>✅ Tudo do Free</li>
      <li>✅ Integração Strava completa</li>
      <li>✅ Ajustes automáticos com IA</li>
      <li>✅ Chat ilimitado</li>
    </ul>
    <Button>Começar Trial de 7 Dias</Button>
    <p className="text-sm">ou R$ 159,90/ano (55% OFF)</p>
  </Card>
</div>
```

**Arquivos a Criar:**
- `app/pricing/page.tsx`
- `app/checkout/page.tsx`
- `app/subscription/page.tsx`
- `components/upgrade-modal.tsx`
- `components/subscription-badge.tsx`
- `components/feature-gate.tsx`

#### **Semana 3-4: Sistema de Feature Flags**

**Middleware de Autorização:**
```typescript
// lib/feature-flags.ts
export const FEATURES = {
  STRAVA_INTEGRATION: 'strava_integration',
  AUTO_ADJUST: 'auto_adjust',
  UNLIMITED_CHAT: 'unlimited_chat',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  MULTI_RACE_PLANNING: 'multi_race_planning',
  WEEKLY_REPORTS: 'weekly_reports',
} as const;

export async function hasFeatureAccess(
  userId: string,
  feature: keyof typeof FEATURES
): Promise<boolean> {
  const subscription = await getSubscriptionStatus(userId);
  
  // Trial ou Premium tem acesso a tudo
  if (['TRIAL', 'ACTIVE'].includes(subscription.status) && 
      subscription.plan !== 'FREE') {
    return true;
  }
  
  // Free não tem acesso a features premium
  return false;
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback 
}: FeatureGateProps) {
  const { data: hasAccess } = useFeatureAccess(feature);
  
  if (!hasAccess) {
    return fallback || <UpgradePrompt feature={feature} />;
  }
  
  return <>{children}</>;
}
```

**Aplicar Gates nas Features:**
- [ ] Proteger integração Strava
- [ ] Proteger página de auto-adjust
- [ ] Limitar chat (5 mensagens/mês no Free)
- [ ] Proteger analytics avançados

**Arquivos a Criar/Modificar:**
- `lib/feature-flags.ts`
- `hooks/use-feature-access.ts`
- `middleware.ts` - Adicionar verificação de subscription
- Modificar todas as rotas premium

#### **Semana 4-5: Trial Experience**

**Funcionalidades:**
- [ ] Novo usuário automaticamente inicia trial de 7 dias
- [ ] Banner mostrando dias restantes do trial
- [ ] Email 2 dias antes do fim do trial
- [ ] Notificação in-app no último dia
- [ ] Conversão suave (trial → free ou premium)

**Arquivos:**
- `lib/trial-service.ts`
- `components/trial-banner.tsx`
- `app/api/trial/check/route.ts`

#### **Semana 5-6: Testes e Ajustes**

- [ ] Testar fluxo completo de checkout (Stripe test mode)
- [ ] Testar webhooks localmente (Stripe CLI)
- [ ] Testar cancelamento e reativação
- [ ] Testar expiração de trial
- [ ] Validar feature gates
- [ ] Testes de segurança (autorização)
- [ ] Deploy em produção (Stripe live mode)

---

## 5. FASE 2: FEATURES PREMIUM (6-8 semanas)

### 🎯 Objetivo
Desenvolver e polir as features exclusivas do plano Premium.

### 📋 Tarefas

#### **Semana 1-2: Ajustes Automáticos Inteligentes**

**Status Atual:** Estrutura criada (`lib/auto-adjust-service.ts`), precisa refinamento.

**Melhorias Necessárias:**

1. **Detecção Avançada de Fadiga**
```typescript
// lib/fatigue-detector.ts
export class FatigueDetector {
  async analyze(userId: string): Promise<FatigueAnalysis> {
    const last14Days = await getWorkoutsLast14Days(userId);
    
    const signals = {
      // Volume semanal vs baseline
      volumeRatio: calculateVolumeRatio(last14Days),
      
      // Frequência de treinos intensos
      intensityFrequency: calculateIntensityFrequency(last14Days),
      
      // RPE médio últimos 7 dias
      avgRPE: calculateAvgRPE(last14Days),
      
      // Treinos pulados
      missedWorkouts: countMissedWorkouts(last14Days),
      
      // Feedback do usuário
      userFeedback: await getLatestFeedback(userId),
    };
    
    return {
      fatigueLevel: calculateFatigueLevel(signals),
      recommendation: generateRecommendation(signals),
      adjustmentType: determineAdjustmentType(signals),
    };
  }
}
```

2. **Motor de Sugestões**
```typescript
// lib/adjustment-engine.ts
export async function generateAdjustmentSuggestion(
  userId: string,
  fatigueAnalysis: FatigueAnalysis
): Promise<AdjustmentSuggestion> {
  const currentPlan = await getCurrentPlan(userId);
  const nextWeek = getNextWeekWorkouts(currentPlan);
  
  if (fatigueAnalysis.fatigueLevel === 'HIGH') {
    return {
      type: 'REDUCE_VOLUME',
      changes: nextWeek.map(workout => ({
        original: workout,
        adjusted: reduceWorkoutIntensity(workout, 0.2), // -20%
      })),
      reason: 'Alta fadiga detectada nos últimos treinos',
      aiExplanation: await generateAIExplanation(fatigueAnalysis),
    };
  }
  
  // ... outras lógicas
}
```

3. **Interface de Aprovação**
- [ ] Modal com comparação lado-a-lado (plano atual vs ajustado)
- [ ] Explicação em linguagem natural da IA
- [ ] Botões: Aceitar / Rejeitar / Modificar
- [ ] Histórico de ajustes feitos

**Arquivos:**
- `lib/fatigue-detector.ts` (novo)
- `lib/adjustment-engine.ts` (novo)
- `lib/auto-adjust-service.ts` (refatorar)
- `components/adjustment-modal.tsx` (novo)
- `app/api/plan/auto-adjust/route.ts` (novo)
- `app/ajustes/page.tsx` (novo)

#### **Semana 2-3: Sistema de Notificações**

**Push Notifications (Web Push API):**
- [ ] Implementar service worker para push notifications
- [ ] Solicitar permissão do usuário
- [ ] Integrar com Firebase Cloud Messaging ou OneSignal
- [ ] Tipos de notificação:
  - Lembrete de treino (30 min antes)
  - Treino não realizado (2h depois do horário)
  - Ajuste de plano disponível
  - Relatório semanal pronto
  - Milestone alcançado

**Email Notifications (Resend ou SendGrid):**
- [ ] Template de boas-vindas
- [ ] Relatório semanal de progresso
- [ ] Notificação de ajuste sugerido
- [ ] Fim do trial (2 dias antes)
- [ ] Renovação de assinatura

**Arquivos:**
- `lib/notification-service.ts`
- `lib/email-templates/` (pasta)
- `public/sw.js` (service worker)
- `app/api/notifications/subscribe/route.ts`
- `components/notification-settings.tsx`

#### **Semana 3-4: Chat com Treinador Virtual Ilimitado**

**Status Atual:** Chat básico existe, precisa de melhorias.

**Melhorias:**
1. **Context Awareness Avançado**
   - Incluir dados de todos os treinos recentes
   - Histórico de conversas (últimas 10 mensagens)
   - Estado atual do plano
   - Métricas de performance

2. **Limitação para Free**
   - Contador de mensagens (5/mês)
   - Aviso ao atingir 3 mensagens
   - Prompt de upgrade ao atingir limite

3. **Features Premium**
   - Chat ilimitado
   - Respostas mais detalhadas
   - Análise de treinos individuais
   - Sugestões proativas

**Arquivos:**
- `lib/chat-service.ts` (refatorar)
- `components/chat-message-counter.tsx` (novo)
- `app/api/chat/send/route.ts` (modificar)

#### **Semana 4-5: Análise Avançada de Performance**

**Novos Gráficos e Métricas:**

1. **Progressão de Pace por Zona**
   - Gráfico de linha mostrando evolução do pace em cada zona
   - Comparação com previsão do plano

2. **Análise de Consistência**
   - Heatmap de treinos realizados vs planejados
   - Taxa de aderência ao plano

3. **Predição de Tempo de Prova**
   - Baseado em treinos recentes e VDOT
   - Atualização semanal
   - Comparação com meta

4. **Análise de Carga de Treino**
   - Acute:Chronic Workload Ratio (ACWR)
   - Training Stress Score (TSS)
   - Zona de risco de lesão

**Componentes:**
```tsx
// components/advanced-analytics/
├── pace-progression-chart.tsx
├── consistency-heatmap.tsx
├── race-prediction.tsx
├── training-load-chart.tsx
└── performance-insights.tsx
```

**Arquivos:**
- `lib/analytics-engine.ts` (novo)
- `app/analytics/page.tsx` (novo - só Premium)
- Componentes acima

#### **Semana 5-6: Planejamento de Múltiplas Provas**

**Funcionalidade:**
- [ ] Criar múltiplas metas de prova
- [ ] Priorização de provas (A, B, C)
- [ ] Plano integrado considerando todas as provas
- [ ] Gestão de períodos de recuperação entre provas
- [ ] Visualização de calendário anual

**Modelo de Dados:**
```prisma
model RaceGoal {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  
  raceName        String
  raceDate        DateTime
  distance        String   // "5K", "10K", "HALF", "FULL"
  targetTime      String?
  priority        RacePriority @default(B) // A, B, C
  
  isActive        Boolean  @default(true)
  isPrimary       Boolean  @default(false) // Prova principal
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([userId])
  @@index([raceDate])
}

enum RacePriority {
  A // Prova principal
  B // Prova secundária
  C // Prova treino
}
```

**Arquivos:**
- `app/provas/page.tsx` (novo)
- `components/race-calendar.tsx` (novo)
- `lib/multi-race-planner.ts` (novo)

#### **Semana 6-7: Relatórios Semanais Automatizados**

**Funcionalidade:**
- [ ] Geração automática todo domingo à noite
- [ ] Análise da semana com IA
- [ ] Insights e recomendações
- [ ] Envio por email
- [ ] Visualização in-app

**Estrutura do Relatório:**
```
📊 SEU RELATÓRIO SEMANAL - Semana de 25/11 a 01/12

🏃 RESUMO DA SEMANA
- Treinos planejados: 5
- Treinos realizados: 4 (80%)
- Distância total: 42.5 km
- Tempo total: 4h 15min

📈 DESTAQUES
✅ Longão de 20km completado com sucesso!
⚠️ Treino de terça pulado
💪 Melhora de pace no treino de tempo

🤖 ANÁLISE DA IA
"Sua semana foi produtiva com boa aderência ao plano.
O longão foi executado no pace correto, mostrando boa
adaptação ao volume. Tente não pular treinos de 
recuperação, eles são importantes para absorver a carga."

📊 PRÓXIMA SEMANA
- Volume: 45km (+5%)
- Destaque: Treino de intervalados 5x1000m
- Foco: Trabalho de velocidade

🎯 DISTÂNCIA ATÉ A PROVA: 8 semanas
```

**Arquivos:**
- `lib/weekly-report-generator.ts` (novo)
- `app/api/cron/generate-weekly-reports/route.ts` (novo)
- `app/relatorios/page.tsx` (novo)
- `components/weekly-report-card.tsx` (novo)

#### **Semana 7-8: Polimento e Testes**

- [ ] Revisar todas as features premium
- [ ] Testes de performance
- [ ] Validar feature gates em todas as páginas
- [ ] Garantir consistência de UX
- [ ] Preparar materiais de marketing
- [ ] Criar vídeos demonstrativos de cada feature

---

## 6. FASE 3: APLICATIVO MOBILE (12-16 semanas)

### 🎯 Objetivo
Desenvolver apps nativos para iOS e Android com paridade de features com a web.

### 🛠️ Stack Recomendada

**Opção 1: React Native + Expo (Recomendado)**
- ✅ Compartilha código com web (80%+)
- ✅ Conhecimento TypeScript/React já existente
- ✅ Acesso a push notifications nativo
- ✅ Over-the-air updates com Expo
- ✅ Ecossistema maduro
- ⚠️ Performance ligeiramente inferior ao nativo

**Opção 2: Flutter**
- ✅ Performance excelente
- ✅ UI muito polida
- ⚠️ Nova linguagem (Dart)
- ⚠️ Menos reuso de código web

**Decisão:** **React Native + Expo** (melhor ROI e time-to-market)

### 📋 Tarefas

#### **Semana 1-2: Setup e Arquitetura**

**Estrutura do Projeto:**
```
athera-run-mobile/
├── app/                    # App Router (Expo Router)
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/            # Bottom tabs navigation
│   │   ├── dashboard.tsx
│   │   ├── plano.tsx
│   │   ├── treinos.tsx
│   │   └── perfil.tsx
│   └── _layout.tsx
├── components/
│   ├── ui/                # React Native components
│   └── features/
├── lib/
│   ├── api/               # tRPC client
│   ├── auth/              # Auth context
│   └── stores/            # Zustand stores
├── assets/
└── package.json
```

**Dependências:**
```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "expo-router": "~3.4.0",
    "react-native": "0.73.2",
    "@tanstack/react-query": "^5.0.0",
    "@trpc/client": "^10.45.0",
    "zustand": "^4.4.0",
    "react-native-reanimated": "~3.6.0",
    "expo-secure-store": "~12.8.0",
    "expo-notifications": "~0.27.0",
    "expo-auth-session": "~5.4.0",
    "react-native-chart-kit": "^6.12.0"
  }
}
```

**Tarefas:**
- [ ] Criar novo projeto Expo
- [ ] Configurar Expo Router
- [ ] Setup tRPC para comunicação com API
- [ ] Configurar autenticação (JWT)
- [ ] Setup de stores globais (Zustand)
- [ ] Criar componentes base de UI

**Arquivos:**
- `athera-run-mobile/` (novo repositório ou monorepo)

#### **Semana 3-5: API Backend para Mobile**

**tRPC Setup (Backend):**
```typescript
// nextjs_space/server/trpc.ts
import { initTRPC } from '@trpc/server';
import { getServerSession } from 'next-auth';

const t = initTRPC.context().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const session = await getServerSession();
  if (!session) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { ...ctx, session } });
});

// nextjs_space/server/routers/_app.ts
export const appRouter = router({
  auth: authRouter,
  plan: planRouter,
  workout: workoutRouter,
  profile: profileRouter,
  subscription: subscriptionRouter,
  strava: stravaRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;
```

**Endpoints Necessários:**
- [ ] Auth (login, signup, refresh token)
- [ ] Profile (get, update)
- [ ] Plan (get, generate, update)
- [ ] Workouts (list, get, create, update, delete)
- [ ] Subscription (status, checkout, portal)
- [ ] Strava (connect, disconnect, sync)
- [ ] Chat (send message, get history)
- [ ] Notifications (register device, preferences)

**Arquivos:**
- `nextjs_space/server/trpc.ts` (novo)
- `nextjs_space/server/routers/` (pasta nova)
- `nextjs_space/app/api/trpc/[trpc]/route.ts` (endpoint HTTP)

#### **Semana 5-8: Desenvolvimento do App - Core Features**

**Telas Principais:**

1. **Onboarding & Auth**
   - [ ] Splash screen
   - [ ] Login / Signup
   - [ ] Onboarding de 5 etapas (mesmo da web)

2. **Dashboard**
   - [ ] Resumo da semana
   - [ ] Próximo treino
   - [ ] Estatísticas principais
   - [ ] Progresso da meta

3. **Plano de Treinos**
   - [ ] Visualização semanal (scroll horizontal)
   - [ ] Detalhes do treino
   - [ ] Marcar como completo
   - [ ] Lançamento manual

4. **Treinos (Lista)**
   - [ ] Histórico de treinos
   - [ ] Filtros (data, tipo)
   - [ ] Estatísticas agregadas
   - [ ] Gráficos simples

5. **Perfil**
   - [ ] Dados do usuário
   - [ ] Configurações
   - [ ] Plano de assinatura
   - [ ] Conexão Strava
   - [ ] Logout

**Componentes Chave:**
```tsx
// components/workout-card.tsx
export function WorkoutCard({ workout }: { workout: Workout }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.type}>{workout.type}</Text>
        <Badge>{workout.status}</Badge>
      </View>
      
      <Text style={styles.title}>{workout.name}</Text>
      
      <View style={styles.metrics}>
        <Metric icon="route" value={`${workout.distance}km`} />
        <Metric icon="clock" value={workout.duration} />
        <Metric icon="zap" value={workout.pace} />
      </View>
      
      <Button 
        onPress={handleComplete}
        disabled={workout.status === 'COMPLETED'}
      >
        {workout.status === 'COMPLETED' ? 'Completo' : 'Marcar como Completo'}
      </Button>
    </View>
  );
}
```

**Arquivos:**
- `app/(tabs)/dashboard.tsx`
- `app/(tabs)/plano.tsx`
- `app/(tabs)/treinos.tsx`
- `app/(tabs)/perfil.tsx`
- `components/workout-card.tsx`
- `components/week-calendar.tsx`
- Diversos outros componentes

#### **Semana 8-10: Features Premium no Mobile**

**Integração Strava:**
- [ ] OAuth flow em mobile (Expo AuthSession)
- [ ] Sincronização automática em background
- [ ] Visualização de atividades importadas

**Notificações Push:**
- [ ] Solicitar permissões
- [ ] Registrar device token
- [ ] Handling de notificações
- [ ] Deep linking

**Ajustes Automáticos:**
- [ ] Modal de ajuste sugerido
- [ ] Comparação lado-a-lado
- [ ] Aprovação/rejeição

**Chat:**
- [ ] Interface de chat nativa
- [ ] Sincronização em tempo real
- [ ] Contador de mensagens (Free users)

**Arquivos:**
- `lib/strava-auth.ts`
- `lib/notifications.ts`
- `components/adjustment-modal-mobile.tsx`
- `app/chat.tsx`

#### **Semana 10-12: Polimento e Otimizações**

**Performance:**
- [ ] Lazy loading de telas
- [ ] Cache com React Query
- [ ] Otimização de imagens
- [ ] Reduzir bundle size

**UX:**
- [ ] Animações suaves (Reanimated)
- [ ] Gesture handling (pan, swipe)
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states

**Offline Support:**
- [ ] Cache de dados locais (AsyncStorage)
- [ ] Queue de ações offline
- [ ] Sincronização ao voltar online

**Arquivos:**
- `lib/offline-sync.ts`
- `lib/cache-manager.ts`

#### **Semana 12-14: Testes e Beta**

**Testes:**
- [ ] Testes unitários (Jest)
- [ ] Testes de integração
- [ ] Testes em dispositivos reais (iOS e Android)
- [ ] Testes de performance

**Beta Testing:**
- [ ] TestFlight (iOS) - 100 beta testers
- [ ] Google Play Beta (Android) - 100 beta testers
- [ ] Coletar feedback
- [ ] Iterar baseado em feedback

**Arquivos:**
- `__tests__/` (pasta)

#### **Semana 14-16: Lançamento**

**Preparação App Store:**
- [ ] Screenshots (6.5", 5.5")
- [ ] Preview videos
- [ ] App icon (1024x1024)
- [ ] Descrição otimizada (ASO)
- [ ] Privacy policy
- [ ] Terms of service

**Preparação Play Store:**
- [ ] Screenshots (phone, tablet)
- [ ] Feature graphic
- [ ] App icon (512x512)
- [ ] Descrição otimizada
- [ ] Privacy policy

**Submissão:**
- [ ] Submeter para Apple App Store
- [ ] Submeter para Google Play Store
- [ ] Aguardar aprovação (3-7 dias iOS, 1-3 dias Android)
- [ ] Launch! 🚀

**Marketing:**
- [ ] Anúncio nas redes sociais
- [ ] Email para usuários existentes
- [ ] Press release
- [ ] Influenciadores de corrida

---

## 7. FASE 4: OTIMIZAÇÃO E ESCALA (contínuo)

### 🎯 Objetivo
Otimizar performance, reduzir custos, melhorar conversão e escalar operações.

### 📋 Tarefas Contínuas

#### **Performance e Custos**

**Otimização de Custos de IA:**
- [ ] Implementar cache de respostas similares
- [ ] Usar modelo mais barato para tarefas simples (GPT-3.5)
- [ ] Rate limiting por tier
- [ ] Monitorar custos por usuário

```typescript
// lib/ai-cost-optimizer.ts
export async function optimizedAICall(
  prompt: string,
  complexity: 'low' | 'medium' | 'high'
) {
  // Cache check
  const cached = await getCachedResponse(prompt);
  if (cached) return cached;
  
  // Choose model based on complexity
  const model = complexity === 'low' ? 'gpt-3.5-turbo' : 'gpt-4o';
  
  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: complexity === 'low' ? 500 : 1500,
  });
  
  // Cache for future use
  await cacheResponse(prompt, response);
  
  return response;
}
```

**Otimização de Database:**
- [ ] Adicionar índices nas queries mais frequentes
- [ ] Implementar connection pooling
- [ ] Query optimization (usar EXPLAIN)
- [ ] Archive de dados antigos

**CDN e Assets:**
- [ ] Mover imagens para CDN (Cloudflare, Vercel)
- [ ] Otimização de imagens (next/image)
- [ ] Lazy loading

#### **Monitoramento e Observabilidade**

**Ferramentas:**
- [ ] Sentry - Error tracking
- [ ] Vercel Analytics - Performance
- [ ] PostHog - Product analytics
- [ ] Stripe Dashboard - Payment analytics

**Métricas Chave:**
```typescript
// Monitorar:
- MAU (Monthly Active Users)
- DAU/MAU ratio
- Conversion rate (Free → Premium)
- Churn rate
- MRR/ARR
- LTV/CAC
- API response time
- Error rate
- OpenAI API costs per user
```

#### **A/B Testing**

**Testes Sugeridos:**
- [ ] Diferentes preços (R$ 24,90 vs R$ 29,90)
- [ ] Duração do trial (7 vs 14 dias)
- [ ] Copy da página de pricing
- [ ] Design do upgrade modal
- [ ] Posicionamento de CTAs

**Ferramenta:** PostHog Feature Flags + A/B Testing

#### **SEO e Marketing de Conteúdo**

**Blog:**
- [ ] Criar seção de blog
- [ ] 2-3 artigos/semana sobre corrida
- [ ] Otimizar para SEO
- [ ] Link building

**Tópicos:**
- "Como treinar para sua primeira maratona"
- "Guia completo de periodização"
- "Como calcular seu pace ideal"
- "Nutrição para maratonistas"
- Etc.

#### **Integrações Adicionais**

**Futuras Integrações:**
- [ ] Garmin Connect
- [ ] Polar Flow
- [ ] Apple Health / Google Fit
- [ ] TrainingPeaks
- [ ] Zapier (automação)

#### **Referral Program**

**Mecânica:**
- Indique um amigo → ambos ganham 1 mês grátis
- Link único por usuário
- Dashboard de referrals
- Gamificação (leaderboard)

**Arquivos:**
- `app/indicar/page.tsx`
- `lib/referral-service.ts`
- `app/api/referral/create/route.ts`

---

## 8. MÉTRICAS E KPIs

### 📊 Dashboard de Métricas (Admin)

**Financeiro:**
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- Churn Rate
- LTV (Lifetime Value)
- CAC (Customer Acquisition Cost)

**Produto:**
- MAU / DAU
- Planos gerados / mês
- Treinos completos / usuário
- Taxa de aderência ao plano
- Tempo médio no app

**Conversão:**
- Trial → Premium (target: 30%)
- Free → Trial (target: 40%)
- Free → Premium direto (target: 5%)

**Qualidade:**
- NPS (Net Promoter Score) - target: >40
- CSAT (Customer Satisfaction) - target: >4.5/5
- Churn rate - target: <5%/mês

**Implementação:**
```typescript
// app/admin/metrics/page.tsx
export default function MetricsPage() {
  return (
    <div>
      <Card>
        <h2>Financial</h2>
        <MetricCard
          label="MRR"
          value="R$ 17.940"
          change="+24%"
          trend="up"
        />
        {/* ... */}
      </Card>
      
      <Card>
        <h2>User Acquisition</h2>
        <Chart type="line" data={userGrowthData} />
      </Card>
      
      {/* ... */}
    </div>
  );
}
```

---

## 9. CUSTOS ESTIMADOS

### 💰 Custos Mensais por Fase

#### **Fase 1-2: Web App com Assinaturas**

| Item | Custo Mensal | Observações |
|------|--------------|-------------|
| **Hospedagem (Vercel Pro)** | R$ 100 | Até 100GB bandwidth |
| **Database (Heroku/Railway)** | R$ 35 | PostgreSQL 10GB |
| **Stripe** | 4.99% + R$ 0,39/transação | ~R$ 500 em R$ 10k MRR |
| **OpenAI API** | ~R$ 2.000 | 100 users, ~R$ 20/user |
| **Email (Resend)** | R$ 50 | 10k emails/mês |
| **Push Notifications (OneSignal)** | R$ 0 | Free até 10k subscribers |
| **Domínio atherarun.com** | R$ 7 | Anual ÷ 12 |
| **SSL Certificate** | R$ 0 | Gratuito (Cloudflare) |
| **Total Fase 1-2** | **~R$ 2.692** | Escala com usuários |

#### **Fase 3: Aplicativo Mobile**

| Item | Custo Mensal | Observações |
|------|--------------|-------------|
| **Todos os custos acima** | R$ 2.692 | - |
| **Apple Developer** | R$ 50 | R$ 599/ano ÷ 12 |
| **Google Play Store** | R$ 5 | Taxa única R$ 125 ÷ 24 meses |
| **Expo EAS Build** | R$ 150 | Production plan |
| **Push Cert (iOS)** | R$ 0 | Incluído no Apple Dev |
| **Total Fase 3** | **~R$ 2.897** | + custos variáveis |

#### **Custos Variáveis (por usuário ativo)**

| Recurso | Custo/User/Mês | Observação |
|---------|----------------|------------|
| **OpenAI API** | R$ 15-25 | Depende do uso |
| **Database storage** | R$ 0,10 | Crescimento gradual |
| **Bandwidth** | R$ 0,05 | Média |
| **Push notifications** | R$ 0,02 | >10k subscribers |
| **Total/User** | **~R$ 15-25** | Premium users |

#### **Break-even Analysis**

Com **60 assinantes Premium (R$ 29,90/mês)**:
- Receita: 60 × R$ 29,90 = **R$ 1.794**
- Custos fixos: R$ 2.897
- Custos variáveis: 60 × R$ 20 = R$ 1.200
- **Total custos: R$ 4.097**
- **Prejuízo: -R$ 2.303**

Com **200 assinantes Premium**:
- Receita: 200 × R$ 29,90 = **R$ 5.980**
- Custos fixos: R$ 2.897
- Custos variáveis: 200 × R$ 20 = R$ 4.000
- **Total custos: R$ 6.897**
- **Prejuízo: -R$ 917**

Com **300 assinantes Premium** (Break-even):
- Receita: 300 × R$ 29,90 = **R$ 8.970**
- Custos fixos: R$ 2.897
- Custos variáveis: 300 × R$ 18 = R$ 5.400 (economia de escala)
- **Total custos: R$ 8.297**
- **Lucro: +R$ 673** ✅

**Meta Break-even:** 300 assinantes Premium (Mês 4-5)

---

## 10. TIMELINE CONSOLIDADO

### 📅 Cronograma Geral (6 meses)

```
Mês 1       Mês 2       Mês 3       Mês 4       Mês 5       Mês 6
│           │           │           │           │           │
├─ Fase 1 ──┤           │           │           │           │
│  Stripe   │           │           │           │           │
│  Payments │           │           │           │           │
│           │           │           │           │           │
│           ├── Fase 2 ─┴─────────┤ │           │           │
│           │   Features Premium   │ │           │           │
│           │   - Auto-adjust      │ │           │           │
│           │   - Notificações     │ │           │           │
│           │   - Analytics        │ │           │           │
│           │                      │ │           │           │
│           │                      │ ├─── Fase 3 ────────┬──┤
│           │                      │ │   Mobile App      │  │
│           │                      │ │   - iOS/Android   │  │
│           │                      │ │   - Features      │  │
│           │                      │ │   - Beta Testing  │  │
│           │                      │ │                   │  │
└───────────┴──────────────────────┴─┴───────────────────┴──┘
  Sem 1-6     Sem 7-14              Sem 15-26

Fase 4: Contínua durante todas as fases (monitoramento, otimização)
```

### 🎯 Milestones Principais

| Semana | Milestone | Entregável |
|--------|-----------|------------|
| **2** | Stripe integrado | Checkout funcionando |
| **4** | Feature flags ativos | Free vs Premium separado |
| **6** | Sistema de trial | Novos users em trial 7 dias |
| **8** | Auto-adjust premium | Feature exclusiva funcionando |
| **10** | Notificações ativas | Push + Email |
| **12** | Analytics avançado | Dashboard premium completo |
| **14** | Mobile MVP | App funcionando em test devices |
| **18** | Beta testing | 100 beta testers (50 iOS + 50 Android) |
| **22** | App Store submission | Apps submetidos |
| **24** | Launch mobile! 🚀 | Apps na store |
| **26** | Review & iterate | Ajustes baseados em feedback |

---

## 📋 PRÓXIMOS PASSOS IMEDIATOS

### Esta Semana (Semana 1)

1. **Setup do Stripe**
   - [ ] Criar conta Stripe
   - [ ] Configurar produtos e preços
   - [ ] Obter API keys (test + production)

2. **Planejamento Detalhado**
   - [ ] Revisar e aprovar este roadmap
   - [ ] Definir prioridades (se alguma mudança)
   - [ ] Criar board no Trello/Linear/GitHub Projects

3. **Preparação do Código**
   - [ ] Criar branch `feature/subscriptions`
   - [ ] Setup inicial do Prisma schema
   - [ ] Criar estrutura de pastas

4. **Documentação**
   - [ ] Documentar decisões técnicas
   - [ ] Criar guias para cada fase
   - [ ] Preparar templates de código

### Semana 2

1. **Implementação Stripe (Backend)**
   - [ ] Webhook endpoint
   - [ ] Checkout session
   - [ ] Portal session
   - [ ] Subscription service

2. **Banco de Dados**
   - [ ] Adicionar modelo Subscription
   - [ ] Migration
   - [ ] Seed data para testes

### Semana 3

1. **Frontend de Pagamentos**
   - [ ] Página /pricing
   - [ ] Fluxo de checkout
   - [ ] Modal de upgrade

---

## 🎯 MÉTRICAS DE SUCESSO (Ano 1)

| Objetivo | Q1 (3 meses) | Q2 (6 meses) | Q3 (9 meses) | Q4 (12 meses) |
|----------|--------------|--------------|--------------|---------------|
| **Usuários Ativos** | 300 | 800 | 1.500 | 2.500 |
| **Assinantes Premium** | 50 | 200 | 450 | 750 |
| **MRR** | R$ 1.500 | R$ 6.000 | R$ 13.500 | R$ 22.500 |
| **ARR** | R$ 18.000 | R$ 72.000 | R$ 162.000 | R$ 270.000 |
| **Taxa de Conversão** | 15% | 25% | 30% | 30% |
| **Churn Mensal** | <8% | <6% | <5% | <5% |
| **NPS** | >30 | >40 | >50 | >60 |

**Meta Financeira Ano 1:** **R$ 270.000 ARR** com **750 assinantes Premium**

---

## ✅ CHECKLIST DE VALIDAÇÃO

Antes de seguir para próxima fase, validar:

### Fase 1 (Assinaturas)
- [ ] Checkout funcionando end-to-end
- [ ] Webhooks processando corretamente
- [ ] Feature gates impedindo acesso não autorizado
- [ ] Trial de 7 dias funcionando
- [ ] Cancelamento e reativação funcionando
- [ ] Testado em ambiente de produção

### Fase 2 (Features Premium)
- [ ] Auto-adjust gerando sugestões relevantes
- [ ] Notificações chegando (push + email)
- [ ] Chat respeitando limites do Free
- [ ] Analytics mostrando dados corretos
- [ ] Multi-race planning funcionando
- [ ] Relatórios semanais sendo gerados

### Fase 3 (Mobile App)
- [ ] App rodando em iOS e Android
- [ ] Todas as features principais funcionando
- [ ] Integração com backend funcionando
- [ ] Notificações push funcionando
- [ ] Strava OAuth funcionando
- [ ] Performance aceitável (60fps)
- [ ] Aprovado em Beta Testing (NPS > 40)
- [ ] Submetido às stores

---

## 🚀 CONCLUSÃO

Este roadmap representa **6 meses de desenvolvimento focado** para transformar o Athera Run em uma plataforma premium completa com aplicativos mobile nativos.

**Investimento Total Estimado:** R$ 17.382 (6 meses de custos operacionais)  
**Break-even Projetado:** Mês 4-5 com 300 assinantes Premium  
**ROI Positivo:** A partir do Mês 6

**Recursos Necessários:**
- 1 desenvolvedor full-time (você) - 40h/semana
- Custos de infraestrutura conforme tabela acima
- Budget de marketing (opcional): R$ 2.000-5.000/mês após Fase 2

**Próximo Passo:** Começar Fase 1 - Semana 1 - Setup do Stripe! 🚀

---

**Documento criado por:** Athera Run Team  
**Data:** 01/11/2025  
**Versão:** 1.0  
**Status:** Pronto para execução ✅
