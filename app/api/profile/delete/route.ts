import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/profile/delete
 * Exclui COMPLETAMENTE o perfil do atleta e todos os dados relacionados
 * Redireciona para onboarding para criar novo perfil
 */
export async function DELETE(request: NextRequest) {
  try {
    console.log('[DELETE PROFILE] 🚀 Iniciando processo de exclusão');
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('[DELETE PROFILE] ❌ Não autorizado - sem sessão');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log(`[DELETE PROFILE] 👤 Usuário autenticado: ${session.user.email}`);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { athleteProfile: true },
    });

    if (!user) {
      console.log('[DELETE PROFILE] ❌ Usuário não encontrado no banco');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    console.log(`[DELETE PROFILE] ✅ Usuário encontrado: ${user.id}`);

    if (!user.athleteProfile) {
      console.log('[DELETE PROFILE] ℹ️ Nenhum perfil de atleta encontrado');
      return NextResponse.json({ 
        success: true,
        message: 'Nenhum perfil encontrado. Redirecionando para onboarding...',
        redirectTo: '/onboarding'
      }, { status: 200 });
    }

    const athleteId = user.athleteProfile.id;
    const customPlanId = user.athleteProfile.customPlanId;

    console.log(`[DELETE PROFILE] 📊 Perfil encontrado: ${athleteId}`);
    console.log(`[DELETE PROFILE] 📋 Plano customizado: ${customPlanId || 'Nenhum'}`);

    // Usar transação para garantir atomicidade
    console.log('[DELETE PROFILE] 🔄 Iniciando transação de exclusão...');
    
    const result = await prisma.$transaction(async (tx) => {
      let deletedRacesCount = 0;
      let deletedWorkoutsCount = 0;
      let deletedFeedbackCount = 0;
      let deletedWeeksCount = 0;
      let deletedCustomWorkoutsCount = 0;

      // 1. Deletar CustomWorkouts relacionados aos CustomWeeks do plano
      if (customPlanId) {
        console.log(`[DELETE PROFILE] 🗑️ Processando plano: ${customPlanId}`);
        
        const weeks = await tx.customWeek.findMany({
          where: { planId: customPlanId },
          select: { id: true }
        });

        console.log(`[DELETE PROFILE] 📅 Encontradas ${weeks.length} semanas`);

        if (weeks.length > 0) {
          const weekIds = weeks.map(w => w.id);
          
          const deletedCustomWorkouts = await tx.customWorkout.deleteMany({
            where: { weekId: { in: weekIds } }
          });
          deletedCustomWorkoutsCount = deletedCustomWorkouts.count;
          console.log(`[DELETE PROFILE] ✅ Deletados ${deletedCustomWorkouts.count} workouts customizados`);

          // 2. Deletar CustomWeeks
          const deletedWeeks = await tx.customWeek.deleteMany({
            where: { planId: customPlanId }
          });
          deletedWeeksCount = deletedWeeks.count;
          console.log(`[DELETE PROFILE] ✅ Deletadas ${deletedWeeks.count} semanas`);
        }

        // 3. Deletar CustomTrainingPlan
        await tx.customTrainingPlan.delete({
          where: { id: customPlanId }
        });
        console.log(`[DELETE PROFILE] ✅ Plano customizado deletado`);
      }

      // 4. Deletar RaceGoals (corridas cadastradas)
      const deletedRaces = await tx.raceGoal.deleteMany({
        where: { athleteId }
      });
      deletedRacesCount = deletedRaces.count;
      console.log(`[DELETE PROFILE] ✅ Deletadas ${deletedRaces.count} corridas`);

      // 5. Deletar CompletedWorkouts (treinos registrados/completados)
      const deletedWorkouts = await tx.completedWorkout.deleteMany({
        where: { athleteId }
      });
      deletedWorkoutsCount = deletedWorkouts.count;
      console.log(`[DELETE PROFILE] ✅ Deletados ${deletedWorkouts.count} treinos completados`);

      // 6. Deletar AthleteFeedback (feedbacks do atleta)
      const deletedFeedback = await tx.athleteFeedback.deleteMany({
        where: { userId: user.id }
      });
      deletedFeedbackCount = deletedFeedback.count;
      console.log(`[DELETE PROFILE] ✅ Deletados ${deletedFeedback.count} feedbacks`);

      // 7. Deletar AIAnalysis (análises de IA)
      const deletedAIAnalyses = await tx.aIAnalysis.deleteMany({
        where: { athleteId }
      });
      console.log(`[DELETE PROFILE] ✅ Deletadas ${deletedAIAnalyses.count} análises de IA`);

      // 8. Por último, deletar o AthleteProfile
      await tx.athleteProfile.delete({
        where: { id: athleteId }
      });
      console.log(`[DELETE PROFILE] ✅ Perfil do atleta deletado com sucesso`);

      return {
        races: deletedRacesCount,
        workouts: deletedWorkoutsCount,
        feedback: deletedFeedbackCount,
        weeks: deletedWeeksCount,
        customWorkouts: deletedCustomWorkoutsCount
      };
    });

    console.log('[DELETE PROFILE] 🎉 Transação concluída com sucesso!');

    console.log(`[DELETE PROFILE] ✅ EXCLUSÃO COMPLETA BEM-SUCEDIDA!`);
    console.log(`[DELETE PROFILE] 📊 Resumo:`);
    console.log(`  - Perfil de atleta: ✓`);
    console.log(`  - Corridas: ${result.races}`);
    console.log(`  - Treinos completados: ${result.workouts}`);
    console.log(`  - Feedbacks: ${result.feedback}`);
    console.log(`  - Semanas de plano: ${result.weeks}`);
    console.log(`  - Workouts customizados: ${result.customWorkouts}`);

    return NextResponse.json({
      success: true,
      message: 'Perfil excluído com sucesso. Você será redirecionado para criar um novo perfil.',
      redirectTo: '/onboarding',
      deletedData: {
        profile: true,
        races: result.races,
        workouts: result.workouts,
        feedback: result.feedback,
        weeks: result.weeks,
        customWorkouts: result.customWorkouts
      }
    }, { status: 200 });

  } catch (error) {
    console.error('[DELETE PROFILE] ❌ ERRO CRÍTICO durante exclusão:');
    console.error('[DELETE PROFILE] Tipo:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[DELETE PROFILE] Mensagem:', error instanceof Error ? error.message : String(error));
    console.error('[DELETE PROFILE] Stack:', error instanceof Error ? error.stack : 'N/A');
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao excluir perfil',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
