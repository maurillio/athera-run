# 🔧 FIX: Erro de Migration no Neon

## ❌ ERRO ENCONTRADO

```
ERROR: relation "_prisma_migrations" does not exist (SQLSTATE 42P01)
```

### O que isso significa:

A tabela `_prisma_migrations` não existe no banco Neon. Isso significa que:
- ❌ Prisma nunca foi inicializado neste banco
- ❌ OU você está conectado no banco errado
- ❌ OU o banco foi recriado recentemente

---

## ✅ SOLUÇÃO: Criar tabela + Aplicar migration

### PASSO 1: Verificar qual banco você está usando

```sql
-- Execute no Neon SQL Editor:
SELECT current_database();

-- Deve retornar algo como: "athera" ou "neondb"
```

**⚠️ IMPORTANTE:** Confirme que é o banco correto de produção!

---

### PASSO 2: Criar a tabela _prisma_migrations

```sql
-- Execute PRIMEIRO (cria a tabela de controle do Prisma):

CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) PRIMARY KEY,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMP(3),
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

-- Verificar se criou:
SELECT * FROM "_prisma_migrations";
-- Deve retornar 0 linhas (tabela vazia)
```

---

### PASSO 3: Verificar se os campos v3 já existem

```sql
-- Verificar estrutura da tabela athlete_profiles:
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'athlete_profiles'
  AND column_name IN (
    'hasRunBefore',
    'currentlyInjured', 
    'avgSleepHours',
    'tracksMenstrualCycle',
    'avgCycleLength',
    'lastPeriodDate',
    'workDemand',
    'familyDemand'
  )
ORDER BY column_name;
```

**Se retornar 8 linhas:** Campos já existem! Vá para PASSO 4.  
**Se retornar 0 linhas:** Campos NÃO existem. Continue no PASSO 3B.

---

### PASSO 3B: Adicionar campos v3 (se não existirem)

```sql
-- Adicionar campos v3.0.0:
ALTER TABLE "athlete_profiles" 
ADD COLUMN IF NOT EXISTS "hasRunBefore" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "currentlyInjured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "avgSleepHours" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "tracksMenstrualCycle" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "avgCycleLength" INTEGER,
ADD COLUMN IF NOT EXISTS "lastPeriodDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "workDemand" TEXT,
ADD COLUMN IF NOT EXISTS "familyDemand" TEXT;

-- Verificar novamente:
SELECT 
  column_name 
FROM information_schema.columns 
WHERE table_name = 'athlete_profiles' 
  AND column_name IN (
    'hasRunBefore',
    'currentlyInjured',
    'avgSleepHours'
  );

-- Deve retornar 3 linhas agora
```

---

### PASSO 4: Registrar a migration

```sql
-- Registrar que a migration v3 foi aplicada:
INSERT INTO "_prisma_migrations" (
  id, 
  checksum, 
  finished_at, 
  migration_name, 
  logs, 
  rolled_back_at, 
  started_at, 
  applied_steps_count
) VALUES (
  gen_random_uuid(),
  'da5d8c5bc8ef4a3c2a3d91f7c4e6b8d5a1c2e4f6a8b0c2d4e6f8a0b2c4d6e8f0',
  NOW(),
  '20251113144016_add_v3_profile_fields',
  NULL,
  NULL,
  NOW(),
  1
);

-- Verificar:
SELECT 
  migration_name,
  finished_at,
  applied_steps_count
FROM "_prisma_migrations"
ORDER BY finished_at DESC;

-- Deve mostrar a migration v3
```

---

## ✅ VALIDAÇÃO FINAL

### 1. Confirmar campos existem:

```sql
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'athlete_profiles'
  AND column_name IN (
    'hasRunBefore',
    'currentlyInjured', 
    'avgSleepHours',
    'tracksMenstrualCycle',
    'avgCycleLength',
    'lastPeriodDate',
    'workDemand',
    'familyDemand'
  )
ORDER BY column_name;
```

**Esperado:** 8 linhas

---

### 2. Testar inserção:

```sql
-- Testar se campos funcionam:
SELECT 
  id,
  "userId",
  "hasRunBefore",
  "currentlyInjured",
  "avgSleepHours"
FROM "athlete_profiles"
LIMIT 5;

-- Deve retornar perfis com os novos campos
-- (valores default ou NULL para perfis antigos)
```

---

### 3. Testar UPDATE:

```sql
-- Atualizar um perfil de teste:
UPDATE "athlete_profiles"
SET 
  "hasRunBefore" = true,
  "currentlyInjured" = false,
  "avgSleepHours" = 7.5
WHERE id = (SELECT id FROM "athlete_profiles" LIMIT 1)
RETURNING id, "hasRunBefore", "avgSleepHours";

-- Deve funcionar sem erros
```

---

## 🎯 CHECKLIST VALIDAÇÃO

```
[ ] 1. Tabela _prisma_migrations criada
[ ] 2. Campos v3 adicionados (8 campos)
[ ] 3. Migration registrada na tabela
[ ] 4. SELECT funciona
[ ] 5. UPDATE funciona
[ ] 6. Produção testada (onboarding)
```

---

## 🚨 TROUBLESHOOTING

### Erro: "permission denied"

**Causa:** Usuário sem permissão  
**Solução:** Usar usuário admin do Neon

### Erro: "table athlete_profiles does not exist"

**Causa:** Conectado no banco errado  
**Solução:** Verificar DATABASE_URL

### Erro: "column already exists"

**Causa:** Campos já foram adicionados  
**Solução:** Pular PASSO 3B, ir direto para PASSO 4

---

## 📝 DEPOIS DE APLICAR

1. ✅ Forçar novo deploy no Vercel (se necessário)
2. ✅ Testar onboarding em produção
3. ✅ Verificar logs do Vercel
4. ✅ Confirmar campos aparecem na UI

---

## 🎉 SUCESSO!

Quando tudo funcionar, você verá:

```sql
SELECT COUNT(*) FROM "_prisma_migrations";
-- Retorna: Número > 0

SELECT COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'athlete_profiles' 
  AND column_name = 'hasRunBefore';
-- Retorna: 1

-- Produção:
-- ✅ Onboarding mostra campos v3
-- ✅ Dados são salvos
-- ✅ Planos são gerados
```

**Migration v3.0.0 aplicada com sucesso! 🚀**

