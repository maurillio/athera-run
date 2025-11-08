# Sessão de Correções - Onboarding v1.6.7
## Data: 08 de Novembro de 2025

---

## 🎯 PROBLEMAS IDENTIFICADOS

### 1. ❌ trainingActivities não sendo salvo
**Problema**: Usuário completava onboarding mas `trainingActivities` não era salvo no banco, causando erro ao tentar gerar plano.

**Causa Raiz**: 
- Step6 salvava apenas `trainingSchedule` (estrutura completa)
- Step7 tentava converter para `trainingActivities` (array de dias)
- API validava apenas `trainingActivities` como array
- Conversão não estava funcionando corretamente

### 2. ❌ Step5 com valores pré-selecionados
**Problema**: Ao escolher "Tenho corrida alvo", campos de distância e data já vinham preenchidos.

**Causa Raiz**: useEffect aplicava defaults mesmo para goalType='race'

### 3. ⚠️ Acentuação (Ex: Musculação → Musculacao)
**Status**: Pendente investigação
**Nota**: Código está correto com acentos. Pode ser problema de encoding do banco ou serialização JSON.

### 4. 📝 Traduções
**Status**: ✅ Verificado - traduções estão corretas no arquivo pt-BR.json

---

## ✅ CORREÇÕES APLICADAS

### Correção 1: Salvamento de trainingActivities

#### Arquivo: `/components/onboarding/v1.3.0/Step7Review.tsx`
```typescript
// ANTES (PROBLEMA)
const trainingActivities: number[] = [];
if (data.trainingSchedule) {
  Object.keys(data.trainingSchedule).forEach(dayIndex => {
    const schedule = data.trainingSchedule[parseInt(dayIndex)];
    if (schedule.running || schedule.activities?.length > 0) {
      trainingActivities.push(parseInt(dayIndex));
    }
  });
}

// DEPOIS (CORRIGIDO)
const trainingActivities: number[] = [];
if (data.trainingSchedule && typeof data.trainingSchedule === 'object') {
  Object.keys(data.trainingSchedule).forEach(dayIndex => {
    const schedule = data.trainingSchedule[parseInt(dayIndex)];
    // Adicionar dia se tem corrida OU outras atividades
    if (schedule && (schedule.running || (schedule.activities && schedule.activities.length > 0))) {
      trainingActivities.push(parseInt(dayIndex));
    }
  });
}

// Adicionados logs detalhados
console.log('🔄 [ONBOARDING] Conversão trainingSchedule → trainingActivities:', {
  trainingSchedule: data.trainingSchedule,
  trainingActivities,
  diasComAtividade: trainingActivities.length
});

// Payload agora inclui AMBOS
const profilePayload = {
  ...data,
  planStartDate: planStartDate || undefined,
  trainingActivities, // ✅ Array de dias
  trainingSchedule: data.trainingSchedule, // ✅ Estrutura completa
};
```

#### Arquivo: `/app/api/profile/create/route.ts`
```typescript
// ANTES
trainingActivities: Array.isArray(trainingActivities) ? trainingActivities : [],

// DEPOIS (MAIS ROBUSTO)
trainingActivities: Array.isArray(trainingActivities) && trainingActivities.length > 0 
  ? trainingActivities 
  : (trainingSchedule ? Object.keys(trainingSchedule).filter(day => {
      const sched = trainingSchedule[parseInt(day)];
      return sched && (sched.running || (sched.activities && sched.activities.length > 0));
    }).map(d => parseInt(d)) : []),
```

**Resultado**: Se `trainingActivities` vier vazio, extrai automaticamente de `trainingSchedule`.

#### Arquivo: `/app/api/plan/generate/route.ts`
```typescript
// ANTES (VALIDAÇÃO SIMPLES)
const activities = (profile.trainingActivities as any) || [];
const hasRunningDays = Array.isArray(activities) && activities.length > 0;

// DEPOIS (VALIDAÇÃO ROBUSTA)
let activities: any[] = [];
if (profile.trainingActivities) {
  activities = Array.isArray(profile.trainingActivities) 
    ? profile.trainingActivities 
    : (typeof profile.trainingActivities === 'object' 
        ? Object.values(profile.trainingActivities) 
        : []);
}

// Se ainda não tem atividades, tentar extrair de trainingSchedule
if (activities.length === 0 && profile.trainingSchedule) {
  const schedule = profile.trainingSchedule as any;
  if (typeof schedule === 'object') {
    activities = Object.keys(schedule)
      .filter(day => {
        const sched = schedule[parseInt(day)];
        return sched && (sched.running || (sched.activities && sched.activities.length > 0));
      })
      .map(d => parseInt(d));
  }
}

const hasRunningDays = activities.length > 0;

console.log('🔍 [AI PLAN] Validação de atividades:', {
  trainingActivities: profile.trainingActivities,
  trainingSchedule: profile.trainingSchedule,
  activities,
  hasRunningDays
});
```

