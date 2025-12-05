import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * API Admin: Cleanup Auto-Match Bug
 * 
 * Problema: planned_date preenchido incorretamente em v4.0.44
 * - Se executado no DIA PLANEJADO → planned_date deve ser NULL
 * - planned_date só para SUBSTITUIÇÕES (dia diferente)
 * 
 * Uso: GET /api/admin/cleanup?action=check (ver bugs)
 *      POST /api/admin/cleanup (executar limpeza)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'check') {
      // Verificar treinos com bug (planned_date = data execução)
      const bugged = await prisma.$queryRaw<Array<{
        id: number;
        type: string;
        date: Date;
        planned_date: Date | null;
        distance: number | null;
        was_planned: boolean;
      }>>`
        SELECT id, type, date, planned_date, distance, was_planned
        FROM completed_workouts
        WHERE planned_date IS NOT NULL
          AND date::date = planned_date::date
        ORDER BY date DESC
        LIMIT 50
      `;

      return NextResponse.json({
        status: 'check',
        buggedCount: bugged.length,
        bugs: bugged.map(w => ({
          id: w.id,
          type: w.type,
          date: w.date.toISOString().split('T')[0],
          distance: w.distance,
          wasPlanned: w.was_planned
        })),
        message: bugged.length === 0 
          ? 'Nenhum bug encontrado! Banco limpo.' 
          : `${bugged.length} treinos com planned_date incorreto.`
      });
    }

    return NextResponse.json({
      status: 'ready',
      message: 'Cleanup API ready. Use ?action=check to verify or POST to cleanup.'
    });

  } catch (error) {
    console.error('[Cleanup API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check cleanup status' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('[Cleanup API] Starting cleanup...');

    // Contar bugs antes
    const bugsBefore = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM completed_workouts
      WHERE planned_date IS NOT NULL
        AND date::date = planned_date::date
    `;

    const countBefore = Number(bugsBefore[0].count);
    console.log(`[Cleanup API] Found ${countBefore} bugs`);

    if (countBefore === 0) {
      return NextResponse.json({
        status: 'clean',
        message: 'Banco já está limpo! Nenhuma ação necessária.',
        bugsBefore: 0,
        bugsAfter: 0,
        cleaned: 0
      });
    }

    // Limpar planned_date quando mesma data de execução
    const result = await prisma.$executeRaw`
      UPDATE completed_workouts
      SET planned_date = NULL
      WHERE planned_date IS NOT NULL
        AND date::date = planned_date::date
    `;

    console.log(`[Cleanup API] Cleaned ${result} records`);

    // Verificar pós-cleanup
    const bugsAfter = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM completed_workouts
      WHERE planned_date IS NOT NULL
        AND date::date = planned_date::date
    `;

    const countAfter = Number(bugsAfter[0].count);

    return NextResponse.json({
      status: 'success',
      message: 'Cleanup concluído! RECARREGUE A PÁGINA (Ctrl+Shift+R) para ver mudanças.',
      bugsBefore: countBefore,
      bugsAfter: countAfter,
      cleaned: result,
      explanation: {
        before: 'planned_date = data execução (bug auto-match)',
        after: 'planned_date = NULL (treino executado no dia correto)',
        substitutions: 'planned_date != NULL mantido para substituições reais'
      },
      note: 'IMPORTANTE: Faça hard refresh (Ctrl+Shift+R ou Cmd+Shift+R) para limpar cache!'
    });

  } catch (error) {
    console.error('[Cleanup API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Cleanup failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
