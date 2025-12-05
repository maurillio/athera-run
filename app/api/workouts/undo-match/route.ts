import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plannedWorkoutId } = body;

    if (!plannedWorkoutId) {
      return NextResponse.json(
        { error: 'Missing plannedWorkoutId' },
        { status: 400 }
      );
    }

    // Buscar user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { athleteProfile: true }
    });

    if (!user?.athleteProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Buscar o treino planejado
    const plannedWorkout = await prisma.customWorkout.findUnique({
      where: { id: plannedWorkoutId }
    });

    if (!plannedWorkout) {
      return NextResponse.json(
        { error: 'Planned workout not found' },
        { status: 404 }
      );
    }

    // Remover o match (limpar campos)
    await prisma.customWorkout.update({
      where: { id: plannedWorkoutId },
      data: {
        isCompleted: false,
        completedWorkoutId: null,
        executedWorkoutId: null,
        wasSubstitution: false
      }
    });

    // Se tinha completedWorkout vinculado, limpar também
    if (plannedWorkout.completedWorkoutId) {
      await prisma.completedWorkout.update({
        where: { id: plannedWorkout.completedWorkoutId },
        data: {
          wasPlanned: false,
          plannedDate: null,
          wasSubstitution: false
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Match desfeito com sucesso'
    });
  } catch (error) {
    console.error('[Undo Match] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
