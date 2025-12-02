/**
 * API: POST /api/flex/ml/threshold/apply
 * 
 * Aplica threshold recomendado nas configurações do usuário
 * 
 * Body:
 * - calibrationId: ID da calibração (opcional, usa última se não fornecido)
 * 
 * Response:
 * - success: boolean
 * - newThreshold: valor aplicado
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  applyThresholdRecommendation,
  getLatestThresholdRecommendation,
  runThresholdCalibration
} from '@/lib/ml';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const calibrationId = body.calibrationId;

    let finalCalibrationId = calibrationId;

    // Se não foi passado ID, buscar última recomendação
    if (!finalCalibrationId) {
      const latest = await getLatestThresholdRecommendation(session.user.id);
      
      if (!latest) {
        // Rodar calibração nova
        const recommendation = await runThresholdCalibration(session.user.id);
        
        if (!recommendation) {
          return NextResponse.json({
            success: false,
            error: 'Dados insuficientes para calibração. Continue usando o sistema!'
          }, { status: 400 });
        }
        
        // Buscar ID da calibração recém criada
        const newLatest = await getLatestThresholdRecommendation(session.user.id);
        finalCalibrationId = newLatest?.id;
      } else {
        finalCalibrationId = latest.id;
      }
    }

    // Aplicar threshold
    const success = await applyThresholdRecommendation(
      session.user.id,
      finalCalibrationId,
      'user'
    );

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Falha ao aplicar threshold'
      }, { status: 500 });
    }

    // Buscar novo threshold aplicado
    const updated = await getLatestThresholdRecommendation(session.user.id);

    return NextResponse.json({
      success: true,
      newThreshold: updated?.recommended_threshold,
      message: 'Threshold atualizado com sucesso!'
    });
  } catch (error) {
    console.error('[API] /flex/ml/threshold/apply error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
