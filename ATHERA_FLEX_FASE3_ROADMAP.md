# 🧠 ATHERA FLEX v3.3.0 - FASE 3: MACHINE LEARNING ENHANCEMENT

**Data Início:** 02/DEZ/2025 14:50 UTC  
**Duração Estimada:** 3-4 sessões (60-80 min)  
**Objetivo:** Sistema de aprendizado que melhora automaticamente

---

## 🎯 OBJETIVO DA FASE 3

Transformar o Athera Flex em um sistema que **aprende com as decisões do usuário** e **melhora automaticamente** a precisão dos matches ao longo do tempo.

### Conceito
```
Usuário decide: Aplicar ou Rejeitar
    ↓
Sistema registra: Confidence, Scores, Decisão
    ↓
ML analisa padrões: "Este usuário prefere..."
    ↓
Sistema ajusta: Threshold, Pesos, Critérios
    ↓
Próximos matches: Mais precisos e personalizados
```

---

## 📋 ROADMAP FASE 3

### SESSÃO 1: ML Data Collection (20min)
**Objetivo:** Capturar dados suficientes para ML aprender

**Entregas:**
- [ ] Schema: `user_decision_patterns` table
- [ ] Schema: `ml_confidence_calibration` table
- [ ] Migration SQL completa
- [ ] Engine: Data collector (registra decisões)
- [ ] Engine: Pattern analyzer (identifica tendências)

**Features:**
- ✅ Registra TODAS decisões (aceitar/rejeitar)
- ✅ Captura contexto: hora, dia, tipo treino, scores
- ✅ Calcula taxa de aceitação por faixa de confidence
- ✅ Identifica padrões: "usuário sempre rejeita quando X"

---

### SESSÃO 2: Threshold Auto-Adjustment (20min)
**Objetivo:** Sistema ajusta threshold automaticamente

**Entregas:**
- [ ] Algorithm: Adaptive threshold calculator
- [ ] Engine: Threshold optimizer
- [ ] API: `GET /ml/suggested-threshold`
- [ ] API: `POST /ml/apply-threshold-adjustment`
- [ ] Component: ThresholdSuggestionCard

**Lógica:**
```typescript
// Exemplo:
Taxa aceitação 60-70% confidence: 40% → Threshold muito alto
Taxa aceitação 90-95% confidence: 95% → Threshold pode subir
Taxa aceitação 70-80% confidence: 75% → Threshold perfeito (manter)

→ Sistema sugere novo threshold otimizado
```

**Features:**
- ✅ Analisa últimos 30 dias
- ✅ Calcula threshold ideal (maximiza precision + recall)
- ✅ Sugere ao usuário (não aplica automaticamente)
- ✅ Notifica quando há sugestão
- ✅ Histórico de ajustes de threshold

---

### SESSÃO 3: Score Weights Personalization (20min)
**Objetivo:** Personalizar pesos dos scores por usuário

**Entregas:**
- [ ] Schema: `user_score_weights` table
- [ ] Algorithm: Weight optimizer
- [ ] Engine: Personalized score calculator
- [ ] API: `GET /ml/score-weights`
- [ ] API: `POST /ml/update-weights`

**Lógica:**
```typescript
// Padrões detectados:
Usuário sempre aceita quando dateScore > 80% (mesmo volume baixo)
  → Aumenta peso do dateScore

Usuário rejeita quando intensityScore < 70% (mesmo outros altos)
  → Aumenta peso do intensityScore

→ Sistema recalcula confidence com pesos personalizados
```

**Features:**
- ✅ Pesos iniciais (default): 0.25 cada (4 scores)
- ✅ ML ajusta baseado em decisões
- ✅ Pesos sempre somam 1.0
- ✅ Minimum 0.10, maximum 0.50 por score
- ✅ Recalcula matches existentes com novos pesos

---

### SESSÃO 4: Predictive Insights (20min)
**Objetivo:** Sistema prevê sucesso de matches e sugere ações

**Entregas:**
- [ ] Algorithm: Success predictor
- [ ] Component: MatchSuccessIndicator
- [ ] Component: InsightsBanner
- [ ] API: `GET /ml/insights`

