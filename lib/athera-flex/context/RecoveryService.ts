// lib/athera-flex/context/RecoveryService.ts
import { RecoveryContext } from './ContextAwarenessEngine';
import { prisma } from '@/lib/prisma';

interface RecoveryMetrics {
  hoursSinceLastWorkout: number;
  lastWorkoutIntensity: string;
  lastWorkoutDistance: number;
  recentIntenseCount: number; // Últimos 7 dias
  consecutiveDays: number;
}

export class RecoveryService {
  private static instance: RecoveryService;

  private constructor() {}

  public static getInstance(): RecoveryService {
    if (!RecoveryService.instance) {
      RecoveryService.instance = new RecoveryService();
    }
    return RecoveryService.instance;
  }

  /**
   * Analisa status de recuperação do atleta
   */
  async getRecoveryContext(
    userId: number,
    targetDate: Date,
    plannedIntensity: string = 'moderate'
  ): Promise<RecoveryContext> {
    try {
      const metrics = await this.collectRecoveryMetrics(userId, targetDate);
      const recoveryScore = await this.calculateRecoveryScore(userId, metrics);

      const isFatigued = recoveryScore < 60;
      const needsRest = recoveryScore < 40 || metrics.consecutiveDays >= 6;
      const canDoHard = recoveryScore >= 70 && metrics.hoursSinceLastWorkout >= 24;

      const reason = this.generateReason(
        metrics,
        recoveryScore,
        isFatigued,
        needsRest,
        canDoHard,
        plannedIntensity
      );

      return {
        lastHardWorkout: metrics.recentIntenseCount > 0 ? await this.getLastHardWorkout(userId) : null,
        hoursSinceLastWorkout: metrics.hoursSinceLastWorkout,
        isFatigued,
        needsRest,
        canDoHard,
        reason,
      };
    } catch (error) {
      console.error('[RecoveryService] Error analyzing recovery:', error);
      return this.getDefaultContext();
    }
  }

  /**
   * Coleta métricas de recuperação
   */
  private async collectRecoveryMetrics(
    userId: number,
    targetDate: Date
  ): Promise<RecoveryMetrics> {
    const sevenDaysAgo = new Date(targetDate);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Buscar treinos dos últimos 7 dias
    const recentWorkouts = await prisma.completed_workouts.findMany({
      where: {
        user_id: userId,
        completed_at: {
          gte: sevenDaysAgo,
          lt: targetDate,
        },
      },
      orderBy: {
        completed_at: 'desc',
      },
    });

    if (recentWorkouts.length === 0) {
      return {
        hoursSinceLastWorkout: 999,
        lastWorkoutIntensity: 'none',
        lastWorkoutDistance: 0,
        recentIntenseCount: 0,
        consecutiveDays: 0,
      };
    }

    const lastWorkout = recentWorkouts[0];
    const hoursSinceLastWorkout = Math.floor(
      (targetDate.getTime() - lastWorkout.completed_at.getTime()) / (1000 * 60 * 60)
    );

    // Contar treinos intensos (hard ou very_hard)
    const recentIntenseCount = recentWorkouts.filter(w => 
      ['hard', 'very_hard'].includes(w.intensity || '')
    ).length;

    // Calcular dias consecutivos de treino
    const consecutiveDays = this.countConsecutiveDays(recentWorkouts, targetDate);

    return {
      hoursSinceLastWorkout,
      lastWorkoutIntensity: lastWorkout.intensity || 'moderate',
      lastWorkoutDistance: lastWorkout.distance,
      recentIntenseCount,
      consecutiveDays,
    };
  }

