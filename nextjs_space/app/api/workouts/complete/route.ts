
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { workoutId, completed, feeling, perceivedEffort, notes } = body;

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

    // Buscar o treino personalizado
    const customWorkout = await prisma.customWorkout.findUnique({
      where: { id: workoutId },
      include: {
        week: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!customWorkout) {
      return NextResponse.json(
        { message: 'Treino não encontrado' },
        { status: 404 }
      );
    }

    // Se o treino foi completado, criar um registro de CompletedWorkout
    let completedWorkout = null;
    if (completed) {
      completedWorkout = await prisma.completedWorkout.create({
        data: {
          athleteId: profile.id,
          source: 'manual',
          date: customWorkout.date,
          type: customWorkout.type,
          subtype: customWorkout.subtype,
          distance: customWorkout.distance,
          duration: customWorkout.duration,
          pace: customWorkout.targetPace,
          perceivedEffort: perceivedEffort || null,
          feeling: feeling || null,
          notes: notes || null,
        },
      });

      // Atualizar o CustomWorkout com isCompleted e referência ao completedWorkout
      await prisma.customWorkout.update({
        where: { id: workoutId },
        data: {
          isCompleted: true,
          completedWorkoutId: completedWorkout.id,
        },
      });

      // Atualizar a contagem de treinos completados na semana
      await prisma.customWeek.update({
        where: { id: customWorkout.weekId },
        data: {
          completedWorkouts: {
            increment: 1,
          },
        },
      });

      // Recalcular a taxa de conclusão do plano
      const plan = await prisma.customTrainingPlan.findUnique({
        where: { id: customWorkout.week.plan.id },
        include: {
          weeks: {
            include: {
              workouts: true,
            },
          },
        },
      });

      if (plan) {
        const totalWorkouts = plan.weeks.reduce((sum, week) => sum + week.totalWorkouts, 0);
        const completedWorkoutsCount = plan.weeks.reduce(
          (sum, week) => sum + week.completedWorkouts,
          0
        );
        const completionRate = totalWorkouts > 0 ? (completedWorkoutsCount / totalWorkouts) * 100 : 0;

        await prisma.customTrainingPlan.update({
          where: { id: plan.id },
          data: {
            completionRate,
          },
        });
      }
    }

    // Criar ou atualizar TrainingLog
    const existingLog = await prisma.trainingLog.findFirst({
      where: {
        athleteId: profile.id,
        date: customWorkout.date,
      },
    });

    const logData = {
      workoutCompleted: completed,
      overallFeeling: feeling || null,
      perceivedEffort: perceivedEffort || null,
      notes: notes || null,
    };

    if (existingLog) {
      await prisma.trainingLog.update({
        where: { id: existingLog.id },
        data: logData,
      });
    } else {
      await prisma.trainingLog.create({
        data: {
          athleteId: profile.id,
          date: customWorkout.date,
          ...logData,
        },
      });
    }

    return NextResponse.json({
      message: 'Relato salvo com sucesso',
      completedWorkout,
    });
  } catch (error) {
    console.error('[API] Error completing workout:', error);
    return NextResponse.json(
      { message: 'Erro ao salvar relato do treino' },
      { status: 500 }
    );
  }
}
