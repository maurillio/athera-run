-- ═══════════════════════════════════════════════════════════════
-- QUERIES DE DIAGNÓSTICO - Execute no Neon SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 🔍 QUERY 1: Qual banco estou conectado?
SELECT current_database() as banco_atual;

-- 🔍 QUERY 2: Listar TODOS os bancos disponíveis
SELECT datname as nome_banco 
FROM pg_database 
WHERE datistemplate = false
ORDER BY datname;

-- 🔍 QUERY 3: Quantas tabelas existem no banco atual?
SELECT COUNT(*) as total_tabelas
FROM pg_tables 
WHERE schemaname = 'public';

-- 🔍 QUERY 4: Listar TODAS as tabelas do banco atual
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 🔍 QUERY 5: Procurar tabelas relacionadas a "athlete" ou "profile"
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND (
    tablename ILIKE '%athlete%' 
    OR tablename ILIKE '%profile%'
  )
ORDER BY tablename;

-- 🔍 QUERY 6: Se encontrou a tabela, ver suas colunas
-- (SUBSTITUA 'athlete_profiles' pelo nome correto se for diferente)
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'athlete_profiles'
ORDER BY ordinal_position;

-- 🔍 QUERY 7: Ver quantos registros existem (se tabela existir)
SELECT COUNT(*) as total_registros
FROM athlete_profiles;

-- ═══════════════════════════════════════════════════════════════
-- INSTRUÇÕES:
-- 
-- 1. Copie QUERY por QUERY (não tudo de uma vez)
-- 2. Cole no Neon SQL Editor
-- 3. Execute (Run)
-- 4. Anote os resultados
-- 5. Compartilhe os resultados para análise
-- ═══════════════════════════════════════════════════════════════

-- 📋 RESULTADOS ESPERADOS:
--
-- QUERY 1: Deve retornar algo como "neondb" ou "athera"
-- QUERY 2: Deve listar 1 ou mais bancos
-- QUERY 3: Deve retornar número > 0 (ex: 15, 20 tabelas)
-- QUERY 4: Deve listar: users, accounts, sessions, athlete_profiles, etc
-- QUERY 5: Deve encontrar athlete_profiles (ou similar)
-- QUERY 6: Deve mostrar todas as colunas da tabela
-- QUERY 7: Deve mostrar quantos atletas cadastrados
