#!/usr/bin/env tsx
/**
 * CLEANUP: Reverter bagunça do auto-match v4.0.44
 * Data: 05/12/2025
 * 
 * Problema: planned_date preenchido incorretamente
 * - Se treino executado no DIA PLANEJADO, planned_date deve ser NULL
 * - planned_date só deve ter valor em SUBSTITUIÇÕES (dia diferente)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 VERIFICAÇÃO PRÉ-CLEANUP\n');

  // Ver treinos com bug (planned_date = data execução)
  const bugged = await prisma.$queryRaw<Array<{
    id: number;
    type: string;
    date: Date;
    planned_date: Date | null;
    distance: number | null;
  }>>`
    SELECT id, type, date, planned_date, distance
    FROM completed_workouts
    WHERE planned_date IS NOT NULL
      AND date::date = planned_date::date
    ORDER BY date DESC
    LIMIT 20
  `;

  console.log(`Treinos com bug (planned_date = data execução): ${bugged.length}`);
  bugged.forEach(w => {
    console.log(`  - ID ${w.id}: ${w.type}, ${w.date.toISOString().split('T')[0]}, ${w.distance}km`);
  });

  if (bugged.length === 0) {
    console.log('\n✅ Nenhum bug encontrado! Banco já está limpo.');
    return;
  }

  console.log('\n🔧 LIMPANDO...\n');

  // Limpar planned_date quando mesma data de execução
  const result = await prisma.$executeRaw`
    UPDATE completed_workouts
    SET planned_date = NULL
    WHERE planned_date IS NOT NULL
      AND date::date = planned_date::date
  `;

  console.log(`✅ ${result} treinos limpos!\n`);

  // Validação pós-cleanup
  const remaining = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*) as count
    FROM completed_workouts
    WHERE planned_date IS NOT NULL
      AND date::date = planned_date::date
  `;

  const count = Number(remaining[0].count);
  console.log('🔍 VERIFICAÇÃO PÓS-CLEANUP\n');
  console.log(`Bugs restantes: ${count}`);

  if (count === 0) {
    console.log('\n✅ CLEANUP CONCLUÍDO COM SUCESSO!');
    console.log('\nAgora:');
    console.log('- Treinos executados no dia planejado: planned_date = NULL');
    console.log('- Substituições (outro dia): planned_date != NULL');
  } else {
    console.log('\n⚠️ Ainda há bugs! Verificar manualmente.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
