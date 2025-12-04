# 📋 Sessão 04/12/2025 - v5.0.0 Implementação Final

## ✅ Status: Em Progresso

### 🎯 Objetivo
Implementar sistema de **display inteligente** de treinos executados vs planejados:
- Mostrar treino REAL no dia que foi executado
- Indicar quando treino planejado foi substituído
- Permitir desfazer match manual
- Filtrar treinos já usados do modal de seleção

---

## 📊 Análise do Problema

### ❌ Comportamento Anterior
```
Sábado (29/11): Descanso ← mas fiz 16km
Domingo (30/11): Longão 6km (concluído manualmente)
```

### ✅ Comportamento Desejado
```
Sábado (29/11): Corrida 16km (executado, sem plano)
Domingo (30/11): Longão 6km (substituído por sábado 29/11)
```

---

## 🗄️ Estado do Banco de Dados

### ✅ Colunas Verificadas (JÁ EXISTEM)
```sql
-- custom_workouts
- executed_workout_id (INTEGER, UNIQUE)
- was_substitution (BOOLEAN, DEFAULT false)

-- Constraints OK
- FOREIGN KEY executed_workout_id → completed_workouts(id)
- UNIQUE INDEX em executed_workout_id
```

### 📊 Foreign Keys Atuais
```sql
-- completed_workouts.plannedWorkoutId → custom_workouts.id ✅
-- custom_workouts.executedWorkoutId → completed_workouts.id ✅
```

---

## 🔧 Implementação v5.0.0

### Etapa 1: Backend APIs ✅ PRONTO
- [x] GET `/api/training-plan/weeks` - retornar `executedWorkoutId`, `wasSubstitution`
- [x] POST `/api/workouts/manual-match` - setar ambos os lados da relação
- [x] DELETE `/api/workouts/undo-match` - nova API para desfazer
- [x] GET `/api/workouts/completed-runs` - filtrar já usados

### Etapa 2: TypeScript Types
- [ ] Atualizar `CustomWorkout` type em `types/workout.ts`
- [ ] Adicionar campos opcionais:
  - `executedWorkoutId?: number`
  - `wasSubstitution?: boolean`
  - `executedWorkout?: CompletedWorkout`

### Etapa 3: Frontend Display Logic
- [ ] `DayView.tsx` - Renderizar treino executado quando `executedWorkoutId` presente
- [ ] `SimpleWorkoutView.tsx` - Adicionar badge "Substituído por [data]"
- [ ] Botão "Desfazer" quando `wasSubstitution === true`

### Etapa 4: Lógica de Conclusão
- [ ] Ajustar `allCompleted` para considerar `executedWorkoutId`
- [ ] Verde: todos planned ✅ OU executed presente
- [ ] Amarelo: parcial

---

## 🚨 Lições Aprendidas (Tentativa 1 Falhou)

### ❌ Erros Cometidos
1. Mudei muita coisa de uma vez
2. Não verifiquei se colunas já existiam
3. TypeScript types desatualizados causaram React errors
4. Deploy antes de testar localmente os types

### ✅ Abordagem Correta Agora
1. **Verificar schema primeiro** (FEITO ✅)
2. **Um arquivo por vez**
3. **Testar types antes de commit**
4. **Deploy incremental**

---

## 📝 Checklist de Implementação

### Backend (APIs)
- [ ] GET weeks - retornar novos campos
- [ ] POST manual-match - setar relação bidirecional  
- [ ] DELETE undo-match - limpar ambos lados
- [ ] GET completed-runs - filtrar usados

### Frontend (Types)
- [ ] Atualizar `types/workout.ts`
- [ ] Validar com TypeScript compiler

### Frontend (UI)
- [ ] Renderizar `executedWorkout` quando presente
- [ ] Badge "Substituído"
- [ ] Botão "Desfazer"
- [ ] Filtro no modal

### Testes
- [ ] Caso 1: Treino executado em dia sem plano
- [ ] Caso 2: Match manual (plano + executado diferente)
- [ ] Caso 3: Desfazer match
- [ ] Caso 4: Filtro no modal

---

## 🎯 Próximos Passos

1. Implementar types corretos
2. Implementar APIs uma por vez
3. Testar cada API isoladamente
4. Implementar UI
5. Deploy e validação

---

## 📌 Referências
- Schema: `prisma/schema.prisma` linhas 462-463
- API base: `app/api/training-plan/weeks/route.ts`
- Frontend: `app/[locale]/plano/page.tsx`
