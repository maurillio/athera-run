
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const athleteId = searchParams.get('athleteId');

    if (!athleteId) {
      return NextResponse.json({ error: 'Missing athleteId' }, { status: 400 });
    }

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Stats deste mês
    const thisMonthWorkouts = await prisma.completedWorkout.findMany({
      where: {
        athleteId: parseInt(athleteId),
        date: {
          gte: thisMonthStart,
        },
        type: 'running'
      },
    });

    // Stats do mês passado
    const lastMonthWorkouts = await prisma.completedWorkout.findMany({
      where: {
        athleteId: parseInt(athleteId),
        date: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
        type: 'running'
      },
    });

    // Calcular métricas deste mês
    const totalDistance = thisMonthWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0);
    const totalTime = thisMonthWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    
    let avgPace = null;
    if (totalDistance > 0 && totalTime > 0) {
      const paceMinutes = totalTime / totalDistance;
      const paceMin = Math.floor(paceMinutes);
      const paceSec = Math.round((paceMinutes - paceMin) * 60);
      avgPace = `${paceMin}:${paceSec.toString().padStart(2, '0')}/km`;
    }

    // Calcular métricas do mês passado
    const lastMonthDistance = lastMonthWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0);

    return NextResponse.json({
      thisMonth: {
        totalWorkouts: thisMonthWorkouts.length,
        totalDistance: Math.round(totalDistance * 10) / 10,
        totalTime,
        avgPace,
      },
      lastMonth: {
        totalWorkouts: lastMonthWorkouts.length,
        totalDistance: Math.round(lastMonthDistance * 10) / 10,
      },
    });
  } catch (error) {
    console.error('Error fetching workout stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout stats' },
      { status: 500 }
    );
  }
}
