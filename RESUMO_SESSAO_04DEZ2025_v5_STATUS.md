# 📋 Resumo Sessão 04/DEZ/2025 - v5.0.0 Athera Flex

## 🎯 Objetivo da Sessão
Implementar exibição correta de treinos executados vs planejados (Athera Flex v5.0.0):
- Mostrar treino executado no dia que foi feito (ex: sábado 16km)
- Mostrar no dia planejado que foi substituído (ex: domingo "Feito no sábado")
- Adicionar botão "Desfazer" para match manual

---

## 📊 Status Atual: 🟡 70% IMPLEMENTADO

### ✅ O que está FUNCIONANDO:
1. Migration v5.0.3 aplicada com sucesso no banco
2. Tipos TypeScript atualizados
3. API de match manual funcionando (cria vínculo)
4. API de undo match criada
5. Foreign key corrigida

### ❌ O que NÃO está funcionando:

**Problema 1:** Domingo verde mas sem indicar de onde veio
**Problema 2:** Sábado cinza (não mostra os 16km executados)
**Problema 3:** Botão "Desfazer" não aparece
**Problema 4:** Corrida ainda aparece no modal de seleção

---

## 🛠️ PRÓXIMA SESSÃO - Checklist Objetivo

### 1️⃣ Corrigir API manual-match (PRIORIDADE MÁXIMA)
```typescript
// app/api/workouts/manual-match/route.ts
// ADICIONAR após linha 65:
await prisma.customWorkout.update({
  where: { id: plannedWorkoutId },
  data: {
    executedWorkoutId: completedWorkoutId,
    wasSubstitution: true,
    isCompleted: true,
    completedWorkoutId: completedWorkoutId
  }
});
```

### 2️⃣ Buscar executados órfãos na API weeks
```typescript
// app/api/plan/weeks/[weekId]/route.ts
// Para cada dia, buscar completed_workouts sem plannedWorkoutId
```

### 3️⃣ Exibir corretamente no frontend
```typescript
// Sábado: Card azul "16km executados"
// Domingo: Badge "Executado em 29/11" + botão "Desfazer"
```

### 4️⃣ Corrigir filtro completed-runs
```typescript
// Não mostrar se já tem plannedWorkoutId
```

---

## 📝 Arquivos para modificar (PRÓXIMA SESSÃO)

**Backend:**
- `app/api/workouts/manual-match/route.ts` ⚠️ CRÍTICO
- `app/api/plan/weeks/[weekId]/route.ts` ⚠️ IMPORTANTE
- `app/api/workouts/completed-runs/route.ts` ⚠️ FILTRO

**Frontend:**
- `components/plano/WorkoutCard.tsx` ⚠️ EXIBIÇÃO
- `components/plano/SimpleWorkoutView.tsx` ⚠️ RESUMO

---

## 🔍 Dados do Banco (Referência)

```sql
-- Domingo (custom_workout 18229)
isCompleted: true
completedWorkoutId: 1230
executedWorkoutId: null ❌ PRECISA SER 1230
wasSubstitution: false ❌ PRECISA SER true

-- Sábado (completed_workout 1230)
date: 2025-11-29
distance: 16.231
plannedWorkoutId: 18229 ✅
```

---

## 🚀 Estimativa

**Tempo:** 1h30min
**Risco:** Baixo
**Bloqueadores:** Nenhum

---

**Use PROMPT_INICIAL_MELHORADO.md na próxima sessão!**
