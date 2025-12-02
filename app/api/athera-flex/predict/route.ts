import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { MLService } from '@/lib/athera-flex/ml/ml-service';

// Predict insights para próximos treinos
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se usuário é premium
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        subscriptionStatus: true,
        trainingPlan: {
          select: { id: true }
        }
      }
    });

    if (user?.subscriptionStatus !== 'active') {
      return NextResponse.json(
        { error: 'Premium feature - upgrade required', premium: true },
        { status: 403 }
      );
    }

    // Buscar próximos treinos (próximos 7 dias)
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingWorkouts = await prisma.customWorkout.findMany({
      where: {
        trainingPlanId: user.trainingPlan?.id,
        scheduledDate: {
          gte: today,
          lte: nextWeek
        },
        completed: false
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    });

    if (upcomingWorkouts.length === 0) {
      return NextResponse.json({
        predictions: [],
        message: 'No upcoming workouts'
      }, { status: 200 });
    }

    // Buscar histórico de decisões do usuário
    const decisionHistory = await prisma.userDecisionPattern.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Usar ML Service para predições
    const mlService = new MLService();
    const predictions = [];

    for (const workout of upcomingWorkouts) {
      const prediction = await mlService.predictWorkoutFlexibility(
        session.user.id,
        workout,
        decisionHistory
      );

      predictions.push({
        workoutId: workout.id,
        workoutType: workout.type,
        scheduledDate: workout.scheduledDate,
        prediction: {
          likelyToReschedule: prediction.rescheduleProb > 0.6,
          rescheduleProb: prediction.rescheduleProb,
          suggestedDays: prediction.bestDays,
          suggestedTimeSlot: prediction.bestTimeSlot,
          reasoning: prediction.reasoning,
          confidence: prediction.confidence
        }
      });
    }

    return NextResponse.json({
      predictions,
      summary: {
        totalWorkouts: predictions.length,
        likelyRescheduled: predictions.filter(p => p.prediction.likelyToReschedule).length,
        avgRescheduleProb: predictions.reduce((sum, p) => sum + p.prediction.rescheduleProb, 0) / predictions.length
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error predicting flexibility:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
