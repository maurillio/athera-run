/**
 * ATHERA FLEX v3.3.0 - ML THRESHOLD CALIBRATION
 * 
 * Calibração automática de threshold baseada em padrões
 * de aceitação do usuário.
 * 
 * Analisa histórico e sugere threshold otimizado para maximizar
 * taxa de aceitação enquanto mantém qualidade dos matches.
 */

import { prisma } from '@/lib/db';
import { analyzeAcceptanceByConfidenceRange } from './decision-collector';

export interface ThresholdRecommendation {
  recommendedThreshold: number;
  currentThreshold: number;
  expectedImprovement: number; // %
  reason: string;
  analysis: {
    totalDecisions: number;
    currentAcceptanceRate: number;
    projectedAcceptanceRate: number;
  };
}

/**
 * Calcula threshold otimizado baseado em padrões de aceitação
 * 
 * Algoritmo:
 * 1. Analisa taxa de aceitação por faixa de confidence
 * 2. Identifica faixa com melhor balanço (taxa > 70% + volume)
 * 3. Sugere threshold que maximiza precisão
 * 
 * @param userId - ID do usuário
 * @param days - Dias de histórico (default: 30)
 * @param minDecisions - Mínimo de decisões necessárias (default: 15)
 * @returns Recomendação de threshold ou null se dados insuficientes
 */
export async function calculateOptimalThreshold(
  userId: string,
  days: number = 30,
  minDecisions: number = 15
): Promise<ThresholdRecommendation | null> {
  try {
    // Buscar threshold atual do usuário
    const settings = await prisma.$queryRaw<any[]>`
      SELECT confidence_threshold 
      FROM user_flex_settings 
      WHERE user_id = ${userId}
    `;

    const currentThreshold = Number(settings[0]?.confidence_threshold || 75);

    // Analisar padrões por faixa
    const ranges = await analyzeAcceptanceByConfidenceRange(userId, days);

    // Total de decisões válidas (accepted + rejected, não ignored)
    const totalDecisions = 
      ranges.range_60_70.total +
      ranges.range_70_80.total +
      ranges.range_80_90.total +
      ranges.range_90_100.total;

    // Dados insuficientes
    if (totalDecisions < minDecisions) {
      console.log('[ML] Insufficient data for threshold calibration:', {
        userId,
        totalDecisions,
        required: minDecisions
      });
      return null;
    }

    // Lógica de recomendação
    let recommendedThreshold = currentThreshold;
    let reason = '';
    let expectedImprovement = 0;

    // Regra 1: Usuário SEMPRE aceita (>85% acceptance em qualquer faixa)
    // → Sugestão: DIMINUIR threshold para ver mais matches
    if (
      ranges.range_60_70.rate > 85 && ranges.range_60_70.total >= 5 ||
      ranges.range_70_80.rate > 85 && ranges.range_70_80.total >= 5
    ) {
      recommendedThreshold = 65;
      reason = 'Você aceita quase todos os matches! Vou sugerir mais opções (threshold mais baixo).';
      expectedImprovement = 20; // mais matches disponíveis
    }
    
    // Regra 2: Usuário REJEITA MUITO em faixas baixas (<40% acceptance)
    // → Sugestão: AUMENTAR threshold para menos ruído
    else if (
      ranges.range_60_70.rate < 40 && ranges.range_60_70.total >= 5 ||
      ranges.range_70_80.rate < 50 && ranges.range_70_80.total >= 5
    ) {
      recommendedThreshold = 85;
      reason = 'Você rejeita muitos matches de confidence baixo. Vou focar em sugestões mais precisas (threshold mais alto).';
      expectedImprovement = 15; // menos ruído
    }
    
    // Regra 3: Balanço bom na faixa 70-80 (acceptance 60-80%)
    // → Sugestão: threshold 72 (sweet spot)
    else if (
      ranges.range_70_80.rate >= 60 &&
      ranges.range_70_80.rate <= 80 &&
      ranges.range_70_80.total >= 8
    ) {
      recommendedThreshold = 72;
      reason = 'Você tem bom balanço na faixa 70-80%. Vou otimizar para esse ponto ideal.';
      expectedImprovement = 10;
    }
    
    // Regra 4: Excelente performance 80-90 (>75% acceptance)
    // → Sugestão: threshold 78 (aproveita faixa boa)
    else if (
      ranges.range_80_90.rate >= 75 &&
      ranges.range_80_90.total >= 8
    ) {
      recommendedThreshold = 78;
      reason = 'Ótima taxa de aceitação na faixa 80-90%. Vou maximizar esse padrão.';
      expectedImprovement = 12;
    }
    
    // Regra 5: Usuário muito seletivo (>90% só aceita)
    // → Threshold alto (85-90)
    else if (
      ranges.range_90_100.rate >= 80 &&
      ranges.range_90_100.total >= 5 &&
      (ranges.range_70_80.rate < 50 || ranges.range_80_90.rate < 60)
    ) {
      recommendedThreshold = 88;
      reason = 'Você é bem seletivo e prefere apenas matches de alta confidence. Vou focar no que você mais confia.';
      expectedImprovement = 18;
    }

    // Se não mudou, manter atual
    if (recommendedThreshold === currentThreshold) {
      return null; // Threshold atual já está otimizado
    }

    // Calcular taxas de aceitação
    const totalAccepted = 
      ranges.range_60_70.accepted +
      ranges.range_70_80.accepted +
      ranges.range_80_90.accepted +
      ranges.range_90_100.accepted;

    const currentAcceptanceRate = totalDecisions > 0 
      ? (totalAccepted / totalDecisions) * 100 
      : 0;

    const projectedAcceptanceRate = currentAcceptanceRate + expectedImprovement;

    return {
      recommendedThreshold,
      currentThreshold,
      expectedImprovement,
      reason,
      analysis: {
        totalDecisions,
        currentAcceptanceRate,
        projectedAcceptanceRate: Math.min(projectedAcceptanceRate, 95) // cap at 95%
      }
    };
  } catch (error) {
    console.error('[ML] Error calculating optimal threshold:', error);
    return null;
  }
}

