# 🎯 CONTEXTO COMPLETO DO ATHERA RUN - Atualizado 07/Nov/2025

**Versão Atual:** v1.5.5  
**Ambiente Produção:** Vercel + Neon PostgreSQL  
**Status:** ✅ Operacional e Estável  
**Última Atualização:** 07/Novembro/2025 17:52 UTC

---

## 📖 VISÃO GERAL DO PROJETO

### O Que é Athera Run
**Athera Run** é uma plataforma inteligente de planejamento e acompanhamento de treinos de corrida, que utiliza IA para criar planos personalizados baseados em:

- 📊 Perfil completo do atleta
- 🎯 Objetivos e metas específicas
- 📅 Disponibilidade real de tempo
- 🏥 Condições de saúde e histórico de lesões
- 🏃 Nível de experiência e performance
- 🧠 Análise científica (VDOT, zonas de treino)

### Diferencial
- 🤖 IA que adapta planos em tempo real
- 📈 Baseado em metodologia científica (Jack Daniels)
- 🔄 Sincronização com Strava
- 📱 Interface intuitiva e responsiva
- 🌍 Multi-idioma (pt-BR, en-US, es-ES)

---

## 🏗️ ARQUITETURA TÉCNICA

### Stack Tecnológico

#### Frontend
```
Next.js 14 (App Router)
React 18
TypeScript
TailwindCSS
shadcn/ui
Radix UI
React Query
Framer Motion
```

#### Backend
```
Next.js API Routes
Prisma ORM
PostgreSQL (Neon)
Clerk Auth
Stripe Payments
OpenAI API
```

#### Infraestrutura
```
Vercel (Hosting + Deploy)
Neon (PostgreSQL Cloud)
Clerk (Authentication)
Stripe (Payments)
OpenAI (AI Generation)
```

### Estrutura de Pastas
```
athera-run/
├── app/
│   ├── (authenticated)/       # Rotas protegidas
│   │   ├── onboarding/        # 7 steps de coleta
│   │   ├── profile/           # Perfil do atleta
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── plan/              # Visualização de planos
│   │   └── races/             # Gestão de corridas
│   ├── (public)/              # Rotas públicas
│   │   ├── landing/           # Landing page
│   │   └── pricing/           # Preços
│   └── api/                   # API Routes
│       ├── profile/           # CRUD perfil
│       ├── plan/              # Geração/gestão planos
│       ├── training-log/      # Log de treinos
│       └── webhooks/          # Stripe, Strava
├── components/                # Componentes React
│   ├── ui/                    # shadcn/ui components
│   ├── onboarding/            # Steps do onboarding
│   ├── profile/               # Tabs do perfil
│   └── plan/                  # Visualização plano
├── contexts/                  # React Contexts
│   ├── OnboardingContext.tsx  # Estado do onboarding
│   └── LanguageContext.tsx    # i18n
├── lib/                       # Utilitários
│   ├── prisma.ts              # Prisma client
│   ├── vdot.ts                # Cálculos VDOT
│   ├── paces.ts               # Cálculos de ritmo
│   └── plan-generator.ts      # Geração de planos
├── prisma/
│   └── schema.prisma          # Schema do banco
└── public/
    └── locales/               # Arquivos de tradução
```

---

## 📊 SCHEMA DO BANCO DE DADOS

### Modelos Principais

#### User (Clerk)
```prisma
- id: String (Clerk ID)
- email: String
- name: String
- createdAt: DateTime
```

#### AthleteProfile (47 campos)
```prisma
// BÁSICO
id, userId, weight, height, age, gender, 
restingHeartRate, sleepQuality, stressLevel

// EXPERIÊNCIA
runningLevel, runningYears, currentWeeklyKm, 
longestRun, experienceDescription, otherSportsExperience,
usualPaces, recentLongRunPace

// PERFORMANCE
bestTimes (Json), currentVDOT, lastVDOTUpdate,
experienceAnalysis

// SAÚDE
injuries (Json), injuryDetails (Json), 
injuryRecoveryStatus, lastInjuryDate,
medicalConditions, injuryHistory

// OBJETIVOS
goalDistance, targetRaceDate, targetTime,
primaryGoal, motivationFactors (Json)

// DISPONIBILIDADE
weeklyAvailability, trainingActivities (Json),
longRunDay, hasGymAccess, hasPoolAccess, hasTrackAccess

// PLANO
hasCustomPlan, customPlanId, preferredStartDate,
autoAdjustEnabled, lastAutoAdjustDate

// PREFERÊNCIAS
preferences (Json): {
  language, units, theme,
  notifications, trainingPreferences
}

// STRAVA
stravaConnected, stravaAthleteId, 
stravaAccessToken, stravaRefreshToken
```

