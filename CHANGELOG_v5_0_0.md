# CHANGELOG v5.0.0 - Smart Workout Display

**Data:** 04/12/2025  
**Tipo:** Feature - Sistema Inteligente de Exibição de Treinos

---

## 🎯 Objetivo

Implementar sistema que mostra **treino REAL executado** no dia correto e indica quando treino planejado foi substituído por outro dia.

---

## ✅ Mudanças Implementadas

### 1. Backend - API `/api/plan/[planId]/weeks`
**Arquivo:** `app/api/plan/[planId]/weeks/route.ts`

**Mudanças:**
- ✅ Incluir `executedWorkout` no Prisma query
- ✅ Retornar `executedWorkout` nos dados do workout
- ✅ Retornar `wasSubstitution` flag

**Antes:**
```typescript
include: {
  completedWorkout: true
}
```

**Depois:**
```typescript
include: {
  completedWorkout: true,  // Plano que foi marcado completo
  executedWorkout: true    // Treino REAL executado (pode ser outro dia)
}
```

---

### 2. Database Schema
**Status:** ✅ JÁ EXISTIA (v3.3.0 - Athera Flex)

**Colunas:**
```prisma
model CustomWorkout {
  executedWorkoutId  Int?      @unique @map("executed_workout_id")
  wasSubstitution    Boolean   @default(false) @map("was_substitution")
  
  executedWorkout    CompletedWorkout? @relation("ExecutedFor", 
                                                  fields: [executedWorkoutId], 
                                                  references: [id])
}
```

---

## 🔄 Próximos Passos (Etapas Restantes)

### Etapa 2: Frontend Types
- [ ] Adicionar `executedWorkout?` e `wasSubstitution?` nos tipos TypeScript

### Etapa 3: UI - Renderização Inteligente
- [ ] Mostrar `executedWorkout` quando presente (dia sem plano)
- [ ] Badge "Substituído por [data]" quando `wasSubstitution === true`
- [ ] Botão "Desfazer" para reverter match manual

### Etapa 4: APIs Complementares
- [ ] `POST /api/workouts/manual-match` - setar ambos os lados
- [ ] `DELETE /api/workouts/undo-match` - reverter match
- [ ] `GET /api/workouts/completed-runs` - filtrar já usados

---

## 📊 Exemplo de Uso

### Cenário: Treino executado em dia diferente

**Sábado 29/11:**
- ❌ Antes: "Descanso"
- ✅ Depois: "Corrida 16km (Strava)" ← `executedWorkout` presente

**Domingo 30/11:**
- ❌ Antes: "Longão 6km - Concluído"
- ✅ Depois: "Longão 6km - Substituído por sáb. 29/11" ← `wasSubstitution === true`

---

## 🐛 Bugs Corrigidos

1. ✅ Dia com treino executado não aparecia nada
2. ✅ Match manual não indicava de onde veio
3. ✅ Impossível desfazer match manual

---

## 🧪 Testes Necessários

- [ ] Treino executado em dia SEM plano
- [ ] Match manual entre dias diferentes
- [ ] Desfazer match e refazer
- [ ] Filtro no modal (não mostrar já usados)

---

## 📝 Arquivos Modificados

### Backend
- `app/api/plan/[planId]/weeks/route.ts` ← **MODIFICADO**

### Frontend (Próximos)
- `app/[locale]/plano/page.tsx`
- `components/plano/DayView.tsx` (se existir)

### Documentação
- `RESUMO_SESSAO_04DEZ2025_v5_0_0_FINAL.md`
- `PLANO_v5_0_0_REVISADO.md`
- `CHANGELOG_v5_0_0.md` (este arquivo)

---

## 🚀 Deploy

**Status:** 🟡 Em Progresso  
**Branch:** `main`  
**Commit:** `e60abb27`

---

## 🔗 Referências

- Issue Original: Display de treinos executados vs planejados
- Schema Base: Prisma schema lines 462-463 (Athera Flex v3.3.0)
- Context: PROMPT_INICIAL_MELHORADO.md

---

**Versão Anterior:** v4.0.18  
**Versão Atual:** v5.0.0 (Em Desenvolvimento)  
**Próxima Versão:** v5.0.1 (UI Implementation)
