/**
 * STRAVA STATS SERVICE - v2.6.0
 * Serviço para importar e gerenciar estatísticas do atleta do Strava
 * PREMIUM ONLY
 */

import { prisma } from './db';
import { refreshStravaToken } from './strava';

interface StravaStats {
  all_run_totals?: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
  };
  recent_run_totals?: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
  };
  ytd_run_totals?: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
  };
  all_ride_totals?: any;
  recent_ride_totals?: any;
  ytd_ride_totals?: any;
  all_swim_totals?: any;
  recent_swim_totals?: any;
  ytd_swim_totals?: any;
}

/**
 * Buscar estatísticas do atleta no Strava
 */
export async function fetchStravaStats(accessToken: string): Promise<StravaStats> {
  const response = await fetch('https://www.strava.com/api/v3/athletes/stats/{id}', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar estatísticas do Strava');
  }

  return response.json();
}

/**
 * Calcular médias a partir das estatísticas
 */
function calculateAverages(stats: StravaStats) {
  const runTotals = stats.all_run_totals;
  
  if (!runTotals || runTotals.count === 0) {
    return {
      avgDistance: null,
      avgPace: null,
      weeklyFrequency: null,
      monthlyFrequency: null
    };
  }

  const avgDistance = runTotals.distance / runTotals.count / 1000; // em km
  const avgPaceSeconds = runTotals.moving_time / (runTotals.distance / 1000); // segundos por km
  const paceMin = Math.floor(avgPaceSeconds / 60);
  const paceSec = Math.round(avgPaceSeconds % 60);
  const avgPace = `${paceMin}:${paceSec.toString().padStart(2, '0')}`;

  // Estimativa de frequência (últimas 4 semanas)
  const recentCount = stats.recent_run_totals?.count || 0;
  const weeklyFrequency = Math.round(recentCount / 4);
  const monthlyFrequency = recentCount;

  return {
    avgDistance,
    avgPace,
    weeklyFrequency,
    monthlyFrequency
  };
}

/**
 * Importar estatísticas do Strava para o banco
 * PREMIUM ONLY
 */
export async function importStravaStats(
  userId: string, 
  profileId: number
): Promise<void> {
  // Verificar premium
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true }
  });

  if (!user?.isPremium) {
    throw new Error('Recurso disponível apenas para usuários premium');
  }

  // Obter access token
  const accessToken = await refreshStravaToken(profileId);

  // Buscar profile para pegar athleteId
  const profile = await prisma.athleteProfile.findUnique({
    where: { id: profileId },
    select: { stravaAthleteId: true }
  });

  if (!profile?.stravaAthleteId) {
    throw new Error('Athlete ID do Strava não encontrado');
  }

  // Buscar stats do Strava (corrigir URL com athleteId real)
  const athleteResponse = await fetch('https://www.strava.com/api/v3/athlete', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  if (!athleteResponse.ok) {
    throw new Error('Erro ao buscar dados do atleta');
  }

  const athlete = await athleteResponse.json();
  const athleteId = athlete.id.toString();

  // Buscar stats
  const statsResponse = await fetch(`https://www.strava.com/api/v3/athletes/${athleteId}/stats`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!statsResponse.ok) {
    throw new Error('Erro ao buscar estatísticas');
  }

  const stats: StravaStats = await statsResponse.json();
  const averages = calculateAverages(stats);

  // Salvar ou atualizar no banco
  await prisma.stravaStats.upsert({
    where: { userId },
    create: {
      userId,
      athleteId,
      allRunsTotals: stats.all_run_totals || null,
      recentRunsTotals: stats.recent_run_totals || null,
      ytdRunsTotals: stats.ytd_run_totals || null,
      allRideTotals: stats.all_ride_totals || null,
      recentRideTotals: stats.recent_ride_totals || null,
      ytdRideTotals: stats.ytd_ride_totals || null,
      allSwimTotals: stats.all_swim_totals || null,
      recentSwimTotals: stats.recent_swim_totals || null,
      ytdSwimTotals: stats.ytd_swim_totals || null,
      avgDistance: averages.avgDistance,
      avgPace: averages.avgPace,
      weeklyFrequency: averages.weeklyFrequency,
      monthlyFrequency: averages.monthlyFrequency
    },
    update: {
      allRunsTotals: stats.all_run_totals || null,
      recentRunsTotals: stats.recent_run_totals || null,
      ytdRunsTotals: stats.ytd_run_totals || null,
      allRideTotals: stats.all_ride_totals || null,
      recentRideTotals: stats.recent_ride_totals || null,
      ytdRideTotals: stats.ytd_ride_totals || null,
      allSwimTotals: stats.all_swim_totals || null,
      recentSwimTotals: stats.recent_swim_totals || null,
      ytdSwimTotals: stats.ytd_swim_totals || null,
      avgDistance: averages.avgDistance,
      avgPace: averages.avgPace,
      weeklyFrequency: averages.weeklyFrequency,
      monthlyFrequency: averages.monthlyFrequency,
      syncedAt: new Date()
    }
  });
}

/**
 * Obter estatísticas salvas
 */
export async function getStravaStats(userId: string) {
  return prisma.stravaStats.findUnique({
    where: { userId }
  });
}