**Insights Gerados:**
```
🎯 "Você tende a aceitar matches em terças e quintas"
💪 "Você é mais flexível com treinos de intensidade"
⚡ "Aumentar seu threshold para 85% reduziria sugestões em 40%"
📊 "Taxa de aceitação de matches: 78% (ótimo!)"
🔮 "Este match tem 85% de chance de ser aceito baseado no seu histórico"
```

**Features:**
- ✅ Analisa padrões temporais (dia da semana, hora)
- ✅ Analisa padrões por tipo de treino
- ✅ Calcula probabilidade de aceitação
- ✅ Sugere otimizações
- ✅ Dashboard de insights

---

## 🗄️ DATABASE SCHEMA (FASE 3)

### 1. user_decision_patterns
```sql
CREATE TABLE user_decision_patterns (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  match_id INTEGER REFERENCES workout_match_decisions(id),
  
  -- Context
  decision_type VARCHAR(20), -- 'accepted', 'rejected'
  confidence_at_decision DECIMAL(5,2),
  
  -- Scores at decision
  date_score DECIMAL(5,2),
  type_score DECIMAL(5,2),
  volume_score DECIMAL(5,2),
  intensity_score DECIMAL(5,2),
  
  -- Temporal patterns
  day_of_week INTEGER, -- 0-6 (domingo-sábado)
  hour_of_day INTEGER, -- 0-23
  time_to_race_weeks INTEGER, -- semanas até prova alvo
  
  -- Workout context
  workout_type VARCHAR(50),
  planned_distance DECIMAL(10,2),
  executed_distance DECIMAL(10,2),
  distance_variance_percent DECIMAL(5,2),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_decisions ON user_decision_patterns(user_id, decision_type);
CREATE INDEX idx_confidence_range ON user_decision_patterns(user_id, confidence_at_decision);
```

### 2. ml_confidence_calibration
```sql
CREATE TABLE ml_confidence_calibration (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  
  -- Analysis period
  analysis_start_date TIMESTAMP,
  analysis_end_date TIMESTAMP,
  total_decisions INTEGER,
  
  -- Calibration by confidence range
  range_60_70_total INTEGER,
  range_60_70_accepted INTEGER,
  range_70_80_total INTEGER,
  range_70_80_accepted INTEGER,
  range_80_90_total INTEGER,
  range_80_90_accepted INTEGER,
  range_90_100_total INTEGER,
  range_90_100_accepted INTEGER,
  
  -- Recommended threshold
  recommended_threshold DECIMAL(5,2),
  current_threshold DECIMAL(5,2),
  expected_precision_improvement DECIMAL(5,2),
  
  -- Status
  was_applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_calibration ON ml_confidence_calibration(user_id, created_at DESC);
```

### 3. user_score_weights
```sql
CREATE TABLE user_score_weights (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  
  -- Personalized weights (must sum to 1.0)
  date_weight DECIMAL(5,2) DEFAULT 0.25,
  type_weight DECIMAL(5,2) DEFAULT 0.25,
  volume_weight DECIMAL(5,2) DEFAULT 0.25,
  intensity_weight DECIMAL(5,2) DEFAULT 0.25,
  
  -- Metadata
  decisions_analyzed INTEGER, -- quantas decisões foram usadas
  last_optimization_at TIMESTAMP,
  optimization_trigger VARCHAR(50), -- 'auto', 'manual', 'threshold_change'
  
  -- Validation
  CONSTRAINT weights_sum_to_one CHECK (
    ABS(date_weight + type_weight + volume_weight + intensity_weight - 1.0) < 0.01
  ),
  CONSTRAINT weights_min_max CHECK (
    date_weight BETWEEN 0.10 AND 0.50 AND
    type_weight BETWEEN 0.10 AND 0.50 AND
    volume_weight BETWEEN 0.10 AND 0.50 AND
    intensity_weight BETWEEN 0.10 AND 0.50
  ),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_user_weights ON user_score_weights(user_id);
```

---

## 🧮 ALGORITHMS

### 1. Adaptive Threshold Calculator
```typescript
/**
 * Calcula threshold ideal baseado em histórico de decisões
 */
function calculateOptimalThreshold(decisions: Decision[]): number {
  // Agrupa por ranges de confidence
  const ranges = groupByConfidenceRange(decisions);
  
  // Calcula precision e recall por range
  const metrics = ranges.map(range => ({
    threshold: range.midpoint,
    precision: range.accepted / range.total,
    recall: calculateRecall(range, decisions),
    f1Score: calculateF1(precision, recall)
  }));
  
  // Retorna threshold que maximiza F1-score
  return metrics.reduce((best, curr) => 
    curr.f1Score > best.f1Score ? curr : best
  ).threshold;
}
```

