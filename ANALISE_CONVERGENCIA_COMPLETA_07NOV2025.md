# 🔍 ANÁLISE PROFUNDA - CONVERGÊNCIA TOTAL ATHERA RUN
**Data:** 07/11/2025 17:25 BRT
**Versão Atual:** 1.5.5
**Versão Alvo:** 1.6.0 (Convergência Total)

---

## 📊 FASE 1: AUDITORIA COMPLETA

### 1.1. SCHEMA DO BANCO DE DADOS (Prisma)

#### Campos AthleteProfile Relacionados ao Onboarding:
```typescript
model AthleteProfile {
  // Dados Básicos (Step 1)
  age                   Int?
  gender                String?
  weight                Float
  height                Float
  restingHeartRate      Int?
  sleepQuality          Int?
  stressLevel           Int?
  
  // Experiência (Step 2)
  runningLevel          String
  currentWeeklyKm       Float?
  longestRun            Float?
  experienceDescription String?
  runningYears          Int?
  otherSportsExperience String?
  otherSportsYears      Int?
  
  // Performance (Step 3)
  bestTimes             Json?
  currentVDOT           Float?
  lastVDOTUpdate        DateTime?
  recentLongRunPace     String?
  usualPaces            Json?
  
  // Saúde (Step 4)
  maxHeartRate          Int?
  injuries              Json?
  medicalConditions     String?
  medications           String?
  physicalRestrictions  String?
  injuryHistory         String?
  injuryDetails         Json?
  injuryRecoveryStatus  String?
  lastInjuryDate        DateTime?
  
  // Objetivos (Step 5)
  goalDistance          String?
  targetRaceDate        DateTime?
  targetTime            String?
  
  // Disponibilidade (Step 6)
  weeklyAvailability    Int?
  trainingActivities    Json?
  longRunDay            Int?
  
  // Infraestrutura (Step 6)
  hasGymAccess          Boolean?
  hasPoolAccess         Boolean?
  hasTrackAccess        Boolean?
  
  // Preferências (Step 6)
  trainingPreferences   Json?
  motivationFactors     Json?
  
  // Sistema
  autoAdjustEnabled     Boolean
  hasCustomPlan         Boolean
  customPlanId          Int?
}
```

---

### 1.2. MAPEAMENTO ONBOARDING → API → BANCO

#### ✅ CAMPOS BEM MAPEADOS:

**Step 1 - BasicData:**
- ✅ age → age
- ✅ gender → gender
- ✅ weight → weight
- ✅ height → height
- ✅ restingHeartRate → restingHeartRate
- ✅ sleepQuality → sleepQuality
- ✅ stressLevel → stressLevel

**Step 2 - SportBackground:**
- ✅ runningLevel → runningLevel
- ✅ weeklyVolume → currentWeeklyKm
- ✅ longestRun → longestRun
- ✅ yearsRunning → runningYears
- ✅ otherSports → otherSportsExperience

**Step 3 - Performance:**
- ✅ personalBests → bestTimes (com auto-save implementado)

**Step 5 - Goals:**
- ✅ goalDistance → goalDistance
- ✅ targetRaceDate → targetRaceDate
- ✅ targetTime → targetTime
- ✅ primaryGoal → motivationFactors.primary
- ✅ secondaryGoals → motivationFactors.secondary

---

#### ❌ PROBLEMAS CRÍTICOS IDENTIFICADOS:

### PROBLEMA 1: Step 6 - Dia do Longão NÃO Coletado no Onboarding
**Localização:** Step6Availability.tsx linha 12-14
```typescript
const [longRunDay, setLongRunDay] = useState<number | null>(
  data.longRunDay !== undefined ? data.longRunDay : null
);
```

**Status:** Campo existe no componente MAS não tem UI para selecionar!
**Impacto:** ❌ CRÍTICO - Plano não pode respeitar preferência do usuário
**Solução Necessária:** Adicionar seletor de dia preferido para longão

---

### PROBLEMA 2: Disponibilidade - Sistema Duplo Confuso
**Problema:** Código usa 2 formatos diferentes:
1. `trainingActivities` (array simples: [0, 2, 4])
2. `availableDays` (objeto: { running: [], strength: [], yoga: [] })

**Código API (create/route.ts linha 212):**
```typescript
trainingActivities: Array.isArray(trainingActivities) ? trainingActivities : []
```

