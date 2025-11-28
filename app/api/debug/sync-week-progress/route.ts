import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * ENDPOINT DE SINCRONIZAÇÃO: Corrige completedWorkouts
 * 
 * - Conta apenas treinos reais (exclui type='rest')
 * - Atualiza completedWorkouts nas semanas
 * - Recalcula completionRate do plano
 * 
 * Uso: GET /api/debug/sync-week-progress
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        customPlan: {
          include: {
            weeks: {
              include: {
                workouts: true
              },
              orderBy: { weekNumber: 'asc' }
            }
          }
        }
      }
    });

    if (!profile || !profile.customPlan) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
    }

    const plan = profile.customPlan;
    const updates: any[] = [];

    // Sincronizar cada semana
    for (const week of plan.weeks) {
      // ✅ Filtrar: apenas treinos reais (excluir descanso)
      const realWorkouts = week.workouts.filter(w => w.type !== 'rest');
      const actualCompleted = realWorkouts.filter(w => w.isCompleted).length;
      const actualTotal = realWorkouts.length;

      // Se há inconsistência, atualizar
      if (week.completedWorkouts !== actualCompleted || week.totalWorkouts !== actualTotal) {
        await prisma.customWeek.update({
          where: { id: week.id },
          data: {
            completedWorkouts: actualCompleted,
            totalWorkouts: actualTotal
          }
        });

        updates.push({
          weekNumber: week.weekNumber,
          before: {
            completedWorkouts: week.completedWorkouts,
            totalWorkouts: week.totalWorkouts
          },
          after: {
            completedWorkouts: actualCompleted,
            totalWorkouts: actualTotal
          },
          workouts: realWorkouts.map(w => ({
            id: w.id,
            title: w.title,
            type: w.type,
            isCompleted: w.isCompleted
          }))
        });
      }
    }

    // Recalcular completionRate do plano
    const allWeeks = await prisma.customWeek.findMany({
      where: { planId: plan.id },
      include: { workouts: true }
    });

    // ✅ Contar apenas treinos reais (sem descanso)
    const totalWorkouts = allWeeks.reduce((sum, w) => {
      return sum + w.workouts.filter(wo => wo.type !== 'rest').length;
    }, 0);
    
    const completedWorkouts = allWeeks.reduce((sum, w) => {
      return sum + w.workouts.filter(wo => wo.type !== 'rest' && wo.isCompleted).length;
    }, 0);
    
    const newCompletionRate = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;

    await prisma.customTrainingPlan.update({
      where: { id: plan.id },
      data: { completionRate: newCompletionRate }
    });

    return NextResponse.json({
      success: true,
      message: 'Sincronização concluída com sucesso! ✅',
      weeksUpdated: updates.length,
      updates,
      planStats: {
        totalWorkouts,
        completedWorkouts,
        completionRate: {
          before: plan.completionRate.toFixed(1) + '%',
          after: newCompletionRate.toFixed(1) + '%'
        }
      }
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ 
      error: 'Erro na sincronização',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
