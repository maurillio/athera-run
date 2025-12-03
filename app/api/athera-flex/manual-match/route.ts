/**
 * API Manual Match - Athera Flex
 * Marca manualmente um treino planejado como concluído usando um treino completado
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { plannedWorkoutId, completedWorkoutId } = await request.json();

    if (!plannedWorkoutId || !completedWorkoutId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Buscar user e profile
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

    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Verificar se treino completado existe e pertence ao usuário
    const completedWorkout = await prisma.completedWorkout.findFirst({
      where: {
        id: completedWorkoutId,
        athleteId: profile.id,
      },
    });

    if (!completedWorkout) {
      return NextResponse.json(
        { error: 'Completed workout not found' },
        { status: 404 }
      );
    }

    // Atualizar CompletedWorkout ligando ao planejado
    await prisma.completedWorkout.update({
      where: { id: completedWorkoutId },
      data: {
        plannedWorkoutId: plannedWorkoutId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Treino marcado como concluído com sucesso!',
      completedWorkoutId,
      plannedWorkoutId,
    });
  } catch (error) {
    console.error('[API] Error in manual match:', error);
    return NextResponse.json(
      { error: 'Erro ao marcar treino como concluído' },
      { status: 500 }
    );
  }
}
