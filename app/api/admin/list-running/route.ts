import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const workouts = await prisma.completedWorkout.findMany({
      where: {
        type: 'running',
        date: {
          gte: new Date('2025-11-27'),
          lt: new Date('2025-11-28')
        }
      },
      orderBy: { id: 'desc' }
    });

    return NextResponse.json({ workouts });
  } catch (error) {
    console.error('[List Running API] Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
