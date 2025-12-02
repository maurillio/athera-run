/**
 * ATHERA FLEX - ML MODEL 3: Workout Matcher
 * Identifica se treino executado corresponde ao planejado
 * Fase 3 - Sessão 2
 */

interface MatchInput {
  planned: {
    workoutType: string;
    distance: number;
    duration: number;
    pace?: number;
    intensity?: string;
    description?: string;
  };
  executed: {
    distance: number;
    duration: number;
    pace: number;
    heartRate?: number;
    elevation?: number;
    perceivedExertion?: number;
  };
  context?: {
    scheduledDate: Date;
    executedDate: Date;
    weather?: string;
  };
}

interface MatchOutput {
  isMatch: boolean;
  confidence: number; // 0-1
  matchScore: number; // 0-100
  differences: Array<{
    metric: string;
    planned: number;
    executed: number;
    difference: number; // %
    acceptable: boolean;
  }>;
  reasoning: string;
  suggestion: 'accept' | 'review' | 'reject';
  alternativeInterpretations?: Array<{
    workoutType: string;
    confidence: number;
    reason: string;
  }>;
}

export class WorkoutMatcher {
  // Tolerâncias aceitáveis
  private readonly TOLERANCES = {
    distance: {
      easy: 0.15,      // ±15% para easy runs
      tempo: 0.10,     // ±10% para tempos
      interval: 0.05,  // ±5% para intervals
      long_run: 0.20   // ±20% para longão
    },
    duration: {
      easy: 0.20,
      tempo: 0.15,
      interval: 0.10,
      long_run: 0.25
    },
    pace: {
      easy: 0.15,
      tempo: 0.05,
      interval: 0.03,
      long_run: 0.20
    }
  };

  /**
   * Verifica se treino executado corresponde ao planejado
   */
  async match(input: MatchInput): Promise<MatchOutput> {
    // Calcula diferenças em cada métrica
    const differences = this.calculateDifferences(input);

    // Calcula score de match (0-100)
    const matchScore = this.calculateMatchScore(differences, input.planned.workoutType);

    // Determina se é match aceitável
    const isMatch = matchScore >= 70;
    const confidence = this.calculateConfidence(input);

    // Gera reasoning
    const reasoning = this.generateReasoning(differences, matchScore);

    // Sugere ação
    const suggestion = this.suggestAction(matchScore, differences);

    // Busca interpretações alternativas se não for match
    const alternativeInterpretations = !isMatch 
      ? this.findAlternatives(input)
      : undefined;

    return {
      isMatch,
      confidence,
      matchScore,
      differences,
      reasoning,
      suggestion,
      alternativeInterpretations
    };
  }

  /**
   * Calcula diferenças entre planejado e executado
   */
  private calculateDifferences(input: MatchInput): MatchOutput['differences'] {
    const { planned, executed } = input;
    const workoutType = planned.workoutType.toLowerCase();
    const differences: MatchOutput['differences'] = [];

    // Distância
    const distanceDiff = ((executed.distance - planned.distance) / planned.distance) * 100;
    const distanceTolerance = this.TOLERANCES.distance[workoutType as keyof typeof this.TOLERANCES.distance] || 0.15;
    differences.push({
      metric: 'Distância',
      planned: planned.distance,
      executed: executed.distance,
      difference: Math.round(distanceDiff),
      acceptable: Math.abs(distanceDiff / 100) <= distanceTolerance
    });

    // Duração
    const durationDiff = ((executed.duration - planned.duration) / planned.duration) * 100;
    const durationTolerance = this.TOLERANCES.duration[workoutType as keyof typeof this.TOLERANCES.duration] || 0.20;
    differences.push({
      metric: 'Duração',
      planned: planned.duration,
      executed: executed.duration,
      difference: Math.round(durationDiff),
      acceptable: Math.abs(durationDiff / 100) <= durationTolerance
    });

    // Pace (se disponível)
    if (planned.pace) {
      const paceDiff = ((executed.pace - planned.pace) / planned.pace) * 100;
      const paceTolerance = this.TOLERANCES.pace[workoutType as keyof typeof this.TOLERANCES.pace] || 0.15;
      differences.push({
        metric: 'Ritmo',
        planned: planned.pace,
        executed: executed.pace,
        difference: Math.round(paceDiff),
        acceptable: Math.abs(paceDiff / 100) <= paceTolerance
      });
    }

    return differences;
  }

  /**
   * Calcula score de match (0-100)
   */
  private calculateMatchScore(
    differences: MatchOutput['differences'],
    workoutType: string
  ): number {
    let totalScore = 0;
    const weights = {
      'Distância': 0.40,
      'Duração': 0.30,
      'Ritmo': 0.30
    };

    for (const diff of differences) {
      const weight = weights[diff.metric as keyof typeof weights] || 0.33;
      
      // Score individual (100 se dentro da tolerância, decai linearmente)
      let metricScore = 100;
      if (!diff.acceptable) {
        const excessPercent = Math.abs(diff.difference);
        metricScore = Math.max(0, 100 - excessPercent);
      }

      totalScore += metricScore * weight;
    }

    return Math.round(totalScore);
  }

