
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const athleteId = searchParams.get('athleteId');
    const limit = searchParams.get('limit') || '30';

    if (!athleteId) {
      return NextResponse.json({ error: 'Missing athleteId' }, { status: 400 });
    }

    // Buscar últimos treinos
    const workouts = await prisma.completedWorkout.findMany({
      where: {
        athleteId: parseInt(athleteId),
      },
      orderBy: {
        date: 'desc',
      },
      take: parseInt(limit),
    });

    return NextResponse.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json({ error: 'Erro ao buscar treinos' }, { status: 500 });
  }
}