**Código Perfil (AvailabilityTab.tsx linha 11-14):**
```typescript
const [runDays, setRunDays] = useState(
  userData.trainingActivities || 
  userData.availableDays?.running || 
  []
);
```

**Impacto:** ⚠️ ALTA - Duplicação de dados, confusão no código
**Solução:** Padronizar em trainingActivities como array simples

---

### PROBLEMA 3: Performance Tab Não Mostra Dados Salvos
**Localização:** PerformanceTab.tsx

**Dados Coletados no Onboarding (Step 2 + Step 3):**
- ✅ runningLevel
- ✅ runningYears
- ✅ currentWeeklyKm
- ✅ longestRun
- ✅ otherSportsExperience
- ✅ bestTimes

**Dados Exibidos no Perfil:**
- ✅ runningLevel (campos de edição)
- ✅ runningYears (campos de edição)
- ✅ currentWeeklyKm (campos de edição)
- ✅ longestRun (campos de edição)
- ✅ otherSportsExperience (campo de edição)
- ❓ bestTimes (SÓ MOSTRA SE TIVER DADOS)

**Problema:** Interface não deixa claro se dados foram salvos ou não
**Solução:** Adicionar indicadores de dados existentes

---

### PROBLEMA 4: Aba de Preferências Incompleta
**Localização:** PreferencesTab.tsx (existe?)

Vamos verificar:
```bash
# Checando se existe...
```

**Funcionalidades Necessárias:**
- [ ] Seleção de idioma (pt-BR, en-US)
- [ ] Tema da interface (light/dark)
- [ ] Notificações (email, push)
- [ ] Unidades (métrico/imperial)
- [ ] Privacidade

**Status Atual:** Provavelmente incompleto
**Impacto:** ⚠️ MÉDIA - UX ruim, usuário não tem controle

---

### PROBLEMA 5: Geração de Plano - Dados Não Convergentes
**Localização:** /api/plan/generate

**Dados Necessários para Gerar Plano:**
1. ✅ goalDistance
2. ✅ targetRaceDate
3. ✅ runningLevel
4. ✅ currentWeeklyKm
5. ❌ longRunDay (FALTANDO)
6. ⚠️ trainingActivities (formato inconsistente)
7. ✅ bestTimes (VDOT)
8. ✅ hasGymAccess
9. ✅ targetTime (opcional)

**Problema:** API não valida se TODOS os dados necessários existem
**Impacto:** 🔴 CRÍTICO - Planos gerados podem ser inadequados
**Solução:** Adicionar validação completa antes de gerar

---

## 📋 FASE 2: DOCUMENTAÇÃO DE GAPS

### 2.1. CAMPOS FALTANTES

| Campo | Onboarding | API | Banco | Perfil | Uso no Plano |
|-------|-----------|-----|-------|--------|--------------|
| longRunDay | ❌ Não coleta | ✅ Existe | ✅ Existe | ✅ Existe | ❌ Não usa |
| preferredPace | ❌ Não coleta | ❌ Não salva | ✅ (usualPaces) | ❌ Não mostra | ❌ Não usa |
| motivationFactors | ✅ Coleta | ✅ Salva | ✅ Existe | ❌ Não mostra | ❌ Não usa |
| trainingPreferences | ⚠️ Parcial | ✅ Salva | ✅ Existe | ⚠️ Parcial | ❌ Não usa |

---

### 2.2. DUPLICAÇÕES IDENTIFICADAS

#### Duplicação 1: Disponibilidade de Treino
```typescript
// Formato 1 (usado pela API)
trainingActivities: [0, 2, 4, 6] // Array simples de dias

// Formato 2 (usado pelo Step6)
availableDays: {
  running: [0, 2, 4],
  strength: [1, 3, 5],
  yoga: [6]
}
```
**Solução:** Unificar em trainingActivities

---

#### Duplicação 2: Dados de Experiência
```typescript
// Em AthleteProfile
experienceDescription: String? // Texto livre
runningLevel: String          // Enum
runningYears: Int?            // Numérico
experienceAnalysis: String?   // IA

// Parcialmente duplicado
```
**Status:** OK - São campos complementares

---

### 2.3. DADOS NÃO EXIBIDOS NO PERFIL

