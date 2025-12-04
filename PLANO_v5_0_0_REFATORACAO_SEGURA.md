# 🎯 v5.0.0 - Refatoração Display Treinos Executados

**Data:** 04/12/2025  
**Status:** 🔄 Em Planejamento  
**Objetivo:** Mostrar treinos executados nos dias que foram realmente feitos

---

## 📋 Problema Atual

### Comportamento Atual (v4.0.18)
- ❌ Sábado: Mostra "Descanso" (mas fiz 16km corrida)
- ❌ Domingo: Mostra "Concluído" com badge substituição (mas não mostra treino real)
- ❌ Lógica confusa: `isCompleted` + `completedWorkoutId` referencia `Workout` antigo

### Comportamento Desejado (v5.0.0)
- ✅ **Sábado:** Mostra corrida 16km executada (fonte Strava)
- ✅ **Domingo:** Mostra que foi concluído usando corrida do sábado (referência cruzada)
- ✅ **Filtro:** Treinos já matchados não aparecem no modal de seleção
- ✅ **Desfazer:** Botão para remover match manual

---

## 🗄️ Estrutura do Banco (Estado Atual)

### Tabela: `custom_workouts`
```
- id (PK)
- title, date, type, distance, duration...
- isCompleted: boolean
- completedWorkoutId: integer (FK → completed_workouts.id)
```

### Tabela: `completed_workouts`
```
- id (PK)
- date, distance, duration, source...
- plannedWorkoutId: integer (FK → custom_workouts.id) ⚠️ PROBLEMA!
```

**⚠️ CONFLITO:** Foreign key aponta para tabela ERRADA!
- `completedWorkoutId` → completed_workouts.id ✅
- `plannedWorkoutId` → custom_workouts.id ❌ (deveria ser Workout)

---

## 🔧 Etapas de Implementação

### ✅ ETAPA 1: Corrigir Schema (CRÍTICO)
**Arquivos:** `prisma/schema.prisma`

```prisma
model CustomWorkout {
  id                  Int      @id @default(autoincrement())
  // ... campos existentes ...
  isCompleted         Boolean  @default(false)
  completedWorkoutId  Int?     // ID do treino executado (pode ser em outro dia)
  executedWorkoutId   Int?     // ID do treino executado NO MESMO DIA
  wasSubstitution     Boolean  @default(false) // Se foi feito em outro dia
  
  // Relations
  completedWorkout    CompletedWorkout? @relation("PlannedToCompleted", fields: [completedWorkoutId], references: [id])
  executedWorkout     CompletedWorkout? @relation("ExecutedInDay", fields: [executedWorkoutId], references: [id])
  
  @@map("custom_workouts")
}

model CompletedWorkout {
  id                  Int      @id @default(autoincrement())
  // ... campos existentes ...
  plannedWorkoutId    Int?     // Quando é match manual
  
  // Relations
  plannedFor          CustomWorkout[] @relation("PlannedToCompleted")
  executedIn          CustomWorkout[] @relation("ExecutedInDay")
  
  @@map("completed_workouts")
}
```

**Migration:**
```sql
-- Adicionar novas colunas
ALTER TABLE custom_workouts 
ADD COLUMN "executedWorkoutId" INTEGER,
ADD COLUMN "wasSubstitution" BOOLEAN DEFAULT false;

-- Corrigir foreign key (se necessário)
-- Esta parte precisa análise cuidadosa do estado atual
```

---

### ✅ ETAPA 2: Atualizar Types TypeScript
**Arquivos:** `types/training.ts`

```typescript
export interface CustomWorkout {
  // ... campos existentes ...
  completedWorkoutId: number | null;    // Match manual (pode ser de outro dia)
  executedWorkoutId: number | null;      // Executado NO MESMO DIA
  wasSubstitution: boolean;              // Se completedWorkoutId é de outro dia
}
```

---

### ✅ ETAPA 3: Backend - API `/api/plano`
**Arquivos:** Identificar arquivo correto primeiro

**Mudanças:**
```typescript
// Incluir executed workouts na query
const customWorkouts = await prisma.customWorkout.findMany({
  include: {
    completedWorkout: true,     // Match manual
    executedWorkout: true,      // Executado no dia
  }
});

// Processar executed workouts
const executedMap = new Map();
completedWorkouts.forEach(cw => {
  const dateKey = dayjs(cw.date).format('YYYY-MM-DD');
  if (!executedMap.has(dateKey)) {
    executedMap.set(dateKey, []);
  }
  executedMap.get(dateKey).push(cw);
});

// Enriquecer resposta
workouts.forEach(w => {
  const dateKey = dayjs(w.date).format('YYYY-MM-DD');
  w.executedWorkouts = executedMap.get(dateKey) || [];
});
```

---

### ✅ ETAPA 4: Frontend - Lógica de Exibição
**Arquivos:** `app/[locale]/plano/page.tsx`

**Nova Lógica:**
```typescript
// Função helper: Determinar status do dia
function getDayStatus(workout, executedWorkouts) {
  const hasPlanned = workout && workout.type !== 'rest';
  const hasExecuted = executedWorkouts && executedWorkouts.length > 0;
  
  if (!hasPlanned && !hasExecuted) return 'rest';
  if (!hasPlanned && hasExecuted) return 'executed-only'; // ⭐ NOVO
  if (hasPlanned && !hasExecuted) return 'pending';
  if (hasPlanned && hasExecuted) return 'completed';
  
  return 'unknown';
}

// Renderização
{dayStatus === 'executed-only' && (
  <ExecutedWorkoutCard 
    workout={executedWorkouts[0]}
    showMatchOption={true}
  />
)}
```

