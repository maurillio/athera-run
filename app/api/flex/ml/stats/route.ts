/**
 * API: GET /api/flex/ml/stats
 * 
 * Retorna estatísticas básicas de decisões do usuário
 * 
 * Query params:
 * - days: número de dias (default: 30)
 * 
 * Response:
 * - totalDecisions: total de decisões
 * - acceptedCount: quantas foram aceitas
 * - rejectedCount: quantas foram rejeitadas
 * - ignoredCount: quantas foram ignoradas
 * - acceptanceRate: taxa de aceitação %
 * - avgConfidenceAccepted: confidence média dos aceitos
 * - avgConfidenceRejected: confidence média dos rejeitados
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserDecisionStats } from '@/lib/ml';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const stats = await getUserDecisionStats(session.user.id, days);

    return NextResponse.json({
      success: true,
      data: stats,
      period: `${days} days`
    });
  } catch (error) {
    console.error('[API] /flex/ml/stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
