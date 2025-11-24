/**
 * API ROUTE: Strava Activities
 * GET /api/strava/activities - Listar atividades do Strava
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
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
        athleteProfile: {
          select: {
            id: true,
            stravaConnected: true
          }
        }
      }
    });

    if (!user?.athleteProfile?.stravaConnected) {
      return NextResponse.json(
        { error: 'Strava não conectado' },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    // Filtros
    let where: any = { userId: user.id };

    if (filter === 'runs') {
      where.type = 'Run';
    } else if (filter === 'races') {
      where.name = { contains: 'prova', mode: 'insensitive' };
    }

    // Buscar atividades
    const activities = await prisma.stravaActivity.findMany({
      where,
      orderBy: { startDate: 'desc' },
      take: limit,
      skip,
      select: {
        id: true,
        activityId: true,
        name: true,
        type: true,
        distance: true,
        movingTime: true,
        averagePace: true,
        totalElevationGain: true,
        averageHeartRate: true,
        maxHeartRate: true,
        kudosCount: true,
        locationCity: true,
        startDate: true,
        manual: true
      }
    });

    // Calcular estatísticas
    const allActivities = await prisma.stravaActivity.findMany({
      where: { userId: user.id, type: 'Run' },
      select: {
        distance: true,
        movingTime: true
      }
    });

    const totalDistance = allActivities.reduce((sum, a) => sum + a.distance, 0);
    const totalTime = allActivities.reduce((sum, a) => sum + a.movingTime, 0);
    const avgPaceSeconds = totalDistance > 0 
      ? (totalTime / (totalDistance / 1000)) 
      : 0;
    
    const avgPaceMin = Math.floor(avgPaceSeconds / 60);
    const avgPaceSec = Math.round(avgPaceSeconds % 60);
    const avgPace = `${avgPaceMin}:${avgPaceSec.toString().padStart(2, '0')}/km`;

    const stats = {
      totalActivities: allActivities.length,
      totalDistance,
      totalTime,
      avgPace,
      lastSync: new Date().toISOString()
    };

    return NextResponse.json({
      activities,
      stats,
      pagination: {
        page,
        limit,
        hasMore: activities.length === limit
      }
    });

  } catch (error: any) {
    console.error('Erro ao buscar atividades:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar atividades' },
      { status: 500 }
    );
  }
}
