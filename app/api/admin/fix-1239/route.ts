import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const result = await prisma.completedWorkout.update({
      where: { id: 1239 },
      data: {
        wasPlanned: false,
        plannedDate: null
      }
    });

    return NextResponse.json({
      status: 'success',
      message: 'Treino 1239 corrigido: wasPlanned = false',
      workout: {
        id: result.id,
        type: result.type,
        distance: result.distance,
        wasPlanned: result.wasPlanned,
        plannedDate: result.plannedDate
      }
    });
  } catch (error) {
    console.error('[Fix 1239 API] Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
