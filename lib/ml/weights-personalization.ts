/**
 * ATHERA FLEX v3.3.0 - ML SCORE WEIGHTS PERSONALIZATION
 * 
 * Personaliza pesos dos 4 scores baseado em padrões de aceitação
 * do usuário. Sistema aprende quais dimensões são mais importantes
 * para cada pessoa.
 * 
 * 4 Dimensions:
 * - date_weight: Importância da proximidade temporal
 * - type_weight: Importância do tipo de treino correto
 * - volume_weight: Importância da distância similar
 * - intensity_weight: Importância do pace/HR similar
 */

import { prisma } from '@/lib/db';
import { getUserDecisionPatterns } from './decision-collector';

export interface PersonalizedWeights {
  dateWeight: number;
  typeWeight: number;
  volumeWeight: number;
  intensityWeight: number;
  decisionsAnalyzed: number;
  confidence: number; // quão confiante está na personalização (0-100)
  optimizationNotes: string;
}

/**
 * Calcula pesos personalizados baseado em padrões de aceitação
 * 
 * Algoritmo:
 * 1. Busca decisões accepted vs rejected
 * 2. Para cada dimensão, calcula correlação com aceitação
 * 3. Pesos maiores para dimensões que melhor predizem aceitação
 * 4. Normaliza para somar 1.0
 * 
 * @param userId - ID do usuário
 * @param minDecisions - Mínimo de decisões (default: 20)
 * @returns Pesos personalizados ou null se dados insuficientes
 */
