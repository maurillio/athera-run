import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      workoutId,
      distance,
      duration,
      pace,
      perceivedEffort,
      feeling,
      notes
    } = body;

    if (!workoutId) {
      return NextResponse.json(
        { message: 'ID do treino é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar o perfil do atleta
    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { message: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    // Buscar o treino
    const workout = await prisma.completedWorkout.findUnique({
      where: { id: workoutId },
    });

    if (!workout) {
      return NextResponse.json(
        { message: 'Treino não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se pertence ao atleta
    if (workout.athleteId !== profile.id) {
      return NextResponse.json(
        { message: 'Treino não pertence ao usuário' },
        { status: 403 }
      );
    }

    // Só permitir editar treinos manuais
    if (workout.source !== 'manual') {
      return NextResponse.json(
        { message: 'Apenas treinos manuais podem ser editados' },
        { status: 403 }
      );
    }

    // Atualizar treino
    const updatedWorkout = await prisma.completedWorkout.update({
      where: { id: workoutId },
      data: {
        distance: distance !== undefined ? distance : workout.distance,
        duration: duration !== undefined ? duration : workout.duration,
        pace: pace !== undefined ? pace : workout.pace,
        perceivedEffort: perceivedEffort !== undefined ? perceivedEffort : workout.perceivedEffort,
        feeling: feeling !== undefined ? feeling : workout.feeling,
        notes: notes !== undefined ? notes : workout.notes,
      },
    });

    return NextResponse.json({
      message: 'Treino atualizado com sucesso',
      workout: updatedWorkout,
    });
  } catch (error) {
    console.error('[API] Error editing workout:', error);
    return NextResponse.json(
      { message: 'Erro ao editar treino' },
      { status: 500 }
    );
  }
}
