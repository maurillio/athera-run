/**
 * STRAVA IMPACT ANALYZER - v3.2.0
 * FASE 4: Sistema de métricas avançadas e análise de impacto
 * 
 * Analisa o impacto de atividades do Strava no plano de treino
 * e identifica necessidade de ajustes
 */

import { prisma } from './db';

interface StravaActivity {
  distance: number;
  moving_time: number;
  total_elevation_gain: number;
  average_heartrate?: number;
  max_heartrate?: number;
  type: string;
  start_date: string;
}

interface ImpactAnalysis {
  requiresAdjustment: boolean;
  severity: 'low' | 'medium' | 'high';
  impactScore: number; // 0-100
  insights: string[];
  recommendations: string[];
  metrics: {
    volumeDeviation: number; // % desvio do volume semanal planejado
    intensityLevel: number; // 1-5
    fatigueRisk: number; // 0-100
    recoveryDays: number; // dias recomendados de recuperação
  };
  plannedWorkouts: {
    shouldSkip: number[];
    shouldModify: number[];
    canProceed: number[];
  };
}

/**
 * Analisar impacto de uma atividade no plano de treino
 */
export async function analyzeActivityImpact(
  activity: StravaActivity,
  athleteId: number,
  isRace: boolean
): Promise<ImpactAnalysis> {
  const insights: string[] = [];
  const recommendations: string[] = [];
  let impactScore = 0;

  const distanceKm = activity.distance / 1000;
  const durationMin = activity.moving_time / 60;
  const paceMinKm = durationMin / distanceKm;

  // ========================================
  // BUSCAR PLANO ATIVO E SEMANA ATUAL
  // ========================================

  const profile = await prisma.athleteProfile.findUnique({
    where: { id: athleteId },
    include: {
      customPlan: {
        where: { isActive: true },
        include: {
          weeks: {
            where: {
              startDate: { lte: new Date() },
              endDate: { gte: new Date() }
            },
            include: {
              workouts: {
                where: {
                  isCompleted: false,
                  date: { gte: new Date() }
                },
                orderBy: { date: 'asc' }
              }
            }
          }
        }
      }
    }
  });

  if (!profile?.customPlan) {
    return {
      requiresAdjustment: false,
      severity: 'low',
      impactScore: 0,
      insights: ['Nenhum plano ativo encontrado'],
      recommendations: [],
      metrics: {
        volumeDeviation: 0,
        intensityLevel: 1,
        fatigueRisk: 0,
        recoveryDays: 1
      },
      plannedWorkouts: {
        shouldSkip: [],
        shouldModify: [],
        canProceed: []
      }
    };
  }

  const currentWeek = profile.customPlan.weeks[0];

  // ========================================
  // CÁLCULO DE MÉTRICAS
  // ========================================

  // 1. DESVIO DE VOLUME
  const weeklyPlannedVolume = currentWeek?.totalDistance || 0;
  const completedThisWeek = await getCompletedVolumeThisWeek(athleteId);
  const totalVolume = completedThisWeek + distanceKm;
  const volumeDeviation = ((totalVolume - weeklyPlannedVolume) / weeklyPlannedVolume) * 100;

  if (Math.abs(volumeDeviation) > 15) {
    impactScore += 20;
    insights.push(
      volumeDeviation > 0
        ? `Volume semanal ${volumeDeviation.toFixed(0)}% acima do planejado`
        : `Volume semanal ${Math.abs(volumeDeviation).toFixed(0)}% abaixo do planejado`
    );
  }

  // 2. NÍVEL DE INTENSIDADE (1-5)
  let intensityLevel = 1;

  if (isRace) {
    intensityLevel = 5;
    impactScore += 30;
    insights.push('Prova realizada (intensidade máxima)');
  } else if (paceMinKm < 5.5) {
    intensityLevel = 4;
    impactScore += 15;
    insights.push('Treino de alta intensidade detectado');
  } else if (paceMinKm < 6.5) {
    intensityLevel = 3;
    impactScore += 10;
    insights.push('Treino de intensidade moderada');
  } else if (distanceKm > 15) {
    intensityLevel = 3;
    impactScore += 10;
    insights.push('Longo realizado');
  } else {
    intensityLevel = 2;
    insights.push('Treino leve/recuperação');
  }

  // 3. RISCO DE FADIGA
  const recentVolume = await getRecentVolumeHistory(athleteId, 14);
  const avgWeeklyVolume = recentVolume / 2;
  let fatigueRisk = 0;

  if (totalVolume > avgWeeklyVolume * 1.5) {
    fatigueRisk = 70;
    impactScore += 25;
    insights.push('Alto risco de fadiga (volume 50% acima do usual)');
  } else if (totalVolume > avgWeeklyVolume * 1.3) {
    fatigueRisk = 50;
    impactScore += 15;
    insights.push('Risco moderado de fadiga');
  } else if (totalVolume > avgWeeklyVolume * 1.1) {
    fatigueRisk = 30;
    impactScore += 5;
    insights.push('Leve aumento de volume detectado');
  } else {
    fatigueRisk = 10;
    insights.push('Volume dentro do esperado');
  }

  // 4. FREQUÊNCIA CARDÍACA (se disponível)
  if (activity.average_heartrate && profile.maxHeartRate) {
    const hrPercentage = (activity.average_heartrate / profile.maxHeartRate) * 100;

    if (hrPercentage > 90) {
      impactScore += 15;
      insights.push('FC muito elevada durante o treino');
      fatigueRisk += 10;
    } else if (hrPercentage > 80) {
      impactScore += 10;
      insights.push('FC elevada (zona de alta intensidade)');
      fatigueRisk += 5;
    }
  }

  // 5. DIAS DE RECUPERAÇÃO RECOMENDADOS
  let recoveryDays = 1;

  if (isRace) {
    if (distanceKm >= 42) {
      recoveryDays = 14; // Maratona
      recommendations.push('14 dias de recuperação recomendados (maratona)');
    } else if (distanceKm >= 21) {
      recoveryDays = 7; // Meia maratona
      recommendations.push('7 dias de recuperação recomendados (meia maratona)');
    } else if (distanceKm >= 10) {
      recoveryDays = 3; // 10k ou mais
      recommendations.push('3 dias de recuperação recomendados');
    } else {
      recoveryDays = 2;
      recommendations.push('2 dias de recuperação recomendados');
    }
  } else if (intensityLevel >= 4) {
    recoveryDays = 2;
    recommendations.push('2 dias de recuperação recomendados (treino intenso)');
  } else if (distanceKm > 20) {
    recoveryDays = 2;
    recommendations.push('2 dias de recuperação recomendados (longo)');
  }

  // ========================================
  // ANÁLISE DE TREINOS FUTUROS
  // ========================================

  const futureWorkouts = currentWeek?.workouts || [];
  const shouldSkip: number[] = [];
  const shouldModify: number[] = [];
  const canProceed: number[] = [];

  const activityDate = new Date(activity.start_date);

  futureWorkouts.forEach((workout) => {
    const daysDiff = Math.floor(
      (workout.date.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff < recoveryDays) {
      // Treino dentro do período de recuperação
      if (workout.type === 'running' && 
          (workout.subtype === 'interval' || workout.subtype === 'tempo')) {
        shouldSkip.push(workout.id);
        recommendations.push(
          `Pular treino intenso em ${daysDiff} dias (ainda em recuperação)`
        );
      } else if (workout.distance && workout.distance > 10) {
        shouldModify.push(workout.id);
        recommendations.push(
          `Reduzir volume do treino em ${daysDiff} dias (recuperação ativa)`
        );
      } else {
        canProceed.push(workout.id);
      }
    } else {
      canProceed.push(workout.id);
    }
  });

  // ========================================
  // DETERMINAR SEVERIDADE E NECESSIDADE DE AJUSTE
  // ========================================

  let severity: 'low' | 'medium' | 'high' = 'low';
  let requiresAdjustment = false;

  if (impactScore >= 60) {
    severity = 'high';
    requiresAdjustment = true;
    recommendations.push('⚠️ AJUSTE NECESSÁRIO: Impacto significativo no plano');
  } else if (impactScore >= 40) {
    severity = 'medium';
    requiresAdjustment = shouldSkip.length > 0 || shouldModify.length > 0;
    recommendations.push('📊 Ajuste recomendado para próximos treinos');
  } else {
    severity = 'low';
    requiresAdjustment = false;
    recommendations.push('✅ Impacto baixo, plano pode continuar normalmente');
  }

  // Recomendações específicas
  if (isRace) {
    recommendations.push('🏁 Prova detectada: plano será ajustado automaticamente');
  }

  if (fatigueRisk > 60) {
    recommendations.push('⚠️ Alto risco de fadiga: priorize recuperação');
  }

  if (volumeDeviation > 20) {
    recommendations.push('📈 Volume muito acima: reduzir próximos treinos');
  } else if (volumeDeviation < -20) {
    recommendations.push('📉 Volume muito abaixo: reavaliar meta semanal');
  }

  return {
    requiresAdjustment,
    severity,
    impactScore: Math.min(impactScore, 100),
    insights,
    recommendations,
    metrics: {
      volumeDeviation,
      intensityLevel,
      fatigueRisk: Math.min(fatigueRisk, 100),
      recoveryDays
    },
    plannedWorkouts: {
      shouldSkip,
      shouldModify,
      canProceed
    }
  };
}

/**
 * Buscar volume completado na semana atual
 */
async function getCompletedVolumeThisWeek(athleteId: number): Promise<number> {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const workouts = await prisma.completedWorkout.findMany({
    where: {
      athleteId,
      date: { gte: startOfWeek },
      type: 'running'
    },
    select: { distance: true }
  });

  return workouts.reduce((sum, w) => sum + (w.distance || 0), 0);
}

/**
 * Buscar histórico de volume (últimos N dias)
 */
async function getRecentVolumeHistory(athleteId: number, days: number): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const workouts = await prisma.completedWorkout.findMany({
    where: {
      athleteId,
      date: { gte: since },
      type: 'running'
    },
    select: { distance: true }
  });

  return workouts.reduce((sum, w) => sum + (w.distance || 0), 0);
}

