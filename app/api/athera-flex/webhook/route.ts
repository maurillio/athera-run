import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MLService } from '@/lib/athera-flex/ml/ml-service';

// Webhook chamado após sincronização Strava
// Analisa automaticamente se atividades podem ser matchadas com treinos planejados
export async function POST(request: Request) {
  try {
    const { userId, activityIds } = await request.json();

    if (!userId || !activityIds || !Array.isArray(activityIds)) {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    // Verificar se usuário tem flex habilitado
    const flexSettings = await prisma.userFlexSettings.findUnique({
      where: { userId }
    });

    if (!flexSettings?.enabled) {
      return NextResponse.json(
        { message: 'Flex not enabled for user' },
        { status: 200 }
      );
    }

    // Buscar plano de treino do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        trainingPlan: {
          select: { id: true }
        }
      }
    });

    if (user?.subscriptionStatus !== 'active') {
      return NextResponse.json(
        { message: 'User not premium' },
        { status: 200 }
      );
    }

    const mlService = new MLService();
    const results = [];

    for (const activityId of activityIds) {
      try {
        // Buscar atividade
        const activity = await prisma.stravaActivity.findUnique({
          where: { id: activityId }
        });

        if (!activity || activity.userId !== userId) {
          continue;
        }

        // Buscar treinos planejados na janela de tempo
        const activityDate = new Date(activity.startDate);
        const windowStart = new Date(activityDate);
        windowStart.setDate(windowStart.getDate() - flexSettings.defaultFlexibilityWindow);
        const windowEnd = new Date(activityDate);
        windowEnd.setDate(windowEnd.getDate() + flexSettings.defaultFlexibilityWindow);

        const plannedWorkouts = await prisma.customWorkout.findMany({
          where: {
            trainingPlanId: user.trainingPlan?.id,
            scheduledDate: {
              gte: windowStart,
              lte: windowEnd
            },
            completed: false
          }
        });

        if (plannedWorkouts.length === 0) {
          results.push({
            activityId,
            status: 'no_matches',
            message: 'No planned workouts in window'
          });
          continue;
        }

        // Analisar matches
        const analysis = await mlService.analyzeWorkoutMatch(
          userId,
          activity,
          plannedWorkouts,
          {
            autoAcceptThreshold: flexSettings.autoAcceptThreshold,
            preferExactMatch: flexSettings.preferExactMatch,
            allowVolumeAdjustment: flexSettings.allowVolumeAdjustment
          }
        );

        // Criar match decisions no banco
        const createdMatches = [];
        for (const match of analysis.matches) {
          const created = await prisma.workoutMatchDecision.create({
            data: {
              userId,
              plannedWorkoutId: match.plannedWorkout.id,
              executedWorkoutId: activityId,
              confidence: match.confidence,
              volumeDifference: match.volumeDifference,
              timeDifference: match.timeDifference,
              suggestedReason: match.reasoning,
              status: 'pending',
              originalDate: match.plannedWorkout.scheduledDate
            }
          });
          createdMatches.push(created.id);
        }

        results.push({
          activityId,
          status: 'analyzed',
          matchesFound: analysis.matches.length,
          bestMatch: analysis.bestMatch,
          matchIds: createdMatches
        });

        // Se auto-process habilitado E alta confiança, processar automaticamente
        if (
          flexSettings.autoProcess && 
          analysis.bestMatch && 
          analysis.bestMatch.confidence >= flexSettings.autoAcceptThreshold
        ) {
          // TODO: Chamar auto-process endpoint ou executar lógica aqui
          console.log(`Auto-processing match for activity ${activityId}`);
        }

        // Enviar notificação se configurado
        if (flexSettings.notifyOnMatch && analysis.matches.length > 0) {
          // TODO: Implementar notificação
          console.log(`Notification sent for activity ${activityId}`);
        }

      } catch (error) {
        console.error(`Error processing activity ${activityId}:`, error);
        results.push({
          activityId,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      processed: activityIds.length,
      results
    }, { status: 200 });

  } catch (error) {
    console.error('Error in webhook handler:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
