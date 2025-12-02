/**
 * ATHERA FLEX v3.3.0 - Reject Suggestion API
 * POST - Registra rejeição de sugestão para machine learning
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { adjustmentEngine } from '@/lib/athera-flex/adjustment-engine';

export const dynamic = 'force-dynamic';

// ============================================================================
// POST - Rejeitar sugestão
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
      reason,
    } = body;

    // Validações
    if (!completedWorkoutId || !plannedWorkoutId) {
      return NextResponse.json(
        { error: 'Missing required fields: completedWorkoutId, plannedWorkoutId' },
        { status: 400 }
      );
    }

    // Buscar user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
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

    // Registrar rejeição usando o engine
    await adjustmentEngine.rejectSuggestion(
      user.id,
      completedWorkoutId,
      plannedWorkoutId,
      confidence || 0,
      reason
    );

    // Buscar settings para atualizar threshold se necessário
    const settings = await prisma.userFlexSettings.findUnique({
      where: { userId: user.id },
    });

    // Se learning mode ativo, ajustar threshold dinamicamente
    if (settings?.learningMode) {
      // Buscar histórico de decisões
      const recentDecisions = await prisma.workoutMatchDecision.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 dias
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      const rejectedCount = recentDecisions.filter(d => d.action === 'rejected').length;
      const acceptedCount = recentDecisions.filter(d => d.action === 'accepted').length;
      const totalCount = recentDecisions.length;

      // Se taxa de rejeição > 50%, aumentar threshold
      if (totalCount >= 10 && rejectedCount > acceptedCount) {
        const avgRejectedConfidence = recentDecisions
          .filter(d => d.action === 'rejected')
          .reduce((sum, d) => sum + d.confidence, 0) / rejectedCount;

        const newThreshold = Math.min(
          95,
          Math.max(
            settings.autoAdjustThreshold,
            Math.ceil(avgRejectedConfidence + 5)
          )
        );

        if (newThreshold > settings.autoAdjustThreshold) {
          await prisma.userFlexSettings.update({
            where: { userId: user.id },
            data: {
              autoAdjustThreshold: newThreshold,
              updatedAt: new Date(),
            },
          });

          return NextResponse.json({
            success: true,
            message: 'Rejeição registrada com sucesso',
            learning: {
              applied: true,
              newThreshold,
              oldThreshold: settings.autoAdjustThreshold,
              reason: 'Taxa de rejeição alta detectada - threshold ajustado automaticamente',
            },
            statistics: {
              totalDecisions: totalCount,
              accepted: acceptedCount,
              rejected: rejectedCount,
              rejectionRate: ((rejectedCount / totalCount) * 100).toFixed(1) + '%',
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Rejeição registrada com sucesso',
      learning: {
        applied: false,
        reason: settings?.learningMode
          ? 'Aguardando mais dados para ajustar threshold'
          : 'Learning mode desativado',
      },
    });
  } catch (error: any) {
    console.error('[Reject Suggestion] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
