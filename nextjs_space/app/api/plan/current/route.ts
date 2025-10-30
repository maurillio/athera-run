
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        athleteProfile: {
          include: {
            customPlan: {
              include: {
                weeks: {
                  include: {
                    workouts: {
                      include: {
                        completedWorkout: true,
                      },
                    },
                  },
                  orderBy: { weekNumber: 'asc' },
                },
              },
            },
            trainingLogs: {
              orderBy: { date: 'desc' },
            },
          },
        },
      },
    });

    if (!user?.athleteProfile) {
      return NextResponse.json({ hasProfile: false, hasCustomPlan: false }, { status: 200 });
    }

    if (!user.athleteProfile.hasCustomPlan || !user.athleteProfile.customPlan) {
      return NextResponse.json({ hasProfile: true, hasCustomPlan: false }, { status: 200 });
    }

    // Calcular semana atual baseado na data
    const now = new Date();
    const plan = user.athleteProfile.customPlan;
    let currentWeek = plan.weeks.find(
      (week) => now >= week.startDate && now <= week.endDate
    );

    if (!currentWeek && plan.weeks.length > 0) {
      // Se não encontrou, pegar a primeira semana futura ou a última semana passada
      const futureWeeks = plan.weeks.filter((week) => week.startDate > now);
      if (futureWeeks.length > 0) {
        currentWeek = futureWeeks[0];
      } else {
        currentWeek = plan.weeks[plan.weeks.length - 1];
      }
    }

    // Calcular a porcentagem de conclusão baseado nos treinos completados
    const allWorkouts = plan.weeks.flatMap((week: any) => week.workouts);
    const completedWorkouts = allWorkouts.filter((w: any) => w.isCompleted);
    const completionRate = allWorkouts.length > 0 
      ? (completedWorkouts.length / allWorkouts.length) * 100 
      : 0;

    return NextResponse.json({
      plan: {
        ...plan,
        currentWeek: currentWeek?.weekNumber || 1, // Sempre retornar o número da semana calculado
        completionRate: completionRate, // Sempre calcular a taxa de conclusão atual
      },
      currentWeek: {
        ...currentWeek,
        trainingLogs: user.athleteProfile.trainingLogs,
      },
      profile: user.athleteProfile,
    });
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json({ error: 'Erro ao buscar plano' }, { status: 500 });
  }
}
