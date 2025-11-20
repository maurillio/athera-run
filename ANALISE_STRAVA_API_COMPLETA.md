# Análise Completa: Strava API vs Athera Run - Oportunidades de Integração

**Data:** 20 de Novembro de 2025  
**Versão:** 1.0.0

## 📋 Sumário Executivo

Esta análise mapeia **todas** as capacidades da Strava API v3 relacionadas a dados atléticos e identifica oportunidades de integração com o Athera Run, sem repetir funcionalidades já implementadas.

---

## 🔍 O Que JÁ Temos Implementado

### Dados de Atividades (Já Funcional)
Atualmente importamos do Strava:
- ✅ Atividades de corrida (Run, TrailRun, VirtualRun)
- ✅ Distância, duração, pace
- ✅ Elevação total
- ✅ Frequência cardíaca média e máxima
- ✅ Calorias
- ✅ Data/hora da atividade
- ✅ Vinculação automática com treinos planejados

### Dados do Perfil (Já Armazenados)
No nosso banco já temos:
- ✅ Peso
- ✅ Altura
- ✅ Idade
- ✅ Gênero
- ✅ FC máxima
- ✅ FC repouso

---

## 🆕 OPORTUNIDADES: O Que o Strava Permite e NÃO Estamos Usando

### 1. **ZONAS DE TREINO (Heart Rate & Power Zones)**

**Endpoint:** `GET /athlete/zones`

**O que retorna:**
```json
{
  "heart_rate": {
    "custom_zones": true,
    "zones": [
      { "min": 0, "max": 142 },      // Zona 1
      { "min": 142, "max": 155 },    // Zona 2
      { "min": 155, "max": 168 },    // Zona 3
      { "min": 168, "max": 184 },    // Zona 4
      { "min": 184, "max": -1 }      // Zona 5
    ]
  },
  "power": {
    "zones": [
      { "min": 0, "max": 165 },      // Zona 1
      { "min": 166, "max": 220 },    // Zona 2
      { "min": 221, "max": 248 },    // Zona 3
      { "min": 249, "max": 303 },    // Zona 4
      { "min": 304, "max": 385 },    // Zona 5
      { "min": 386, "max": 440 },    // Zona 6
      { "min": 441, "max": -1 }      // Zona 7
    ]
  }
}
```

**OPORTUNIDADE:**
- Importar zonas de FC configuradas no Strava
- Usar para validar intensidade dos treinos
- Gerar alertas se atleta estiver treinando fora da zona recomendada
- Personalizar treinos baseado nas zonas reais do atleta
- **IMPORTANTE:** Zonas de power são especialmente úteis para ciclistas, mas podem indicar nível de condicionamento

**Implementação Sugerida:**
- Adicionar campos `heartRateZones` (Json) e `powerZones` (Json) em `AthleteProfile`
- Importar na conexão inicial do Strava
- Atualizar periodicamente (quando atleta modificar no Strava)
- Usar nos treinos de intervalo para definir intensidades corretas

---

### 2. **EQUIPAMENTOS (Gear) - TÊNIS E ACESSÓRIOS**

**Endpoint:** `GET /gear/{id}`

**O que retorna:**
```json
{
  "id": "g12345",
  "primary": true,
  "name": "Nike Pegasus 40",
  "distance": 423500.5,        // metros
  "brand_name": "Nike",
  "model_name": "Pegasus 40",
  "description": "Tênis principal",
  "resource_state": 3
}
```

**OPORTUNIDADE CRÍTICA:**
- **Tracking de quilometragem de tênis** - alertar quando atingir 600-800km
- Sugerir troca de tênis baseado no desgaste
- Histórico de equipamentos usados
- Correlacionar performance com equipamento (tênis novos = ritmos melhores?)
- Identificar qual tênis o atleta usa para longões, qual usa para treinos rápidos

