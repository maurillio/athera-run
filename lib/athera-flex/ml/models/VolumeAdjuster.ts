/**
 * ATHERA FLEX - ML MODEL 2: Volume Adjuster
 * Ajusta volume de treino baseado em fadiga, recuperação e performance
 * Fase 3 - Sessão 2
 */

interface VolumeInput {
  userId: string;
  plannedDistance: number;
  plannedDuration: number;
  workoutType: string;
  recentWorkouts: Array<{
    date: Date;
    distance: number;
    duration: number;
    perceivedExertion: number; // 1-10
    completed: boolean;
  }>;
  userMetrics?: {
    restingHR?: number;
    sleepQuality?: number; // 1-10
    soreness?: number; // 1-10
    energy?: number; // 1-10
  };
}

interface VolumeOutput {
  adjustedDistance: number;
  adjustedDuration: number;
  adjustmentPercent: number; // -50 a +50
  reason: string;
  confidence: number; // 0-1
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  warnings: string[];
}

export class VolumeAdjuster {
  // Limites de segurança
  private readonly MAX_INCREASE = 0.10; // +10% máximo
  private readonly MAX_DECREASE = 0.50; // -50% máximo
  private readonly WEEKLY_VOLUME_INCREASE = 0.10; // Regra 10%

  /**
   * Calcula ajuste de volume inteligente
   */
  async adjust(input: VolumeInput): Promise<VolumeOutput> {
    const factors = {
      fatigue: this.calculateFatigueScore(input),
      recovery: this.calculateRecoveryScore(input),
      consistency: this.calculateConsistencyScore(input),
      progression: this.calculateProgressionScore(input),
      metrics: this.calculateMetricsScore(input.userMetrics)
    };

    // Score final ponderado
    const totalScore = (
      factors.fatigue * 0.30 +
      factors.recovery * 0.25 +
      factors.consistency * 0.20 +
      factors.progression * 0.15 +
      factors.metrics * 0.10
    );

    // Converte score para ajuste percentual
    let adjustmentPercent = this.scoreToAdjustment(totalScore);
    
    // Aplica limites de segurança
    adjustmentPercent = Math.max(-this.MAX_DECREASE * 100, adjustmentPercent);
    adjustmentPercent = Math.min(this.MAX_INCREASE * 100, adjustmentPercent);

    // Calcula valores ajustados
    const multiplier = 1 + (adjustmentPercent / 100);
    const adjustedDistance = Math.round(input.plannedDistance * multiplier * 100) / 100;
    const adjustedDuration = Math.round(input.plannedDuration * multiplier);

    // Determina nível de risco
    const riskLevel = this.assessRisk(factors, adjustmentPercent);

    // Gera recomendações e avisos
    const recommendations = this.generateRecommendations(factors, adjustmentPercent);
    const warnings = this.generateWarnings(factors, riskLevel);

    // Gera razão humanizada
    const reason = this.explainAdjustment(factors, adjustmentPercent);

    // Calcula confiança (baseado em quantidade de dados)
    const confidence = this.calculateConfidence(input);

    return {
      adjustedDistance,
      adjustedDuration,
      adjustmentPercent: Math.round(adjustmentPercent),
      reason,
      confidence,
      riskLevel,
      recommendations,
      warnings
    };
  }

  /**
   * Calcula score de fadiga (0-1, maior = mais fatigado)
   */
  private calculateFatigueScore(input: VolumeInput): number {
    const recentWorkouts = input.recentWorkouts.slice(0, 7); // Últimos 7 dias
    
    if (recentWorkouts.length === 0) return 0.5;

    // Volume total recente
    const totalVolume = recentWorkouts.reduce((sum, w) => sum + w.distance, 0);
    const avgVolume = totalVolume / recentWorkouts.length;

    // Esforço percebido médio
    const avgExertion = recentWorkouts.reduce((sum, w) => sum + (w.perceivedExertion || 5), 0) / recentWorkouts.length;

    // Workouts consecutivos sem descanso
    let consecutiveWorkouts = 0;
    for (let i = 0; i < recentWorkouts.length; i++) {
      if (recentWorkouts[i].completed) consecutiveWorkouts++;
      else break;
    }

    // Score composto
    const volumeScore = Math.min(avgVolume / 50, 1) * 0.4; // 50km = muito volume
    const exertionScore = (avgExertion / 10) * 0.4;
    const consecutiveScore = Math.min(consecutiveWorkouts / 5, 1) * 0.2; // 5+ dias = alto

    return volumeScore + exertionScore + consecutiveScore;
  }

