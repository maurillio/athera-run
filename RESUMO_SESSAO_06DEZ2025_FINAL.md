# Resumo Sessão 06/DEZ/2025 - Match para Amanhã

## 🎯 Objetivo Alcançado

Implementar sugestão de match para treinos de **AMANHÃ** (não apenas passados).

## 📊 Status Final

### ✅ Funcionando
1. **Pop-up aparece** - Detecta match hoje → amanhã (confidence ≥60%)
2. **Match manual funciona** - Modal com lista de treinos
3. **Aplicar ajuste funciona** - Via pop-up (botão "Aplicar Ajuste")
4. **Undo funciona** - Para matches passados (ex: 30/NOV)
5. **Descanso sem botão** - Rest days não têm "Marcar como Concluído"

### ⚠️ Problema Pendente
**Undo não funciona para match de AMANHÃ** (feito via pop-up)
- Undo do 30/NOV: ✅ Funciona
- Undo do 07/DEZ (amanhã): ❌ Não funciona

**Hipótese:** Pode ser relacionado a:
- Campo `executedWorkoutId` vs `completedWorkoutId`
- Lógica diferente para treinos futuros
- Verificação de propriedade do treino

## 🔄 Versões Deployadas

### v5.0.10 - Match Tomorrow (1ª tentativa - REVERTIDA)
- Usou OR do Prisma
- Causou React error #418/#423
- Git revert aplicado

### v5.0.10 - Match Tomorrow (2ª tentativa - CORRETA)
- 2 queries separadas (pastWorkouts + tomorrowWorkouts)
- Merge manual com Map
- Zero breaking changes

### v5.0.11 - Remove Rest Day Button
- Ocultou botão "Concluir" se `workout.type === 'rest'`
- Evita match incorreto com descanso

### v5.0.12 - Fix Duplicate Relation
- Removeu `completedWorkout` do include (conflito)
- Manteve apenas `executedWorkout`

### v5.0.13 - Prisma Nested Connect
- Usou `executedWorkout: { connect: { id } }`
- Ao invés de `executedWorkoutId: id` (não permitido)

### v5.0.14 - Remove completedAt
- Campo `completedAt` não existe em CustomWorkout
- Removido da query

### v5.0.15 - Fix Undo with Disconnect
- Usou `executedWorkout: { disconnect: true }`
- Ao invés de `executedWorkoutId: null`
- Verificar `executedWorkoutId` não `completedWorkoutId`

## 🗄️ Mudanças no Banco de Dados

### Treino Resetado (Múltiplas Vezes)
```sql
-- Executado 3x durante sessão
UPDATE completed_workouts 
SET was_planned = false, 
    planned_date = NULL, 
    "plannedWorkoutId" = NULL 
WHERE id = 1250;
```

**Treino 1250:**
- Data: 06/DEZ/2025
- Distância: 8km
- Tipo: running
- Usado para testar match com 07/DEZ

## 📝 Arquivos Modificados

### Backend APIs
1. `app/api/athera-flex/detect-matches/route.ts`
   - Adicionadas 2 queries separadas (past + tomorrow)
   - Merge com Map para evitar duplicados

2. `app/api/athera-flex/apply-adjustment/route.ts`
   - Usou nested connect para `executedWorkout`
   - Removido `completedAt` inexistente

3. `app/api/workouts/undo-match/route.ts`
   - Usou disconnect para remover relação
   - Mudou de `completedWorkoutId` para `executedWorkoutId`

4. `app/api/workouts/completed-runs/route.ts`
   - Já estava com `wasPlanned: false` (correto)

### Frontend
5. `components/workout-details.tsx`
   - Ocultado botão "Concluir" se `type === 'rest'`
   - Aplicado em SimpleWorkoutView e Enhanced view

## 🎓 Aprendizados Importantes

### 1. Prisma Relações
**❌ Não usar:** Atribuição direta de FK
```typescript
completedWorkoutId: 1250  // Unknown argument
executedWorkoutId: 1250   // Not allowed
```

**✅ Usar:** Nested operations
```typescript
executedWorkout: { connect: { id: 1250 } }
executedWorkout: { disconnect: true }
```

### 2. Naming de Campos
**Schema PostgreSQL vs Prisma:**
- PostgreSQL: `was_planned` (snake_case)
- Prisma: `wasPlanned` (camelCase)
- Queries SQL: Usar snake_case OU quotes: `"wasPlanned"`

### 3. Verificar Schema SEMPRE
**Erro evitado:**
- Campo `completedAt` não existe
- Campo `completedWorkoutId` é legacy
- Usar `executedWorkoutId` (atual)

### 4. Queries OR em Prisma
**Problema:** OR complexo causa erro React em edge runtime
**Solução:** 2 queries simples + merge manual

### 5. Rest Days Conceitual
**Rest não é treino para completar:**
- Apenas marcador visual
- Sem CompletedWorkout
- Sem botão "Concluir"

## 🚨 Problema Atual (Para Próxima Sessão)

### Undo não funciona para match de AMANHÃ

**Teste realizado:**
1. ✅ Pop-up: hoje (06/DEZ) → amanhã (07/DEZ)
2. ✅ Aplicar ajuste: Funciona
3. ❌ Desfazer: Não funciona

**Teste de controle:**
1. ✅ Match manual: 29/NOV → 30/NOV (passado)
2. ✅ Desfazer: Funciona

**Diferenças:**
- 30/NOV: Treino passado
- 07/DEZ: Treino futuro (amanhã)
- Pode ter lógica especial ou validação bloqueando

### Debug Necessário
1. Ver logs Vercel da rota `/api/workouts/undo-match`
2. Verificar se há validação de "treino futuro"
3. Checar se `executedWorkoutId` está populado corretamente
4. Ver Response body do erro 500 (se houver)

## 📦 Commits da Sessão

1. `f9581583` - feat: add tomorrow workout matching - SAFE version (v5.0.10)
2. `06b1124b` - fix: remove complete button from rest days (v5.0.11)
3. `6e28cd78` - fix: remove duplicate relation in apply-adjustment (v5.0.12)
4. `9da5c9fa` - fix: use Prisma nested connect for executedWorkout (v5.0.13)
5. `f2133495` - fix: remove nonexistent completedAt field (v5.0.14)
6. `bf67a0e8` - fix: undo match using Prisma disconnect (v5.0.15)

## 🎯 Para Próxima Sessão

### PRIORIDADE 1: Debug Undo de Amanhã
**Ações:**
1. Resetar treino 1250 novamente
2. Fazer match via pop-up (hoje → amanhã)
3. Tentar desfazer
4. Capturar logs Vercel completos
5. Ver Response body do erro

### Possíveis Causas
- Validação bloqueando undo de treino futuro
- Campo `executedWorkoutId` null após disconnect
- Verificação de propriedade falhando
- Lógica especial para `wasSubstitution`

### Arquivos para Investigar
- `app/api/workouts/undo-match/route.ts` (provavelmente aqui)
- Verificar se há middleware bloqueando
- Verificar logs de erro específicos

## 📊 Métricas da Sessão

**Tempo:** ~2h
**Commits:** 7 (6 funcionais + 1 revert)
**Versões:** v5.0.9 → v5.0.15
**Features:** 5/6 completas (83%)
**Bugs corrigidos:** 6
**Aprendizados:** 5 importantes

---

**Status:** 🟡 Quase completo (aguardando fix do undo)  
**Próximo passo:** Debug do undo para treinos de amanhã  
**Blocker:** Nenhum (sistema funcional, apenas 1 caso edge)