  /**
   * Calcula confiança na análise
   */
  private calculateConfidence(input: MatchInput): number {
    let confidence = 0.7;

    // Mais dados = mais confiança
    if (input.planned.pace && input.executed.pace) confidence += 0.1;
    if (input.executed.heartRate) confidence += 0.1;
    if (input.executed.perceivedExertion) confidence += 0.1;

    return Math.min(confidence, 1);
  }

  /**
   * Gera explicação humanizada
   */
  private generateReasoning(
    differences: MatchOutput['differences'],
    matchScore: number
  ): string {
    if (matchScore >= 90) {
      return 'Treino executado está muito próximo do planejado - excelente aderência ao plano!';
    }

    if (matchScore >= 70) {
      const minorDiffs = differences.filter(d => !d.acceptable && Math.abs(d.difference) < 20);
      if (minorDiffs.length > 0) {
        return `Pequenas diferenças em ${minorDiffs.map(d => d.metric).join(', ')}, mas ainda dentro do aceitável.`;
      }
      return 'Treino corresponde ao planejado com algumas variações aceitáveis.';
    }

    const majorDiffs = differences.filter(d => !d.acceptable);
    if (majorDiffs.length > 0) {
      const diffs = majorDiffs.map(d => 
        `${d.metric}: ${d.difference > 0 ? '+' : ''}${d.difference}%`
      ).join(', ');
      return `Diferenças significativas detectadas: ${diffs}. Pode ser outro tipo de treino.`;
    }

    return 'Treino executado difere consideravelmente do planejado.';
  }

  /**
   * Sugere ação para o usuário
   */
  private suggestAction(
    matchScore: number,
    differences: MatchOutput['differences']
  ): MatchOutput['suggestion'] {
    if (matchScore >= 85) return 'accept';
    if (matchScore >= 60) return 'review';
    return 'reject';
  }

  /**
   * Busca interpretações alternativas do treino
   */
  private findAlternatives(input: MatchInput): MatchOutput['alternativeInterpretations'] {
    const alternatives: MatchOutput['alternativeInterpretations'] = [];
    const { executed } = input;

    // Analisa características do treino executado
    const avgPace = executed.pace;
    const distance = executed.distance;
    const perceivedExertion = executed.perceivedExertion || 5;

    // Long Run: distância longa, pace moderado
    if (distance >= 15 && avgPace > 5.5) {
      alternatives.push({
        workoutType: 'Long Run',
        confidence: 0.8,
        reason: 'Distância longa com ritmo confortável'
      });
    }

    // Tempo Run: pace mais rápido, distância média
    if (distance >= 8 && distance <= 15 && avgPace < 5.0 && perceivedExertion >= 7) {
      alternatives.push({
        workoutType: 'Tempo Run',
        confidence: 0.75,
        reason: 'Ritmo forte mantido por boa distância'
      });
    }

    // Easy Run: pace lento, qualquer distância
    if (avgPace > 6.0 && perceivedExertion <= 5) {
      alternatives.push({
        workoutType: 'Easy Run',
        confidence: 0.7,
        reason: 'Ritmo confortável e esforço baixo'
      });
    }

    // Interval: pace muito rápido, distância curta/média
    if (avgPace < 4.5 && distance <= 12 && perceivedExertion >= 8) {
      alternatives.push({
        workoutType: 'Interval Training',
        confidence: 0.65,
        reason: 'Ritmo muito forte indicando treino intervalado'
      });
    }

    // Recovery: distância curta, pace muito lento
    if (distance <= 8 && avgPace > 6.5) {
      alternatives.push({
        workoutType: 'Recovery Run',
        confidence: 0.6,
        reason: 'Curta distância em ritmo regenerativo'
      });
    }

    return alternatives.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }

  /**
   * Valida se treino pode substituir o planejado
   */
  async canSubstitute(
    plannedType: string,
    executedType: string,
    matchScore: number
  ): Promise<{ canSubstitute: boolean; reason: string }> {
    // Matriz de substituições aceitáveis
    const substitutionMatrix: Record<string, string[]> = {
      'easy': ['recovery', 'easy'],
      'tempo': ['tempo', 'long_run'], // Long run pode compensar tempo perdido
      'interval': ['interval', 'tempo'], // Tempo pode substituir interval se pace forte
      'long_run': ['long_run', 'tempo'], // Tempo longo pode substituir longão
      'recovery': ['recovery', 'easy']
    };

    const planned = plannedType.toLowerCase();
    const executed = executedType.toLowerCase();

    const acceptableSubstitutes = substitutionMatrix[planned] || [];
    const canSubstitute = acceptableSubstitutes.includes(executed) && matchScore >= 60;

    let reason = '';
    if (canSubstitute) {
      reason = `${executedType} é um substituto aceitável para ${plannedType} com ${matchScore}% de correspondência`;
    } else {
      reason = `${executedType} não substitui adequadamente ${plannedType}`;
    }

    return { canSubstitute, reason };
  }
}
