
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
    if (orphanWorkouts.length > 0) {
      console.log('[WEEKS API] Orphan details:', orphanWorkouts.map(o => ({
        id: o.id,
        date: o.date.toISOString().split('T')[0],
        plannedDate: o.plannedDate?.toISOString().split('T')[0],
        distance: o.distance,
        wasPlanned: o.wasPlanned,
        wasSubstitution: o.wasSubstitution
      })));
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

      // Adicionar treinos órfãos executados nesta semana
      const orphansInWeek = orphanWorkouts.filter(o => {
        const date = new Date(o.date);
        return date >= new Date(week.startDate) && date <= new Date(week.endDate);
      });

      // Processar workouts: mesclar órfãos com planejados correspondentes
      const processedWorkouts = week.workouts.map(w => {
        // Verificar se existe órfão para este dia planejado
        const orphan = orphansInWeek.find(o => {
          if (!o.plannedDate) return false;
          const orphanPlannedDate = new Date(o.plannedDate).toISOString().split('T')[0];
          const workoutDate = new Date(w.date).toISOString().split('T')[0];
          return orphanPlannedDate === workoutDate;
        });

        // Se existe órfão, mesclar dados
        if (orphan) {
          return {
            ...w,
            isCompleted: true,
            completedWorkoutId: orphan.id,
            executedWorkoutId: orphan.id,
            wasSubstitution: true,
            completedWorkout: orphan,
            executedWorkout: orphan,
          };
        }

        // Senão, retornar workout original
        return { ...w };
      });

      // Adicionar órfãos no dia de EXECUÇÃO (para mostrar no sábado também)
      // TODOS os órfãos devem aparecer no dia que foram executados
      const orphansAsWorkouts = orphansInWeek.map(orphan => ({
        id: -orphan.id,
        weekId: week.id,
        dayOfWeek: new Date(orphan.date).getDay(),
        date: orphan.date, // Data de EXECUÇÃO (sábado)
        type: orphan.type,
        subtype: orphan.subtype,
        title: `${orphan.type} (Executado)`,
        description: orphan.notes || 'Treino executado',
        distance: orphan.distance,
        duration: orphan.duration,
        targetPace: orphan.pace,
        isCompleted: true,
        completedWorkoutId: orphan.id,
        executedWorkoutId: orphan.id,
        wasSubstitution: false, // NÃO é substituição no dia de execução
        completedWorkout: orphan,
        executedWorkout: orphan,
        isOrphan: true
      }));

      console.log('[WEEKS API] Week', week.weekNumber, '- Orphans in week:', orphansInWeek.length);
      console.log('[WEEKS API] Week', week.weekNumber, '- Orphans as workouts:', orphansAsWorkouts.length);
      if (orphansAsWorkouts.length > 0) {
        console.log('[WEEKS API] Orphans details:', orphansAsWorkouts.map(o => ({
          id: o.id,
          date: o.date,
          distance: o.distance
        })));
      }

      // Mesclar workouts planejados processados + órfãos no dia de execução
      const allWorkouts = [
        ...processedWorkouts,
        ...orphansAsWorkouts
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return {
        ...week,
        completedWorkouts: completedCount + orphansInWeek.length, // Incluir órfãos na contagem
        // Manter totalDistance planejado, mas adicionar campo executedDistance
        // NÃO somar órfãos aqui porque já foram mesclados nos processedWorkouts!
        executedDistance: executedVolume,
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
