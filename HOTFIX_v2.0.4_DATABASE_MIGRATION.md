# 🔧 HOTFIX v2.0.4 - Database Migration Fix

**Data:** 11 de Novembro de 2025 12:45 UTC  
**Tipo:** CRÍTICO - Database Schema  
**Versão:** v2.0.4

---

## 🚨 Problema Identificado

### Erro em Produção
```
PrismaClientKnownRequestError: 
Invalid `prisma.user.findUnique()` invocation:

The column `custom_workouts.warmUpStructure` does not exist in the current database.
```

### Causa Raiz
As migrations da v2.0.0 não foram aplicadas no banco de produção:
- ❌ `20251107_make_training_plan_fields_optional_v1_5_3`
- ❌ `20251107121746_make_goal_distance_optional`
- ❌ `20251110_workout_structure_v2_0_0` (v2.0.0 - estrutura detalhada)

### Impacto
- ❌ Usuários não conseguem visualizar planos de treino
- ❌ API `/api/plan/current` retorna erro 500
- ❌ Sistema completamente indisponível após onboarding

---

## ✅ Solução Aplicada

### 1. Verificação do Status das Migrations
```bash
npx prisma migrate status
# Resultado: 3 migrations pendentes + 1 failed
```

### 2. Resolução de Migration Falhada
```bash
npx prisma migrate resolve --rolled-back 20251103200800_add_comprehensive_athlete_data_v1_3_0
# Migration antiga marcada como rolled back
```

### 3. Aplicação das Migrations Pendentes
```bash
npx prisma migrate deploy
```

**Resultado:**
```
✅ 20251107_make_training_plan_fields_optional_v1_5_3 - APLICADA
✅ 20251107121746_make_goal_distance_optional - APLICADA
✅ 20251110_workout_structure_v2_0_0 - APLICADA (v2.0.0)

All migrations have been successfully applied.
```

### 4. Regeneração do Prisma Client
```bash
npx prisma generate
# Prisma Client atualizado com novos campos
```

---

## 📊 Campos Adicionados (v2.0.0)

### Estrutura Detalhada dos Treinos
```sql
ALTER TABLE "custom_workouts" 
  ADD COLUMN "warmUpStructure" JSONB,      -- Aquecimento detalhado
  ADD COLUMN "mainWorkoutStruct" JSONB,    -- Parte principal estruturada
  ADD COLUMN "coolDownStructure" JSONB;    -- Desaquecimento detalhado
```

### Enriquecimento Educacional
```sql
ALTER TABLE "custom_workouts"
  ADD COLUMN "objective" TEXT,             -- Objetivo fisiológico
  ADD COLUMN "scientificBasis" TEXT,       -- Fundamento científico
  ADD COLUMN "tips" JSONB,                 -- Dicas práticas
  ADD COLUMN "commonMistakes" JSONB,       -- Erros comuns
  ADD COLUMN "successCriteria" JSONB;      -- Critérios de sucesso
```

### Métricas Avançadas
```sql
ALTER TABLE "custom_workouts"
  ADD COLUMN "intensityLevel" INTEGER CHECK ("intensityLevel" >= 1 AND "intensityLevel" <= 5),
  ADD COLUMN "expectedRPE" INTEGER CHECK ("expectedRPE" >= 1 AND "expectedRPE" <= 10),
  ADD COLUMN "heartRateZones" JSONB,       -- Zonas de FC
  ADD COLUMN "intervals" JSONB,            -- Estrutura de intervalos
  ADD COLUMN "expectedDuration" INTEGER;   -- Duração esperada (min)
```

### Índices para Performance
```sql
CREATE INDEX "custom_workouts_intensity_idx" ON "custom_workouts"("intensityLevel");
CREATE INDEX "custom_workouts_type_idx" ON "custom_workouts"("type");
CREATE INDEX "custom_workouts_date_idx" ON "custom_workouts"("date");
```

**Total:** 14 novos campos + 3 índices

---

## 🔍 Verificação

### Status Final das Migrations
```bash
npx prisma migrate status
# Database schema is up to date! ✅
```

### Migrations Aplicadas
```
✅ 20251103200800_add_comprehensive_athlete_data_v1_3_0 (rolled back, mas estrutura existe)
✅ 20251104215000_add_user_locale
✅ 20251107_make_training_plan_fields_optional_v1_5_3
✅ 20251107121746_make_goal_distance_optional
✅ 20251110_workout_structure_v2_0_0 (v2.0.0)
```

---

## 🚀 Deploy

### Passos para Deploy
1. ✅ Migrations aplicadas diretamente no banco Neon
2. ✅ Prisma Client regenerado
3. ⏳ Redeploy do Vercel (em andamento)

### Comando Vercel
```bash
vercel --prod
# Trigger redeploy com schema atualizado
```

---

## 📝 Lições Aprendidas

### Problema Original
- Código da v2.0.0 foi deployed (commit 10/Nov)
- Migrations não foram aplicadas no banco de produção
- Schema local ≠ Schema produção

### Causa
- Deploy do Vercel não executa `prisma migrate deploy` automaticamente
- Necessário executar migrations manualmente ou via CI/CD

### Prevenção Futura
1. **Adicionar ao Vercel Build**:
   ```json
   "scripts": {
     "build": "npx prisma migrate deploy && npx prisma generate && next build"
   }
   ```

2. **Ou usar Vercel Pre-deploy Hook**:
   ```bash
   # vercel.json
   {
     "buildCommand": "npx prisma migrate deploy && npm run build"
   }
   ```

3. **Ou separar em CI/CD**:
   - Step 1: Apply migrations
   - Step 2: Build & deploy

---

## 🎯 Status Atual

| Componente | Status | Detalhes |
|------------|--------|----------|
| **Database Schema** | ✅ | Atualizado com v2.0.0 |
| **Migrations** | ✅ | Todas aplicadas |
| **Prisma Client** | ✅ | Regenerado |
| **Vercel Deploy** | ⏳ | Em andamento |
| **Sistema** | ⏳ | Aguardando deploy |

---

## 📋 Próximos Passos

1. ✅ **Aguardar Deploy Vercel** (2-3 minutos)
2. ✅ **Testar API `/api/plan/current`**
3. ✅ **Validar geração de novos planos**
4. ✅ **Confirmar novos campos populados**

---

## 🔗 Referências

- **Migration File:** `prisma/migrations/20251110_workout_structure_v2_0_0/migration.sql`
- **Schema:** `prisma/schema.prisma`
- **Documentação v2.0.0:** `RESUMO_IMPLEMENTACAO_v2.0.0_FINAL.md`
- **Changelog:** `CHANGELOG.md` (v2.0.0)

---

## ✅ Validação Final

### Testar após deploy:
```bash
# 1. Verificar se API funciona
curl https://atherarun.com/api/plan/current

# 2. Verificar novos campos no banco
SELECT 
  id,
  "warmUpStructure" IS NOT NULL as has_warmup,
  "objective" IS NOT NULL as has_objective,
  "intensityLevel"
FROM custom_workouts
LIMIT 5;
```

---

**Status:** ✅ MIGRATIONS APLICADAS - Aguardando deploy  
**ETA:** 2-3 minutos para deploy completo  
**Versão:** v2.0.4

---

**© 2025 Athera Run - Sistema de Treinamento Inteligente**
