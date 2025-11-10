# 🔍 Análise: Atividades Não Consideradas na Geração do Plano

**Data:** 10/11/2025  
**Problema:** Outras atividades (Musculação, Natação, etc.) não são consideradas no plano, dias sem corrida ficam como descanso.

---

## 📊 Diagnóstico Completo

### **1. Estrutura de Dados Salva no Perfil** ✅

O Step6 salva corretamente em `AthleteProfile.trainingSchedule`:

```typescript
{
  trainingSchedule: {
    0: { running: false, activities: [] },              // Domingo
    1: { running: true, activities: ['Musculação'] },   // Segunda - CORRIDA + MUSCULAÇÃO
    2: { running: true, activities: [] },               // Terça - CORRIDA
    3: { running: false, activities: ['Musculação', 'Natação'] }, // Quarta - MUSCULAÇÃO + NATAÇÃO
    4: { running: true, activities: ['Musculação'] },   // Quinta - CORRIDA + MUSCULAÇÃO
    5: { running: false, activities: [] },              // Sexta - DESCANSO
    6: { running: true, activities: [] }                // Sábado - CORRIDA (LONGÃO)
  },
  
  longRunDay: 6, // Sábado
  
  customActivities: ['crossfit'], // Esportes customizados
  
  hasGymAccess: true,
  hasPoolAccess: false,
  hasTrackAccess: false
}
```

**Status:** ✅ Dados salvos corretamente no banco

---

### **2. Problema na Rota `/api/plan/generate`** ❌

**Arquivo:** `/root/athera-run/app/api/plan/generate/route.ts`

#### Linha 76-87: Conversão Incorreta

```typescript
// Se ainda não tem atividades, tentar extrair de trainingSchedule
if (activities.length === 0 && profile.trainingSchedule) {
  const schedule = profile.trainingSchedule as any;
  if (typeof schedule === 'object') {
    activities = Object.keys(schedule)
      .filter(day => {
        const sched = schedule[parseInt(day)];
        return sched && (sched.running || (sched.activities && sched.activities.length > 0));
      })
      .map(d => parseInt(d)); // ❌ PROBLEMA: retorna só NÚMEROS dos dias
  }
}
```

**Resultado:**
```typescript
activities = [1, 2, 4, 6] // Apenas dias com corrida OU outras atividades
```

**Problema:** A conversão perde TODAS as informações das atividades!
- ❌ Não sabe QUAIS atividades tem em cada dia
- ❌ Não diferencia corrida de musculação
- ❌ Não diferencia dias com múltiplas atividades

---

#### Linha 187: Passa Array Incorreto para IA

```typescript
const aiProfile: AIUserProfile = {
  // ...
  trainingActivities: activities, // ❌ [1, 2, 4, 6] - apenas números!
  longRunDay: profile.longRunDay ?? undefined,
  // ...
}
```

**O que a IA recebe:**
```typescript
{
  trainingActivities: [1, 2, 4, 6], // ❌ ERRADO! Só números de dias
  longRunDay: 6
}
```

**O que a IA DEVERIA receber:**
```typescript
{
  trainingSchedule: {
    1: { running: true, activities: ['Musculação'] },
    2: { running: true, activities: [] },
    3: { running: false, activities: ['Musculação', 'Natação'] },
    4: { running: true, activities: ['Musculação'] },
    6: { running: true, activities: [] }
  },
  longRunDay: 6,
  customActivities: ['crossfit']
}
```

---

### **3. Problema no Gerador de IA** ❌

**Arquivo:** `/root/athera-run/lib/ai-plan-generator.ts`

#### Linha 248-260: Espera Estrutura Antiga

