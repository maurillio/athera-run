# 🏃‍♂️ PLANO DE INTEGRAÇÃO STRAVA PREMIUM - ATHERA RUN

## 📋 VISÃO GERAL

Integração completa Strava como **recurso premium**, com fallback manual para usuários free.

---

## 🎯 ESTRATÉGIA DE DADOS

### **DADOS QUE CASAM COM ATHERA RUN**

#### 1️⃣ **PERFIL ATLÉTICO** (Já existe no Athera)
- ✅ **Peso** → `profile.weight`
- ✅ **FTP** → `profile.ftp` 
- ✅ **Zonas de FC** → Calcular a partir de `stats.all_run_totals.max_heartrate`
- ✅ **Ritmo Preferido** → Calcular média de `activities.average_speed`

**Implementação:**
```typescript
// Premium: Importar do Strava
// Free: Input manual
interface AthleteProfile {
  weight: number // kg
  ftp?: number // watts
  maxHeartRate?: number // bpm
  restingHeartRate?: number // bpm
  preferredPace?: string // min/km
  stravaSync: boolean // Premium feature
}
```

#### 2️⃣ **RECORDES PESSOAIS** (NOVO - Altamente Relevante!)
Strava fornece PRs, podemos criar seção "Melhores Marcas":

**Dados do Strava:**
- 400m, 1/2 mile, 1k, 1 mile, 2 mile, 5k, 10k, 15k, 10 mile, 20k, Half Marathon, Marathon
- Longest Run, Biggest Climb

**Estrutura Athera Run:**
```typescript
interface PersonalRecords {
  userId: string
  // Distâncias
  record_400m?: { time: number, date: Date, activityId?: string }
  record_1km?: { time: number, date: Date, activityId?: string }
  record_5km?: { time: number, date: Date, activityId?: string }
  record_10km?: { time: number, date: Date, activityId?: string }
  record_21km?: { time: number, date: Date, activityId?: string }
  record_42km?: { time: number, date: Date, activityId?: string }
  
  // Outras métricas
  longestRun?: { distance: number, date: Date, activityId?: string }
  biggestClimb?: { elevation: number, date: Date, activityId?: string }
  
  // Meta
  source: 'strava' | 'manual' // Premium vs Free
  lastSync?: Date
}
```

#### 3️⃣ **ESTATÍSTICAS TOTAIS** (Dashboard Enhancement)
Mostrar totalizadores no dashboard:

**Dados do Strava:**
- `stats.recent_run_totals` (últimas 4 semanas)
- `stats.ytd_run_totals` (ano atual)
- `stats.all_run_totals` (todos os tempos)

**Para cada período:**
- Total de corridas
- Distância total
- Tempo total
- Elevação total

**Dashboard Athera:**
```typescript
interface AthletStats {
  userId: string
  
  // Últimas 4 semanas
  recent: {
    runs: number
    distance: number // km
    duration: number // seconds
    elevation: number // meters
  }
  
  // Ano atual
  yearToDate: {
    runs: number
    distance: number
    duration: number
    elevation: number
  }
  
  // Histórico total
  allTime: {
    runs: number
    distance: number
    duration: number
    elevation: number
    longestRun: number
    biggestClimb: number
  }
  
  source: 'strava' | 'calculated' // Premium vs Free
  lastSync?: Date
}
```

#### 4️⃣ **EQUIPAMENTOS** (Gestão de Tênis)
Strava rastreia equipamentos (tênis) e km rodados!

**Dados do Strava:**
- `gear.name` (ex: "Nike Pegasus 40")
- `gear.distance` (km totais)
- `gear.brand_name`
- `gear.model_name`
- `gear.description`

**Athera Run - Gestão de Tênis:**
```typescript
interface RunningShoe {
  id: string
  userId: string
  
  // Dados básicos
  brand: string // Nike, Adidas, etc
  model: string // Pegasus 40, Ultraboost, etc
  nickname?: string // "Meu tênis de treino"
  
  // Rastreamento
  totalKm: number
  purchaseDate?: Date
  retireDate?: Date
  
  // Manutenção
  targetKm: number // Alerta quando atingir (ex: 800km)
  status: 'active' | 'warning' | 'retired'
  
  // Integração
  stravaGearId?: string // Premium
  source: 'strava' | 'manual'
  lastSync?: Date
}
```

**Recursos:**
- 📊 Dashboard mostrando km de cada tênis
- ⚠️ Alertas quando atingir km recomendado
- 📈 Histórico de tênis aposentados
- 🔄 Sync automático com Strava (Premium)

#### 5️⃣ **ZONAS DE TREINO** (Cálculo Inteligente)
Com HR máximo do Strava, calcular zonas automaticamente:

