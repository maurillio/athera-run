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

    // Buscar equipamentos do atleta
    const gearResponse = await fetch(
      `https://www.strava.com/api/v3/athlete`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!gearResponse.ok) {
      throw new Error('Falha ao buscar equipamentos');
    }

    const athlete = await gearResponse.json();
    const shoes = athlete.shoes || [];
    const bikes = athlete.bikes || [];

    const allGear = [...shoes.map((s: any) => ({ ...s, type: 'shoe' })), ...bikes.map((b: any) => ({ ...b, type: 'bike' }))];

    // Salvar equipamentos
    for (const gear of allGear) {
      await prisma.stravaGear.upsert({
        where: { gearId: gear.id },
        create: {
          userId: session.user.id,
          athleteId: profile.stravaAthleteId!,
          gearId: gear.id,
          name: gear.name,
          brand: gear.brand_name || null,
          model: gear.model_name || null,
          description: gear.description || null,
          type: gear.type,
          primary: gear.primary || false,
          distance: (gear.distance || 0) / 1000, // converter metros para km
          activityCount: 0,
          isRetired: gear.retired || false,
        },
        update: {
          name: gear.name,
          brand: gear.brand_name || null,
          model: gear.model_name || null,
          description: gear.description || null,
          primary: gear.primary || false,
          distance: (gear.distance || 0) / 1000,
          isRetired: gear.retired || false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Equipamentos importados com sucesso',
      count: allGear.length,
    });
  } catch (error: any) {
    console.error('[STRAVA IMPORT GEAR] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao importar equipamentos' },
      { status: 500 }
    );
  }
}
