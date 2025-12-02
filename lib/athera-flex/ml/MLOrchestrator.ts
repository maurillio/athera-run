/**
 * ATHERA FLEX - ML ORCHESTRATOR
 * Coordena todos os modelos ML e decide ações inteligentes
 * Fase 3 - Sessão 2
 */

import { ReschedulePredictor } from './models/ReschedulePredictor';
import { VolumeAdjuster } from './models/VolumeAdjuster';
import { WorkoutMatcher } from './models/WorkoutMatcher';
import { UserPatternLearner } from './models/UserPatternLearner';
import { db } from '@/lib/db';

interface OrchestratorInput {
  userId: string;
  scenario: 'check_match' | 'predict_reschedule' | 'adjust_volume' | 'learn_pattern';
  data: any;
}

interface OrchestratorOutput {
  action: 'accept' | 'suggest' | 'warn' | 'reject';
  confidence: number;
  suggestion: {
    title: string;
    description: string;
    alternatives?: any[];
  };
  reasoning: string[];
  mlMetadata: {
    modelsUsed: string[];
    scores: Record<string, number>;
    confidence: number;
  };
}

export class MLOrchestrator {
  private reschedulePredictor: ReschedulePredictor;
  private volumeAdjuster: VolumeAdjuster;
  private workoutMatcher: WorkoutMatcher;
  private patternLearner: UserPatternLearner;

  constructor() {
    this.reschedulePredictor = new ReschedulePredictor();
    this.volumeAdjuster = new VolumeAdjuster();
    this.workoutMatcher = new WorkoutMatcher();
    this.patternLearner = new UserPatternLearner();
  }

  /**
   * Ponto de entrada principal - decide qual fluxo seguir
   */
  async decide(input: OrchestratorInput): Promise<OrchestratorOutput> {
    switch (input.scenario) {
      case 'check_match':
        return await this.handleMatchCheck(input);
      
      case 'predict_reschedule':
        return await this.handleReschedulePrediction(input);
      
      case 'adjust_volume':
        return await this.handleVolumeAdjustment(input);
      
      case 'learn_pattern':
        return await this.handlePatternLearning(input);
      
      default:
        throw new Error(`Scenario desconhecido: ${input.scenario}`);
    }
  }

  /**
   * CENÁRIO 1: Verifica se treino executado corresponde ao planejado
   */
  private async handleMatchCheck(input: OrchestratorInput): Promise<OrchestratorOutput> {
    const { planned, executed } = input.data;

    // 1. Verifica match
    const matchResult = await this.workoutMatcher.match({
      planned,
      executed,
      context: input.data.context
    });

    // 2. Se não for match perfeito, consulta padrões do usuário
    let userPatterns = null;
    if (matchResult.matchScore < 90) {
      userPatterns = await this.getUserPatterns(input.userId);
    }

    // 3. Decide ação baseado em match score + padrões
    let action: OrchestratorOutput['action'] = 'accept';
    let suggestion: OrchestratorOutput['suggestion'];

    if (matchResult.matchScore >= 85) {
      action = 'accept';
      suggestion = {
        title: '✅ Treino Reconhecido Automaticamente',
        description: matchResult.reasoning,
      };
    } else if (matchResult.matchScore >= 60) {
      action = 'suggest';
      suggestion = {
        title: '🤔 Revisar Treino',
        description: matchResult.reasoning,
        alternatives: matchResult.alternativeInterpretations
      };
    } else {
      action = 'warn';
      suggestion = {
        title: '⚠️ Treino Muito Diferente',
        description: matchResult.reasoning,
        alternatives: matchResult.alternativeInterpretations
      };
    }

    return {
      action,
      confidence: matchResult.confidence,
      suggestion,
      reasoning: [
        matchResult.reasoning,
        ...(userPatterns ? [`Baseado no seu histórico: ${userPatterns.flexibilityPreference}`] : [])
      ],
      mlMetadata: {
        modelsUsed: ['WorkoutMatcher', ...(userPatterns ? ['UserPatternLearner'] : [])],
        scores: {
          matchScore: matchResult.matchScore,
          confidence: matchResult.confidence
        },
        confidence: matchResult.confidence
      }
    };
  }