```typescript
// Disponibilidade
if (profile.trainingActivities && profile.trainingActivities.length > 0) {
  context += `\n## Disponibilidade e Preferências de Treino\n`;
  profile.trainingActivities.forEach((activity: any) => {
    if (activity.availableDays && activity.availableDays.length > 0) { // ❌ Estrutura antiga!
      const days = activity.availableDays.map((d: number) => 
        ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][d]
      ).join(', ');
      const time = activity.preferredTime === 'morning' ? 'Manhã' : 
                   activity.preferredTime === 'afternoon' ? 'Tarde' : 
                   activity.preferredTime === 'evening' ? 'Noite' : 'Flexível';
      context += `- ${activity.name}: ${days} (${time})\n`;
    }
  });
}
```

**Estrutura esperada (ANTIGA - v1.2.0):**
```typescript
trainingActivities: [
  {
    name: 'Corrida',
    availableDays: [1, 2, 4, 6],
    preferredTime: 'morning'
  },
  {
    name: 'Musculação',
    availableDays: [1, 3, 4],
    preferredTime: 'evening'
  }
]
```

**Estrutura atual (NOVA - v1.7.3):**
```typescript
trainingSchedule: {
  1: { running: true, activities: ['Musculação'] },
  2: { running: true, activities: [] },
  3: { running: false, activities: ['Musculação', 'Natação'] },
  // ...
}
```

**❌ INCOMPATIBILIDADE!** O gerador não sabe ler a nova estrutura.

---

## 🎯 Impacto no Plano Gerado

### O que acontece AGORA:

1. **IA recebe:** `trainingActivities: [1, 2, 4, 6]`
2. **IA interpreta:** "Usuário pode treinar nos dias 1, 2, 4 e 6"
3. **IA assume:** "Todos esses dias são para CORRIDA"
4. **IA gera:**
   ```
   Segunda (1): Corrida Regenerativa
   Terça (2): Corrida Intervalada
   Quarta (3): DESCANSO ❌ (deveria ter Musculação + Natação!)
   Quinta (4): Corrida Moderada
   Sexta (5): DESCANSO ✅ (correto)
   Sábado (6): Longão
   Domingo (0): DESCANSO ✅ (correto)
   ```

4. **Resultado:** Dias com apenas musculação/natação ficam como DESCANSO

---

## ✅ Solução Completa

### **Passo 1: Corrigir `/api/plan/generate/route.ts`**

Passar a estrutura completa do `trainingSchedule` para a IA:

```typescript
// ANTES (linha 76-87)
activities = Object.keys(schedule)
  .filter(day => {
    const sched = schedule[parseInt(day)];
    return sched && (sched.running || (sched.activities && sched.activities.length > 0));
  })
  .map(d => parseInt(d)); // ❌ Perde informações

// DEPOIS
const fullSchedule = profile.trainingSchedule as any;
```

```typescript
// ANTES (linha 187)
trainingActivities: activities, // ❌ [1, 2, 4, 6]

// DEPOIS
trainingSchedule: profile.trainingSchedule, // ✅ Estrutura completa
customActivities: profile.customActivities || [],
```

---

### **Passo 2: Atualizar Interface `AIUserProfile`**

**Arquivo:** `/root/athera-run/lib/ai-plan-generator.ts` (linha 17-110)

```typescript
export interface AIUserProfile {
  // ... (manter tudo)
  
  // ADICIONAR:
  trainingSchedule?: Record<number, {
    running: boolean;
    activities: string[];
  }>;
  customActivities?: string[];
  
  // MANTER (para compatibilidade com planos antigos):
  trainingActivities?: any[];
}
```

---

### **Passo 3: Atualizar Gerador de Contexto**

**Arquivo:** `/root/athera-run/lib/ai-plan-generator.ts` (linha 240-265)

```typescript
// NOVO CÓDIGO - Suporta AMBAS estruturas (v1.7.3 e v1.2.0)

// Disponibilidade
context += `\n## Disponibilidade e Preferências de Treino\n`;

