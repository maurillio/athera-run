/**
 * ATHERA FLEX - API Route: ML Decision
 * POST /api/athera-flex/ml-decision
 * Endpoint genérico para qualquer decisão ML
 * Fase 3 - Sessão 3
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MLOrchestrator } from '@/lib/athera-flex/ml/MLOrchestrator';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    // 1. Autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request
    const body = await req.json();
    const { scenario, data } = body;

    if (!scenario) {
      return NextResponse.json({ 
        error: 'Missing scenario field' 
      }, { status: 400 });
    }

    // 3. Valida cenário
    const validScenarios = ['check_match', 'predict_reschedule', 'adjust_volume', 'learn_pattern'];
    if (!validScenarios.includes(scenario)) {
      return NextResponse.json({ 
        error: `Invalid scenario. Must be one of: ${validScenarios.join(', ')}` 
      }, { status: 400 });
    }

    // 4. Prepara input para ML
    const mlInput = {
      userId: session.user.id,
      scenario,
      data
    };

    // 5. Executa ML Orchestrator
    const orchestrator = new MLOrchestrator();
    const result = await orchestrator.decide(mlInput);

    // 6. Log da decisão ML (para analytics)
    await logMLDecision(session.user.id, scenario, result);

    // 7. Retorna resultado
    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('[Athera Flex] ML Decision error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Registra decisão ML para análise futura
 */
async function logMLDecision(userId: string, scenario: string, result: any) {
  try {
    // TODO: Criar tabela ml_decision_logs se necessário analytics mais profundo
    console.log('[ML Decision]', {
      userId,
      scenario,
      action: result.action,
      confidence: result.confidence,
      modelsUsed: result.mlMetadata.modelsUsed,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[ML Decision] Error logging:', error);
    // Não falha a request se log falhar
  }
}

/**
 * GET /api/athera-flex/ml-decision?scenario=check_match
 * Retorna estatísticas de decisões ML do usuário
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const scenario = url.searchParams.get('scenario');

    // Estatísticas gerais de matches
    if (scenario === 'check_match' || !scenario) {
      const matchStats = await prisma.workoutMatchDecision.aggregate({
        where: { user_id: session.user.id },
        _avg: {
          match_score: true,
          ml_confidence: true
        },
        _count: {
          id: true
        }
      });

      const acceptanceRate = await prisma.workoutMatchDecision.count({
        where: {
          user_id: session.user.id,
          was_accepted: true
        }
      });

      return NextResponse.json({
        success: true,
        stats: {
          totalDecisions: matchStats._count.id,
          avgMatchScore: matchStats._avg.match_score?.toFixed(2),
          avgConfidence: matchStats._avg.ml_confidence?.toFixed(2),
          acceptanceRate: matchStats._count.id > 0 
            ? ((acceptanceRate / matchStats._count.id) * 100).toFixed(1) 
            : 0
        }
      });
    }

    // Padrões aprendidos do usuário
    if (scenario === 'learn_pattern') {
      const patterns = await prisma.userDecisionPatterns.findUnique({
        where: { user_id: session.user.id }
      });

      if (!patterns) {
        return NextResponse.json({
          success: true,
          patterns: null,
          message: 'Nenhum padrão aprendido ainda. Continue usando o sistema!'
        });
      }

      return NextResponse.json({
        success: true,
        patterns: {
          flexibilityPreference: patterns.flexibility_preference,
          rescheduleRate: patterns.reschedule_rate,
          substituteRate: patterns.substitute_rate,
          confidenceLevel: patterns.confidence_level,
          sampleSize: patterns.sample_size,
          lastUpdated: patterns.last_updated
        }
      });
    }

    return NextResponse.json({ 
      error: 'Scenario not supported for GET request' 
    }, { status: 400 });

  } catch (error) {
    console.error('[Athera Flex] Error fetching ML stats:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
