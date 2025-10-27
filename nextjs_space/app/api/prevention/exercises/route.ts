
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const exercises = await prisma.injuryPrevention.findMany({
      orderBy: { category: 'asc' }
    });

    const groupedExercises = exercises.reduce((acc, exercise) => {
      if (!acc[exercise.category]) {
        acc[exercise.category] = [];
      }
      acc[exercise.category].push(exercise);
      return acc;
    }, {} as Record<string, typeof exercises>);

    return NextResponse.json(groupedExercises);
  } catch (error) {
    console.error('Error fetching prevention exercises:', error);
    return NextResponse.json({}, { status: 500 });
  }
}