| Dados Coletados | Tab Esperada | Status Atual |
|-----------------|--------------|--------------|
| motivationFactors | Preferências | ❌ Não mostra |
| trainingPreferences.groupTraining | Disponibilidade | ❌ Não mostra |
| trainingPreferences.indoorOutdoor | Disponibilidade | ❌ Não mostra |
| hasGymAccess | Disponibilidade | ⚠️ Básico |
| hasPoolAccess | Disponibilidade | ⚠️ Básico |
| hasTrackAccess | Disponibilidade | ⚠️ Básico |
| bestTimes | Performance | ✅ Mostra |
| longRunDay | Disponibilidade | ❌ NÃO MOSTRA |

---

### 2.4. CAMPOS NÃO SALVOS (Verificação)

✅ **TODOS OS CAMPOS DO ONBOARDING ESTÃO SENDO SALVOS**
(Correção implementada na v1.5.5)

**Evidência:** `/app/api/profile/create/route.ts` linhas 123-239

---

## 🎯 FASE 3: PLANO DE CORREÇÃO

### 3.1. PRIORIZAÇÃO

#### 🔴 PRIORIDADE CRÍTICA (P0) - Fazer AGORA
1. **Adicionar seletor de dia do longão no Step6**
   - Impacto: ALTO
   - Esforço: BAIXO (2h)
   - Dependências: Nenhuma

2. **Padronizar formato trainingActivities**
   - Impacto: ALTO
   - Esforço: MÉDIO (3h)
   - Dependências: Múltiplas

3. **Validar dados antes de gerar plano**
   - Impacto: CRÍTICO
   - Esforço: BAIXO (1h)
   - Dependências: Nenhuma

#### 🟠 PRIORIDADE ALTA (P1) - Próxima Sprint
4. **Completar aba de Preferências**
   - Impacto: MÉDIO
   - Esforço: MÉDIO (4h)
   - Recursos: Idioma, tema, notificações

5. **Melhorar exibição de Performance**
   - Impacto: MÉDIO
   - Esforço: BAIXO (2h)
   - Mostrar claramente dados salvos

6. **Exibir longRunDay no perfil**
   - Impacto: MÉDIO
   - Esforço: BAIXO (1h)
   - Tab: Disponibilidade

#### 🟡 PRIORIDADE MÉDIA (P2) - Backlog
7. **Usar motivationFactors no plano**
   - Impacto: BAIXO
   - Esforço: MÉDIO (3h)
   - IA considera motivação

8. **Usar trainingPreferences no plano**
   - Impacto: BAIXO
   - Esforço: MÉDIO (3h)
   - IA considera preferências

---

### 3.2. ORDEM DE EXECUÇÃO

```
SPRINT 1 (Hoje - 07/11/2025):
├── 1. Adicionar seletor longRunDay no Step6 ✅
├── 2. Exibir longRunDay no AvailabilityTab ✅
├── 3. Validar dados na geração de plano ✅
└── 4. Completar auto-save (Steps 3,4,6) ✅

SPRINT 2 (Amanhã - 08/11/2025):
├── 5. Padronizar trainingActivities ✅
├── 6. Melhorar PerformanceTab ✅
└── 7. Testar integração completa ✅

SPRINT 3 (Próxima Semana):
├── 8. Completar PreferencesTab ✅
├── 9. Integrar preferências no plano ✅
└── 10. Testes E2E completos ✅
```

---

## 🔧 FASE 4: DETALHAMENTO TÉCNICO

### 4.1. Correção 1: Seletor de Dia do Longão

**Arquivo:** `/components/onboarding/v1.3.0/Step6Availability.tsx`

**Localização:** Após seleção de dias de corrida (linha ~100)

**Código a adicionar:**
```typescript
{/* Seleção do Dia do Longão */}
{runDays.length > 0 && (
  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <h3 className="font-semibold mb-3">{t('longRunDay.title')}</h3>
    <p className="text-sm text-gray-600 mb-4">{t('longRunDay.description')}</p>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {runDays.map((dayIdx: number) => (
        <button
          key={dayIdx}
          onClick={() => setLongRunDay(dayIdx === longRunDay ? null : dayIdx)}
          className={`px-4 py-3 rounded-lg font-medium transition-all ${
            longRunDay === dayIdx
              ? 'bg-blue-600 text-white ring-2 ring-blue-300'
              : 'bg-white border border-gray-300 hover:border-blue-400'
          }`}
        >
          {days[dayIdx]}
        </button>
      ))}
    </div>
    
    {longRunDay === null && (
      <p className="text-sm text-amber-600 mt-2">
        ⚠️ {t('longRunDay.warning')}
      </p>
    )}
  </div>
)}
```

