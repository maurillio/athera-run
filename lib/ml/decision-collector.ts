/**
 * ATHERA FLEX v3.3.0 - ML DECISION COLLECTOR
 * 
 * Registra TODAS as decisões do usuário com contexto completo
 * para análise de padrões e otimização automática.
 * 
 * Decisions tracked:
 * - accepted: usuário aplicou o ajuste sugerido
 * - rejected: usuário rejeitou o ajuste sugerido
 * - ignored: match foi apresentado mas usuário não interagiu (24h+)
 */

import { prisma } from '@/lib/db';

export interface DecisionContext {
  userId: string;
  matchId: number;
  
  // Decision
  decisionType: 'accepted' | 'rejected' | 'ignored';
  confidenceAtDecision: number;
  
  // Scores breakdown
  dateScore: number;
  typeScore: number;
  volumeScore: number;
  intensityScore: number;
  
  // Temporal context
  dayOfWeek: number; // 0=domingo, 6=sábado
  hourOfDay: number; // 0-23
  timeToRaceWeeks?: number; // semanas até próxima prova alvo
  
  // Workout context
  workoutType: string;
  plannedDistance: number;
  executedDistance: number;
}

/**
 * Registra uma decisão do usuário no banco de dados
 * 
 * @example
 * await recordDecision({
 *   userId: 'cuid123',
 *   matchId: 456,
 *   decisionType: 'accepted',
 *   confidenceAtDecision: 87.5,
 *   dateScore: 95,
 *   typeScore: 85,
 *   volumeScore: 80,
 *   intensityScore: 90,
 *   dayOfWeek: 1,
 *   hourOfDay: 18,
 *   workoutType: 'endurance',
 *   plannedDistance: 10,
 *   executedDistance: 16
 * });
 */
export async function recordDecision(context: DecisionContext): Promise<void> {
  try {
    const distanceVariancePercent = 
      ((context.executedDistance - context.plannedDistance) / context.plannedDistance) * 100;

    await prisma.$executeRaw`
      INSERT INTO user_decision_patterns (
        user_id,
        match_id,
        decision_type,
        confidence_at_decision,
        date_score,
        type_score,
        volume_score,
        intensity_score,
        day_of_week,
        hour_of_day,
        time_to_race_weeks,
        workout_type,
        planned_distance,
        executed_distance,
        distance_variance_percent
      ) VALUES (
        ${context.userId},
        ${context.matchId},
        ${context.decisionType},
        ${context.confidenceAtDecision},
        ${context.dateScore},
        ${context.typeScore},
        ${context.volumeScore},
        ${context.intensityScore},
        ${context.dayOfWeek},
        ${context.hourOfDay},
        ${context.timeToRaceWeeks},
        ${context.workoutType},
        ${context.plannedDistance},
        ${context.executedDistance},
        ${distanceVariancePercent}
      )
    `;

    console.log('[ML] Decision recorded:', {
      userId: context.userId,
      decisionType: context.decisionType,
      confidence: context.confidenceAtDecision
    });
  } catch (error) {
    console.error('[ML] Error recording decision:', error);
    // Non-blocking: se falhar, não quebra o fluxo
  }
}

/**
 * Busca padrões de decisões de um usuário
 * 
 * @param userId - ID do usuário
 * @param limit - Número máximo de decisões (default: 100)
 * @returns Array com histórico de decisões
 */
export async function getUserDecisionPatterns(
  userId: string,
  limit: number = 100
): Promise<any[]> {
  try {
    const patterns = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        match_id,
        decision_type,
        confidence_at_decision,
        date_score,
        type_score,
        volume_score,
        intensity_score,
        day_of_week,
        hour_of_day,
        time_to_race_weeks,
        workout_type,
        planned_distance,
        executed_distance,
        distance_variance_percent,
        created_at
      FROM user_decision_patterns
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return patterns;
  } catch (error) {
    console.error('[ML] Error fetching patterns:', error);
    return [];
  }
}

/**
 * Estatísticas básicas de decisões do usuário
 * 
 * @param userId - ID do usuário
 * @param days - Número de dias para análise (default: 30)
 * @returns Stats agregadas
 */
export async function getUserDecisionStats(
  userId: string,
  days: number = 30
): Promise<{
  totalDecisions: number;
  acceptedCount: number;
  rejectedCount: number;
  ignoredCount: number;
  acceptanceRate: number;
  avgConfidenceAccepted: number;
  avgConfidenceRejected: number;
}> {
  try {
    const stats = await prisma.$queryRaw<any[]>`
      SELECT 
        COUNT(*) as total_decisions,
        SUM(CASE WHEN decision_type = 'accepted' THEN 1 ELSE 0 END) as accepted_count,
        SUM(CASE WHEN decision_type = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
        SUM(CASE WHEN decision_type = 'ignored' THEN 1 ELSE 0 END) as ignored_count,
        AVG(CASE WHEN decision_type = 'accepted' THEN confidence_at_decision ELSE NULL END) as avg_confidence_accepted,
        AVG(CASE WHEN decision_type = 'rejected' THEN confidence_at_decision ELSE NULL END) as avg_confidence_rejected
      FROM user_decision_patterns
      WHERE user_id = ${userId}
        AND created_at >= NOW() - INTERVAL '${days} days'
    `;

    const row = stats[0];
    const totalDecisions = Number(row?.total_decisions || 0);
    const acceptedCount = Number(row?.accepted_count || 0);
    const rejectedCount = Number(row?.rejected_count || 0);
    const ignoredCount = Number(row?.ignored_count || 0);

    return {
      totalDecisions,
      acceptedCount,
      rejectedCount,
      ignoredCount,
      acceptanceRate: totalDecisions > 0 ? (acceptedCount / totalDecisions) * 100 : 0,
      avgConfidenceAccepted: Number(row?.avg_confidence_accepted || 0),
      avgConfidenceRejected: Number(row?.avg_confidence_rejected || 0)
    };
  } catch (error) {
    console.error('[ML] Error fetching stats:', error);
    return {
      totalDecisions: 0,
      acceptedCount: 0,
      rejectedCount: 0,
      ignoredCount: 0,
      acceptanceRate: 0,
      avgConfidenceAccepted: 0,
      avgConfidenceRejected: 0
    };
  }
}

