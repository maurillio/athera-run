import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
      email: session?.user?.email,
      userId: session?.user?.id
    });
    
    if (!session?.user?.id) {
      console.error('[SYNC] No session user ID');
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar perfil usando userId (padrão correto)
    let profile;
    try {
      profile = await prisma.athleteProfile.findUnique({
        where: { userId: session.user.id },
        include: {
          customPlan: {
            include: {
              weeks: {
                include: {
                  workouts: true
                }
              }
            }
          }
        }
      });
    } catch (dbError) {
      console.error('[SYNC] Database error finding profile:', dbError);
      return NextResponse.json({ 
        error: 'Erro ao buscar perfil no banco de dados',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }

    console.log('[SYNC] Profile found:', { 
      hasProfile: !!profile,
      hasStrava: !!profile?.stravaConnected,
      hasPlan: !!profile?.customPlan,
      profileId: profile?.id
    });

    if (!profile) {
      console.error('[SYNC] Profile not found for userId:', session.user.id);
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    // 2. Verificar se tem Strava conectado
    if (!profile.stravaConnected || !profile.stravaAccessToken) {
      console.log('[SYNC] Strava not connected');
      return NextResponse.json({ 
        error: 'Strava não conectado',
        synced: 0 
      }, { status: 200 });
    }

    // 3. Buscar treinos planejados não completados dos últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    console.log('[SYNC] Searching for workouts after:', sevenDaysAgo.toISOString());

    // Buscar treinos do plano customizado do usuário
    let plannedWorkouts;
    try {
      plannedWorkouts = await prisma.customWorkout.findMany({
        where: {
          week: {
            plan: {
              athleteProfile: {
                userId: session.user.id
              }
            }
          },
          date: { gte: sevenDaysAgo },
          isCompleted: false,
          // Apenas treinos que podem vir do Strava
          type: {
            in: ['running', 'strength', 'swimming', 'cycling', 'cross']
          }
        },
        orderBy: { date: 'asc' }
      });
    } catch (dbError) {
      console.error('[SYNC] Database error finding workouts:', dbError);
      return NextResponse.json({ 
        error: 'Erro ao buscar treinos planejados',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }

    console.log('[SYNC] Found planned workouts:', plannedWorkouts.length);

    if (plannedWorkouts.length === 0) {
      console.log('[SYNC] No pending workouts to sync');
      return NextResponse.json({ 
        message: 'No pending workouts to sync',
        synced: 0 
      });
    }

    // 4. Buscar atividades do Strava dos últimos 7 dias
    console.log('[SYNC] Fetching Strava activities...');
    
    let stravaResponse;
    try {
      stravaResponse = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?after=${Math.floor(sevenDaysAgo.getTime() / 1000)}`,
        {
          headers: {
            'Authorization': `Bearer ${profile.stravaAccessToken}`
          }
        }
      );
    } catch (fetchError) {
      console.error('[SYNC] Error fetching from Strava API:', fetchError);
      return NextResponse.json({ 
        error: 'Erro ao conectar com Strava API',
        details: fetchError instanceof Error ? fetchError.message : 'Unknown error'
      }, { status: 500 });
    }

    console.log('[SYNC] Strava API response status:', stravaResponse.status);

    // Se token expirou (401), tentar refresh
    if (stravaResponse.status === 401 && profile.stravaRefreshToken) {
      console.log('[SYNC] Token expired, refreshing...');
      try {
        const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: process.env.STRAVA_CLIENT_ID,
            client_secret: process.env.STRAVA_CLIENT_SECRET,
            refresh_token: profile.stravaRefreshToken,
            grant_type: 'refresh_token'
          })
        });

        if (refreshResponse.ok) {
          const tokens = await refreshResponse.json();
          console.log('[SYNC] Token refreshed successfully');
          
          // Atualizar tokens no perfil
          await prisma.athleteProfile.update({
            where: { userId: session.user.id },
            data: {
              stravaAccessToken: tokens.access_token,
              stravaRefreshToken: tokens.refresh_token,
              stravaTokenExpiresAt: new Date(tokens.expires_at * 1000)
            }
          });

          // Tentar novamente com novo token
          stravaResponse = await fetch(
            `https://www.strava.com/api/v3/athlete/activities?after=${Math.floor(sevenDaysAgo.getTime() / 1000)}`,
            {
              headers: {
                'Authorization': `Bearer ${tokens.access_token}`
              }
            }
          );
          console.log('[SYNC] Retry with new token, status:', stravaResponse.status);
        } else {
          console.error('[SYNC] Token refresh failed:', refreshResponse.status);
        }
      } catch (refreshError) {
        console.error('[SYNC] Error refreshing token:', refreshError);
      }
    }

    if (!stravaResponse.ok) {
      const errorText = await stravaResponse.text();
      console.error('[SYNC] Strava API error:', stravaResponse.status, errorText);
      return NextResponse.json({ 
        error: 'Erro ao buscar atividades do Strava. Tente reconectar sua conta.',
        synced: 0 
      }, { status: 200 });
    }

    let stravaActivities;
    try {
      stravaActivities = await stravaResponse.json();
      console.log('[SYNC] Fetched Strava activities:', stravaActivities.length);
    } catch (jsonError) {
      console.error('[SYNC] Error parsing Strava response:', jsonError);
      return NextResponse.json({ 
        error: 'Erro ao processar resposta do Strava',
        details: jsonError instanceof Error ? jsonError.message : 'Unknown error'
      }, { status: 500 });
    }

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

      console.log(`[SYNC] Checking workout ${workout.id}:`, {
        date: workoutDateStr,
        type: workout.type,
        subtype: workout.subtype,
        isCompleted: workout.isCompleted
      });

      // Tipos aceitos para este treino
      const acceptedTypes = typeMap[workout.type] || [];
      console.log(`[SYNC] Accepted Strava types for ${workout.type}:`, acceptedTypes);

      // Buscar atividade do Strava no mesmo dia e tipo
      const matchingActivity = stravaActivities.find((activity: any) => {
        const activityDate = new Date(activity.start_date);
        const activityDateStr = activityDate.toISOString().split('T')[0];

        console.log(`[SYNC] Comparing with Strava activity:`, {
          id: activity.id,
          date: activityDateStr,
          type: activity.type,
          sport_type: activity.sport_type,
          name: activity.name
        });

        // Mesmo dia?
        if (activityDateStr !== workoutDateStr) {
          console.log(`[SYNC] ❌ Date mismatch: ${activityDateStr} !== ${workoutDateStr}`);
          return false;
        }

        // Mesmo tipo?
        const typeMatch = acceptedTypes.includes(activity.type || activity.sport_type);
        console.log(`[SYNC] Type match: ${typeMatch} (${activity.type || activity.sport_type} in [${acceptedTypes.join(', ')}])`);
        return typeMatch;
      });

      if (matchingActivity) {
        console.log(`[SYNC] ✅ Found matching activity ${matchingActivity.id} for workout ${workout.id}`);
        try {
          // Verificar se já existe CompletedWorkout para esta atividade do Strava
          let completedWorkout = await prisma.completedWorkout.findUnique({
            where: { stravaActivityId: matchingActivity.id.toString() }
          });

          // Se não existe, criar novo
          if (!completedWorkout) {
            console.log(`[SYNC] Creating CompletedWorkout for Strava activity ${matchingActivity.id}`);
            completedWorkout = await prisma.completedWorkout.create({
              data: {
                athleteId: profile.id,
                source: 'strava',
                stravaActivityId: matchingActivity.id.toString(),
                date: new Date(matchingActivity.start_date),
                type: workout.type,
                subtype: workout.subtype,
                distance: matchingActivity.distance ? matchingActivity.distance / 1000 : null,
                duration: matchingActivity.moving_time,
                pace: matchingActivity.average_speed ? 
                  Math.floor(1000 / (matchingActivity.average_speed * 60)).toString() : null,
                elevation: matchingActivity.total_elevation_gain,
                avgHeartRate: matchingActivity.average_heartrate,
                maxHeartRate: matchingActivity.max_heartrate,
                calories: matchingActivity.calories
              }
            });
          } else {
            console.log(`[SYNC] CompletedWorkout already exists for Strava activity ${matchingActivity.id}`);
          }

          // Marcar CustomWorkout como completo e vincular ao CompletedWorkout (se ainda não estiver)
          if (!workout.isCompleted || workout.completedWorkoutId !== completedWorkout.id) {
            console.log(`[SYNC] Marking workout ${workout.id} as completed`);
            await prisma.customWorkout.update({
              where: { id: workout.id },
              data: {
                isCompleted: true,
                completedWorkoutId: completedWorkout.id,
                updatedAt: new Date()
              }
            });

            syncedCount++;
            console.log(`[SYNC] ✅ Workout ${workout.id} marcado como completo (Strava ID: ${matchingActivity.id})`);
          } else {
            console.log(`[SYNC] ⏭️ Workout ${workout.id} já estava sincronizado`);
          }
        } catch (syncError) {
          console.error(`[SYNC] Error syncing workout ${workout.id}:`, syncError);
          // Continuar com próximo workout ao invés de parar tudo
        }
      } else {
        console.log(`[SYNC] ❌ No matching Strava activity found for workout ${workout.id}`);
      }
    }

    console.log(`[SYNC] Sync complete: ${syncedCount}/${plannedWorkouts.length} workouts synced`);

    return NextResponse.json({
      success: true,
      message: `Synchronized ${syncedCount} workout(s)`,
      synced: syncedCount,
      checked: plannedWorkouts.length
    });

  } catch (error) {
    console.error('[SYNC] FATAL ERROR syncing workouts:', error);
    console.error('[SYNC] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    );
  }
}
