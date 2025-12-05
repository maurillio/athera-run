import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workouts = await prisma.customWorkout.findMany({
      where: {
        week: {
          is: {
            userId: session.user.email
          }
        },
        date: {
          gte: new Date('2025-11-27T00:00:00.000Z'),
          lte: new Date('2025-12-01T00:00:00.000Z')
        }
      },
      select: {
        id: true,
        type: true,
        date: true,
        isCompleted: true,
        executedWorkoutId: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    const buggedWorkout = workouts.find(w => w.isCompleted && !w.executedWorkoutId);

    if (buggedWorkout) {
      await prisma.customWorkout.update({
        where: { id: buggedWorkout.id },
        data: { 
          isCompleted: false,
          executedWorkoutId: null
        }
      });

      return NextResponse.json({
        status: 'fixed',
        workoutId: buggedWorkout.id,
        date: buggedWorkout.date,
        message: 'Workout corrigido: isCompleted resetado para false'
      });
    }

    return NextResponse.json({
      status: 'ok',
      workouts: workouts.length,
      message: 'Nenhum workout bugado encontrado'
    });

  } catch (error: any) {
    console.error('[FIX ORPHAN] Error:', error);
    return NextResponse.json({ 
      error: 'Internal error',
      details: error.message 
    }, { status: 500 });
  }
}