/**
 * Salva recomendação de threshold no banco
 * 
 * @param userId - ID do usuário
 * @param recommendation - Recomendação calculada
 * @returns ID do registro criado
 */
export async function saveThresholdRecommendation(
  userId: string,
  recommendation: ThresholdRecommendation
): Promise<number> {
  try {
    const result = await prisma.$queryRaw<any[]>`
      INSERT INTO ml_confidence_calibration (
        user_id,
        analysis_start_date,
        analysis_end_date,
        total_decisions,
        recommended_threshold,
        current_threshold,
        expected_precision_improvement,
        improvement_reason,
        was_applied
      ) VALUES (
        ${userId},
        NOW() - INTERVAL '30 days',
        NOW(),
        ${recommendation.analysis.totalDecisions},
        ${recommendation.recommendedThreshold},
        ${recommendation.currentThreshold},
        ${recommendation.expectedImprovement},
        ${recommendation.reason},
        false
      )
      RETURNING id
    `;

    const id = result[0]?.id;
    console.log('[ML] Threshold recommendation saved:', { userId, id });
    return id;
  } catch (error) {
    console.error('[ML] Error saving recommendation:', error);
    throw error;
  }
}

/**
 * Aplica threshold recomendado nas configurações do usuário
 * 
 * @param userId - ID do usuário
 * @param calibrationId - ID da calibração
 * @param appliedBy - Quem aplicou ('user', 'auto', 'system')
 * @returns Success boolean
 */
export async function applyThresholdRecommendation(
  userId: string,
  calibrationId: number,
  appliedBy: 'user' | 'auto' | 'system' = 'user'
): Promise<boolean> {
  try {
    // Buscar recomendação
    const calibration = await prisma.$queryRaw<any[]>`
      SELECT recommended_threshold 
      FROM ml_confidence_calibration 
      WHERE id = ${calibrationId} AND user_id = ${userId}
    `;

    if (!calibration || calibration.length === 0) {
      return false;
    }

    const newThreshold = Number(calibration[0].recommended_threshold);

    // Atualizar user_flex_settings
    await prisma.$executeRaw`
      UPDATE user_flex_settings 
      SET confidence_threshold = ${newThreshold},
          updated_at = NOW()
      WHERE user_id = ${userId}
    `;

    // Marcar como aplicado
    await prisma.$executeRaw`
      UPDATE ml_confidence_calibration 
      SET was_applied = true,
          applied_at = NOW(),
          applied_by = ${appliedBy}
      WHERE id = ${calibrationId}
    `;

    console.log('[ML] Threshold applied:', {
      userId,
      calibrationId,
      newThreshold,
      appliedBy
    });

    return true;
  } catch (error) {
    console.error('[ML] Error applying threshold:', error);
    return false;
  }
}

/**
 * Busca última recomendação de threshold para o usuário
 * 
 * @param userId - ID do usuário
 * @returns Última recomendação ou null
 */
export async function getLatestThresholdRecommendation(
  userId: string
): Promise<any | null> {
  try {
    const result = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        recommended_threshold,
        current_threshold,
        expected_precision_improvement,
        improvement_reason,
        was_applied,
        applied_at,
        applied_by,
        total_decisions,
        created_at
      FROM ml_confidence_calibration
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    return result[0] || null;
  } catch (error) {
    console.error('[ML] Error fetching latest recommendation:', error);
    return null;
  }
}

/**
 * Roda calibração completa: analisa + salva + retorna recomendação
 * 
 * @param userId - ID do usuário
 * @returns Recomendação salva no banco ou null
 */
export async function runThresholdCalibration(
  userId: string
): Promise<ThresholdRecommendation | null> {
  try {
    const recommendation = await calculateOptimalThreshold(userId);
    
    if (!recommendation) {
      return null;
    }

    await saveThresholdRecommendation(userId, recommendation);
    
    return recommendation;
  } catch (error) {
    console.error('[ML] Error running calibration:', error);
    return null;
  }
}
