/**
 * API ROUTE: Strava Gear
 * GET /api/strava/gear - Obter equipamentos salvos
 * POST /api/strava/gear - Importar equipamentos do Strava
 * 
 * PREMIUM ONLY
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { importStravaGear, getStravaGear } from '@/lib/strava-gear';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

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

    // Pegar tipo do query param
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'shoe' | 'bike' | undefined;

    const gear = await getStravaGear(user.id, type);

    return NextResponse.json({
      success: true,
      gear
    });

  } catch (error: any) {
    console.error('Erro ao buscar equipamentos:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar equipamentos' },
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

    await importStravaGear(user.id, user.athleteProfile.id);

    const gear = await getStravaGear(user.id);

    return NextResponse.json({
      success: true,
      message: 'Equipamentos importados com sucesso',
      gear
    });

  } catch (error: any) {
    console.error('Erro ao importar equipamentos:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao importar equipamentos' },
      { status: 500 }
    );
  }
}
