/**
 * API ROUTE: Strava Activities
 * GET /api/strava/activities - Listar atividades do Strava
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * Detectar se atividade é uma prova baseado em nome, distância e descrição
 */
function detectRaceByName(name: string, distance: number, description: string): boolean {
  const lowerName = name.toLowerCase();
  const lowerDesc = description.toLowerCase();
  const distanceKm = distance / 1000;
  
  // Palavras-chave de prova
  const raceKeywords = [
    'prova', 'corrida', 'maratona', 'meia', 'half', 'desafio',
    'race', 'marathon', 'run', 'challenge', 'championship',
    '5k', '10k', '15k', '21k', '42k', '42.195', '21.097'
  ];
  
  const hasRaceKeyword = raceKeywords.some(keyword => 
    lowerName.includes(keyword) || lowerDesc.includes(keyword)
  );
  
  // Distâncias oficiais de prova (±500m)
  const officialDistances = [5, 10, 15, 21.097, 42.195];
  const isOfficialDistance = officialDistances.some(
    d => Math.abs(distanceKm - d) <= 0.5
  );
  
  return hasRaceKeyword || isOfficialDistance;
}

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
      // Detectar provas por palavras-chave multilíngue
      where.OR = [
        { name: { contains: 'prova', mode: 'insensitive' } },
        { name: { contains: 'corrida', mode: 'insensitive' } },
        { name: { contains: 'maratona', mode: 'insensitive' } },
        { name: { contains: 'race', mode: 'insensitive' } },
        { name: { contains: 'marathon', mode: 'insensitive' } },
        { name: { contains: '5k', mode: 'insensitive' } },
        { name: { contains: '10k', mode: 'insensitive' } },
        { name: { contains: '21k', mode: 'insensitive' } },
        { name: { contains: '42k', mode: 'insensitive' } }
      ];
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
        manual: true,
        description: true
      }
    });

    // FASE 2: Detectar quais são provas usando lógica de detecção
    const activitiesWithRaceDetection = activities.map(activity => {
      const isRace = detectRaceByName(activity.name, activity.distance, activity.description || '');
      return {
        ...activity,
        isRace
      };
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
      activities: activitiesWithRaceDetection,
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
