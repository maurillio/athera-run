import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

async function getValidAccessToken(profile: any) {
  const now = new Date();
  let accessToken = profile.stravaAccessToken;

  if (profile.stravaTokenExpiry && now >= profile.stravaTokenExpiry) {
    const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: profile.stravaRefreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!refreshResponse.ok) {
      throw new Error('Falha ao renovar token do Strava');
    }

    const tokens = await refreshResponse.json();
    accessToken = tokens.access_token;

    await prisma.athleteProfile.update({
      where: { userId: profile.userId },
      data: {
        stravaAccessToken: tokens.access_token,
        stravaRefreshToken: tokens.refresh_token,
        stravaTokenExpiry: new Date(tokens.expires_at * 1000),
      },
    });
  }

  return accessToken;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile?.stravaConnected || !profile.stravaAccessToken) {
      return NextResponse.json({ error: 'Strava não conectado' }, { status: 400 });
    }

    const accessToken = await getValidAccessToken(profile);

    // Buscar dados do atleta com zonas
    const athleteResponse = await fetch(
      `https://www.strava.com/api/v3/athlete`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!athleteResponse.ok) {
      throw new Error('Falha ao buscar dados do atleta');
    }

    const athlete = await athleteResponse.json();

    // Processar zonas de frequência cardíaca
    const heartRateZones = athlete.heart_rate_zones || {};
    const maxHeartRate = athlete.max_heartrate || null;

    // Salvar ou atualizar zonas
    await prisma.stravaTrainingZones.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        athleteId: profile.stravaAthleteId!,
        heartRateZones: heartRateZones,
        maxHeartRate: maxHeartRate,
        restingHeartRate: athlete.resting_heartrate || null,
        stravaCalculated: true,
      },
      update: {
        heartRateZones: heartRateZones,
        maxHeartRate: maxHeartRate,
        restingHeartRate: athlete.resting_heartrate || null,
        stravaCalculated: true,
      },
    });

    // Atualizar também no perfil do atleta
    if (maxHeartRate && !profile.maxHeartRate) {
      await prisma.athleteProfile.update({
        where: { userId: session.user.id },
        data: { maxHeartRate },
      });
    }

    if (athlete.resting_heartrate && !profile.restingHeartRate) {
      await prisma.athleteProfile.update({
        where: { userId: session.user.id },
        data: { restingHeartRate: athlete.resting_heartrate },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Zonas de treino importadas com sucesso',
    });
  } catch (error: any) {
    console.error('[STRAVA IMPORT ZONES] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao importar zonas' },
      { status: 500 }
    );
  }
}
