/**
 * API ROUTE: Race Notifications
 * GET /api/strava/race-notifications - Buscar notificações de provas detectadas
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

    if (!user?.athleteProfile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    // Buscar atividades recentes que parecem provas (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivities = await prisma.stravaActivity.findMany({
      where: {
        userId: user.id,
        startDate: { gte: thirtyDaysAgo },
        type: 'Run'
      },
      orderBy: { startDate: 'desc' }
    });

    // Detectar provas
    const raceKeywords = [
      'prova', 'corrida', 'maratona', 'meia', 'half', 'desafio',
      'race', 'marathon', '5k', '10k', '15k', '21k', '42k'
    ];

    const detectedRaces = recentActivities
      .filter(activity => {
        const lowerName = activity.name.toLowerCase();
        const hasKeyword = raceKeywords.some(keyword => lowerName.includes(keyword));
        const distanceKm = activity.distance / 1000;
        const isOfficialDistance = [5, 10, 15, 21.097, 42.195].some(
          d => Math.abs(distanceKm - d) <= 0.5
        );
        return hasKeyword || isOfficialDistance;
      })
      .map(activity => {
        const distanceKm = activity.distance / 1000;
        let suggestedDistance = 'other';
        
        if (Math.abs(distanceKm - 5) <= 0.5) suggestedDistance = '5k';
        else if (Math.abs(distanceKm - 10) <= 0.5) suggestedDistance = '10k';
        else if (Math.abs(distanceKm - 15) <= 0.5) suggestedDistance = '15k';
        else if (Math.abs(distanceKm - 21.097) <= 0.5) suggestedDistance = 'half';
        else if (Math.abs(distanceKm - 42.195) <= 0.5) suggestedDistance = 'marathon';

        return {
          activityId: activity.activityId,
          name: activity.name,
          date: activity.startDate,
          distance: distanceKm,
          pace: activity.averagePace,
          time: activity.movingTime,
          location: activity.locationCity,
          suggestedDistance,
          suggestedClassification: distanceKm >= 21 ? 'A' : distanceKm >= 10 ? 'B' : 'C'
        };
      });

    // Verificar quais já estão vinculadas a RaceGoals
    const linkedRaces = await Promise.all(
      detectedRaces.map(async (race) => {
        const existingGoal = await prisma.raceGoal.findFirst({
          where: {
            athleteId: user.athleteProfile!.id,
            raceDate: {
              gte: new Date(new Date(race.date).getTime() - 3 * 24 * 60 * 60 * 1000),
              lte: new Date(new Date(race.date).getTime() + 3 * 24 * 60 * 60 * 1000)
            }
          }
        });

        return {
          ...race,
          isLinked: !!existingGoal,
          linkedGoalId: existingGoal?.id
        };
      })
    );

    // Retornar apenas as não vinculadas
    const unlinkedRaces = linkedRaces.filter(r => !r.isLinked);

    return NextResponse.json({
      totalDetected: detectedRaces.length,
      pendingNotifications: unlinkedRaces.length,
      notifications: unlinkedRaces
    });

  } catch (error: any) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar notificações' },
      { status: 500 }
    );
  }
}
