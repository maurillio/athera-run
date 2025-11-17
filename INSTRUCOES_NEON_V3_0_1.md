# 🚨 URGENTE: Erro "athlete_profiles" não existe

## 📍 ONDE VOCÊ ESTÁ:

Você está tentando aplicar migration mas:
❌ Tabela `athlete_profiles` não existe
❌ Pode estar no banco ERRADO

---

## ✅ SOLUÇÃO RÁPIDA (3 passos):

### PASSO 1: Descobrir qual banco tem seus dados

**No Neon SQL Editor, execute:**

```sql
SELECT current_database();
```

**Anote o resultado:** `_____________`

---

### PASSO 2: Ver as tabelas deste banco

**Execute:**

```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**Resultado esperado:**

✅ Se aparecer 10+ tabelas (users, accounts, athlete_profiles, etc):
   → Você está no banco CORRETO! 
   → Vá para PASSO 3

❌ Se aparecer 0-2 tabelas ou sem athlete_profiles:
   → Banco ERRADO!
   → Continue lendo abaixo

---

### PASSO 3A: Se tem athlete_profiles (banco correto)

**Execute a migration:**

Use o arquivo: `NEON_MIGRATION_SIMPLE.sql`

```sql
-- Copiar TODO o conteúdo do arquivo
-- Colar no SQL Editor
-- Run
```

✅ **Pronto!** Migration aplicada.

---

### PASSO 3B: Se NÃO tem athlete_profiles (banco errado)

#### 🔍 Encontrar o banco correto:

**Opção 1: Listar todos os bancos**

```sql
SELECT datname FROM pg_database WHERE datistemplate = false;
```

Vai aparecer algo como:
- neondb
- athera
- postgres
- main

**Teste cada um:**

1. No Neon, **dropdown no canto superior** → Selecionar outro banco
2. Executar: `SELECT tablename FROM pg_tables WHERE schemaname = 'public';`
3. Ver se aparece `athlete_profiles`
4. Se aparecer: **ESTE é o banco correto!**

---

**Opção 2: Verificar qual banco a Vercel usa**

1. Ir em: **Vercel Dashboard**
2. **Settings** → **Environment Variables**
3. Procurar: `DATABASE_URL`
4. Ver o nome do banco na URL:
   ```
   postgresql://user:pass@host/NOME_DO_BANCO?params
                                 ^^^^^^^^^^^^^
                                 Este nome!
   ```
5. Conectar neste banco específico no Neon
6. Executar migration

---

## 🎯 CENÁRIO MAIS PROVÁVEL:

**Você está conectado no banco DEFAULT do Neon (vazio).**

**Seu banco de PRODUÇÃO tem outro nome.**

**Solução:**
1. Verificar DATABASE_URL na Vercel
2. Conectar no banco que a URL indica
3. Aplicar migration nele

---

## 📋 CHECKLIST:

```
[ ] Executei: SELECT current_database();
    Resultado: _____________

[ ] Executei: SELECT tablename FROM pg_tables...
    Total tabelas: _____________

[ ] Encontrei athlete_profiles?
    ☐ SIM → Aplicar migration
    ☐ NÃO → Mudar de banco

[ ] Verifiquei DATABASE_URL da Vercel?
    Nome do banco: _____________

[ ] Conectei no banco correto no Neon?
    ☐ SIM

[ ] Apliquei migration?
    ☐ SIM
```

---

## 💡 DICA:

**Se seu app está FUNCIONANDO em produção:**

Então o banco EXISTE e tem dados!

Problema é só você conectar no banco certo no Neon Console.

---

## 📞 PRECISA DE AJUDA?

Execute o arquivo: **QUERIES_DIAGNOSTICO.sql**

Copie os resultados e compartilhe para análise.

---

**Próximo passo:** Execute as queries de diagnóstico e me envie os resultados.