  /**
   * CENÁRIO 2: Prediz se usuário vai reagendar e sugere alternativas
   */
  private async handleReschedulePrediction(input: OrchestratorInput): Promise<OrchestratorOutput> {
    const { workoutType, scheduledDate, context } = input.data;

    // 1. Prediz probabilidade de reagendamento
    const prediction = await this.reschedulePredictor.predict({
      userId: input.userId,
      workoutType,
      scheduledDate: new Date(scheduledDate),
      dayOfWeek: new Date(scheduledDate).getDay(),
      weather: context?.weather,
      userContext: context?.userContext
    });

    // 2. Se alta probabilidade, ajusta volume também
    let volumeAdjustment = null;
    if (prediction.willReschedule && prediction.confidence > 0.7) {
      volumeAdjustment = await this.volumeAdjuster.adjust({
        userId: input.userId,
        plannedDistance: input.data.plannedDistance,
        plannedDuration: input.data.plannedDuration,
        workoutType,
        recentWorkouts: await this.getRecentWorkouts(input.userId)
      });
    }

    // 3. Decide ação
    let action: OrchestratorOutput['action'];
    let suggestion: OrchestratorOutput['suggestion'];

    if (prediction.willReschedule && prediction.confidence > 0.7) {
      action = 'suggest';
      suggestion = {
        title: '🔄 Sugestão: Considere Reagendar',
        description: `Detectamos ${Math.round(prediction.confidence * 100)}% de probabilidade de não conseguir fazer este treino na data planejada.`,
        alternatives: prediction.suggestedAlternatives.map(alt => ({
          date: alt.date,
          reason: alt.reason,
          confidence: alt.confidence,
          ...(volumeAdjustment && {
            adjustedDistance: volumeAdjustment.adjustedDistance,
            adjustedDuration: volumeAdjustment.adjustedDuration
          })
        }))
      };
    } else if (prediction.willReschedule && prediction.confidence > 0.5) {
      action = 'warn';
      suggestion = {
        title: '⚠️ Atenção ao Treino Planejado',
        description: 'Há fatores que podem dificultar este treino. Fique atento!',
        alternatives: prediction.suggestedAlternatives
      };
    } else {
      action = 'accept';
      suggestion = {
        title: '✅ Treino Bem Posicionado',
        description: 'Tudo indica que você conseguirá completar este treino conforme planejado.',
      };
    }

    return {
      action,
      confidence: prediction.confidence,
      suggestion,
      reasoning: prediction.factors.map(f => f.description),
      mlMetadata: {
        modelsUsed: ['ReschedulePredictor', ...(volumeAdjustment ? ['VolumeAdjuster'] : [])],
        scores: {
          rescheduleConfidence: prediction.confidence,
          ...(volumeAdjustment && {
            volumeAdjustment: volumeAdjustment.adjustmentPercent
          })
        },
        confidence: prediction.confidence
      }
    };
  }

  /**
   * CENÁRIO 3: Ajusta volume de treino baseado em fadiga e recuperação
   */
  private async handleVolumeAdjustment(input: OrchestratorInput): Promise<OrchestratorOutput> {
    const { plannedDistance, plannedDuration, workoutType } = input.data;

    // 1. Ajusta volume
    const adjustment = await this.volumeAdjuster.adjust({
      userId: input.userId,
      plannedDistance,
      plannedDuration,
      workoutType,
      recentWorkouts: await this.getRecentWorkouts(input.userId),
      userMetrics: input.data.userMetrics
    });

    // 2. Consulta padrões do usuário para ver tolerância
    const patterns = await this.getUserPatterns(input.userId);

    // 3. Decide ação baseado em ajuste + tolerância do usuário
    let action: OrchestratorOutput['action'];
    let suggestion: OrchestratorOutput['suggestion'];

    const adjustmentAbs = Math.abs(adjustment.adjustmentPercent);
    const userTolerance = patterns?.volumeAdjustmentTolerance || 15;

    if (adjustment.riskLevel === 'high') {
      action = 'warn';
      suggestion = {
        title: '🚨 Ajuste Crítico Necessário',
        description: adjustment.reason,
        alternatives: [{
          distance: adjustment.adjustedDistance,
          duration: adjustment.adjustedDuration,
          reason: adjustment.reason,
          warnings: adjustment.warnings
        }]
      };
    } else if (adjustmentAbs > userTolerance) {
      action = 'suggest';
      suggestion = {
        title: '💡 Sugestão de Ajuste de Volume',
        description: adjustment.reason,
        alternatives: [{
          distance: adjustment.adjustedDistance,
          duration: adjustment.adjustedDuration,
          recommendations: adjustment.recommendations
        }]
      };
    } else if (adjustment.adjustmentPercent !== 0) {
      action = 'accept';
      suggestion = {
        title: '✅ Pequeno Ajuste Automático',
        description: `Volume ajustado em ${adjustment.adjustmentPercent}% baseado em seu estado atual.`,
      };
    } else {
      action = 'accept';
      suggestion = {
        title: '✅ Volume Ideal Mantido',
        description: 'Você está no ritmo perfeito! Volume mantido conforme planejado.',
      };
    }

    return {
      action,
      confidence: adjustment.confidence,
      suggestion,
      reasoning: [
        adjustment.reason,
        ...adjustment.recommendations,
        ...adjustment.warnings
      ],
      mlMetadata: {
        modelsUsed: ['VolumeAdjuster', 'UserPatternLearner'],
        scores: {
          adjustmentPercent: adjustment.adjustmentPercent,
          riskLevel: adjustment.riskLevel,
          confidence: adjustment.confidence
        },
        confidence: adjustment.confidence
      }
    };
  }

