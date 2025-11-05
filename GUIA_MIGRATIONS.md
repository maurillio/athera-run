# 🔄 Guia Completo - Database Migrations

**Última atualização:** 05/Nov/2025 13:15 UTC  
**Sistema:** Prisma Migrate  
**Status:** ✅ Automático no Vercel

---

## 🎯 TL;DR

**Desde 05/Nov/2025:**
- ✅ Migrations são aplicadas AUTOMATICAMENTE no Vercel durante o deploy
- ✅ Não precisa mais rodar `prisma migrate deploy` manualmente
- ✅ Basta fazer `git push` e o Vercel cuida do resto

---

## 📋 Como Funciona Agora

### Build Command no Vercel

**Arquivo:** `vercel.json`

```json
{
  "buildCommand": "cd nextjs_space && npm install --force && npx prisma generate && npx prisma migrate deploy && npm run build"
}
```

### Fluxo Automático

```
Git Push
   ↓
Vercel Build Iniciado
   ↓
npm install (dependências)
   ↓
npx prisma generate (client)
   ↓
npx prisma migrate deploy ⭐ (APLICA MIGRATIONS)
   ↓
npm run build (Next.js)
   ↓
Deploy Concluído ✅
```

---

## 🛠️ Criar Nova Migration

### 1. Alterar Schema

**Arquivo:** `nextjs_space/prisma/schema.prisma`

```prisma
// Exemplo: Adicionar novo campo
model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  // ... campos existentes ...
  
  // NOVO CAMPO
  phoneNumber String? // Número de telefone (opcional)
  
  @@map("users")
}
```

### 2. Criar Migration (Local)

```bash
cd nextjs_space

# Criar migration
npx prisma migrate dev --name add_user_phone_number

# Prisma vai:
# 1. Gerar SQL da migration
# 2. Aplicar no banco de dados local
# 3. Regenerar Prisma Client
```

### 3. Verificar Migration Criada

```bash
# Verificar pasta de migrations
ls -la prisma/migrations/

# Verá algo como:
# 20251105131500_add_user_phone_number/
#   └── migration.sql
```

### 4. Commit e Push

```bash
git add prisma/schema.prisma
git add prisma/migrations/
git commit -m "feat(db): add phoneNumber field to User model"
git push origin main
```

### 5. Deploy Automático

```
Vercel detecta push
   ↓
Build iniciado
   ↓
Migration aplicada AUTOMATICAMENTE no banco de produção ✅
   ↓
Build completo
   ↓
Deploy concluído
```

---

## 🔍 Verificar Migrations Aplicadas

### No Banco de Dados

```bash
cd nextjs_space

# Ver status das migrations
npx prisma migrate status

# Output exemplo:
# Database schema is up to date!
# 
# Following migrations have been applied:
# 20251103200800_add_comprehensive_athlete_data_v1_3_0
# 20251104215000_add_user_locale
# 20251105131500_add_user_phone_number
```

### Tabela _prisma_migrations

O Prisma mantém uma tabela `_prisma_migrations` no banco que registra todas as migrations aplicadas:

```sql
SELECT * FROM _prisma_migrations ORDER BY applied_at DESC;
```

---

## ⚠️ Problemas Comuns e Soluções

### 1. "Migration failed to apply"

**Causa:** Conflito no schema (ex: coluna já existe)

**Solução:**
```bash
# Verificar status
npx prisma migrate status

# Marcar migration como aplicada (se já foi aplicada manualmente)
npx prisma migrate resolve --applied "20251105131500_nome_migration"

# OU resetar (⚠️ CUIDADO: apaga dados)
npx prisma migrate reset
```

### 2. "The column X does not exist"

**Causa:** Migration não foi aplicada no banco de produção

**Solução (Antes de 05/Nov/2025):**
```bash
# Aplicar manualmente
cd nextjs_space
npx prisma migrate deploy
```

**Solução (Depois de 05/Nov/2025):**
- ✅ Não deve mais acontecer (migrations automáticas)
- Se acontecer: Verificar se `vercel.json` está correto
- Forçar redeploy no Vercel

### 3. "Schema inconsistency detected"

