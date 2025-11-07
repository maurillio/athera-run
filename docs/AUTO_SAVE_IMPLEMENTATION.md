# 💾 Auto-Save - Implementação Completa

## ✅ Status: IMPLEMENTADO E VALIDADO

### Estratégia de Auto-Save
Todos os steps críticos utilizam **debounce de 500ms** para salvar automaticamente os dados no estado global do formulário, sem necessidade de clicar em "Próximo".

---

## 📋 Steps com Auto-Save Implementado

### ✅ Step 1: Basic Data
**Dados salvos automaticamente**:
- `age`, `gender`, `weight`, `height`
- `restingHeartRate`, `sleepQuality`, `stressLevel`

**Implementação**:
```typescript
useEffect(() => {
  const timeoutId = setTimeout(() => {
    onUpdate({
      age: parseInt(age) || undefined,
      gender: gender || undefined,
      weight: parseFloat(weight) || undefined,
      height: parseFloat(height) || undefined,
      restingHeartRate: restingHeartRate ? parseInt(restingHeartRate) : undefined,
      sleepQuality,
      stressLevel,
    });
  }, 500); // Debounce de 500ms
  return () => clearTimeout(timeoutId);
}, [age, gender, weight, height, restingHeartRate, sleepQuality, stressLevel, onUpdate]);
```

---

### ✅ Step 2: Sport Background
**Dados salvos automaticamente**:
- `runningLevel`, `runningYears`, `currentWeeklyKm`, `longestRun`
- `experienceDescription`, `otherSportsExperience`, `otherSportsYears`

**Implementação**:
```typescript
useEffect(() => {
  const timeoutId = setTimeout(() => {
    onUpdate({
      runningLevel: level || 'beginner',
      runningYears: runYears ? parseInt(runYears) : undefined,
      currentWeeklyKm: weeklyKm ? parseFloat(weeklyKm) : undefined,
      longestRun: longestRun ? parseFloat(longestRun) : undefined,
      experienceDescription: experienceDesc || undefined,
      otherSportsExperience: otherSports || undefined,
      otherSportsYears: otherYears ? parseInt(otherYears) : undefined,
    });
  }, 500);
  return () => clearTimeout(timeoutId);
}, [level, runYears, weeklyKm, longestRun, experienceDesc, otherSports, otherYears, onUpdate]);
```

---

### ✅ Step 3: Performance (Melhores Tempos)
**Dados salvos automaticamente**:
- `bestTimes` - Dicionário de tempos com VDOT calculado

**Implementação**:
```typescript
useEffect(() => {
  const timeoutId = setTimeout(() => {
    onUpdate({ 
      bestTimes: Object.keys(bestTimes).length > 0 ? bestTimes : undefined 
    });
  }, 500);
  return () => clearTimeout(timeoutId);
}, [bestTimes, onUpdate]);
```

**Validação**: 
- ✅ Adicionar tempo → Auto-save em 500ms
- ✅ Remover tempo → Auto-save em 500ms
- ✅ VDOT calculado automaticamente

---

### ✅ Step 4: Health & Medical
**Dados salvos automaticamente**:
- `hasInjuryHistory`, `injuryHistory`, `medicalClearance`
- `restingHeartRate`, `sleepQuality`, `stressLevel`
- `injuryDetails`, `injuryRecoveryStatus`, `lastInjuryDate`

**Implementação**:
```typescript
useEffect(() => {
  const timeoutId = setTimeout(() => {
    onUpdate({
      hasInjuryHistory,
      injuryHistory: hasInjuryHistory && injuries.length > 0 ? injuries : undefined,
      medicalClearance: doctorCleared,
      restingHeartRate: restingHeartRate ? parseInt(restingHeartRate) : undefined,
      sleepQuality,
      stressLevel,
      injuryDetails: injuryDetails.length > 0 ? injuryDetails : undefined,
      injuryRecoveryStatus,
      lastInjuryDate: lastInjuryDate || undefined,
    });
  }, 500);
  return () => clearTimeout(timeoutId);
}, [hasInjuryHistory, injuries, doctorCleared, restingHeartRate, sleepQuality, stressLevel, injuryDetails, injuryRecoveryStatus, lastInjuryDate, onUpdate]);
```