```typescript
interface TrainingZones {
  userId: string
  
  // Heart Rate Zones
  maxHR: number
  restingHR?: number
  zones: {
    z1: { min: number, max: number, name: 'Recuperação' }
    z2: { min: number, max: number, name: 'Aeróbico' }
    z3: { min: number, max: number, name: 'Limiar' }
    z4: { min: number, max: number, name: 'VO2 Max' }
    z5: { min: number, max: number, name: 'Anaeróbico' }
  }
  
  // Pace Zones (baseado em recordes)
  paceZones?: {
    easy: string // min/km
    tempo: string
    threshold: string
    interval: string
    repetition: string
  }
  
  source: 'strava' | 'manual'
  lastCalculated: Date
}
```

---

## 🔒 MODELO PREMIUM vs FREE

### **USUÁRIO FREE (Básico)**
- ✅ Preencher peso/FTP manualmente
- ✅ Adicionar recordes pessoais manualmente
- ✅ Cadastrar tênis manualmente
- ✅ Ver estatísticas do Athera Run (baseado no plano)
- ❌ Importação automática do Strava
- ❌ Sincronização contínua
- ❌ Link para atividades no Strava

### **USUÁRIO PREMIUM (Strava Conectado)**
- ✅ Tudo do Free +
- ✅ **Importação automática** de peso/FTP
- ✅ **Sync de recordes** pessoais com link para Strava
- ✅ **Gestão automática** de tênis
- ✅ **Estatísticas em tempo real** do Strava
- ✅ **Cálculo automático** de zonas de treino
- ✅ **Webhook updates** (dados atualizados em tempo real)

---

## 🗂️ SCHEMA DATABASE

```typescript
// prisma/schema.prisma

// RECORDES PESSOAIS
model PersonalRecord {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  
  // Distâncias padrão
  record_400m    Json? // { time: number, date: Date, activityId?: string }
  record_1km     Json?
  record_5km     Json?
  record_10km    Json?
  record_21km    Json?
  record_42km    Json?
  
  // Outras métricas
  longestRun     Json?
  biggestClimb   Json?
  
  // Meta
  source         String  @default("manual") // strava | manual
  lastSync       DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@unique([userId])
}

// ESTATÍSTICAS DO ATLETA
model AthleteStats {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  
  // Stats recentes (4 semanas)
  recentRuns      Int     @default(0)
  recentDistance  Float   @default(0)
  recentDuration  Int     @default(0)
  recentElevation Float   @default(0)
  
  // Stats ano atual
  ytdRuns         Int     @default(0)
  ytdDistance     Float   @default(0)
  ytdDuration     Int     @default(0)
  ytdElevation    Float   @default(0)
  
  // Stats total
  allTimeRuns     Int     @default(0)
  allTimeDistance Float   @default(0)
  allTimeDuration Int     @default(0)
  allTimeElevation Float  @default(0)
  
  // Meta
  source          String  @default("calculated") // strava | calculated
  lastSync        DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([userId])
}

// GESTÃO DE TÊNIS
model RunningShoe {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  // Dados
  brand       String
  model       String
  nickname    String?
  totalKm     Float    @default(0)
  targetKm    Float    @default(800)
  
  // Datas
  purchaseDate DateTime?
  retireDate   DateTime?
  
  // Status
  status      String   @default("active") // active | warning | retired
  
  // Strava
  stravaGearId String?
  source       String   @default("manual") // strava | manual
  lastSync     DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
}

// ZONAS DE TREINO
model TrainingZones {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  
  // Heart Rate
  maxHR     Int
  restingHR Int?
  
  // Zonas (JSON com min/max/name)
  heartRateZones Json
  paceZones      Json?
  
  // Meta
  source         String   @default("manual") // strava | manual
  lastCalculated DateTime @default(now())
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@unique([userId])
}
```

---

## 📱 UI/UX - ONDE MOSTRAR

### **1. DASHBOARD** (Página Principal)
```
┌─────────────────────────────────────────┐
│ 📊 SUAS ESTATÍSTICAS                    │
├─────────────────────────────────────────┤
│ Últimas 4 Semanas:                      │
│ 🏃 12 corridas · 85 km · 7h 30min       │
│                                         │
│ Este Ano:                               │
│ 🏃 145 corridas · 1.240 km · 98h 15min  │
│                                         │
│ [🔄 Sincronizado com Strava]  [Premium] │
└─────────────────────────────────────────┘
```

### **2. PERFIL** (Nova Aba: "Melhores Marcas")
```
┌─────────────────────────────────────────┐
│ 🏆 RECORDES PESSOAIS                    │
├─────────────────────────────────────────┤
│ 5K    → 22:45  (10/05/2024) [Ver no Strava]
│ 10K   → 48:32  (15/08/2024) [Ver no Strava]
│ 21K   → 1:45:20 (02/09/2024) [Ver no Strava]
│ 42K   → 3:35:15 (20/10/2024) [Ver no Strava]
│                                         │
│ Maior Distância: 45 km (Trail)          │
│ Maior Elevação: 1.200m (Montanha)       │
│                                         │
│ [🔄 Sincronizado com Strava]            │
│ [✏️ Editar Manualmente]                  │
└─────────────────────────────────────────┘
```