**Causa:** Schema local diferente do banco

**Solução:**
```bash
# Gerar nova migration baseada nas diferenças
npx prisma migrate dev --name fix_schema_inconsistency

# OU sincronizar forçadamente (⚠️ CUIDADO)
npx prisma db push --accept-data-loss
```

---

## 📊 Histórico de Migrations (Athera Run)

| Migration | Data | Descrição |
|-----------|------|-----------|
| `20251103200800_add_comprehensive_athlete_data_v1_3_0` | 03/Nov/2025 | v1.3.0 - 13 novos campos atleta |
| `20251104215000_add_user_locale` | 04/Nov/2025 | v1.4.0 - Sistema i18n (locale field) |

---

## 🎓 Boas Práticas

### ✅ FAZER

1. **Sempre criar migration via `prisma migrate dev`**
   - Não editar manualmente arquivos SQL
   - Deixar o Prisma gerar o SQL

2. **Nomes descritivos**
   ```bash
   # ✅ BOM
   npx prisma migrate dev --name add_user_phone_number
   npx prisma migrate dev --name create_notification_table
   
   # ❌ RUIM
   npx prisma migrate dev --name update
   npx prisma migrate dev --name fix
   ```

3. **Testar localmente ANTES de push**
   ```bash
   # 1. Criar migration
   npx prisma migrate dev --name minha_mudanca
   
   # 2. Testar aplicação local
   yarn dev
   
   # 3. Verificar se tudo funciona
   # ...
   
   # 4. Commitar e pushar
   git push origin main
   ```

4. **Backup antes de migrations arriscadas**
   ```bash
   # Backup do banco antes de migration que altera/remove dados
   pg_dump -h 45.232.21.67 -U user -d atherarun > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

### ❌ NÃO FAZER

1. **Não editar migrations já aplicadas**
   - Se migration já foi aplicada, criar uma nova para reverter

2. **Não usar `prisma db push` em produção**
   - Use apenas para prototipagem local
   - Produção sempre via `prisma migrate`

3. **Não deletar pasta `prisma/migrations/`**
   - É o histórico completo do schema
   - Commit sempre no Git

---

## 🔧 Comandos Úteis

```bash
# Ver status das migrations
npx prisma migrate status

# Aplicar migrations pendentes (se houver)
npx prisma migrate deploy

# Criar nova migration
npx prisma migrate dev --name descricao

# Resetar banco (⚠️ APAGA TUDO)
npx prisma migrate reset

# Marcar migration como aplicada
npx prisma migrate resolve --applied "nome_migration"

# Marcar migration como rollback
npx prisma migrate resolve --rolled-back "nome_migration"

# Gerar Prisma Client
npx prisma generate

# Sincronizar schema sem migration (dev only)
npx prisma db push
```

---

## 📞 Troubleshooting

### Erro no Deploy do Vercel

**Logs mostram:** `Error: P2022 - The column X does not exist`

**Causa:** Migration não foi aplicada

**Solução:**
1. Verificar se `vercel.json` tem `npx prisma migrate deploy` no buildCommand
2. Forçar redeploy no Vercel
3. Verificar logs do Vercel para ver se migration rodou

### Migration Pendente Local

**Comando:** `npx prisma migrate status`  
**Output:** `Following migration have not yet been applied: ...`

**Solução:**
```bash
npx prisma migrate deploy
```

### Conflito de Merge em Migrations

**Situação:** Duas branches criaram migrations diferentes

**Solução:**
1. Manter ambas migrations
2. Resolver conflitos manualmente se houver
3. Rodar `npx prisma migrate dev` para aplicar ambas

---

## 🎉 Benefícios do Sistema Atual

✅ **Automático** - Migrations aplicadas no deploy  
✅ **Seguro** - Histórico completo no Git  
✅ **Rastreável** - Tabela `_prisma_migrations`  
✅ **Rollback fácil** - Via Git revert  
✅ **Zero downtime** - Migrations durante build  
✅ **Consistente** - Mesmo banco dev e prod  

---

**Atualizado em:** 05/Nov/2025 13:15 UTC  
**Próxima revisão:** Quando houver mudanças no processo
