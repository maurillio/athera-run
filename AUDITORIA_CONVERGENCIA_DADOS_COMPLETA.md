# 🔍 AUDITORIA COMPLETA DE CONVERGÊNCIA DE DADOS

**Data:** 24 de Novembro de 2025  
**Versão Analisada:** v2.8.0  
**Escopo:** Sistema completo de perfil (https://atherarun.com/pt-BR/perfil)  
**Objetivo:** Eliminar duplicações, inconsistências, ambiguidades e lacunas de convergência  

---

## 📋 SUMÁRIO EXECUTIVO

### Status Atual
🔴 **CRÍTICO** - Identificados **15 problemas graves** de convergência de dados

### Problemas Principais
1. **Duplicação de campos** entre diferentes abas e tabelas
2. **Campos coletados mas não exibidos** no perfil
3. **Campos exibidos mas não salvos** corretamente
4. **Inconsistência** entre onboarding → perfil → IA
5. **Campos perdidos** sem visualização ou uso

### Impacto
- ❌ Usuário preenche dados que **não aparecem** no perfil
- ❌ IA **não recebe** dados importantes para personalização
- ❌ Dados **duplicados** em múltiplas abas sem sincronização
- ❌ **Ambiguidade** sobre onde cada dado deve estar

---

## 🗺️ MAPEAMENTO COMPLETO DO SISTEMA

### 1. DATABASE (AthleteProfile) - 47 Campos

```prisma
model AthleteProfile {
  // BÁSICOS (5 campos)
  weight                Float       ✅ Usado
  height                Float       ✅ Usado
  age                   Int?        ✅ Usado
  gender                String?     ✅ Usado
  runningLevel          String      ✅ Usado
  
  // EXPERIÊNCIA (5 campos)
  currentWeeklyKm       Float?      ✅ Usado
  longestRun            Float?      ✅ Usado
  experienceDescription String?     🔴 NÃO exibido no perfil
  experienceAnalysis    String?     🔴 NÃO exibido no perfil
  runningYears          Int?        ✅ Usado
  
  // OBJETIVOS (3 campos)
  goalDistance          String?     🟡 Usado em RaceGoal (duplicado)
  targetRaceDate        DateTime?   🟡 Usado em RaceGoal (duplicado)
  targetTime            String?     🟡 Usado em RaceGoal (duplicado)
  
  // PERFORMANCE (5 campos)
  currentVDOT           Float?      🔴 NÃO exibido no perfil
  bestTimes             Json?       ✅ Usado
  usualPaces            Json?       🔴 NÃO exibido no perfil
  recentLongRunPace     String?     🔴 NÃO exibido no perfil
  lastVDOTUpdate        DateTime?   🔴 NÃO exibido no perfil
  
  // STRAVA (5 campos)
  stravaConnected       Boolean     ✅ Exibido
  stravaAthleteId       String?     🟢 Interno (OK não exibir)
  stravaAccessToken     String?     🟢 Interno (OK não exibir)
  stravaRefreshToken    String?     🟢 Interno (OK não exibir)
  stravaTokenExpiry     DateTime?   🟢 Interno (OK não exibir)
  
  // SAÚDE (8 campos)
  injuries              Json?       🔴 Campo antigo (usar injuryDetails)
  medicalConditions     String?     🔴 NÃO exibido no perfil
  medications           String?     🔴 NÃO exibido no perfil
  physicalRestrictions  String?     🔴 NÃO exibido no perfil
  injuryHistory         String?     🔴 Campo antigo (usar injuryDetails)
  injuryDetails         Json?       ✅ Usado (v1.3.0)
  injuryRecoveryStatus  String?     🔴 NÃO exibido no perfil
  lastInjuryDate        DateTime?   🔴 NÃO exibido no perfil
  
  // FISIOLOGIA (3 campos)
  restingHeartRate      Int?        ✅ Usado
  sleepQuality          Int?        ✅ Usado
  stressLevel           Int?        ✅ Usado
  
  // DISPONIBILIDADE (5 campos)
  weeklyAvailability    Int?        🔴 Campo antigo (usar trainingSchedule)
  trainingActivities    Json?       🔴 Campo antigo (usar trainingSchedule)
  trainingSchedule      Json?       ✅ Usado (v1.4.0)
  customActivities      Json?       ✅ Usado (v1.4.0)
  longRunDay            Int?        ✅ Usado (v1.6.0)
  
  // INFRAESTRUTURA (3 campos)
  hasGymAccess          Boolean?    ✅ Usado
  hasPoolAccess         Boolean?    ✅ Usado
  hasTrackAccess        Boolean?    ✅ Usado
  
  // PREFERÊNCIAS (2 campos)
  trainingPreferences   Json?       ✅ Usado
  motivationFactors     Json?       ✅ Usado
  
  // AVANÇADO v3.0.0 (8 campos)
  hasRunBefore          Boolean     🟡 Coletado mas NÃO exibido
  currentlyInjured      Boolean     🟡 Coletado mas NÃO exibido
  avgSleepHours         Float?      🟡 Coletado mas NÃO exibido
  tracksMenstrualCycle  Boolean?    🟡 Coletado mas NÃO exibido
  avgCycleLength        Int?        🟡 Coletado mas NÃO exibido
  lastPeriodDate        DateTime?   🟡 Coletado mas NÃO exibido
  workDemand            String?     🟡 Coletado mas NÃO exibido
  familyDemand          String?     🟡 Coletado mas NÃO exibido
  
  // OUTROS ESPORTES (2 campos)
  otherSportsExperience String?     ✅ Usado
  otherSportsYears      Int?        🔴 NÃO exibido no perfil
  
  // SISTEMA (5 campos)
  autoAdjustEnabled     Boolean     🟢 Interno (OK não exibir)
  lastAutoAdjustDate    DateTime?   🟢 Interno (OK não exibir)
  hasCustomPlan         Boolean     🟢 Interno (OK não exibir)
  customPlanId          Int?        🟢 Interno (OK não exibir)
  preferredStartDate    DateTime?   🔴 NÃO usado
  
  // CARDIO (1 campo)
  maxHeartRate          Int?        🔴 NÃO exibido no perfil
}
```

### 2. PERFIL (/perfil) - 5 Abas Principais + 2 Extras

#### Aba 1: Profile (6 sub-tabs)
- **BasicDataTab** ✅
  - age, gender, weight, height ✅
  - restingHeartRate, sleepQuality, stressLevel ✅
  
- **PerformanceTab** ✅
  - runningLevel, runningYears, currentWeeklyKm, longestRun ✅
  - otherSportsExperience ✅
  - bestTimes ✅
  - 🔴 **FALTA:** otherSportsYears, experienceDescription, currentVDOT, usualPaces
  
- **HealthTab** ✅
  - hasInjuryHistory, injuryHistory (array), medicalClearance ✅
  - restingHeartRate, sleepQuality, stressLevel ✅ (DUPLICADO de BasicDataTab!)
  - 🔴 **FALTA:** medicalConditions, medications, physicalRestrictions, injuryRecoveryStatus, lastInjuryDate
  - 🔴 **FALTA:** Campos v3.0.0 (currentlyInjured, avgSleepHours, etc)
  
- **GoalsTab** ✅
  - primaryGoal, motivation ✅
  - 🔴 **FALTA:** motivationFactors completo (só mostra motivation string)
  
- **AvailabilityTab** ✅
  - trainingSchedule, longRunDay ✅
  - hasGymAccess, hasPoolAccess, hasTrackAccess ✅
  - 🔴 **MOSTRA** mas **NÃO PERMITE EDITAR** as atividades por dia
  
- **PreferencesTab** ✅
  - locale, preferredUnits ✅
  - trainingPreferences, motivationFactors ✅
  - 🔴 **FALTA:** Notificações, tema dark/light

#### Aba 2: Stats (Estatísticas)
- **AthleteStatsSection** ✅
  - Exibe estatísticas de Strava
  
- **StravaDataSection** ✅
  - Exibe PRs, zonas, equipamentos

#### Aba 3: Medical
- **MedicalInfoSection** ✅
  - 🔴 **PROBLEMA:** Componente separado, dados **NÃO sincronizam** com HealthTab!

#### Aba 4: Races
- **RaceManagement** ✅
  - Gerencia RaceGoal (tabela separada)
  - 🟡 **DUPLICAÇÃO:** goalDistance, targetRaceDate, targetTime também em AthleteProfile

#### Aba 5: Actions
- Regenerar plano, Deletar perfil ✅

---

## 🔴 PROBLEMAS CRÍTICOS IDENTIFICADOS

### Problema 1: DUPLICAÇÃO DE CAMPOS DE SAÚDE
**Severidade:** 🔴 ALTA

**Descrição:**
- `restingHeartRate`, `sleepQuality`, `stressLevel` aparecem em **2 abas**:
  - BasicDataTab (linha 17-19)
  - HealthTab (linha 16-18)

**Impacto:**
- Usuário pode editar em uma aba e não refletir na outra
- Dados podem ficar inconsistentes
- Confusão sobre onde está a "fonte da verdade"

**Solução:**
```typescript
// MANTER em BasicDataTab (dados fisiológicos básicos)
// REMOVER de HealthTab (ou mostrar read-only com link para BasicDataTab)
```

---

### Problema 2: CAMPOS v3.0.0 NÃO EXIBIDOS
**Severidade:** 🔴 ALTA

**Descrição:**
8 campos coletados no onboarding v3.0.0 **NÃO aparecem** no perfil:
- `hasRunBefore` - Iniciante absoluto?
- `currentlyInjured` - Lesão ativa?
- `avgSleepHours` - Horas de sono/noite
- `tracksMenstrualCycle` - Tracking ciclo menstrual
- `avgCycleLength` - Duração do ciclo
- `lastPeriodDate` - Última menstruação
- `workDemand` - Demanda de trabalho
- `familyDemand` - Responsabilidades familiares

**Impacto:**
- IA usa esses dados para personalização CRÍTICA
- Usuário **não consegue ver** ou **editar** depois do onboarding
- Dados ficam "presos" no banco sem visualização

**Solução:**
```typescript
// Adicionar nova seção em HealthTab:
// "🏃 Perfil de Corredor v3.0.0"
// - hasRunBefore (checkbox)
// - currentlyInjured (checkbox)
// - avgSleepHours (input number)
// - tracksMenstrualCycle (checkbox, se gender === 'female')
// - avgCycleLength (input, se tracksMenstrualCycle)
// - lastPeriodDate (date picker, se tracksMenstrualCycle)
// - workDemand (select: sedentary/moderate/physical)
// - familyDemand (select: low/moderate/high)
```

---

### Problema 3: CAMPOS DE PERFORMANCE PERDIDOS
**Severidade:** 🔴 ALTA

**Descrição:**
5 campos de performance **NÃO exibidos** no PerformanceTab:
- `currentVDOT` - VDOT atual calculado
- `usualPaces` - Ritmos habituais de treino
- `recentLongRunPace` - Pace do último longão
- `lastVDOTUpdate` - Data da última atualização VDOT
- `experienceDescription` - Descrição da experiência (analisada por IA)
- `experienceAnalysis` - Análise IA da experiência

**Impacto:**
- Usuário não vê seu VDOT calculado
- Não sabe quais são seus ritmos de treino recomendados
- Dados valiosos ficam ocultos

**Solução:**
```typescript
// Adicionar seção em PerformanceTab:
// "📊 Análise de Performance"
// - Card com VDOT atual (grande destaque)
// - Tabela com usualPaces (Easy, Marathon, Threshold, Interval, Repetition)
// - Pace do último longão
// - Data da última atualização
// - Experiência (description + AI analysis em card colapsável)
```

---

### Problema 4: CAMPOS DE SAÚDE DETALHADOS NÃO EXIBIDOS
**Severidade:** 🟡 MÉDIA

**Descrição:**
4 campos de saúde coletados mas **não exibidos**:
- `medicalConditions` - Condições médicas
- `medications` - Medicamentos em uso
- `physicalRestrictions` - Restrições físicas
- `injuryRecoveryStatus` - Status de recuperação de lesão
- `lastInjuryDate` - Data da última lesão

**Impacto:**
- Dados médicos importantes ficam ocultos
- Usuário não consegue revisar/atualizar
- IA pode não ter contexto completo

**Solução:**
```typescript
// Adicionar seção expandida em HealthTab:
// "🏥 Informações Médicas Detalhadas"
// - medicalConditions (textarea)
// - medications (textarea)
// - physicalRestrictions (textarea)
// 
// Melhorar seção de lesões:
// - Para cada lesão em injuryDetails:
//   - Mostrar injuryRecoveryStatus (select: recovered/recovering/chronic)
//   - Mostrar lastInjuryDate (date)
```

---

### Problema 5: GOALS TAB INCOMPLETO
**Severidade:** 🟡 MÉDIA

**Descrição:**
GoalsTab mostra apenas `primaryGoal` e `motivation` (string), mas `motivationFactors` é um objeto JSON complexo com:
```json
{
  "primary": "competicao",
  "secondary": ["saude", "desafio"],
  "goals": ["emagrecer", "melhorar_tempo"]
}
```

**Impacto:**
- Apenas motivação primária visível
- Goals secundários e múltiplos objetivos **não aparecem**
- Dados ricos ficam ocultos

**Solução:**
```typescript
// Expandir GoalsTab para mostrar:
// - primaryGoal (já existe)
// - motivationFactors.primary (visual destacado)
// - motivationFactors.secondary (badges)
// - motivationFactors.goals (checkboxes múltiplos)
// - motivation (string de texto livre)
```

---

### Problema 6: DISPONIBILIDADE NÃO EDITÁVEL COMPLETAMENTE
**Severidade:** 🔴 ALTA

**Descrição:**
AvailabilityTab **mostra** as atividades por dia (`trainingSchedule`), mas:
- Usuário **não pode adicionar** novas atividades
- Usuário **não pode remover** atividades existentes
- Nota diz "Para editar, crie novo plano no Dashboard"

**Impacto:**
- Funcionalidade incompleta
- Usuário frustrado (vê mas não pode editar)
- Precisa refazer onboarding inteiro para mudar

**Solução:**
```typescript
// Tornar AvailabilityTab TOTALMENTE EDITÁVEL:
// Para cada dia:
// - Checkbox "Corrida" (já existe)
// - Multi-select de atividades: ['Musculação', 'Yoga', 'Natação', ...]
// - Campo "Adicionar atividade customizada"
// - Botão "X" para remover cada atividade
// 
// Salvar em trainingSchedule e customActivities
// Aplicar auto-adjust automaticamente
```

---

### Problema 7: MEDICAL INFO SECTION DESCONECTADA
**Severidade:** 🔴 ALTA

**Descrição:**
`MedicalInfoSection` (aba Medical) é um componente separado que:
- Busca dados de `/api/profile/medical`
- Salva via POST `/api/profile/medical`
- **NÃO sincroniza** com HealthTab do ProfileTabs

**Impacto:**
- Dados médicos em **2 lugares diferentes**
- Edições em Medical **não refletem** em Profile > Health
- Duplicação e inconsistência

**Solução:**
```typescript
// CONSOLIDAR em uma única fonte:
// Opção A: Remover aba "Medical" separada, mover tudo para HealthTab
// Opção B: Medical aba usa ProfileTabs/HealthTab internamente
// Opção C: Sincronização automática entre os dois
```

---

### Problema 8: RACE GOALS DUPLICADOS
**Severidade:** 🟡 MÉDIA

**Descrição:**
Campos de corrida alvo existem em **2 lugares**:
1. `AthleteProfile`: goalDistance, targetRaceDate, targetTime
2. `RaceGoal`: distance, raceDate, targetTime (+ raceName, priority, etc)

**Impacto:**
- Duplicação de dados
- Pode ficar inconsistente
- Confusão sobre qual usar

**Solução:**
```typescript
// DECISÃO ARQUITETURAL:
// AthleteProfile.goalDistance/targetRaceDate/targetTime = DEPRECADOS
// Usar APENAS RaceGoal (tabela dedicada)
// 
// Migração:
// 1. Criar migration para mover dados de AthleteProfile → RaceGoal
// 2. Marcar campos como @deprecated no schema
// 3. Remover referências no código (usar apenas raceGoals)
```

---

### Problema 9: CAMPOS ANTIGOS CONFLITANTES
**Severidade:** 🟡 MÉDIA

**Descrição:**
Existem campos antigos que **conflitam** com novos:
- `injuries` (Json?) vs `injuryDetails` (Json?)
- `injuryHistory` (String?) vs `injuryDetails` (Json?)
- `weeklyAvailability` (Int?) vs `trainingSchedule` (Json?)
- `trainingActivities` (Json?) vs `trainingSchedule` (Json?)

**Impacto:**
- Código confuso (qual campo usar?)
- Dados podem estar em múltiplos campos
- Migrações incompletas

**Solução:**
```typescript
// LIMPEZA DE SCHEMA:
// 1. Criar migration de consolidação:
//    - injuries + injuryHistory → injuryDetails (formato final)
//    - weeklyAvailability + trainingActivities → trainingSchedule
// 2. Marcar campos antigos como @deprecated
// 3. Remover em v3.1.0 após 1 mês
```

---

### Problema 10: OTHER SPORTS YEARS NÃO EXIBIDO
**Severidade:** 🟢 BAIXA

**Descrição:**
`otherSportsYears` é coletado no onboarding mas **não aparece** no PerformanceTab

**Impacto:**
- Dado perdido, não editável
- Contexto incompleto sobre experiência atlética

**Solução:**
```typescript
// Adicionar em PerformanceTab, seção "Outros Esportes":
// - otherSportsExperience (já existe)
// - otherSportsYears (ADICIONAR: input number)
```

---

### Problema 11: MAX HEART RATE NÃO USADO
**Severidade:** 🟢 BAIXA

**Descrição:**
`maxHeartRate` existe no schema mas:
- Não é coletado no onboarding
- Não aparece no perfil
- Não é usado pela IA

**Impacto:**
- Campo inútil ocupando espaço
- Ou falta implementação

**Solução:**
```typescript
// DECISÃO:
// Opção A: Calcular automaticamente (220 - idade)
// Opção B: Permitir override manual em BasicDataTab
// Opção C: Remover do schema se não for usado
```

---

### Problema 12: PREFERRED START DATE NÃO USADO
**Severidade:** 🟢 BAIXA

**Descrição:**
`preferredStartDate` existe mas não é usado em lugar nenhum

**Impacto:**
- Campo morto no banco

**Solução:**
```typescript
// REMOVER do schema ou IMPLEMENTAR funcionalidade
// Se implementar: usuário escolhe quando começar o plano
```

---

### Problema 13: EXPERIÊNCIA DESCRIPTION/ANALYSIS OCULTOS
**Severidade:** 🟡 MÉDIA

**Descrição:**
- `experienceDescription` - Usuário descreve experiência em texto livre
- `experienceAnalysis` - IA analisa essa descrição

Esses campos são VALIOSOS mas estão ocultos

**Impacto:**
- Usuário não vê análise da IA sobre sua experiência
- Dados ricos não aproveitados visualmente

**Solução:**
```typescript
// Adicionar em PerformanceTab:
// Card colapsável "📝 Sua Experiência de Corrida"
// - experienceDescription (textarea editável)
// - "Análise da IA" (experienceAnalysis, read-only, estilo destacado)
```

---

### Problema 14: PREFERENCES TAB INCOMPLETO
**Severidade:** 🟡 MÉDIA

**Descrição:**
PreferencesTab tem idioma e unidades, mas falta:
- Notificações (email, push, SMS)
- Tema (dark/light/auto)
- Privacidade (compartilhar treinos, perfil público)

**Impacto:**
- Aba de preferências incompleta
- Funcionalidades faltantes

**Solução:**
```typescript
// Expandir PreferencesTab:
// 
// Seção "🔔 Notificações"
// - Email (checkbox)
// - Push (checkbox)
// - SMS (checkbox)
// 
// Seção "🎨 Aparência"
// - Tema: Light | Dark | Auto (radio buttons)
// 
// Seção "🔒 Privacidade"
// - Perfil público (checkbox)
// - Compartilhar treinos (checkbox)
```

---

### Problema 15: AI FIELD TRACKING NÃO ESTÁ CONECTADO
**Severidade:** 🔴 ALTA

**Descrição:**
Sistema de transparência de IA (v2.8.0) está implementado, mas:
- Componentes `AIFieldIcon` e `AIFieldStatus` estão nas abas
- Mas não há tracking REAL de quais campos a IA usou
- `useFieldAnalysis()` retorna dados estáticos/mockados

**Impacto:**
- Indicadores de IA não refletem realidade
- Usuário vê semáforos mas não são precisos

**Solução:**
```typescript
// Conectar tracking real:
// 1. Em ai-plan-generator.ts, registrar cada campo usado
// 2. Salvar em ai_field_usage após cada geração
// 3. useFieldAnalysis() buscar dados reais do banco
// 4. Atualizar indicadores dinamicamente
```

---

## 📊 ESTATÍSTICAS DE CONVERGÊNCIA

### Campos no Database (AthleteProfile)
- **Total:** 47 campos
- **Usados pela IA:** ~30 campos (64%)
- **Exibidos no Perfil:** ~25 campos (53%)
- **Editáveis no Perfil:** ~20 campos (43%)
- **Campos perdidos:** ~22 campos (47%)

### Gap de Convergência
```
Coletado no Onboarding: 40 campos (85%)
        ↓ (gap 32%)
Exibido no Perfil: 25 campos (53%)
        ↓ (gap 11%)
Usado pela IA: 30 campos (64%)
```

### Duplicações Identificadas
1. restingHeartRate, sleepQuality, stressLevel (2 abas)
2. goalDistance, targetRaceDate, targetTime (2 tabelas)
3. injuries vs injuryDetails (2 campos)
4. weeklyAvailability vs trainingSchedule (2 campos)
5. Medical tab vs HealthTab (2 componentes)

---

## 🎯 PLANO DE CORREÇÃO TOTAL

### FASE 1: LIMPEZA DE DUPLICAÇÕES (Prioridade CRÍTICA)
**Tempo estimado:** 4-6 horas

#### 1.1. Consolidar Dados Fisiológicos
- [ ] REMOVER restingHeartRate, sleepQuality, stressLevel de HealthTab
- [ ] MANTER apenas em BasicDataTab
- [ ] Adicionar link em HealthTab: "Ver dados fisiológicos em Dados Básicos"

#### 1.2. Deprecar Campos Antigos
- [ ] Criar migration: injuries + injuryHistory → injuryDetails
- [ ] Criar migration: weeklyAvailability + trainingActivities → trainingSchedule
- [ ] Marcar campos antigos como `@deprecated` no schema
- [ ] Atualizar código para usar apenas campos novos

#### 1.3. Consolidar Race Goals
- [ ] Criar migration: AthleteProfile.goalDistance/targetRaceDate/targetTime → RaceGoal
- [ ] Marcar campos como deprecated
- [ ] Atualizar código para buscar apenas de RaceGoal

#### 1.4. Unificar Medical Info
- [ ] DECISÃO: Remover aba "Medical" separada
- [ ] Mover toda funcionalidade para HealthTab expandida
- [ ] Remover MedicalInfoSection component

---

### FASE 2: ADICIONAR CAMPOS PERDIDOS (Prioridade ALTA)
**Tempo estimado:** 8-10 horas

#### 2.1. Expandir PerformanceTab
- [ ] Adicionar seção "📊 Análise de Performance":
  - [ ] Card VDOT atual (destaque)
  - [ ] Tabela usualPaces (5 zonas)
  - [ ] recentLongRunPace
  - [ ] lastVDOTUpdate
- [ ] Adicionar seção "📝 Sua Experiência":
  - [ ] experienceDescription (textarea editável)
  - [ ] experienceAnalysis (read-only, card colapsável)
- [ ] Adicionar campo:
  - [ ] otherSportsYears (input number)

#### 2.2. Expandir HealthTab
- [ ] Adicionar seção "🏥 Informações Médicas Detalhadas":
  - [ ] medicalConditions (textarea)
  - [ ] medications (textarea)
  - [ ] physicalRestrictions (textarea)
- [ ] Melhorar seção de lesões:
  - [ ] injuryRecoveryStatus (select por lesão)
  - [ ] lastInjuryDate (date picker por lesão)
- [ ] Adicionar seção "🏃 Perfil de Corredor v3.0.0":
  - [ ] hasRunBefore (checkbox)
  - [ ] currentlyInjured (checkbox)
  - [ ] avgSleepHours (input number)
  - [ ] tracksMenstrualCycle (checkbox, if female)
  - [ ] avgCycleLength (input, if tracking)
  - [ ] lastPeriodDate (date, if tracking)
  - [ ] workDemand (select)
  - [ ] familyDemand (select)

#### 2.3. Expandir GoalsTab
- [ ] Visualizar motivationFactors completo:
  - [ ] primary (destaque)
  - [ ] secondary (badges)
  - [ ] goals (checkboxes múltiplos editáveis)
- [ ] Manter motivation string como "notas pessoais"

#### 2.4. Tornar AvailabilityTab Totalmente Editável
- [ ] Para cada dia da semana:
  - [ ] Checkbox "Corrida" (já existe)
  - [ ] Multi-select "Outras Atividades"
  - [ ] Input "Adicionar atividade customizada"
  - [ ] Botão "X" para remover atividade
- [ ] Salvar em trainingSchedule completo
- [ ] Aplicar auto-adjust automaticamente

#### 2.5. Expandir PreferencesTab
- [ ] Adicionar seção "🔔 Notificações":
  - [ ] Email (checkbox)
  - [ ] Push (checkbox)
  - [ ] SMS (checkbox)
- [ ] Adicionar seção "🎨 Aparência":
  - [ ] Tema: Light | Dark | Auto
- [ ] Adicionar seção "🔒 Privacidade":
  - [ ] Perfil público (checkbox)
  - [ ] Compartilhar treinos (checkbox)

---

### FASE 3: CONECTAR AI TRACKING (Prioridade ALTA)
**Tempo estimado:** 4-6 horas

#### 3.1. Implementar Tracking Real
- [ ] Em `ai-plan-generator.ts`, adicionar logging:
  ```typescript
  await trackFieldUsage(userId, 'age', true);
  await trackFieldUsage(userId, 'weight', true);
  // ... para cada campo usado
  ```
- [ ] Salvar em `ai_field_usage` tabela
- [ ] Timestamp de última geração

#### 3.2. Conectar useFieldAnalysis()
- [ ] Buscar dados reais de `ai_field_usage`
- [ ] Retornar status real (used/not_used/pending)
- [ ] Calcular última vez que foi usado
- [ ] Cache para performance

#### 3.3. Atualizar Indicadores
- [ ] AIFieldStatus reflete dados reais
- [ ] Semáforo 🟢🔴⚪ preciso
- [ ] Tooltip com data da última vez usado

---

### FASE 4: VALIDAÇÃO E TESTES (Prioridade MÉDIA)
**Tempo estimado:** 4-6 horas

#### 4.1. Testes Manuais
- [ ] Criar novo usuário
- [ ] Completar onboarding
- [ ] Verificar TODOS os campos no perfil
- [ ] Editar cada aba
- [ ] Gerar novo plano
- [ ] Verificar IA recebeu todos os dados

#### 4.2. Testes Automatizados
- [ ] Teste E2E: Onboarding → Perfil → IA
- [ ] Teste unitário: Cada aba salva corretamente
- [ ] Teste de integração: Dados persistem

#### 4.3. Auditoria Final
- [ ] Verificar zero duplicações
- [ ] Verificar zero campos perdidos
- [ ] Verificar convergência 100%
- [ ] Documentar mudanças

---

### FASE 5: DOCUMENTAÇÃO E DEPLOY (Prioridade BAIXA)
**Tempo estimado:** 2-3 horas

#### 5.1. Atualizar Documentação
- [ ] Atualizar CONTEXTO.md
- [ ] Atualizar README.md
- [ ] Criar MIGRATION_GUIDE_v3.1.0.md
- [ ] Atualizar CHANGELOG.md

#### 5.2. Migration Segura
- [ ] Backup do banco de produção
- [ ] Testar migration em staging
- [ ] Deploy com rollback plan
- [ ] Monitorar logs por 24h

---

## 📈 MÉTRICAS ESPERADAS PÓS-CORREÇÃO

### Antes (Atual)
```
Campos coletados: 40/47 (85%)
Campos exibidos: 25/47 (53%)  🔴
Campos editáveis: 20/47 (43%) 🔴
Campos usados IA: 30/47 (64%)
Duplicações: 5
Gap convergência: 32%  🔴
```

### Depois (Meta)
```
Campos coletados: 47/47 (100%) ✅
Campos exibidos: 45/47 (96%)   ✅ (exceto internos)
Campos editáveis: 43/47 (91%)  ✅ (exceto auto-calculados)
Campos usados IA: 45/47 (96%)  ✅
Duplicações: 0                 ✅
Gap convergência: 4%           ✅
```

### Melhoria
- **+13 campos** exibidos (+52%)
- **+23 campos** editáveis (+115%)
- **+15 campos** usados IA (+50%)
- **-5 duplicações** (-100%)
- **-28% gap** de convergência

---

## 🎯 RESUMO EXECUTIVO PARA IMPLEMENTAÇÃO

### O QUE FAZER PRIMEIRO (Ordem de Prioridade)

**🔴 CRÍTICO (Fazer Imediatamente):**
1. Remover duplicação de campos fisiológicos (restingHR, sleep, stress)
2. Adicionar campos v3.0.0 no HealthTab
3. Tornar AvailabilityTab totalmente editável
4. Conectar AI tracking real
5. Unificar Medical Info

**🟡 IMPORTANTE (Fazer Esta Semana):**
6. Adicionar campos de performance perdidos (VDOT, paces, etc)
7. Expandir seção de lesões (recovery status, dates)
8. Completar GoalsTab (motivationFactors completo)
9. Deprecar e consolidar campos antigos

**🟢 DESEJÁVEL (Fazer Este Mês):**
10. Adicionar notificações e tema no PreferencesTab
11. Limpar campos mortos (preferredStartDate, maxHeartRate)
12. Melhorar visualização de experiência
13. Testes E2E completos

### Tempo Total Estimado
- **Crítico:** 20-24 horas (3 dias)
- **Importante:** 16-20 horas (2-3 dias)
- **Desejável:** 8-12 horas (1-2 dias)
- **TOTAL:** 44-56 horas (~1 semana de trabalho)

---

## ✅ CHECKLIST DE VALIDAÇÃO FINAL

Após implementação, validar:

- [ ] **Zero duplicações:** Nenhum campo em 2 lugares
- [ ] **Zero campos perdidos:** Tudo coletado é exibido
- [ ] **100% editável:** Usuário pode mudar tudo (exceto auto-calc)
- [ ] **IA recebe tudo:** Tracking mostra 100% dos campos usados
- [ ] **Sincronização:** Mudar em qualquer lugar reflete em todos
- [ ] **Consistência:** Mesmos dados em onboarding/perfil/IA
- [ ] **Performance:** Nenhuma query N+1, carregamento rápido
- [ ] **UX limpa:** Interface intuitiva, sem confusão
- [ ] **Documentação:** Tudo documentado e atualizado
- [ ] **Testes:** E2E passa, cobertura >80%

---

**Próximo Passo:** Revisar este documento e priorizar implementação.

**Data Auditoria:** 24/Nov/2025 17:50 UTC  
**Auditor:** Sistema de Análise de Convergência Athera Run  
**Status:** ✅ Auditoria Completa - Pronta para Implementação
