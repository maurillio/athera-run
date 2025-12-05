import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  return handleCleanup(req);
}

export async function POST(req: NextRequest) {
  return handleCleanup(req);
}

async function handleCleanup(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CLEANUP TOTAL] Iniciando limpeza completa...');

    const result = await prisma.$transaction(async (tx) => {
      // 1. Resetar TODOS completedWorkouts
      const resetCompleted = await tx.completedWorkout.updateMany({
        data: {
          plannedDate: null,
          wasPlanned: false,
        },
      });

      // 2. Resetar TODOS customWorkouts
      const resetCustom = await tx.customWorkout.updateMany({
        data: {
          executedWorkoutId: null,
          wasSubstitution: false,
        },
      });

      // 3. Deletar TODOS workoutAdjustments
      const deleteAdjustments = await tx.workoutAdjustment.deleteMany({});

      return {
        completedReset: resetCompleted.count,
        customReset: resetCustom.count,
        adjustmentsDeleted: deleteAdjustments.count,
      };
    });

    console.log('[CLEANUP TOTAL] Resultado:', result);

    // Revalidar cache
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/[locale]/(protected)/plano', 'page');

    return NextResponse.json({
      status: 'success',
      message: 'Banco limpo completamente! Estado zero.',
      ...result,
    });

  } catch (error) {
    console.error('[CLEANUP TOTAL] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao limpar banco', details: String(error) },
      { status: 500 }
    );
  }
}
