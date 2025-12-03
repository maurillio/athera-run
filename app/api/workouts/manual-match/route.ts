import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('[MANUAL MATCH] Request body:', body);
    
    const { plannedWorkoutId, completedWorkoutId } = body;

    if (!plannedWorkoutId || !completedWorkoutId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true }
    });

    if (!user?.profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Verificar se o treino planejado existe
    const plannedWorkout = await prisma.plannedWorkout.findUnique({
      where: { id: plannedWorkoutId }
    });

    if (!plannedWorkout) {
      return NextResponse.json(
        { error: 'Planned workout not found' },
        { status: 404 }
      );
    }

    // Verificar se o treino completado existe e pertence ao usuário
    const completedWorkout = await prisma.completedWorkout.findFirst({
      where: {
        id: completedWorkoutId,
        athleteId: user.profile.id
      }
    });

    if (!completedWorkout) {
      return NextResponse.json(
        { error: 'Completed workout not found' },
        { status: 404 }
      );
    }

    // Atualizar o treino completado com o link ao planejado
    const updated = await prisma.completedWorkout.update({
      where: { id: completedWorkoutId },
      data: {
        plannedWorkoutId: plannedWorkoutId,
        wasPlanned: true,
        plannedDate: plannedWorkout.date
      }
    });

    // Atualizar o treino planejado como concluído
    await prisma.plannedWorkout.update({
      where: { id: plannedWorkoutId },
      data: {
        status: 'COMPLETED',
        completedAt: completedWorkout.date
      }
    });

    console.log('[MANUAL MATCH] Successfully matched:', {
      plannedWorkoutId,
      completedWorkoutId,
      email: session.user.email
    });

    return NextResponse.json({
      success: true,
      workout: updated
    });
  } catch (error) {
    console.error('[MANUAL MATCH] Error:', error);
    return NextResponse.json(
      { error: 'Failed to match workouts' },
      { status: 500 }
    );
  }
}
