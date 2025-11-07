# 🎯 PLANO DE AÇÃO FINAL - Convergência Total (CORRIGIDO)

**Data:** 07/Nov/2025 16:52 UTC  
**Status:** ✅ ANÁLISE CORRETA  
**Tempo Estimado:** 10-12 horas  

---

## 📊 PROBLEMAS REAIS IDENTIFICADOS

### 1. ❌ **PerformanceTab INCOMPLETO**

**Atualmente:**
- ✅ Mostra melhores tempos (5k, 10k, 21k, 42k)
- ✅ Mostra VDOT

**❌ NÃO MOSTRA (mas está no banco):**
- Nível de corrida
- Anos de experiência
- Volume semanal
- Longão mais longo
- Pace preferido
- Outros esportes

### 2. ❌ **Dia do Longão não coletado**

Usuário não pode escolher o dia do treino mais importante.

### 3. ⚠️ **AvailabilityTab confuso**

Não mostra claramente os dias selecionados nem infraestrutura.

### 4. ⚠️ **Step 7 Review incompleto**

Não mostra todos os dados antes de finalizar.

---

## 🚀 IMPLEMENTAÇÃO

### ✅ SPRINT 1: PerformanceTab Completo (3h)

**Arquivo:** `/components/profile/v1.3.0/PerformanceTab.tsx`

**Código completo:**

