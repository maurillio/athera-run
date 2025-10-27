
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
  return prisma.completedWorkout.create({
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
}
