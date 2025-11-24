/**
 * STRAVA TRAINING ZONES SERVICE
 * Importa zonas de treino (FC e pace) do Strava
 * PREMIUM ONLY
 */

import { prisma } from './db';
import { refreshStravaToken } from './strava';

interface StravaHeartRateZones {
  custom_zones: boolean;
  zones: Array<{
    min: number;
    max: number;
  }>;
}

export interface StravaZonesData {
  heart_rate?: StravaHeartRateZones;
  power_zones?: any;
}

/**
 * Importar zonas de treino do Strava
 */
export async function importStravaZones(
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

  // Buscar dados do atleta (inclui zonas)
  const response = await fetch('https://www.strava.com/api/v3/athlete', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar dados do atleta');
  }

  const athlete = await response.json();

  // Extrair zonas de FC
  const heartRateZones = athlete.heart_rate_zones;
  
  // Extrair outros dados úteis do perfil
  const athleteData = {
    weight: athlete.weight || null,
    sex: athlete.sex || null,
    city: athlete.city || null,
    state: athlete.state || null,
    country: athlete.country || null,
    profile: athlete.profile || null,
    ftp: athlete.ftp || null,
    follower_count: athlete.follower_count || null,
    friend_count: athlete.friend_count || null,
    premium: athlete.premium || false,
    summit: athlete.summit || false,
  };

  // Salvar no perfil do atleta
  await prisma.athleteProfile.update({
    where: { id: profileId },
    data: {
      stravaZones: heartRateZones || null,
      stravaProfileData: athleteData
    }
  });
}

/**
 * Obter zonas salvas
 */
export async function getStravaZones(profileId: number) {
  const profile = await prisma.athleteProfile.findUnique({
    where: { id: profileId },
    select: {
      stravaZones: true,
      stravaProfileData: true
    }
  });

  return {
    zones: profile?.stravaZones || null,
    profileData: profile?.stravaProfileData || null
  };
}

/**
 * Calcular zonas de pace baseadas em PRs
 * Usa a fórmula de Jack Daniels (VDOT)
 */
export async function calculatePaceZones(userId: string) {
  // Buscar melhor PR (prioridade: 10k > 5k > half > marathon)
  const prs = await prisma.stravaPersonalRecord.findMany({
    where: { userId },
    orderBy: { distance: 'asc' }
  });

  if (prs.length === 0) {
    return null;
  }

  // Priorizar 10k para cálculo de VDOT
  const pr10k = prs.find(p => p.type === '10k');
  const basePR = pr10k || prs[0];

  // Calcular VDOT aproximado
  const distanceKm = basePR.distance / 1000;
  const timeMin = basePR.time / 60;
  const paceMin = timeMin / distanceKm;

  // Zonas de pace (simplificado)
  // Easy: +60-90s do PR pace
  // Threshold: PR pace
  // Interval: -30s do PR pace
  // Repetition: -60s do PR pace

  const prPaceSeconds = paceMin * 60;
  
  const zones = {
    easy: {
      min_pace: formatPace(prPaceSeconds + 60),
      max_pace: formatPace(prPaceSeconds + 90),
      description: 'Corrida fácil, conversação confortável'
    },
    aerobic: {
      min_pace: formatPace(prPaceSeconds + 30),
      max_pace: formatPace(prPaceSeconds + 60),
      description: 'Corrida aeróbica, ritmo moderado'
    },
    threshold: {
      min_pace: formatPace(prPaceSeconds - 10),
      max_pace: formatPace(prPaceSeconds + 10),
      description: 'Limiar anaeróbico, ritmo forte mas sustentável'
    },
    interval: {
      min_pace: formatPace(prPaceSeconds - 40),
      max_pace: formatPace(prPaceSeconds - 20),
      description: 'Intervalados, ritmo intenso'
    },
    repetition: {
      min_pace: formatPace(prPaceSeconds - 70),
      max_pace: formatPace(prPaceSeconds - 50),
      description: 'Tiros, máxima intensidade'
    },
    basedOnPR: basePR.type,
    basedOnTime: formatTime(basePR.time)
  };

  return zones;
}

function formatPace(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}/km`;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}