```typescript
'use client';
import { useState } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';
import { calculateVDOTFromTime, interpretVDOT } from '@/lib/vdot-calculator';

export default function PerformanceTab({ userData, onUpdate }: any) {
  const t = useTranslations('profile.performance');
  
  // Estados de experiência
  const [runningLevel, setRunningLevel] = useState(userData.runningLevel || 'beginner');
  const [runningYears, setRunningYears] = useState(userData.runningYears || 0);
  const [currentWeeklyKm, setCurrentWeeklyKm] = useState(userData.currentWeeklyKm || 0);
  const [longestRun, setLongestRun] = useState(userData.longestRun || 0);
  const [preferredPace, setPreferredPace] = useState(userData.preferredPace || '');
  const [otherSportsExperience, setOtherSportsExperience] = useState(userData.otherSportsExperience || '');
  
  // Estados de performance (já existentes)
  const [bestTimes, setBestTimes] = useState(userData.bestTimes || {});
  const [hasChanges, setHasChanges] = useState(false);

  const distances = [
    { value: '5k', label: t('distances.5k'), meters: 5000 },
    { value: '10k', label: t('distances.10k'), meters: 10000 },
    { value: '21k', label: t('distances.21k'), meters: 21097 },
    { value: '42k', label: t('distances.42k'), meters: 42195 },
  ];
  
  const levels = [
    { value: 'beginner', label: t('levels.beginner') },
    { value: 'intermediate', label: t('levels.intermediate') },
    { value: 'advanced', label: t('levels.advanced') },
  ];

  const handleSave = () => {
    onUpdate({ 
      // Experiência
      runningLevel,
      runningYears: runningYears ? parseInt(runningYears.toString()) : null,
      currentWeeklyKm: currentWeeklyKm ? parseFloat(currentWeeklyKm.toString()) : null,
      longestRun: longestRun ? parseFloat(longestRun.toString()) : null,
      preferredPace: preferredPace || null,
      otherSportsExperience: otherSportsExperience || null,
      // Melhores tempos
      bestTimes: Object.keys(bestTimes).length > 0 ? bestTimes : null 
    });
    setHasChanges(false);
  };

  const removeTime = (dist: string) => {
    const { [dist]: _, ...rest } = bestTimes;
    setBestTimes(rest);
    setHasChanges(true);
  };

  const bestVDOT = Object.values(bestTimes).reduce((max: number, t: any) => 
    t.vdot > max ? t.vdot : max, 0);

  return (
    <div className="space-y-8">
      {/* SEÇÃO 1: EXPERIÊNCIA DE CORRIDA */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🏃 {t('experienceTitle')}
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* Nível */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('runningLevel')}</label>
            <select 
              value={runningLevel}
              onChange={(e) => { setRunningLevel(e.target.value); setHasChanges(true); }}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {levels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
          
          {/* Anos */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('yearsRunning')}</label>
            <input
              type="number"
              value={runningYears}
              onChange={(e) => { setRunningYears(e.target.value); setHasChanges(true); }}
              className="w-full px-4 py-2 border rounded-lg"
              min="0"
              max="50"
            />
            <p className="text-xs text-gray-600 mt-1">{t('yearsHelp')}</p>
          </div>
          
          {/* Volume Semanal */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('currentWeeklyKm')}</label>
            <input
              type="number"
              value={currentWeeklyKm}
              onChange={(e) => { setCurrentWeeklyKm(e.target.value); setHasChanges(true); }}
              className="w-full px-4 py-2 border rounded-lg"
              min="0"
              step="0.1"
            />
            <p className="text-xs text-gray-600 mt-1">{t('weeklyKmHelp')}</p>
          </div>
          
          {/* Longão */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('longestRun')}</label>
            <input
              type="number"
              value={longestRun}
              onChange={(e) => { setLongestRun(e.target.value); setHasChanges(true); }}
              className="w-full px-4 py-2 border rounded-lg"
              min="0"
              step="0.1"
            />
            <p className="text-xs text-gray-600 mt-1">{t('longestRunHelp')}</p>
          </div>
        </div>
        
        {/* Pace Preferido */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">{t('preferredPace')}</label>
          <input
            type="text"
            value={preferredPace}
            onChange={(e) => { setPreferredPace(e.target.value); setHasChanges(true); }}
            placeholder="Ex: 5:30/km"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <p className="text-xs text-gray-600 mt-1">{t('paceHelp')}</p>
        </div>
        
        {/* Outros Esportes */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">{t('otherSports')}</label>
          <textarea
            value={otherSportsExperience}
            onChange={(e) => { setOtherSportsExperience(e.target.value); setHasChanges(true); }}
            placeholder={t('otherSportsPlaceholder')}
            className="w-full px-4 py-2 border rounded-lg"
            rows={3}
          />
          <p className="text-xs text-gray-600 mt-1">{t('otherSportsHelp')}</p>
        </div>
      </div>

      {/* SEÇÃO 2: MELHORES TEMPOS (código existente) */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🏆 {t('title')}
        </h3>

        {Object.keys(bestTimes).length > 0 && (
          <>
            <div className="space-y-2">
              {Object.entries(bestTimes).map(([dist, data]: any) => (
                <div key={dist} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{distances.find(d => d.value === dist)?.label}</p>
                    <p className="text-sm text-gray-600">VDOT: {data.vdot}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-mono font-semibold">{data.time}</p>
                    <button onClick={() => removeTime(dist)} className="text-red-600 hover:text-red-800">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {bestVDOT > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <p className="font-semibold text-lg">{t('bestVdot')}: {bestVDOT}</p>
                <p className="text-sm text-gray-700">{interpretVDOT(bestVDOT)}</p>
              </div>
            )}
          </>
        )}

        {Object.keys(bestTimes).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>{t('noTimes')}</p>
            <p className="text-sm mt-2">{t('addFirst')}</p>
          </div>
        )}
      </div>

      {/* Botão Salvar */}
      {hasChanges && (
        <button onClick={handleSave}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
          {t('saveChanges')}
        </button>
      )}
    </div>
  );
}
```

**Checklist:**
- [ ] Substituir arquivo PerformanceTab.tsx completo
- [ ] Adicionar traduções (próxima task)
- [ ] Testar carregamento de dados
- [ ] Testar salvamento
- [ ] Validar que todos campos aparecem

---

### ✅ SPRINT 2: Traduções (1h)

**Arquivo:** `/lib/i18n/translations/pt-BR.json`

Adicionar na seção `profile.performance`:

