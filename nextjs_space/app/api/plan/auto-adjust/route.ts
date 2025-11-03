import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { generateAIPlan } from '@/lib/ai-plan-generator';
import { isPremiumUser } from '@/lib/premium-check';

export const dynamic = 'force-dynamic';

/**
 * API para ajustar automaticamente o plano existente quando há mudanças
 * de disponibilidade ou outras configurações
 * PREMIUM FEATURE
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { reason, changes } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        athleteProfile: {
          include: {
            customPlan: {
              include: {
                weeks: {
                  include: {
                    workouts: true
                  }
                }
              }
            }
          }
        }
      },
    });

    if (!user?.athleteProfile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    // Auto-ajuste de disponibilidade/perfil é FREE para todos
    // Premium features: análise inteligente + ajustes baseados em Strava/feedbacks
    console.log('[AUTO-ADJUST] Ajuste de disponibilidade disponível para todos os usuários');

    if (!user.athleteProfile.customPlan) {
      return NextResponse.json({ error: 'Nenhum plano ativo encontrado' }, { status: 404 });
    }

    const profile = user.athleteProfile;
    const currentPlan = profile.customPlan;

    console.log('[AUTO-ADJUST] Iniciando ajuste automático do plano');
    console.log('[AUTO-ADJUST] Razão:', reason);
    console.log('[AUTO-ADJUST] Mudanças:', changes);

    // Buscar race goals se houver
    const raceGoals = await prisma.raceGoal.findMany({
      where: { athleteId: profile.id },
      orderBy: { raceDate: 'asc' }
    });

    // Preparar perfil para regeneração (com as novas mudanças aplicadas)
    const updatedProfile = {
      runningLevel: profile.runningLevel,
      goalDistance: profile.goalDistance,
      targetRaceDate: profile.targetRaceDate,
      currentWeeklyKm: profile.currentWeeklyKm,
      longestRun: profile.longestRun,
      currentVDOT: profile.currentVDOT || undefined,
      targetTime: profile.targetTime || undefined,
      weight: profile.weight,
      height: profile.height || undefined,
      age: profile.age || undefined,
      gender: profile.gender || undefined,
      trainingActivities: changes?.trainingActivities || profile.trainingActivities,
      longRunDay: changes?.longRunDay !== undefined ? changes.longRunDay : profile.longRunDay,
      usualPaces: profile.usualPaces || undefined,
      injuries: profile.injuries || undefined,
      medicalConditions: profile.medicalConditions || undefined,
      raceGoals: raceGoals.length > 0 ? raceGoals.map(r => ({
        id: r.id,
        name: r.raceName,
        distance: r.distance,
        date: r.raceDate,
        targetTime: r.targetTime,
        priority: r.priority as 'A' | 'B' | 'C'
      })) : undefined,
    };

    // Gerar novo plano com as mudanças
    console.log('[AUTO-ADJUST] Gerando novo plano com configurações atualizadas...');
    const aiPlan = await generateAIPlan(updatedProfile as any);
    console.log('[AUTO-ADJUST] Plano gerado com sucesso! Total semanas:', aiPlan.weeks.length);

    // CRÍTICO: Usar transação para garantir atomicidade
    // Se algo falhar, rollback automático (plano não fica quebrado)
    await prisma.$transaction(async (tx) => {
      // 1. Deletar workouts antigos
      const weekIds = currentPlan!.weeks.map(w => w.id);
      if (weekIds.length > 0) {
        console.log('[AUTO-ADJUST] Deletando workouts antigos...');
        await tx.customWorkout.deleteMany({
          where: { weekId: { in: weekIds } }
        });
        
        console.log('[AUTO-ADJUST] Deletando semanas antigas...');
        await tx.customWeek.deleteMany({
          where: { planId: currentPlan!.id }
        });
      }

      // 2. Atualizar plano existente
      console.log('[AUTO-ADJUST] Atualizando metadados do plano...');
      await tx.customTrainingPlan.update({
        where: { id: currentPlan!.id },
        data: {
          startDate: aiPlan.startDate,
          targetRaceDate: aiPlan.targetRaceDate,
          lastRegenerated: new Date(),
          periodization: {
            paces: aiPlan.paces,
            vdot: aiPlan.vdot,
            phases: aiPlan.phases,
            planRationale: aiPlan.planRationale,
            keyConsiderations: aiPlan.keyConsiderations,
            progressionStrategy: aiPlan.progressionStrategy,
            nutritionAdvice: aiPlan.nutritionAdvice,
            injuryPreventionTips: aiPlan.injuryPreventionTips,
          }
        }
      });

      // 3. Criar novas semanas e workouts
      console.log('[AUTO-ADJUST] Criando novas semanas...');
      for (const weekData of aiPlan.weeks) {
        const week = await tx.customWeek.create({
          data: {
            planId: currentPlan!.id,
            weekNumber: weekData.weekNumber,
            startDate: weekData.startDate,
            endDate: weekData.endDate,
            phase: weekData.phase,
            focus: weekData.focus,
            totalDistance: weekData.totalDistance,
          } as any,
        });

        const workouts = weekData.workouts.map(workout => ({
          weekId: week.id,
          dayOfWeek: workout.dayOfWeek,
          date: workout.date,
          type: workout.type,
          subtype: workout.subtype || null,
          title: workout.title,
          description: workout.description,
          distance: workout.distance || null,
          duration: workout.duration || null,
          targetPace: workout.targetPace || null,
          warmup: workout.warmup || null,
          mainSet: workout.mainSet || null,
          cooldown: workout.cooldown || null,
        }));

        await tx.customWorkout.createMany({
          data: workouts,
        });
      }

      // 4. Atualizar VDOT do perfil se mudou
      if (aiPlan.vdot && aiPlan.vdot !== profile.currentVDOT) {
        console.log('[AUTO-ADJUST] Atualizando VDOT do perfil...');
        await tx.athleteProfile.update({
          where: { id: profile.id },
          data: { currentVDOT: aiPlan.vdot }
        });
      }
    });

    console.log('[AUTO-ADJUST] Plano ajustado com sucesso! Transação completa.');

    return NextResponse.json({
      success: true,
      message: 'Plano ajustado automaticamente com sucesso!',
      changes: {
        totalWeeks: aiPlan.totalWeeks,
        vdot: aiPlan.vdot,
        phases: aiPlan.phases?.length || 0
      }
    });

  } catch (error) {
    console.error('[AUTO-ADJUST] Erro:', error);
    return NextResponse.json({
      error: 'Erro ao ajustar plano automaticamente',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
