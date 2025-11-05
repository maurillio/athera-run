
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { athleteId } = await request.json();

    await prisma.athleteProfile.update({
      where: { id: athleteId },
      data: {
        stravaConnected: false,
        stravaAthleteId: null,
        stravaAccessToken: null,
        stravaRefreshToken: null,
        stravaTokenExpiry: null
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao desconectar Strava:', error);
    return NextResponse.json(
      { error: 'Erro ao desconectar' },
      { status: 500 }
    );
  }
}
