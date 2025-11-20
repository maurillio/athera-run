# 🎯 Plano de Implementação - Strava Enhanced Integration

**Data:** 20/11/2025  
**Versão:** v2.6.0  
**Status:** Planejamento

---

## 📋 ANÁLISE DA INTEGRAÇÃO ATUAL

### ✅ O QUE JÁ EXISTE (NÃO MEXER)

#### 1. **Autenticação OAuth Strava**
- ✅ `/app/api/strava/auth/route.ts` - Iniciar OAuth
- ✅ `/app/api/strava/callback/route.ts` - Callback OAuth
- ✅ Token refresh automático em `lib/strava.ts`
- ✅ Armazenamento seguro: `stravaAccessToken`, `stravaRefreshToken`, `stravaTokenExpiry`

#### 2. **Importação de Atividades**
- ✅ `/app/api/strava/import/route.ts` - Importar últimos 90 dias
- ✅ Mapeamento de tipos: Run, TrailRun, VirtualRun → running
- ✅ Cálculo automático de pace
- ✅ Vinculação automática a treinos planejados (AI!)
- ✅ Trigger de auto-ajuste após importação

#### 3. **Webhook (Tempo Real)**
- ✅ `/app/api/strava/webhook/route.ts` - Receber eventos
- ✅ `/app/api/strava/webhook/subscribe/route.ts` - Inscrição webhook
- ✅ Importação automática de novas atividades

#### 4. **Componentes UI**
- ✅ `components/strava-connect.tsx` - Botão conectar/desconectar
- ✅ Paywall premium integrado
- ✅ Status de importação
- ✅ Badge de conexão

#### 5. **Schema Banco de Dados**
```prisma
AthleteProfile {
  stravaConnected       Boolean
  stravaAthleteId       String?    @unique
  stravaAccessToken     String?
  stravaRefreshToken    String?
  stravaTokenExpiry     DateTime?
}

CompletedWorkout {
  source              String  // 'strava' ou 'manual'
  stravaActivityId    String?
}
```

---

## 🆕 NOVOS DADOS DISPONÍVEIS NA API STRAVA

### 📊 **Endpoint: GET /athlete** (Perfil do Atleta)

#### Dados Básicos
- `id` - ID único do atleta
- `firstname`, `lastname` - Nome completo
- `profile` - URL foto perfil
- `city`, `state`, `country` - Localização

#### Dados Físicos
- `weight` - Peso (kg) ⚠️ Pode substituir input manual
- `sex` - Gênero (M/F) ⚠️ Pode substituir input manual

#### Estatísticas Gerais
- `follower_count` - Seguidores
- `friend_count` - Amigos
- `athlete_type` - Tipo: runner, cyclist, triathlete
- `date_preference` - Formato data preferido
- `measurement_preference` - Sistema (feet/meters)

#### Equipamentos
- `shoes[]` - Array de tênis cadastrados
  - `id`, `name`, `distance` - Kilometragem do tênis

#### Zonas de Treino (⭐ IMPORTANTE)
- `heart_rate.zones[]` - Zonas de FC
  - Zone 1-5 com min/max
- `power_zones[]` - Zonas de potência (ciclismo)

### 📊 **Endpoint: GET /athlete/stats** (Estatísticas)

#### Totais Históricos
- `all_run_totals.count` - Total de corridas lifetime
- `all_run_totals.distance` - Distância total (m)
- `all_run_totals.moving_time` - Tempo total (s)
- `all_run_totals.elapsed_time` - Tempo decorrido
- `all_run_totals.elevation_gain` - Elevação total (m)

#### Últimos 4 Semanas
- `recent_run_totals.*` - Mesmos campos, últimas 4 semanas

#### Este Ano
- `ytd_run_totals.*` - Mesmos campos, year-to-date

#### Melhores Marcas (⭐⭐ MUITO IMPORTANTE)
```json
"biggest_ride_distance": 100000,
"biggest_climb_elevation_gain": 2000
```

### 📊 **Endpoint: GET /activities/:id** (Detalhes da Atividade)

#### Dados Avançados (além do que já importamos)
- `start_latlng[]` - Coordenadas início
- `end_latlng[]` - Coordenadas fim
- `map.summary_polyline` - Polyline do percurso (Google Maps)
- `splits_metric[]` - Splits por km ⚠️ **MUITO ÚTIL**
  - `distance`, `elapsed_time`, `elevation_difference`, `moving_time`, `split`, `average_speed`, `pace_zone`
- `splits_standard[]` - Splits por milha
- `laps[]` - Voltas/intervalos
  - Mesmos dados dos splits
- `segment_efforts[]` - Segmentos do Strava
  - `name`, `elapsed_time`, `moving_time`, `distance`
  - `achievements[]` - PRs, KOMs, etc