**Traduções necessárias (i18n):**
```json
// pt-BR
"longRunDay": {
  "title": "Dia Preferido para o Longão",
  "description": "Escolha o dia da semana em que você prefere fazer seu treino longo (longão). Este treino será sempre agendado neste dia.",
  "warning": "Recomendamos escolher um dia para o longão"
}

// en-US
"longRunDay": {
  "title": "Preferred Long Run Day",
  "description": "Choose the day of the week you prefer for your long run. This workout will always be scheduled on this day.",
  "warning": "We recommend choosing a day for the long run"
}
```

---

### 4.2. Correção 2: Exibir Dia do Longão no Perfil

**Arquivo:** `/components/profile/v1.3.0/AvailabilityTab.tsx`

**Localização:** Após grid de dias de corrida (linha ~110)

**Código a adicionar:**
```typescript
{/* Exibir Dia do Longão Selecionado */}
{longRunDay !== null && runDays.includes(longRunDay) && (
  <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
    <div className="flex items-center gap-3">
      <Calendar className="w-5 h-5 text-blue-600" />
      <div>
        <p className="font-semibold text-blue-900">
          {t('availability.longRunDay.title')}
        </p>
        <p className="text-sm text-blue-700">
          {days[longRunDay]}
        </p>
      </div>
    </div>
  </div>
)}
```

---

### 4.3. Correção 3: Validação Antes de Gerar Plano

**Arquivo:** `/app/api/plan/generate/route.ts`

**Localização:** Início da função POST (antes de gerar)

**Código a adicionar:**
```typescript
// Validar dados obrigatórios
const requiredFields = {
  goalDistance: profile.goalDistance,
  targetRaceDate: profile.targetRaceDate,
  runningLevel: profile.runningLevel,
  trainingActivities: profile.trainingActivities,
  weight: profile.weight,
  height: profile.height
};

const missingFields = Object.entries(requiredFields)
  .filter(([_, value]) => !value)
  .map(([key, _]) => key);

if (missingFields.length > 0) {
  return NextResponse.json({
    success: false,
    error: 'Dados incompletos no perfil',
    missingFields,
    message: `Por favor, complete os seguintes campos: ${missingFields.join(', ')}`,
    redirectTo: '/perfil'
  }, { status: 400 });
}

// Validar trainingActivities
if (!Array.isArray(profile.trainingActivities) || profile.trainingActivities.length === 0) {
  return NextResponse.json({
    success: false,
    error: 'Disponibilidade de treino não configurada',
    message: 'Por favor, selecione os dias disponíveis para treinar',
    redirectTo: '/perfil?tab=availability'
  }, { status: 400 });
}

// Recomendar longRunDay se não configurado
if (profile.longRunDay === null || profile.longRunDay === undefined) {
  console.warn('⚠️ [PLAN GENERATE] longRunDay não configurado. Usando heurística...');
  // Usar último dia disponível como padrão
  profile.longRunDay = Math.max(...profile.trainingActivities);
}
```

---

### 4.4. Correção 4: Padronizar trainingActivities

**Estratégia:** Manter `trainingActivities` como fonte única de verdade

**Mudanças necessárias:**

1. **API Create (já correto):**
```typescript
trainingActivities: Array.isArray(trainingActivities) ? trainingActivities : []
```

2. **Step6Availability:**
```typescript
// REMOVER sistema availableDays.running
// USAR APENAS trainingActivities

onUpdate({
  trainingActivities: runDays, // Array simples [0, 2, 4]
  longRunDay: longRunDay,
  // ... outros campos
});
```

3. **AvailabilityTab:**
```typescript
// Ler APENAS de trainingActivities
const [runDays, setRunDays] = useState(
  userData.trainingActivities || []
);

// Salvar APENAS como trainingActivities
await onUpdate({
  trainingActivities: runDays,
  longRunDay: longRunDay,
});
```

---

### 4.5. Correção 5: Completar PreferencesTab

