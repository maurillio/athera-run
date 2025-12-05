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

    // Resetar quinta 27/11/2025 (running planejado bugado)
    const result = await prisma.customWorkout.updateMany({
      where: {
        date: {
          gte: new Date('2025-11-27T00:00:00.000Z'),
          lt: new Date('2025-11-28T00:00:00.000Z'),
        },
        type: 'running',
        isCompleted: true,
      },
      data: {
        isCompleted: false,
        executedWorkoutId: null,
        completedWorkoutId: null,
        wasSubstitution: false,
      },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Quinta 27 (running) resetada!',
      updated: result.count,
    });
  } catch (error: any) {
    console.error('[Reset Thursday 27] Error:', error);
    return NextResponse.json({ 
      error: 'Internal error', 
      details: error.message 
    }, { status: 500 });
  }
}