- `best_efforts[]` - ⭐⭐⭐ **MELHORES MARCAS**
  - `name` - "400m", "1/2 mile", "1k", "1 mile", "2 mile", "5k", "10k", "15k", "10 mile", "20k", "Half-Marathon", "Marathon"
  - `elapsed_time`, `moving_time`, `distance`
  - `pr_rank` - 1, 2, 3 se for PR
- `photos.primary` - Foto principal
- `gear_id` - ID do equipamento usado
- `device_name` - Relógio/dispositivo usado
- `embed_token` - Token para embed de atividade

#### Zonas de Frequência Cardíaca
- `average_heartrate` - FC média ✅ **JÁ IMPORTAMOS**
- `max_heartrate` - FC máxima ✅ **JÁ IMPORTAMOS**
- `has_heartrate` - Boolean se tem dados FC
- `heartrate_opt_out` - Se usuário optou por não mostrar
- `suffer_score` - Score de sofrimento (intensidade)

#### Dados de Treino
- `trainer` - Boolean se foi indoor
- `commute` - Boolean se foi deslocamento
- `perceived_exertion` - Esforço percebido (1-10) ⚠️ **ÚTIL PARA IA**
- `workout_type` - Tipo específico (race, long run, workout)
  - 0 = default, 1 = race, 2 = long run, 3 = workout

#### Dados Ambientais
- `average_temp` - Temperatura média (°C)
- `weather` - Condições climáticas (descritivo)
- `wind_speed` - Velocidade vento
- `wind_direction` - Direção vento

---

## 🎯 OPORTUNIDADES DE MELHORIA

### 1️⃣ **Enriquecer Perfil do Atleta** (ALTA PRIORIDADE)

#### A. Dados Físicos Auto-fill
**Objetivo:** Preencher automaticamente peso e gênero do Strava

**Implementação:**
- Durante callback OAuth, buscar `/athlete`
- Se `profile.weight` vazio → preencher com Strava
- Se `profile.gender` vazio → preencher com Strava
- **NÃO sobrescrever** se já preenchido manualmente

**Localização:**
```typescript
// app/api/strava/callback/route.ts
// Após salvar tokens, buscar dados do atleta
```

#### B. Importar Zonas de FC
**Objetivo:** Usar zonas de FC do Strava para personalizar treinos

**Schema:**
```prisma
// Adicionar ao AthleteProfile
stravaHeartRateZones  Json? // { z1: {min: 100, max: 120}, z2: {...} }
```

**Implementação:**
- Buscar zonas em `/athlete`
- Salvar em `stravaHeartRateZones`
- Usar na geração de planos (AI pode referenciar)

#### C. Importar Histórico de Tênis
**Objetivo:** Avisar atleta quando tênis atingir 600-800km

**Schema:**
```prisma
model Shoe {
  id              Int      @id @default(autoincrement())
  athleteId       Int
  stravaGearId    String?  @unique
  name            String
  brand           String?
  model           String?
  totalDistance   Float    @default(0)
  createdAt       DateTime @default(now())
  isPrimary       Boolean  @default(false)
  athlete         AthleteProfile @relation(fields: [athleteId], references: [id])
}
```

**Implementação:**
- Buscar `shoes` em `/athlete`
- Criar/atualizar tabela `Shoe`
- Adicionar alerta no dashboard quando > 600km

### 2️⃣ **Estatísticas e Progresso** (MÉDIA PRIORIDADE)

#### A. Dashboard de Estatísticas Lifetime
**Objetivo:** Mostrar total de corridas, km, elevação lifetime

**Componente:**
```tsx
// components/strava-lifetime-stats.tsx
<Card>
  <CardHeader>
    <CardTitle>Estatísticas Lifetime (Strava)</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-3 gap-4">
      <Stat label="Corridas" value={stats.all_run_totals.count} />
      <Stat label="Total KM" value={stats.all_run_totals.distance / 1000} />
      <Stat label="Elevação" value={stats.all_run_totals.elevation_gain} />
    </div>
  </CardContent>
</Card>
```

**API:**
```typescript
// app/api/strava/stats/route.ts
export async function GET(request: NextRequest) {
  // Buscar stats de /athlete/stats
  // Cachear por 24h
}
```

#### B. Comparativo Mensal/Anual
**Objetivo:** Mostrar evolução últimas 4 semanas vs YTD

**Gráfico:**
- Últimas 4 semanas vs média lifetime
- YTD vs ano anterior (se disponível)

### 3️⃣ **Melhores Marcas (PRs)** (⭐ ALTA PRIORIDADE)

#### A. Importar Best Efforts
**Objetivo:** Detectar automaticamente PRs em 5k, 10k, 21k, 42k

**Schema:**
```prisma
model PersonalRecord {
  id              Int       @id @default(autoincrement())
  athleteId       Int
  distance        String    // "5k", "10k", "21k", "42k"
  time            Int       // segundos
  pace            String    // "4:30/km"
  date            DateTime
  stravaActivityId String?
  source          String    // 'strava' ou 'manual'
  createdAt       DateTime  @default(now())
  athlete         AthleteProfile @relation(fields: [athleteId], references: [id])
  
  @@unique([athleteId, distance])
}
```

