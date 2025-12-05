
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

    // Buscar TODOS treinos executados no período do plano
    // Incluir tanto órfãos com match quanto sem match
    const allCompletedWorkouts = await prisma.completedWorkout.findMany({
      where: {
        athleteId: plan.athleteProfile.id,
        // Buscar entre datas do plano
        date: {
          gte: plan.startDate,
        }
      }
    });

    console.log('[WEEKS API] Found completed workouts:', allCompletedWorkouts.length);

    // Recalcular volume e progresso para cada semana
    const weeksWithRecalculated = plan.weeks.map(week => {
      const completedCount = week.workouts.filter(w => w.isCompleted).length;
      
      // Calcular volume executado (soma dos treinos completados + órfãos)
      const executedVolume = week.workouts.reduce((sum, workout) => {
        if (workout.isCompleted && workout.completedWorkout) {
          return sum + (workout.completedWorkout.distance || 0);
        }
        return sum;
      }, 0);

      // Identificar órfãos nesta semana (treinos executados fora do planejado)
      const orphansInWeek = allCompletedWorkouts.filter(completed => {
        const completedDate = new Date(completed.date);
        const inWeekRange = completedDate >= new Date(week.startDate) && 
                           completedDate <= new Date(week.endDate);
        
        if (!inWeekRange) return false;

        // Verificar se este treino executado está vinculado a algum workout planejado no MESMO DIA
        const completedDateStr = completedDate.toISOString().split('T')[0];
        const hasPlannedSameDay = week.workouts.some(w => {
          const workoutDate = new Date(w.date).toISOString().split('T')[0];
          return workoutDate === completedDateStr && w.completedWorkoutId === completed.id;
        });

        // Órfão = executado na semana MAS não vinculado a workout planejado no mesmo dia
        return !hasPlannedSameDay;
      });

      // Somar volume dos órfãos APENAS se NÃO têm match
      // Se órfão tem match, já está contado no executedVolume do workout planejado
      const orphansVolume = orphansInWeek.reduce((sum, o) => {
        // Se órfão tem match (wasPlanned=true), não somar (já contado)
        if (o.wasPlanned) return sum;
        // Se órfão SEM match, somar
        return sum + (o.distance || 0);
      }, 0);
      const totalExecutedVolume = executedVolume + orphansVolume;

      // Processar workouts: vincular treinos executados no mesmo dia
      const processedWorkouts = week.workouts.map(w => {
        const workoutDate = new Date(w.date).toISOString().split('T')[0];
        
        // AUTO-MATCH DESABILITADO: Causa bugs, usar apenas match manual
        // const sameDay = allCompletedWorkouts.find(completed => {...});
        // if (sameDay) { vincular automaticamente }

        // PRIORIDADE 2: Verificar se existe órfão (outro dia) para este planejado
        const orphan = orphansInWeek.find(o => {
          if (!o.plannedDate) return false;
          const orphanPlannedDate = new Date(o.plannedDate).toISOString().split('T')[0];
          return orphanPlannedDate === workoutDate;
        });

        // Se existe órfão, mesclar dados (substituição)
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

        // Senão, retornar workout original (não executado)
        return { ...w };
      });

      // Adicionar órfãos no dia de EXECUÇÃO (para mostrar no sábado também)
      // TODOS os órfãos devem aparecer no dia que foram executados
      const orphansAsWorkouts = orphansInWeek.map(orphan => {
        // Verificar se órfão tem match com workout planejado (wasPlanned=true)
        const hasMatch = orphan.wasPlanned === true;
        
        // Buscar workout planejado MAIS PRÓXIMO (±3 dias) para sugerir match
        const orphanDate = new Date(orphan.date);
        
        // Filtrar candidatos (não concluídos, não descanso, dentro da janela)
        const candidates = week.workouts.filter(w => {
          if (w.isCompleted) return false;
          if (w.type === 'rest') return false;
          
          const wDate = new Date(w.date);
          const daysDiff = Math.abs((wDate.getTime() - orphanDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff <= 3;
        });

        // Ordenar por proximidade de data E distância
        const nearbyPlanned = candidates.sort((a, b) => {
          const aDate = new Date(a.date);
          const bDate = new Date(b.date);
          const aDaysDiff = Math.abs((aDate.getTime() - orphanDate.getTime()) / (1000 * 60 * 60 * 24));
          const bDaysDiff = Math.abs((bDate.getTime() - orphanDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Se mesma distância de dias, comparar por similaridade de distância
          if (aDaysDiff === bDaysDiff) {
            const aDistDiff = Math.abs((a.distance || 0) - (orphan.distance || 0));
            const bDistDiff = Math.abs((b.distance || 0) - (orphan.distance || 0));
            return aDistDiff - bDistDiff;
          }
          
          // Senão, mais próximo por data
          return aDaysDiff - bDaysDiff;
        })[0]; // Pegar o primeiro (mais próximo)

        return {
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
          isOrphan: true,
          hasMatch, // Se tem match manual feito
          suggestedMatch: nearbyPlanned ? { id: nearbyPlanned.id, title: nearbyPlanned.title, date: nearbyPlanned.date } : null
        };
      });

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
      let allWorkouts = [
        ...processedWorkouts,
        ...orphansAsWorkouts
      ];

      // Filtrar "descanso" se há órfão no mesmo dia
      // Descanso não é uma "atividade", só um marcador
      const workoutsByDate = allWorkouts.reduce((acc, w) => {
        const dateKey = new Date(w.date).toISOString().split('T')[0];
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(w);
        return acc;
      }, {} as Record<string, typeof allWorkouts>);

      // Para cada dia, se tem órfão + descanso, remover descanso
      allWorkouts = allWorkouts.filter(w => {
        const dateKey = new Date(w.date).toISOString().split('T')[0];
        const workoutsInDay = workoutsByDate[dateKey];
        
        const isRest = w.type === 'rest' || 
                       w.title?.toLowerCase().includes('descanso') || 
                       w.title?.toLowerCase().includes('rest');
        const hasOrphan = workoutsInDay.some(wo => wo.isOrphan);
        
        // Se é descanso E tem órfão no mesmo dia, remover descanso
        if (isRest && hasOrphan) {
          return false;
        }
        
        return true;
      });

      // Ordenar por data
      allWorkouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return {
        ...week,
        completedWorkouts: completedCount + orphansInWeek.filter(o => !o.wasPlanned).length, // Incluir apenas órfãos SEM match
        // Manter totalDistance planejado, mas adicionar campo executedDistance
        // NÃO somar órfãos aqui porque já foram mesclados nos processedWorkouts!
        executedDistance: totalExecutedVolume,
        orphanWorkouts: orphansInWeek, // MANTIDO para debug/referência
        workouts: allWorkouts // INCLUIR ÓRFÃOS MESCLADOS
      };
    });

    // AUTO-MATCH DESABILITADO COMPLETAMENTE
    // Usar APENAS match manual via API /manual-match
    // if (allAutoMatchedIds.length > 0) { ... }

    return NextResponse.json({ weeks: weeksWithRecalculated });
  } catch (error) {
    console.error('Error fetching weeks:', error);
    return NextResponse.json({ error: 'Erro ao buscar semanas' }, { status: 500 });
  }
}
