import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * POST /api/workouts/sync-strava
 * 
 * Sincroniza treinos do Strava com o plano de treino:
 * - Busca treinos do Strava dos últimos 7 dias
 * - Compara com treinos planejados não completados
 * - Marca como completo se houver match
 * 
 * Regras de match:
 * - Data: mesmo dia (considera fuso horário)
 * - Tipo: mesmo tipo de atividade (running, strength, etc)
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('[SYNC] Session:', { 
      hasSession: !!session, 
      hasUser: !!session?.user,
      email: session?.user?.email 
    });
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user.email;

    // 1. Buscar usuário e perfil
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        AthleteProfile: {
          select: {
            id: true,
            userId: true,
            stravaConnected: true,
            stravaAccessToken: true
          }
        }
      }
    });

    console.log('[SYNC] User found:', { 
      hasUser: !!user,
      hasProfile: !!user?.AthleteProfile 
    });

    if (!user || !user.AthleteProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = user.AthleteProfile;

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 2. Verificar se tem Strava conectado
    if (!profile.stravaConnected || !profile.stravaAccessToken) {
      return NextResponse.json({ 
        error: 'Strava not connected',
        synced: 0 
      }, { status: 200 });
    }

    // 3. Buscar treinos planejados não completados dos últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const plannedWorkouts = await prisma.workout.findMany({
      where: {
        userId: profile.userId,
        date: { gte: sevenDaysAgo },
        completed: false,
        // Apenas treinos que podem vir do Strava
        type: {
          in: ['running', 'strength', 'swimming', 'cycling', 'cross']
        }
      },
      orderBy: { date: 'asc' }
    });

    if (plannedWorkouts.length === 0) {
      return NextResponse.json({ 
        message: 'No pending workouts to sync',
        synced: 0 
      });
    }

    // 4. Buscar atividades do Strava dos últimos 7 dias
    const stravaResponse = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${Math.floor(sevenDaysAgo.getTime() / 1000)}`,
      {
        headers: {
          'Authorization': `Bearer ${profile.stravaAccessToken}`
        }
      }
    );

    if (!stravaResponse.ok) {
      throw new Error('Failed to fetch Strava activities');
    }

    const stravaActivities = await stravaResponse.json();

    // 5. Mapear tipos do Strava para tipos do Athera
    const typeMap: Record<string, string[]> = {
      'running': ['Run'],
      'strength': ['WeightTraining', 'Workout'],
      'swimming': ['Swim'],
      'cycling': ['Ride', 'VirtualRide'],
      'cross': ['Crossfit', 'Yoga', 'Elliptical']
    };

    let syncedCount = 0;

    // 6. Para cada treino planejado, verificar se tem atividade do Strava
    for (const workout of plannedWorkouts) {
      const workoutDate = new Date(workout.date);
      const workoutDateStr = workoutDate.toISOString().split('T')[0]; // YYYY-MM-DD

      // Tipos aceitos para este treino
      const acceptedTypes = typeMap[workout.type] || [];

      // Buscar atividade do Strava no mesmo dia e tipo
      const matchingActivity = stravaActivities.find((activity: any) => {
        const activityDate = new Date(activity.start_date);
        const activityDateStr = activityDate.toISOString().split('T')[0];

        // Mesmo dia?
        if (activityDateStr !== workoutDateStr) return false;

        // Mesmo tipo?
        return acceptedTypes.includes(activity.type || activity.sport_type);
      });

      if (matchingActivity) {
        // Marcar como completo
        await prisma.workout.update({
          where: { id: workout.id },
          data: {
            completed: true,
            completedAt: new Date(matchingActivity.start_date),
            stravaActivityId: matchingActivity.id.toString()
          }
        });

        syncedCount++;
        console.log(`[SYNC] ✅ Workout ${workout.id} marcado como completo (Strava ID: ${matchingActivity.id})`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synchronized ${syncedCount} workout(s)`,
      synced: syncedCount,
      checked: plannedWorkouts.length
    });

  } catch (error) {
    console.error('[SYNC] Error syncing workouts:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
