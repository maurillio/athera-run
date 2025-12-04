import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // 1. Buscar perfil do atleta
    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    // 2. Buscar todos os CompletedWorkouts de corrida do atleta
    const completedRuns = await prisma.completedWorkout.findMany({
      where: {
        athleteId: profile.id,
        type: 'Run',
        // Apenas treinos que ainda não foram usados
        plannedWorkoutId: null,
        executedFor: { none: {} } // Não tem ninguém apontando pra ele via executedWorkoutId
      },
      orderBy: { date: 'desc' }
    });

    console.log(`[POPULATE_EXECUTED] Found ${completedRuns.length} unused completed runs`);

    let linked = 0;
    let skipped = 0;

    // 3. Para cada treino completado, verificar se existe CustomWorkout no mesmo dia
    for (const completed of completedRuns) {
      const dayStart = new Date(completed.date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(completed.date);
      dayEnd.setHours(23, 59, 59, 999);

      // Verificar se existe CustomWorkout planejado nesse dia
      const plannedWorkout = await prisma.customWorkout.findFirst({
        where: {
          week: {
            plan: {
              athleteProfileId: profile.id
            }
          },
          date: {
            gte: dayStart,
            lte: dayEnd
          },
          type: 'running'
        }
      });

      if (!plannedWorkout) {
        // Dia SEM treino planejado → skip por enquanto
        // Renderização irá criar cards virtuais no frontend
        skipped++;
        continue;
      }

      // Se existe mas já está completado de outra forma, skip
      if (plannedWorkout.isCompleted && plannedWorkout.completedWorkoutId) {
        console.log(`[POPULATE_EXECUTED] Already completed: ${plannedWorkout.id}`);
        skipped++;
        continue;
      }

      // Linkar! (sem marcar como completado, apenas indica que foi executado)
      await prisma.customWorkout.update({
        where: { id: plannedWorkout.id },
        data: {
          executedWorkoutId: completed.id
        }
      });

      linked++;
      console.log(`[POPULATE_EXECUTED] Linked ${completed.id} → ${plannedWorkout.id}`);
    }

    return NextResponse.json({
      success: true,
      processed: completedRuns.length,
      linked,
      skipped
    });

  } catch (error: any) {
    console.error('[POPULATE_EXECUTED] Error:', error);
    return NextResponse.json({ 
      error: 'Erro ao processar treinos executados',
      details: error.message 
    }, { status: 500 });
  }
}
