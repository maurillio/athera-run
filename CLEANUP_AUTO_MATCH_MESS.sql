-- =====================================================
-- CLEANUP: Reverter bagunça do auto-match
-- Data: 05/12/2025
-- Versão: v4.0.45-cleanup
-- Problema: plannedDate preenchido incorretamente
-- =====================================================

-- 🔍 VERIFICAÇÃO: Tabela correta é completed_workouts (snake_case)
-- Schema: completed_workouts ← @@map("completed_workouts")

-- Ver treinos afetados (quinta 27/11)
SELECT 
    id,
    type,
    date,
    distance,
    was_planned,
    planned_date,
    notes
FROM completed_workouts
WHERE date::date = '2025-11-27'
ORDER BY id;

-- Ver TODOS os treinos com plannedDate = mesma data (bug)
SELECT 
    id,
    type,
    date::date as exec_date,
    planned_date::date as planned,
    distance,
    was_planned
FROM completed_workouts
WHERE planned_date IS NOT NULL
  AND date::date = planned_date::date
ORDER BY date DESC;

-- 🔧 LIMPAR plannedDate dos treinos com mesma data
-- Lógica: Se executou no dia planejado, plannedDate deve ser NULL
BEGIN;

UPDATE completed_workouts
SET planned_date = NULL
WHERE planned_date IS NOT NULL
  AND date::date = planned_date::date;

COMMIT;

-- ✅ VALIDAÇÃO: Verificar limpeza
SELECT 
    id,
    type,
    date,
    distance,
    was_planned,
    planned_date,
    notes
FROM completed_workouts
WHERE date::date = '2025-11-27'
ORDER BY id;

-- Verificar se ainda há plannedDate = mesma data
SELECT COUNT(*) as remaining_bugs
FROM completed_workouts
WHERE planned_date IS NOT NULL
  AND date::date = planned_date::date;

-- Resultado esperado: 0

-- =====================================================
-- EXPLICAÇÃO:
-- - planned_date = NULL → executado no dia correto (não é substituição)
-- - planned_date != NULL → substituição (executado em dia diferente)
-- - Bug: auto-match setou planned_date = data execução (errado!)
-- =====================================================