  /**
   * Calcula score de recuperação (0-1, maior = melhor recuperação)
   */
  private calculateRecoveryScore(input: VolumeInput): number {
    const lastWorkout = input.recentWorkouts[0];
    
    if (!lastWorkout) return 0.7; // Sem treino recente = bem recuperado

    const daysSinceLastWorkout = Math.floor(
      (Date.now() - lastWorkout.date.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Tipo de treino anterior afeta recuperação
    const intensityMap: Record<string, number> = {
      'long_run': 3, // Precisa 3+ dias
      'tempo': 2,
      'interval': 2,
      'easy': 1,
      'recovery': 0.5
    };

    const requiredDays = intensityMap[input.workoutType.toLowerCase()] || 2;
    const recoveryRatio = daysSinceLastWorkout / requiredDays;

    return Math.min(recoveryRatio, 1);
  }

  /**
   * Calcula score de consistência (0-1, maior = mais consistente)
   */
  private calculateConsistencyScore(input: VolumeInput): number {
    const last30Days = input.recentWorkouts.slice(0, 30);
    
    if (last30Days.length < 4) return 0.3; // Poucos dados

    const completionRate = last30Days.filter(w => w.completed).length / last30Days.length;
    
    // Distribuição ao longo do tempo (evita clustering)
    const distribution = this.calculateDistribution(last30Days);

    return (completionRate * 0.7) + (distribution * 0.3);
  }

  /**
   * Calcula se progressão está adequada (0-1, 0.5 = ideal)
   */
  private calculateProgressionScore(input: VolumeInput): number {
    const lastWeek = input.recentWorkouts.slice(0, 7);
    const previousWeek = input.recentWorkouts.slice(7, 14);

    if (previousWeek.length < 3) return 0.5; // Sem dados suficientes

    const lastWeekVolume = lastWeek.reduce((sum, w) => sum + (w.completed ? w.distance : 0), 0);
    const prevWeekVolume = previousWeek.reduce((sum, w) => sum + (w.completed ? w.distance : 0), 0);

    if (prevWeekVolume === 0) return 0.5;

    const increase = (lastWeekVolume - prevWeekVolume) / prevWeekVolume;

    // Ideal: aumento entre 5-10%
    if (increase >= 0.05 && increase <= 0.10) return 1.0;
    if (increase > 0.10) return 0.3; // Aumentou muito = fadiga
    if (increase < -0.10) return 0.6; // Diminuiu = precisa rebuild
    
    return 0.7;
  }

  /**
   * Calcula score de métricas biométricas (0-1, maior = melhores métricas)
   */
  private calculateMetricsScore(metrics?: VolumeInput['userMetrics']): number {
    if (!metrics) return 0.5; // Sem dados

    let score = 0.5;
    let count = 0;

    if (metrics.sleepQuality) {
      score += (metrics.sleepQuality / 10) * 0.4;
      count++;
    }

    if (metrics.soreness) {
      score += (1 - (metrics.soreness / 10)) * 0.3; // Inverso
      count++;
    }

    if (metrics.energy) {
      score += (metrics.energy / 10) * 0.3;
      count++;
    }

    return count > 0 ? score : 0.5;
  }

  /**
   * Converte score (0-1) em ajuste percentual (-50 a +10)
   */
  private scoreToAdjustment(score: number): number {
    // Score < 0.4 = muito fatigado = reduzir volume
    // Score 0.4-0.6 = normal = manter
    // Score > 0.6 = bem recuperado = pode aumentar

    if (score < 0.3) return -30; // Muito fatigado
    if (score < 0.4) return -15; // Fatigado
    if (score >= 0.4 && score <= 0.6) return 0; // Normal
    if (score > 0.7) return +5; // Muito bem
    
    return 0;
  }

  /**
   * Avalia nível de risco do ajuste
   */
  private assessRisk(factors: any, adjustment: number): 'low' | 'medium' | 'high' {
    // Alto risco se fadiga alta E aumentando volume
    if (factors.fatigue > 0.7 && adjustment > 0) return 'high';
    
    // Alto risco se reduzindo muito volume
    if (adjustment < -30) return 'high';
    
    // Médio risco se fadiga moderada
    if (factors.fatigue > 0.5) return 'medium';
    
    return 'low';
  }

  /**
   * Gera recomendações personalizadas
   */
  private generateRecommendations(factors: any, adjustment: number): string[] {
    const recs: string[] = [];

    if (factors.fatigue > 0.6) {
      recs.push('Priorize recuperação - considere treino mais leve');
    }

    if (factors.recovery < 0.5) {
      recs.push('Adicione mais dias de descanso entre treinos intensos');
    }

    if (factors.consistency < 0.5) {
      recs.push('Foque em consistência antes de aumentar volume');
    }

    if (adjustment < -20) {
      recs.push('Volume reduzido para prevenir overtraining');
    }

    if (factors.metrics < 0.4) {
      recs.push('Suas métricas indicam necessidade de mais recuperação');
    }

    return recs;
  }

  /**
   * Gera avisos de segurança
   */
  private generateWarnings(factors: any, riskLevel: string): string[] {
    const warnings: string[] = [];

    if (riskLevel === 'high') {
      warnings.push('⚠️ Risco elevado de overtraining detectado');
    }

    if (factors.fatigue > 0.7) {
      warnings.push('⚠️ Sinais de fadiga acumulada - considere semana de recuperação');
    }

    if (factors.progression < 0.3) {
      warnings.push('⚠️ Progressão muito rápida - risco de lesão aumentado');
    }

    return warnings;
  }

  /**
   * Explica o ajuste de forma humanizada
   */
  private explainAdjustment(factors: any, adjustment: number): string {
    if (adjustment === 0) {
      return 'Volume mantido conforme planejado - você está no ritmo ideal';
    }

    if (adjustment < 0) {
      const reasons = [];
      if (factors.fatigue > 0.6) reasons.push('fadiga acumulada');
      if (factors.recovery < 0.5) reasons.push('recuperação insuficiente');
      if (factors.metrics < 0.4) reasons.push('métricas indicando estresse');
      
      return `Volume reduzido em ${Math.abs(adjustment)}% devido a ${reasons.join(', ')}`;
    }

    return `Volume aumentado em ${adjustment}% - você está bem recuperado e progredindo bem`;
  }

  /**
   * Calcula confiança na recomendação
   */
  private calculateConfidence(input: VolumeInput): number {
    const dataPoints = input.recentWorkouts.length;
    const hasMetrics = !!input.userMetrics;

    let confidence = 0.5;

    // Mais dados = mais confiança
    if (dataPoints >= 14) confidence += 0.3;
    else if (dataPoints >= 7) confidence += 0.2;
    else if (dataPoints >= 3) confidence += 0.1;

    // Métricas aumentam confiança
    if (hasMetrics) confidence += 0.2;

    return Math.min(confidence, 1);
  }

  /**
   * Calcula distribuição de treinos ao longo do tempo
   */
  private calculateDistribution(workouts: VolumeInput['recentWorkouts']): number {
    if (workouts.length < 3) return 0.5;

    const intervals: number[] = [];
    for (let i = 1; i < workouts.length; i++) {
      const days = Math.floor(
        (workouts[i - 1].date.getTime() - workouts[i].date.getTime()) / (1000 * 60 * 60 * 24)
      );
      intervals.push(days);
    }

    // Calcula desvio padrão (distribuição uniforme = baixo desvio)
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    // Normaliza (desvio baixo = bom)
    return Math.max(0, 1 - (stdDev / 7));
  }
}
