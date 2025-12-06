# 🐛 ANÁLISE: Bug Substituição via Pop-up

## 📋 Contexto

**Problema relatado:**
> "A substituição não funciona pelo pop-up. Funciona via manual, a substituição e o desfazer fica perfeito. Preciso que limpe no banco o treino de amanhã, que deve estar marcado como feito pq deu algum problema ai e ele ficou como feito ao invés de substituído utilizando o de hoje."

## 🔍 Diagnóstico

### Diferenças entre os dois fluxos:

#### 1️⃣ **Match Manual** (que funciona)
- **Endpoint:** `/api/workouts/manual-match` (POST)
- **Ação:** 
  ```typescript
  // Atualiza CustomWorkout
  await prisma.customWorkout.update({
    where: { id: plannedWorkoutId },
    data: {
      isCompleted: true,
      completedWorkoutId: completedWorkoutId,
      executedWorkoutId: completedWorkoutId,
      wasSubstitution: true
    }
  });
  
  // Atualiza CompletedWorkout
  await prisma.completedWorkout.update({
    where: { id: completedWorkoutId },
    data: {
      wasPlanned: true,
      plannedDate: plannedWorkout.date,
      wasSubstitution: true
    }
  });
  ```

- **Undo:** `/api/workouts/undo-match` (POST)
  ```typescript
  await prisma.customWorkout.update({
    where: { id: plannedWorkoutId },
    data: {
      isCompleted: false,
      executedWorkout: {
        disconnect: true
      },
      wasSubstitution: false
    }
  });
  
  if (plannedWorkout.executedWorkoutId) {
    await prisma.completedWorkout.update({
      where: { id: plannedWorkout.executedWorkoutId },
      data: {
        wasPlanned: false,
        plannedDate: null,
        wasSubstitution: false
      }
    });
  }
  ```

#### 2️⃣ **Match via Pop-up** (que NÃO funciona o undo)
- **Endpoint:** `/api/athera-flex/apply-adjustment` (POST)
- **Ação:**
  ```typescript
  // SQL DIRETO (!)
  await prisma.$executeRaw`
    UPDATE custom_workouts 
    SET 
      "isCompleted" = true,
      "completedWorkoutId" = ${completedWorkoutId},
      "executedWorkoutId" = ${completedWorkoutId},
      "wasSubstitution" = true
    WHERE id = ${plannedWorkoutId}
  `;
  
  // Atualiza CompletedWorkout
  await prisma.completedWorkout.update({
    where: { id: completedWorkoutId },
    data: {
      wasPlanned: true,
      plannedDate: plannedWorkout.date,
    }
  });
  ```

- **Problema identificado:**
  1. ❌ **Não seta `wasSubstitution` no CompletedWorkout**
  2. ⚠️ Usa SQL direto ao invés de Prisma Client
  3. ⚠️ Seta AMBOS `completedWorkoutId` E `executedWorkoutId` (manual só seta executedWorkoutId)

## 🔧 Solução

### Problema 1: `wasSubstitution` faltando no CompletedWorkout
**Local:** `app/api/athera-flex/apply-adjustment/route.ts` linha ~196

**Correção:**
```typescript
// ANTES (linha 196-202)
await prisma.completedWorkout.update({
  where: { id: completedWorkoutId },
  data: {
    wasPlanned: true,
    plannedDate: plannedWorkout.date,
  },
});

// DEPOIS
await prisma.completedWorkout.update({
  where: { id: completedWorkoutId },
  data: {
    wasPlanned: true,
    plannedDate: plannedWorkout.date,
    wasSubstitution: true, // ✅ ADICIONAR ESTA LINHA
  },
});
```

### Problema 2: Treino de amanhã marcado incorretamente
**Solução:** API de limpeza criada em `/api/debug/clean-tomorrow`

**Como usar:**
```bash
curl -X POST https://atherarun.com/api/debug/clean-tomorrow \
  -H "Cookie: next-auth.session-token=..." \
  -H "Content-Type: application/json"
```

## ✅ Arquivos a Modificar

1. `app/api/athera-flex/apply-adjustment/route.ts`
   - Adicionar `wasSubstitution: true` no CompletedWorkout update
   - Linha ~199

## 📦 Deploy

**Versão:** v5.0.16 - Fix Substitution Flag in Apply Adjustment

**Checklist:**
- [ ] Modificar apply-adjustment/route.ts
- [ ] Commit
- [ ] Push para main
- [ ] Aguardar deploy Vercel
- [ ] Chamar API de limpeza: `/api/debug/clean-tomorrow`
- [ ] Testar undo em treino de amanhã
- [ ] Testar substituição via pop-up novamente