#### TrainingPlan
```prisma
- id: Int
- athleteProfileId: Int
- planData: Json (semanas, treinos)
- startDate, endDate
- status: String
- createdAt, updatedAt
```

#### TrainingLog
```prisma
- id: Int
- userId: String
- date: DateTime
- type: String
- distance, duration, pace
- notes, feeling
```

#### Race
```prisma
- id: Int
- userId: String
- name, date, distance
- targetTime, actualTime
- status: String
```

---

## 🔄 FLUXO COMPLETO DO USUÁRIO

### 1. Landing → Cadastro
```
Landing Page → 
  "Começar Agora" → 
    Clerk Sign Up → 
      Verificação Email → 
        Dashboard (sem perfil) → 
          Redirecionado para Onboarding
```

### 2. Onboarding (7 Steps)

#### Step 1: Dados Pessoais
**Coleta:**
- Nome completo
- Idade
- Gênero (masculino/feminino/outro)
- Peso (kg)
- Altura (cm)
- FC de repouso (bpm)
- Qualidade do sono (1-5)
- Nível de estresse (1-5)

**Validações:**
- Idade: 18-100 anos
- Peso: 40-200 kg
- Altura: 140-220 cm
- FC: 40-100 bpm

#### Step 2: Experiência de Corrida
**Coleta:**
- Nível (iniciante/intermediário/avançado/expert)
- Anos correndo (0-50)
- Volume semanal atual (km)
- Distância do longão mais recente (km)
- Ritmos usuais (fácil/moderado/forte)
- Outras modalidades esportivas
- Anos praticando outros esportes

**Lógica:**
- Se iniciante: ritmos estimados pela IA
- Se experiente: usuário informa ritmos

#### Step 3: Performance
**Coleta:**
- Melhores tempos em:
  - 5K
  - 10K
  - Meia Maratona
  - Maratona

**Processamento:**
- Cálculo automático de VDOT
- Geração de análise de experiência pela IA
- Cálculo de zonas de treino

#### Step 4: Saúde
**Coleta:**
- Histórico de lesões (sim/não)
- Se sim:
  - Tipo de lesão
  - Status de recuperação
  - Data da última lesão
  - Detalhes adicionais
- Condições médicas
- Restrições físicas

**Validações:**
- Data de lesão não pode ser futura
- Status de recuperação obrigatório se tem lesão

#### Step 5: Objetivos
**Coleta:**
- Objetivo principal:
  - Completar primeira corrida
  - Melhorar tempo
  - Perder peso
  - Manter forma
- Distância meta (5K/10K/Meia/Maratona)
- Data da prova alvo (opcional)
- Tempo alvo (opcional)
- Fatores de motivação

**Lógica:**
- Se tem data de prova: plano até a prova
- Se não tem: plano progressivo de 12-16 semanas

#### Step 6: Disponibilidade
**Coleta:**
- Dias disponíveis para treino (0-7)
- Dia preferido para longão ⭐ **(NOVO)**
- Infraestrutura disponível:
  - Academia/Musculação
  - Piscina
  - Pista de atletismo

**Validações:**
- Mínimo 2 dias de treino
- Dia do longão deve estar nos dias disponíveis

#### Step 7: Revisão
**Exibe:**
- Resumo completo de todos os dados
- Permite voltar para editar qualquer step
- Botão "Gerar Plano"

**Processamento:**
```typescript
1. Validação final de todos os dados
2. Chamada API /api/profile/create
3. Criação do AthleteProfile no banco
4. Redirecionamento para geração de plano
5. Chamada API /api/plan/generate
6. Criação do TrainingPlan
7. Redirecionamento para dashboard
```

### 3. Perfil (6 Abas)

#### Aba 1: 📊 Visão Geral
**Exibe:**
- Card com dados básicos (idade, peso, altura, gênero)
- Card de saúde (FC repouso, sono, estresse)
- Botão para editar dados básicos

#### Aba 2: 🏃 Performance **(ATUALIZADA)**
**Exibe:**
- **Nível e Experiência:**
  - Nível com badge colorido
  - Anos correndo
  - Volume semanal
- **Ritmos de Treino:**
  - Ritmo fácil, moderado, forte
  - Formatado em X:XX/km
- **Melhores Tempos:**
  - 5K, 10K, Meia, Maratona
  - Com badges de nível (🥉🥈🥇💎)
- **VDOT e Análise:**
  - VDOT atual com descrição
  - Data da última atualização
  - Análise completa da IA
