# 📊 AUDITORIA COMPLETA DO GERADOR DE PLANOS

**Data:** 07/Nov/2025 17:53 UTC  
**Arquivos Analisados:**
- `/app/api/plan/generate/route.ts` (262 linhas)
- `/lib/ai-plan-generator.ts` (1503 linhas)

---

## ✅ CAMPOS USADOS CORRETAMENTE

### Dados Básicos
✅ runningLevel  
✅ goalDistance  
✅ targetRaceDate  
✅ currentWeeklyKm  
✅ longestRun  
✅ weight  
✅ height  
✅ age  
✅ gender  

### Disponibilidade
✅ **trainingActivities** - Linha 86, 123 (route.ts) / Linhas 32, 220-235 (ai-plan-generator.ts)  
✅ **longRunDay** - Linha 124 (route.ts) / Linhas 33, 233-235, 860-870 (ai-plan-generator.ts)  
✅ **hasGymAccess** - Linha 126 (route.ts) / Linha 61 (ai-plan-generator.ts)  
✅ **hasPoolAccess** - Linha 127 (route.ts) / Linha 62 (ai-plan-generator.ts)  

### Performance
✅ currentVDOT  
✅ targetTime  
✅ usualPaces  
✅ previousRaces (histórico)  
✅ raceGoals (múltiplas corridas)  

### Saúde e Feedback
✅ injuries  
✅ medicalConditions  
✅ athleteFeedback  
✅ currentPhysicalState  

---

## ❌ CAMPOS NÃO USADOS (MAS DEVIAM SER!)

### Na Interface AIUserProfile
❌ **bestTimes** - Não existe no tipo AIUserProfile  
❌ **otherSports** - Não existe no tipo AIUserProfile  
❌ **sleepQuality** - Não existe no tipo AIUserProfile  
❌ **stressLevel** - Não existe no tipo AIUserProfile  
❌ **hasTrackAccess** - Não existe no tipo AIUserProfile  
❌ **trainingPreferences** - Não existe no tipo AIUserProfile  
❌ **motivationFactors** - Não existe no tipo AIUserProfile  

### No AthleteProfile (Prisma)
Esses campos existem no banco mas NÃO são passados para o gerador:
- `bestTimes` (Json) - Melhores tempos do atleta
- `otherSportsExperience` (String) - Outros esportes praticados
- `otherSportsYears` (Int) - Anos de outros esportes
- `sleepQuality` (Int) - Qualidade do sono (1-5)
- `stressLevel` (Int) - Nível de estresse (1-5)
- `hasTrackAccess` (Boolean) - Acesso à pista
- `trainingPreferences` (Json) - Preferências de treino
- `motivationFactors` (Json) - Fatores de motivação

---

## 🔧 CORREÇÕES NECESSÁRIAS

### 1. Expandir AIUserProfile (HIGH PRIORITY)
Adicionar campos missing:
```typescript
export interface AIUserProfile {
  // ... campos existentes ...
  
  // Performance adicional
  bestTimes?: Array<{ distance: string; time: string; date?: Date }>;
  runningYears?: number;
  maxHeartRate?: number;
  recentLongRunPace?: string;
  restingHeartRate?: number;
  
  // Experiência Multiesportiva
  otherSportsExperience?: string;
  otherSportsYears?: number;
  
  // Saúde e Bem-estar
  sleepQuality?: number; // 1-5
  stressLevel?: number; // 1-5
  
  // Infraestrutura
  hasTrackAccess?: boolean;
  
  // Preferências
  trainingPreferences?: {
    location?: string[];
    preference?: string;
    groupTraining?: boolean;
    indoorOutdoor?: string;
  };
  motivationFactors?: {
    primary?: string;
    secondary?: string[];
    goals?: string[];
  };
}
```

### 2. Atualizar route.ts para passar novos campos (MEDIUM PRIORITY)
Adicionar no aiProfile (linha ~111):
```typescript
const aiProfile: AIUserProfile = {
  // ... campos existentes ...
  
  // Novos campos
  bestTimes: profile.bestTimes as any,
  runningYears: profile.runningYears ?? undefined,
  maxHeartRate: profile.maxHeartRate ?? undefined,
  recentLongRunPace: profile.recentLongRunPace ?? undefined,
  restingHeartRate: profile.restingHeartRate ?? undefined,
  otherSportsExperience: profile.otherSportsExperience ?? undefined,
  otherSportsYears: profile.otherSportsYears ?? undefined,
  sleepQuality: profile.sleepQuality ?? undefined,
  stressLevel: profile.stressLevel ?? undefined,
  hasTrackAccess: profile.hasTrackAccess ?? undefined,
  trainingPreferences: profile.trainingPreferences as any,
  motivationFactors: profile.motivationFactors as any,
};
```

### 3. Usar os dados no contexto da IA (LOW PRIORITY)
O buildComprehensiveContext já usa alguns dados.
Verificar se usa todos os novos campos.

---

## 📈 IMPACTO DAS CORREÇÕES

### Alta Prioridade
- **bestTimes**: IA pode calcular VDOT mais preciso
- **sleepQuality/stressLevel**: IA pode ajustar volume/intensidade
- **trainingPreferences**: IA pode respeitar preferências de local

### Média Prioridade
- **otherSports**: IA pode aproveitar base de outros esportes
- **hasTrackAccess**: IA pode sugerir treinos de pista
- **motivationFactors**: IA pode personalizar motivação

### Baixa Prioridade
- **runningYears**: Contexto adicional (já tem runningLevel)
- **maxHeartRate**: Contexto adicional (já tem restingHeartRate)
- **recentLongRunPace**: Contexto adicional (já tem usualPaces)

---

## 🎯 CONCLUSÃO

**Sistema está 70% convergente!**

✅ O que funciona:
- Dias de treino e longão são respeitados
- Infraestrutura básica (gym, pool) é usada
- Performance e histórico são considerados

❌ O que falta:
- 8 campos do perfil não são passados para IA
- IA não sabe sobre best times do atleta
- IA não considera qualidade de sono/estresse
- IA não sabe sobre outros esportes
- IA não respeita preferências de treino

**Próximo passo:** Sprint 2.2 - Implementar correções