**Validação**:
- ✅ Adicionar lesão → Auto-save
- ✅ Remover lesão → Auto-save
- ✅ Mudar clearance médico → Auto-save
- ✅ Ajustar sliders (sono/estresse) → Auto-save

---

### ✅ Step 5: Goals & Motivation
**Dados salvos automaticamente**:
- `primaryGoal`, `goalDistance`, `targetRaceDate`, `targetTime`
- `motivationFactors`

**Implementação**:
```typescript
useEffect(() => {
  const timeoutId = setTimeout(() => {
    console.log('📤 Step5Goals - Auto-saving:', {
      primaryGoal,
      goalDistance,
      targetRaceDate,
      targetTime
    });
    
    onUpdate({
      primaryGoal: primaryGoal || undefined,
      motivation: undefined, // Deprecated
      goalDistance: goalDistance || undefined,
      targetRaceDate: targetRaceDate || undefined,
      targetTime: targetTime || undefined,
      motivationFactors: {
        primary: primaryMotivation || 'saude',
        secondary: secondaryMotivations,
        goals: motivationGoals,
      },
    });
  }, 500);
  return () => clearTimeout(timeoutId);
}, [primaryGoal, goalDistance, targetRaceDate, targetTime, primaryMotivation, secondaryMotivations, motivationGoals, onUpdate]);
```

**⚠️ Campos Críticos**:
- `goalDistance` e `targetRaceDate` são **essenciais** para geração do plano
- Auto-save garante que mesmo sem clicar em "Próximo", os dados são salvos

**Validação**:
- ✅ Selecionar objetivo → Auto-save
- ✅ Escolher distância → Auto-save
- ✅ Definir data da prova → Auto-save
- ✅ Informar tempo alvo → Auto-save

---

### ✅ Step 6: Availability & Preferences
**Dados salvos automaticamente**:
- `availableDays` (running, gym, yoga, cycling, swimming)
- `longRunDay` - **Novo em v1.6.0**
- `hasGymAccess`, `hasPoolAccess`, `hasTrackAccess`
- `trainingPreferences` (locations, preferred, groupTraining, indoorOutdoor)

**Implementação**:
```typescript
useEffect(() => {
  const timeoutId = setTimeout(() => {
    const cleanOther = Object.fromEntries(
      Object.entries(otherActivities).filter(([_, days]: [string, any]) => days && days.length > 0)
    );

    console.log('📤 Step6 - Auto-saving:', {
      runDays,
      longRunDay,
      otherActivities: cleanOther
    });

    onUpdate({
      availableDays: {
        running: runDays.length > 0 ? runDays : undefined,
        ...cleanOther
      },
      longRunDay: longRunDay !== null ? longRunDay : undefined,
      hasGymAccess,
      hasPoolAccess,
      hasTrackAccess,
      trainingPreferences: {
        locations: trainingLocations,
        preferred: preferredLocation,
        groupTraining,
        indoorOutdoor,
      },
    });
  }, 500);
  return () => clearTimeout(timeoutId);
}, [runDays, longRunDay, otherActivities, hasGymAccess, hasPoolAccess, hasTrackAccess, trainingLocations, preferredLocation, groupTraining, indoorOutdoor, onUpdate]);
```

**⚠️ Dia do Longão**:
- Campo `longRunDay` é **essencial** para estruturação do plano
- Auto-save garante que o dia escolhido é salvo imediatamente

**Validação**:
- ✅ Selecionar dias de corrida → Auto-save
- ✅ Escolher dia do longão → Auto-save
- ✅ Marcar atividades complementares → Auto-save
- ✅ Selecionar infraestrutura → Auto-save
- ✅ Definir preferências → Auto-save

---

## 🎯 Fluxo Completo de Auto-Save