**Resultado**: Suporta 3 formatos diferentes de dados + fallback automático.

---

### Correção 2: Step5 valores pré-selecionados

#### Arquivo: `/components/onboarding/v1.3.0/Step5Goals.tsx`
```typescript
// ANTES
useEffect(() => {
  if (goalType && goalType !== 'race') {
    // Aplica defaults...
  } else if (goalType === 'race') {
    // NÃO LIMPA NADA - mantém valores do usuário
  }
}, [goalType]);

// DEPOIS (MAIS EXPLÍCITO)
useEffect(() => {
  if (goalType === 'start' || goalType === 'fitness') {
    // Aplica defaults APENAS para objetivos abertos
    const config = GOAL_CONFIGS[goalType];
    if (!goalDistance) {
      setGoalDistance(config.defaults.goalDistance);
    }
    if (!targetRaceDate) {
      setTargetRaceDate(calculateFutureDate(config.defaults.weeksAhead));
    }
    setRaceName(''); // Limpa nome
  } else if (goalType === 'race') {
    // Para 'race', NÃO APLICA NADA - usuário preenche tudo
    // Apenas limpa se tinha defaults de outro goalType
    if (data.isOpenGoal) {
      setGoalDistance('');
      setTargetRaceDate('');
    }
  }
}, [goalType]);
```

**Resultado**: Campos só são preenchidos automaticamente para objetivos "Começar a correr" ou "Condicionamento".

---

## 🧪 TESTES NECESSÁRIOS

### Fluxo Completo do Onboarding
1. ✅ Login/Signup
2. ✅ Step 1 - Dados Básicos
3. ✅ Step 2 - Experiência
4. ✅ Step 3 - Performance
5. ✅ Step 4 - Saúde
6. ✅ **Step 5 - Objetivos**
   - Verificar que nada vem pré-selecionado ao escolher "Tenho corrida alvo"
   - Verificar que defaults são aplicados em "Começar a correr" e "Condicionamento"
7. ✅ **Step 6 - Disponibilidade**
   - Selecionar dias e atividades
   - Verificar que pode escolher múltiplas atividades no mesmo dia
8. ✅ **Step 7 - Revisão e Criação**
   - Verificar que mostra todas as atividades corretas
   - Verificar acentuação (Musculação, Natação, etc)
   - Clicar em "Finalizar e Criar Plano"
   - **CRÍTICO**: Verificar que NÃO dá erro de "trainingActivities faltando"
   - **CRÍTICO**: Verificar que plano é gerado automaticamente
   - Verificar loading com mensagens divertidas
   - Verificar redirecionamento para dashboard

### Validações no Banco
```sql
-- Verificar estrutura salva
SELECT 
  id,
  "userId",
  "trainingActivities",
  "trainingSchedule",
  "goalDistance",
  "targetRaceDate"
FROM athlete_profiles
ORDER BY "createdAt" DESC
LIMIT 1;
```

---

## 📊 ESTRUTURA DE DADOS

### trainingSchedule (JSON)
```json
{
  "0": {
    "running": true,
    "activities": []
  },
  "2": {
    "running": true,
    "activities": ["Musculação"]
  },
  "4": {
    "running": true,
    "activities": ["Musculação", "Yoga"]
  }
}
```

### trainingActivities (Array JSON)
```json
[0, 2, 4]
```

**Relação**: `trainingActivities` = dias onde `running === true` OU `activities.length > 0`

---

## 🚀 PRÓXIMAS MELHORIAS (não nesta sessão)

1. **Loading com mensagens divertidas** ✅ Já implementado, só precisa testar
2. **Início do plano inteligente** - Permitir usuário escolher data de início
3. **Visualização no perfil** - Mostrar atividades corretamente no perfil
4. **Encoding de acentos** - Investigar e corrigir se necessário
5. **Validação de campos no Step 4** - Garantir que dados fisiológicos aparecem só no Step 4

---

## 📝 COMMIT

```bash
git commit -m "fix(onboarding): corrige salvamento de trainingActivities e defaults do Step5

- Corrige conversão de trainingSchedule para trainingActivities no Step7
- Adiciona logs detalhados para debug da conversão
- Remove pré-seleção indevida de valores no Step5 (goalType=race)
- Melhora validação de trainingActivities na API de geração de plano
- Suporta tanto array quanto objeto JSON para trainingActivities
- Extrai atividades de trainingSchedule quando trainingActivities está vazio"
```

**Commit Hash**: bf15fd74
**Status**: ✅ Pushed para main

---

## 🔄 STATUS DO DEPLOY

- [ ] Build iniciado no Vercel
- [ ] Build concluído com sucesso
- [ ] Deploy em produção (atherarun.com)
- [ ] Testes E2E em produção

---

## 📞 PRÓXIMOS PASSOS

1. Aguardar deploy do Vercel
2. Testar fluxo completo em produção
3. Verificar logs da API para confirmar salvamento
4. Verificar geração automática do plano
5. Documentar quaisquer novos problemas encontrados