export async function calculatePersonalizedWeights(
  userId: string,
  minDecisions: number = 20
): Promise<PersonalizedWeights | null> {
  try {
    // Buscar decisões (accepted + rejected, não ignored)
    const decisions = await prisma.$queryRaw<any[]>`
      SELECT 
        decision_type,
        date_score,
        type_score,
        volume_score,
        intensity_score
      FROM user_decision_patterns
      WHERE user_id = ${userId}
        AND decision_type IN ('accepted', 'rejected')
        AND date_score IS NOT NULL
        AND type_score IS NOT NULL
        AND volume_score IS NOT NULL
        AND intensity_score IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 100
    `;

    if (decisions.length < minDecisions) {
      console.log('[ML] Insufficient decisions for weights:', {
        userId,
        found: decisions.length,
        required: minDecisions
      });
      return null;
    }

    // Separar accepted vs rejected
    const accepted = decisions.filter(d => d.decision_type === 'accepted');
    const rejected = decisions.filter(d => d.decision_type === 'rejected');

    if (accepted.length < 5 || rejected.length < 5) {
      return null; // Precisa de ambos grupos
    }

    // Calcular médias por grupo
    const avgAccepted = {
      date: accepted.reduce((sum, d) => sum + Number(d.date_score), 0) / accepted.length,
      type: accepted.reduce((sum, d) => sum + Number(d.type_score), 0) / accepted.length,
      volume: accepted.reduce((sum, d) => sum + Number(d.volume_score), 0) / accepted.length,
      intensity: accepted.reduce((sum, d) => sum + Number(d.intensity_score), 0) / accepted.length
    };

    const avgRejected = {
      date: rejected.reduce((sum, d) => sum + Number(d.date_score), 0) / rejected.length,
      type: rejected.reduce((sum, d) => sum + Number(d.type_score), 0) / rejected.length,
      volume: rejected.reduce((sum, d) => sum + Number(d.volume_score), 0) / rejected.length,
      intensity: rejected.reduce((sum, d) => sum + Number(d.intensity_score), 0) / rejected.length
    };

    // Calcular "discriminação" - diferença entre accepted e rejected
    // Maior diferença = mais importante essa dimensão
    const discrimination = {
      date: Math.abs(avgAccepted.date - avgRejected.date),
      type: Math.abs(avgAccepted.type - avgRejected.type),
      volume: Math.abs(avgAccepted.volume - avgRejected.volume),
      intensity: Math.abs(avgAccepted.intensity - avgRejected.intensity)
    };

    // Total discrimination
    const totalDiscrimination = 
      discrimination.date +
      discrimination.type +
      discrimination.volume +
      discrimination.intensity;

    if (totalDiscrimination === 0) {
      return null; // Sem padrão detectável
    }

    // Calcular pesos RAW (proporcionais à discriminação)
    let rawWeights = {
      date: discrimination.date / totalDiscrimination,
      type: discrimination.type / totalDiscrimination,
      volume: discrimination.volume / totalDiscrimination,
      intensity: discrimination.intensity / totalDiscrimination
    };

    // Aplicar constraints (0.10 - 0.50)
    const constrainWeight = (w: number) => Math.max(0.10, Math.min(0.50, w));
    
    rawWeights = {
      date: constrainWeight(rawWeights.date),
      type: constrainWeight(rawWeights.type),
      volume: constrainWeight(rawWeights.volume),
      intensity: constrainWeight(rawWeights.intensity)
    };

    // Renormalizar para somar 1.0
    const sum = rawWeights.date + rawWeights.type + rawWeights.volume + rawWeights.intensity;
    
    const finalWeights = {
      date: Number((rawWeights.date / sum).toFixed(2)),
      type: Number((rawWeights.type / sum).toFixed(2)),
      volume: Number((rawWeights.volume / sum).toFixed(2)),
      intensity: Number((rawWeights.intensity / sum).toFixed(2))
    };

    // Ajuste fino para garantir soma exata de 1.0
    const finalSum = finalWeights.date + finalWeights.type + finalWeights.volume + finalWeights.intensity;
    if (Math.abs(finalSum - 1.0) > 0.01) {
      const diff = 1.0 - finalSum;
      finalWeights.date += diff; // ajuste no primeiro peso
      finalWeights.date = Number(finalWeights.date.toFixed(2));
    }

    // Calcular confidence da personalização
    // Baseado em: quantidade de decisões + variância dos scores
    const confidenceFromVolume = Math.min(100, (decisions.length / 50) * 100);
    const confidenceFromDiscrimination = Math.min(100, (totalDiscrimination / 80) * 100);
    const confidence = (confidenceFromVolume + confidenceFromDiscrimination) / 2;

    // Gerar notas explicativas
    const sortedDimensions = Object.entries(discrimination)
      .sort((a, b) => b[1] - a[1])
      .map(([dim]) => dim);

    const notes = `Personalizado baseado em ${decisions.length} decisões. ` +
      `Você prioriza: ${sortedDimensions[0]} (${(finalWeights[sortedDimensions[0] as keyof typeof finalWeights] * 100).toFixed(0)}%), ` +
      `depois ${sortedDimensions[1]} (${(finalWeights[sortedDimensions[1] as keyof typeof finalWeights] * 100).toFixed(0)}%).`;

    return {
      dateWeight: finalWeights.date,
      typeWeight: finalWeights.type,
      volumeWeight: finalWeights.volume,
      intensityWeight: finalWeights.intensity,
      decisionsAnalyzed: decisions.length,
      confidence: Math.round(confidence),
      optimizationNotes: notes
    };
  } catch (error) {
    console.error('[ML] Error calculating personalized weights:', error);
    return null;
  }
}

/**
 * Salva pesos personalizados no banco
 * 
 * @param userId - ID do usuário
 * @param weights - Pesos calculados
 * @param trigger - O que disparou ('auto', 'manual', 'threshold_change')
 * @returns Success boolean
 */
