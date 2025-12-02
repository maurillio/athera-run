# 🚀 ATHERA FLEX - Sistema Completo de Flexibilidade Inteligente

**Versão:** 3.3.0  
**Data:** 02/DEZ/2025  
**Status:** ✅ IMPLEMENTADO E TESTADO  
**Tipo:** Premium Feature  

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Features Implementadas](#features-implementadas)
4. [Machine Learning](#machine-learning)
5. [APIs](#apis)
6. [Jobs e Automações](#jobs-e-automações)
7. [Banco de Dados](#banco-de-dados)
8. [Como Usar](#como-usar)
9. [Roadmap Futuro](#roadmap-futuro)

---

## 🎯 Visão Geral

O **Athera Flex** resolve o problema clássico de todo corredor:

> **"Eu tinha um treino marcado para domingo, mas fiz no sábado com volume diferente. Como o sistema sabe que aquele treino do sábado corresponde ao planejado?"**

### Solução

Sistema **híbrido** (IA + Controle Manual) que:
- 🤖 **Detecta automaticamente** treinos que correspondem ao planejado
- 🧠 **Aprende seus padrões** comportamentais ao longo do tempo
- 💡 **Sugere reagendamentos** inteligentes quando detecta probabilidade alta de miss
- 📊 **Ajusta volumes** baseado em fadiga, recuperação e performance
- ✅ **Deixa você decidir** nos casos ambíguos

---

## 🏗️ Arquitetura

```
athera-flex/
├── core/                    # Lógica principal
│   ├── FlexEngine.ts       # Motor de decisões
│   ├── MatchDetector.ts    # Detecta matches
│   └── AdjustmentEngine.ts # Ajustes de treino
│
├── ml/                      # Machine Learning
│   ├── models/
│   │   ├── ReschedulePredictor.ts  # Prediz reagendamentos
│   │   ├── VolumeAdjuster.ts       # Ajusta volume
│   │   ├── WorkoutMatcher.ts       # Match de treinos
│   │   └── UserPatternLearner.ts   # Aprende padrões
│   └── MLOrchestrator.ts           # Coordena modelos
│
├── analytics/               # Análise de dados
│   └── PatternAnalyzer.ts  # Analisa padrões históricos
│
├── jobs/                    # Background Jobs
│   └── AutoMatchProcessor.ts # Processa matches auto
│
├── hooks/                   # Integrações
│   └── StravaSyncHook.ts   # Hook pós-sync Strava
│
└── api/                     # Rotas API
    ├── check-match/        # Verifica matches
    └── ml-decision/        # Decisões ML genéricas
```

---

## ✨ Features Implementadas

### 🎯 FASE 1: Foundation (100% ✅)
- [x] Schema de banco completo
- [x] FlexEngine (motor de decisões)
- [x] MatchDetector (detecção de matches)
- [x] AdjustmentEngine (ajustes de treino)
- [x] PatternAnalyzer (análise de padrões)
- [x] APIs REST completas

### 🎨 FASE 2: UI Components (100% ✅)
- [x] MatchSuggestionCard (sugestões de match)
- [x] AdjustmentDialog (diálogo de ajustes)
- [x] FlexHistoryPanel (histórico)
- [x] FlexSettingsPanel (configurações)
- [x] Toast notifications
- [x] Integração com calendário

### 🧠 FASE 3: Machine Learning (100% ✅)
- [x] ReschedulePredictor (prediz reagendamentos)
- [x] VolumeAdjuster (ajusta volume inteligente)
- [x] WorkoutMatcher (match avançado)
- [x] UserPatternLearner (aprende padrões)
- [x] MLOrchestrator (coordena modelos)
- [x] API Routes ML
- [x] AutoMatchProcessor (job automático)
- [x] StravaSyncHook (integração)

### 🎯 FASE 4: Documentation & Polish (100% ✅)
- [x] README completo
- [x] Guia de uso
- [x] Documentação técnica
- [x] CHANGELOG
- [x] Migration guide

---

## 🧠 Machine Learning

### Modelos Implementados

#### 1️⃣ **ReschedulePredictor**
Prediz se usuário vai reagendar treino.

**Fatores analisados:**
- Dia da semana (segunda/sexta = mais reagendamentos)
- Tipo de treino (longão = mais reagendamentos)
- Histórico recente (muitos misses = maior probabilidade)
- Clima (chuva/calor extremo)
- Padrão do usuário

**Output:**
```typescript
{
  willReschedule: boolean,
  confidence: 0.85,
  suggestedAlternatives: [
    { date: '2025-12-08', reason: 'Fim de semana ideal' }
  ]
}
```

#### 2️⃣ **VolumeAdjuster**
Ajusta volume baseado em fadiga/recuperação.

**Fatores analisados:**
- Fadiga acumulada (volume semanal, esforço percebido)
- Recuperação (dias desde último treino intenso)
- Consistência (distribuição de treinos)
- Progressão (regra dos 10%)
- Métricas biométricas (FC, sono, energia)

**Output:**
```typescript
{
  adjustedDistance: 18.5, // Era 20km
  adjustmentPercent: -7.5,
  reason: 'Volume reduzido devido a fadiga acumulada',
  riskLevel: 'medium'
}
```

#### 3️⃣ **WorkoutMatcher**
Identifica se treino executado = planejado.

**Tolerâncias:**
- Easy Run: ±15% distância, ±20% duração
- Tempo: ±10% distância, ±15% duração
- Interval: ±5% distância, ±10% duração
- Long Run: ±20% distância, ±25% duração

**Output:**
```typescript
{
  isMatch: true,
  matchScore: 92,
  confidence: 0.88,
  suggestion: 'accept',
  alternativeInterpretations: []
}
```

#### 4️⃣ **UserPatternLearner**
Aprende padrões comportamentais.

**Aprende:**
- Dias/horários preferidos
- Taxa de sucesso por tipo de treino
- Frequência de reagendamentos
- Tolerância a ajustes de volume
- Preferência de flexibilidade (strict/moderate/flexible)

**Output:**
```typescript
{
  flexibilityPreference: 'moderate',
  rescheduleFrequency: 0.23,
  confidenceLevel: 0.75,
  sampleSize: 42
}
```

### MLOrchestrator

Coordena todos modelos e toma decisões finais:

```typescript
const orchestrator = new MLOrchestrator();

const result = await orchestrator.decide({
  userId: 'user_123',
  scenario: 'check_match',
  data: { planned, executed }
});

// result = {
//   action: 'accept' | 'suggest' | 'warn' | 'reject',
//   confidence: 0.92,
//   suggestion: { ... },
//   reasoning: ['Treino muito próximo do planejado'],
//   mlMetadata: { modelsUsed, scores }
// }
```

---

## 🔌 APIs

### POST /api/athera-flex/check-match

Verifica se atividade Strava corresponde a treino planejado.

**Request:**
```json
{
  "plannedWorkoutId": 123,
  "stravaActivityId": "9876543210",
  "executedDate": "2025-12-07"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "action": "accept",
    "matchScore": 92,
    "confidence": 0.88,
    "suggestion": {
      "title": "✅ Treino Reconhecido Automaticamente",
      "description": "Treino executado muito próximo do planejado"
    },
    "requiresUserDecision": false
  }
}
```

### POST /api/athera-flex/ml-decision

Endpoint genérico para qualquer decisão ML.

**Scenarios disponíveis:**
- `check_match` - Verifica match
- `predict_reschedule` - Prediz reagendamento
- `adjust_volume` - Ajusta volume
- `learn_pattern` - Atualiza padrões

**Request:**
```json
{
  "scenario": "predict_reschedule",
  "data": {
    "workoutType": "long_run",
    "scheduledDate": "2025-12-08",
    "plannedDistance": 20,
    "plannedDuration": 120
  }
}
```

### GET /api/athera-flex/ml-decision?scenario=check_match

Retorna estatísticas ML do usuário.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalDecisions": 47,
    "avgMatchScore": "87.3",
    "avgConfidence": "0.82",
    "acceptanceRate": "89.4"
  }
}
```

---

## ⚙️ Jobs e Automações

### AutoMatchProcessor

**Quando roda:** Após sincronização do Strava

**O que faz:**
1. Busca atividades dos últimos 7 dias
2. Para cada atividade sem match:
   - Busca treinos planejados próximos (±3 dias)
   - Tenta match com cada candidato
   - Se score ≥ 85%: **aceita automaticamente**
   - Se score 60-84%: **marca como pendente revisão**
   - Se score < 60%: **ignora**

**Como usar:**
```typescript
import { AutoMatchProcessor } from '@/lib/athera-flex/jobs/AutoMatchProcessor';

const processor = new AutoMatchProcessor();
const result = await processor.processNewActivities(userId);

console.log(result);
// { processed: 5, matched: 3, pending: 2 }
```

### StravaSyncHook

**Integração automática:**

O hook é chamado automaticamente após cada sync do Strava:

```typescript
// Em app/api/workouts/sync-strava/route.ts
import { stravaSyncHook } from '@/lib/athera-flex/hooks/StravaSyncHook';

// Após sincronização bem-sucedida
await stravaSyncHook.onSyncComplete(session.user.id);
```

---

## 🗄️ Banco de Dados

### Tabelas Criadas

#### 1. `user_flex_settings`
```sql
CREATE TABLE user_flex_settings (
  user_id TEXT PRIMARY KEY,
  auto_match_enabled BOOLEAN DEFAULT true,
  auto_accept_threshold INTEGER DEFAULT 85,
  reschedule_window_days INTEGER DEFAULT 3,
  volume_adjustment_enabled BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true
);
```

#### 2. `workout_adjustments`
```sql
CREATE TABLE workout_adjustments (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  workout_id INTEGER NOT NULL,
  adjustment_type VARCHAR(50) NOT NULL, -- 'reschedule' | 'volume' | 'substitute'
  original_date TIMESTAMP WITH TIME ZONE,
  new_date TIMESTAMP WITH TIME ZONE,
  original_distance FLOAT,
  adjusted_distance FLOAT,
  reason TEXT,
  was_automatic BOOLEAN DEFAULT false,
  ml_confidence FLOAT
);
```

#### 3. `workout_match_decisions`
```sql
CREATE TABLE workout_match_decisions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  planned_workout_id INTEGER NOT NULL,
  strava_activity_id VARCHAR(50) NOT NULL,
  match_score FLOAT NOT NULL,
  was_accepted BOOLEAN NOT NULL,
  decision_source VARCHAR(20) NOT NULL, -- 'automatic' | 'manual'
  ml_confidence FLOAT,
  ml_reasoning TEXT[]
);
```

#### 4. `user_decision_patterns`
```sql
CREATE TABLE user_decision_patterns (
  user_id TEXT PRIMARY KEY,
  preferred_days JSONB,
  workout_type_success JSONB,
  reschedule_rate FLOAT,
  substitute_rate FLOAT,
  flexibility_preference VARCHAR(20), -- 'strict' | 'moderate' | 'flexible'
  confidence_level FLOAT,
  sample_size INTEGER
);
```

### Campos Adicionados

**`custom_workouts` table:**
```sql
ALTER TABLE custom_workouts
ADD COLUMN is_flexible BOOLEAN DEFAULT true,
ADD COLUMN flexibility_window INTEGER DEFAULT 3,
ADD COLUMN was_rescheduled BOOLEAN DEFAULT false,
ADD COLUMN original_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN executed_workout_id INTEGER UNIQUE;
```

---

## 📖 Como Usar

### Para Usuários

#### 1. Configurar Preferências

```typescript
// GET /api/athera-flex/settings
const settings = await fetch('/api/athera-flex/settings').then(r => r.json());

// POST /api/athera-flex/settings
await fetch('/api/athera-flex/settings', {
  method: 'POST',
  body: JSON.stringify({
    auto_match_enabled: true,
    auto_accept_threshold: 85,
    reschedule_window_days: 3
  })
});
```

#### 2. Sincronizar Strava

Após sincronizar, o Athera Flex processa automaticamente:

```typescript
// POST /api/workouts/sync-strava
const result = await fetch('/api/workouts/sync-strava', {
  method: 'POST'
});

// Sistema processa matches automaticamente
// Você recebe notificação se houver pendências
```

#### 3. Revisar Matches Pendentes

```typescript
// GET /api/athera-flex/pending-matches
const pending = await fetch('/api/athera-flex/pending-matches').then(r => r.json());

pending.forEach(match => {
  console.log(`Match Score: ${match.match_score}%`);
  console.log(`Planned: ${match.planned_workout.description}`);
  console.log(`Executed: ${match.strava_activity.distance}km`);
});
```

#### 4. Aceitar/Rejeitar Match

```typescript
// POST /api/athera-flex/resolve-match
await fetch('/api/athera-flex/resolve-match', {
  method: 'POST',
  body: JSON.stringify({
    decisionId: 123,
    accept: true,
    userReason: 'Treino estava correto'
  })
});
```

### Para Desenvolvedores

#### Usar ML Orchestrator

```typescript
import { MLOrchestrator } from '@/lib/athera-flex/ml/MLOrchestrator';

const orchestrator = new MLOrchestrator();

// Cenário 1: Check Match
const matchResult = await orchestrator.decide({
  userId: 'user_123',
  scenario: 'check_match',
  data: {
    planned: { workoutType: 'long_run', distance: 20, duration: 120 },
    executed: { distance: 18.5, duration: 115, pace: 6.2 }
  }
});

// Cenário 2: Predict Reschedule
const rescheduleResult = await orchestrator.decide({
  userId: 'user_123',
  scenario: 'predict_reschedule',
  data: {
    workoutType: 'long_run',
    scheduledDate: '2025-12-08',
    dayOfWeek: 0, // Domingo
    context: { recentMisses: 2, currentStreak: 5 }
  }
});

// Cenário 3: Adjust Volume
const volumeResult = await orchestrator.decide({
  userId: 'user_123',
  scenario: 'adjust_volume',
  data: {
    plannedDistance: 20,
    plannedDuration: 120,
    workoutType: 'long_run',
    userMetrics: { sleepQuality: 4, soreness: 7, energy: 5 }
  }
});
```

#### Processar Matches Manualmente

```typescript
import { AutoMatchProcessor } from '@/lib/athera-flex/jobs/AutoMatchProcessor';

const processor = new AutoMatchProcessor();

// Processar todas atividades novas
const result = await processor.processNewActivities('user_123');

// Buscar pendentes
const pending = await processor.getPendingMatches('user_123');

// Resolver match
await processor.resolveMatch('user_123', decisionId, true, 'Match correto');
```

---

## 🚀 Roadmap Futuro

### Melhorias Curto Prazo
- [ ] Notificações push/email para matches pendentes
- [ ] Dashboard analytics de padrões aprendidos
- [ ] Comparação com atletas similares
- [ ] Sugestões proativas de reagendamento

### Melhorias Médio Prazo
- [ ] Integração com clima (API externa)
- [ ] Predição de fadiga baseada em HRV
- [ ] Sistema de badges de consistência
- [ ] Modo "strict" vs "flexible" dinâmico

### Melhorias Longo Prazo
- [ ] Deep Learning para predições mais precisas
- [ ] Integração com Garmin/Polar
- [ ] Coach virtual com sugestões diárias
- [ ] Análise de risco de lesão

---

## 📊 Métricas de Sucesso

### Objetivos
- ✅ 90%+ de matches automáticos corretos
- ✅ 70%+ de usuários usam feature regularmente
- ✅ 50% redução em treinos "perdidos"
- ✅ 85%+ de satisfação do usuário

### Como Medir
```sql
-- Taxa de aceitação automática
SELECT 
  COUNT(*) FILTER (WHERE was_accepted = true AND decision_source = 'automatic') * 100.0 / 
  COUNT(*) as auto_acceptance_rate
FROM workout_match_decisions
WHERE user_id = 'user_123';

-- Precisão do ML
SELECT 
  AVG(match_score) as avg_match_score,
  AVG(ml_confidence) as avg_confidence
FROM workout_match_decisions
WHERE was_accepted = true;

-- Padrões aprendidos
SELECT 
  flexibility_preference,
  reschedule_rate,
  confidence_level,
  sample_size
FROM user_decision_patterns
WHERE user_id = 'user_123';
```

---

## 🎯 Conclusão

O **Athera Flex** é um sistema completo de flexibilidade inteligente que:

1. ✅ Resolve problema real de usuários
2. ✅ Usa ML para automação inteligente
3. ✅ Mantém controle do usuário
4. ✅ Aprende ao longo do tempo
5. ✅ É 100% premium e diferenciado

**Status:** Pronto para produção! 🚀

---

**Documentação completa:** `/docs/athera-flex/`  
**Changelog:** `CHANGELOG_v3_3_0_ATHERA_FLEX.md`  
**Migration:** `MIGRATION_ATHERA_FLEX_v3_3_0.sql`