### **3. EQUIPAMENTOS** (Nova Seção)
```
┌─────────────────────────────────────────┐
│ 👟 MEUS TÊNIS                           │
├─────────────────────────────────────────┤
│ Nike Pegasus 40                         │
│ ████████░░ 625 / 800 km                │
│ Status: ✅ Ativo                         │
│                                         │
│ Adidas Ultraboost 22                    │
│ ██████████ 820 / 800 km                │
│ Status: ⚠️ Trocar em breve              │
│                                         │
│ [+ Adicionar Tênis]                     │
│ [🔄 Sincronizar com Strava] [Premium]   │
└─────────────────────────────────────────┘
```

### **4. ZONAS DE TREINO** (Perfil → Zonas)
```
┌─────────────────────────────────────────┐
│ 💓 ZONAS DE FREQUÊNCIA CARDÍACA         │
├─────────────────────────────────────────┤
│ FC Máxima: 190 bpm  [Importado Strava]  │
│ FC Repouso: 52 bpm                      │
│                                         │
│ Z1 Recuperação    95-114 bpm            │
│ Z2 Aeróbico      114-133 bpm            │
│ Z3 Limiar        133-152 bpm            │
│ Z4 VO2 Max       152-171 bpm            │
│ Z5 Anaeróbico    171-190 bpm            │
│                                         │
│ [Recalcular] [Editar Manualmente]       │
└─────────────────────────────────────────┘
```

---

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### **FASE 1: DATABASE & SCHEMA** ✅
1. Criar migrations para novas tabelas
2. Adicionar relations no Prisma
3. Criar seeds para testes

### **FASE 2: API STRAVA** 🔄
1. Expandir `/api/strava/sync` para importar:
   - Stats (totais)
   - PRs (recordes)
   - Gear (equipamentos)
   - Athlete max HR
2. Criar webhook para updates em tempo real
3. Criar jobs de sync periódico

### **FASE 3: BACKEND SERVICES** 📦
1. `PersonalRecordsService` - Gerenciar recordes
2. `AthleteStatsService` - Calcular/sincronizar stats
3. `RunningShoeService` - Gestão de tênis
4. `TrainingZonesService` - Calcular zonas

### **FASE 4: FRONTEND COMPONENTS** 🎨
1. `PersonalRecordsCard` (Dashboard)
2. `StatsOverview` (Dashboard)
3. `ShoesManager` (Nova página)
4. `TrainingZonesDisplay` (Perfil)
5. `StravaImportButton` (Premium)

### **FASE 5: PAYWALL PREMIUM** 💎
1. Gate de Strava sync em subscription check
2. Modals explicando benefícios Premium
3. Fallback manual para Free users

---

## 📊 PRIORIDADES

### **ALTA PRIORIDADE** (Implementar Agora)
1. ✅ **Estatísticas Totais** → Dashboard mais rico
2. ✅ **Recordes Pessoais** → Engajamento e metas
3. ✅ **Gestão de Tênis** → Feature única e útil

### **MÉDIA PRIORIDADE** (Próxima Sprint)
4. ✅ **Zonas de Treino** → Treinos mais precisos
5. ✅ **Webhook Strava** → Dados em tempo real

### **BAIXA PRIORIDADE** (Futuro)
6. Análise de tendências (melhorando/piorando)
7. Comparação com outros atletas
8. Badges e conquistas

---

## 🎯 BENEFÍCIOS PARA ATHERA RUN

### **Para Usuários Free:**
- ✅ Podem usar tudo manualmente
- ✅ Veem valor do Premium
- ✅ Experiência completa (com mais trabalho)

### **Para Usuários Premium:**
- ✅ Automação total via Strava
- ✅ Dados sempre atualizados
- ✅ Menos trabalho manual
- ✅ Links para atividades originais
- ✅ Gestão automática de equipamentos

### **Para Athera Run:**
- ✅ Diferencial competitivo forte
- ✅ Justifica assinatura Premium
- ✅ Retenção de usuários
- ✅ Dados mais ricos para IA
- ✅ Features únicas (gestão de tênis)

---

## 🚀 PRÓXIMO PASSO

Qual fase você quer que eu comece a implementar?

1. **DATABASE** → Criar schema e migrations
2. **API** → Expandir integração Strava
3. **FRONTEND** → Criar componentes visuais
4. **TUDO** → Implementação completa end-to-end

**Aguardo sua decisão para começar! 🏃‍♂️**
