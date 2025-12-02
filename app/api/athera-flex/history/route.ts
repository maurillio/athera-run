/**
 * API: Athera Flex History
 * Retorna histórico de ajustes do usuário
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Buscar histórico de ajustes
    const adjustments = await prisma.workoutAdjustment.findMany({
      where: {
        userId: user.id,
      },
      include: {
        plannedWorkout: true,
        completedWorkout: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limitar a 50 últimos ajustes
    });

    // Formatar resposta
    const history = adjustments.map((adj) => ({
      id: adj.id,
      type: adj.type,
      status: adj.status,
      confidence: adj.confidence,
      reason: adj.reason,
      createdAt: adj.createdAt,
      plannedWorkout: adj.plannedWorkout
        ? {
            id: adj.plannedWorkout.id,
            date: adj.plannedWorkout.date,
            type: adj.plannedWorkout.type,
            distance: adj.plannedWorkout.distance,
          }
        : null,
      completedWorkout: adj.completedWorkout
        ? {
            id: adj.completedWorkout.id,
            date: adj.completedWorkout.date,
            type: adj.completedWorkout.type,
            distance: adj.completedWorkout.distance,
            duration: adj.completedWorkout.duration,
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      count: history.length,
      adjustments: history,
    });
  } catch (error) {
    console.error('[API] /api/athera-flex/history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
