import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { workoutId } = await request.json();

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

    // Só permitir deletar treinos manuais
    if (workout.source !== 'manual') {
      return NextResponse.json(
        { message: 'Apenas treinos manuais podem ser deletados' },
        { status: 403 }
      );
    }

    // Deletar treino
    await prisma.completedWorkout.delete({
      where: { id: workoutId },
    });

    return NextResponse.json({
      message: 'Treino deletado com sucesso',
    });
  } catch (error) {
    console.error('[API] Error deleting workout:', error);
    return NextResponse.json(
      { message: 'Erro ao deletar treino' },
      { status: 500 }
    );
  }
}
