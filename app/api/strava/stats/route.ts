/**
 * API ROUTE: Strava Stats
 * GET /api/strava/stats - Obter estatísticas salvas
 * POST /api/strava/stats - Importar estatísticas do Strava
 * 
 * PREMIUM ONLY
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { importStravaStats, getStravaStats } from '@/lib/strava-stats';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar user e verificar premium
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        isPremium: true,
        athleteProfile: {
          select: { stravaConnected: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    if (!user.isPremium) {
      return NextResponse.json(
        { error: 'Recurso disponível apenas para usuários premium' },
        { status: 403 }
      );
    }

    if (!user.athleteProfile?.stravaConnected) {
      return NextResponse.json(
        { error: 'Strava não conectado' },
        { status: 400 }
      );
    }

    // Buscar stats
    const stats = await getStravaStats(user.id);

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error: any) {
    console.error('Erro ao buscar stats:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar user e profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        isPremium: true,
        athleteProfile: {
          select: {
            id: true,
            stravaConnected: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    if (!user.isPremium) {
      return NextResponse.json(
        { error: 'Recurso disponível apenas para usuários premium' },
        { status: 403 }
      );
    }

    if (!user.athleteProfile?.stravaConnected) {
      return NextResponse.json(
        { error: 'Strava não conectado' },
        { status: 400 }
      );
    }

    // Importar stats
    await importStravaStats(user.id, user.athleteProfile.id);

    // Buscar stats atualizadas
    const stats = await getStravaStats(user.id);

    return NextResponse.json({
      success: true,
      message: 'Estatísticas importadas com sucesso',
      stats
    });

  } catch (error: any) {
    console.error('Erro ao importar stats:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao importar estatísticas' },
      { status: 500 }
    );
  }
}