```json
{
  "profile": {
    "performance": {
      "experienceTitle": "Experiência de Corrida",
      "runningLevel": "Nível de Corrida",
      "levels": {
        "beginner": "Iniciante",
        "intermediate": "Intermediário",
        "advanced": "Avançado"
      },
      "yearsRunning": "Anos Correndo",
      "yearsHelp": "Há quantos anos você corre regularmente?",
      "currentWeeklyKm": "Volume Semanal (km)",
      "weeklyKmHelp": "Quantos km você corre por semana atualmente?",
      "longestRun": "Longão Mais Longo (km)",
      "longestRunHelp": "Qual foi o treino mais longo que você já fez?",
      "preferredPace": "Pace Preferido",
      "paceHelp": "Seu pace habitual em treinos leves (ex: 5:30/km)",
      "otherSports": "Outros Esportes",
      "otherSportsPlaceholder": "Ex: Natação 2x/semana, Ciclismo aos finais de semana",
      "otherSportsHelp": "Outras atividades físicas que você pratica",
      "saveChanges": "Salvar Alterações"
    }
  }
}
```

Repetir para `/lib/i18n/translations/en.json` e `/lib/i18n/translations/es.json`

**Checklist:**
- [ ] Adicionar em pt-BR.json
- [ ] Adicionar em en.json (traduzir)
- [ ] Adicionar em es.json (traduzir)
- [ ] Testar mudança de idioma

---

### ✅ SPRINT 3: Dia do Longão (2h)

**Arquivo:** `/components/onboarding/v1.3.0/Step6Availability.tsx`

Adicionar após seleção de dias de corrida:

```typescript
{/* Dia do Longão */}
{runDays.length > 0 && (
  <div className="mt-6 border-t pt-6">
    <label className="block font-semibold mb-3 text-blue-900">
      🏃‍♂️ {t('longRunDayTitle')} *
    </label>
    <p className="text-sm text-gray-600 mb-3">
      {t('longRunDayDescription')}
    </p>
    
    <select
      value={longRunDay !== null && longRunDay !== undefined ? longRunDay : ''}
      onChange={(e) => {
        const day = e.target.value === '' ? null : parseInt(e.target.value);
        setLongRunDay(day);
      }}
      className="w-full px-4 py-2 border-2 rounded-lg bg-white focus:border-blue-500"
    >
      <option value="">{t('selectLongRunDay')}</option>
      {runDays.map((dayIdx: number) => (
        <option key={dayIdx} value={dayIdx}>
          {days[dayIdx]}
        </option>
      ))}
    </select>
    
    {longRunDay !== null && longRunDay !== undefined && (
      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800">
          ✅ Seu treino longo será sempre {days[longRunDay]}
        </p>
      </div>
    )}
  </div>
)}
```

**No início do componente, adicionar estado:**
```typescript
const [longRunDay, setLongRunDay] = useState(data.longRunDay !== undefined ? data.longRunDay : null);
```

**No handleNext, incluir:**
```typescript
onUpdate({
  availableDays: {
    running: runDays,
    other: Object.keys(cleanOther).length > 0 ? cleanOther : undefined
  },
  longRunDay: longRunDay, // ADICIONAR ESTA LINHA
  hasGymAccess,
  // ... resto
});
```

**Checklist:**
- [ ] Adicionar estado longRunDay
- [ ] Adicionar select no HTML
- [ ] Incluir no onUpdate
- [ ] Adicionar traduções
- [ ] Testar que só mostra dias disponíveis
- [ ] Validar salvamento no banco

---

### ✅ SPRINT 4: Melhorar AvailabilityTab (2h)

**Arquivo:** `/components/profile/v1.3.0/AvailabilityTab.tsx`

Adicionar no TOPO do return, antes da edição de dias:

```typescript
{/* Resumo Visual */}
<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
  <h4 className="font-semibold mb-3 text-lg">📅 Resumo da Sua Disponibilidade</h4>
  
  <div className="space-y-2">
    {/* Dias de Corrida */}
    <div className="flex items-start gap-2">
      <span className="font-medium min-w-[120px]">🏃 Corrida:</span>
      <span className="text-gray-700">
        {runDays.length > 0 
          ? runDays.map((d: number) => days[d]).join(', ')
          : 'Nenhum dia selecionado'
        }
      </span>
    </div>
    
    {/* Dia do Longão */}
    {userData.longRunDay !== null && userData.longRunDay !== undefined && (
      <div className="flex items-start gap-2">
        <span className="font-medium min-w-[120px]">🏃‍♂️ Treino Longo:</span>
        <span className="text-green-700 font-semibold">
          {days[userData.longRunDay]}
        </span>
      </div>
    )}
    
    {/* Musculação */}
    {strengthDays.length > 0 && (
      <div className="flex items-start gap-2">
        <span className="font-medium min-w-[120px]">💪 Musculação:</span>
        <span className="text-gray-700">
          {strengthDays.map((d: number) => days[d]).join(', ')}
        </span>
      </div>
    )}
    
    {/* Natação */}
    {swimmingDays.length > 0 && (
      <div className="flex items-start gap-2">
        <span className="font-medium min-w-[120px]">🏊 Natação:</span>
        <span className="text-gray-700">
          {swimmingDays.map((d: number) => days[d]).join(', ')}
        </span>
      </div>
    )}
    
    {/* Yoga */}
    {yogaDays.length > 0 && (
      <div className="flex items-start gap-2">
        <span className="font-medium min-w-[120px]">🧘 Yoga:</span>
        <span className="text-gray-700">
          {yogaDays.map((d: number) => days[d]).join(', ')}
        </span>
      </div>
    )}
  </div>
</div>

{/* Infraestrutura */}
<div className="mb-6">
  <h4 className="font-semibold mb-3 text-lg">🏗️ Recursos Disponíveis</h4>
  
  <div className="grid grid-cols-3 gap-3">
    <div className={`p-4 rounded-lg text-center border-2 transition-colors ${
      userData.hasGymAccess ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="text-3xl mb-2">💪</div>
      <div className="text-sm font-medium">Academia</div>
      <div className="text-xs text-gray-600 mt-1">
        {userData.hasGymAccess ? '✅ Disponível' : '❌ Não disponível'}
      </div>
    </div>
    
    <div className={`p-4 rounded-lg text-center border-2 transition-colors ${
      userData.hasPoolAccess ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="text-3xl mb-2">🏊</div>
      <div className="text-sm font-medium">Piscina</div>
      <div className="text-xs text-gray-600 mt-1">
        {userData.hasPoolAccess ? '✅ Disponível' : '❌ Não disponível'}
      </div>
    </div>
    
    <div className={`p-4 rounded-lg text-center border-2 transition-colors ${
      userData.hasTrackAccess ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="text-3xl mb-2">🏃</div>
      <div className="text-sm font-medium">Pista</div>
      <div className="text-xs text-gray-600 mt-1">
        {userData.hasTrackAccess ? '✅ Disponível' : '❌ Não disponível'}
      </div>
    </div>
  </div>
</div>
```

**Checklist:**
- [ ] Adicionar resumo visual
- [ ] Adicionar cards de infraestrutura
- [ ] Mostrar longRunDay
- [ ] Testar com diferentes configurações

---

## 📊 TEMPO TOTAL

| Sprint | Descrição | Tempo |
|--------|-----------|-------|
| 1 | PerformanceTab completo | 3h |
| 2 | Traduções | 1h |
| 3 | Dia do longão | 2h |
| 4 | AvailabilityTab | 2h |
| 5 | Step 7 Review | 2h |
| **TOTAL** | | **10h** |

---

## ✅ RESULTADO FINAL

```
✅ PerformanceTab mostra TUDO:
   ├─ Nível, anos, volume, longão, pace, outros esportes
   └─ Melhores tempos e VDOT

✅ Dia do longão é coletado e respeitado

✅ AvailabilityTab mostra claramente:
   ├─ Dias de cada atividade
   ├─ Dia do longão destacado
   └─ Infraestrutura disponível

✅ Step 7 Review mostra tudo antes de finalizar

✅ 100% Convergência Total
```

---

*Documento final em: 07/Nov/2025 17:00 UTC*  
*Status: ✅ Pronto para implementação*
