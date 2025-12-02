/**
 * ATHERA FLEX v3.3.0 - ML PREDICTIVE INSIGHTS
 * 
 * Sistema de insights preditivos que analisa padrões e gera
 * sugestões acionáveis para o usuário.
 * 
 * Features:
 * - Predição de sucesso de matches futuros
 * - Insights comportamentais
 * - Sugestões de otimização
 * - Dashboard de métricas ML
 */

import { prisma } from '@/lib/db';
import {
  getUserDecisionStats,
  analyzeAcceptanceByConfidenceRange
} from './decision-collector';
import { getUserWeights } from './weights-personalization';
import { getLatestThresholdRecommendation } from './threshold-calibration';

export interface MLInsights {
  // Métricas gerais
  totalDecisions: number;
  acceptanceRate: number;
  
  // Padrões identificados
  bestDayOfWeek: string | null; // dia com maior taxa de aceitação
  bestTimeOfDay: string | null; // período com maior taxa
  mostAcceptedWorkoutType: string | null;
  
  // Qualidade da personalização
  personalizationLevel: 'low' | 'medium' | 'high';
  personalizationConfidence: number; // 0-100
  
  // Recomendações acionáveis
  recommendations: string[];
  
  // Próxima otimização
  nextOptimizationDate: Date | null;
  decisionsUntilNextOptimization: number;
}

/**
 * Gera insights completos para o usuário
 * 
 * @param userId - ID do usuário
 * @returns Objeto com todos os insights
 */