**Implementação Sugerida:**
- Criar model `GearTracking`:
  ```prisma
  model GearTracking {
    id              Int      @id @default(autoincrement())
    athleteId       Int
    stravaGearId    String   @unique
    type            String   // "shoes", "bike", etc
    name            String
    brand           String?
    model           String?
    isPrimary       Boolean  @default(false)
    totalDistance   Float    // km
    lastSyncDate    DateTime @updatedAt
    addedDate       DateTime @default(now())
    
    athlete         AthleteProfile @relation(fields: [athleteId], references: [id])
  }
  ```
- Importar gear IDs das atividades
- Buscar detalhes de cada gear
- Alertar: "Seu Nike Pegasus já tem 650km, considere trocar em breve"

---

### 3. **ESTATÍSTICAS DO ATLETA (Athlete Stats)**

**Endpoint:** `GET /athletes/{id}/stats`

**O que retorna:**
```json
{
  "biggest_ride_distance": 123456.7,
  "biggest_climb_elevation_gain": 1234.5,
  "recent_ride_totals": {
    "count": 12,
    "distance": 345678.9,
    "moving_time": 123456,
    "elapsed_time": 134567,
    "elevation_gain": 4567.8
  },
  "all_ride_totals": { /* mesma estrutura */ },
  "recent_run_totals": {
    "count": 15,
    "distance": 123456.7,     // metros
    "moving_time": 45678,     // segundos
    "elapsed_time": 50000,
    "elevation_gain": 1234.5
  },
  "all_run_totals": { /* totals de sempre */ },
  "recent_swim_totals": { /* mesma estrutura */ },
  "all_swim_totals": { /* mesma estrutura */ },
  "ytd_ride_totals": { /* year to date */ },
  "ytd_run_totals": {
    "count": 45,
    "distance": 456789.0,
    "moving_time": 156789,
    "elevation_gain": 3456.7
  },
  "ytd_swim_totals": { /* mesma estrutura */ }
}
```

**OPORTUNIDADE MASSIVE:**
- **Dashboard de progressão histórica** - mostrar evolução desde que começou a usar Strava
- Comparar "recent" (últimas 4 semanas) vs "all time" vs "YTD" (ano atual)
- Maior corrida ever, maior elevação ever
- Médias de volume semanal/mensal
- Identificar se atleta está acima/abaixo do volume habitual

**Implementação Sugerida:**
- Criar model `StravaStats` (snapshot periódico):
  ```prisma
  model StravaStats {
    id                    Int      @id @default(autoincrement())
    athleteId             Int
    snapshotDate          DateTime @default(now())
    
    // Recent (últimas 4 semanas)
    recentRunCount        Int
    recentRunDistance     Float    // km
    recentRunTime         Int      // minutos
    recentRunElevation    Float
    
    // Year to Date
    ytdRunCount           Int
    ytdRunDistance        Float
    ytdRunTime            Int
    ytdRunElevation       Float
    
    // All Time
    allTimeRunCount       Int
    allTimeRunDistance    Float
    allTimeRunTime        Int
    allTimeRunElevation   Float
    
    biggestRunDistance    Float
    biggestClimbElevation Float
    
    athlete               AthleteProfile @relation(fields: [athleteId], references: [id])
    
    @@index([athleteId, snapshotDate])
  }
  ```
- Atualizar semanalmente
- Usar no onboarding: "Vejo que você já correu X km este ano!"
- Gerar insights: "Seu volume mensal caiu 30% comparado ao seu padrão"

---

### 4. **CLUBES (Athlete Clubs)**

**Endpoint:** `GET /athlete/clubs`

**O que retorna:**
```json
[
  {
    "id": 12345,
    "name": "Clube de Corrida SP",
    "profile_medium": "url",
    "profile": "url",
    "cover_photo": "url",
    "sport_type": "running",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brazil",
    "private": false,
    "member_count": 234,
    "url": "strava.com/clubs/clube-sp"
  }
]
```

**OPORTUNIDADE:**
- Perfil social do atleta
- Gamificação: "X atletas do seu clube também usam Athera Run"
- Criar comunidade dentro do Athera baseada nos clubes Strava
- Rankings entre membros do mesmo clube