// Nova estrutura (v1.7.3) - PRIORIDADE
if (profile.trainingSchedule) {
  const schedule = profile.trainingSchedule;
  const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  
  // Dias de corrida
  const runningDays = Object.keys(schedule)
    .filter(day => schedule[parseInt(day)]?.running)
    .map(day => daysOfWeek[parseInt(day)]);
  
  if (runningDays.length > 0) {
    context += `- **Corrida:** ${runningDays.join(', ')}\n`;
  }
  
  // Dia do longão
  if (profile.longRunDay !== null && profile.longRunDay !== undefined) {
    context += `- **Dia do Longão:** ${daysOfWeek[profile.longRunDay]}\n`;
  }
  
  // Outras atividades por dia
  Object.keys(schedule).forEach(dayKey => {
    const dayNum = parseInt(dayKey);
    const dayData = schedule[dayNum];
    
    if (dayData.activities && dayData.activities.length > 0) {
      const dayName = daysOfWeek[dayNum];
      const activitiesList = dayData.activities.join(', ');
      
      // Se tem corrida E outras atividades
      if (dayData.running) {
        context += `- **${dayName}:** Corrida + ${activitiesList}\n`;
      } else {
        // Só outras atividades (sem corrida)
        context += `- **${dayName}:** ${activitiesList} (sem corrida)\n`;
      }
    }
  });
  
  // Esportes customizados
  if (profile.customActivities && profile.customActivities.length > 0) {
    context += `\n**Esportes Adicionais Praticados:**\n`;
    profile.customActivities.forEach(sport => {
      const sportName = sport.split('_').map(w => 
        w.charAt(0).toUpperCase() + w.slice(1)
      ).join(' ');
      context += `- ${sportName}\n`;
    });
  }
}
// Estrutura antiga (v1.2.0) - FALLBACK
else if (profile.trainingActivities && profile.trainingActivities.length > 0) {
  profile.trainingActivities.forEach((activity: any) => {
    if (activity.availableDays && activity.availableDays.length > 0) {
      const days = activity.availableDays.map((d: number) => 
        ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][d]
      ).join(', ');
      const time = activity.preferredTime === 'morning' ? 'Manhã' : 
                   activity.preferredTime === 'afternoon' ? 'Tarde' : 
                   activity.preferredTime === 'evening' ? 'Noite' : 'Flexível';
      context += `- ${activity.name}: ${days} (${time})\n`;
    }
  });
  
  if (profile.longRunDay !== null && profile.longRunDay !== undefined) {
    const longRunDayName = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][profile.longRunDay];
    context += `- Dia Preferido para Longão: ${longRunDayName}\n`;
  }
}
```

---

### **Passo 4: Atualizar Prompt da IA**

**Arquivo:** `/root/athera-run/lib/ai-plan-generator.ts` (prompt principal - linha ~400-700)

Adicionar instrução específica:

```typescript
const prompt = `
// ... (início do prompt)

IMPORTANTE: Respeitar TODAS as atividades do atleta:
- Dias com CORRIDA: agendar treinos de corrida
- Dias com OUTRAS ATIVIDADES (Musculação, Natação, etc.) SEM corrida: agendar essas atividades complementares
- Dias SEM NENHUMA atividade: descanso
- NUNCA agendar corrida em dias onde o atleta só faz outras atividades
- SEMPRE considerar a carga das outras atividades ao planejar corridas no mesmo dia

Exemplo:
Se o atleta tem:
- Segunda: Corrida + Musculação → Planejar corrida LEVE + sugerir musculação complementar
- Terça: Corrida → Planejar qualquer tipo de corrida
- Quarta: APENAS Musculação + Natação → NÃO planejar corrida, apenas indicar "Musculação e Natação (conforme rotina do atleta)"
- Quinta: Corrida + Musculação → Planejar corrida LEVE + sugerir musculação
- Sexta: NADA → Descanso completo

// ... (resto do prompt)
`;
```

---

## 📋 Checklist de Implementação

### Arquivos a Modificar:

- [ ] `/root/athera-run/app/api/plan/generate/route.ts`
  - [ ] Linha 76-87: Remover conversão para array de números
  - [ ] Linha 187: Passar `trainingSchedule` completo
  - [ ] Linha 187: Adicionar `customActivities`

- [ ] `/root/athera-run/lib/ai-plan-generator.ts`
  - [ ] Linha 17-110: Atualizar interface `AIUserProfile`
  - [ ] Linha 240-265: Atualizar geração de contexto
  - [ ] Linha ~400-700: Atualizar prompt da IA

### Testes Necessários:

- [ ] Perfil com corrida + musculação no mesmo dia
- [ ] Perfil com dias APENAS musculação (sem corrida)
- [ ] Perfil com dias APENAS natação (sem corrida)
- [ ] Perfil com esportes customizados (crossfit, yoga, etc.)
- [ ] Perfil misto: corrida, musculação, natação em dias diferentes

---

## 🎯 Resultado Esperado Após Correção

### Entrada (trainingSchedule):
```typescript
{
  1: { running: true, activities: ['Musculação'] },   // Segunda
  2: { running: true, activities: [] },               // Terça
  3: { running: false, activities: ['Musculação', 'Natação'] }, // Quarta
  4: { running: true, activities: ['Musculação'] },   // Quinta
  6: { running: true, activities: [] }                // Sábado (longão)
}
```

### Saída (Plano Gerado):
```
Segunda:  Corrida Regenerativa 5km + Musculação (conforme sua rotina)
Terça:    Corrida Intervalada 8km
Quarta:   Musculação e Natação (conforme sua rotina) ✅ SEM CORRIDA!
Quinta:   Corrida Moderada 6km + Musculação (conforme sua rotina)
Sexta:    Descanso completo
Sábado:   Longão 12km
Domingo:  Descanso completo
```

---

## 🚨 Urgência

**Prioridade:** 🔴 **ALTA**

**Impacto:**
- ❌ Planos atuais ignoram 50% das atividades do usuário
- ❌ Usuários que fazem musculação/natação não veem isso no plano
- ❌ Sobrecarga de corrida (mais corridas do que o usuário quer)
- ❌ Experiência ruim para usuários multiesportivos

**Estimativa:** 2-3 horas de desenvolvimento + 1 hora de testes

---

**Status:** 📋 **DIAGNÓSTICO COMPLETO**  
**Próximo:** 🔧 **IMPLEMENTAR CORREÇÕES**