export async function generateUserInsights(
  userId: string
): Promise<MLInsights> {
  try {
    // Buscar estatísticas gerais (30 dias)
    const stats = await getUserDecisionStats(userId, 30);
    
    // Buscar pesos personalizados
    const weights = await getUserWeights(userId);
    
    // Buscar última recomendação de threshold
    const thresholdRec = await getLatestThresholdRecommendation(userId);
    
    // Buscar padrões temporais
    const temporalPatterns = await prisma.$queryRaw<any[]>`
      SELECT 
        day_of_week,
        COUNT(*) as total,
        SUM(CASE WHEN decision_type = 'accepted' THEN 1 ELSE 0 END) as accepted
      FROM user_decision_patterns
      WHERE user_id = ${userId}
        AND created_at >= NOW() - INTERVAL '30 days'
        AND decision_type IN ('accepted', 'rejected')
      GROUP BY day_of_week
      HAVING COUNT(*) >= 3
      ORDER BY (SUM(CASE WHEN decision_type = 'accepted' THEN 1 ELSE 0 END)::float / COUNT(*)) DESC
      LIMIT 1
    `;

    const hourPatterns = await prisma.$queryRaw<any[]>`
      SELECT 
        CASE 
          WHEN hour_of_day BETWEEN 5 AND 11 THEN 'morning'
          WHEN hour_of_day BETWEEN 12 AND 17 THEN 'afternoon'
          WHEN hour_of_day BETWEEN 18 AND 21 THEN 'evening'
          ELSE 'night'
        END as time_period,
        COUNT(*) as total,
        SUM(CASE WHEN decision_type = 'accepted' THEN 1 ELSE 0 END) as accepted
      FROM user_decision_patterns
      WHERE user_id = ${userId}
        AND created_at >= NOW() - INTERVAL '30 days'
        AND decision_type IN ('accepted', 'rejected')
        AND hour_of_day IS NOT NULL
      GROUP BY time_period
      HAVING COUNT(*) >= 3
      ORDER BY (SUM(CASE WHEN decision_type = 'accepted' THEN 1 ELSE 0 END)::float / COUNT(*)) DESC
      LIMIT 1
    `;

    const workoutTypePatterns = await prisma.$queryRaw<any[]>`
      SELECT 
        workout_type,
        COUNT(*) as total,
        SUM(CASE WHEN decision_type = 'accepted' THEN 1 ELSE 0 END) as accepted
      FROM user_decision_patterns
      WHERE user_id = ${userId}
        AND created_at >= NOW() - INTERVAL '30 days'
        AND decision_type IN ('accepted', 'rejected')
        AND workout_type IS NOT NULL
      GROUP BY workout_type
      HAVING COUNT(*) >= 3
      ORDER BY (SUM(CASE WHEN decision_type = 'accepted' THEN 1 ELSE 0 END)::float / COUNT(*)) DESC
      LIMIT 1
    `;

    // Mapear dia da semana
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const bestDay = temporalPatterns[0] 
      ? dayNames[Number(temporalPatterns[0].day_of_week)] 
      : null;

    const timePeriodMap: Record<string, string> = {
      morning: 'Manhã (5h-11h)',
      afternoon: 'Tarde (12h-17h)',
      evening: 'Noite (18h-21h)',
      night: 'Madrugada (22h-4h)'
    };
    const bestTime = hourPatterns[0]
      ? timePeriodMap[hourPatterns[0].time_period]
      : null;

    const bestWorkoutType = workoutTypePatterns[0]
      ? workoutTypePatterns[0].workout_type
      : null;

    // Determinar nível de personalização
    let personalizationLevel: 'low' | 'medium' | 'high' = 'low';
    if (stats.totalDecisions >= 50) personalizationLevel = 'high';
    else if (stats.totalDecisions >= 20) personalizationLevel = 'medium';

    // Gerar recomendações
    const recommendations: string[] = [];

    // Rec 1: Threshold
    if (thresholdRec && !thresholdRec.was_applied) {
      recommendations.push(
        `💡 Ajuste seu threshold para ${thresholdRec.recommended_threshold}% - ${thresholdRec.improvement_reason}`
      );
    }

    // Rec 2: Dados insuficientes
    if (stats.totalDecisions < 15) {
      recommendations.push(
        '📊 Continue usando o sistema! Preciso de mais 5-10 decisões para personalizar melhor.'
      );
    }

    // Rec 3: Taxa de aceitação muito baixa
    if (stats.acceptanceRate < 40 && stats.totalDecisions >= 15) {
      recommendations.push(
        '🎯 Você rejeita muitos matches. Considere diminuir seu threshold ou revisar suas preferências de flexibilidade.'
      );
    }

    // Rec 4: Taxa de aceitação muito alta
    if (stats.acceptanceRate > 85 && stats.totalDecisions >= 15) {
      recommendations.push(
        '✨ Você aceita quase tudo! Posso diminuir o threshold e sugerir ainda mais opções.'
      );
    }

    // Rec 5: Padrão temporal identificado
    if (bestDay) {
      recommendations.push(
        `📅 Você aceita mais ajustes às ${bestDay}s. Vou priorizar sugestões nesse dia.`
      );
    }

    // Rec 6: Pesos personalizados
    if (weights.confidence >= 70) {
      const topDimension = Object.entries({
        'proximidade de data': weights.dateWeight,
        'tipo de treino': weights.typeWeight,
        'volume': weights.volumeWeight,
        'intensidade': weights.intensityWeight
      }).sort((a, b) => b[1] - a[1])[0][0];

      recommendations.push(
        `🎨 Detectei que você prioriza "${topDimension}". Usando pesos personalizados!`
      );
    }

    // Próxima otimização
    const decisionsUntilNext = Math.max(0, 50 - stats.totalDecisions);
    const nextOptimizationDate = decisionsUntilNext === 0
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
      : null;

    return {
      totalDecisions: stats.totalDecisions,
      acceptanceRate: stats.acceptanceRate,
      bestDayOfWeek: bestDay,
      bestTimeOfDay: bestTime,
      mostAcceptedWorkoutType: bestWorkoutType,
      personalizationLevel,
      personalizationConfidence: weights.confidence,
      recommendations,
      nextOptimizationDate,
      decisionsUntilNextOptimization: decisionsUntilNext
    };
  } catch (error) {
    console.error('[ML] Error generating insights:', error);
    return {
      totalDecisions: 0,
      acceptanceRate: 0,
      bestDayOfWeek: null,
      bestTimeOfDay: null,
      mostAcceptedWorkoutType: null,
      personalizationLevel: 'low',
      personalizationConfidence: 0,
      recommendations: ['❌ Erro ao gerar insights. Tente novamente mais tarde.'],
      nextOptimizationDate: null,
      decisionsUntilNextOptimization: 50
    };
  }
}

/**
 * Prediz sucesso de um match futuro baseado em padrões
 * 
 * @param userId - ID do usuário
 * @param matchContext - Contexto do match
 * @returns Probabilidade de aceitação (0-100)
 */