**Implementação Sugerida:**
- Adicionar campo `stravaClubs` (Json) em `AthleteProfile`
- Importar na conexão
- Exibir na página de perfil
- Feature futura: "Atletas do seu clube que também treinam conosco"

---

### 5. **ROTAS (Athlete Routes)**

**Endpoint:** `GET /athletes/{id}/routes`

**O que retorna:**
```json
[
  {
    "id": 123456,
    "name": "Percurso Parque Ibirapuera",
    "description": "Volta completa no parque",
    "athlete_id": 12345,
    "distance": 6245.3,
    "elevation_gain": 34.5,
    "map": {
      "id": "abc123",
      "polyline": "encoded_polyline_string",
      "summary_polyline": "encoded"
    },
    "type": 1,              // 1=running, 2=cycling
    "sub_type": 1,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "estimated_moving_time": 2340,
    "starred": true
  }
]
```

**OPORTUNIDADE EXCELENTE:**
- **Sugerir rotas favoritas do atleta** para treinos específicos
- "Para seu longão de domingo, que tal usar seu percurso 'Volta Parque'?"
- Mostrar mapa das rotas na plataforma
- Identificar se atleta tem rotas planas (para treinos de ritmo) e rotas com elevação (para treinos de força)

**Implementação Sugerida:**
- Criar model `FavoriteRoute`:
  ```prisma
  model FavoriteRoute {
    id              Int      @id @default(autoincrement())
    athleteId       Int
    stravaRouteId   String   @unique
    name            String
    distance        Float    // km
    elevationGain   Float
    type            String   // "running", "cycling"
    isStarred       Boolean  @default(false)
    polyline        String?  // para exibir mapa
    
    athlete         AthleteProfile @relation(fields: [athleteId], references: [id])
  }
  ```
- Importar rotas na conexão
- Sugerir rotas nos treinos: "Rota ideal para este treino: Volta Parque (6.2km, plano)"

---

### 6. **KUDOS E COMENTÁRIOS (Social Features)**

**Disponível em atividades individuais**

**O que retorna (dentro de cada activity):**
```json
{
  "kudos_count": 23,
  "comment_count": 5,
  "athlete_count": 1,      // número de atletas na atividade (corrida em grupo)
  "pr_count": 2,           // Personal Records batidos
  "achievement_count": 3   // Achievements conquistados
}
```

**OPORTUNIDADE:**
- Gamificação: "Você recebeu 50 kudos esta semana!"
- Indicador de engajamento social
- Identificar corridas em grupo (athlete_count > 1)
- Celebrar PRs: "Você bateu 2 recordes pessoais ontem!"

**Implementação Sugerida:**
- Adicionar campos em `CompletedWorkout`:
  ```prisma
  kudosCount      Int? @default(0)
  commentCount    Int? @default(0)
  prCount         Int? @default(0)
  wasGroupRun     Boolean? @default(false)
  ```
- Atualizar via webhook do Strava (quando receber novo kudo)
- Dashboard: "Suas atividades mais populares"

---

### 7. **LAPS (Voltas/Intervalos)**

**Disponível via:** `GET /activities/{id}/laps`

**O que retorna:**
```json
[
  {
    "id": 123456789,
    "name": "Lap 1",
    "elapsed_time": 300,    // segundos
    "moving_time": 295,
    "distance": 1000,       // metros
    "start_index": 0,
    "end_index": 150,
    "average_speed": 3.39,  // m/s
    "max_speed": 4.2,
    "average_heartrate": 165,
    "max_heartrate": 178,
    "lap_index": 1,
    "split": 1
  }
]
```

**OPORTUNIDADE CRÍTICA PARA TREINOS DE INTERVALO:**
- Analisar cada repetição de treinos intervalados
- Verificar consistência entre tiros (variação de ritmo)
- Validar se atleta cumpriu as zonas prescritas
- Feedback inteligente: "Seu 3º tiro foi 15s mais lento que o 1º, talvez tenha começado muito forte"

