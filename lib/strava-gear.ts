/**
 * STRAVA GEAR SERVICE - v2.6.0
 * Serviço para importar e gerenciar equipamentos do Strava
 * PREMIUM ONLY
 */

import { prisma } from './db';
import { refreshStravaToken } from './strava';

interface StravaGear {
  id: string;
  name: string;
  brand_name?: string;
  model_name?: string;
  description?: string;
  primary: boolean;
  distance: number; // em metros
  resource_state: number;
}

interface StravaAthlete {
  id: number;
  shoes?: StravaGear[];
  bikes?: StravaGear[];
}

/**
 * Buscar equipamentos do atleta no Strava
 */
async function fetchStravaGear(accessToken: string): Promise<{ shoes: StravaGear[], bikes: StravaGear[] }> {
  // Buscar dados do atleta que incluem equipamentos
  const response = await fetch('https://www.strava.com/api/v3/athlete', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar dados do atleta');
  }

  const athlete: StravaAthlete = await response.json();

  return {
    shoes: athlete.shoes || [],
    bikes: athlete.bikes || []
  };
}

/**
 * Buscar detalhes de um equipamento específico
 */
async function fetchGearDetails(gearId: string, accessToken: string): Promise<any> {
  const response = await fetch(`https://www.strava.com/api/v3/gear/${gearId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    return null; // Alguns equipamentos podem não ter detalhes
  }

  return response.json();
}

/**
 * Importar equipamentos do Strava
 * PREMIUM ONLY
 */
export async function importStravaGear(
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

  // Buscar equipamentos
  const { shoes, bikes } = await fetchStravaGear(accessToken);

  // Processar tênis
  for (const shoe of shoes) {
    // Buscar detalhes adicionais
    const details = await fetchGearDetails(shoe.id, accessToken);
    
    await prisma.stravaGear.upsert({
      where: { gearId: shoe.id },
      create: {
        userId,
        athleteId,
        gearId: shoe.id,
        name: shoe.name,
        brand: shoe.brand_name || null,
        model: shoe.model_name || null,
        description: details?.description || shoe.description || null,
        type: 'shoe',
        primary: shoe.primary,
        distance: shoe.distance / 1000, // converter para km
        activityCount: details?.activity_count || 0,
        convertedDistance: details?.converted_distance || null,
        notificationDistance: details?.notification_distance || null
      },
      update: {
        name: shoe.name,
        brand: shoe.brand_name || null,
        model: shoe.model_name || null,
        description: details?.description || shoe.description || null,
        primary: shoe.primary,
        distance: shoe.distance / 1000,
        activityCount: details?.activity_count || 0,
        convertedDistance: details?.converted_distance || null,
        notificationDistance: details?.notification_distance || null,
        updatedAt: new Date()
      }
    });
  }

  // Processar bikes
  for (const bike of bikes) {
    const details = await fetchGearDetails(bike.id, accessToken);
    
    await prisma.stravaGear.upsert({
      where: { gearId: bike.id },
      create: {
        userId,
        athleteId,
        gearId: bike.id,
        name: bike.name,
        brand: bike.brand_name || null,
        model: bike.model_name || null,
        description: details?.description || bike.description || null,
        type: 'bike',
        primary: bike.primary,
        distance: bike.distance / 1000,
        activityCount: details?.activity_count || 0,
        convertedDistance: details?.converted_distance || null,
        notificationDistance: details?.notification_distance || null
      },
      update: {
        name: bike.name,
        brand: bike.brand_name || null,
        model: bike.model_name || null,
        description: details?.description || bike.description || null,
        primary: bike.primary,
        distance: bike.distance / 1000,
        activityCount: details?.activity_count || 0,
        convertedDistance: details?.converted_distance || null,
        notificationDistance: details?.notification_distance || null,
        updatedAt: new Date()
      }
    });
  }
}

/**
 * Obter equipamentos salvos
 */
export async function getStravaGear(userId: string, type?: 'shoe' | 'bike') {
  return prisma.stravaGear.findMany({
    where: {
      userId,
      ...(type && { type }),
      isRetired: false
    },
    orderBy: [
      { primary: 'desc' },
      { distance: 'desc' }
    ]
  });
}

/**
 * Obter equipamento específico
 */
export async function getStravaGearById(gearId: string) {
  return prisma.stravaGear.findUnique({
    where: { gearId }
  });
}

/**
 * Marcar equipamento como aposentado
 */
export async function retireGear(gearId: string): Promise<void> {
  await prisma.stravaGear.update({
    where: { gearId },
    data: {
      isRetired: true,
      retiredDate: new Date()
    }
  });
}
