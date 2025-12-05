import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.email !== 'maurilliomiranda1989@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const workoutId = searchParams.get('id');

    if (action === 'check' && workoutId) {
      const workout = await prisma.customWorkout.findUnique({
        where: { id: parseInt(workoutId) },
        select: {
          id: true,
          date: true,
          type: true,
          title: true,
          isCompleted: true,
          completedWorkoutId: true,
        }
      });

      return NextResponse.json({
        status: 'check',
        workout,
        problem: workout?.isCompleted && !workout?.completedWorkoutId ? 'Marcado como concluído sem treino vinculado!' : 'OK'
      });
    }

    if (action === 'fix' && workoutId) {
      const updated = await prisma.customWorkout.update({
        where: { id: parseInt(workoutId) },
        data: {
          isCompleted: false,
          completedWorkoutId: null,
        }
      });

      return NextResponse.json({
        status: 'fixed',
        workout: updated,
        message: 'Workout corrigido! isCompleted=false, completedWorkoutId=null'
      });
    }

    return NextResponse.json({
      error: 'Falta parâmetros: ?action=check&id=WORKOUT_ID ou ?action=fix&id=WORKOUT_ID'
    }, { status: 400 });

  } catch (error: any) {
    console.error('[Fix Workout API] Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