**Implementação Sugerida:**
- Criar model `WorkoutLap`:
  ```prisma
  model WorkoutLap {
    id                  Int      @id @default(autoincrement())
    completedWorkoutId  Int
    lapNumber           Int
    distance            Float    // km
    duration            Int      // segundos
    pace                String?  // min/km
    avgHeartRate        Int?
    maxHeartRate        Int?
    
    workout             CompletedWorkout @relation(fields: [completedWorkoutId], references: [id])
    
    @@index([completedWorkoutId])
  }
  ```
- Importar laps para treinos intervalados
- Análise: "Seu CV% (coeficiente de variação) entre tiros foi de 3.2% - excelente consistência!"

---

### 8. **STREAMS (Dados Detalhados por Segundo)**

**Endpoint:** `GET /activities/{id}/streams?keys=time,latlng,distance,altitude,heartrate,cadence,watts,temp`

**O que retorna:**
```json
{
  "time": {
    "data": [0, 1, 2, 3, ...],        // segundos
    "series_type": "time"
  },
  "heartrate": {
    "data": [120, 125, 128, 132, ...], // BPM a cada segundo
    "series_type": "time"
  },
  "altitude": {
    "data": [100.5, 100.7, 101.2, ...] // metros
  },
  "distance": {
    "data": [0, 3.2, 6.5, 9.8, ...]    // metros acumulados
  },
  "latlng": {
    "data": [[-23.5, -46.6], [-23.501, -46.601], ...] // coordenadas
  },
  "cadence": {
    "data": [88, 90, 89, 91, ...]      // RPM (passos/min / 2)
  }
}
```

**OPORTUNIDADE MASSIVA (MAS CUIDADO - MUITO DADO):**
- **Gráficos de elevação** detalhados
- **Análise de ritmo por segmento** (1km splits automáticos)
- **Zona de FC ao longo do treino** (gráfico de barras colorido)
- **Cadência média** e zonas ideais
- Identificar "fade" (queda de ritmo) no final do treino
- Mapa interativo com cores por intensidade

**IMPORTANTE:** Streams geram MUITO dado. Usar apenas quando necessário (sob demanda).

**Implementação Sugerida:**
- NÃO armazenar em banco (muito pesado)
- Buscar sob demanda quando atleta/treinador abrir análise detalhada
- Cache temporário (Redis) por 24h
- Componente React: `<DetailedWorkoutAnalysis activityId={x} />`

---

### 9. **SEGMENTOS (Segments & Efforts)**

**Endpoint:** `GET /activities/{id}/segments`

**O que retorna:**
```json
[
  {
    "id": 123456,
    "name": "Subida da Av. Paulista",
    "activity_type": "Run",
    "distance": 823.5,
    "average_grade": 4.2,
    "maximum_grade": 8.5,
    "elevation_high": 850.3,
    "elevation_low": 815.7,
    "effort_count": 1234,           // quantas vezes foi feito
    "athlete_segment_stats": {
      "pr_elapsed_time": 245,       // PR do atleta neste segmento (segundos)
      "pr_date": "2024-06-15",
      "effort_count": 12            // quantas vezes o atleta fez
    }
  }
]
```

**OPORTUNIDADE INCRÍVEL:**
- Tracking de segmentos favoritos
- "Você bateu seu PR na Subida Paulista!"
- Dashboard de segmentos: mostrar evolução ao longo do tempo
- Comparar com outros atletas (leaderboards públicos do Strava)

**Implementação Sugerida:**
- Criar model `SegmentEffort`:
  ```prisma
  model SegmentEffort {
    id                  Int      @id @default(autoincrement())
    athleteId           Int
    stravaSegmentId     String
    segmentName         String
    completedWorkoutId  Int
    elapsedTime         Int      // segundos
    isPR                Boolean  @default(false)
    rank                Int?     // posição no leaderboard (se disponível)
    effortDate          DateTime
    
    athlete             AthleteProfile @relation(fields: [athleteId], references: [id])
    workout             CompletedWorkout @relation(fields: [completedWorkoutId], references: [id])
    
    @@index([athleteId, stravaSegmentId])
  }
  ```
