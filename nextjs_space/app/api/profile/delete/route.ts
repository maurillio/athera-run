import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/profile/delete
 * Exclui COMPLETAMENTE o perfil do atleta e todos os dados relacionados
 * Redireciona para onboarding para criar novo perfil
 */
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

    if (!user.athleteProfile) {
      return NextResponse.json({ error: 'Perfil de atleta não encontrado' }, { status: 404 });
    }

    const athleteId = user.athleteProfile.id;

    console.log(`[DELETE PROFILE] Iniciando exclusão completa do perfil do atleta ${athleteId}`);

    // 1. Deletar CustomWorkouts relacionados aos CustomWeeks do plano
    if (user.athleteProfile.customPlanId) {
      const weeks = await prisma.customWeek.findMany({
        where: { planId: user.athleteProfile.customPlanId },
        select: { id: true }
      });

      if (weeks.length > 0) {
        const weekIds = weeks.map(w => w.id);
        await prisma.customWorkout.deleteMany({
          where: { weekId: { in: weekIds } }
        });
        console.log(`[DELETE PROFILE] Deletados workouts de ${weeks.length} semanas`);
      }

      // 2. Deletar CustomWeeks
      await prisma.customWeek.deleteMany({
        where: { planId: user.athleteProfile.customPlanId }
      });
      console.log(`[DELETE PROFILE] Deletadas ${weeks.length} semanas do plano`);

      // 3. Deletar CustomTrainingPlan
      await prisma.customTrainingPlan.delete({
        where: { id: user.athleteProfile.customPlanId }
      });
      console.log(`[DELETE PROFILE] Plano customizado deletado`);
    }

    // 4. Deletar RaceGoals (corridas cadastradas)
    const deletedRaces = await prisma.raceGoal.deleteMany({
      where: { athleteId }
    });
    console.log(`[DELETE PROFILE] Deletadas ${deletedRaces.count} corridas`);

    // 5. Deletar CompletedWorkouts (treinos registrados/completados)
    const deletedWorkouts = await prisma.completedWorkout.deleteMany({
      where: { athleteId }
    });
    console.log(`[DELETE PROFILE] Deletados ${deletedWorkouts.count} treinos registrados`);

    // 6. Deletar AthleteFeedback (feedbacks do atleta)
    const deletedFeedback = await prisma.athleteFeedback.deleteMany({
      where: { userId: user.id }
    });
    console.log(`[DELETE PROFILE] Deletados ${deletedFeedback.count} feedbacks`);

    // 7. Deletar StravaActivities
    const deletedStravaActivities = await prisma.stravaActivity.deleteMany({
      where: { userId: user.id }
    });
    console.log(`[DELETE PROFILE] Deletadas ${deletedStravaActivities.count} atividades do Strava`);

    // 8. Por último, deletar o AthleteProfile
    await prisma.athleteProfile.delete({
      where: { id: athleteId }
    });
    console.log(`[DELETE PROFILE] Perfil do atleta deletado`);

    console.log(`[DELETE PROFILE] ✅ Exclusão completa concluída com sucesso!`);

    return NextResponse.json({
      success: true,
      message: 'Perfil excluído com sucesso. Você será redirecionado para criar um novo perfil.',
      deletedData: {
        profile: true,
        races: deletedRaces.count,
        workouts: deletedWorkouts.count,
        feedback: deletedFeedback.count,
        stravaActivities: deletedStravaActivities.count
      }
    });

  } catch (error) {
    console.error('[DELETE PROFILE] Erro ao excluir perfil:', error);
    return NextResponse.json(
      {
        error: 'Erro ao excluir perfil',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