/**
 * Aplicar ajustes automáticos baseados na análise
 */
export async function applyAutomaticAdjustments(
  athleteId: number,
  analysis: ImpactAnalysis
) {
  if (!analysis.requiresAdjustment) {
    return { adjusted: 0, message: 'Nenhum ajuste necessário' };
  }

  let adjustedCount = 0;

  // Pular treinos intensos
  for (const workoutId of analysis.plannedWorkouts.shouldSkip) {
    await prisma.customWorkout.update({
      where: { id: workoutId },
      data: {
        type: 'recovery',
        subtype: 'active_recovery',
        description: 'Ajustado automaticamente para recuperação ativa',
        distance: 5,
        targetPace: 'easy'
      }
    });
    adjustedCount++;
  }

  // Modificar treinos longos
  for (const workoutId of analysis.plannedWorkouts.shouldModify) {
    const workout = await prisma.customWorkout.findUnique({
      where: { id: workoutId }
    });

    if (workout?.distance) {
      await prisma.customWorkout.update({
        where: { id: workoutId },
        data: {
          distance: workout.distance * 0.7, // Reduzir 30%
          description: `${workout.description || ''}\n\n⚠️ Volume reduzido automaticamente (recuperação ativa)`
        }
      });
      adjustedCount++;
    }
  }

  return {
    adjusted: adjustedCount,
    message: `${adjustedCount} treino(s) ajustado(s) automaticamente`,
    severity: analysis.severity
  };
}
