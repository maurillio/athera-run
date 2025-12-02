// lib/athera-flex/context/EnergyService.ts
import { EnergyContext } from './ContextAwarenessEngine';
import { prisma } from '@/lib/prisma';

interface WorkoutLoad {
  date: Date;
  tss: number;
  distance: number;
  duration: number;
  intensity: string;
}

export class EnergyService {
  private static instance: EnergyService;

  private constructor() {}

  public static getInstance(): EnergyService {
    if (!EnergyService.instance) {
      EnergyService.instance = new EnergyService();
    }
    return EnergyService.instance;
  }

  /**
   * Analisa nível de energia do atleta
   */
  async getEnergyContext(userId: number, targetDate: Date): Promise<EnergyContext> {
    try {
      // Buscar carga dos últimos 7 dias
      const recentWorkouts = await this.fetchRecentWorkouts(userId, 7);
      
      // Buscar dados de energia/sono se disponíveis (Strava, wearables)
      const energyLog = await this.fetchEnergyLog(userId, targetDate);

      // Calcular TSS acumulado (Training Stress Score)
      const accumulatedTSS = this.calculateAccumulatedTSS(recentWorkouts);

      // Calcular nível de energia (0-100)
      const currentLevel = this.calculateEnergyLevel(accumulatedTSS, energyLog);

      // Detectar tendência
      const trend = this.detectTrend(recentWorkouts);

      // Obter dados de sono/stress
      const sleepQuality = energyLog?.sleep_quality || 'unknown';
      const stressLevel = energyLog?.stress_level || 5; // 0-10
      const sorenessLevel = energyLog?.soreness_level || 5; // 0-10

      // Gerar recomendação
      const recommendation = this.generateRecommendation(
        currentLevel,
        accumulatedTSS,
        sleepQuality,
        stressLevel,
        sorenessLevel
      );

      const reason = this.generateReason(
        currentLevel,
        accumulatedTSS,
        sleepQuality,
        trend,
        recommendation
      );

      return {
        currentLevel,
        trend,
        sleepQuality,
        stressLevel,
        sorenessLevel,
        recommendation,
        reason,
      };
    } catch (error) {
      console.error('[EnergyService] Error analyzing energy:', error);
      return this.getDefaultContext();
    }
  }

  /**
   * Busca treinos recentes
   */
  private async fetchRecentWorkouts(userId: number, days: number): Promise<WorkoutLoad[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const workouts = await prisma.completed_workouts.findMany({
      where: {
        user_id: userId,
        completed_at: {
          gte: startDate,
        },
      },
      orderBy: {
        completed_at: 'desc',
      },
    });

    return workouts.map(w => ({
      date: w.completed_at,
      tss: w.tss || this.estimateTSS(w.distance, w.duration, w.intensity),
      distance: w.distance,
      duration: w.duration,
      intensity: w.intensity || 'moderate',
    }));
  }

  /**
   * Busca log de energia do usuário
   */
  private async fetchEnergyLog(userId: number, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.energy_logs.findFirst({
      where: {
        user_id: userId,
        logged_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        logged_at: 'desc',
      },
    });
  }

  /**
   * Estima TSS quando não disponível
   */
  private estimateTSS(distance: number, duration: number, intensity: string): number {
    const baseIntensity = {
      'easy': 0.6,
      'moderate': 0.75,
      'hard': 0.9,
      'very_hard': 1.0,
    }[intensity] || 0.7;

    // TSS = (duration_hours × intensity_factor^2 × 100)
    const durationHours = duration / 60;
    return Math.round(durationHours * Math.pow(baseIntensity, 2) * 100);
  }

  /**
   * Calcula TSS acumulado dos últimos dias
   */
  private calculateAccumulatedTSS(workouts: WorkoutLoad[]): number {
    return workouts.reduce((sum, w) => sum + w.tss, 0);
  }

