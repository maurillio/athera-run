import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Buscar perfil do atleta
    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile?.stravaConnected || !profile.stravaAccessToken) {
      return NextResponse.json(
        { error: 'Strava não conectado' },
        { status: 400 }
      );
    }

    // Verificar se precisa refresh token
    const now = new Date();
    let accessToken = profile.stravaAccessToken;

    if (profile.stravaTokenExpiry && now >= profile.stravaTokenExpiry) {
      // Refresh token
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

      // Atualizar tokens no banco
      await prisma.athleteProfile.update({
        where: { userId: session.user.id },
        data: {
          stravaAccessToken: tokens.access_token,
          stravaRefreshToken: tokens.refresh_token,
          stravaTokenExpiry: new Date(tokens.expires_at * 1000),
        },
      });
    }

    // Buscar estatísticas do atleta no Strava
    const statsResponse = await fetch(
      `https://www.strava.com/api/v3/athletes/${profile.stravaAthleteId}/stats`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!statsResponse.ok) {
      throw new Error('Falha ao buscar estatísticas do Strava');
    }

    const stats = await statsResponse.json();

    // Salvar ou atualizar estatísticas
    await prisma.stravaStats.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        athleteId: profile.stravaAthleteId!,
        allRunsTotals: stats.all_run_totals || {},
        recentRunsTotals: stats.recent_run_totals || {},
        ytdRunsTotals: stats.ytd_run_totals || {},
        allRideTotals: stats.all_ride_totals || {},
        recentRideTotals: stats.recent_ride_totals || {},
        ytdRideTotals: stats.ytd_ride_totals || {},
        allSwimTotals: stats.all_swim_totals || {},
        recentSwimTotals: stats.recent_swim_totals || {},
        ytdSwimTotals: stats.ytd_swim_totals || {},
      },
      update: {
        allRunsTotals: stats.all_run_totals || {},
        recentRunsTotals: stats.recent_run_totals || {},
        ytdRunsTotals: stats.ytd_run_totals || {},
        allRideTotals: stats.all_ride_totals || {},
        recentRideTotals: stats.recent_ride_totals || {},
        ytdRideTotals: stats.ytd_ride_totals || {},
        allSwimTotals: stats.all_swim_totals || {},
        recentSwimTotals: stats.recent_swim_totals || {},
        ytdSwimTotals: stats.ytd_swim_totals || {},
        lastSyncAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Estatísticas importadas com sucesso',
    });
  } catch (error: any) {
    console.error('[STRAVA IMPORT STATS] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao importar estatísticas' },
      { status: 500 }
    );
  }
}
