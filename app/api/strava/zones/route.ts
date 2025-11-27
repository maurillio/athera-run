/**
 * API ROUTE: Strava Training Zones
 * GET /api/strava/zones - Obter zonas salvas
 * POST /api/strava/zones - Importar zonas do Strava
 * 
 * PREMIUM ONLY
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { importStravaZones, getStravaZones, calculatePaceZones } from '@/lib/strava-zones';
import { prisma } from '@/lib/prisma';

export async function GET() {
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

    // Buscar zonas de FC do Strava + dados do perfil
    const stravaData = await getStravaZones(user.athleteProfile.id);
    
    // Calcular zonas de pace baseadas em PRs
    const paceZones = await calculatePaceZones(user.id);

    return NextResponse.json({
      success: true,
      heartRateZones: stravaData.zones,
      paceZones,
      profileData: stravaData.profileData
    });

  } catch (error: any) {
    console.error('Erro ao buscar zonas:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar zonas de treino' },
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

    // Importar zonas e dados do perfil
    await importStravaZones(user.id, user.athleteProfile.id);

    // Buscar dados atualizados
    const stravaData = await getStravaZones(user.athleteProfile.id);
    const paceZones = await calculatePaceZones(user.id);

    return NextResponse.json({
      success: true,
      message: 'Zonas de treino importadas com sucesso',
      heartRateZones: stravaData.zones,
      paceZones,
      profileData: stravaData.profileData
    });

  } catch (error: any) {
    console.error('Erro ao importar zonas:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao importar zonas de treino' },
      { status: 500 }
    );
  }
}
