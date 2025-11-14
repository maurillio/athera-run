# 🚀 DEPLOY v3.0.0 PARA PRODUÇÃO

**Data:** 2025-11-14 18:15  
**Versão:** v3.0.0  
**Status:** Pronto para deploy

---

## 📋 PRÉ-REQUISITOS

### ✅ Verificado:
- [x] Código v3.0.0 100% implementado
- [x] Migration criada (20251113144016_add_v3_profile_fields)
- [x] Frontend funcional
- [x] API funcional
- [x] Prompt v3 ativo

---

## 🔄 PROCESSO DE DEPLOY

### ETAPA 1: Commit e Push

```bash
cd /root/athera-run

# Adicionar documentação
git add AUDITORIA_V3_IMPLEMENTACAO_COMPLETA.md
git add CORRECAO_AUDITORIA_V3.md
git add RESUMO_AUDITORIA_V3.md
git add V3_STATUS_FINAL.txt
git add LEIA_PRIMEIRO_AUDITORIA_V3.txt
git add test_v3_complete.sh

# Commit
git commit -m "docs: add v3.0.0 audit and verification documentation

- Complete audit report (corrected to 100%)
- Verification script proving full implementation
- Final status documents
- All v3 features confirmed working:
  - Multi-dimensional profile analysis
  - Reverse planning
  - Special adjustments (age, gender, injuries, sleep)
  - Frontend UI (Step 2 & 4)
  - API routes (create & update)
  - 8 elite methodologies integrated

Status: Ready for production deployment"

# Push para main (Vercel vai fazer deploy automático)
git push origin main
```

---

### ETAPA 2: Aplicar Migration no Neon

**⚠️ IMPORTANTE:** Migration já está criada, só precisa aplicar no banco de produção.

#### Opção A: Via Vercel Dashboard (Recomendado)

1. Acesse: https://vercel.com/seu-projeto/settings/environment-variables
2. Confirme que `DATABASE_URL` está configurada
3. Vercel irá executar `npx prisma migrate deploy` automaticamente no próximo deploy

#### Opção B: Via Neon Console

```sql
-- Conectar no Neon Console: https://console.neon.tech/

-- Verificar se migration já foi aplicada
SELECT * FROM "_prisma_migrations" 
WHERE migration_name = '20251113144016_add_v3_profile_fields';

-- Se NÃO existir, aplicar manualmente:
-- (Copiar SQL de: prisma/migrations/20251113144016_add_v3_profile_fields/migration.sql)

ALTER TABLE "athlete_profiles" 
ADD COLUMN IF NOT EXISTS "hasRunBefore" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "currentlyInjured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "avgSleepHours" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "tracksMenstrualCycle" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "avgCycleLength" INTEGER,
ADD COLUMN IF NOT EXISTS "lastPeriodDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "workDemand" TEXT,
ADD COLUMN IF NOT EXISTS "familyDemand" TEXT;

-- Registrar migration
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
  'checksum_aqui',
  NOW(),
  '20251113144016_add_v3_profile_fields',
  NULL,
  NULL,
  NOW(),
  1
);
```

#### Opção C: Via Prisma CLI (Local → Produção)

```bash
# Exportar DATABASE_URL de produção (temporariamente)
export DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Aplicar migration
npx prisma migrate deploy

# Verificar
npx prisma migrate status
```

---

### ETAPA 3: Verificar Deploy

#### 3.1 Vercel Build Logs

```bash
# Acessar: https://vercel.com/seu-projeto/deployments

# Verificar logs:
✅ Building...
✅ Installing dependencies...
✅ Running build...
✅ Generating Prisma Client...
✅ Build completed
✅ Deploying...
✅ Deployment ready
```

#### 3.2 Verificar Migration

```bash
# Logs da Vercel devem mostrar:
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database

1 migration found in prisma/migrations
Applying migration `20251113144016_add_v3_profile_fields`

✅ All migrations have been successfully applied.
```

#### 3.3 Testar em Produção

```bash
# 1. Acesse: https://seu-app.vercel.app/onboarding

# 2. Verifique Step 2:
#    - Campo "Você já correu antes?" aparece?

# 3. Verifique Step 4:
#    - Campo "Está lesionado?" aparece?
#    - Campo "Horas de sono?" aparece?
#    - Campo "Ciclo menstrual?" aparece (mulheres)?

# 4. Complete onboarding e gere um plano

# 5. Verificar banco (Neon Console):
SELECT 
  "hasRunBefore",
  "currentlyInjured", 
  "avgSleepHours",
  "tracksMenstrualCycle"
FROM "athlete_profiles"
ORDER BY "createdAt" DESC
LIMIT 5;

# Deve mostrar valores reais (não só defaults)
```

---

## 🔍 CHECKLIST DE VALIDAÇÃO

### Pré-Deploy:
- [x] Código v3.0.0 completo
- [x] Migration criada
- [x] Testes locais passando
- [ ] Commit criado
- [ ] Push para main

### Durante Deploy:
- [ ] Vercel build iniciado
- [ ] Build passou sem erros
- [ ] Migration aplicada
- [ ] Deploy concluído

### Pós-Deploy:
- [ ] Site acessível
- [ ] Onboarding funciona
- [ ] Campos v3 aparecem na UI
- [ ] Dados salvam no banco
- [ ] Planos são gerados com v3

---

## 🚨 TROUBLESHOOTING

### Erro: "Column does not exist"

**Causa:** Migration não foi aplicada  
**Solução:**
```bash
# Forçar migration via Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy
```

### Erro: "Prisma Client outdated"

**Causa:** Client não regenerado  
**Solução:**
```bash
npx prisma generate
# Depois fazer novo deploy
```

### Campos não aparecem na UI

**Causa:** Cache do navegador  
**Solução:**
- Ctrl + Shift + R (hard refresh)
- Ou limpar cache do navegador

### Migration já aplicada mas Vercel não reconhece

**Solução:**
```bash
# No Vercel Dashboard > Settings > General
# Forçar novo deploy: Deployments > ... > Redeploy
```

---

## 📊 EXPECTATIVAS

### O que vai acontecer:

1. **Usuários existentes:**
   - Campos v3 terão valores default (hasRunBefore=true, etc)
   - Podem atualizar perfil para informar dados reais
   - Planos futuros usarão dados atualizados

2. **Usuários novos:**
   - Verão campos v3 no onboarding
   - Dados serão coletados e salvos
   - Planos serão 100% personalizados desde o início

3. **Geração de planos:**
   - Prompt v3 ativo para todos
   - Reverse planning funcionando
   - Multi-dimensional analysis
   - Special adjustments aplicados

---

## ✅ SUCESSO!

Quando tudo estiver funcionando, você verá:

```
✅ Deploy concluído
✅ Migration aplicada
✅ Campos v3 na UI
✅ Dados salvando
✅ Planos sendo gerados com v3
✅ Sistema 100% v3.0.0
```

---

## 📞 SUPORTE

**Logs úteis:**
- Vercel: https://vercel.com/seu-projeto/deployments
- Neon: https://console.neon.tech/
- Database: SELECT * FROM "_prisma_migrations"

**Rollback (se necessário):**
```bash
# Reverter para commit anterior
git revert HEAD
git push origin main
```

---

**Pronto para iniciar o deploy!** 🚀

