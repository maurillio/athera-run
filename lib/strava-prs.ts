/**
 * STRAVA PERSONAL RECORDS SERVICE - v2.6.0
 * Serviço para importar e gerenciar recordes pessoais do Strava
 * PREMIUM ONLY
 */

import { prisma } from './db';
import { refreshStravaToken } from './strava';
import { calculatePace } from './strava';

interface StravaEffort {
  distance: number;
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  activity: {
    id: number;
  };
  pr_rank?: number;
}

interface StravaBestEffort {
  name: string;
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  distance: number;
  activity_id?: number;
  pr_rank?: number;
}

const PR_DISTANCES = {
  '400m': 400,
  '1k': 1000,
  '1mile': 1609,
  '5k': 5000,
  '10k': 10000,
  'half_marathon': 21097,
  'marathon': 42195
};

/**
 * Buscar best efforts de uma atividade
 */
async function fetchActivityBestEfforts(activityId: number, accessToken: string): Promise<StravaBestEffort[]> {
  const response = await fetch(
    `https://www.strava.com/api/v3/activities/${activityId}?include_all_efforts=true`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );

  if (!response.ok) {
    throw new Error('Erro ao buscar best efforts da atividade');
  }

  const activity = await response.json();
  return activity.best_efforts || [];
}

/**
 * Analisar atividades e extrair PRs
 */
async function extractPRsFromActivities(accessToken: string, athleteId: string): Promise<any[]> {
  const prs: any[] = [];
  
  // Buscar atividades recentes (últimos 200 runs)
  let page = 1;
  let hasMore = true;
  
  while (hasMore && page <= 10) { // Limitar a 10 páginas (200 atividades)
    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=20`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );

    if (!response.ok) break;

    const activities = await response.json();
    
    if (activities.length === 0) {
      hasMore = false;
      break;
    }

    for (const activity of activities) {
      // Só processar corridas
      if (!['Run', 'TrailRun', 'VirtualRun'].includes(activity.type)) continue;

      // Verificar se tem best efforts
      if (activity.best_efforts && activity.best_efforts.length > 0) {
        for (const effort of activity.best_efforts) {
          // Mapear para nossos PR types
          let prType = null;
          const effortName = effort.name.toLowerCase();
          
          if (effortName.includes('400m')) prType = '400m';
          else if (effortName.includes('1k') || effortName.includes('1 km')) prType = '1k';
          else if (effortName.includes('1 mile')) prType = '1mile';
          else if (effortName.includes('5k') || effortName.includes('5 km')) prType = '5k';
          else if (effortName.includes('10k') || effortName.includes('10 km')) prType = '10k';
          else if (effortName.includes('half') || effortName.includes('21k')) prType = 'half_marathon';
          else if (effortName.includes('marathon') || effortName.includes('42k')) prType = 'marathon';

          if (prType && effort.pr_rank === 1) { // Rank 1 = PR
            prs.push({
              type: prType,
              distance: effort.distance,
              time: effort.elapsed_time,
              pace: calculatePace(effort.distance, effort.moving_time),
              activityId: activity.id.toString(),
              activityDate: new Date(effort.start_date),
              athleteId
            });
          }
        }
      }
      
      // Verificar também distância total da atividade
      if (activity.distance && activity.moving_time) {
        for (const [prType, distance] of Object.entries(PR_DISTANCES)) {
          // Se a atividade tem a distância exata (±100m)
          if (Math.abs(activity.distance - distance) <= 100) {
            prs.push({
              type: prType,
              distance: activity.distance,
              time: activity.moving_time,
              pace: calculatePace(activity.distance, activity.moving_time),
              activityId: activity.id.toString(),
              activityDate: new Date(activity.start_date),
              athleteId
            });
          }
        }
      }
    }

    page++;
  }

  // Manter apenas o melhor tempo para cada tipo
  const bestPRs = new Map();
  for (const pr of prs) {
    const existing = bestPRs.get(pr.type);
    if (!existing || pr.time < existing.time) {
      bestPRs.set(pr.type, pr);
    }
  }

  return Array.from(bestPRs.values());
}

/**
 * Importar PRs do Strava
 * PREMIUM ONLY
 */
export async function importStravaPRs(
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

  const athleteId = profile.stravaAthleteId;

  // Extrair PRs das atividades
  const prs = await extractPRsFromActivities(accessToken, athleteId);

  // Salvar PRs no banco
  for (const pr of prs) {
    await prisma.stravaPersonalRecord.upsert({
      where: {
        userId_type: {
          userId,
          type: pr.type
        }
      },
      create: {
        userId,
        athleteId,
        ...pr
      },
      update: {
        time: pr.time,
        pace: pr.pace,
        activityId: pr.activityId,
        activityDate: pr.activityDate
      }
    });
  }
}

/**
 * Obter PRs salvos
 */
export async function getStravaPRs(userId: string) {
  return prisma.stravaPersonalRecord.findMany({
    where: { userId },
    orderBy: { distance: 'asc' }
  });
}

/**
 * Obter PR específico
 */
export async function getStravaPR(userId: string, type: string) {
  return prisma.stravaPersonalRecord.findUnique({
    where: {
      userId_type: { userId, type }
    }
  });
}