  /**
   * Calcula nível de energia (0-100)
   */
  private calculateEnergyLevel(
    accumulatedTSS: number,
    energyLog: any
  ): number {
    let level = 100;

    // Penalizar por TSS acumulado
    // TSS < 200: Fresh (90-100)
    // TSS 200-400: Moderate (70-90)
    // TSS 400-600: Tired (50-70)
    // TSS > 600: Exhausted (0-50)
    if (accumulatedTSS > 600) {
      level = Math.max(0, 50 - (accumulatedTSS - 600) / 10);
    } else if (accumulatedTSS > 400) {
      level = 70 - (accumulatedTSS - 400) / 10;
    } else if (accumulatedTSS > 200) {
      level = 90 - (accumulatedTSS - 200) / 10;
    }

    // Ajustar por qualidade do sono
    if (energyLog) {
      const sleepBonus = {
        'excellent': 10,
        'good': 5,
        'fair': 0,
        'poor': -10,
      }[energyLog.sleep_quality] || 0;

      level = Math.max(0, Math.min(100, level + sleepBonus));

      // Ajustar por stress
      if (energyLog.stress_level > 7) {
        level -= 10;
      }

      // Ajustar por dor muscular
      if (energyLog.soreness_level > 7) {
        level -= 15;
      }
    }

    return Math.round(Math.max(0, Math.min(100, level)));
  }

  /**
   * Detecta tendência de energia
   */
  private detectTrend(workouts: WorkoutLoad[]): 'increasing' | 'stable' | 'decreasing' {
    if (workouts.length < 3) return 'stable';

    // Comparar TSS dos últimos 3 dias vs 3-6 dias atrás
    const recent = workouts.slice(0, 3);
    const older = workouts.slice(3, 6);

    const recentAvg = recent.reduce((sum, w) => sum + w.tss, 0) / recent.length;
    const olderAvg = older.length > 0 
      ? older.reduce((sum, w) => sum + w.tss, 0) / older.length 
      : recentAvg;

    const diff = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (diff > 15) return 'decreasing'; // Carga aumentando = energia diminuindo
    if (diff < -15) return 'increasing'; // Carga diminuindo = energia aumentando
    return 'stable';
  }

  /**
   * Gera recomendação baseada em energia
   */
  private generateRecommendation(
    level: number,
    tss: number,
    sleep: string,
    stress: number,
    soreness: number
  ): 'full' | 'modified' | 'skip' | 'rest' {
    // Situações críticas: Recomendar descanso
    if (level < 30 || tss > 600 || stress > 8 || soreness > 8) {
      return 'rest';
    }

    // Energia muito baixa: Pular treino
    if (level < 50 || sleep === 'poor') {
      return 'skip';
    }

    // Energia moderada: Modificar treino (reduzir intensidade/volume)
    if (level < 70 || tss > 400) {
      return 'modified';
    }

    // Energia boa: Fazer treino completo
    return 'full';
  }

  /**
   * Gera razão em português
   */
  private generateReason(
    level: number,
    tss: number,
    sleep: string,
    trend: string,
    recommendation: string
  ): string {
    if (recommendation === 'rest') {
      if (level < 30) return 'Energia muito baixa, seu corpo precisa de descanso';
      if (tss > 600) return 'Carga acumulada alta (TSS > 600), risco de overtraining';
      return 'Sinais de fadiga extrema, priorize recuperação';
    }

    if (recommendation === 'skip') {
      if (sleep === 'poor') return 'Qualidade de sono ruim, treino pode prejudicar recuperação';
      return 'Energia baixa, melhor descansar hoje';
    }

    if (recommendation === 'modified') {
      if (tss > 400) return 'Carga acumulada moderada/alta, reduza intensidade em 20-30%';
      return 'Energia moderada, considere treino mais leve';
    }

    // Full
    if (level > 85 && trend === 'increasing') {
      return 'Energia excelente e em alta, ótimo momento para treino forte';
    }
    return 'Energia boa, pode fazer treino conforme planejado';
  }

  /**
   * Contexto padrão quando não há dados
   */
  private getDefaultContext(): EnergyContext {
    return {
      currentLevel: 75,
      trend: 'stable',
      sleepQuality: 'unknown',
      stressLevel: 5,
      sorenessLevel: 5,
      recommendation: 'full',
      reason: 'Sem dados suficientes, prossiga com cautela',
    };
  }

  /**
   * Registra log de energia (chamado pelo usuário via app)
   */
  async logEnergy(
    userId: number,
    data: {
      sleepQuality: string;
      stressLevel: number;
      sorenessLevel: number;
      notes?: string;
    }
  ): Promise<void> {
    await prisma.energy_logs.create({
      data: {
        user_id: userId,
        sleep_quality: data.sleepQuality,
        stress_level: data.stressLevel,
        soreness_level: data.sorenessLevel,
        notes: data.notes,
        logged_at: new Date(),
      },
    });
  }
}

export const energyService = EnergyService.getInstance();
