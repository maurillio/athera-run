# 🎯 Plano v5.0.0 - Exibição de Treinos Executados (REVISADO)

## 📋 Objetivo Final
Mostrar treinos executados no dia real que foram feitos, mesmo quando não havia treino planejado.

## 🔍 Análise do Problema Anterior
**Por que quebrou?**
1. Adicionamos campos (`executedWorkoutId`, `wasSubstitution`) sem testar incrementalmente
2. Modificamos muitas partes ao mesmo tempo
3. Não validamos tipos TypeScript antes do deploy
4. React quebrou por renderização condicional mal feita

## ✅ Estratégia NOVA - Incremental e Segura

### 🔸 ETAPA 1: Preparar Backend (SEM quebrar)
- Adicionar campos novos com valores default seguros
- Migration segura no banco
- API retorna novos campos mas frontend IGNORA (compatibilidade)
- **Critério de sucesso:** Deploy sem erros, tudo funciona igual

### 🔸 ETAPA 2: Adicionar Tipos TypeScript
- Atualizar interfaces com campos novos (opcionais)
- Garantir compatibilidade com dados existentes
- **Critério de sucesso:** Build passa sem erros TypeScript

### 🔸 ETAPA 3: Lógica de Processamento (Backend)
- API `/api/plano` processa `executedWorkoutId`
- Retorna estrutura `executed[]` para cada dia
- **Critério de sucesso:** API retorna dados corretos no Postman/Thunder

### 🔸 ETAPA 4: Renderização (Frontend - Incremental)
- Renderizar `executed[]` SEM quebrar `planned[]`
- Adicionar badges de forma SEGURA
- **Critério de sucesso:** Treinos executados aparecem, planned continuam funcionando

### 🔸 ETAPA 5: Match/Unmatch (Feature final)
- Botão "Desfazer" apenas para `wasSubstitution=true`
- API de unmatch
- **Critério de sucesso:** Consegue desfazer match manual

---

## 🚀 Implementação - ETAPA 1: Backend Seguro

### 1.1 Migration SQL (Executar PRIMEIRO)
```sql
-- STEP 1: Adicionar colunas com defaults seguros
ALTER TABLE custom_workouts 
  ADD COLUMN IF NOT EXISTS "executedWorkoutId" INTEGER,
  ADD COLUMN IF NOT EXISTS "wasSubstitution" BOOLEAN DEFAULT FALSE;

-- STEP 2: Adicionar foreign key
ALTER TABLE custom_workouts
  ADD CONSTRAINT fk_executed_workout 
  FOREIGN KEY ("executedWorkoutId") 
  REFERENCES completed_workouts(id) 
  ON DELETE SET NULL;

-- STEP 3: Validar
SELECT COUNT(*) FROM custom_workouts 
WHERE "wasSubstitution" IS NULL OR "executedWorkoutId" IS NOT NULL;
```

### 1.2 Atualizar Prisma Schema
```prisma
model CustomWorkout {
  // ... campos existentes
  executedWorkoutId  Int?              @map("executedWorkoutId")
  wasSubstitution    Boolean           @default(false) @map("wasSubstitution")
  executedWorkout    CompletedWorkout? @relation("ExecutedLink", fields: [executedWorkoutId], references: [id])
}

model CompletedWorkout {
  // ... campos existentes
  plannedWorkout     CustomWorkout? @relation("PlannedLink", fields: [plannedWorkoutId], references: [id])
  executedInWorkout  CustomWorkout? @relation("ExecutedLink")
}
```

### 1.3 Testar
- Deploy v5.0.1
- Verificar que NADA quebrou
- Plano continua funcionando normal

---

## 📊 Checklist de Segurança

Antes de cada deploy:
- [ ] Build local passa sem erros
- [ ] TypeScript sem erros
- [ ] Migration testada em query manual
- [ ] Rollback preparado (commit anterior anotado)
- [ ] Deploy em horário de baixo tráfego
- [ ] Monitorar Vercel logs por 5 min após deploy

---

## 🎯 Próximos Passos

Após ETAPA 1 funcionar:
1. Commit: `feat: adicionar campos executedWorkout - backend only`
2. Aguardar deploy
3. Validar em produção
4. Partir para ETAPA 2

**NUNCA fazer mais de 1 etapa por vez!**
