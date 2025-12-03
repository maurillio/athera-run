// lib/athera-flex/context/ContextAwarenessEngine.ts
import { prisma } from '@/lib/prisma';
import { weatherService } from './WeatherService';
import { energyService } from './EnergyService';
import { recoveryService } from './RecoveryService';

export interface WorkoutContext {
  weather: WeatherContext | null;
  calendar: CalendarContext | null;
  energy: EnergyContext | null;
  recovery: RecoveryContext | null;
}

export interface WeatherContext {
  temperature: number;
  condition: string;
  precipitation: number;
  windSpeed: number;
  isOutdoorSafe: boolean;
  reason?: string;
}

export interface CalendarContext {
  hasConflicts: boolean;
  conflicts: Array<{
    title: string;
    start: Date;
    end: Date;
    isImportant: boolean;
  }>;
  availableSlots: Array<{ start: string; end: string }>;
}

export interface EnergyContext {
  currentLevel: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  sleepQuality: string;
  stressLevel: number;
  sorenessLevel: number;
  recommendation: 'full' | 'modified' | 'skip' | 'rest';
  reason?: string;
}

export interface RecoveryContext {
  lastHardWorkout: Date | null;
  hoursSinceLastWorkout: number;
  isFatigued: boolean;
  needsRest: boolean;
  canDoHard: boolean;
  reason?: string;
}

export interface ContextDecision {
  canProceed: boolean;
  shouldDefer: boolean;
  shouldModify: boolean;
  alternativeDate?: Date;
  alternativeType?: string;
  confidence: number;
  reasons: string[];
  context: WorkoutContext;
}

export class ContextAwarenessEngine {
  private static instance: ContextAwarenessEngine;

  private constructor() {}

  public static getInstance(): ContextAwarenessEngine {
    if (!ContextAwarenessEngine.instance) {
      ContextAwarenessEngine.instance = new ContextAwarenessEngine();
    }
    return ContextAwarenessEngine.instance;
  }

  /**
   * Analisa contexto completo para um treino
   */
  async analyzeWorkoutContext(
    userId: number,
    workoutDate: Date,
    workoutType: string,
    isOutdoor: boolean
  ): Promise<ContextDecision> {
    const userContext = await prisma.user_contexts.findUnique({
      where: { user_id: userId },
    });

    if (!userContext) {
      return this.createDefaultDecision();
    }

    const [weather, calendar, energy, recovery] = await Promise.all([
      this.analyzeWeather(userId, workoutDate, isOutdoor, userContext),
      this.analyzeCalendar(userId, workoutDate, userContext),
      this.analyzeEnergy(userId, workoutDate, userContext),
      this.analyzeRecovery(userId, workoutDate, workoutType),
    ]);

    const context: WorkoutContext = { weather, calendar, energy, recovery };
    const decision = this.makeDecision(context, workoutType, workoutDate);

    // Log da decisão
    await this.logContextDecision(userId, workoutDate, decision, context);

    return decision;
  }

  /**
   * Analisa condições climáticas
   */
  private async analyzeWeather(
    userId: number,
    date: Date,
    isOutdoor: boolean,
    userContext: any
  ): Promise<WeatherContext | null> {
    if (!isOutdoor) {
      return null;
    }

    // Usar location do usuário (default: São Paulo, BR)
    const location = userContext.location || 'São Paulo,BR';
    
    return await weatherService.getWeatherContext(location, date, isOutdoor);

    if (
      userContext.avoid_outdoor_rain &&
      mockWeather.precipitation > 70
    ) {
      return {
        ...mockWeather,
        isOutdoorSafe: false,
        reason: 'Alta probabilidade de chuva',
      };
    }

    return mockWeather;
  }

  /**
   * Analisa conflitos de calendário
   * REMOVIDO: Feature de Google Calendar desabilitada
   */
  private async analyzeCalendar(
    userId: number,
    date: Date,
    userContext: any
  ): Promise<CalendarContext | null> {
    // Google Calendar integration removed - feature disabled
    return null;
  }

  /**
   * Analisa níveis de energia e fadiga
   */
  private async analyzeEnergy(
    userId: number,
    date: Date,
    userContext: any
  ): Promise<EnergyContext | null> {
    return await energyService.getEnergyContext(userId, date);
  }

  /**
   * Analisa estado de recuperação
   */
  private async analyzeRecovery(
    userId: number,
    date: Date,
    workoutType: string
  ): Promise<RecoveryContext> {
    return await recoveryService.getRecoveryContext(userId, date, workoutType);

    return {
      lastHardWorkout: lastHard?.executed_at || null,
      hoursSinceLastWorkout: hoursSince,
      isFatigued,
      needsRest,
      canDoHard,
      reason: needsRest ? 'Período de recuperação obrigatório' : undefined,
    };
  }

