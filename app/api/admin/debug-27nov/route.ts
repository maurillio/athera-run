import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const workouts = await prisma.$queryRaw<Array<{
      id: number;
      type: string;
      date: Date;
      distance: number | null;
      was_planned: boolean;
      planned_date: Date | null;
      source: string;
    }>>`
      SELECT id, type, date, distance, was_planned, planned_date, source
      FROM completed_workouts
      WHERE date::date = '2025-11-27'
      ORDER BY id
    `;

    return NextResponse.json({ workouts });
  } catch (error) {
    console.error('[Debug API] Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