- Importar segmentos das atividades
- Notificar PRs
- Feature premium: "Análise de Segmentos"

---

### 10. **FOTOS (Activity Photos)**

**Endpoint:** `GET /activities/{id}/photos`

**O que retorna:**
```json
[
  {
    "unique_id": "abc123",
    "urls": {
      "100": "url_thumbnail",
      "600": "url_medium"
    },
    "source": 1,              // 1=Strava, 2=Instagram
    "uploaded_at": "2024-01-15T10:30:00Z",
    "caption": "Vista incrível no km 5!",
    "location": [-23.5505, -46.6333]
  }
]
```

**OPORTUNIDADE:**
- Galeria de fotos dos treinos
- Compartilhamento social dentro da plataforma
- Perfil mais rico e engajador

**Implementação Sugerida:**
- Adicionar `photos` (Json) em `CompletedWorkout`
- Exibir thumbnails na timeline
- Feature premium: "Suas melhores fotos de treino"

---

### 11. **PESO CORPORAL (Body Weight)**

**Disponível via:** PUT/GET `/athlete` (campo `weight`)

**OPORTUNIDADE:**
- Sincronização automática de peso
- Gráfico de evolução de peso ao longo do treinamento
- Ajuste automático de paces baseado em mudanças de peso

**Implementação Sugerida:**
- Já temos `weight` no perfil
- Adicionar histórico:
  ```prisma
  model WeightHistory {
    id        Int      @id @default(autoincrement())
    athleteId Int
    weight    Float
    date      DateTime @default(now())
    source    String   // "manual", "strava"
    
    athlete   AthleteProfile @relation(fields: [athleteId], references: [id])
  }
  ```
- Sincronizar periodicamente
- Alertar mudanças bruscas (>3kg em 1 semana)

---

### 12. **BIKES (para triatletas/duatletas)**

Mesma estrutura de **Gear**, mas para bicicletas.

**OPORTUNIDADE:**
- Identificar se atleta é triatleta/duatleta
- Oferecer planos híbridos (corrida + ciclismo)
- Tracking de manutenção da bike

---

## 🎯 PRIORIZAÇÃO: O Que Implementar Primeiro

### 🔥 **PRIORIDADE MÁXIMA (Impacto Imediato)**

1. **Zonas de Treino (Heart Rate Zones)**
   - Impacto: Treinos personalizados precisos
   - Complexidade: Baixa
   - Tempo: 2-3 dias

2. **Tracking de Tênis (Gear)**
   - Impacto: Feature única, altíssimo valor
   - Complexidade: Média
   - Tempo: 3-4 dias

3. **Estatísticas Históricas (Athlete Stats)**
   - Impacto: Dashboard rico, insights profundos
   - Complexidade: Média
   - Tempo: 3-4 dias

### ⚡ **ALTA PRIORIDADE (Próximas Sprints)**

4. **Laps (Análise de Intervalos)**
   - Impacto: Validação automática de treinos
   - Complexidade: Média-Alta
   - Tempo: 4-5 dias

5. **Rotas Favoritas**
   - Impacto: Sugestões contextuais
   - Complexidade: Média
   - Tempo: 3-4 dias

6. **Segmentos e PRs**
   - Impacto: Gamificação, motivação
   - Complexidade: Alta
   - Tempo: 5-6 dias

### 📊 **MÉDIA PRIORIDADE (Features Premium)**

7. **Streams (Análise Detalhada)**
   - Impacto: Análise profissional
   - Complexidade: Alta
   - Tempo: 7-10 dias
   - Nota: Feature premium

8. **Kudos e Social**
   - Impacto: Engajamento
   - Complexidade: Baixa-Média
   - Tempo: 2-3 dias

9. **Clubes**
   - Impacto: Comunidade
   - Complexidade: Baixa
   - Tempo: 2 dias