### 2. Score Weight Optimizer
```typescript
/**
 * Otimiza pesos dos scores baseado em padrões
 */
function optimizeScoreWeights(decisions: Decision[]): Weights {
  const accepted = decisions.filter(d => d.accepted);
  const rejected = decisions.filter(d => !d.accepted);
  
  // Calcula correlação de cada score com aceitação
  const correlations = {
    date: calculateCorrelation(decisions, 'dateScore'),
    type: calculateCorrelation(decisions, 'typeScore'),
    volume: calculateCorrelation(decisions, 'volumeScore'),
    intensity: calculateCorrelation(decisions, 'intensityScore')
  };
  
  // Normaliza correlações para somar 1.0
  const total = Object.values(correlations).reduce((a, b) => a + b, 0);
  
  return {
    date: clamp(correlations.date / total, 0.10, 0.50),
    type: clamp(correlations.type / total, 0.10, 0.50),
    volume: clamp(correlations.volume / total, 0.10, 0.50),
    intensity: clamp(correlations.intensity / total, 0.10, 0.50)
  };
}
```

### 3. Match Success Predictor
```typescript
/**
 * Prevê probabilidade de aceitação de um match
 */
function predictMatchSuccess(
  match: Match,
  userPatterns: Pattern[]
): number {
  // Fatores considerados:
  const factors = [
    // 1. Confidence histórico nessa faixa
    getAcceptanceRateInRange(match.confidence, userPatterns),
    
    // 2. Dia da semana
    getDayOfWeekPattern(match.date, userPatterns),
    
    // 3. Tipo de treino
    getWorkoutTypePattern(match.type, userPatterns),
    
    // 4. Variação de volume
    getVolumeVariancePattern(match.variance, userPatterns),
    
    // 5. Tempo até prova
    getTimeToRacePattern(match.weeksToRace, userPatterns)
  ];
  
  // Média ponderada
  return weightedAverage(factors);
}
```

---

## 📊 UI COMPONENTS (FASE 3)

### 1. ThresholdSuggestionCard
```typescript
interface Props {
  currentThreshold: number;
  suggestedThreshold: number;
  expectedImprovement: number;
  analysisData: CalibrationData;
}

// Card mostra:
// - Threshold atual vs sugerido
// - Gráfico de taxa de aceitação por range
// - Expected improvement
// - Botão "Aplicar Nova Configuração"
```

### 2. MatchSuccessIndicator
```typescript
interface Props {
  match: Match;
  predictedSuccess: number;
}

// Badge no modal mostra:
// - "85% de chance de ser útil"
// - Baseado em: "Seu histórico de decisões"
// - Tooltip com razões
```

### 3. InsightsDashboard
```typescript
// Dashboard com insights:
// - Taxa de aceitação geral
// - Padrões temporais (melhor dia/hora)
// - Preferências por tipo de treino
// - Recomendações de otimização
// - Evolução do threshold ao longo do tempo
```

---

## 🎯 MÉTRICAS DE SUCESSO

### Objetivos Quantitativos
- **Precision:** Taxa de matches aceitos aumenta 15%+
- **User Satisfaction:** Menos rejeições desnecessárias
- **Threshold Optimization:** Ajuste automático a cada 50 decisões
- **Weight Convergence:** Pesos estabilizam após 100 decisões

### Indicadores de Qualidade
- ✅ Sistema aprende padrões reais do usuário
- ✅ Sugestões de threshold são precisas
- ✅ Pesos personalizados melhoram confidence
- ✅ Insights são acionáveis e claros
- ✅ ML não interfere negativamente (sempre pode reverter)

---

## 🚀 PRÓXIMA SESSÃO

**Vamos começar pela Sessão 1: ML Data Collection**

**Tempo:** 20 minutos  
**Objetivo:** Schema + Migration + Data Collector  

**Entregas:**
1. Migration SQL completa (3 tabelas)
2. MLDataCollector engine
3. Pattern analyzer básico

**Você está pronto para começar?** 🧠
