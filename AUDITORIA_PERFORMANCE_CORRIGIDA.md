# 🎯 AUDITORIA CORRIGIDA - Performance Tab

**Data:** 07/Nov/2025 16:47 UTC  
**Correção:** Performance (não Experiência)  
**Status:** ✅ ANÁLISE CORRETA

---

## 📊 SITUAÇÃO REAL

### ✅ O QUE JÁ EXISTE

**Abas do Perfil:**
1. ✅ BasicDataTab - Idade, gênero, peso, altura, FC, sono, estresse
2. ✅ PerformanceTab - **MAS SÓ mostra melhores tempos!**
3. ✅ HealthTab - Lesões e saúde
4. ✅ GoalsTab - Objetivos
5. ✅ AvailabilityTab - Disponibilidade
6. ✅ PreferencesTab - Preferências

---

## ❌ O QUE ESTÁ FALTANDO

### 🔴 CRÍTICO: PerformanceTab está INCOMPLETO

**Atualmente mostra apenas:**
- ✅ Melhores tempos (5k, 10k, 21k, 42k)
- ✅ VDOT calculado

**❌ NÃO MOSTRA (mas dados estão no banco):**
- ❌ Nível de corrida (iniciante/intermediário/avançado)
- ❌ Anos de experiência
- ❌ Volume semanal atual (km)
- ❌ Longão mais longo (km)
- ❌ Pace preferido
- ❌ Outros esportes

**Usuário reportou:** *"Nas experiências não mostra nada, mesmo preenchendo"*

**Causa:** Ele chamou de "experiências" mas está se referindo ao **PerformanceTab** que deveria mostrar toda a experiência de corrida mas só mostra PRs!

---

## 🎯 SOLUÇÃO CORRETA

### Opção 1: EXPANDIR PerformanceTab (RECOMENDADO)

Adicionar seções no PerformanceTab atual:

```typescript
export default function PerformanceTab({ userData, onUpdate }: any) {
  // ... código atual de bestTimes ...
  
  return (
    <div className="space-y-8">
      {/* NOVA SEÇÃO 1: Experiência de Corrida */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold mb-4">🏃 Experiência de Corrida</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nível</label>
            <select value={runningLevel} onChange={...} className="w-full px-4 py-2 border rounded-lg">
              <option value="beginner">Iniciante</option>
              <option value="intermediate">Intermediário</option>
              <option value="advanced">Avançado</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Anos Correndo</label>
            <input type="number" value={runningYears} ... />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Volume Semanal (km)</label>
            <input type="number" value={currentWeeklyKm} ... />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Longão Mais Longo (km)</label>
            <input type="number" value={longestRun} ... />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Pace Preferido</label>
          <input type="text" value={preferredPace} placeholder="Ex: 5:30/km" ... />
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Outros Esportes</label>
          <textarea value={otherSportsExperience} placeholder="Ex: Natação 2x/semana" rows={3} ... />
        </div>
      </div>
      
      {/* SEÇÃO EXISTENTE: Melhores Tempos */}
      <div>
        <h3 className="text-lg font-semibold mb-4">🏆 Melhores Tempos</h3>
        {/* ... código atual de bestTimes ... */}
      </div>
    </div>
  );
}
```

---

### Opção 2: CRIAR RunningExperienceTab separada

Criar nova aba entre Basic e Performance:

**Abas:**
1. Basic
2. **Running Experience** (NOVA)
3. Performance (melhores tempos)
4. Health
5. Goals
6. Availability
7. Preferences

---

## ✅ RECOMENDAÇÃO: **Opção 1 (Expandir PerformanceTab)**

**Por quê?**
- Todos os dados estão relacionados a performance/experiência
- Usuário não precisa navegar entre múltiplas abas
- Mais simples e intuitivo
- Já existe tab "Performance" então faz sentido expandir

---

## 🚀 IMPLEMENTAÇÃO PASSO A PASSO

### Task 1: Expandir PerformanceTab (3h)

**Arquivo:** `/components/profile/v1.3.0/PerformanceTab.tsx`

**Adicionar estados:**
```typescript
const [runningLevel, setRunningLevel] = useState(userData.runningLevel || 'beginner');
const [runningYears, setRunningYears] = useState(userData.runningYears || 0);
const [currentWeeklyKm, setCurrentWeeklyKm] = useState(userData.currentWeeklyKm || 0);
const [longestRun, setLongestRun] = useState(userData.longestRun || 0);
const [preferredPace, setPreferredPace] = useState(userData.preferredPace || '');
const [otherSportsExperience, setOtherSportsExperience] = useState(userData.otherSportsExperience || '');
```