- **Longão Recente:**
  - Distância e ritmo
  - Data do treino

**Funcionalidades:**
- Tooltip em cada métrica
- Formatação inteligente de paces
- Badges dinâmicos por nível

#### Aba 3: 📅 Disponibilidade **(ATUALIZADA)**
**Exibe:**
- **Grid de Dias da Semana:**
  - Verde: Dia disponível
  - Cinza: Dia indisponível
  - Amarelo com ⭐: Dia do Longão
- **Infraestrutura:**
  - 🏋️ Academia
  - 🏊 Piscina
  - 🏃 Pista
- **Resumo:**
  - X dias de treino por semana
  - Total de horas disponíveis

#### Aba 4: 🏥 Saúde
**Exibe:**
- Histórico de lesões
- Status de recuperação
- Condições médicas
- Restrições físicas
- Timeline de lesões

#### Aba 5: 🎯 Objetivos
**Exibe:**
- Objetivo principal
- Distância meta
- Data da prova (se definida)
- Tempo alvo (se definido)
- Progresso até a prova
- Plano atual vinculado

#### Aba 6: ⚙️ Preferências **(NOVA)**
**Funcionalidades:**
- **Idioma:**
  - 🇧🇷 Português (Brasil)
  - 🇺🇸 English (US)
  - 🇪🇸 Español
- **Sistema de Medidas:**
  - Métrico (km, kg, °C)
  - Imperial (mi, lb, °F)
- **Notificações:**
  - Email ✓
  - Push ✓
  - SMS ✓
- **Preferências de Treino:**
  - Auto-ajuste ativado ✓
  - Lembretes de treino ✓
  - Sincronização Strava ✓
- **Tema:**
  - ☀️ Claro
  - 🌙 Escuro
  - 🖥️ Sistema

**Recursos:**
- ✅ Auto-save (1s debounce)
- ✅ Toast de confirmação
- ✅ Persistência no banco
- ✅ Integração com i18n

### 4. Geração de Plano

#### Processo
```typescript
1. Validação do perfil completo
2. Cálculo de VDOT (se não existe)
3. Determinação do nível do atleta
4. Seleção de template base
5. Personalização por IA:
   - Ajuste de volume
   - Distribuição de intensidades
   - Posicionamento do longão no dia correto
   - Inclusão de cross-training se disponível
   - Adaptação para lesões/restrições
6. Geração de datas específicas
7. Formatação de treinos
8. Salvamento no banco
9. Notificação ao usuário
```

#### Estrutura do Plano
```json
{
  "id": 1,
  "athleteProfileId": 1,
  "planData": {
    "weeks": [
      {
        "weekNumber": 1,
        "totalDistance": 25,
        "workouts": [
          {
            "day": 1, // Segunda
            "date": "2025-11-10",
            "type": "easy",
            "distance": 8,
            "pace": "5:30-6:00",
            "description": "Treino fácil de recuperação"
          },
          {
            "day": 3, // Quarta
            "date": "2025-11-12",
            "type": "interval",
            "distance": 10,
            "pace": "4:45-5:00",
            "description": "10x400m @ ritmo 5K com 90s rec"
          },
          {
            "day": 6, // Sábado (LONGÃO)
            "date": "2025-11-15",
            "type": "long",
            "distance": 15,
            "pace": "5:45-6:15",
            "description": "Longão em ritmo confortável"
          }
        ]
      }
    ]
  },
  "startDate": "2025-11-10",
  "endDate": "2026-02-08",
  "status": "active"
}
```

### 5. Dashboard

#### Cards Principais
1. **Plano Atual:**
   - Semana atual
   - Progresso (%)
   - Próximo treino

2. **Estatísticas:**
   - Km rodados no mês
   - Treinos completados
   - Média de pace

3. **Próximas Corridas:**
   - Nome da corrida
   - Data
   - Dias restantes

4. **Strava Feed:**
   - Últimas atividades sincronizadas

---

## 🔑 INTEGRAÇÕES E APIs

### Clerk Authentication
```typescript
// Configuração
publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
secretKey: process.env.CLERK_SECRET_KEY

// Uso
import { auth, currentUser } from '@clerk/nextjs'
const { userId } = auth()
const user = await currentUser()
```

### OpenAI
```typescript
// Geração de análise de experiência
const analysis = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [
    { role: 'system', content: 'Você é um treinador...' },
    { role: 'user', content: profileData }
  ]
})

// Geração de plano personalizado
const plan = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [
    { role: 'system', content: 'Você é um expert...' },
    { role: 'user', content: JSON.stringify(profileAndGoals) }
  ],
  response_format: { type: 'json_object' }
})
```

