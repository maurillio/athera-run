/**
 * ATHERA FLEX - API Route: Check Workout Match
 * POST /api/athera-flex/check-match
 * Verifica se atividade Strava corresponde a treino planejado
 * Fase 3 - Sessão 3
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MLOrchestrator } from '@/lib/athera-flex/ml/MLOrchestrator';
import { prisma } from '@/lib/db';

interface CheckMatchRequest {
  plannedWorkoutId: number;
  stravaActivityId: string;
  executedDate: string;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request
    const body: CheckMatchRequest = await req.json();
    const { plannedWorkoutId, stravaActivityId, executedDate } = body;

    if (!plannedWorkoutId || !stravaActivityId) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // 3. Busca treino planejado
    const plannedWorkout = await prisma.customWorkout.findUnique({
      where: { id: plannedWorkoutId },
      include: {
        training_plan: {
          include: {
            race_goal: true
          }
        }
      }
    });

    if (!plannedWorkout) {
      return NextResponse.json({ 
        error: 'Planned workout not found' 
      }, { status: 404 });
    }

    // 4. Busca atividade Strava
    const stravaActivity = await prisma.stravaActivity.findUnique({
      where: { 
        userId_activity_id: {
          userId: session.user.id,
          activity_id: BigInt(stravaActivityId)
        }
      }
    });

    if (!stravaActivity) {
      return NextResponse.json({ 
        error: 'Strava activity not found' 
      }, { status: 404 });
    }

    // 5. Prepara dados para ML
    const mlInput = {
      userId: session.user.id,
      scenario: 'check_match' as const,
      data: {
        planned: {
          workoutType: plannedWorkout.workout_type || 'easy',
          distance: plannedWorkout.distance || 0,
          duration: plannedWorkout.duration || 0,
          pace: plannedWorkout.target_pace,
          description: plannedWorkout.description
        },
        executed: {
          distance: stravaActivity.distance / 1000, // m para km
          duration: stravaActivity.moving_time,
          pace: (stravaActivity.moving_time / 60) / (stravaActivity.distance / 1000), // min/km
          heartRate: stravaActivity.average_heartrate,
          elevation: stravaActivity.total_elevation_gain,
        },
        context: {
          scheduledDate: plannedWorkout.date,
          executedDate: new Date(executedDate),
        }
      }
    };

    // 6. Executa ML
    const orchestrator = new MLOrchestrator();
    const result = await orchestrator.decide(mlInput);

    // 7. Se match aceito, registra decisão
    if (result.action === 'accept') {
      await prisma.workoutMatchDecision.create({
        data: {
          user_id: session.user.id,
          planned_workout_id: plannedWorkoutId,
          strava_activity_id: stravaActivityId,
          match_score: result.mlMetadata.scores.matchScore,
          was_accepted: true,
          decision_source: 'automatic',
          ml_confidence: result.confidence,
          ml_reasoning: result.reasoning
        }
      });

      // Atualiza custom_workout
      await prisma.customWorkout.update({
        where: { id: plannedWorkoutId },
        data: {
          executed_workout_id: parseInt(stravaActivityId),
          was_rescheduled: false
        }
      });
    }

    // 8. Retorna resultado
    return NextResponse.json({
      success: true,
      result: {
        action: result.action,
        matchScore: result.mlMetadata.scores.matchScore,
        confidence: result.confidence,
        suggestion: result.suggestion,
        reasoning: result.reasoning,
        requiresUserDecision: result.action !== 'accept'
      }
    });

  } catch (error) {
    console.error('[Athera Flex] Error checking match:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * GET /api/athera-flex/check-match?workoutId=123
 * Busca decisões anteriores de um treino
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const workoutId = url.searchParams.get('workoutId');

    if (!workoutId) {
      return NextResponse.json({ 
        error: 'Missing workoutId parameter' 
      }, { status: 400 });
    }

    const decisions = await prisma.workoutMatchDecision.findMany({
      where: {
        user_id: session.user.id,
        planned_workout_id: parseInt(workoutId)
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ success: true, decisions });

  } catch (error) {
    console.error('[Athera Flex] Error fetching decisions:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