export async function savePersonalizedWeights(
  userId: string,
  weights: PersonalizedWeights,
  trigger: 'auto' | 'manual' | 'threshold_change' = 'auto'
): Promise<boolean> {
  try {
    await prisma.$executeRaw`
      INSERT INTO user_score_weights (
        user_id,
        date_weight,
        type_weight,
        volume_weight,
        intensity_weight,
        decisions_analyzed,
        last_optimization_at,
        optimization_trigger,
        optimization_notes
      ) VALUES (
        ${userId},
        ${weights.dateWeight},
        ${weights.typeWeight},
        ${weights.volumeWeight},
        ${weights.intensityWeight},
        ${weights.decisionsAnalyzed},
        NOW(),
        ${trigger},
        ${weights.optimizationNotes}
      )
      ON CONFLICT (user_id) 
      DO UPDATE SET
        date_weight = ${weights.dateWeight},
        type_weight = ${weights.typeWeight},
        volume_weight = ${weights.volumeWeight},
        intensity_weight = ${weights.intensityWeight},
        decisions_analyzed = ${weights.decisionsAnalyzed},
        last_optimization_at = NOW(),
        optimization_trigger = ${trigger},
        optimization_notes = ${weights.optimizationNotes},
        updated_at = NOW()
    `;

    console.log('[ML] Personalized weights saved:', {
      userId,
      weights: {
        date: weights.dateWeight,
        type: weights.typeWeight,
        volume: weights.volumeWeight,
        intensity: weights.intensityWeight
      }
    });

    return true;
  } catch (error) {
    console.error('[ML] Error saving weights:', error);
    return false;
  }
}

/**
 * Busca pesos personalizados do usuário
 * 
 * @param userId - ID do usuário
 * @returns Pesos salvos ou pesos default (0.25, 0.25, 0.25, 0.25)
 */
export async function getUserWeights(
  userId: string
): Promise<PersonalizedWeights> {
  try {
    const result = await prisma.$queryRaw<any[]>`
      SELECT 
        date_weight,
        type_weight,
        volume_weight,
        intensity_weight,
        decisions_analyzed,
        optimization_notes,
        last_optimization_at
      FROM user_score_weights
      WHERE user_id = ${userId}
    `;

    if (!result || result.length === 0) {
      // Retornar default
      return {
        dateWeight: 0.25,
        typeWeight: 0.25,
        volumeWeight: 0.25,
        intensityWeight: 0.25,
        decisionsAnalyzed: 0,
        confidence: 0,
        optimizationNotes: 'Pesos default. Serão personalizados com uso.'
      };
    }

    const row = result[0];
    const decisionsAnalyzed = Number(row.decisions_analyzed || 0);

    return {
      dateWeight: Number(row.date_weight),
      typeWeight: Number(row.type_weight),
      volumeWeight: Number(row.volume_weight),
      intensityWeight: Number(row.intensity_weight),
      decisionsAnalyzed,
      confidence: Math.min(100, (decisionsAnalyzed / 50) * 100),
      optimizationNotes: row.optimization_notes || ''
    };
  } catch (error) {
    console.error('[ML] Error getting user weights:', error);
    return {
      dateWeight: 0.25,
      typeWeight: 0.25,
      volumeWeight: 0.25,
      intensityWeight: 0.25,
      decisionsAnalyzed: 0,
      confidence: 0,
      optimizationNotes: 'Erro ao buscar pesos. Usando default.'
    };
  }
}

/**
 * Recalcula confidence de um match usando pesos personalizados
 * 
 * @param scores - Scores originais (date, type, volume, intensity)
 * @param weights - Pesos personalizados
 * @returns Novo confidence recalculado
 */
export function recalculateConfidenceWithWeights(
  scores: {
    date: number;
    type: number;
    volume: number;
    intensity: number;
  },
  weights: PersonalizedWeights
): number {
  const confidence = 
    scores.date * weights.dateWeight +
    scores.type * weights.typeWeight +
    scores.volume * weights.volumeWeight +
    scores.intensity * weights.intensityWeight;

  return Math.round(confidence * 100) / 100; // 2 decimais
}

/**
 * Roda otimização completa: calcula + salva + retorna pesos
 * 
 * @param userId - ID do usuário
 * @param trigger - Trigger da otimização
 * @returns Pesos personalizados ou null
 */
export async function runWeightsOptimization(
  userId: string,
  trigger: 'auto' | 'manual' | 'threshold_change' = 'auto'
): Promise<PersonalizedWeights | null> {
  try {
    const weights = await calculatePersonalizedWeights(userId);
    
    if (!weights) {
      return null;
    }

    await savePersonalizedWeights(userId, weights, trigger);
    
    return weights;
  } catch (error) {
    console.error('[ML] Error running weights optimization:', error);
    return null;
  }
}
