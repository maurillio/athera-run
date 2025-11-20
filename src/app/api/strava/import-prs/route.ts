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

function formatPace(metersPerSecond: number): string {
  const secondsPerKm = 1000 / metersPerSecond;
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.floor(secondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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

    // Buscar atividades recentes para extrair PRs
    const activitiesResponse = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?per_page=200`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!activitiesResponse.ok) {
      throw new Error('Falha ao buscar atividades');
    }

    const activities = await activitiesResponse.json();
    const runActivities = activities.filter((a: any) => a.type === 'Run' && !a.manual);

    // Processar PRs por distância
    const prDistances = [
      { type: '400m', distance: 400 },
      { type: '1k', distance: 1000 },
      { type: '5k', distance: 5000 },
      { type: '10k', distance: 10000 },
      { type: 'half_marathon', distance: 21097.5 },
      { type: 'marathon', distance: 42195 },
    ];

    let prsCreated = 0;

    for (const prDist of prDistances) {
      const matchingActivities = runActivities.filter((a: any) => {
        const variance = prDist.distance * 0.02; // 2% de tolerância
        return Math.abs(a.distance - prDist.distance) <= variance;
      });

      if (matchingActivities.length > 0) {
        // Encontrar o mais rápido
        const fastest = matchingActivities.reduce((prev: any, current: any) => 
          (current.moving_time < prev.moving_time) ? current : prev
        );

        await prisma.stravaPersonalRecord.upsert({
          where: {
            userId_type: {
              userId: session.user.id,
              type: prDist.type,
            },
          },
          create: {
            userId: session.user.id,
            athleteId: profile.stravaAthleteId!,
            type: prDist.type,
            distance: prDist.distance,
            time: fastest.moving_time,
            pace: formatPace(fastest.average_speed),
            activityId: fastest.id.toString(),
            activityDate: new Date(fastest.start_date),
            heartRate: fastest.average_heartrate || null,
            elevationGain: fastest.total_elevation_gain || null,
          },
          update: {
            time: fastest.moving_time,
            pace: formatPace(fastest.average_speed),
            activityId: fastest.id.toString(),
            activityDate: new Date(fastest.start_date),
            heartRate: fastest.average_heartrate || null,
            elevationGain: fastest.total_elevation_gain || null,
          },
        });

        prsCreated++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Records pessoais importados com sucesso',
      count: prsCreated,
    });
  } catch (error: any) {
    console.error('[STRAVA IMPORT PRS] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao importar records' },
      { status: 500 }
    );
  }
}
