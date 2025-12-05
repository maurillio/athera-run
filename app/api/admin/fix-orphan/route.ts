import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startDate = new Date('2025-11-27T00:00:00.000Z');
    const endDate = new Date('2025-12-01T23:59:59.999Z');

    const buggedWorkouts = await prisma.customWorkout.findMany({
      where: {
        week: {
          userId: session.user.email,
        },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        type: true,
        date: true,
        isCompleted: true,
        executedWorkoutId: true,
      },
      orderBy: { date: 'asc' },
    });

    const orphans = buggedWorkouts.filter(
      (w) => w.isCompleted && !w.executedWorkoutId
    );

    if (orphans.length === 0) {
      return NextResponse.json({
        status: 'ok',
        message: 'Nenhum órfão encontrado',
      });
    }

    await prisma.customWorkout.updateMany({
      where: {
        id: { in: orphans.map((o) => o.id) },
      },
      data: {
        isCompleted: false,
        completedWorkoutId: null,
      },
    });

    return NextResponse.json({
      status: 'success',
      message: `${orphans.length} órfãos corrigidos`,
      orphans,
    });
  } catch (error: any) {
    console.error('[Fix Orphan API] Error:', error);
    return NextResponse.json(
      { error: 'Internal error', details: error.message },
      { status: 500 }
    );
  }
}