### Cenário 1: Usuário preenche tudo e avança normalmente
1. ✅ Dados são salvos automaticamente (debounce 500ms)
2. ✅ Ao clicar "Próximo", dados já estão no estado global
3. ✅ Step 7 (Review) recebe dados completos
4. ✅ Geração de plano usa todos os dados salvos

### Cenário 2: Usuário volta e edita steps anteriores
1. ✅ Dados editados são salvos automaticamente
2. ✅ Estado global é atualizado
3. ✅ Step 7 reflete as mudanças instantaneamente

### Cenário 3: Usuário fecha o navegador e volta depois
- ⚠️ **Limitação**: Auto-save funciona apenas em memória (não persiste no backend)
- 💡 **Solução futura**: Implementar `localStorage` ou salvar no backend a cada step

---

## 🔍 Validação em Produção

### Teste Realizado (atherarun.com)
1. ✅ Preencher Step 1 → Ir para Step 2 → Voltar → Dados preservados
2. ✅ Preencher Step 4 (lesões) → Ir para Step 5 → Voltar → Lesões preservadas
3. ✅ Preencher Step 6 (dias + longão) → Ir para Step 7 → Dados aparecem no Review
4. ✅ Editar Step 5 (data da prova) → Voltar para Step 7 → Data atualizada

**Resultado**: ✅ **Auto-save funcionando 100%**

---

## 📊 Impacto na UX

### Antes do Auto-Save
- ❌ Usuário precisava clicar em "Próximo" para salvar
- ❌ Dados podiam ser perdidos ao navegar entre steps
- ❌ Edições em steps anteriores exigiam re-clique em "Próximo"

### Depois do Auto-Save
- ✅ Dados salvos automaticamente (500ms após parar de digitar)
- ✅ Navegação livre entre steps sem perda de dados
- ✅ Edições refletidas imediatamente no Step 7 (Review)
- ✅ Melhor experiência para usuários que voltam para corrigir

---

## 🚀 Melhorias Futuras (Opcional)

### 1. Persistência no Backend (Nice to Have)
Salvar progresso do onboarding no banco de dados:
```typescript
useEffect(() => {
  const timeoutId = setTimeout(async () => {
    await fetch('/api/onboarding/draft', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  }, 2000); // Debounce maior para não sobrecarregar API
  return () => clearTimeout(timeoutId);
}, [formData]);
```

**Vantagens**:
- Usuário pode fechar navegador e continuar depois
- Dados preservados entre dispositivos (se logado)

**Desvantagem**:
- Complexidade adicional
- Custos de API (mais requests)

### 2. Indicador Visual de "Salvando..."
Adicionar feedback visual quando auto-save está ativo:
```tsx
{isSaving && (
  <div className="text-xs text-green-600 flex items-center gap-1">
    <Loader className="h-3 w-3 animate-spin" />
    Salvando automaticamente...
  </div>
)}
```

### 3. LocalStorage como Backup
Salvar no `localStorage` além do estado React:
```typescript
useEffect(() => {
  localStorage.setItem('athera_onboarding_draft', JSON.stringify(formData));
}, [formData]);
```

**Vantagem**: Simples de implementar
**Desvantagem**: Não funciona entre dispositivos

---

## ✅ Conclusão

**Status**: ✅ **AUTO-SAVE IMPLEMENTADO E VALIDADO**

- ✅ **Step 1**: Auto-save de dados básicos
- ✅ **Step 2**: Auto-save de background esportivo
- ✅ **Step 3**: Auto-save de tempos e VDOT
- ✅ **Step 4**: Auto-save de saúde e lesões
- ✅ **Step 5**: Auto-save de objetivos e data da prova
- ✅ **Step 6**: Auto-save de disponibilidade e dia do longão

**Debounce**: 500ms (balanceado entre UX e performance)

**Impacto na UX**: 🚀 **Melhoria significativa**
- Navegação fluida entre steps
- Sem perda de dados ao voltar
- Edições refletidas instantaneamente

**Sistema pronto para produção!** 🎉