---

### ✅ ETAPA 5: Componente ExecutedWorkoutCard
**Arquivos:** `components/plano/ExecutedWorkoutCard.tsx` (CRIAR)

```typescript
interface ExecutedWorkoutCardProps {
  workout: CompletedWorkout;
  showMatchOption: boolean;
  onMatch?: (workoutId: number) => void;
}

export function ExecutedWorkoutCard({ workout, showMatchOption, onMatch }: ExecutedWorkoutCardProps) {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <Badge variant="outline">Executado</Badge>
        <CardTitle>{workout.distance}km</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Fonte: {workout.source}</p>
        {showMatchOption && (
          <Button onClick={() => onMatch?.(workout.id)}>
            Marcar como treino planejado
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
```

---

### ✅ ETAPA 6: API Undo Match
**Arquivos:** `app/api/workouts/undo-match/route.ts` (CRIAR)

```typescript
export async function POST(req: Request) {
  const { workoutId } = await req.json();
  
  // 1. Buscar workout
  const workout = await prisma.customWorkout.findUnique({
    where: { id: workoutId }
  });
  
  // 2. Limpar match
  await prisma.customWorkout.update({
    where: { id: workoutId },
    data: {
      isCompleted: false,
      completedWorkoutId: null,
      wasSubstitution: false,
    }
  });
  
  // 3. Limpar completed_workout se foi match manual
  if (workout.completedWorkoutId) {
    await prisma.completedWorkout.update({
      where: { id: workout.completedWorkoutId },
      data: {
        plannedWorkoutId: null,
      }
    });
  }
  
  return Response.json({ success: true });
}
```

---

### ✅ ETAPA 7: Filtro Modal Seleção
**Arquivos:** `app/api/workouts/completed-runs/route.ts`

```typescript
// Buscar apenas treinos NÃO usados
const available = await prisma.completedWorkout.findMany({
  where: {
    AND: [
      { plannedWorkoutId: null }, // Não foi matchado
      { type: 'running' },
      // ... outros filtros
    ]
  }
});
```

---

## 🧪 Testes Necessários

### Teste 1: Treino Executado em Dia Livre
- Fazer corrida em dia sem plano
- ✅ Deve aparecer como "Executado" no calendário
- ✅ Dia deve ficar verde
- ✅ Deve ter opção de marcar como planejado

### Teste 2: Match Manual
- Clicar "Marcar como treino planejado"
- ✅ Deve aparecer botão "Desfazer"
- ✅ Treino não deve mais aparecer no modal de outros dias
- ✅ Indicador de substituição deve aparecer

### Teste 3: Undo Match
- Clicar "Desfazer"
- ✅ Treino volta para modal
- ✅ Dia volta ao estado original
- ✅ Badge de substituição some

---

## 🚨 Riscos e Mitigações

### Risco 1: Foreign Key Constraint
**Problema:** `plannedWorkoutId` pode estar apontando para tabela errada  
**Mitigação:**
1. Verificar constraints existentes no banco
2. Fazer migration com DROP + ADD se necessário
3. Testar em banco de staging primeiro (se possível)

### Risco 2: Breaking Changes
**Problema:** Código existente depende de `isCompleted` e `completedWorkoutId`  
**Mitigação:**
1. Manter campos antigos funcionando
2. Adicionar novos campos sem quebrar lógica existente
3. Fazer transição gradual

### Risco 3: Performance
**Problema:** Query pode ficar lenta com JOINs adicionais  
**Mitigação:**
1. Usar `include` seletivo apenas quando necessário
2. Adicionar índices se necessário
3. Monitorar tempo de resposta

---

## 📝 Checklist de Implementação

- [ ] **ETAPA 1:** Migration schema (testar no Neon primeiro)
- [ ] **ETAPA 2:** Atualizar types TypeScript
- [ ] **ETAPA 3:** Backend API `/api/plano` (ou equivalente)
- [ ] **ETAPA 4:** Frontend lógica de status
- [ ] **ETAPA 5:** Componente ExecutedWorkoutCard
- [ ] **ETAPA 6:** API Undo Match
- [ ] **ETAPA 7:** Filtro modal seleção
- [ ] **TESTE 1:** Validar treino executado em dia livre
- [ ] **TESTE 2:** Validar match manual
- [ ] **TESTE 3:** Validar undo match
- [ ] **DOCS:** Atualizar CHANGELOG.md
- [ ] **DOCS:** Atualizar CONTEXTO.md

---

## 🎯 Critérios de Sucesso

✅ **Funcionando 100%:**
1. Treinos executados aparecem nos dias corretos
2. Dias livres com treino ficam verdes
3. Match manual funciona sem erros
4. Undo match funciona perfeitamente
5. Filtro impede reuso de treinos
6. Zero erros no console
7. Zero regressões em funcionalidades existentes

❌ **NÃO aceitar se:**
1. Qualquer erro React no console
2. Qualquer funcionalidade quebrada
3. Performance degradada
4. Lógica ambígua ou confusa

---

**Próximo Passo:** Começar ETAPA 1 após aprovação
