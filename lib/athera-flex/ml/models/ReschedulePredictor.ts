/**
 * ATHERA FLEX - ML MODEL 1: Reschedule Predictor
 * Prediz probabilidade de reagendamento baseado em padrões históricos
 * Fase 3 - Sessão 2
 */

import { PatternAnalyzer } from '../analytics/PatternAnalyzer';

interface PredictionInput {
  userId: string;
  workoutType: string;
  scheduledDate: Date;
  dayOfWeek: number;
  weather?: {
    conditions: string;
    temperature: number;
  };
  userContext?: {
    recentMisses: number;
    currentStreak: number;
    energyLevel?: number;
  };
}

interface PredictionOutput {
  willReschedule: boolean;
  confidence: number; // 0-1
  suggestedAlternatives: Array<{
    date: Date;
    reason: string;
    confidence: number;
  }>;
  factors: Array<{
    name: string;
    impact: number; // -1 a 1
    description: string;
  }>;
}

export class ReschedulePredictor {
  private patternAnalyzer: PatternAnalyzer;
  
  // Pesos dos fatores (ajustados por aprendizado)
  private weights = {
    dayOfWeek: 0.25,
    workoutType: 0.20,
    recentHistory: 0.30,
    weather: 0.15,
    userPattern: 0.10
  };

  constructor() {
    this.patternAnalyzer = new PatternAnalyzer();
  }

  /**
   * Prediz se usuário vai reagendar treino
   */
  async predict(input: PredictionInput): Promise<PredictionOutput> {
    const [
      dayScore,
      typeScore,
      historyScore,
      weatherScore,
      patternScore
    ] = await Promise.all([
      this.analyzeDayOfWeek(input.userId, input.dayOfWeek),
      this.analyzeWorkoutType(input.userId, input.workoutType),
      this.analyzeRecentHistory(input),
      this.analyzeWeather(input.weather),
      this.analyzeUserPattern(input.userId)
    ]);

    // Calcula score ponderado
    const totalScore = 
      dayScore * this.weights.dayOfWeek +
      typeScore * this.weights.workoutType +
      historyScore * this.weights.recentHistory +
      weatherScore * this.weights.weather +
      patternScore * this.weights.userPattern;

    // Normaliza para 0-1
    const confidence = Math.max(0, Math.min(1, totalScore));
    const willReschedule = confidence > 0.6;

    // Gera alternativas se provável reagendar
    const suggestedAlternatives = willReschedule 
      ? await this.generateAlternatives(input)
      : [];

    // Documenta fatores
    const factors = [
      {
        name: 'Dia da Semana',
        impact: dayScore,
        description: this.explainDayScore(input.dayOfWeek, dayScore)
      },
      {
        name: 'Tipo de Treino',
        impact: typeScore,
        description: this.explainTypeScore(input.workoutType, typeScore)
      },
      {
        name: 'Histórico Recente',
        impact: historyScore,
        description: this.explainHistoryScore(input.userContext)
      },
      {
        name: 'Condições Climáticas',
        impact: weatherScore,
        description: this.explainWeatherScore(input.weather)
      },
      {
        name: 'Padrão do Usuário',
        impact: patternScore,
        description: 'Baseado em comportamento histórico'
      }
    ].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

    return {
      willReschedule,
      confidence,
      suggestedAlternatives,
      factors
    };
  }

  /**
   * Analisa dia da semana (alguns dias têm mais reagendamentos)
   */
  private async analyzeDayOfWeek(userId: string, dayOfWeek: number): Promise<number> {
    const patterns = await this.patternAnalyzer.getUserPatterns(userId);
    
    // Segunda e sexta geralmente têm mais reagendamentos
    const dayRiskMap: Record<number, number> = {
      1: 0.7,  // Segunda
      2: 0.4,  // Terça
      3: 0.3,  // Quarta
      4: 0.4,  // Quinta
      5: 0.6,  // Sexta
      6: 0.2,  // Sábado
      0: 0.5   // Domingo
    };

    const baseRisk = dayRiskMap[dayOfWeek] || 0.5;
    
    // Ajusta baseado em padrões do usuário
    const userDayPattern = patterns.dayPreferences?.[dayOfWeek] || 0;
    
    return (baseRisk + userDayPattern) / 2;
  }

  /**
   * Analisa tipo de treino (longão tem mais reagendamentos)
   */
  private async analyzeWorkoutType(userId: string, workoutType: string): Promise<number> {
    const patterns = await this.patternAnalyzer.getUserPatterns(userId);
    
    // Treinos longos/intensos têm maior probabilidade
    const typeRiskMap: Record<string, number> = {
      'long_run': 0.8,
      'tempo': 0.6,
      'interval': 0.5,
      'easy': 0.2,
      'recovery': 0.1
    };

    const baseRisk = typeRiskMap[workoutType.toLowerCase()] || 0.5;
    const userTypePattern = patterns.workoutTypeSuccess?.[workoutType] || 0;
    
    return (baseRisk + (1 - userTypePattern)) / 2;
  }