export async function predictMatchSuccess(
  userId: string,
  matchContext: {
    confidence: number;
    dayOfWeek: number;
    hourOfDay: number;
    workoutType: string;
  }
): Promise<number> {
  try {
    // Buscar acceptance rate por faixa de confidence
    const ranges = await analyzeAcceptanceByConfidenceRange(userId, 30);
    
    // Determinar faixa do match
    let baselineProbability = 50; // default
    
    if (matchContext.confidence >= 90) {
      baselineProbability = ranges.range_90_100.rate || 80;
    } else if (matchContext.confidence >= 80) {
      baselineProbability = ranges.range_80_90.rate || 70;
    } else if (matchContext.confidence >= 70) {
      baselineProbability = ranges.range_70_80.rate || 60;
    } else {
      baselineProbability = ranges.range_60_70.rate || 50;
    }

    // Ajustar baseado em padrão temporal
    const dayPattern = await prisma.$queryRaw<any[]>`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN decision_type = 'accepted' THEN 1 ELSE 0 END) as accepted
      FROM user_decision_patterns
      WHERE user_id = ${userId}
        AND day_of_week = ${matchContext.dayOfWeek}
        AND decision_type IN ('accepted', 'rejected')
    `;

    if (dayPattern[0] && Number(dayPattern[0].total) >= 5) {
      const dayRate = (Number(dayPattern[0].accepted) / Number(dayPattern[0].total)) * 100;
      baselineProbability = (baselineProbability + dayRate) / 2; // média ponderada
    }

    // Ajustar baseado em workout type
    const typePattern = await prisma.$queryRaw<any[]>`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN decision_type = 'accepted' THEN 1 ELSE 0 END) as accepted
      FROM user_decision_patterns
      WHERE user_id = ${userId}
        AND workout_type = ${matchContext.workoutType}
        AND decision_type IN ('accepted', 'rejected')
    `;

    if (typePattern[0] && Number(typePattern[0].total) >= 3) {
      const typeRate = (Number(typePattern[0].accepted) / Number(typePattern[0].total)) * 100;
      baselineProbability = (baselineProbability * 0.7 + typeRate * 0.3); // peso menor
    }

    // Cap entre 20-95%
    return Math.round(Math.max(20, Math.min(95, baselineProbability)));
  } catch (error) {
    console.error('[ML] Error predicting match success:', error);
    return 50; // default
  }
}

/**
 * Dashboard de métricas ML para UI
 * 
 * @param userId - ID do usuário
 * @returns Dados formatados para dashboard
 */
export async function getMLDashboard(userId: string) {
  try {
    const insights = await generateUserInsights(userId);
    const stats = await getUserDecisionStats(userId, 30);
    const weights = await getUserWeights(userId);
    const thresholdRec = await getLatestThresholdRecommendation(userId);

    return {
      overview: {
        totalDecisions: insights.totalDecisions,
        acceptanceRate: Math.round(insights.acceptanceRate),
        personalizationLevel: insights.personalizationLevel,
        confidence: insights.personalizationConfidence
      },
      patterns: {
        bestDay: insights.bestDayOfWeek,
        bestTime: insights.bestTimeOfDay,
        bestWorkoutType: insights.mostAcceptedWorkoutType
      },
      weights: {
        date: Math.round(weights.dateWeight * 100),
        type: Math.round(weights.typeWeight * 100),
        volume: Math.round(weights.volumeWeight * 100),
        intensity: Math.round(weights.intensityWeight * 100),
        decisionsAnalyzed: weights.decisionsAnalyzed
      },
      threshold: thresholdRec ? {
        current: thresholdRec.current_threshold,
        recommended: thresholdRec.recommended_threshold,
        improvement: thresholdRec.expected_precision_improvement,
        reason: thresholdRec.improvement_reason,
        applied: thresholdRec.was_applied
      } : null,
      recommendations: insights.recommendations,
      nextOptimization: {
        date: insights.nextOptimizationDate,
        decisionsRemaining: insights.decisionsUntilNextOptimization
      }
    };
  } catch (error) {
    console.error('[ML] Error generating dashboard:', error);
    throw error;
  }
}
