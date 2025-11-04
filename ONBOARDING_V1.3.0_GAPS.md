# 🔍 ANÁLISE DE GAPS - ONBOARDING v1.3.0

**Data:** 04/Nov/2025 12:48 UTC
**Status:** Identificação de campos faltantes

---

## 📊 CAMPOS V1.3.0 (Total: 13 novos campos)

### ✅ COLETADOS (10/13)

#### Fisiologia (3/3) ✅
- ✅ `restingHeartRate` - Step4Health
- ✅ `sleepQuality` - Step4Health  
- ✅ `stressLevel` - Step4Health

#### Base Aeróbica (2/2) ✅
- ✅ `otherSportsExperience` - Step2SportBackground
- ✅ `otherSportsYears` - Step2SportBackground

#### Performance (2/2) ✅
- ✅ `bestTimes` - Step3Performance
- ✅ `lastVDOTUpdate` - Auto-calculado

#### Lesões Básicas (2/2) ✅
- ✅ `injuryHistory` (array simples) - Step4Health
- ✅ `medicalClearance` - Step4Health

#### Preferências Básicas (1/1) ✅
- ✅ `availableDays` - Step6Availability

---

### ❌ FALTANDO (3/13)

#### Infraestrutura (3/3) ❌
- ❌ `hasGymAccess` - NÃO COLETADO
- ❌ `hasPoolAccess` - NÃO COLETADO
- ❌ `hasTrackAccess` - NÃO COLETADO

---

## 🔍 CAMPOS ADICIONAIS NO SCHEMA NÃO COLETADOS

### Lesões Detalhadas ❌
- ❌ `injuryDetails` (Json detalhado) - Apenas array simples coletado
- ❌ `injuryRecoveryStatus` - NÃO COLETADO
- ❌ `lastInjuryDate` - NÃO COLETADO

### Preferências Avançadas ❌
- ❌ `trainingPreferences` (Json) - NÃO COLETADO
  - Local (rua, pista, esteira, trilha)
  - Indoor vs Outdoor
  - Treino em grupo vs solo
  
- ❌ `motivationFactors` (Json) - NÃO COLETADO
  - Motivação primária
  - Objetivos múltiplos

---

## 📝 CAMPOS ATUAIS POR STEP

### Step 1: Dados Básicos ✅
- age, gender, weight, height ✅
- **v1.3.0 ADICIONADO:** restingHeartRate, sleepQuality, stressLevel ✅

### Step 2: Base Esportiva ✅
- hasRunBefore, runningYears, currentWeeklyKm, longestRun ✅
- **v1.3.0 ADICIONADO:** otherSportsExperience, otherSportsYears ✅

### Step 3: Performance ✅
- **v1.3.0 ADICIONADO:** bestTimes (5k, 10k, 21k, 42k) ✅
- **v1.3.0 AUTO:** lastVDOTUpdate ✅

### Step 4: Saúde ✅
- hasInjuryHistory, injuryHistory (array simples), medicalClearance ✅
- **v1.3.0 ADICIONADO:** restingHeartRate, sleepQuality, stressLevel ✅
- **v1.3.0 FALTA:** injuryDetails detalhado, injuryRecoveryStatus, lastInjuryDate ❌

### Step 5: Objetivos ⚠️
- goalDistance, targetRaceDate, targetTime, raceGoals (múltiplas) ✅
- **v1.3.0 FALTA:** motivationFactors ❌

### Step 6: Disponibilidade ⚠️
- availableDays (running + other activities) ✅
- **v1.3.0 FALTA:** hasGymAccess, hasPoolAccess, hasTrackAccess ❌
- **v1.3.0 FALTA:** trainingPreferences ❌
- longRunDay ✅

### Step 7: Revisão ✅
- Review e submit ✅

---

## 🎯 AÇÕES NECESSÁRIAS

### PRIORIDADE ALTA (Infraestrutura)
1. **Step6Availability**: Adicionar seção de infraestrutura
   - ❌ hasGymAccess (checkbox)
   - ❌ hasPoolAccess (checkbox)
   - ❌ hasTrackAccess (checkbox)

### PRIORIDADE MÉDIA (Preferências)
2. **Step6Availability**: Adicionar preferências de treino
   - ❌ trainingPreferences
     - Local preferido: [rua, pista, esteira, trilha]
     - Indoor vs Outdoor
     - Treino em grupo vs solo

3. **Step5Goals**: Adicionar motivação
   - ❌ motivationFactors
     - Motivação primária (saúde, competição, social, etc)
     - Objetivos múltiplos

### PRIORIDADE BAIXA (Lesões Detalhadas)
4. **Step4Health**: Upgrade de lesões
   - ❌ Coletar injuryDetails detalhado com:
     - Tipo, data, duração, tratamento, status, risco recorrência
   - ❌ injuryRecoveryStatus (recovered, recovering, chronic)
   - ❌ lastInjuryDate

---

## 💡 RECOMENDAÇÕES

### Implementação por Fases

**Fase 1 (Crítico):** Infraestrutura
- Step6: Adicionar 3 checkboxes de infraestrutura
- Impacto: IA precisa saber se atleta tem acesso a pista/gym/piscina

**Fase 2 (Importante):** Preferências
- Step6: Adicionar seção de preferências de treino
- Step5: Adicionar motivação
- Impacto: Personalização mais profunda

**Fase 3 (Melhoria):** Lesões Detalhadas
- Step4: Upgrade lesões de array simples para Json detalhado
- Impacto: Prevenção de lesões mais precisa

---

## 📌 STATUS ATUAL

**Score:** 10/13 campos v1.3.0 coletados (77%)

**Campos OK:** 10
**Campos Faltando:** 3 (infraestrutura)
**Campos Parciais:** 3 (lesões, preferências, motivação)

---

**Conclusão:** O onboarding v1.3.0 está FUNCIONAL mas INCOMPLETO. Os 3 campos de infraestrutura são CRÍTICOS para a IA gerar planos corretos (ex: não pode sugerir pista se não tem acesso).

