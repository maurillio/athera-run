import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: { workoutId: string } }
) {
  try {
    const workoutId = parseInt(params.workoutId);
    const body = await request.json();

    const existingWorkout = await prisma.completedWorkout.findUnique({
      where: { id: workoutId },
      select: {
        source: true,
        date: true,
        type: true,
        subtype: true,
        distance: true,
        duration: true,
        pace: true,
        avgHeartRate: true,
        // Add other Strava-derived fields if they were editable in the form
      }
    });

    if (!existingWorkout) {
      return NextResponse.json(
        { error: 'Treino não encontrado' },
        { status: 404 }
      );
    }

    if (existingWorkout.source === 'strava') {
      // Define fields that are NOT editable for Strava workouts
      const nonEditableStravaFields = [
        'date', 'type', 'subtype', 'distance', 'duration', 'pace', 'avgHeartRate'
      ];

      for (const field of nonEditableStravaFields) {
        // Check if the incoming body tries to change a non-editable field
        if (body[field as keyof typeof existingWorkout] !== undefined && body[field as keyof typeof existingWorkout] !== existingWorkout[field as keyof typeof existingWorkout]) {
          return NextResponse.json(
            { error: `Não é possível editar o campo '${field}' para treinos do Strava.` },
            { status: 403 } // Forbidden
          );
        }
      }
    }

    const updatedWorkout = await prisma.completedWorkout.update({
      where: { id: workoutId },
      data: body,
    });

    return NextResponse.json(updatedWorkout);
  } catch (error: unknown) {
    console.error('Erro ao atualizar treino:', error);
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2025') { // Prisma error code for record not found
      return NextResponse.json(
        { error: 'Treino não encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Erro ao atualizar treino' },
      { status: 500 }
    );
  }
}

export async function DELETE(

  request: NextRequest,

  { params }: { params: { workoutId: string } }

) {

  try {

    const workoutId = parseInt(params.workoutId);



    const workoutToDelete = await prisma.completedWorkout.findUnique({

      where: { id: workoutId },

      select: { source: true } // Only fetch the source field

    });



    if (!workoutToDelete) {

      return NextResponse.json(

        { error: 'Treino não encontrado' },

        { status: 404 }

      );

    }



    if (workoutToDelete.source === 'strava') {

      return NextResponse.json(

        { error: 'Treinos importados do Strava não podem ser excluídos.' },

        { status: 403 } // Forbidden

      );

    }



    await prisma.completedWorkout.delete({

      where: { id: workoutId },

    });



    return NextResponse.json({ message: 'Treino excluído com sucesso' });

  } catch (error: unknown) {

    console.error('Erro ao excluir treino:', error);

    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2025') { // Prisma error code for record not found

      return NextResponse.json(

        { error: 'Treino não encontrado' },

        { status: 404 }

      );

    }

    return NextResponse.json(

      { error: 'Erro ao excluir treino' },

      { status: 500 }

    );

  }

}