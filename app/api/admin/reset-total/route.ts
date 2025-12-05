import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * API Admin: RESET TOTAL
 * 
 * Limpa TUDO relacionado a matches (auto e manual)
 * Volta banco ao estado "virgem" antes de qualquer match
 */
export async function POST(request: Request) {
  try {
    console.log('[RESET TOTAL] Iniciando limpeza completa...');

    // 1. Limpar CompletedWorkouts
    const completedResult = await prisma.completedWorkout.updateMany({
      where: {
        OR: [
          { wasPlanned: true },
          { plannedDate: { not: null } }
        ]
      },
      data: {
        wasPlanned: false,
        plannedDate: null
      }
    });
    console.log(`[RESET TOTAL] CompletedWorkouts limpos: ${completedResult.count}`);

    // 2. Limpar CustomWorkouts (workouts planejados)
    const customResult = await prisma.customWorkout.updateMany({
      where: {
        OR: [
          { completedWorkoutId: { not: null } },
          { executedWorkoutId: { not: null } },
          { wasSubstitution: true }
        ]
      },
      data: {
        completedWorkoutId: null,
        executedWorkoutId: null,
        wasSubstitution: false
      }
    });
    console.log(`[RESET TOTAL] CustomWorkouts limpos: ${customResult.count}`);

    // 3. Deletar WorkoutAdjustments (matches manuais)
    const adjustmentsResult = await prisma.workoutAdjustment.deleteMany({
      where: {
        adjustmentType: 'manual_match'
      }
    });
    console.log(`[RESET TOTAL] WorkoutAdjustments deletados: ${adjustmentsResult.count}`);

    // Revalidar cache
    revalidatePath('/[locale]/(protected)/plano');

    return NextResponse.json({ 
      status: 'reset_complete',
      completedWorkouts: completedResult.count,
      customWorkouts: customResult.count,
      adjustments: adjustmentsResult.count,
      message: `RESET TOTAL CONCLUÍDO! 
        - ${completedResult.count} CompletedWorkouts limpos
        - ${customResult.count} CustomWorkouts limpos
        - ${adjustmentsResult.count} Adjustments deletados
        
        RECARREGUE A PÁGINA (Ctrl+Shift+R)!`
    });
  } catch (error) {
    console.error('[RESET TOTAL] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to reset', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
