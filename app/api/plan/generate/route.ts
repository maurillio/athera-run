
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
export const runtime = 'nodejs';

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Parse request body para obter customStartDate se fornecida
    const body = await request.json().catch(() => ({}));
    const customStartDate = body.startDate ? new Date(body.startDate) : undefined;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { athleteProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (!user.athleteProfile) {
      console.error('[AI PLAN] Perfil de atleta não encontrado para usuário:', user.id);
      return NextResponse.json({ 
        success: false,
        error: 'Perfil de atleta não encontrado',
        message: 'Por favor, complete seu perfil no onboarding antes de gerar o plano.',
        redirectTo: '/onboarding'
      }, { status: 400 });
    }

    const profile = user.athleteProfile;

    // v1.6.0 - Validação completa de dados essenciais do perfil
    const missingFields: string[] = [];
    
    if (!profile.goalDistance) {
      missingFields.push('goalDistance (distância objetivo)');
    }
    
    if (!profile.targetRaceDate) {
      missingFields.push('targetRaceDate (data da prova)');
    }
    
    if (!profile.runningLevel) {
      missingFields.push('runningLevel (nível de corrida)');
    }
    
    // Validar trainingActivities (pode vir como JSON ou array)
    let activities: any[] = [];
    if (profile.trainingActivities) {
      activities = Array.isArray(profile.trainingActivities) 
        ? profile.trainingActivities 
        : (typeof profile.trainingActivities === 'object' 
            ? Object.values(profile.trainingActivities) 
            : []);
    }
    
    // Se ainda não tem atividades, tentar extrair de trainingSchedule
    if (activities.length === 0 && profile.trainingSchedule) {
      const schedule = profile.trainingSchedule as any;
      if (typeof schedule === 'object') {
        activities = Object.keys(schedule)
          .filter(day => {
            const sched = schedule[parseInt(day)];
            return sched && (sched.running || (sched.activities && sched.activities.length > 0));
          })
          .map(d => parseInt(d));
      }
    }
    
    const hasRunningDays = activities.length > 0;
    
    console.log('🔍 [AI PLAN] Validação de atividades:', {
      trainingActivities: profile.trainingActivities,
      trainingSchedule: profile.trainingSchedule,
      activities,
      hasRunningDays
    });
    
    if (!hasRunningDays) {
      missingFields.push('trainingActivities (dias disponíveis para treino)');
    }
    
    if (missingFields.length > 0) {
      console.error('[AI PLAN] Dados incompletos no perfil:', missingFields);
      return NextResponse.json({
        success: false,
        error: 'Dados incompletos no perfil',
        message: `Por favor, complete os seguintes campos no perfil: ${missingFields.join(', ')}`,
        missingFields,
        redirectTo: '/perfil'
      }, { status: 400 });
    }
    
    // Recomendar longRunDay se não configurado
    if (profile.longRunDay === null || profile.longRunDay === undefined) {
      console.warn('⚠️ [AI PLAN] longRunDay não configurado. Usando heurística (último dia disponível)');
      // Usar último dia disponível como padrão (geralmente final de semana)
      profile.longRunDay = Math.max(...activities);
    }

    console.log('[AI PLAN] Iniciando geração de plano com IA para:', session.user.email);
    console.log('[AI PLAN] Dias de treino:', activities);
    console.log('[AI PLAN] Dia do longão:', profile.longRunDay);

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
    if (raceGoals.length > 0) {
      console.log('[AI PLAN] Detalhes das corridas:');
      raceGoals.forEach(race => {
        console.log(`  - ${race.priority}: ${race.raceName} (${race.distance}) em ${race.raceDate.toISOString().split('T')[0]}`);
      });
    } else {
      console.log('[AI PLAN] ⚠️ NENHUMA CORRIDA ENCONTRADA - plano será gerado sem corridas alvo');
    }

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
    // (reutilizando a variável activities já definida na validação)
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
      // v1.7.3 - Nova estrutura de disponibilidade
      trainingSchedule: profile.trainingSchedule as any,
      customActivities: (profile.customActivities as any) || [],
      longRunDay: profile.longRunDay ?? undefined,
      // DEPRECATED: Mantido para compatibilidade
      trainingActivities: activities,
      usualPaces: usualPaces,
      hasGymAccess: hasGymAccess,
      hasPoolAccess: hasPoolAccess,
      // v1.6.0 - Novos campos de convergência
      bestTimes: profile.bestTimes as any,
      runningYears: profile.runningYears ?? undefined,
      maxHeartRate: profile.maxHeartRate ?? undefined,
      recentLongRunPace: profile.recentLongRunPace ?? undefined,
      restingHeartRate: profile.restingHeartRate ?? undefined,
      otherSportsExperience: profile.otherSportsExperience ?? undefined,
      sleepQuality: profile.sleepQuality ?? undefined,
      stressLevel: profile.stressLevel ?? undefined,
      hasTrackAccess: profile.hasTrackAccess ?? undefined,
      trainingPreferences: profile.trainingPreferences as any,
      motivationFactors: profile.motivationFactors as any,
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
    };

    console.log('[AI PLAN] Gerando plano com IA...');
    if (customStartDate) {
      console.log('[AI PLAN] Data de início customizada:', customStartDate.toISOString());
    }
    
    // Gerar plano com IA (passando customStartDate se fornecida)
    console.log('[AI PLAN] ✅ Chamando generateAIPlan com:');
    console.log(`[AI PLAN]   - ${aiProfile.raceGoals?.length || 0} corridas no perfil`);
    if (aiProfile.raceGoals && aiProfile.raceGoals.length > 0) {
      aiProfile.raceGoals.forEach(race => {
        console.log(`[AI PLAN]     • ${race.priority}: ${race.name} em ${race.date.toISOString().split('T')[0]}`);
      });
    }
    
    const aiPlan = await generateAIPlan(aiProfile, 3, customStartDate);

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

    // Preparar mensagem incluindo aviso se houver
    let message = `🎉 Plano personalizado gerado com IA!\n\n${aiPlan.planRationale}\n\nVDOT: ${aiPlan.vdot}\n\nO plano foi criado especificamente para você baseado em todo o seu perfil e disponibilidade.`;
    
    if (aiPlan.warnings?.isShortNotice) {
      message = `${aiPlan.warnings.shortNoticeMessage}\n\n${message}`;
    }

    return NextResponse.json({
      success: true,
      plan: customPlan,
      vdot: aiPlan.vdot,
      paces: aiPlan.paces,
      message,
      warnings: aiPlan.warnings,
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
      success: false,
      error: 'Erro ao gerar plano com IA', 
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