  /**
   * Toma decisão baseada em todos os contextos
   */
  private makeDecision(
    context: WorkoutContext,
    workoutType: string,
    workoutDate: Date
  ): ContextDecision {
    const reasons: string[] = [];
    let canProceed = true;
    let shouldDefer = false;
    let shouldModify = false;
    let confidence = 100;

    // Weather check
    if (context.weather && !context.weather.isOutdoorSafe) {
      shouldModify = true;
      confidence -= 20;
      reasons.push(context.weather.reason || 'Condições climáticas desfavoráveis');
    }

    // Calendar check
    if (context.calendar?.hasConflicts) {
      shouldDefer = true;
      confidence -= 30;
      reasons.push('Conflito com evento importante no calendário');
    }

    // Energy check
    if (context.energy && context.energy.recommendation === 'skip') {
      canProceed = false;
      confidence -= 40;
      reasons.push(context.energy.reason || 'Nível de energia muito baixo');
    } else if (context.energy && context.energy.recommendation === 'modified') {
      shouldModify = true;
      confidence -= 15;
      reasons.push('Energia moderada - reduzir intensidade');
    }

    // Recovery check
    if (context.recovery.needsRest) {
      canProceed = false;
      confidence = 0;
      reasons.push(context.recovery.reason || 'Período de recuperação necessário');
    } else if (
      workoutType === 'hard' &&
      !context.recovery.canDoHard
    ) {
      shouldDefer = true;
      confidence -= 25;
      reasons.push('Recuperação insuficiente para treino intenso');
    }

    return {
      canProceed: canProceed && !shouldDefer,
      shouldDefer,
      shouldModify,
      confidence: Math.max(0, confidence),
      reasons,
      context,
    };
  }

  /**
   * Calcula horários disponíveis
   */
  private calculateAvailableSlots(
    events: any[],
    date: Date
  ): Array<{ start: string; end: string }> {
    const slots: Array<{ start: string; end: string }> = [];
    
    const dayStart = new Date(date);
    dayStart.setHours(6, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(22, 0, 0, 0);

    if (events.length === 0) {
      return [
        {
          start: '06:00',
          end: '22:00',
        },
      ];
    }

    // Simplificado: retorna slot genérico
    return [
      { start: '06:00', end: '08:00' },
      { start: '18:00', end: '21:00' },
    ];
  }

  /**
   * Calcula tendência de energia
   */
  private async calculateEnergyTrend(
    userId: number,
    date: Date
  ): Promise<'increasing' | 'stable' | 'decreasing'> {
    const last7Days = await prisma.energy_logs.findMany({
      where: {
        user_id: userId,
        date: {
          gte: new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000),
          lt: date,
        },
      },
      orderBy: { date: 'desc' },
      take: 7,
    });

    if (last7Days.length < 3) return 'stable';

    const avgRecent = last7Days.slice(0, 3).reduce((sum, log) => sum + (log.energy_level || 75), 0) / 3;
    const avgOlder = last7Days.slice(3).reduce((sum, log) => sum + (log.energy_level || 75), 0) / (last7Days.length - 3);

    if (avgRecent > avgOlder + 10) return 'increasing';
    if (avgRecent < avgOlder - 10) return 'decreasing';
    return 'stable';
  }

  /**
   * Recomendação baseada em energia
   */
  private getEnergyRecommendation(
    log: any,
    fatigueThreshold: number
  ): { type: 'full' | 'modified' | 'skip' | 'rest'; reason?: string } {
    const level = log.energy_level || 75;

    if (level < 30) {
      return { type: 'skip', reason: 'Energia muito baixa - descanso recomendado' };
    }
    if (level < fatigueThreshold) {
      return { type: 'modified', reason: 'Energia moderada - reduzir volume/intensidade' };
    }
    return { type: 'full' };
  }

  /**
   * Log de decisão contextual
   */
  private async logContextDecision(
    userId: number,
    workoutDate: Date,
    decision: ContextDecision,
    context: WorkoutContext
  ): Promise<void> {
    try {
      await prisma.context_decisions.create({
        data: {
          user_id: userId,
          decision_type: decision.canProceed ? 'approved' : 'deferred',
          original_date: workoutDate,
          suggested_date: decision.alternativeDate || null,
          context_data: context as any,
          was_accepted: null,
        },
      });
    } catch (error) {
      console.error('Error logging context decision:', error);
    }
  }

  /**
   * Decisão padrão (sem contexto)
   */
  private createDefaultDecision(): ContextDecision {
    return {
      canProceed: true,
      shouldDefer: false,
      shouldModify: false,
      confidence: 100,
      reasons: [],
      context: {
        weather: null,
        calendar: null,
        energy: null,
        recovery: null,
      },
    };
  }
}

export const contextEngine = ContextAwarenessEngine.getInstance();
