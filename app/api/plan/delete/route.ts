
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { athleteProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (!user.athleteProfile || !user.athleteProfile.customPlanId) {
      return NextResponse.json({ 
        error: 'Nenhum plano encontrado para deletar' 
      }, { status: 404 });
    }

    const planId = user.athleteProfile.customPlanId;
    const athleteId = user.athleteProfile.id;

    // Deletar todos os workouts associados às semanas do plano
    const weeks = await prisma.customWeek.findMany({
      where: { planId: planId },
      select: { id: true }
    });

    const weekIds = weeks.map(w => w.id);

    if (weekIds.length > 0) {
      // Deletar todos os workouts
      await prisma.customWorkout.deleteMany({
        where: { weekId: { in: weekIds } }
      });

      // Deletar todas as semanas
      await prisma.customWeek.deleteMany({
        where: { planId: planId }
      });
    }

    // Deletar treinos completados
    await prisma.completedWorkout.deleteMany({
      where: { athleteId: athleteId }
    });

    // Deletar training logs
    await prisma.trainingLog.deleteMany({
      where: { athleteId: athleteId }
    });

    // Deletar análises de treino
    await prisma.aIAnalysis.deleteMany({
      where: { athleteId: athleteId }
    });

    // Deletar o plano
    await prisma.customTrainingPlan.delete({
      where: { id: planId }
    });

    // Atualizar o perfil do atleta
    await prisma.athleteProfile.update({
      where: { id: user.athleteProfile.id },
      data: {
        hasCustomPlan: false,
        customPlanId: null,
        currentVDOT: null,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Plano deletado com sucesso! Você pode criar um novo plano agora.'
    });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json({ 
      error: 'Erro ao deletar plano',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