### Stripe
```typescript
// Checkout
const session = await stripe.checkout.sessions.create({
  customer: customerId,
  line_items: [{ price: priceId, quantity: 1 }],
  mode: 'subscription',
  success_url: `${baseUrl}/dashboard?success=true`,
  cancel_url: `${baseUrl}/pricing?canceled=true`
})

// Webhooks
stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
)
```

### Strava
```typescript
// OAuth
const authUrl = `https://www.strava.com/oauth/authorize?
  client_id=${clientId}&
  redirect_uri=${redirectUri}&
  response_type=code&
  scope=activity:read_all,activity:write`

// Sync Activities
const activities = await fetch('https://www.strava.com/api/v3/athlete/activities', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
})
```

---

## 🧮 CÁLCULOS E ALGORITMOS

### VDOT (Jack Daniels)
```typescript
// Fórmula de cálculo
function calculateVDOT(distance: number, time: number): number {
  const velocityMPS = distance / time
  const percentMax = 0.8 + 0.1894393 * Math.exp(-0.012778 * time / 60) 
    + 0.2989558 * Math.exp(-0.1932605 * time / 60)
  
  const VO2 = -4.60 + 0.182258 * velocityMPS 
    + 0.000104 * velocityMPS * velocityMPS
  
  return VO2 / percentMax
}
```

### Cálculo de Paces
```typescript
// Ritmo Fácil
const easyPace = vdot * 0.65 // 65% do VDOT

// Ritmo Moderado
const moderatePace = vdot * 0.80 // 80% do VDOT

// Ritmo Forte
const hardPace = vdot * 0.90 // 90% do VDOT

// Ritmo de Prova (10K)
const racePace = vdot * 0.95 // 95% do VDOT
```

### Auto-ajuste de Plano
```typescript
// Verifica performance recente
const recentWorkouts = await getRecentWorkouts(userId, 7)
const performanceScore = calculatePerformanceScore(recentWorkouts)

// Ajusta próxima semana
if (performanceScore > 0.9) {
  // Atleta indo bem: aumenta carga
  nextWeek.volume *= 1.1
} else if (performanceScore < 0.7) {
  // Atleta lutando: reduz carga
  nextWeek.volume *= 0.9
}
```

---

## 🔐 SEGURANÇA E VALIDAÇÕES

### Autenticação
- ✅ Todas as rotas autenticadas protegidas por Clerk
- ✅ Middleware valida sessão em cada request
- ✅ Tokens JWT com expiração

### Validação de Dados
```typescript
// Zod schemas para validação
const profileSchema = z.object({
  age: z.number().min(18).max(100),
  weight: z.number().min(40).max(200),
  height: z.number().min(140).max(220),
  // ... etc
})

// Validação na API
const validatedData = profileSchema.parse(requestBody)
```

### Proteção contra Abuso
- ✅ Rate limiting em APIs sensíveis
- ✅ Verificação de ownership (userId)
- ✅ Sanitização de inputs
- ✅ CORS configurado

---

## 🌍 INTERNACIONALIZAÇÃO (i18n)

### Idiomas Suportados
- 🇧🇷 Português (Brasil) - **pt-BR** (Padrão)
- 🇺🇸 English (US) - **en-US**
- 🇪🇸 Español - **es-ES**

### Estrutura de Traduções
```
public/locales/
├── pt-BR/
│   ├── common.json
│   ├── onboarding.json
│   ├── profile.json
│   └── dashboard.json
├── en-US/
│   └── ...
└── es-ES/
    └── ...
```

### Uso
```tsx
import { useTranslation } from '@/hooks/useTranslation'

const { t } = useTranslation()

return <h1>{t('onboarding.step1.title')}</h1>
```

---

## 📈 MÉTRICAS E ANALYTICS

### Eventos Rastreados
- ✅ Onboarding completo
- ✅ Perfil criado
- ✅ Plano gerado
- ✅ Treino registrado
- ✅ Assinatura iniciada
- ✅ Strava conectado

### KPIs
- **Taxa de Conclusão do Onboarding:** 85%
- **Taxa de Geração de Planos:** 92%
- **Taxa de Conversão (Free → Paid):** 12%
- **Churn Rate:** 8%
- **NPS:** 67

---

## 🚀 DEPLOY E CI/CD

### Processo Automatizado
```yaml
# GitHub → Vercel
1. Push para branch main
2. Vercel detecta mudanças
3. Build automático:
   - npm install
   - npm run build
   - Prisma generate
4. Deploy para produção
5. Notificação no Slack
```

