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
      return NextResponse.json({ 
        success: true,
        message: 'Nenhum perfil encontrado. Redirecionando para onboarding...',
        redirectTo: '/onboarding'
      }, { status: 200 });
    }

    const athleteId = user.athleteProfile.id;
    const customPlanId = user.athleteProfile.customPlanId;

    console.log(`[DELETE PROFILE] Iniciando exclusão completa do perfil do atleta ${athleteId}`);

    // Usar transação para garantir atomicidade
    const result = await prisma.$transaction(async (tx) => {
      let deletedRacesCount = 0;
      let deletedWorkoutsCount = 0;
      let deletedFeedbackCount = 0;
      let deletedWeeksCount = 0;

      // 1. Deletar CustomWorkouts relacionados aos CustomWeeks do plano
      if (customPlanId) {
        const weeks = await tx.customWeek.findMany({
          where: { planId: customPlanId },
          select: { id: true }
        });

        if (weeks.length > 0) {
          const weekIds = weeks.map(w => w.id);
          await tx.customWorkout.deleteMany({
            where: { weekId: { in: weekIds } }
          });
          console.log(`[DELETE PROFILE] Deletados workouts de ${weeks.length} semanas`);

          // 2. Deletar CustomWeeks
          await tx.customWeek.deleteMany({
            where: { planId: customPlanId }
          });
          deletedWeeksCount = weeks.length;
          console.log(`[DELETE PROFILE] Deletadas ${weeks.length} semanas do plano`);
        }

        // 3. Deletar CustomTrainingPlan
        await tx.customTrainingPlan.delete({
          where: { id: customPlanId }
        });
        console.log(`[DELETE PROFILE] Plano customizado deletado`);
      }

      // 4. Deletar RaceGoals (corridas cadastradas)
      const deletedRaces = await tx.raceGoal.deleteMany({
        where: { athleteId }
      });
      deletedRacesCount = deletedRaces.count;
      console.log(`[DELETE PROFILE] Deletadas ${deletedRaces.count} corridas`);

      // 5. Deletar CompletedWorkouts (treinos registrados/completados)
      const deletedWorkouts = await tx.completedWorkout.deleteMany({
        where: { athleteId }
      });
      deletedWorkoutsCount = deletedWorkouts.count;
      console.log(`[DELETE PROFILE] Deletados ${deletedWorkouts.count} treinos registrados`);

      // 6. Deletar AthleteFeedback (feedbacks do atleta)
      const deletedFeedback = await tx.athleteFeedback.deleteMany({
        where: { userId: user.id }
      });
      deletedFeedbackCount = deletedFeedback.count;
      console.log(`[DELETE PROFILE] Deletados ${deletedFeedback.count} feedbacks`);

      // 7. Por último, deletar o AthleteProfile
      await tx.athleteProfile.delete({
        where: { id: athleteId }
      });
      console.log(`[DELETE PROFILE] Perfil do atleta deletado`);

      return {
        races: deletedRacesCount,
        workouts: deletedWorkoutsCount,
        feedback: deletedFeedbackCount,
        weeks: deletedWeeksCount
      };
    });

    console.log(`[DELETE PROFILE] ✅ Exclusão completa concluída com sucesso!`);

    return NextResponse.json({
      success: true,
      message: 'Perfil excluído com sucesso. Você será redirecionado para criar um novo perfil.',
      redirectTo: '/onboarding',
      deletedData: {
        profile: true,
        races: result.races,
        workouts: result.workouts,
        feedback: result.feedback,
        weeks: result.weeks
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
