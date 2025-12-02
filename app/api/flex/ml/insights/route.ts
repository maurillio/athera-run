/**
 * API: GET /api/flex/ml/insights
 * 
 * Retorna insights ML completos para o usuário autenticado
 * 
 * Response:
 * - overview: métricas gerais
 * - patterns: padrões identificados
 * - weights: pesos personalizados
 * - threshold: recomendação de threshold
 * - recommendations: lista de sugestões
 * - nextOptimization: quando roda próxima otimização
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMLDashboard } from '@/lib/ml';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const dashboard = await getMLDashboard(session.user.id);

    return NextResponse.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error('[API] /flex/ml/insights error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
