import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
                workouts: {
                  orderBy: { date: 'asc' }
                }
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
    const diagnostic = {
      planId: plan.id,
      currentWeek: plan.currentWeek,
      totalWeeks: plan.totalWeeks,
      completionRate: plan.completionRate,
      weeks: plan.weeks.map(week => {
        const completedCount = week.workouts.filter(w => w.isCompleted).length;
        return {
          weekNumber: week.weekNumber,
          startDate: week.startDate,
          endDate: week.endDate,
          phase: week.phase,
          totalWorkoutsField: week.totalWorkouts,
          completedWorkoutsField: week.completedWorkouts,
          actualTotalWorkouts: week.workouts.length,
          actualCompletedWorkouts: completedCount,
          inconsistency: week.completedWorkouts !== completedCount,
          workouts: week.workouts.map(w => ({
            id: w.id,
            date: w.date,
            title: w.title,
            type: w.type,
            isCompleted: w.isCompleted
          }))
        };
      })
    };

    return NextResponse.json(diagnostic);
  } catch (error) {
    console.error('Diagnostic error:', error);
    return NextResponse.json({ error: 'Erro no diagnóstico' }, { status: 500 });
  }
}