  /**
   * Analisa histórico recente (streaks, misses)
   */
  private analyzeRecentHistory(input: PredictionInput): number {
    if (!input.userContext) return 0.5;

    const { recentMisses, currentStreak } = input.userContext;
    
    // Muitos misses recentes = maior probabilidade
    const missImpact = Math.min(recentMisses / 5, 1) * 0.7;
    
    // Streak longo = menor probabilidade (motivação alta)
    const streakImpact = Math.max(0, 1 - (currentStreak / 10)) * 0.3;
    
    return missImpact + streakImpact;
  }

  /**
   * Analisa clima (chuva/calor extremo aumenta reagendamentos)
   */
  private analyzeWeather(weather?: PredictionInput['weather']): number {
    if (!weather) return 0.5;

    let risk = 0.5;

    // Condições ruins
    if (weather.conditions.includes('rain') || weather.conditions.includes('storm')) {
      risk += 0.3;
    }

    // Temperatura extrema
    if (weather.temperature > 30 || weather.temperature < 5) {
      risk += 0.2;
    }

    return Math.min(risk, 1);
  }

  /**
   * Analisa padrão geral do usuário
   */
  private async analyzeUserPattern(userId: string): Promise<number> {
    const patterns = await this.patternAnalyzer.getUserPatterns(userId);
    
    // Taxa geral de reagendamentos
    return patterns.rescheduleRate || 0.5;
  }

  /**
   * Gera datas alternativas inteligentes
   */
  private async generateAlternatives(input: PredictionInput): Promise<PredictionOutput['suggestedAlternatives']> {
    const alternatives: PredictionOutput['suggestedAlternatives'] = [];
    const baseDate = new Date(input.scheduledDate);

    // Próximo dia útil
    const nextDay = new Date(baseDate);
    nextDay.setDate(nextDay.getDate() + 1);
    alternatives.push({
      date: nextDay,
      reason: 'Próximo dia disponível com condições similares',
      confidence: 0.8
    });

    // Mesmo dia da próxima semana
    const nextWeek = new Date(baseDate);
    nextWeek.setDate(nextWeek.getDate() + 7);
    alternatives.push({
      date: nextWeek,
      reason: 'Mesmo dia da semana, mantendo rotina',
      confidence: 0.7
    });

    // Fim de semana (se treino for longo)
    if (input.workoutType.includes('long')) {
      const nextSaturday = new Date(baseDate);
      const daysUntilSaturday = (6 - baseDate.getDay() + 7) % 7 || 7;
      nextSaturday.setDate(nextSaturday.getDate() + daysUntilSaturday);
      
      alternatives.push({
        date: nextSaturday,
        reason: 'Fim de semana - ideal para treinos longos',
        confidence: 0.85
      });
    }

    return alternatives.slice(0, 3);
  }

  // Explicações humanizadas
  private explainDayScore(day: number, score: number): string {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dayName = days[day];
    
    if (score > 0.6) return `${dayName} historicamente tem mais reagendamentos`;
    if (score < 0.4) return `${dayName} é um dia com alta taxa de conclusão`;
    return `${dayName} tem taxa de conclusão moderada`;
  }

  private explainTypeScore(type: string, score: number): string {
    if (score > 0.6) return `Treinos de ${type} são mais frequentemente reagendados`;
    if (score < 0.4) return `Treinos de ${type} têm alta taxa de conclusão`;
    return `Treinos de ${type} têm taxa de conclusão moderada`;
  }

  private explainHistoryScore(context?: PredictionInput['userContext']): string {
    if (!context) return 'Sem histórico recente';
    
    if (context.recentMisses > 3) return 'Vários treinos perdidos recentemente';
    if (context.currentStreak > 7) return 'Ótima sequência de treinos completados';
    return 'Histórico recente estável';
  }

  private explainWeatherScore(weather?: PredictionInput['weather']): string {
    if (!weather) return 'Sem previsão do tempo';
    
    if (weather.conditions.includes('rain')) return 'Previsão de chuva pode impactar';
    if (weather.temperature > 30) return 'Temperatura alta pode dificultar treino';
    if (weather.temperature < 5) return 'Temperatura baixa pode dificultar treino';
    return 'Condições climáticas favoráveis';
  }

  /**
   * Aprende com feedback real (ajusta pesos)
   */
  async learn(input: PredictionInput, actualResult: boolean): Promise<void> {
    // TODO: Implementar ajuste de pesos baseado em acurácia
    // Por enquanto, apenas log para análise futura
    console.log('[ML] Feedback recebido:', {
      predicted: await this.predict(input).then(p => p.willReschedule),
      actual: actualResult,
      userId: input.userId
    });
  }
}