### 🔮 **BAIXA PRIORIDADE (Futuro)**

10. **Fotos**
11. **Histórico de Peso**
12. **Bikes (se expandir para triathlon)**

---

## 📈 RESUMO DE IMPACTO vs ESFORÇO

```
                        ALTO IMPACTO
                             |
      Zonas FC                |         Laps
      Gear/Tênis             |         Streams (Premium)
      Stats                   |         Segmentos
    -------------------------|-------------------------
                             |    Rotas
      Kudos                  |    Clubes
      Fotos                  |
                             |
                        BAIXO IMPACTO
```

---

## 🛠️ MUDANÇAS NECESSÁRIAS NO SCHEMA

### Novos Models:

```prisma
// 1. Zonas de Treino
// Adicionar em AthleteProfile:
heartRateZones    Json?  // { zones: [{min: 0, max: 142}, ...] }
powerZones        Json?  // { zones: [{min: 0, max: 165}, ...] }

// 2. Equipamentos
model GearTracking {
  id              Int      @id @default(autoincrement())
  athleteId       Int
  stravaGearId    String   @unique
  type            String
  name            String
  brand           String?
  model           String?
  isPrimary       Boolean  @default(false)
  totalDistance   Float
  lastSyncDate    DateTime @updatedAt
  addedDate       DateTime @default(now())
  
  athlete         AthleteProfile @relation(fields: [athleteId], references: [id])
  
  @@map("gear_tracking")
}

// 3. Estatísticas Históricas
model StravaStats {
  id                    Int      @id @default(autoincrement())
  athleteId             Int
  snapshotDate          DateTime @default(now())
  
  recentRunCount        Int
  recentRunDistance     Float
  recentRunTime         Int
  recentRunElevation    Float
  
  ytdRunCount           Int
  ytdRunDistance        Float
  ytdRunTime            Int
  ytdRunElevation       Float
  
  allTimeRunCount       Int
  allTimeRunDistance    Float
  allTimeRunTime        Int
  allTimeRunElevation   Float
  
  biggestRunDistance    Float
  biggestClimbElevation Float
  
  athlete               AthleteProfile @relation(fields: [athleteId], references: [id])
  
  @@index([athleteId, snapshotDate])
  @@map("strava_stats")
}

// 4. Laps/Voltas
model WorkoutLap {
  id                  Int      @id @default(autoincrement())
  completedWorkoutId  Int
  lapNumber           Int
  distance            Float
  duration            Int
  pace                String?
  avgHeartRate        Int?
  maxHeartRate        Int?
  
  workout             CompletedWorkout @relation(fields: [completedWorkoutId], references: [id])
  
  @@index([completedWorkoutId])
  @@map("workout_laps")
}

// 5. Rotas Favoritas
model FavoriteRoute {
  id              Int      @id @default(autoincrement())
  athleteId       Int
  stravaRouteId   String   @unique
  name            String
  distance        Float
  elevationGain   Float
  type            String
  isStarred       Boolean  @default(false)
  polyline        String?
  
  athlete         AthleteProfile @relation(fields: [athleteId], references: [id])
  
  @@map("favorite_routes")
}

// 6. Segmentos
model SegmentEffort {
  id                  Int      @id @default(autoincrement())
  athleteId           Int
  stravaSegmentId     String
  segmentName         String
  completedWorkoutId  Int
  elapsedTime         Int
  isPR                Boolean  @default(false)
  rank                Int?
  effortDate          DateTime
  
  athlete             AthleteProfile @relation(fields: [athleteId], references: [id])
  workout             CompletedWorkout @relation(fields: [completedWorkoutId], references: [id])
  
  @@index([athleteId, stravaSegmentId])
  @@map("segment_efforts")
}

// 7. Histórico de Peso
model WeightHistory {
  id        Int      @id @default(autoincrement())
  athleteId Int
  weight    Float
  date      DateTime @default(now())
  source    String
  
  athlete   AthleteProfile @relation(fields: [athleteId], references: [id])
  
  @@index([athleteId, date])
  @@map("weight_history")
}
```

