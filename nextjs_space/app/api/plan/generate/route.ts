
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import {
  generateAIPlan,
  validateAIPlan,
  type AIUserProfile,
} from '@/lib/ai-plan-generator';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { athleteProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (!user.athleteProfile) {
      return NextResponse.json({ 
        error: 'Perfil de atleta não encontrado',
        message: 'Por favor, complete seu perfil no onboarding antes de gerar o plano.',
        redirectTo: '/onboarding'
      }, { status: 400 });
    }

    const profile = user.athleteProfile;

    console.log('[AI PLAN] Iniciando geração de plano com IA para:', session.user.email);

    // Buscar corridas cadastradas (RaceGoals)
    const raceGoals = await prisma.raceGoal.findMany({
      where: {
        athleteId: profile.id,
        status: 'active'
      },
      orderBy: {
        raceDate: 'asc'
      }
    });

    console.log('[AI PLAN] Corridas encontradas:', raceGoals.length);

    // Preparar perfil para a IA
    const rawPaces = profile.usualPaces as any;
    let usualPaces: Record<string, string> | undefined = undefined;

    if (rawPaces) {
      if (rawPaces['5k'] || rawPaces['10k']) {
        usualPaces = rawPaces;
      } else if (rawPaces.paces) {
        usualPaces = rawPaces.paces;
      }
    }

    // Detectar acesso a piscina baseado nas atividades configuradas
    const activities = (profile.trainingActivities as any) || [];
    const hasPoolAccess = activities.some((a: any) =>
      a.id === 'swimming' || a.id === 'natação' || a.id === 'natacao'
    );
    const hasGymAccess = activities.some((a: any) =>
      a.id === 'strength' || a.id === 'musculação' || a.id === 'musculacao'
    );

    // Buscar feedback recente do atleta (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentFeedback = await prisma.athleteFeedback.findMany({
      where: {
        userId: user.id,
        date: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        date: 'desc'
      },
      take: 10
    });

    const aiProfile: AIUserProfile = {
      runningLevel: profile.runningLevel,
      goalDistance: profile.goalDistance,
      targetRaceDate: profile.targetRaceDate || new Date(),
      currentWeeklyKm: profile.currentWeeklyKm || 0,
      longestRun: profile.longestRun || 0,
      currentVDOT: profile.currentVDOT || undefined,
      targetTime: profile.targetTime || undefined,
      weight: profile.weight,
      height: profile.height || undefined,
      age: profile.age || undefined,
      gender: profile.gender || undefined,
      trainingActivities: activities,
      longRunDay: profile.longRunDay ?? undefined,
      usualPaces: usualPaces,
      hasGymAccess: hasGymAccess,
      hasPoolAccess: hasPoolAccess,
      raceGoals: raceGoals.map(race => ({
        id: race.id,
        name: race.raceName,
        distance: race.distance,
        date: race.raceDate,
        targetTime: race.targetTime || undefined,
        priority: race.priority as 'A' | 'B' | 'C'
      })),
      // Novos campos para análise de elite
      athleteFeedback: recentFeedback.length > 0 ? recentFeedback.map(f => ({
        date: f.date,
        type: f.type as 'fatiga' | 'dor' | 'motivacao' | 'desempenho' | 'outro',
        message: f.message
      })) : undefined,
      ...(profile.runningYears && { runningYears: profile.runningYears }),
      ...(profile.maxHeartRate && { maxHeartRate: profile.maxHeartRate }),
      ...(profile.recentLongRunPace && { recentLongRunPace: profile.recentLongRunPace }),
    };

    console.log('[AI PLAN] Gerando plano com IA...');
    
    // Gerar plano com IA
    const aiPlan = await generateAIPlan(aiProfile);

    console.log('[AI PLAN] Plano gerado pela IA! Total de semanas:', aiPlan.totalWeeks);

    // Validar plano
    const validation = validateAIPlan(aiPlan);
    if (!validation.valid) {
      console.error('[AI PLAN] Plano inválido:', validation.errors);
      throw new Error(`Plano gerado pela IA é inválido: ${validation.errors.join(', ')}`);
    }

    console.log('[AI PLAN] Plano validado com sucesso! Salvando no banco de dados...');

    // Criar plano no banco
    const customPlan = await prisma.customTrainingPlan.create({
      data: {
        goalDistance: profile.goalDistance,
        runningLevel: profile.runningLevel,
        targetRaceDate: aiPlan.targetRaceDate,
        startDate: aiPlan.startDate,
        totalWeeks: aiPlan.totalWeeks,
        baseVDOT: aiPlan.vdot,
        targetPace: aiPlan.paces.marathon,
      },
    });

    console.log('[AI PLAN] Plano criado no banco. ID:', customPlan.id);
    console.log('[AI PLAN] Criando', aiPlan.weeks.length, 'semanas...');

    // Criar semanas e treinos
    for (const weekData of aiPlan.weeks) {
      const week = await prisma.customWeek.create({
        data: {
          planId: customPlan.id,
          weekNumber: weekData.weekNumber,
          startDate: weekData.startDate,
          endDate: weekData.endDate,
          totalDistance: Math.round(weekData.totalDistance * 10) / 10,
          totalWorkouts: 7,
          phase: weekData.phase,
          focus: weekData.focus,
        },
      });

      // Criar treinos da semana
      const workouts = weekData.workouts.map(workout => ({
        weekId: week.id,
        dayOfWeek: workout.dayOfWeek,
        date: workout.date,
        type: workout.type,
        subtype: workout.subtype || null,
        title: workout.title,
        description: workout.description,
        distance: workout.distance ? Math.round(workout.distance * 10) / 10 : null,
        duration: workout.duration || null,
        targetPace: workout.targetPace || null,
        warmup: workout.warmup || null,
        mainSet: workout.mainSet || null,
        cooldown: workout.cooldown || null,
      }));

      await prisma.customWorkout.createMany({
        data: workouts,
      });
    }

    console.log('[AI PLAN] Todas as semanas e treinos criados!');

    // Atualizar perfil do atleta
    await prisma.athleteProfile.update({
      where: { id: profile.id },
      data: {
        hasCustomPlan: true,
        customPlanId: customPlan.id,
        currentVDOT: aiPlan.vdot,
      },
    });

    console.log('[AI PLAN] Perfil do atleta atualizado!');

    return NextResponse.json({
      success: true,
      plan: customPlan,
      vdot: aiPlan.vdot,
      paces: aiPlan.paces,
      message: `🎉 Plano personalizado gerado com IA!\n\n${aiPlan.planRationale}\n\nVDOT: ${aiPlan.vdot}\n\nO plano foi criado especificamente para você baseado em todo o seu perfil e disponibilidade.`,
      planDetails: {
        phases: aiPlan.phases,
        keyConsiderations: aiPlan.keyConsiderations,
        progressionStrategy: aiPlan.progressionStrategy,
        nutritionAdvice: aiPlan.nutritionAdvice,
        injuryPreventionTips: aiPlan.injuryPreventionTips,
      }
    });
  } catch (error) {
    console.error('[AI PLAN] Error generating plan:', error);
    console.error('[AI PLAN] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: 'Erro ao gerar plano com IA', 
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