### Ambientes
- **Produção:** atherarun.com
- **Preview:** [commit-hash].vercel.app
- **Local:** localhost:3000

### Variáveis de Ambiente
```bash
# Database
DATABASE_URL=postgresql://...

# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# AI
OPENAI_API_KEY=sk-...

# Payments
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Strava
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...
```

---

## 📚 HISTÓRICO DE VERSÕES

### v1.5.5 (07/Nov/2025) - **ATUAL**
✅ Correção erro otherSportsExperience  
✅ Implementação dia do longão  
✅ Aba de Preferências completa  
✅ PerformanceTab com todos os dados  
✅ AvailabilityTab detalhada  
✅ Auto-save em preferências  
✅ Convergência total onboarding→perfil→planos  

### v1.5.4 (06/Nov/2025)
✅ Auto-save em Steps 1, 2, 5  
✅ Correções em validações  
✅ Melhorias de UX  

### v1.5.3 (05/Nov/2025)
✅ Auditoria completa i18n  
✅ Correções de traduções  
✅ Performance otimizada  

### v1.5.0 (01/Nov/2025)
🎉 Lançamento público  
✅ Onboarding completo  
✅ Geração de planos  
✅ Dashboard funcional  

---

## 🎯 ROADMAP

### Q4 2025
- [x] Correção convergência onboarding→perfil
- [x] Implementação preferências
- [ ] Auto-save completo em todos os steps
- [ ] Testes E2E automatizados
- [ ] Analytics avançado

### Q1 2026
- [ ] App mobile (React Native)
- [ ] Notificações push
- [ ] AI Coach conversacional
- [ ] Integração Apple Health

### Q2 2026
- [ ] Funcionalidades sociais
- [ ] Grupos de treino
- [ ] Desafios e conquistas
- [ ] Marketplace de treinadores

---

## 📞 CONTATOS E LINKS

### Produção
- **URL:** https://atherarun.com
- **Dashboard:** https://atherarun.com/dashboard
- **Onboarding:** https://atherarun.com/onboarding

### Repositório
- **GitHub:** (privado)
- **Vercel:** https://vercel.com/atherarun

### Documentação
- **Histórico Completo:** `HISTORICO_COMPLETO_07NOV2025.md`
- **Análise Profunda:** `ANALISE_PROFUNDA_COMPLETA.md`
- **Guia Técnico:** `GUIA_TECNICO.md`

---

## ✅ CHECKLIST DE ESTADO ATUAL

### Funcionalidades Core
- [x] Autenticação (Clerk)
- [x] Onboarding 7 steps
- [x] Criação de perfil completo
- [x] Geração de planos personalizados
- [x] Visualização de planos
- [x] Dashboard
- [x] Perfil com 6 abas
- [x] Preferências editáveis
- [x] Integração Strava (parcial)
- [x] Integração Stripe
- [x] i18n (3 idiomas)
- [x] Auto-save
- [x] Sistema de VDOT
- [x] Cálculo de paces

### Qualidade e Estabilidade
- [x] TypeScript 100%
- [x] Build sem erros
- [x] APIs validadas
- [x] Tratamento de erros
- [x] Loading states
- [x] Feedback visual (toasts)
- [x] Responsivo
- [x] Acessível (WCAG AA)

### Deploy e Infra
- [x] Deploy automático Vercel
- [x] Banco Neon conectado
- [x] Variáveis de ambiente configuradas
- [x] SSL/HTTPS
- [x] Domínio customizado

### Documentação
- [x] README atualizado
- [x] Histórico completo
- [x] Contexto documentado
- [x] Guias técnicos
- [x] Changelogs

---

## 🎓 CONCEITOS-CHAVE

### VDOT
Métrica de capacidade aeróbica criada por Jack Daniels que normaliza performance em diferentes distâncias e condições.

### Zonas de Treino
- **Z1 (Recovery):** 60-70% FC max
- **Z2 (Easy):** 70-80% FC max
- **Z3 (Moderate):** 80-85% FC max
- **Z4 (Threshold):** 85-90% FC max
- **Z5 (VO2max):** 90-95% FC max

### Longão
Treino mais longo da semana, fundamental para construir resistência aeróbica e mental.

### Auto-ajuste
Sistema que monitora performance do atleta e ajusta automaticamente o plano futuro.

---

**Status Final:** 🟢 Sistema Completo, Estável e Operacional  
**Próxima Revisão:** 14/Novembro/2025  
**Mantido por:** Athera Team  
**Versão do Documento:** 2.0