  /**
   * CENÁRIO 4: Aprende padrões e atualiza modelo
   */
  private async handlePatternLearning(input: OrchestratorInput): Promise<OrchestratorOutput> {
    const { behavior } = input.data;

    // 1. Aprende padrões
    const patterns = await this.patternLearner.learn(behavior);

    // 2. Salva padrões no banco
    await this.saveUserPatterns(input.userId, patterns);

    // 3. Retorna insights
    return {
      action: 'accept',
      confidence: patterns.confidenceLevel,
      suggestion: {
        title: '🧠 Padrões Atualizados',
        description: `Analisamos ${patterns.sampleSize} ações suas e atualizamos suas preferências.`,
      },
      reasoning: [
        `Flexibilidade: ${patterns.flexibilityPreference}`,
        `Taxa de reagendamento: ${Math.round(patterns.rescheduleFrequency * 100)}%`,
        `Confiança nos padrões: ${Math.round(patterns.confidenceLevel * 100)}%`
      ],
      mlMetadata: {
        modelsUsed: ['UserPatternLearner'],
        scores: {
          confidenceLevel: patterns.confidenceLevel,
          sampleSize: patterns.sampleSize
        },
        confidence: patterns.confidenceLevel
      }
    };
  }

  /**
   * Helpers - Busca dados do banco
   */
  private async getRecentWorkouts(userId: string) {
    const activities = await db.stravaActivity.findMany({
      where: { userId },
      orderBy: { start_date: 'desc' },
      take: 30,
      select: {
        start_date: true,
        distance: true,
        moving_time: true,
        workout_type: true,
        max_heartrate: true
      }
    });

    return activities.map(a => ({
      date: a.start_date,
      distance: a.distance / 1000,
      duration: a.moving_time,
      perceivedExertion: 5, // TODO: adicionar campo real
      completed: true
    }));
  }

  private async getUserPatterns(userId: string) {
    const patterns = await db.userDecisionPatterns.findUnique({
      where: { user_id: userId }
    });

    if (!patterns) return null;

    return {
      preferredDays: patterns.preferred_days as any,
      workoutTypeSuccess: patterns.workout_type_success as any,
      rescheduleRate: patterns.reschedule_rate,
      substituteRate: patterns.substitute_rate,
      flexibilityPreference: patterns.flexibility_preference as any,
      volumeAdjustmentTolerance: patterns.volume_adjustment_tolerance,
      confidenceLevel: patterns.confidence_level
    };
  }

  private async saveUserPatterns(userId: string, patterns: any) {
    await db.userDecisionPatterns.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        preferred_days: patterns.preferredDays,
        workout_type_success: patterns.workoutTypeSuccess,
        reschedule_rate: patterns.rescheduleFrequency,
        substitute_rate: patterns.substituteFrequency,
        flexibility_preference: patterns.flexibilityPreference,
        volume_adjustment_tolerance: patterns.volumeAdjustmentTolerance,
        confidence_level: patterns.confidenceLevel,
        sample_size: patterns.sampleSize
      },
      update: {
        preferred_days: patterns.preferredDays,
        workout_type_success: patterns.workoutTypeSuccess,
        reschedule_rate: patterns.rescheduleFrequency,
        substitute_rate: patterns.substituteFrequency,
        flexibility_preference: patterns.flexibilityPreference,
        volume_adjustment_tolerance: patterns.volumeAdjustmentTolerance,
        confidence_level: patterns.confidenceLevel,
        sample_size: patterns.sampleSize,
        last_updated: new Date()
      }
    });
  }
}
