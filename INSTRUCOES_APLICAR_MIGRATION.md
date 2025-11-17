# 🗄️ INSTRUÇÕES - APLICAR MIGRATION NO NEON

**IMPORTANTE:** Execute ANTES de testar o sistema!

## Passo 1: Acessar Neon Dashboard
1. Abra: https://console.neon.tech
2. Faça login
3. Selecione seu projeto Athera Run

## Passo 2: Abrir SQL Editor
1. No menu lateral, clique em "SQL Editor"
2. Ou vá direto para a aba "SQL"

## Passo 3: Executar Migration
1. Copie TODO o conteúdo do arquivo: `apply_lgpd_migration.sql`
2. Cole no SQL Editor do Neon
3. Clique em "Run" ou pressione Ctrl+Enter
4. Aguarde confirmação: "Query executed successfully"

## Passo 4: Verificar
Execute para confirmar:
```sql
-- Verificar tabela criada
SELECT * FROM user_consents LIMIT 1;

-- Verificar índices
SELECT indexname FROM pg_indexes WHERE tablename = 'user_consents';
```

## ✅ Pronto!
Tabelas criadas com sucesso. Sistema pronto para usar.

---

**Arquivo da migration:** `apply_lgpd_migration.sql`
**Tempo estimado:** 30 segundos