### Campos Adicionais em Models Existentes:

```prisma
// AthleteProfile
model AthleteProfile {
  // ... campos existentes ...
  
  // Novos campos
  heartRateZones    Json?
  powerZones        Json?
  stravaClubs       Json?
  ftpPower          Int?    // Functional Threshold Power (watts)
  
  // Novas relações
  gearTracking      GearTracking[]
  stravaStats       StravaStats[]
  favoriteRoutes    FavoriteRoute[]
  segmentEfforts    SegmentEffort[]
  weightHistory     WeightHistory[]
}

// CompletedWorkout
model CompletedWorkout {
  // ... campos existentes ...
  
  // Novos campos
  kudosCount      Int?     @default(0)
  commentCount    Int?     @default(0)
  prCount         Int?     @default(0)
  achievementCount Int?    @default(0)
  wasGroupRun     Boolean? @default(false)
  photos          Json?
  stravaGearId    String?  // ID do equipamento usado
  
  // Novas relações
  laps            WorkoutLap[]
  segmentEfforts  SegmentEffort[]
}
```

---

## 🚀 PLANO DE IMPLEMENTAÇÃO FASE 1 (Sprint de 2 Semanas)

### Semana 1: Zonas + Gear

**Dia 1-2: Schema & Migration**
- Criar migration com novos models
- Atualizar Prisma client
- Testes de conexão

**Dia 3-4: Zonas de Treino**
- Endpoint para buscar zonas do Strava
- Armazenar em `AthleteProfile`
- Exibir na página de perfil
- Usar na geração de treinos

**Dia 5-7: Gear Tracking**
- Endpoint para buscar gear do atleta
- Model `GearTracking`
- Dashboard de tênis: km rodados, alertas
- Vincular atividades ao gear usado

### Semana 2: Stats + Rotas

**Dia 8-10: Estatísticas Históricas**
- Endpoint `/athletes/{id}/stats`
- Model `StravaStats` com snapshots
- Dashboard: "Seu Ano em Números"
- Comparativos: recent vs YTD vs all-time

**Dia 11-14: Rotas Favoritas**
- Endpoint `/athletes/{id}/routes`
- Model `FavoriteRoute`
- Sugestões contextuais nos treinos
- Exibir mapas (integração Mapbox/Leaflet)

---

## 💡 INSIGHTS FINAIS

### O Que NÃO Vale a Pena (Por Enquanto):
- ❌ **Streams detalhados** - muito pesado, usar sob demanda apenas
- ❌ **Fotos** - não agrega valor direto ao treino
- ❌ **Clubes** - baixo engajamento esperado inicialmente

### O Que É GAME CHANGER:
- ✅ **Tracking de Tênis** - ninguém faz isso bem
- ✅ **Zonas Personalizadas** - treinos realmente individualizados
- ✅ **Análise de Intervalos (Laps)** - validação automática de qualidade
- ✅ **Stats Históricas** - contexto profundo do atleta

### Features Premium Potenciais:
- 🔒 Análise detalhada de streams (gráficos avançados)
- 🔒 Segmentos e leaderboards
- 🔒 Comparação com outros atletas similares
- 🔒 Exportação de dados históricos

---

## 📞 PRÓXIMOS PASSOS

1. **Validar priorização** com time/stakeholders
2. **Definir MVP da Fase 1** (zonas + gear + stats?)
3. **Estimar esforço técnico** detalhado
4. **Criar protótipos de UI** para novas features
5. **Documentar fluxos de sincronização** (tempo real vs batch)

---

**Questões em Aberto:**
- Qual frequência de sincronização? (tempo real via webhook, hourly, daily?)
- Armazenar dados históricos ou sempre buscar do Strava?
- Como lidar com rate limits da API? (200 requests/15min, 2000/day)
- Features premium vs free?

---

*Documento gerado por análise técnica da Strava API v3*
*Referências: https://developers.strava.com/docs/reference/*
