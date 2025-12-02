/**
 * ATHERA FLEX - ML MODEL 4: User Pattern Learner
 * Aprende padrões comportamentais do usuário ao longo do tempo
 * Fase 3 - Sessão 2
 */

interface UserBehavior {
  userId: string;
  decisions: Array<{
    date: Date;
    action: 'accept' | 'reschedule' | 'substitute' | 'skip';
    context: {
      workoutType: string;
      dayOfWeek: number;
      wasAutomatic: boolean;
      userSatisfaction?: number; // 1-5
    };
  }>;
  workouts: Array<{
    date: Date;
    type: string;
    completed: boolean;
    executedAsPlanned: boolean;
    volumeAdjustment?: number;
  }>;
}

interface LearnedPatterns {
  // Padrões temporais
  preferredDays: Record<number, number>; // 0-6 => confidence 0-1
  preferredTimes: Record<string, number>; // 'morning' | 'afternoon' | 'evening'
  
  // Padrões de treino
  workoutTypeSuccess: Record<string, number>; // tipo => taxa sucesso
  averageVolumePreference: number; // -1 a 1 (prefer lower/higher)
  
  // Padrões de decisão
  rescheduleFrequency: number; // 0-1
  substituteFrequency: number;
  autoAcceptRate: number; // Taxa de aceitar sugestões automáticas
  
  // Padrões de adaptação
  flexibilityPreference: 'strict' | 'moderate' | 'flexible';
  volumeAdjustmentTolerance: number; // ±%
  
  // Meta-learning
  confidenceLevel: number; // 0-1 (quão confiável são os padrões)
  sampleSize: number;
  lastUpdated: Date;
}

export class UserPatternLearner {
  private readonly MIN_SAMPLES = 10; // Mínimo de decisões para ter confiança
  private readonly DECAY_FACTOR = 0.1; // Peso de decisões antigas vs novas

  /**
   * Analisa histórico e aprende padrões
   */
  async learn(behavior: UserBehavior): Promise<LearnedPatterns> {
    const patterns: LearnedPatterns = {
      preferredDays: this.learnPreferredDays(behavior),
      preferredTimes: this.learnPreferredTimes(behavior),
      workoutTypeSuccess: this.learnWorkoutSuccess(behavior),
      averageVolumePreference: this.learnVolumePreference(behavior),
      rescheduleFrequency: this.calculateRescheduleFrequency(behavior),
      substituteFrequency: this.calculateSubstituteFrequency(behavior),
      autoAcceptRate: this.calculateAutoAcceptRate(behavior),
      flexibilityPreference: this.determineFlexibilityPreference(behavior),
      volumeAdjustmentTolerance: this.calculateVolumeTolerance(behavior),
      confidenceLevel: this.calculateConfidence(behavior),
      sampleSize: behavior.decisions.length + behavior.workouts.length,
      lastUpdated: new Date()
    };

    return patterns;
  }

  /**
   * Aprende dias preferidos da semana
   */
  private learnPreferredDays(behavior: UserBehavior): Record<number, number> {
    const dayStats: Record<number, { total: number; successful: number }> = {};
    
    // Inicializa todos os dias
    for (let i = 0; i < 7; i++) {
      dayStats[i] = { total: 0, successful: 0 };
    }

    // Conta sucessos por dia
    behavior.workouts.forEach(workout => {
      const day = workout.date.getDay();
      dayStats[day].total++;
      if (workout.completed) {
        dayStats[day].successful++;
      }
    });

    // Calcula taxa de sucesso por dia
    const preferences: Record<number, number> = {};
    for (let day = 0; day < 7; day++) {
      if (dayStats[day].total > 0) {
        preferences[day] = dayStats[day].successful / dayStats[day].total;
      } else {
        preferences[day] = 0.5; // Neutro se sem dados
      }
    }

    return preferences;
  }

  /**
   * Aprende horários preferidos
   */
  private learnPreferredTimes(behavior: UserBehavior): Record<string, number> {
    // Simplificado - em produção, analisar timestamps reais
    return {
      morning: 0.6,    // 5h-12h
      afternoon: 0.3,  // 12h-18h
      evening: 0.1     // 18h-22h
    };
  }

