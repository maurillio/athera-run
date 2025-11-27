
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const dynamic = 'force-dynamic';

// Helper para formatar datas mantendo o timezone de São Paulo
function formatDateForAPI(date: Date | null | undefined): string | null {
  if (!date) return null;
  // Retorna no formato YYYY-MM-DD que não sofre conversão de timezone
  return dayjs(date).tz('America/Sao_Paulo').format('YYYY-MM-DD');
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log('[PLAN CURRENT] Fetching plan for:', session.user.email);

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
          },
        },
      },
    });

    console.log('[PLAN CURRENT] User found:', {
      hasUser: !!user,
      hasProfile: !!user?.athleteProfile,
      hasCustomPlan: user?.athleteProfile?.hasCustomPlan,
      customPlanExists: !!user?.athleteProfile?.customPlan
    });

    if (!user?.athleteProfile) {
      return NextResponse.json({ hasProfile: false, hasCustomPlan: false }, { status: 200 });
    }

    if (!user.athleteProfile.hasCustomPlan || !user.athleteProfile.customPlan) {
      return NextResponse.json({ hasProfile: true, hasCustomPlan: false }, { status: 200 });
    }

    const plan = user.athleteProfile.customPlan;
    
    console.log('[PLAN CURRENT] Plan details:', {
      planId: plan.id,
      hasWeeks: !!plan.weeks,
      weeksCount: plan.weeks?.length || 0,
      isArray: Array.isArray(plan.weeks)
    });
    
    // Verificar se o plano tem a estrutura esperada
    if (!plan.weeks || !Array.isArray(plan.weeks)) {
      console.error('[PLAN CURRENT] Plan weeks structure is invalid:', { 
        planId: plan.id, 
        weeks: plan.weeks,
        weeksType: typeof plan.weeks
      });
      return NextResponse.json({ 
        hasProfile: true, 
        hasCustomPlan: false,
        error: 'Estrutura do plano inválida' 
      }, { status: 200 });
    }
    
    if (plan.weeks.length === 0) {
      console.error('[PLAN CURRENT] Plan has no weeks:', { planId: plan.id });
      return NextResponse.json({ 
        hasProfile: true, 
        hasCustomPlan: false,
        error: 'Plano sem semanas' 
      }, { status: 200 });
    }

    // Calcular semana atual baseado na data
    const now = new Date();
    let currentWeek = plan.weeks.find(
      (week) => now >= new Date(week.startDate) && now <= new Date(week.endDate)
    );

    if (!currentWeek && plan.weeks.length > 0) {
      // Se não encontrou, pegar a primeira semana futura ou a última semana passada
      const futureWeeks = plan.weeks.filter((week) => new Date(week.startDate) > now);
      if (futureWeeks.length > 0) {
        currentWeek = futureWeeks[0];
      } else {
        currentWeek = plan.weeks[plan.weeks.length - 1];
      }
    }

    // Calcular a porcentagem de conclusão baseado nos treinos completados
    const allWorkouts = plan.weeks?.flatMap((week: any) => week.workouts || []) || [];
    const completedWorkouts = allWorkouts.filter((w: any) => w.isCompleted);
    const completionRate = allWorkouts.length > 0 
      ? (completedWorkouts.length / allWorkouts.length) * 100 
      : 0;

    console.log('[PLAN CURRENT] Workouts stats:', {
      totalWorkouts: allWorkouts.length,
      completedWorkouts: completedWorkouts.length,
      completionRate
    });

    // Serializar dados para JSON com tratamento de erro
    let serializedPlan;
    try {
      serializedPlan = {
        ...plan,
        startDate: formatDateForAPI(plan.startDate),
        targetRaceDate: formatDateForAPI(plan.targetRaceDate),
        lastRegenerated: plan.lastRegenerated?.toISOString(),
        createdAt: plan.createdAt?.toISOString(),
        updatedAt: plan.updatedAt?.toISOString(),
        currentWeek: currentWeek?.weekNumber || 1,
        completionRate: completionRate,
        weeks: plan.weeks?.map((week: any) => ({
          ...week,
          startDate: formatDateForAPI(week.startDate),
          endDate: formatDateForAPI(week.endDate),
          workouts: week.workouts?.map((workout: any) => ({
            ...workout,
            date: formatDateForAPI(workout.date),
            createdAt: workout.createdAt?.toISOString(),
            updatedAt: workout.updatedAt?.toISOString(),
            completedWorkout: workout.completedWorkout ? {
              ...workout.completedWorkout,
              date: workout.completedWorkout.date?.toISOString(),
              createdAt: workout.completedWorkout.createdAt?.toISOString(),
            } : null,
          })),
        })),
      };
    } catch (serializationError) {
      console.error('[PLAN CURRENT] Error serializing plan:', serializationError);
      throw serializationError;
    }

    const serializedCurrentWeek = currentWeek ? {
      ...currentWeek,
      startDate: formatDateForAPI(currentWeek.startDate),
      endDate: formatDateForAPI(currentWeek.endDate),
      workouts: currentWeek.workouts?.map((workout: any) => ({
        ...workout,
        date: formatDateForAPI(workout.date),
        createdAt: workout.createdAt?.toISOString(),
        updatedAt: workout.updatedAt?.toISOString(),
        completedWorkout: workout.completedWorkout ? {
          ...workout.completedWorkout,
          date: workout.completedWorkout.date?.toISOString(),
          createdAt: workout.completedWorkout.createdAt?.toISOString(),
        } : null,
      })),
    } : null;

    let serializedProfile;
    try {
      serializedProfile = {
        ...user.athleteProfile,
        targetRaceDate: formatDateForAPI(user.athleteProfile.targetRaceDate),
        stravaTokenExpiry: user.athleteProfile.stravaTokenExpiry?.toISOString(),
        lastAutoAdjustDate: user.athleteProfile.lastAutoAdjustDate?.toISOString(),
        createdAt: user.athleteProfile.createdAt?.toISOString(),
        updatedAt: user.athleteProfile.updatedAt?.toISOString(),
        preferredStartDate: formatDateForAPI(user.athleteProfile.preferredStartDate),
        lastInjuryDate: formatDateForAPI(user.athleteProfile.lastInjuryDate),
        lastVDOTUpdate: user.athleteProfile.lastVDOTUpdate?.toISOString(),
        customPlan: undefined, // Evitar duplicação
      };
    } catch (profileSerializationError) {
      console.error('[PLAN CURRENT] Error serializing profile:', profileSerializationError);
      throw profileSerializationError;
    }

    console.log('[PLAN CURRENT] Successfully serialized all data');

    return NextResponse.json({
      plan: serializedPlan,
      currentWeek: serializedCurrentWeek,
      profile: serializedProfile,
    });
  } catch (error) {
    console.error('[PLAN CURRENT] Error fetching plan:', error);
    console.error('[PLAN CURRENT] Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('[PLAN CURRENT] Error stack:', error instanceof Error ? error.stack : '');
    return NextResponse.json({ 
      error: 'Erro ao buscar plano',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
