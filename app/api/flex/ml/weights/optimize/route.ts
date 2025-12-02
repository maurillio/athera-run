/**
 * API: POST /api/flex/ml/weights/optimize
 * 
 * Roda otimização de pesos personalizados e retorna resultado
 * 
 * Response:
 * - success: boolean
 * - weights: novos pesos calculados
 * - confidence: confiança na personalização
 * - message: explicação
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { runWeightsOptimization } from '@/lib/ml';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rodar otimização
    const weights = await runWeightsOptimization(session.user.id, 'manual');

    if (!weights) {
      return NextResponse.json({
        success: false,
        error: 'Dados insuficientes para personalização. Preciso de pelo menos 20 decisões!',
        required: 20,
        hint: 'Continue usando o sistema e aceite/rejeite sugestões.'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      weights: {
        date: Math.round(weights.dateWeight * 100),
        type: Math.round(weights.typeWeight * 100),
        volume: Math.round(weights.volumeWeight * 100),
        intensity: Math.round(weights.intensityWeight * 100)
      },
      confidence: weights.confidence,
      decisionsAnalyzed: weights.decisionsAnalyzed,
      message: weights.optimizationNotes
    });
  } catch (error) {
    console.error('[API] /flex/ml/weights/optimize error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
