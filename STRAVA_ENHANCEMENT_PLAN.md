# 🎯 PLANO DE MELHORIAS STRAVA - ATHERA RUN

**Data:** 2025-11-20  
**Status:** Planejamento Completo - Aguardando Execução

---

## 📊 ANÁLISE DO SISTEMA ATUAL

### ✅ O QUE JÁ EXISTE E FUNCIONA

#### 1. **Schema do Banco (AthleteProfile)**
```prisma
stravaConnected       Boolean   @default(false)
stravaAthleteId       String?   @unique
stravaAccessToken     String?
stravaRefreshToken    String?
stravaTokenExpiry     DateTime?
```

#### 2. **APIs Strava Existentes**
- ✅ `/api/strava/auth` - Iniciar OAuth
- ✅ `/api/strava/callback` - Callback OAuth
- ✅ `/api/strava/disconnect` - Desconectar conta
- ✅ `/api/strava/import` - Importar atividades
- ✅ `/api/strava/sync-all` - Sincronizar todas atividades
- ✅ `/api/strava/webhook` - Webhook para updates automáticos
- ✅ `/api/strava/stats` - Estatísticas básicas
- ✅ `/api/strava/prs` - Personal Records (PRs)
- ✅ `/api/strava/gear` - Equipamentos
- ✅ `/api/strava/sync-stats` - Sincronizar estatísticas

#### 3. **Bibliotecas Helper**
- ✅ `lib/strava.ts` - Cliente Strava principal
- ✅ `lib/strava-stats.ts` - Processamento de estatísticas
- ✅ `lib/strava-prs.ts` - Cálculo de PRs
- ✅ `lib/strava-gear.ts` - Gestão de equipamentos

#### 4. **Funcionalidades Atuais**
- ✅ Autenticação OAuth com Strava
- ✅ Import manual de atividades (PREMIUM)
- ✅ Sincronização automática via webhook
- ✅ Cálculo de PRs (5K, 10K, Meia, Maratona)
- ✅ Tracking de equipamentos
- ✅ Estatísticas básicas (distância, corridas, elevação)

---

## 🎯 O QUE VAMOS ADICIONAR

### FASE 1: DADOS DO PERFIL ATLÉTICO (Database + Backend)
**Objetivo:** Importar dados completos do perfil Strava do atleta

#### 1.1 Novos Campos no Schema
```sql
-- Adicionar na tabela athlete_profiles
ALTER TABLE athlete_profiles ADD COLUMN strava_profile_data JSONB;
ALTER TABLE athlete_profiles ADD COLUMN strava_last_sync TIMESTAMP;
ALTER TABLE athlete_profiles ADD COLUMN strava_clubs JSONB;
```

#### 1.2 Estrutura do JSONB `strava_profile_data`
```typescript
{
  // Perfil Básico
  firstname: string;
  lastname: string;
  city: string;
  state: string;
  country: string;
  sex: string; // M/F
  
  // Dados Atléticos
  weight: number; // kg
  ftp: number; // Functional Threshold Power
  
  // Contadores
  follower_count: number;
  friend_count: number;
  athlete_type: string; // runner/cyclist/triathlete
  
  // Datas importantes
  created_at: string;
  updated_at: string;
}
```

#### 1.3 Nova API
- **POST** `/api/strava/sync-profile` - Sincronizar perfil completo

---

### FASE 2: ESTATÍSTICAS AVANÇADAS (Backend)
**Objetivo:** Importar estatísticas históricas completas

#### 2.1 Novos Campos no Schema
```sql
ALTER TABLE athlete_profiles ADD COLUMN strava_stats_all_time JSONB;
ALTER TABLE athlete_profiles ADD COLUMN strava_stats_recent JSONB;
ALTER TABLE athlete_profiles ADD COLUMN strava_stats_ytd JSONB;
```

#### 2.2 Estrutura das Estatísticas
```typescript
{
  all_time: {
    count: number;           // total de atividades
    distance: number;        // metros totais
    moving_time: number;     // segundos totais
    elapsed_time: number;
    elevation_gain: number;  // metros
    achievement_count: number;
  },
  recent_runs: { /* mesma estrutura, últimas 4 semanas */ },
  ytd: { /* mesma estrutura, ano atual */ }
}
```

#### 2.3 API Atualizada
- **PATCH** `/api/strava/sync-stats` - Incluir estatísticas avançadas

---

### FASE 3: PERSONAL RECORDS COMPLETOS (Backend + Database)
**Objetivo:** Importar TODOS os PRs disponíveis no Strava