  /**
   * Conta dias consecutivos de treino
   */
  private countConsecutiveDays(workouts: any[], targetDate: Date): number {
    if (workouts.length === 0) return 0;

    let count = 0;
    let currentDate = new Date(targetDate);
    currentDate.setDate(currentDate.getDate() - 1); // Começa no dia anterior
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const hasWorkout = workouts.some(w => {
        const workoutDate = new Date(w.completed_at);
        workoutDate.setHours(0, 0, 0, 0);
        return workoutDate.getTime() === currentDate.getTime();
      });

      if (hasWorkout) {
        count++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return count;
  }

  /**
   * Calcula score de recuperação (0-100) usando ML básico
   */
  private async calculateRecoveryScore(
    userId: number,
    metrics: RecoveryMetrics
  ): Promise<number> {
    let score = 100;

    // Fator 1: Tempo desde último treino (peso: 30%)
    // < 12h: -40 pontos
    // 12-24h: -20 pontos
    // 24-48h: -5 pontos
    // > 48h: +5 pontos
    if (metrics.hoursSinceLastWorkout < 12) {
      score -= 40;
    } else if (metrics.hoursSinceLastWorkout < 24) {
      score -= 20;
    } else if (metrics.hoursSinceLastWorkout < 48) {
      score -= 5;
    } else if (metrics.hoursSinceLastWorkout > 48) {
      score += 5;
    }

    // Fator 2: Intensidade do último treino (peso: 25%)
    const intensityPenalty = {
      'very_hard': 30,
      'hard': 20,
      'moderate': 10,
      'easy': 5,
      'none': 0,
    }[metrics.lastWorkoutIntensity] || 10;

    score -= intensityPenalty;

    // Fator 3: Treinos intensos recentes (peso: 25%)
    // 0-1: OK
    // 2-3: -10 pontos
    // 4+: -20 pontos
    if (metrics.recentIntenseCount >= 4) {
      score -= 20;
    } else if (metrics.recentIntenseCount >= 2) {
      score -= 10;
    }

    // Fator 4: Dias consecutivos (peso: 20%)
    // 0-2: OK
    // 3-4: -10 pontos
    // 5: -20 pontos
    // 6+: -30 pontos
    if (metrics.consecutiveDays >= 6) {
      score -= 30;
    } else if (metrics.consecutiveDays >= 5) {
      score -= 20;
    } else if (metrics.consecutiveDays >= 3) {
      score -= 10;
    }

    // Buscar recovery score salvo (de wearables como Whoop, Garmin, etc)
    const savedScore = await this.fetchSavedRecoveryScore(userId);
    if (savedScore !== null) {
      // Média ponderada: 70% calculado + 30% do wearable
      score = Math.round(score * 0.7 + savedScore * 0.3);
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Busca recovery score salvo (de wearables)
   */
  private async fetchSavedRecoveryScore(userId: number): Promise<number | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const score = await prisma.recovery_scores.findFirst({
      where: {
        user_id: userId,
        date: {
          gte: today,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return score?.score || null;
  }

  /**
   * Busca último treino intenso
   */
  private async getLastHardWorkout(userId: number): Promise<Date | null> {
    const workout = await prisma.completed_workouts.findFirst({
      where: {
        user_id: userId,
        intensity: {
          in: ['hard', 'very_hard'],
        },
      },
      orderBy: {
        completed_at: 'desc',
      },
    });

    return workout?.completed_at || null;
  }

  /**
   * Gera razão em português
   */
  private generateReason(
    metrics: RecoveryMetrics,
    score: number,
    isFatigued: boolean,
    needsRest: boolean,
    canDoHard: boolean,
    plannedIntensity: string
  ): string {
    // Situação crítica: Precisa descansar
    if (needsRest) {
      if (metrics.consecutiveDays >= 6) {
        return `${metrics.consecutiveDays} dias seguidos de treino, descanse hoje`;
      }
      if (score < 40) {
        return 'Recovery score muito baixo (< 40), priorize descanso';
      }
      return 'Sinais claros de fadiga, seu corpo precisa recuperar';
    }

    // Fatigado mas não crítico
    if (isFatigued) {
      if (metrics.hoursSinceLastWorkout < 12) {
        return `Apenas ${metrics.hoursSinceLastWorkout}h desde último treino, considere adiar`;
      }
      if (metrics.recentIntenseCount >= 3) {
        return `${metrics.recentIntenseCount} treinos intensos esta semana, reduza carga`;
      }
      return 'Recuperação parcial, prefira treino leve';
    }

    // Pode fazer treino intenso
    if (canDoHard) {
      if (plannedIntensity === 'hard' || plannedIntensity === 'very_hard') {
        return `Recovery score alto (${score}), ideal para treino intenso`;
      }
      return 'Bem recuperado, pode aumentar intensidade se quiser';
    }

    // Situação normal
    if (metrics.hoursSinceLastWorkout >= 24) {
      return `${Math.floor(metrics.hoursSinceLastWorkout / 24)} dia(s) de recuperação, bom para treino moderado`;
    }

    return `Recovery score ${score}/100, siga treino conforme planejado`;
  }

  /**
   * Contexto padrão quando não há dados
   */
  private getDefaultContext(): RecoveryContext {
    return {
      lastHardWorkout: null,
      hoursSinceLastWorkout: 48,
      isFatigued: false,
      needsRest: false,
      canDoHard: true,
      reason: 'Sem dados suficientes, prossiga conforme planejado',
    };
  }

  /**
   * Salva recovery score de wearable
   */
  async saveRecoveryScore(
    userId: number,
    score: number,
    source: string = 'manual'
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.recovery_scores.upsert({
      where: {
        user_id_date: {
          user_id: userId,
          date: today,
        },
      },
      update: {
        score,
        source,
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        date: today,
        score,
        source,
      },
    });
  }
}

export const recoveryService = RecoveryService.getInstance();