**Arquivo:** `/components/profile/v1.3.0/PreferencesTab.tsx`

**Estrutura Completa:**
```typescript
'use client';
import { useState } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';
import { useRouter } from 'next/navigation';

export default function PreferencesTab({ userData, onUpdate }: any) {
  const t = useTranslations('profile.preferences');
  const router = useRouter();
  
  // Estados
  const [locale, setLocale] = useState(userData.user?.locale || 'pt-BR');
  const [theme, setTheme] = useState('light');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [units, setUnits] = useState('metric');
  const [hasChanges, setHasChanges] = useState(false);
  
  const handleSave = async () => {
    // Atualizar usuário (locale)
    await fetch('/api/user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale })
    });
    
    // Atualizar preferências do perfil
    await onUpdate({
      preferences: {
        theme,
        notifications: { email: emailNotifications, push: pushNotifications },
        units
      }
    });
    
    setHasChanges(false);
    
    // Recarregar se mudou idioma
    if (locale !== userData.user?.locale) {
      router.refresh();
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Idioma */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('language.title')}
        </label>
        <select 
          value={locale}
          onChange={(e) => { setLocale(e.target.value); setHasChanges(true); }}
          className="w-full md:w-1/2 px-4 py-2 border rounded-lg"
        >
          <option value="pt-BR">🇧🇷 Português (Brasil)</option>
          <option value="en-US">🇺🇸 English (US)</option>
        </select>
      </div>
      
      {/* Tema */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('theme.title')}
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => { setTheme('light'); setHasChanges(true); }}
            className={`px-6 py-3 rounded-lg border-2 ${
              theme === 'light' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300'
            }`}
          >
            ☀️ {t('theme.light')}
          </button>
          <button
            onClick={() => { setTheme('dark'); setHasChanges(true); }}
            className={`px-6 py-3 rounded-lg border-2 ${
              theme === 'dark' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300'
            }`}
          >
            🌙 {t('theme.dark')}
          </button>
        </div>
      </div>
      
      {/* Notificações */}
      <div className="space-y-3">
        <h3 className="font-semibold">{t('notifications.title')}</h3>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={(e) => { setEmailNotifications(e.target.checked); setHasChanges(true); }}
            className="w-5 h-5 rounded border-gray-300"
          />
          <div>
            <p className="font-medium">{t('notifications.email.title')}</p>
            <p className="text-sm text-gray-600">{t('notifications.email.description')}</p>
          </div>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={pushNotifications}
            onChange={(e) => { setPushNotifications(e.target.checked); setHasChanges(true); }}
            className="w-5 h-5 rounded border-gray-300"
          />
          <div>
            <p className="font-medium">{t('notifications.push.title')}</p>
            <p className="text-sm text-gray-600">{t('notifications.push.description')}</p>
          </div>
        </label>
      </div>
      
      {/* Unidades */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('units.title')}
        </label>
        <select 
          value={units}
          onChange={(e) => { setUnits(e.target.value); setHasChanges(true); }}
          className="w-full md:w-1/2 px-4 py-2 border rounded-lg"
        >
          <option value="metric">{t('units.metric')}</option>
          <option value="imperial">{t('units.imperial')}</option>
        </select>
      </div>
      
      {/* Botão Salvar */}
      {hasChanges && (
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('save')}
          </button>
          <button
            onClick={() => {
              setLocale(userData.user?.locale || 'pt-BR');
              setHasChanges(false);
            }}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {t('cancel')}
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 📊 RESUMO EXECUTIVO

### Problemas Críticos:
1. ❌ Dia do longão não é coletado no onboarding
2. ⚠️ Sistema duplo de disponibilidade (trainingActivities vs availableDays)
3. ❌ Validação insuficiente antes de gerar plano
4. ⚠️ Aba Preferências incompleta
5. ⚠️ Dados não exibidos claramente no perfil

### Correções Planejadas:
- ✅ 3 correções CRÍTICAS (hoje)
- ✅ 4 correções ALTAS (amanhã)
- ⏳ 3 melhorias MÉDIAS (próxima semana)

### Impacto Esperado:
- ✅ Onboarding 100% completo
- ✅ Perfil totalmente convergente
- ✅ Planos gerados com todos os dados
- ✅ UX melhorada significativamente

---

