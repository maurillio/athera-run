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

    // AJUSTE PROGRESSIVO: Preservar histórico, ajustar apenas futuro
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // Encontrar semana atual (onde hoje está)
    const semanaAtual = await prisma.customWeek.findFirst({
      where: {
        planId: currentPlan!.id,
        startDate: { lte: hoje },
        endDate: { gte: hoje }
      },
      include: {
        workouts: true
      }
    });
    
    // Definir data de corte (início da semana atual, ou hoje se não encontrou)
    const cutoffDate = semanaAtual ? semanaAtual.startDate : hoje;
    const cutoffWeekNumber = semanaAtual ? semanaAtual.weekNumber : 1;
    
    console.log('[AUTO-ADJUST] Data de corte:', cutoffDate.toISOString());
    console.log('[AUTO-ADJUST] Semana de corte:', cutoffWeekNumber);
    console.log('[AUTO-ADJUST] Preservando semanas anteriores + treinos completados');
    
    // Calcular semanas restantes
    const raceDate = profile.targetRaceDate ? new Date(profile.targetRaceDate) : new Date();
    const weeksRemaining = Math.ceil((raceDate.getTime() - cutoffDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    
    console.log('[AUTO-ADJUST] Semanas restantes até corrida:', weeksRemaining);
    
    // Gerar novo plano APENAS para as semanas restantes
    console.log('[AUTO-ADJUST] Gerando plano para semanas futuras...');
    
    // Ajustar perfil para gerar plano a partir da data de corte
    const adjustedProfile = {
      ...updatedProfile,
      targetRaceDate: raceDate,
      // IA vai gerar plano considerando que começa em cutoffDate
    };
    
    const aiPlan = await generateAIPlan(adjustedProfile as any);
    console.log('[AUTO-ADJUST] Plano gerado com sucesso! Total semanas:', aiPlan.weeks.length);

    // TRANSAÇÃO ATÔMICA: Preservar passado, ajustar futuro
    await prisma.$transaction(async (tx) => {
      // 1. Encontrar semanas a partir do cutoff (futuro + semana atual)
      const semanasFuturas = await tx.customWeek.findMany({
        where: {
          planId: currentPlan!.id,
          startDate: { gte: cutoffDate }
        },
        include: {
          workouts: true
        },
        orderBy: {
          weekNumber: 'asc'
        }
      });
      
      console.log('[AUTO-ADJUST] Semanas futuras encontradas:', semanasFuturas.length);
      
      // 2. Deletar apenas workouts NÃO completados das semanas futuras
      const weekIdsToDelete: number[] = [];
      let totalWorkoutsPreservados = 0;
      let totalWorkoutsRemovidos = 0;
      
      for (const semana of semanasFuturas) {
        const workoutsCompletados = semana.workouts.filter(w => w.isCompleted);
        const workoutsNaoCompletados = semana.workouts.filter(w => !w.isCompleted);
        
        if (workoutsCompletados.length > 0) {
          console.log(`[AUTO-ADJUST] Semana ${semana.weekNumber}: ${workoutsCompletados.length} treinos completados preservados`);
          totalWorkoutsPreservados += workoutsCompletados.length;
        }
        
        // Deletar apenas workouts NÃO completados
        if (workoutsNaoCompletados.length > 0) {
          await tx.customWorkout.deleteMany({
            where: {
              id: { in: workoutsNaoCompletados.map(w => w.id) }
            }
          });
          console.log(`[AUTO-ADJUST] Semana ${semana.weekNumber}: ${workoutsNaoCompletados.length} treinos não completados removidos`);
          totalWorkoutsRemovidos += workoutsNaoCompletados.length;
        }
        
        // Marcar semana para deleção apenas se não tem workouts completados
        if (workoutsCompletados.length === 0) {
          weekIdsToDelete.push(semana.id);
        }
      }
      
      // 3. Deletar apenas semanas SEM workouts completados
      if (weekIdsToDelete.length > 0) {
        console.log('[AUTO-ADJUST] Deletando', weekIdsToDelete.length, 'semanas sem treinos completados...');
        await tx.customWeek.deleteMany({
          where: {
            id: { in: weekIdsToDelete }
          }
        });
      }
      
      console.log(`[AUTO-ADJUST] Total: ${totalWorkoutsPreservados} completados preservados, ${totalWorkoutsRemovidos} não completados removidos`);

      // 4. Atualizar metadados do plano (preserva startDate original!)
      console.log('[AUTO-ADJUST] Atualizando metadados do plano...');
      await tx.customTrainingPlan.update({
        where: { id: currentPlan!.id },
        data: {
          // NÃO atualizar startDate - preserva data original
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

      // 5. Criar ou atualizar semanas futuras
      console.log('[AUTO-ADJUST] Criando/atualizando semanas futuras...');
      
      // Buscar última semana preservada para continuar numeração
      const ultimaSemanaPreservada = await tx.customWeek.findFirst({
        where: {
          planId: currentPlan!.id,
          startDate: { lt: cutoffDate }
        },
        orderBy: {
          weekNumber: 'desc'
        }
      });
      
      const baseWeekNumber = ultimaSemanaPreservada ? ultimaSemanaPreservada.weekNumber : 0;
      let semanasCriadas = 0;
      let semanasAtualizadas = 0;
      
      for (let i = 0; i < aiPlan.weeks.length; i++) {
        const weekData = aiPlan.weeks[i];
        const weekDate = new Date(weekData.startDate);
        
        // Pular semanas anteriores ao cutoff (já preservadas)
        if (weekDate < cutoffDate) {
          continue;
        }
        
        const novoWeekNumber = baseWeekNumber + i + 1;
        
        // Verificar se semana já existe (tem workouts completados)
        const semanaExistente = semanasFuturas.find(s => 
          new Date(s.startDate).getTime() === weekDate.getTime()
        );
        
        let weekId: number;
        
        if (semanaExistente && semanaExistente.workouts.some(w => w.isCompleted)) {
          // Atualizar semana existente (preserva workouts completados)
          await tx.customWeek.update({
            where: { id: semanaExistente.id },
            data: {
              weekNumber: novoWeekNumber,
              phase: weekData.phase,
              focus: weekData.focus,
              totalDistance: weekData.totalDistance,
            }
          });
          weekId = semanaExistente.id;
          semanasAtualizadas++;
          console.log(`[AUTO-ADJUST] Semana ${novoWeekNumber} atualizada (tem workouts completados)`);
        } else {
          // Criar nova semana
          const week = await tx.customWeek.create({
            data: {
              planId: currentPlan!.id,
              weekNumber: novoWeekNumber,
              startDate: weekData.startDate,
              endDate: weekData.endDate,
              phase: weekData.phase,
              focus: weekData.focus,
              totalDistance: weekData.totalDistance,
            } as any,
          });
          weekId = week.id;
          semanasCriadas++;
        }

        // Criar workouts não completados
        const workoutsExistentes = semanaExistente?.workouts.filter(w => w.isCompleted) || [];
        const datasExistentes = new Set(workoutsExistentes.map(w => new Date(w.date).toDateString()));
        
        const workoutsNovos = weekData.workouts
          .filter(workout => {
            const workoutDateStr = new Date(workout.date).toDateString();
            return !datasExistentes.has(workoutDateStr); // Não criar se já tem workout completado nessa data
          })
          .map(workout => ({
            weekId: weekId,
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
            isCompleted: false,
          }));

        if (workoutsNovos.length > 0) {
          await tx.customWorkout.createMany({
            data: workoutsNovos,
          });
        }
      }
      
      console.log(`[AUTO-ADJUST] Semanas criadas: ${semanasCriadas}, atualizadas: ${semanasAtualizadas}`);

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
    
    // Calcular estatísticas para feedback
    const semanasPassadas = await prisma.customWeek.count({
      where: {
        planId: currentPlan!.id,
        startDate: { lt: cutoffDate }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Plano ajustado! ${semanasPassadas} semanas anteriores preservadas.`,
      changes: {
        totalWeeks: aiPlan.totalWeeks,
        vdot: aiPlan.vdot,
        phases: aiPlan.phases?.length || 0,
        preservedWeeks: semanasPassadas,
        adjustedFrom: cutoffDate.toISOString()
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
