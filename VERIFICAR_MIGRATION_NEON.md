# ✅ Como Verificar Migration no Neon

**Data:** 24/Nov/2025 19:45 UTC  
**Migration:** 20251124_convergence_v3_1_0  
**Objetivo:** Confirmar que a migration foi aplicada com sucesso

---

## 🎯 MÉTODOS DE VERIFICAÇÃO

### Método 1: Via Prisma (Recomendado) ⚡

```bash
# Verificar status de migrations
npx prisma migrate status

# Saída esperada:
# ✓ Migration 20251124_convergence_v3_1_0 applied
# Database schema is up to date!
```

**Se não estiver aplicada:**
```bash
# Aplicar manualmente
npx prisma migrate deploy

# Verificar novamente
npx prisma migrate status
```

---

### Método 2: Via Neon Dashboard 🖥️

1. **Acessar Neon Console**
   - URL: https://console.neon.tech
   - Login com sua conta

2. **Selecionar Projeto**
   - Projeto: atherarun (ou nome configurado)
   - Branch: main

3. **Abrir SQL Editor**
   - Menu lateral: "SQL Editor"
   - Ou usar Query Editor

4. **Executar Queries de Verificação**

#### Query 1: Verificar tabela _prisma_migrations
```sql
-- Ver todas migrations aplicadas
SELECT 
  migration_name,
  finished_at,
  applied_steps_count,
  logs
FROM _prisma_migrations
ORDER BY finished_at DESC
LIMIT 10;

-- Buscar especificamente nossa migration
SELECT *
FROM _prisma_migrations
WHERE migration_name = '20251124_convergence_v3_1_0';
```

**Resultado esperado:**
```
migration_name                     | finished_at              | applied_steps_count
-----------------------------------|--------------------------|--------------------
20251124_convergence_v3_1_0        | 2025-11-24 19:45:00.000  | 1
```

#### Query 2: Verificar comentários DEPRECATED
```sql
-- Verificar se campos foram marcados como DEPRECATED
SELECT 
    c.table_name,
    c.column_name,
    pgd.description
FROM pg_catalog.pg_statio_all_tables as st
INNER JOIN pg_catalog.pg_description pgd ON (pgd.objoid = st.relid)
INNER JOIN information_schema.columns c ON (
    pgd.objsubid = c.ordinal_position AND
    c.table_schema = st.schemaname AND
    c.table_name = st.relname
)
WHERE pgd.description LIKE '%DEPRECATED%'
  AND c.table_name = 'athlete_profiles';
```

**Resultado esperado (7 campos):**
```
table_name        | column_name          | description
------------------|----------------------|---------------------------
athlete_profiles  | goalDistance         | DEPRECATED - usar RaceGoal
athlete_profiles  | targetRaceDate       | DEPRECATED - usar RaceGoal
athlete_profiles  | targetTime           | DEPRECATED - usar RaceGoal
athlete_profiles  | injuries             | DEPRECATED - usar injuryDetails
athlete_profiles  | injuryHistory        | DEPRECATED - usar injuryDetails
athlete_profiles  | weeklyAvailability   | DEPRECATED - usar trainingSchedule
athlete_profiles  | trainingActivities   | DEPRECATED - usar trainingSchedule
```

#### Query 3: Verificar índices criados
```sql
-- Listar índices criados pela migration
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('athlete_profiles', 'race_goals')
  AND indexname LIKE 'idx_%'
ORDER BY indexname;
```

**Resultado esperado (4 índices):**
```
indexname                      | indexdef
-------------------------------|------------------------------------------
idx_athlete_vdot               | CREATE INDEX ... ON athlete_profiles(currentVDOT)
idx_race_date                  | CREATE INDEX ... ON race_goals(raceDate)
idx_race_goals_distance        | CREATE INDEX ... ON race_goals(distance)
idx_race_goals_status_priority | CREATE INDEX ... ON race_goals(status, priority)
```

#### Query 4: Verificar migração de dados para RaceGoal
```sql
-- Contar race goals criados pela migration
SELECT 
    COUNT(*) as total_race_goals,
    COUNT(CASE WHEN autoClassified = true THEN 1 END) as migrated_from_profile
FROM race_goals;

-- Ver exemplos de race goals migrados
SELECT 
    rg.id,
    rg.athleteId,
    rg.raceName,
    rg.distance,
    rg.raceDate,
    rg.targetTime,
    rg.autoClassified,
    rg.isPrimary
FROM race_goals rg
WHERE rg.autoClassified = true
LIMIT 5;
```

**Resultado esperado:**
- `autoClassified = true` indica que foi migrado de AthleteProfile
- `raceName = 'Corrida Principal'` é o nome padrão da migration

---

### Método 3: Via Vercel Logs 📊

```bash
# Ver logs do último deploy
vercel logs --follow

# Ou filtrar por "migration"
vercel logs | grep -i migration

# Ou ver logs de build
vercel logs --since=1h | grep -i prisma
```

**Sinais de sucesso:**
```
✓ Running prisma generate
✓ Running migrations...
✓ Migration 20251124_convergence_v3_1_0 applied successfully
```

**Sinais de problema:**
```
✗ Migration failed
✗ Database connection error
✗ Syntax error in migration
```

---

