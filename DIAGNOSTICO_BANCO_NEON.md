# 🚨 DIAGNÓSTICO: Tabela athlete_profiles não existe

## ❌ ERRO:
```
ERROR: relation "athlete_profiles" does not exist (SQLSTATE 42P01)
```

## 🔍 O QUE ISSO SIGNIFICA:

Você está conectado em um banco que:
- ❌ NÃO tem a tabela `athlete_profiles`
- ❌ Pode ser um banco novo/vazio
- ❌ Pode ser o banco ERRADO

---

## ✅ PASSO 1: Verificar qual banco você está usando

Execute no Neon SQL Editor:

```sql
-- Ver banco atual
SELECT current_database();

-- Ver TODAS as tabelas deste banco
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

### O que você deve ver:

**Se aparecer muitas tabelas** (users, sessions, accounts, etc):
- ✅ Você está no banco CORRETO de produção
- ❌ MAS algo está errado (tabela tem outro nome?)

**Se aparecer 0 tabelas ou poucas:**
- ❌ Você está em um banco VAZIO
- ❌ Precisa conectar no banco correto

---

## ✅ PASSO 2: Encontrar o banco correto

### Opção A: Via Neon Dashboard

1. **Neon Console** → Projeto athera-run
2. **Settings** → **Connection String**
3. Verificar DATABASE_URL:
   ```
   postgresql://user:password@ep-xxx.region.neon.tech/NOME_DO_BANCO
                                                        ^^^^^^^^^^^^
                                                        Este é o banco!
   ```

### Opção B: Listar todos os bancos

Execute no Neon SQL Editor:

```sql
-- Listar todos os bancos do cluster
SELECT datname FROM pg_database 
WHERE datistemplate = false;
```

**Possíveis nomes:**
- `neondb` (default do Neon)
- `athera`
- `athera_production`
- `main`

---

## ✅ PASSO 3: Conectar no banco correto

### No Neon SQL Editor:

1. **Canto superior direito:** Dropdown do banco
2. **Selecionar:** O banco que tem as tabelas
3. **Verificar:**
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
   ```
4. **Deve aparecer:**
   - users
   - accounts
   - sessions
   - athlete_profiles ← Esta!
   - training_plans
   - workouts
   - etc...

---

## ✅ PASSO 4: Verificar DATABASE_URL da Vercel

### Pode ser que o banco de PRODUÇÃO seja diferente!

1. **Vercel Dashboard:**
   - https://vercel.com/seu-projeto/settings/environment-variables

2. **Procurar:** `DATABASE_URL`

3. **Anotar o nome do banco:**
   ```
   postgresql://user:pass@ep-xxx.neon.tech/NOME_AQUI?sslmode=require
   ```

4. **Conectar neste banco específico no Neon**

---

## 🎯 CENÁRIOS POSSÍVEIS:

### Cenário 1: Banco de desenvolvimento vs produção

**Problema:** Você está no banco de dev, não de prod

**Solução:**
1. Verificar qual banco a Vercel usa (DATABASE_URL)
2. Conectar nesse banco específico no Neon
3. Executar migration nele

---

### Cenário 2: Tabela tem outro nome

**Problema:** Tabela pode ser `AthleteProfile` ou `AthleteProfiles`

**Teste:**
```sql
-- Buscar tabelas parecidas
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename ILIKE '%athlete%';

-- OU buscar todas com profile
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename ILIKE '%profile%';
```

**Se encontrar tabela com nome diferente:**
- Anotar o nome exato
- Usar esse nome no SQL da migration

---

### Cenário 3: Banco completamente novo

**Problema:** Prisma nunca rodou neste banco

**Solução:** Precisa aplicar TODAS as migrations, não só a v3

```bash
# Localmente (se tiver acesso ao DATABASE_URL de prod):
export DATABASE_URL="postgresql://..."
npx prisma migrate deploy

# Ou via Vercel:
# Forçar novo deploy que vai rodar migrations
```

---

## 📋 CHECKLIST DE DIAGNÓSTICO:

Execute estas queries NO NEON:

```sql
-- 1. Qual banco estou usando?
SELECT current_database();

-- 2. Quantas tabelas existem?
SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public';

-- 3. Quais são as tabelas?
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 4. Existe algo relacionado a athlete?
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
  AND (tablename ILIKE '%athlete%' OR tablename ILIKE '%profile%');
```

**Cole os resultados dessas queries aqui:**

```
Banco atual: _______________
Total tabelas: _______________
Tabelas encontradas:
- _____________
- _____________
- _____________

Tabelas athlete/profile:
- _____________
```

---

## ✅ PRÓXIMA AÇÃO:

**Aguardando você executar o diagnóstico acima.**

Depois de saber:
1. Qual banco você está conectado
2. Quantas tabelas existem
3. Se athlete_profiles existe (com esse nome exato)

Podemos:
- ✅ Aplicar migration no banco correto
- ✅ OU criar as tabelas se necessário
- ✅ OU conectar no banco certo

---

## 🚨 ATENÇÃO:

**NÃO execute migration em banco vazio!**

Isso pode:
- ❌ Criar estrutura incompleta
- ❌ Quebrar app em produção
- ❌ Perder dados

**SEMPRE verifique primeiro que está no banco correto de produção!**

---

## 💡 DICA RÁPIDA:

Se você tem acesso ao app em produção funcionando:

1. Acesse: https://seu-app.vercel.app
2. Se app funciona = banco existe e tem dados
3. Então: Problema é conexão errada no Neon Console
4. Solução: Conectar no banco que a Vercel usa