#### 3.1 Nova Tabela para PRs
```sql
CREATE TABLE strava_personal_records (
  id SERIAL PRIMARY KEY,
  athlete_profile_id INTEGER REFERENCES athlete_profiles(id) ON DELETE CASCADE,
  distance_type VARCHAR(50) NOT NULL,
  time_seconds INTEGER NOT NULL,
  pace_per_km VARCHAR(20),
  activity_id BIGINT,
  activity_name VARCHAR(255),
  activity_date TIMESTAMP,
  activity_link VARCHAR(500),
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(athlete_profile_id, distance_type, is_current)
);

CREATE INDEX idx_strava_prs_athlete ON strava_personal_records(athlete_profile_id);
CREATE INDEX idx_strava_prs_current ON strava_personal_records(athlete_profile_id, is_current);
```

#### 3.2 Novas APIs
- **GET** `/api/strava/prs` - Buscar todos PRs (já existe, será melhorado)
- **POST** `/api/strava/prs/sync` - Sincronizar PRs do Strava

---

### FASE 4: ZONAS DE TREINO E PACES (Backend)
**Objetivo:** Calcular zonas baseadas em PRs reais do Strava

#### 4.1 Novos Campos
```sql
ALTER TABLE athlete_profiles ADD COLUMN training_zones JSONB;
ALTER TABLE athlete_profiles ADD COLUMN calculated_paces JSONB;
ALTER TABLE athlete_profiles ADD COLUMN zones_last_update TIMESTAMP;
```

#### 4.2 Estrutura das Zonas
```typescript
{
  zones: {
    easy: { min_pace: '6:00', max_pace: '6:30', hr_range: '60-70%' },
    aerobic: { min_pace: '5:30', max_pace: '6:00', hr_range: '70-80%' },
    threshold: { min_pace: '5:00', max_pace: '5:30', hr_range: '80-90%' },
    vo2max: { min_pace: '4:30', max_pace: '5:00', hr_range: '90-95%' },
    anaerobic: { min_pace: '4:00', max_pace: '4:30', hr_range: '95-100%' }
  },
  based_on_pr: '10k',
  vdot: 52.3,
  last_calculated: '2025-11-20T16:00:00Z'
}
```

---

### FASE 5: EQUIPAMENTOS (GEAR) COMPLETO (Backend + Frontend)
**Objetivo:** Sistema completo de tracking de equipamentos

#### 5.1 Nova Tabela para Equipamentos
```sql
CREATE TABLE strava_gear (
  id VARCHAR(50) PRIMARY KEY,
  athlete_profile_id INTEGER REFERENCES athlete_profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  brand_name VARCHAR(100),
  model_name VARCHAR(100),
  description TEXT,
  distance_meters BIGINT DEFAULT 0,
  primary_gear BOOLEAN DEFAULT false,
  gear_type VARCHAR(50),
  retired BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_strava_gear_athlete ON strava_gear(athlete_profile_id);
```

---

### FASE 6: CLUBES E COMUNIDADE (Backend)
**Objetivo:** Importar clubes que o atleta participa

---

### FASE 7: INTEGRAÇÃO COM IA (Backend)
**Objetivo:** Usar dados Strava na geração de planos

---

### FASE 8: DASHBOARD STRAVA (Frontend)
**Objetivo:** Interface completa com todos os dados

---

### FASE 9: AUTO-FILL PERFIL (Frontend)
**Objetivo:** Preencher perfil automaticamente

---

### FASE 10: SINCRONIZAÇÃO INTELIGENTE (Backend)
**Objetivo:** Manter dados sempre atualizados

---

## 📋 RESUMO DAS FASES

| Fase | Título | Tipo | Status |
|------|--------|------|--------|
| 1 | Dados do Perfil | DB + Backend | 🔴 Pendente |
| 2 | Estatísticas Avançadas | Backend | 🔴 Pendente |
| 3 | PRs Completos | DB + Backend | 🔴 Pendente |
| 4 | Zonas de Treino | Backend | 🔴 Pendente |
| 5 | Equipamentos | DB + Backend | 🔴 Pendente |
| 6 | Clubes | Backend | 🔴 Pendente |
| 7 | Integração IA | Backend | 🔴 Pendente |
| 8 | Dashboard Strava | Frontend | 🔴 Pendente |
| 9 | Auto-Fill Perfil | Frontend | 🔴 Pendente |
| 10 | Sync Inteligente | Backend | 🔴 Pendente |

---

## ⚠️ REGRAS IMPORTANTES

1. **NÃO sobrescrever funcionalidades existentes**
2. **Sempre adicionar, nunca remover**
3. **Testar cada fase antes de avançar**
4. **Verificar Premium antes de importar**
5. **Manter compatibilidade com usuários sem Strava**
6. **Permitir preenchimento manual de TUDO**