**Implementação:**
```typescript
// lib/strava-prs.ts
export async function importBestEfforts(activityId: string, athleteId: number) {
  const activity = await fetchStravaActivity(activityId);
  
  if (!activity.best_efforts) return;
  
  const prMap = {
    '5k': '5k',
    '10k': '10k',
    'Half-Marathon': '21k',
    'Marathon': '42k'
  };
  
  for (const effort of activity.best_efforts) {
    const distance = prMap[effort.name];
    if (!distance) continue;
    
    const existingPR = await prisma.personalRecord.findUnique({
      where: { athleteId_distance: { athleteId, distance } }
    });
    
    // Só atualizar se for melhor tempo
    if (!existingPR || effort.elapsed_time < existingPR.time) {
      await prisma.personalRecord.upsert({
        where: { athleteId_distance: { athleteId, distance } },
        create: {
          athleteId,
          distance,
          time: effort.elapsed_time,
          pace: calculatePace(effort.distance, effort.elapsed_time),
          date: activity.start_date,
          stravaActivityId: activityId,
          source: 'strava'
        },
        update: {
          time: effort.elapsed_time,
          pace: calculatePace(effort.distance, effort.elapsed_time),
          date: activity.start_date,
          stravaActivityId: activityId
        }
      });
      
      // 🎉 Notificar atleta de novo PR!
      await createPRNotification(athleteId, distance, effort.elapsed_time);
    }
  }
}
```

#### B. Dashboard de PRs
**Componente:**
```tsx
// components/personal-records-card.tsx
<Card>
  <CardHeader>
    <CardTitle>Melhores Marcas</CardTitle>
    <CardDescription>Seus recordes pessoais</CardDescription>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Distância</TableHead>
          <TableHead>Tempo</TableHead>
          <TableHead>Pace</TableHead>
          <TableHead>Data</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {prs.map(pr => (
          <TableRow key={pr.distance}>
            <TableCell>{pr.distance}</TableCell>
            <TableCell>{formatTime(pr.time)}</TableCell>
            <TableCell>{pr.pace}</TableCell>
            <TableCell>{formatDate(pr.date)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

#### C. Input Manual de PRs (FREE)
**Objetivo:** Usuários free podem inserir PRs manualmente

**Formulário:**
```tsx
// components/add-pr-form.tsx
<Dialog>
  <DialogTrigger>
    <Button variant="outline">Adicionar PR Manual</Button>
  </DialogTrigger>
  <DialogContent>
    <Form>
      <Select name="distance">
        <option>5k</option>
        <option>10k</option>
        <option>21k</option>
        <option>42k</option>
      </Select>
      <Input type="time" name="time" placeholder="HH:MM:SS" />
      <Input type="date" name="date" />
      <Button type="submit">Salvar</Button>
    </Form>
  </DialogContent>
</Dialog>
```

### 4️⃣ **Análise Avançada de Atividades** (MÉDIA PRIORIDADE)

#### A. Importar Splits
**Objetivo:** Analisar consistência de pace por km

**Schema:**
```prisma
model ActivitySplit {
  id              Int    @id @default(autoincrement())
  workoutId       Int
  splitNumber     Int    // 1, 2, 3...
  distance        Float  // km
  movingTime      Int    // segundos
  elevationDiff   Float  // metros
  pace            String // "5:00/km"
  workout         CompletedWorkout @relation(fields: [workoutId], references: [id])
}
```

**Análise AI:**
- Detectar negative splits (acelerar no final)
- Detectar inconsistência (muito rápido → muito lento)
- Sugerir ajustes de pace

#### B. Importar Perceived Exertion
**Objetivo:** Correlacionar esforço percebido com performance

**Schema:**
```prisma
// Adicionar ao CompletedWorkout
perceivedExertion  Int? // 1-10, do Strava
sufferScore        Int? // Score de sofrimento do Strava
```

**Uso na IA:**
```typescript
// lib/ai-analysis.ts
// Analisar: se perceivedExertion baixo mas pace rápido → ótima forma
// Se perceivedExertion alto mas pace lento → possível overtraining
```

#### C. Dados Ambientais
**Objetivo:** Considerar temperatura e clima na análise

**Schema:**
```prisma
// Adicionar ao CompletedWorkout
temperature    Float? // °C
weather        String? // "sunny", "rainy"
windSpeed      Float? // km/h
```

**Uso na IA:**
- Ajustar expectativas de pace em dias quentes
- Considerar clima no auto-ajuste

### 5️⃣ **Segmentos e KOMs** (BAIXA PRIORIDADE)

#### A. Importar Segment Efforts
**Objetivo:** Gamificação - mostrar segmentos favoritos

**Schema:**
```prisma
model SegmentEffort {
  id              Int      @id @default(autoincrement())
  athleteId       Int
  workoutId       Int
  segmentId       String   // ID do segmento Strava
  segmentName     String
  distance        Float
  movingTime      Int
  isKOM           Boolean  @default(false)
  isPR            Boolean  @default(false)
  rank            Int?     // Overall rank
  createdAt       DateTime @default(now())
  athlete         AthleteProfile @relation(fields: [athleteId], references: [id])
  workout         CompletedWorkout @relation(fields: [workoutId], references: [id])
}
```

**Dashboard:**
- Top 5 segmentos mais rápidos
- Badge se tiver KOM/QOM

---

## 📝 PLANO DE IMPLEMENTAÇÃO - CHECKPOINTS

### ✅ CHECKPOINT 1: Análise Completa (CONCLUÍDO)
- ✅ Analisar integração atual
- ✅ Mapear API Strava disponível
- ✅ Identificar oportunidades
- ✅ Criar plano de implementação

---

### 🔲 CHECKPOINT 2: Schema & Migrations (30min)

**Objetivos:**
1. Adicionar campos ao `AthleteProfile`
2. Criar tabela `PersonalRecord`
3. Criar tabela `Shoe`
4. Adicionar campos ao `CompletedWorkout`

**Arquivos:**
```prisma
// prisma/schema.prisma