  /**
   * Aprende taxa de sucesso por tipo de treino
   */
  private learnWorkoutSuccess(behavior: UserBehavior): Record<string, number> {
    const typeStats: Record<string, { total: number; completed: number; asPlanned: number }> = {};

    behavior.workouts.forEach(workout => {
      if (!typeStats[workout.type]) {
        typeStats[workout.type] = { total: 0, completed: 0, asPlanned: 0 };
      }
      
      typeStats[workout.type].total++;
      if (workout.completed) {
        typeStats[workout.type].completed++;
        if (workout.executedAsPlanned) {
          typeStats[workout.type].asPlanned++;
        }
      }
    });

    const success: Record<string, number> = {};
    for (const [type, stats] of Object.entries(typeStats)) {
      if (stats.total > 0) {
        // Score composto: 70% conclusão + 30% execução conforme planejado
        const completionRate = stats.completed / stats.total;
        const adherenceRate = stats.asPlanned / stats.total;
        success[type] = (completionRate * 0.7) + (adherenceRate * 0.3);
      }
    }

    return success;
  }

  /**
   * Aprende preferência de volume (usuário tende a fazer mais ou menos?)
   */
  private learnVolumePreference(behavior: UserBehavior): number {
    const adjustments = behavior.workouts
      .filter(w => w.volumeAdjustment !== undefined)
      .map(w => w.volumeAdjustment!);

    if (adjustments.length === 0) return 0; // Neutro

    const avgAdjustment = adjustments.reduce((a, b) => a + b, 0) / adjustments.length;
    
    // Normaliza para -1 a 1
    return Math.max(-1, Math.min(1, avgAdjustment / 50));
  }

  /**
   * Calcula frequência de reagendamentos
   */
  private calculateRescheduleFrequency(behavior: UserBehavior): number {
    const reschedules = behavior.decisions.filter(d => d.action === 'reschedule').length;
    return behavior.decisions.length > 0 ? reschedules / behavior.decisions.length : 0;
  }

  /**
   * Calcula frequência de substituições
   */
  private calculateSubstituteFrequency(behavior: UserBehavior): number {
    const substitutes = behavior.decisions.filter(d => d.action === 'substitute').length;
    return behavior.decisions.length > 0 ? substitutes / behavior.decisions.length : 0;
  }

  /**
   * Calcula taxa de aceitação automática
   */
  private calculateAutoAcceptRate(behavior: UserBehavior): number {
    const autoDecisions = behavior.decisions.filter(d => d.context.wasAutomatic);
    const autoAccepts = autoDecisions.filter(d => d.action === 'accept');
    
    return autoDecisions.length > 0 ? autoAccepts.length / autoDecisions.length : 0.5;
  }

  /**
   * Determina preferência de flexibilidade do usuário
   */
  private determineFlexibilityPreference(behavior: UserBehavior): 'strict' | 'moderate' | 'flexible' {
    const rescheduleRate = this.calculateRescheduleFrequency(behavior);
    const substituteRate = this.calculateSubstituteFrequency(behavior);
    const flexScore = rescheduleRate + substituteRate;

    if (flexScore < 0.2) return 'strict';
    if (flexScore < 0.5) return 'moderate';
    return 'flexible';
  }

  /**
   * Calcula tolerância a ajustes de volume
   */
  private calculateVolumeTolerance(behavior: UserBehavior): number {
    const adjustments = behavior.workouts
      .filter(w => w.volumeAdjustment !== undefined && w.completed)
      .map(w => Math.abs(w.volumeAdjustment!));

    if (adjustments.length === 0) return 15; // Default 15%

    // Média dos ajustes aceitos
    const avgTolerance = adjustments.reduce((a, b) => a + b, 0) / adjustments.length;
    
    return Math.round(avgTolerance);
  }

