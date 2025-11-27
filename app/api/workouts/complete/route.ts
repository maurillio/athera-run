
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
        completedWorkout: true, // Include the completedWorkout relation
      },
    });

    if (!customWorkout) {
      return NextResponse.json(
        { message: 'Treino não encontrado' },
        { status: 404 }
      );
    }

    let completedWorkoutRecordId: number | null = null;

    if (completed) {
      // Se o treino foi marcado como completado
      // Criar ou atualizar CompletedWorkout
      if (customWorkout.completedWorkoutId) {
        // Se já existe um CompletedWorkout, atualizá-lo
        const updatedCompletedWorkout = await prisma.completedWorkout.update({
          where: { id: customWorkout.completedWorkoutId },
          data: {
            athleteId: profile.id,
            source: 'manual', // Assumindo que a confirmação manual sempre cria um manual
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
        completedWorkoutRecordId = updatedCompletedWorkout.id;
      } else {
        // Se não existe, criar um novo CompletedWorkout
        const newCompletedWorkout = await prisma.completedWorkout.create({
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
        completedWorkoutRecordId = newCompletedWorkout.id;
      }
    } else {
      // Se o treino foi marcado como NÃO completado
      if (customWorkout.completedWorkoutId) {
        // Se existia um CompletedWorkout associado, deletá-lo
        await prisma.completedWorkout.delete({
          where: { id: customWorkout.completedWorkoutId },
        });
      }
      completedWorkoutRecordId = null;
    }

    // Atualizar o CustomWorkout com o status de completado e a referência ao CompletedWorkout
    await prisma.customWorkout.update({
      where: { id: workoutId },
      data: {
        isCompleted: completed,
        completedWorkoutId: completedWorkoutRecordId,
      },
    });

    // Recalcular a contagem de treinos completados na semana e no plano
    // (Esta lógica precisa ser mais robusta para lidar com increment/decrement)
    // Por simplicidade, vamos re-fetch e recalcular tudo.
    const updatedWeek = await prisma.customWeek.findUnique({
      where: { id: customWorkout.weekId },
      include: {
        workouts: true, // Incluir CustomWorkouts para contar isCompleted
        plan: {
          include: {
            weeks: {
              include: {
                workouts: true,
              },
            },
          },
        },
      },
    });

    if (updatedWeek) {
      const completedWorkoutsInWeek = updatedWeek.workouts.filter(w => w.isCompleted).length;
      await prisma.customWeek.update({
        where: { id: updatedWeek.id },
        data: {
          completedWorkouts: completedWorkoutsInWeek,
        },
      });

      if (updatedWeek.plan) {
        const totalWorkoutsInPlan = updatedWeek.plan.weeks.reduce((sum, week) => sum + week.totalWorkouts, 0);
        const completedWorkoutsInPlan = updatedWeek.plan.weeks.reduce(
          (sum, week) => sum + week.workouts.filter(w => w.isCompleted).length,
          0
        );
        const completionRate = totalWorkoutsInPlan > 0 ? (completedWorkoutsInPlan / totalWorkoutsInPlan) * 100 : 0;

        await prisma.customTrainingPlan.update({
          where: { id: updatedWeek.plan.id },
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
    });
  } catch (error) {
    console.error('[API] Error completing workout:', error);
    return NextResponse.json(
      { message: 'Erro ao salvar relato do treino' },
      { status: 500 }
    );
  }
}
