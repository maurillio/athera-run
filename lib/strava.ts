
import { prisma } from './db';

// Renovar token do Strava se estiver expirado
export async function refreshStravaToken(profileId: number) {
  const profile = await prisma.athleteProfile.findUnique({
    where: { id: profileId }
  });

  if (!profile || !profile.stravaRefreshToken) {
    throw new Error('Perfil não encontrado ou refresh token ausente');
  }

  // Verificar se o token está expirado
  const now = new Date();
  if (profile.stravaTokenExpiry && profile.stravaTokenExpiry > now) {
    // Token ainda válido
    return profile.stravaAccessToken!;
  }

  // Renovar token
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: profile.stravaRefreshToken,
      grant_type: 'refresh_token'
    })
  });

  if (!response.ok) {
    throw new Error('Falha ao renovar token do Strava');
  }

  const data = await response.json();

  // Atualizar tokens no banco
  await prisma.athleteProfile.update({
    where: { id: profileId },
    data: {
      stravaAccessToken: data.access_token,
      stravaRefreshToken: data.refresh_token,
      stravaTokenExpiry: new Date(data.expires_at * 1000)
    }
  });

  return data.access_token;
}

// Buscar atividades do Strava
export async function fetchStravaActivities(accessToken: string, page = 1, perPage = 30) {
  const response = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Erro ao buscar atividades do Strava');
  }

  return response.json();
}

// Mapear tipo de atividade do Strava para nosso sistema
export function mapStravaActivityType(stravaType: string): string {
  const typeMap: { [key: string]: string } = {
    'Run': 'running',
    'TrailRun': 'running',
    'VirtualRun': 'running',
    'WeightTraining': 'strength',
    'Workout': 'strength',
    'Crossfit': 'strength',
    'Swim': 'swimming',
    'Walk': 'running',
    'Hike': 'running'
  };

  return typeMap[stravaType] || 'running';
}

// Calcular pace em formato "X:XX/km"
export function calculatePace(distanceMeters: number, durationSeconds: number): string | null {
  if (!distanceMeters || !durationSeconds) return null;

  const distanceKm = distanceMeters / 1000;
  const durationMin = durationSeconds / 60;
  const paceMinutes = durationMin / distanceKm;
  
  const paceMin = Math.floor(paceMinutes);
  const paceSec = Math.round((paceMinutes - paceMin) * 60);
  
  return `${paceMin}:${paceSec.toString().padStart(2, '0')}/km`;
}

// Importar atividade do Strava
export async function importStravaActivity(activity: any, profileId: number) {
  const type = mapStravaActivityType(activity.type);
  const pace = type === 'running' ? calculatePace(activity.distance, activity.moving_time) : null;

  // Verificar se já existe
  const existing = await prisma.completedWorkout.findFirst({
    where: {
      athleteId: profileId,
      stravaActivityId: activity.id.toString()
    }
  });

  if (existing) {
    return existing; // Já importado
  }

  // Criar treino
  const completedWorkout = await prisma.completedWorkout.create({
    data: {
      athleteId: profileId,
      source: 'strava',
      stravaActivityId: activity.id.toString(),
      date: new Date(activity.start_date),
      type,
      distance: activity.distance ? activity.distance / 1000 : null,
      duration: activity.moving_time ? Math.round(activity.moving_time / 60) : null,
      pace,
      elevation: activity.total_elevation_gain,
      avgHeartRate: activity.average_heartrate,
      maxHeartRate: activity.max_heartrate,
      calories: activity.calories
    }
  });

  // NOVO: Vincular automaticamente ao treino planejado, se houver
  await linkToPlannedWorkout(completedWorkout, profileId);

  return completedWorkout;
}

// Nova função: Vincular atividade do Strava ao treino planejado
async function linkToPlannedWorkout(completedWorkout: any, profileId: number) {
  try {
    // Buscar o plano ativo do atleta
    const profile = await prisma.athleteProfile.findUnique({
      where: { id: profileId },
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

    if (!profile?.customPlan || !profile.customPlan.isActive) {
      return; // Sem plano ativo
    }

    // Buscar treino planejado para o mesmo dia
    const workoutDate = new Date(completedWorkout.date);
    workoutDate.setHours(0, 0, 0, 0);

    const plannedWorkout = await prisma.customWorkout.findFirst({
      where: {
        weekId: {
          in: profile.customPlan.weeks.map(w => w.id)
        },
        date: {
          gte: workoutDate,
          lt: new Date(workoutDate.getTime() + 24 * 60 * 60 * 1000)
        },
        type: completedWorkout.type,
        isCompleted: false
      },
      include: {
        week: true
      }
    });

    if (plannedWorkout) {
      // Vincular e marcar como completo
      await prisma.customWorkout.update({
        where: { id: plannedWorkout.id },
        data: {
          isCompleted: true,
          completedWorkoutId: completedWorkout.id
        }
      });

      // Atualizar contagem da semana
      await prisma.customWeek.update({
        where: { id: plannedWorkout.weekId },
        data: {
          completedWorkouts: {
            increment: 1
          }
        }
      });

      // Recalcular taxa de conclusão do plano
      const plan = await prisma.customTrainingPlan.findUnique({
        where: { id: profile.customPlan.id },
        include: {
          weeks: {
            include: {
              workouts: true
            }
          }
        }
      });

      if (plan) {
        const totalWorkouts = plan.weeks.reduce((sum, week) => sum + week.totalWorkouts, 0);
        const completedWorkoutsCount = plan.weeks.reduce((sum, week) => sum + week.completedWorkouts, 0);
        const completionRate = totalWorkouts > 0 ? (completedWorkoutsCount / totalWorkouts) * 100 : 0;

        await prisma.customTrainingPlan.update({
          where: { id: plan.id },
          data: {
            completionRate
          }
        });
      }

      console.log(`✅ Treino planejado ${plannedWorkout.id} vinculado à atividade Strava ${completedWorkout.stravaActivityId}`);
    }
  } catch (error) {
    console.error('Erro ao vincular treino planejado:', error);
    // Não lançar erro para não quebrar a importação
  }
}