/**
 * Marca matches antigos não interagidos como "ignored"
 * 
 * Roda em background (cron job ou trigger manual)
 * Para matches com 24h+ sem ação do usuário
 */
export async function markOldMatchesAsIgnored(): Promise<number> {
  try {
    const result = await prisma.$executeRaw`
      INSERT INTO user_decision_patterns (
        user_id,
        match_id,
        decision_type,
        confidence_at_decision,
        date_score,
        type_score,
        volume_score,
        intensity_score,
        workout_type,
        created_at
      )
      SELECT 
        wmd.user_id,
        wmd.id,
        'ignored',
        wmd.confidence,
        wmd.date_score,
        wmd.type_score,
        wmd.volume_score,
        wmd.intensity_score,
        'unknown',
        NOW()
      FROM workout_match_decisions wmd
      WHERE wmd.status = 'pending'
        AND wmd.created_at < NOW() - INTERVAL '24 hours'
        AND NOT EXISTS (
          SELECT 1 FROM user_decision_patterns udp 
          WHERE udp.match_id = wmd.id
        )
    `;

    console.log('[ML] Marked old matches as ignored:', result);
    return Number(result);
  } catch (error) {
    console.error('[ML] Error marking ignored matches:', error);
    return 0;
  }
}

/**
 * Analisa padrões de aceitação por faixa de confidence
 * 
 * Usado para calibração de threshold
 */
export async function analyzeAcceptanceByConfidenceRange(
  userId: string,
  days: number = 30
): Promise<{
  range_60_70: { total: number; accepted: number; rate: number };
  range_70_80: { total: number; accepted: number; rate: number };
  range_80_90: { total: number; accepted: number; rate: number };
  range_90_100: { total: number; accepted: number; rate: number };
}> {
  try {
    const ranges = await prisma.$queryRaw<any[]>`
      SELECT 
        SUM(CASE WHEN confidence_at_decision BETWEEN 60 AND 70 THEN 1 ELSE 0 END) as range_60_70_total,
        SUM(CASE WHEN confidence_at_decision BETWEEN 60 AND 70 AND decision_type = 'accepted' THEN 1 ELSE 0 END) as range_60_70_accepted,
        SUM(CASE WHEN confidence_at_decision BETWEEN 70 AND 80 THEN 1 ELSE 0 END) as range_70_80_total,
        SUM(CASE WHEN confidence_at_decision BETWEEN 70 AND 80 AND decision_type = 'accepted' THEN 1 ELSE 0 END) as range_70_80_accepted,
        SUM(CASE WHEN confidence_at_decision BETWEEN 80 AND 90 THEN 1 ELSE 0 END) as range_80_90_total,
        SUM(CASE WHEN confidence_at_decision BETWEEN 80 AND 90 AND decision_type = 'accepted' THEN 1 ELSE 0 END) as range_80_90_accepted,
        SUM(CASE WHEN confidence_at_decision BETWEEN 90 AND 100 THEN 1 ELSE 0 END) as range_90_100_total,
        SUM(CASE WHEN confidence_at_decision BETWEEN 90 AND 100 AND decision_type = 'accepted' THEN 1 ELSE 0 END) as range_90_100_accepted
      FROM user_decision_patterns
      WHERE user_id = ${userId}
        AND created_at >= NOW() - INTERVAL '${days} days'
        AND decision_type IN ('accepted', 'rejected')
    `;

    const row = ranges[0];

    const calculateRate = (accepted: number, total: number) => 
      total > 0 ? (accepted / total) * 100 : 0;

    const range_60_70_total = Number(row?.range_60_70_total || 0);
    const range_60_70_accepted = Number(row?.range_60_70_accepted || 0);
    const range_70_80_total = Number(row?.range_70_80_total || 0);
    const range_70_80_accepted = Number(row?.range_70_80_accepted || 0);
    const range_80_90_total = Number(row?.range_80_90_total || 0);
    const range_80_90_accepted = Number(row?.range_80_90_accepted || 0);
    const range_90_100_total = Number(row?.range_90_100_total || 0);
    const range_90_100_accepted = Number(row?.range_90_100_accepted || 0);

    return {
      range_60_70: {
        total: range_60_70_total,
        accepted: range_60_70_accepted,
        rate: calculateRate(range_60_70_accepted, range_60_70_total)
      },
      range_70_80: {
        total: range_70_80_total,
        accepted: range_70_80_accepted,
        rate: calculateRate(range_70_80_accepted, range_70_80_total)
      },
      range_80_90: {
        total: range_80_90_total,
        accepted: range_80_90_accepted,
        rate: calculateRate(range_80_90_accepted, range_80_90_total)
      },
      range_90_100: {
        total: range_90_100_total,
        accepted: range_90_100_accepted,
        rate: calculateRate(range_90_100_accepted, range_90_100_total)
      }
    };
  } catch (error) {
    console.error('[ML] Error analyzing acceptance ranges:', error);
    return {
      range_60_70: { total: 0, accepted: 0, rate: 0 },
      range_70_80: { total: 0, accepted: 0, rate: 0 },
      range_80_90: { total: 0, accepted: 0, rate: 0 },
      range_90_100: { total: 0, accepted: 0, rate: 0 }
    };
  }
}