### Método 4: Via API do Sistema 🔌

**Testar endpoint de análise de campos:**
```bash
# Fazer request autenticado
curl -X GET https://atherarun.com/api/ai/field-analysis \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Se migration funcionou:**
- API deve retornar dados sem erro
- Campos deprecated aparecem com aviso
- RaceGoal está separado

---

## 🚨 TROUBLESHOOTING

### Problema 1: Migration não aparece como aplicada

**Causa:** Vercel ainda não rodou o build  
**Solução:**
```bash
# Forçar novo deploy
vercel --prod

# Ou via git
git commit --allow-empty -m "trigger: force deploy"
git push origin main
```

---

### Problema 2: Erro de conexão com banco

**Causa:** DATABASE_URL incorreta ou expirada  
**Solução:**
```bash
# Verificar variável no Vercel
vercel env ls

# Se necessário, atualizar
vercel env add DATABASE_URL production
# Cole a connection string do Neon
```

---

### Problema 3: Migration parcialmente aplicada

**Causa:** Erro durante execução  
**Solução:**
```bash
# Ver status detalhado
npx prisma migrate status

# Se necessário, resolver manualmente no Neon SQL Editor
# E marcar como aplicada:
INSERT INTO _prisma_migrations (
  migration_name,
  started_at,
  finished_at,
  applied_steps_count
) VALUES (
  '20251124_convergence_v3_1_0',
  NOW(),
  NOW(),
  1
);
```

---

### Problema 4: Dados não migrados para RaceGoal

**Causa:** Condição WHERE não encontrou dados  
**Verificar:**
```sql
-- Ver se existem profiles com goal data
SELECT 
    id,
    goalDistance,
    targetRaceDate,
    targetTime
FROM athlete_profiles
WHERE goalDistance IS NOT NULL
   OR targetRaceDate IS NOT NULL
   OR targetTime IS NOT NULL;
```

**Se retornar resultados, executar manualmente:**
```sql
-- Executar parte da migration novamente
INSERT INTO race_goals (
  "athleteId",
  "raceName",
  "distance",
  "raceDate",
  "targetTime",
  "priority",
  "autoClassified",
  "status",
  "isPrimary",
  "createdAt",
  "updatedAt"
)
SELECT 
  ap.id,
  'Corrida Principal',
  ap."goalDistance",
  ap."targetRaceDate",
  ap."targetTime",
  'A',
  true,
  'active',
  true,
  NOW(),
  NOW()
FROM athlete_profiles ap
WHERE ap."goalDistance" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM race_goals rg 
    WHERE rg."athleteId" = ap.id 
    AND rg."autoClassified" = true
  );
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Use este checklist para confirmar tudo:

### Via Prisma
- [ ] `npx prisma migrate status` mostra migration aplicada
- [ ] Sem erros no output

### Via Neon Dashboard
- [ ] Migration aparece em `_prisma_migrations`
- [ ] 7 campos marcados como DEPRECATED
- [ ] 4 índices criados (idx_*)
- [ ] Dados migrados para `race_goals` (se aplicável)

### Via Vercel
- [ ] Build concluído com sucesso
- [ ] Logs mostram "Migration applied"
- [ ] Site funcionando normalmente

### Funcional
- [ ] Perfil carrega sem erros
- [ ] 17 novos campos visíveis
- [ ] Disponibilidade editável funciona
- [ ] Performance tab mostra VDOT e paces

---

## 🎯 SCRIPT RÁPIDO DE VERIFICAÇÃO

```bash
#!/bin/bash
# verify-migration.sh

echo "🔍 Verificando Migration v3.1.0..."
echo ""

# 1. Status Prisma
echo "1️⃣  Prisma Migration Status:"
npx prisma migrate status
echo ""

# 2. Verificar no banco (via psql se disponível)
if command -v psql &> /dev/null; then
    echo "2️⃣  Verificando no banco..."
    psql $DATABASE_URL -c "
        SELECT migration_name, finished_at 
        FROM _prisma_migrations 
        WHERE migration_name LIKE '%20251124%';"
    echo ""
fi

# 3. Testar build local
echo "3️⃣  Build local:"
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Build OK"
else
    echo "❌ Build FALHOU"
fi
echo ""

echo "✅ Verificação completa!"
```

**Uso:**
```bash
chmod +x verify-migration.sh
./verify-migration.sh
```

---

## 📋 RESULTADO ESPERADO (SUCESSO)

Quando tudo estiver correto, você verá:

```
✅ Migration Status: Applied
✅ 7 campos DEPRECATED encontrados
✅ 4 índices criados
✅ Race goals migrados (se aplicável)
✅ Build Vercel concluído
✅ Site funcionando normalmente
✅ 17 novos campos visíveis no perfil
```

---

## 🆘 SUPORTE

Se algo não estiver funcionando:

1. **Ver logs:** `vercel logs --follow`
2. **Executar queries SQL** acima no Neon Dashboard
3. **Verificar variáveis:** `vercel env ls`
4. **Contato:** Ver GUIA_DEPLOY_v3_1_0.md seção Troubleshooting

---

**Criado em:** 24/Nov/2025 19:45 UTC  
**Versão:** v3.1.0  
**Status:** Pronto para uso  

✅ Use este guia para confirmar migration com confiança!
