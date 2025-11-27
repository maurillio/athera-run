
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import {
  generateAIPlan,
  validateAIPlan,
  type AIUserProfile,
} from '@/lib/ai-plan-generator';
import { 
  mapProfileToTrackableFields, 
  trackFieldUsage 
} from '@/lib/ai-field-tracking';

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
    // Incluir tanto 'active' quanto 'upcoming' (status default do onboarding)
    const raceGoals = await prisma.raceGoal.findMany({
      where: {
        athleteId: profile.id,
        status: {
          in: ['active', 'upcoming']
        }
      },
      orderBy: {
        raceDate: 'asc'
      }
    });

    console.log('[AI PLAN] ✅ Query de race goals executada com sucesso');
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

    // v2.1.0 - Buscar dados do Strava se conectado
    let stravaData: any = null;
    if (profile.stravaConnected) {
      try {
        const [stravaStats, stravaPRs, stravaZones, stravaGear] = await Promise.all([
          prisma.stravaStats.findUnique({ where: { userId: user.id } }),
          prisma.stravaPersonalRecord.findMany({ 
            where: { userId: user.id },
            orderBy: { distance: 'asc' }
          }),
          prisma.stravaTrainingZones.findUnique({ where: { userId: user.id } }),
          prisma.stravaGear.findMany({
            where: { userId: user.id, primary: true },
            take: 1
          })
        ]);

        if (stravaStats || stravaPRs.length > 0 || stravaZones || stravaGear.length > 0) {
          stravaData = {
            hasStravaData: true,
            recentRunsTotals: stravaStats?.recentRunsTotals as any,
            ytdRunsTotals: stravaStats?.ytdRunsTotals as any,
            personalRecords: stravaPRs.map(pr => ({
              type: pr.type,
              distance: pr.distance,
              time: pr.time,
              pace: pr.pace,
              date: pr.activityDate
            })),
            trainingZones: stravaZones ? {
              maxHeartRate: stravaZones.maxHeartRate,
              restingHeartRate: stravaZones.restingHeartRate,
              zones: stravaZones.heartRateZones as any
            } : null,
            primaryGear: stravaGear.length > 0 ? {
              name: stravaGear[0].name,
              distance: stravaGear[0].distance,
              brand: stravaGear[0].brandName,
              model: stravaGear[0].modelName
            } : null
          };
          
          console.log('[AI PLAN] 📊 Dados do Strava carregados:', {
            stats: !!stravaStats,
            prs: stravaPRs.length,
            zones: !!stravaZones,
            gear: stravaGear.length
          });
        }
      } catch (error) {
        console.error('[AI PLAN] Erro ao carregar dados do Strava:', error);
      }
    }

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
      // v2.1.0 - Dados do Strava (Premium)
      stravaData: stravaData || undefined,
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
    
    console.log('[AI PLAN] ⏳ Chamando generateAIPlan...');
    let aiPlan;
    try {
      aiPlan = await generateAIPlan(aiProfile, 3, customStartDate);
      console.log('[AI PLAN] ✅ Plano gerado pela IA! Total de semanas:', aiPlan.totalWeeks);
    } catch (genError) {
      console.error('[AI PLAN] ❌ ERRO CRÍTICO ao gerar plano com IA');
      console.error('[AI PLAN] Erro:', genError);
      console.error('[AI PLAN] Tipo:', typeof genError);
      console.error('[AI PLAN] Nome:', genError instanceof Error ? genError.name : 'Unknown');
      console.error('[AI PLAN] Mensagem:', genError instanceof Error ? genError.message : String(genError));
      console.error('[AI PLAN] Stack:', genError instanceof Error ? genError.stack : 'No stack');
      
      // Retornar erro mais informativo
      return NextResponse.json({
        success: false,
        error: 'Erro ao gerar plano com IA',
        details: genError instanceof Error ? genError.message : String(genError),
        type: genError instanceof Error ? genError.name : typeof genError,
        hint: 'Possíveis causas: limite de quota da OpenAI, timeout, ou erro no formato da resposta. Verifique os logs do Vercel para mais detalhes.'
      }, { status: 500 });
    }

    // Validar plano
    const validation = validateAIPlan(aiPlan);
    if (!validation.valid) {
      console.error('[AI PLAN] Plano inválido:', validation.errors);
      throw new Error(`Plano gerado pela IA é inválido: ${validation.errors.join(', ')}`);
    }

    console.log('[AI PLAN] ✅ Plano validado com sucesso!');
    console.log('[AI PLAN] Salvando no banco de dados...');
    console.log('[AI PLAN] Detalhes do plano:');
    console.log(`  - Total semanas: ${aiPlan.totalWeeks}`);
    console.log(`  - Início: ${aiPlan.startDate.toISOString().split('T')[0]}`);
    console.log(`  - Corrida alvo: ${aiPlan.targetRaceDate.toISOString().split('T')[0]}`);
    console.log(`  - Total de weeks geradas: ${aiPlan.weeks.length}`);
    
    // Verificar se a corrida alvo está no plano
    if (aiProfile.raceGoals && aiProfile.raceGoals.length > 0) {
      const raceADate = aiProfile.raceGoals[0].date;
      const raceDateStr = raceADate.toISOString().split('T')[0];
      console.log(`[AI PLAN] Verificando se corrida alvo (${raceDateStr}) está no plano...`);
      
      let foundRace = false;
      aiPlan.weeks.forEach((week, idx) => {
        week.workouts.forEach(w => {
          const workoutDateStr = w.date.toISOString().split('T')[0];
          if (workoutDateStr === raceDateStr) {
            console.log(`[AI PLAN] ✅ Encontrado workout no dia da corrida: ${w.type} - ${w.title}`);
            foundRace = true;
          }
        });
      });
      
      if (!foundRace) {
        console.error(`[AI PLAN] ❌ CRÍTICO: Corrida alvo (${raceDateStr}) NÃO está no plano gerado!`);
      }
    }

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
    
    // v2.8.0 - Track field usage for AI transparency
    console.log('[AI PLAN] 📊 Tracking field usage for AI transparency...');
    try {
      const trackableFields = mapProfileToTrackableFields(profile);
      await trackFieldUsage(user.id, customPlan.id, trackableFields);
      console.log('[AI PLAN] ✅ Field usage tracked successfully');
    } catch (trackError) {
      console.error('[AI PLAN] ⚠️ Error tracking fields (non-critical):', trackError);
      // Don't fail plan generation if tracking fails
    }
    
    console.log('[AI PLAN] Criando', aiPlan.weeks.length, 'semanas...');

    // Criar semanas e treinos
    for (const weekData of aiPlan.weeks) {
      // ✅ Calcular totalWorkouts baseado nos treinos REAIS gerados (não fixo em 7)
      const totalWorkouts = weekData.workouts.length;
      
      const week = await prisma.customWeek.create({
        data: {
          planId: customPlan.id,
          weekNumber: weekData.weekNumber,
          startDate: weekData.startDate,
          endDate: weekData.endDate,
          totalDistance: Math.round(weekData.totalDistance * 10) / 10,
          totalWorkouts: totalWorkouts, // ✅ Usar contagem real
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
        
        // v2.0.0 - Estrutura detalhada e enriquecimento educacional
        warmUpStructure: workout.warmUpStructure || null,
        mainWorkoutStruct: workout.mainWorkoutStruct || null,
        coolDownStructure: workout.coolDownStructure || null,
        objective: workout.objective || null,
        scientificBasis: workout.scientificBasis || null,
        tips: workout.tips || null,
        commonMistakes: workout.commonMistakes || null,
        successCriteria: workout.successCriteria || null,
        intensityLevel: workout.intensityLevel || null,
        expectedRPE: workout.expectedRPE || null,
        heartRateZones: workout.heartRateZones || null,
        intervals: workout.intervals || null,
        expectedDuration: workout.expectedDuration || null,
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