**Atualizar handleSave:**
```typescript
const handleSave = () => {
  onUpdate({ 
    // Experiência
    runningLevel,
    runningYears: runningYears ? parseInt(runningYears) : null,
    currentWeeklyKm: currentWeeklyKm ? parseFloat(currentWeeklyKm) : null,
    longestRun: longestRun ? parseFloat(longestRun) : null,
    preferredPace: preferredPace || null,
    otherSportsExperience: otherSportsExperience || null,
    // Melhores tempos
    bestTimes: Object.keys(bestTimes).length > 0 ? bestTimes : null 
  });
  setHasChanges(false);
};
```

**Checklist:**
- [ ] Adicionar estados para todos os campos
- [ ] Adicionar seção "Experiência de Corrida" no topo
- [ ] Manter seção "Melhores Tempos" existente
- [ ] Atualizar handleSave para incluir todos os campos
- [ ] Adicionar traduções
- [ ] Testar carregamento
- [ ] Testar salvamento

---

### Task 2: Adicionar Dia do Longão (2h)

**Arquivo:** `/components/onboarding/v1.3.0/Step6Availability.tsx`

Adicionar campo para escolher dia do longão.

**Checklist:**
- [ ] Adicionar estado longRunDay
- [ ] Adicionar select com dias disponíveis
- [ ] Salvar no onUpdate
- [ ] Validar com Step 5 (não confundir com Step 6)

---

### Task 3: Melhorar AvailabilityTab (2h)

**Arquivo:** `/components/profile/v1.3.0/AvailabilityTab.tsx`

Adicionar resumo visual:
- Mostrar dias claramente
- Mostrar dia do longão
- Mostrar infraestrutura

**Checklist:**
- [ ] Adicionar resumo visual no topo
- [ ] Mostrar longRunDay se existir
- [ ] Mostrar hasGymAccess, hasPoolAccess, hasTrackAccess
- [ ] Testar visualização

---

### Task 4: Melhorar Step 7 Review (3h)

**Arquivo:** `/components/onboarding/v1.3.0/Step7Review.tsx`

Adicionar seções faltantes:
- Experiência de corrida completa
- Infraestrutura
- Dia do longão

---

## 📊 CAMPOS NO BANCO vs EXIBIÇÃO

| Campo | Onboarding Coleta | Salvo no Banco | PerformanceTab Mostra | Status |
|-------|-------------------|----------------|------------------------|--------|
| **EXPERIÊNCIA** |
| runningLevel | ✅ Step2 | ✅ | ❌ FALTA | 🔴 |
| runningYears | ✅ Step2 | ✅ | ❌ FALTA | 🔴 |
| currentWeeklyKm | ✅ Step2 | ✅ | ❌ FALTA | 🔴 |
| longestRun | ✅ Step2 | ✅ | ❌ FALTA | 🔴 |
| preferredPace | ✅ Step2 | ✅ | ❌ FALTA | 🔴 |
| otherSportsExperience | ✅ Step2 | ✅ | ❌ FALTA | 🔴 |
| **PERFORMANCE** |
| bestTimes | ✅ Step3 | ✅ | ✅ OK | ✅ |
| currentVDOT | 🤖 Calculado | ✅ | ✅ OK | ✅ |

---

## 🎯 PRIORIDADES CORRIGIDAS

### 🔥 FAZER HOJE (3h)
1. **Expandir PerformanceTab** com experiência de corrida

### ⚡ FAZER AMANHÃ (4h)
2. **Adicionar dia do longão** no Step 6
3. **Melhorar AvailabilityTab** com resumo visual

### 📅 FAZER DEPOIS (3h)
4. **Melhorar Step 7 Review** completo

---

## ✅ RESULTADO ESPERADO

**Após implementação:**

```
PerformanceTab mostrará:
├─ 🏃 Experiência de Corrida (NOVO)
│  ├─ Nível (iniciante/intermediário/avançado)
│  ├─ Anos correndo
│  ├─ Volume semanal
│  ├─ Longão mais longo
│  ├─ Pace preferido
│  └─ Outros esportes
│
└─ 🏆 Melhores Tempos (JÁ EXISTE)
   ├─ 5k, 10k, 21k, 42k
   └─ VDOT calculado
```

**Usuário verá:**
- ✅ TUDO que preencheu no onboarding
- ✅ Pode editar diretamente no perfil
- ✅ Mudanças sincronizam com banco
- ✅ Dados aparecem na geração de planos

---

*Documento corrigido em: 07/Nov/2025 16:50 UTC*  
*Correção: Performance não Experiência*  
*Status: ✅ Análise correta e acionável*
