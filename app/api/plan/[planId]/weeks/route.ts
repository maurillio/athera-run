
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const planId = parseInt(params.planId);

    const plan = await prisma.customTrainingPlan.findFirst({
      where: { id: planId },
      include: {
        athleteProfile: true,
        weeks: {
          include: {
            workouts: {
              include: {
                completedWorkout: true // ← Incluir completed workout para recalcular
              },
              orderBy: {
                date: 'asc'
              }
            }
          },
          orderBy: {
            weekNumber: 'asc'
          }
        }
      }
    });

    if (!plan || !plan.athleteProfile || plan.athleteProfile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
    }

    // Recalcular volume e progresso para cada semana
    const weeksWithRecalculated = plan.weeks.map(week => {
      const completedCount = week.workouts.filter(w => w.isCompleted).length;
      
      // Calcular volume executado (soma dos treinos completados)
      const executedVolume = week.workouts.reduce((sum, workout) => {
        if (workout.isCompleted && workout.completedWorkout) {
          return sum + (workout.completedWorkout.distance || 0);
        }
        return sum;
      }, 0);

      return {
        ...week,
        completedWorkouts: completedCount,
        // Manter totalDistance planejado, mas adicionar campo executedDistance
        executedDistance: executedVolume,
        workouts: week.workouts.map(w => ({
          ...w,
          // Não expor completedWorkout inteiro (já tem isCompleted)
          completedWorkout: undefined
        }))
      };
    });

    return NextResponse.json({ weeks: weeksWithRecalculated });
  } catch (error) {
    console.error('Error fetching weeks:', error);
    return NextResponse.json({ error: 'Erro ao buscar semanas' }, { status: 500 });
  }
}
