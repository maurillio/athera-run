
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const phases = await prisma.phase.findMany({
      orderBy: { phaseNumber: 'asc' },
      include: {
        nutrition: true
      }
    });

    return NextResponse.json(phases);
  } catch (error) {
    console.error('Error fetching nutrition phases:', error);
    return NextResponse.json([], { status: 500 });
  }
}