model AthleteProfile {
  // ... campos existentes
  
  // NOVOS CAMPOS STRAVA
  stravaHeartRateZones  Json? // Zonas de FC do Strava
  stravaLifetimeStats   Json? // Stats lifetime cacheadas
  stravaLastStatsFetch  DateTime? // Última atualização stats
  
  // RELAÇÕES
  personalRecords       PersonalRecord[]
  shoes                 Shoe[]
}

model PersonalRecord {
  id                Int       @id @default(autoincrement())
  athleteId         Int
  distance          String    // "5k", "10k", "21k", "42k"
  time              Int       // segundos
  pace              String    // "4:30/km"
  date              DateTime
  stravaActivityId  String?
  source            String    // 'strava' ou 'manual'
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  athlete           AthleteProfile @relation(fields: [athleteId], references: [id], onDelete: Cascade)
  
  @@unique([athleteId, distance])
  @@index([athleteId])
  @@map("personal_records")
}

model Shoe {
  id              Int      @id @default(autoincrement())
  athleteId       Int
  stravaGearId    String?  @unique
  name            String
  brand           String?
  model           String?
  totalDistance   Float    @default(0) // km
  purchaseDate    DateTime?
  retireDate      DateTime?
  isRetired       Boolean  @default(false)
  isPrimary       Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  athlete         AthleteProfile @relation(fields: [athleteId], references: [id], onDelete: Cascade)
  
  @@index([athleteId])
  @@index([stravaGearId])
  @@map("shoes")
}

