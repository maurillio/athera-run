import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { MLService } from '@/lib/athera-flex/ml/ml-service';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { executedWorkoutId, targetDate } = await request.json();

    if (!executedWorkoutId || !targetDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verificar se usuário é premium
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionStatus: true }
    });

    if (user?.subscriptionStatus !== 'active') {
      return NextResponse.json(
        { error: 'Premium feature - upgrade required', premium: true },
        { status: 403 }
      );
    }

    // Buscar treino executado
    const executedWorkout = await prisma.stravaActivity.findUnique({
      where: { id: executedWorkoutId },
      include: {
        user: {
          select: {
            id: true,
            trainingPlan: true
          }
        }
      }
    });

    if (!executedWorkout || executedWorkout.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Workout not found' },
        { status: 404 }
      );
    }

    // Buscar configurações de flexibilidade
    const flexSettings = await prisma.userFlexSettings.findUnique({
      where: { userId: session.user.id }
    });

    if (!flexSettings?.enabled) {
      return NextResponse.json(
        { error: 'Flex not enabled' },
        { status: 403 }
      );
    }

    // Buscar treinos planejados na janela de flexibilidade
    const targetDateObj = new Date(targetDate);
    const windowStart = new Date(targetDateObj);
    windowStart.setDate(windowStart.getDate() - flexSettings.defaultFlexibilityWindow);
    const windowEnd = new Date(targetDateObj);
    windowEnd.setDate(windowEnd.getDate() + flexSettings.defaultFlexibilityWindow);

    const plannedWorkouts = await prisma.customWorkout.findMany({
      where: {
        trainingPlanId: executedWorkout.user.trainingPlan?.id,
        scheduledDate: {
          gte: windowStart,
          lte: windowEnd
        },
        completed: false
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    });

    if (plannedWorkouts.length === 0) {
      return NextResponse.json(
        { 
          matches: [],
          message: 'No planned workouts in flexibility window'
        },
        { status: 200 }
      );
    }

    // Usar ML Service para análise
    const mlService = new MLService();
    const analysis = await mlService.analyzeWorkoutMatch(
      session.user.id,
      executedWorkout,
      plannedWorkouts,
      {
        autoAcceptThreshold: flexSettings.autoAcceptThreshold,
        preferExactMatch: flexSettings.preferExactMatch,
        allowVolumeAdjustment: flexSettings.allowVolumeAdjustment
      }
    );

    return NextResponse.json(analysis, { status: 200 });

  } catch (error) {
    console.error('Error analyzing workout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
