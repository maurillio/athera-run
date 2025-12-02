/**
 * ATHERA FLEX v3.3.0 - Apply Adjustment API
 * POST - Aplica ajuste e marca treino planejado como completo
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { adjustmentEngine } from '@/lib/athera-flex/adjustment-engine';

export const dynamic = 'force-dynamic';

// ============================================================================
// POST - Aplicar ajuste
// ============================================================================

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      completedWorkoutId,
      plannedWorkoutId,
      confidence,
      dateScore,
      typeScore,
      volumeScore,
      intensityScore,
      triggeredBy = 'athlete_manual',
      reason,
    } = body;

    // Validações
    if (!completedWorkoutId || !plannedWorkoutId) {
      return NextResponse.json(
        { error: 'Missing required fields: completedWorkoutId, plannedWorkoutId' },
        { status: 400 }
      );
    }

    if (confidence < 0 || confidence > 100) {
      return NextResponse.json(
        { error: 'Confidence must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (!['athlete_manual', 'ai_suggestion', 'ai_auto', 'coach'].includes(triggeredBy)) {
      return NextResponse.json(
        { error: 'Invalid triggeredBy value' },
        { status: 400 }
      );
    }

    // Buscar user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, isPremium: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verificar se treino completado pertence ao usuário
    const completedWorkout = await prisma.completedWorkout.findUnique({
      where: { id: completedWorkoutId },
      include: {
        athlete: {
          select: { userId: true },
        },
      },
    });

    if (!completedWorkout) {
      return NextResponse.json(
        { error: 'Completed workout not found' },
        { status: 404 }
      );
    }

    if (completedWorkout.athlete.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: workout does not belong to user' },
        { status: 403 }
      );
    }

    // Verificar se treino planejado pertence ao usuário
    const plannedWorkout = await prisma.customWorkout.findUnique({
      where: { id: plannedWorkoutId },
      include: {
        week: {
          include: {
            plan: {
              include: {
                athlete: {
                  select: { userId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!plannedWorkout) {
      return NextResponse.json(
        { error: 'Planned workout not found' },
        { status: 404 }
      );
    }

    if (plannedWorkout.week.plan.athlete.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: planned workout does not belong to user' },
        { status: 403 }
      );
    }

    // Verificar se treino planejado já está completo
    if (plannedWorkout.isCompleted) {
      return NextResponse.json(
        { error: 'Planned workout is already completed' },
        { status: 400 }
      );
    }

    // Verificar Premium para auto-adjust
    if (triggeredBy === 'ai_auto' && !user.isPremium) {
      return NextResponse.json(
        {
          error: 'Premium required',
          message: 'Auto-ajuste automático requer assinatura Premium',
        },
        { status: 403 }
      );
    }

    // Aplicar ajuste usando o engine
    const result = await adjustmentEngine.applyAdjustment({
      userId: user.id,
      completedWorkoutId,
      plannedWorkoutId,
      confidence,
      dateScore: dateScore || 0,
      typeScore: typeScore || 0,
      volumeScore: volumeScore || 0,
      intensityScore: intensityScore || 0,
      triggeredBy,
      reason,
      autoApplied: triggeredBy === 'ai_auto',
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Buscar dados atualizados para resposta
    const updatedPlanned = await prisma.customWorkout.findUnique({
      where: { id: plannedWorkoutId },
      select: {
        id: true,
        title: true,
        date: true,
        type: true,
        distance: true,
        isCompleted: true,
        wasRescheduled: true,
        originalDate: true,
        rescheduledBy: true,
        rescheduledReason: true,
      },
    });

    const updatedCompleted = await prisma.completedWorkout.findUnique({
      where: { id: completedWorkoutId },
      select: {
        id: true,
        date: true,
        type: true,
        distance: true,
        wasPlanned: true,
        plannedDate: true,
        volumeVariance: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      adjustmentId: result.adjustmentId,
      confidence: result.confidence,
      triggeredBy,
      plannedWorkout: updatedPlanned,
      completedWorkout: updatedCompleted,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Apply Adjustment] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