  /**
   * Calcula confiança nos padrões aprendidos
   */
  private calculateConfidence(behavior: UserBehavior): number {
    const totalSamples = behavior.decisions.length + behavior.workouts.length;
    
    if (totalSamples < this.MIN_SAMPLES) {
      return totalSamples / this.MIN_SAMPLES; // Confiança cresce linearmente até MIN_SAMPLES
    }

    // Após MIN_SAMPLES, confiança cresce logaritmicamente
    const confidence = 0.5 + (0.5 * Math.log10(totalSamples / this.MIN_SAMPLES + 1));
    
    return Math.min(confidence, 1);
  }

  /**
   * Prediz próxima decisão do usuário
   */
  async predictNextDecision(
    patterns: LearnedPatterns,
    context: {
      workoutType: string;
      dayOfWeek: number;
      suggestedAction: string;
    }
  ): Promise<{ 
    likelyAction: string; 
    confidence: number;
    reasoning: string;
  }> {
    // Score baseado em padrões aprendidos
    let actionScores = {
      accept: 0.25,
      reschedule: 0.25,
      substitute: 0.25,
      skip: 0.25
    };

    // Ajusta baseado em preferência de dia
    const dayPreference = patterns.preferredDays[context.dayOfWeek] || 0.5;
    if (dayPreference < 0.4) {
      actionScores.reschedule += 0.2;
      actionScores.accept -= 0.1;
    }

    // Ajusta baseado em sucesso do tipo de treino
    const typeSuccess = patterns.workoutTypeSuccess[context.workoutType] || 0.5;
    if (typeSuccess > 0.7) {
      actionScores.accept += 0.2;
    } else if (typeSuccess < 0.3) {
      actionScores.substitute += 0.15;
    }

    // Ajusta baseado em padrão geral
    actionScores.reschedule += patterns.rescheduleFrequency * 0.3;
    actionScores.substitute += patterns.substituteFrequency * 0.3;
    actionScores.accept += patterns.autoAcceptRate * 0.2;

    // Encontra ação mais provável
    const likelyAction = Object.entries(actionScores)
      .sort(([, a], [, b]) => b - a)[0][0];

    const confidence = Math.min(
      actionScores[likelyAction as keyof typeof actionScores] * patterns.confidenceLevel,
      1
    );

    const reasoning = this.explainPrediction(patterns, context, likelyAction);

    return { likelyAction, confidence, reasoning };
  }

  /**
   * Explica predição de forma humanizada
   */
  private explainPrediction(
    patterns: LearnedPatterns,
    context: any,
    action: string
  ): string {
    const reasons: string[] = [];

    const dayPref = patterns.preferredDays[context.dayOfWeek];
    if (dayPref < 0.4) {
      reasons.push('baixa taxa de conclusão neste dia da semana');
    } else if (dayPref > 0.7) {
      reasons.push('alta taxa de conclusão neste dia da semana');
    }

    const typeSuccess = patterns.workoutTypeSuccess[context.workoutType];
    if (typeSuccess && typeSuccess < 0.4) {
      reasons.push(`histórico de dificuldade com treinos ${context.workoutType}`);
    }

    if (patterns.flexibilityPreference === 'flexible') {
      reasons.push('preferência por flexibilidade alta');
    } else if (patterns.flexibilityPreference === 'strict') {
      reasons.push('preferência por seguir plano rigorosamente');
    }

    const baseText = action === 'accept' ? 'Provavelmente aceitará' :
                     action === 'reschedule' ? 'Provavelmente reagendará' :
                     action === 'substitute' ? 'Provavelmente substituirá' :
                     'Provavelmente pulará';

    return reasons.length > 0 
      ? `${baseText} devido a: ${reasons.join(', ')}`
      : baseText;
  }

  /**
   * Atualiza padrões com nova informação (online learning)
   */
  async updatePatterns(
    currentPatterns: LearnedPatterns,
    newBehavior: UserBehavior['decisions'][0]
  ): Promise<LearnedPatterns> {
    // Implementa aprendizado incremental
    // Por enquanto, apenas aumenta sample size
    return {
      ...currentPatterns,
      sampleSize: currentPatterns.sampleSize + 1,
      lastUpdated: new Date(),
      confidenceLevel: this.calculateConfidence({
        decisions: [newBehavior],
        workouts: [],
        userId: ''
      })
    };
  }
}