model CompletedWorkout {
  // ... campos existentes
  
  // NOVOS CAMPOS STRAVA
  perceivedExertion Int? // 1-10
  sufferScore       Int? // Score Strava
  temperature       Float? // °C
  weather           String?
  workoutType       Int? // 0=default, 1=race, 2=long run, 3=workout
  gearId            String? // ID tênis usado
}
```

**Migration:**
```bash
npx prisma migrate dev --name add_strava_enhanced_fields
```

---

### 🔲 CHECKPOINT 3: API - Importar Dados do Atleta (45min)

**Objetivo:** Enriquecer perfil durante OAuth callback

**Arquivos:**
```typescript
// lib/strava-enhanced.ts
export async function fetchAthleteData(accessToken: string) {
  const response = await fetch('https://www.strava.com/api/v3/athlete', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  if (!response.ok) throw new Error('Erro ao buscar dados do atleta');
  
  return response.json();
}

export async function fetchAthleteStats(accessToken: string, athleteId: string) {
  const response = await fetch(`https://www.strava.com/api/v3/athletes/${athleteId}/stats`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  if (!response.ok) throw new Error('Erro ao buscar estatísticas');
  
  return response.json();
}

export async function enrichProfileWithStravaData(
  profileId: number, 
  accessToken: string, 
  stravaAthleteId: string
) {
  try {
    // 1. Buscar dados básicos
    const athleteData = await fetchAthleteData(accessToken);
    
    // 2. Buscar estatísticas
    const stats = await fetchAthleteStats(accessToken, stravaAthleteId);
    
    // 3. Preparar dados para update
    const updateData: any = {
      stravaLastStatsFetch: new Date(),
      stravaLifetimeStats: {
        totalRuns: stats.all_run_totals.count,
        totalDistance: stats.all_run_totals.distance,
        totalElevation: stats.all_run_totals.elevation_gain,
        totalTime: stats.all_run_totals.moving_time
      }
    };
    
    // 4. Preencher peso/gênero se vazio
    const profile = await prisma.athleteProfile.findUnique({
      where: { id: profileId }
    });
    
    if (!profile.weight && athleteData.weight) {
      updateData.weight = athleteData.weight;
    }
    
    if (!profile.gender && athleteData.sex) {
      updateData.gender = athleteData.sex === 'M' ? 'male' : 'female';
    }
    
    // 5. Importar zonas de FC
    if (athleteData.heart_rate?.zones) {
      updateData.stravaHeartRateZones = athleteData.heart_rate.zones.reduce((acc, zone) => {
        acc[`z${zone.id}`] = { min: zone.min, max: zone.max };
        return acc;
      }, {});
    }
    
    // 6. Atualizar profile
    await prisma.athleteProfile.update({
      where: { id: profileId },
      data: updateData
    });
    
    // 7. Importar tênis
    if (athleteData.shoes && athleteData.shoes.length > 0) {
      await importShoes(profileId, athleteData.shoes);
    }
    
    console.log(`✅ Perfil enriquecido com dados do Strava`);
  } catch (error) {
    console.error('Erro ao enriquecer perfil:', error);
    // Não lançar erro para não quebrar o OAuth
  }
}

async function importShoes(profileId: number, stravaShoes: any[]) {
  for (const shoe of stravaShoes) {
    await prisma.shoe.upsert({
      where: { stravaGearId: shoe.id },
      create: {
        athleteId: profileId,
        stravaGearId: shoe.id,
        name: shoe.name,
        totalDistance: shoe.distance / 1000, // converter para km
        isPrimary: shoe.primary
      },
      update: {
        name: shoe.name,
        totalDistance: shoe.distance / 1000,
        isPrimary: shoe.primary
      }
    });
  }
}
```

**Modificar Callback:**
```typescript
// app/api/strava/callback/route.ts
import { enrichProfileWithStravaData } from '@/lib/strava-enhanced';

// Após salvar tokens...
await enrichProfileWithStravaData(
  profile.id, 
  data.access_token, 
  data.athlete.id
);
```

---

### 🔲 CHECKPOINT 4: API - Importar Best Efforts (45min)

**Objetivo:** Detectar e salvar PRs automaticamente

**Arquivos:**
```typescript
// lib/strava-prs.ts
export async function fetchActivityDetails(accessToken: string, activityId: string) {
  const response = await fetch(
    `https://www.strava.com/api/v3/activities/${activityId}`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );
  
  if (!response.ok) throw new Error('Erro ao buscar detalhes da atividade');
  
  return response.json();
}

export async function importBestEfforts(
  accessToken: string,
  activityId: string,
  athleteId: number
) {
  try {
    const activity = await fetchActivityDetails(accessToken, activityId);
    
    if (!activity.best_efforts || activity.best_efforts.length === 0) {
      return { imported: 0 };
    }
    
    const prMap: { [key: string]: string } = {
      '5k': '5k',
      '10k': '10k',
      'Half-Marathon': '21k',
      'Marathon': '42k'
    };
    
    let imported = 0;
    let newPRs = [];
    
    for (const effort of activity.best_efforts) {
      const distance = prMap[effort.name];
      if (!distance) continue;
      
      const existingPR = await prisma.personalRecord.findUnique({
        where: { 
          athleteId_distance: { athleteId, distance } 
        }
      });
      
      // Só criar/atualizar se for melhor tempo
      if (!existingPR || effort.elapsed_time < existingPR.time) {
        const pace = calculatePace(effort.distance, effort.elapsed_time);
        
        await prisma.personalRecord.upsert({
          where: { 
            athleteId_distance: { athleteId, distance } 
          },
          create: {
            athleteId,
            distance,
            time: effort.elapsed_time,
            pace,
            date: new Date(activity.start_date),
            stravaActivityId: activityId,
            source: 'strava'
          },
          update: {
            time: effort.elapsed_time,
            pace,
            date: new Date(activity.start_date),
            stravaActivityId: activityId
          }
        });
        
        imported++;
        
        if (!existingPR || effort.pr_rank === 1) {
          newPRs.push({ distance, time: effort.elapsed_time, pace });
        }
      }
    }
    
    // Notificar novos PRs
    if (newPRs.length > 0) {
      await createPRNotifications(athleteId, newPRs);
    }
    
    return { imported, newPRs };
  } catch (error) {
    console.error('Erro ao importar best efforts:', error);
    return { imported: 0 };
  }
}

async function createPRNotifications(athleteId: number, prs: any[]) {
  // TODO: Criar sistema de notificações in-app
  // Por enquanto, apenas log
  console.log(`🎉 Novos PRs detectados para atleta ${athleteId}:`, prs);
}
```

**Modificar Importação:**
```typescript
// lib/strava.ts - função importStravaActivity
export async function importStravaActivity(
  activity: any, 
  profileId: number,
  accessToken?: string
) {
  // ... código existente ...
  
  // NOVO: Importar best efforts se disponível
  if (accessToken) {
    await importBestEfforts(accessToken, activity.id.toString(), profileId);
  }
  
  return completedWorkout;
}
```

---

### 🔲 CHECKPOINT 5: API Endpoints PRs (30min)

**Arquivos:**
```typescript
// app/api/prs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        personalRecords: {
          orderBy: { distance: 'asc' }
        }
      }
    });
    
    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({
      prs: profile.personalRecords,
      hasStrava: profile.stravaConnected
    });
  } catch (error) {
    console.error('Erro ao buscar PRs:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    const { distance, time, date } = await request.json();
    
    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id }
    });
    
    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }
    
    // Calcular pace
    const distanceMap: { [key: string]: number } = {
      '5k': 5000,
      '10k': 10000,
      '21k': 21097,
      '42k': 42195
    };
    
    const distanceMeters = distanceMap[distance];
    const pace = calculatePace(distanceMeters, time);
    
    // Criar/atualizar PR
    const pr = await prisma.personalRecord.upsert({
      where: { 
        athleteId_distance: { 
          athleteId: profile.id, 
          distance 
        } 
      },
      create: {
        athleteId: profile.id,
        distance,
        time,
        pace,
        date: new Date(date),
        source: 'manual'
      },
      update: {
        time,
        pace,
        date: new Date(date)
      }
    });
    
    return NextResponse.json({ pr });
  } catch (error) {
    console.error('Erro ao salvar PR:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

function calculatePace(distanceMeters: number, timeSeconds: number): string {
  const distanceKm = distanceMeters / 1000;
  const timeMinutes = timeSeconds / 60;
  const paceMinutes = timeMinutes / distanceKm;
  
  const min = Math.floor(paceMinutes);
  const sec = Math.round((paceMinutes - min) * 60);
  
  return `${min}:${sec.toString().padStart(2, '0')}/km`;
}
```

---

### 🔲 CHECKPOINT 6: Componente PRs (45min)

**Arquivos:**
```typescript
// components/personal-records-card.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Plus, Clock, Calendar, TrendingUp } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/hooks';

interface PR {
  distance: string;
  time: number;
  pace: string;
  date: string;
  source: 'strava' | 'manual';
  stravaActivityId?: string;
}

interface PersonalRecordsCardProps {
  initialPRs?: PR[];
  hasStrava?: boolean;
}

export default function PersonalRecordsCard({ initialPRs = [], hasStrava = false }: PersonalRecordsCardProps) {
  const t = useTranslations('prs');
  const [prs, setPRs] = useState<PR[]>(initialPRs);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    distance: '5k',
    hours: '',
    minutes: '',
    seconds: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  useEffect(() => {
    loadPRs();
  }, []);
  
  const loadPRs = async () => {
    try {
      const response = await fetch('/api/prs');
      if (response.ok) {
        const data = await response.json();
        setPRs(data.prs);
      }
    } catch (error) {
      console.error('Erro ao carregar PRs:', error);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const totalSeconds = 
        (parseInt(formData.hours) || 0) * 3600 +
        (parseInt(formData.minutes) || 0) * 60 +
        (parseInt(formData.seconds) || 0);
      
      const response = await fetch('/api/prs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distance: formData.distance,
          time: totalSeconds,
          date: formData.date
        })
      });
      
      if (response.ok) {
        await loadPRs();
        setIsDialogOpen(false);
        setFormData({
          distance: '5k',
          hours: '',
          minutes: '',
          seconds: '',
          date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Erro ao salvar PR:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };
  
  return (
    <Card className="border-2 border-amber-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="h-6 w-6 text-amber-500" />
              Melhores Marcas
            </CardTitle>
            <CardDescription className="mt-1">
              Seus recordes pessoais
              {hasStrava && (
                <Badge variant="secondary" className="ml-2">
                  Auto-importado do Strava
                </Badge>
              )}
            </CardDescription>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar PR
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Recorde Pessoal</DialogTitle>
                <DialogDescription>
                  Registre seu melhor tempo para uma distância
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="distance">Distância</Label>
                  <Select
                    value={formData.distance}
                    onValueChange={(value) => setFormData({ ...formData, distance: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5k">5 km</SelectItem>
                      <SelectItem value="10k">10 km</SelectItem>
                      <SelectItem value="21k">21 km (Meia Maratona)</SelectItem>
                      <SelectItem value="42k">42 km (Maratona)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Tempo</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Input
                        type="number"
                        placeholder="HH"
                        min="0"
                        max="23"
                        value={formData.hours}
                        onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                      />
                      <span className="text-xs text-muted-foreground">Horas</span>
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="MM"
                        min="0"
                        max="59"
                        value={formData.minutes}
                        onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                        required
                      />
                      <span className="text-xs text-muted-foreground">Minutos</span>
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="SS"
                        min="0"
                        max="59"
                        value={formData.seconds}
                        onChange={(e) => setFormData({ ...formData, seconds: e.target.value })}
                        required
                      />
                      <span className="text-xs text-muted-foreground">Segundos</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar Recorde'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {prs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum recorde registrado ainda.</p>
            <p className="text-sm mt-1">
              {hasStrava 
                ? 'Complete corridas no Strava para importar automaticamente!'
                : 'Adicione seus melhores tempos manualmente.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Distância</TableHead>
                <TableHead>Tempo</TableHead>
                <TableHead>Pace</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Origem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prs.map((pr) => (
                <TableRow key={pr.distance}>
                  <TableCell className="font-medium">{pr.distance}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {formatTime(pr.time)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      {pr.pace}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {formatDate(pr.date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={pr.source === 'strava' ? 'default' : 'secondary'}>
                      {pr.source === 'strava' ? 'Strava' : 'Manual'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
```

---

### 🔲 CHECKPOINT 7: Estatísticas Lifetime (30min)

**Arquivos:**
```typescript
// components/strava-lifetime-stats.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, Mountain, Clock } from 'lucide-react';

interface LifetimeStats {
  totalRuns: number;
  totalDistance: number;
  totalElevation: number;
  totalTime: number;
}

export default function StravaLifetimeStats() {
  const [stats, setStats] = useState<LifetimeStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadStats();
  }, []);
  
  const loadStats = async () => {
    try {
      const response = await fetch('/api/strava/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading || !stats) return null;
  
  return (
    <Card className="border-2 border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-orange-500" />
          Estatísticas Lifetime (Strava)
        </CardTitle>
        <CardDescription>
          Seu histórico completo de corridas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Activity}
            label="Corridas"
            value={stats.totalRuns.toLocaleString()}
          />
          <StatCard
            icon={TrendingUp}
            label="Distância Total"
            value={`${(stats.totalDistance / 1000).toFixed(0)} km`}
          />
          <StatCard
            icon={Mountain}
            label="Elevação Total"
            value={`${(stats.totalElevation).toFixed(0)} m`}
          />
          <StatCard
            icon={Clock}
            label="Tempo Total"
            value={formatTime(stats.totalTime)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ icon: Icon, label, value }: any) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg">
      <Icon className="h-5 w-5 text-muted-foreground mb-2" />
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground text-center">{label}</div>
    </div>
  );
}

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  return `${hours}h`;
}
```

**API:**
```typescript
// app/api/strava/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { refreshStravaToken, fetchAthleteStats } from '@/lib/strava-enhanced';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id }
    });
    
    if (!profile || !profile.stravaConnected) {
      return NextResponse.json({ error: 'Strava não conectado' }, { status: 400 });
    }
    
    // Verificar se stats estão cacheadas (< 24h)
    const now = new Date();
    const cacheValid = profile.stravaLastStatsFetch && 
      (now.getTime() - profile.stravaLastStatsFetch.getTime()) < 24 * 60 * 60 * 1000;
    
    if (cacheValid && profile.stravaLifetimeStats) {
      return NextResponse.json({ stats: profile.stravaLifetimeStats });
    }
    
    // Buscar stats atualizadas
    const accessToken = await refreshStravaToken(profile.id);
    const stats = await fetchAthleteStats(accessToken, profile.stravaAthleteId!);
    
    const lifetimeStats = {
      totalRuns: stats.all_run_totals.count,
      totalDistance: stats.all_run_totals.distance,
      totalElevation: stats.all_run_totals.elevation_gain,
      totalTime: stats.all_run_totals.moving_time
    };
    
    // Atualizar cache
    await prisma.athleteProfile.update({
      where: { id: profile.id },
      data: {
        stravaLifetimeStats: lifetimeStats,
        stravaLastStatsFetch: now
      }
    });
    
    return NextResponse.json({ stats: lifetimeStats });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
```

---

### 🔲 CHECKPOINT 8: Integrar no Dashboard (15min)

**Arquivo:**
```typescript
// app/[locale]/dashboard/page.tsx
import PersonalRecordsCard from '@/components/personal-records-card';
import StravaLifetimeStats from '@/components/strava-lifetime-stats';

// ... resto do código ...

<div className="space-y-6">
  {/* Cards existentes */}
  
  {/* NOVO: Estatísticas Lifetime */}
  {profile.stravaConnected && (
    <StravaLifetimeStats />
  )}
  
  {/* NOVO: Melhores Marcas */}
  <PersonalRecordsCard 
    hasStrava={profile.stravaConnected}
  />
  
  {/* Resto dos cards */}
</div>
```

---

### 🔲 CHECKPOINT 9: Alertas de Tênis (30min)

**Componente:**
```typescript
// components/shoe-alert.tsx
'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function ShoeAlert() {
  const [shoes, setShoes] = useState<any[]>([]);
  
  useEffect(() => {
    loadShoes();
  }, []);
  
  const loadShoes = async () => {
    try {
      const response = await fetch('/api/shoes');
      if (response.ok) {
        const data = await response.json();
        setShoes(data.shoes);
      }
    } catch (error) {
      console.error('Erro ao carregar tênis:', error);
    }
  };
  
  const shoesNeedingReplacement = shoes.filter(shoe => 
    shoe.totalDistance >= 600 && !shoe.isRetired
  );
  
  if (shoesNeedingReplacement.length === 0) return null;
  
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Atenção: Tênis com alta quilometragem</AlertTitle>
      <AlertDescription>
        {shoesNeedingReplacement.map(shoe => (
          <div key={shoe.id}>
            <strong>{shoe.name}</strong> já tem {shoe.totalDistance.toFixed(0)} km.
            Considere substituí-lo para evitar lesões.
          </div>
        ))}
      </AlertDescription>
    </Alert>
  );
}
```

---

### 🔲 CHECKPOINT 10: Testes & Deploy (30min)

**Testes:**
1. ✅ Conectar Strava e verificar enriquecimento de perfil
2. ✅ Importar atividades e verificar detecção de PRs
3. ✅ Adicionar PR manual
4. ✅ Verificar estatísticas lifetime
5. ✅ Verificar alerta de tênis

**Build:**
```bash
npm run build
```

**Deploy:**
```bash
git add .
git commit -m "feat: Strava Enhanced Integration v2.6.0 - PRs, Stats, Shoes"
git push
```

---

## 📊 RESUMO DA IMPLEMENTAÇÃO

### ✅ Features Implementadas

#### 1. **Enriquecimento Automático de Perfil**
- ✅ Peso e gênero do Strava
- ✅ Zonas de frequência cardíaca
- ✅ Estatísticas lifetime cacheadas

#### 2. **Melhores Marcas (PRs)**
- ✅ Detecção automática: 5k, 10k, 21k, 42k
- ✅ Input manual para usuários free
- ✅ Dashboard com tabela de PRs
- ✅ Badge de origem (Strava/Manual)

#### 3. **Estatísticas Lifetime**
- ✅ Total de corridas
- ✅ Distância total
- ✅ Elevação total
- ✅ Tempo total
- ✅ Cache de 24h

#### 4. **Gestão de Tênis**
- ✅ Importação automática do Strava
- ✅ Tracking de quilometragem
- ✅ Alerta > 600km

### 🔄 Features PREMIUM vs FREE

| Feature | FREE | PREMIUM |
|---------|------|---------|
| Conectar Strava | ❌ | ✅ |
| Auto-importar atividades | ❌ | ✅ |
| Auto-importar PRs | ❌ | ✅ |
| Adicionar PRs manualmente | ✅ | ✅ |
| Ver PRs | ✅ | ✅ |
| Stats lifetime | ❌ | ✅ |
| Tracking de tênis | ❌ | ✅ |

### 📁 Arquivos Criados/Modificados

#### Novos Arquivos
1. `lib/strava-enhanced.ts` - Funções avançadas Strava
2. `lib/strava-prs.ts` - Gestão de PRs
3. `components/personal-records-card.tsx` - Dashboard PRs
4. `components/strava-lifetime-stats.tsx` - Stats lifetime
5. `components/shoe-alert.tsx` - Alerta tênis
6. `app/api/prs/route.ts` - API PRs
7. `app/api/strava/stats/route.ts` - API Stats
8. `app/api/shoes/route.ts` - API Tênis

#### Arquivos Modificados
1. `prisma/schema.prisma` - Novos models
2. `app/api/strava/callback/route.ts` - Enriquecimento
3. `lib/strava.ts` - Importar PRs
4. `app/[locale]/dashboard/page.tsx` - Novos componentes

### 🎯 Impacto

#### Para o Usuário
- ✅ Perfil mais completo automaticamente
- ✅ Melhores marcas visíveis e rastreadas
- ✅ Motivação com estatísticas lifetime
- ✅ Prevenção de lesões (alerta tênis)

#### Para a IA
- ✅ Mais dados para análise (zonas FC, PRs, stats)
- ✅ Melhor personalização de planos
- ✅ Detecção de overtraining (perceivedExertion)

#### Para o Negócio
- ✅ Maior valor percebido do plano premium
- ✅ Diferenciação vs concorrentes
- ✅ Lock-in (dados históricos valiosos)

---

## 🚀 PRÓXIMOS PASSOS (Futuro)

### Fase 2 (Baixa Prioridade)
- [ ] Importar splits detalhados
- [ ] Análise de consistência de pace
- [ ] Dados ambientais (temperatura, clima)
- [ ] Segmentos e KOMs
- [ ] Gráficos de evolução

---

**Status:** Pronto para iniciar Checkpoint 2
**Tempo estimado total:** ~5 horas
**Versão:** v2.6.0
