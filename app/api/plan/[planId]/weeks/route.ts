
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
                completedWorkout: true, // Treino planejado que foi completado
                executedWorkout: true   // Treino real executado (pode ser diferente)
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

    // Buscar treinos órfãos (executados em dias diferentes do planejado)
    // Treinos com customWorkout mas executedWorkoutId diferente de completedWorkoutId
    const orphanWorkouts = await prisma.completedWorkout.findMany({
      where: {
        athleteId: plan.athleteProfile.id,
        wasPlanned: true,
        wasSubstitution: true,
        // Buscar entre datas do plano
        date: {
          gte: plan.startDate,
        }
      }
    });

    console.log('[WEEKS API] Found orphan workouts:', orphanWorkouts.length);

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

      // Adicionar treinos órfãos executados nesta semana
      const orphansInWeek = orphanWorkouts.filter(o => {
        const date = new Date(o.date);
        return date >= new Date(week.startDate) && date <= new Date(week.endDate);
      });

      // Converter órfãos em formato de CustomWorkout para o frontend renderizar
      const orphansAsWorkouts = orphansInWeek.map(orphan => ({
        id: -orphan.id, // ID negativo para diferenciar de workouts planejados
        weekId: week.id,
        dayOfWeek: orphan.plannedDate ? new Date(orphan.plannedDate).getDay() : new Date(orphan.date).getDay(),
        date: orphan.plannedDate || orphan.date, // ✅ USA DATA PLANEJADA (domingo), não executada (sábado)
        type: orphan.type,
        subtype: orphan.subtype,
        title: `${orphan.type} (Executado)`,
        description: orphan.notes || 'Treino executado sem planejamento prévio',
        distance: orphan.distance,
        duration: orphan.duration,
        targetPace: orphan.pace,
        isCompleted: true,
        completedWorkoutId: orphan.id,
        executedWorkoutId: orphan.id,
        wasSubstitution: true,
        createdAt: orphan.createdAt,
        updatedAt: orphan.updatedAt,
        completedWorkout: orphan, // Dados completos do treino executado
        executedWorkout: orphan,
        // Flag especial para indicar que é órfão
        isOrphan: true
      }));

      // Mesclar workouts planejados + órfãos, ordenar por data
      const allWorkouts = [
        ...week.workouts.map(w => ({ ...w })),
        ...orphansAsWorkouts
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return {
        ...week,
        completedWorkouts: completedCount + orphansInWeek.length, // Incluir órfãos na contagem
        // Manter totalDistance planejado, mas adicionar campo executedDistance
        executedDistance: executedVolume + orphansInWeek.reduce((sum, o) => sum + (o.distance || 0), 0),
        orphanWorkouts: orphansInWeek, // MANTIDO para debug/referência
        workouts: allWorkouts // INCLUIR ÓRFÃOS MESCLADOS
      };
    });

    return NextResponse.json({ weeks: weeksWithRecalculated });
  } catch (error) {
    console.error('Error fetching weeks:', error);
    return NextResponse.json({ error: 'Erro ao buscar semanas' }, { status: 500 });
  }
}
