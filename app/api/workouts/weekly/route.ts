
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const athleteId = searchParams.get('athleteId');

    if (!athleteId) {
      return NextResponse.json({ error: 'Missing athleteId' }, { status: 400 });
    }

    // Pegar últimas 8 semanas
    const weeksAgo = 8;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeksAgo * 7));

    const workouts = await prisma.completedWorkout.findMany({
      where: {
        athleteId: parseInt(athleteId),
        date: {
          gte: startDate,
        },
        type: 'running'
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Agrupar por semana
    const weeklyData: { [key: number]: { totalDistance: number; totalWorkouts: number } } = {};
    
    workouts.forEach(workout => {
      const weekNumber = Math.floor(
        (new Date().getTime() - new Date(workout.date).getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      const weekKey = weeksAgo - weekNumber;

      if (weekKey >= 1 && weekKey <= weeksAgo) {
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { totalDistance: 0, totalWorkouts: 0 };
        }
        weeklyData[weekKey].totalDistance += workout.distance || 0;
        weeklyData[weekKey].totalWorkouts += 1;
      }
    });

    // Converter para array
    const result = Object.entries(weeklyData)
      .map(([week, data]) => ({
        weekNumber: parseInt(week),
        totalDistance: Math.round(data.totalDistance * 10) / 10,
        totalWorkouts: data.totalWorkouts,
      }))
      .sort((a, b) => a.weekNumber - b.weekNumber);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching weekly data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly data' },
      { status: 500 }
    );
  }
}
