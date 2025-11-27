/**
 * STRAVA WEBHOOK HANDLER - v3.2.0
 * Sistema completo de processamento de eventos do Strava
 */

import { prisma } from './db';
import { refreshStravaToken } from './strava';
import { detectRaceActivity } from './strava-race-detector';
import { analyzeActivityImpact } from './strava-impact-analyzer';
import { triggerAutoAdjustIfEnabled } from './auto-adjust-service';

interface StravaWebhookEvent {
  aspect_type: 'create' | 'update' | 'delete';
  event_time: number;
  object_id: number;
  object_type: 'activity' | 'athlete';
  owner_id: number;
  subscription_id: number;
  updates?: {
    title?: string;
    type?: string;
    private?: string;
  };
}

interface StravaActivity {
  id: number;
  name: string;
  type: string;
  sport_type?: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  start_date: string;
  start_date_local: string;
  timezone: string;
  average_speed?: number;
  max_speed?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  has_heartrate?: boolean;
  average_temp?: number;
  kudos_count?: number;
  comment_count?: number;
  gear_id?: string;
  calories?: number;
  description?: string;
  device_name?: string;
  manual?: boolean;
  trainer?: boolean;
  commute?: boolean;
  private?: boolean;
  flagged?: boolean;
  start_latlng?: [number, number];
  end_latlng?: [number, number];
  location_city?: string;
  location_state?: string;
  location_country?: string;
  elev_high?: number;
  elev_low?: number;
}

/**
 * FASE 1: Processar evento de webhook do Strava
 */
export async function processStravaWebhook(event: StravaWebhookEvent) {
  console.log('🎣 Webhook recebido:', event);

  // Ignorar eventos que não sejam de atividades
  if (event.object_type !== 'activity') {
    return { success: true, message: 'Evento ignorado (não é atividade)' };
  }

  // Buscar perfil do atleta
  const profile = await prisma.athleteProfile.findFirst({
    where: { stravaAthleteId: event.owner_id.toString() },
    include: {
      user: {
        select: {
          id: true,
          isPremium: true
        }
      }
    }
  });

  if (!profile) {
    console.log('⚠️ Perfil não encontrado para athlete_id:', event.owner_id);
    return { success: true, message: 'Perfil não encontrado' };
  }

  try {
    switch (event.aspect_type) {
      case 'create':
        return await handleActivityCreate(profile, event.object_id);
      
      case 'update':
        return await handleActivityUpdate(profile, event.object_id, event.updates);
      
      case 'delete':
        return await handleActivityDelete(profile, event.object_id);
      
      default:
        return { success: true, message: 'Tipo de evento não suportado' };
    }
  } catch (error: any) {
    console.error('❌ Erro ao processar webhook:', error);
    throw error;
  }
}

/**
 * Processar criação de nova atividade
 */
async function handleActivityCreate(profile: any, activityId: number) {
  console.log('➕ Processando nova atividade:', activityId);

  // Renovar token se necessário
  const accessToken = await refreshStravaToken(profile.id);

  // Buscar detalhes completos da atividade
  const activity = await fetchStravaActivityDetails(accessToken, activityId);

  if (!activity) {
    throw new Error('Não foi possível buscar detalhes da atividade');
  }

  // FASE 2: Detectar se é corrida-alvo (prova)
  const isRace = await detectRaceActivity(activity, profile.id);

  // Importar atividade como CompletedWorkout
  const completedWorkout = await importActivityAsWorkout(activity, profile.id);

  // ✅ VINCULAR ao CustomWorkout do plano (se houver)
  await linkCompletedWorkoutToCustomWorkout(completedWorkout, profile.id);

  // Importar para histórico completo de atividades Strava
  await importStravaActivityFull(activity, profile.user.id, profile.stravaAthleteId);

  // FASE 4: Analisar impacto no plano (apenas Premium)
  if (profile.user.isPremium) {
    const impact = await analyzeActivityImpact(activity, profile.id, isRace);
    console.log('📊 Impacto da atividade:', impact);

    // FASE 5: Auto-ajuste se necessário
    if (impact.requiresAdjustment && profile.autoAdjustEnabled) {
      await triggerAutoAdjustIfEnabled(profile.id);
    }
  }

  return {
    success: true,
    message: 'Atividade importada com sucesso',
    data: {
      workoutId: completedWorkout.id,
      isRace,
      requiresAttention: isRace
    }
  };
}

/**
 * Processar atualização de atividade
 */
async function handleActivityUpdate(profile: any, activityId: number, updates: any) {
  console.log('✏️ Processando atualização de atividade:', activityId, updates);

  // Buscar workout existente
  const workout = await prisma.completedWorkout.findFirst({
    where: {
      athleteId: profile.id,
      stravaActivityId: activityId.toString()
    }
  });

  if (!workout) {
    // Se não existe, processar como criação
    return await handleActivityCreate(profile, activityId);
  }

  // Renovar token e buscar dados atualizados
  const accessToken = await refreshStravaToken(profile.id);
  const activity = await fetchStravaActivityDetails(accessToken, activityId);

  if (!activity) {
    throw new Error('Não foi possível buscar detalhes da atividade');
  }

  // Atualizar CompletedWorkout
  await prisma.completedWorkout.update({
    where: { id: workout.id },
    data: {
      distance: activity.distance / 1000,
      duration: activity.moving_time,
      pace: calculatePace(activity.distance, activity.moving_time),
      elevation: activity.total_elevation_gain,
      avgHeartRate: activity.average_heartrate ? Math.round(activity.average_heartrate) : null,
      maxHeartRate: activity.max_heartrate || null,
      calories: activity.calories || null,
      notes: activity.description || null,
      updatedAt: new Date()
    }
  });

  // Atualizar StravaActivity
  await prisma.stravaActivity.updateMany({
    where: {
      userId: profile.user.id,
      activityId: activityId.toString()
    },
    data: {
      name: activity.name,
      distance: activity.distance,
      movingTime: activity.moving_time,
      elapsedTime: activity.elapsed_time,
      totalElevationGain: activity.total_elevation_gain,
      averageHeartRate: activity.average_heartrate || null,
      maxHeartRate: activity.max_heartrate || null,
      description: activity.description || null,
      private: activity.private || false,
      updatedAt: new Date()
    }
  });

  return {
    success: true,
    message: 'Atividade atualizada com sucesso'
  };
}

/**
 * Processar exclusão de atividade
 */
async function handleActivityDelete(profile: any, activityId: number) {
  console.log('🗑️ Processando exclusão de atividade:', activityId);

  // Deletar CompletedWorkout
  const deleted = await prisma.completedWorkout.deleteMany({
    where: {
      athleteId: profile.id,
      stravaActivityId: activityId.toString()
    }
  });

  // Deletar StravaActivity
  await prisma.stravaActivity.deleteMany({
    where: {
      userId: profile.user.id,
      activityId: activityId.toString()
    }
  });

  return {
    success: true,
    message: `${deleted.count} atividade(s) deletada(s)`,
    data: { deletedCount: deleted.count }
  };
}

/**
 * Buscar detalhes completos de uma atividade do Strava
 */
async function fetchStravaActivityDetails(
  accessToken: string,
  activityId: number
): Promise<StravaActivity | null> {
  try {
    const response = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    if (!response.ok) {
      console.error('Erro ao buscar atividade:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar atividade:', error);
    return null;
  }
}

/**
 * Importar atividade como CompletedWorkout
 */
async function importActivityAsWorkout(activity: StravaActivity, athleteId: number) {
  const pace = calculatePace(activity.distance, activity.moving_time);
  const type = mapStravaActivityType(activity.type);

  return await prisma.completedWorkout.create({
    data: {
      athleteId,
      stravaActivityId: activity.id.toString(),
      source: 'strava',
      date: new Date(activity.start_date),
      type,
      subtype: activity.sport_type || null,
      distance: activity.distance / 1000,
      duration: activity.moving_time,
      pace,
      elevation: activity.total_elevation_gain,
      avgHeartRate: activity.average_heartrate ? Math.round(activity.average_heartrate) : null,
      maxHeartRate: activity.max_heartrate || null,
      calories: activity.calories || null,
      notes: activity.description || null
    }
  });
}

/**
 * Importar atividade completa para histórico do Strava
 */
async function importStravaActivityFull(
  activity: StravaActivity,
  userId: string,
  athleteId: string
) {
  const avgPace = calculatePace(activity.distance, activity.moving_time);

  await prisma.stravaActivity.upsert({
    where: { activityId: activity.id.toString() },
    update: {
      name: activity.name,
      type: activity.type,
      sportType: activity.sport_type || null,
      distance: activity.distance,
      movingTime: activity.moving_time,
      elapsedTime: activity.elapsed_time,
      averageSpeed: activity.average_speed || null,
      maxSpeed: activity.max_speed || null,
      averagePace: avgPace,
      averageHeartRate: activity.average_heartrate || null,
      maxHeartRate: activity.max_heartrate || null,
      hasHeartRate: activity.has_heartrate || false,
      totalElevationGain: activity.total_elevation_gain,
      elevHigh: activity.elev_high || null,
      elevLow: activity.elev_low || null,
      averageTemp: activity.average_temp || null,
      kudosCount: activity.kudos_count || 0,
      commentCount: activity.comment_count || 0,
      gearId: activity.gear_id || null,
      startLatLng: activity.start_latlng || null,
      endLatLng: activity.end_latlng || null,
      locationCity: activity.location_city || null,
      locationState: activity.location_state || null,
      locationCountry: activity.location_country || null,
      startDate: new Date(activity.start_date),
      startDateLocal: new Date(activity.start_date_local),
      timezone: activity.timezone || null,
      manual: activity.manual || false,
      trainer: activity.trainer || false,
      commute: activity.commute || false,
      private: activity.private || false,
      flagged: activity.flagged || false,
      description: activity.description || null,
      calories: activity.calories || null,
      deviceName: activity.device_name || null,
      updatedAt: new Date()
    },
    create: {
      userId,
      athleteId,
      activityId: activity.id.toString(),
      name: activity.name,
      type: activity.type,
      sportType: activity.sport_type || null,
      distance: activity.distance,
      movingTime: activity.moving_time,
      elapsedTime: activity.elapsed_time,
      averageSpeed: activity.average_speed || null,
      maxSpeed: activity.max_speed || null,
      averagePace: avgPace,
      averageHeartRate: activity.average_heartrate || null,
      maxHeartRate: activity.max_heartrate || null,
      hasHeartRate: activity.has_heartrate || false,
      totalElevationGain: activity.total_elevation_gain,
      elevHigh: activity.elev_high || null,
      elevLow: activity.elev_low || null,
      averageTemp: activity.average_temp || null,
      kudosCount: activity.kudos_count || 0,
      commentCount: activity.comment_count || 0,
      gearId: activity.gear_id || null,
      startLatLng: activity.start_latlng || null,
      endLatLng: activity.end_latlng || null,
      locationCity: activity.location_city || null,
      locationState: activity.location_state || null,
      locationCountry: activity.location_country || null,
      startDate: new Date(activity.start_date),
      startDateLocal: new Date(activity.start_date_local),
      timezone: activity.timezone || null,
      manual: activity.manual || false,
      trainer: activity.trainer || false,
      commute: activity.commute || false,
      private: activity.private || false,
      flagged: activity.flagged || false,
      description: activity.description || null,
      calories: activity.calories || null,
      deviceName: activity.device_name || null
    }
  });
}

/**
 * Mapear tipo de atividade do Strava
 */
function mapStravaActivityType(stravaType: string): string {
  const typeMap: { [key: string]: string } = {
    'Run': 'running',
    'TrailRun': 'running',
    'VirtualRun': 'running',
    'WeightTraining': 'strength',
    'Workout': 'strength',
    'Crossfit': 'strength',
    'Swim': 'swimming',
    'Walk': 'running',
    'Hike': 'running',
    'Ride': 'cycling',
    'VirtualRide': 'cycling'
  };

  return typeMap[stravaType] || 'running';
}

/**
 * Calcular pace em formato "X:XX/km"
 */
function calculatePace(distanceMeters: number, durationSeconds: number): string | null {
  if (!distanceMeters || !durationSeconds || distanceMeters === 0) return null;

  const distanceKm = distanceMeters / 1000;
  const durationMin = durationSeconds / 60;
  const paceMinutes = durationMin / distanceKm;

  const paceMin = Math.floor(paceMinutes);
  const paceSec = Math.round((paceMinutes - paceMin) * 60);

  return `${paceMin}:${paceSec.toString().padStart(2, '0')}/km`;
}

/**
 * Vincular CompletedWorkout ao CustomWorkout correspondente do plano
 */
async function linkCompletedWorkoutToCustomWorkout(
  completedWorkout: any,
  athleteId: number
) {
  try {
    const workoutDate = new Date(completedWorkout.date);
    workoutDate.setHours(0, 0, 0, 0);

    // Buscar CustomWorkout do mesmo dia e tipo
    const customWorkout = await prisma.customWorkout.findFirst({
      where: {
        week: {
          plan: {
            athleteId
          }
        },
        date: {
          gte: workoutDate,
          lt: new Date(workoutDate.getTime() + 24 * 60 * 60 * 1000)
        },
        type: completedWorkout.type,
        isCompleted: false
      }
    });

    if (customWorkout) {
      console.log(`✅ Vinculando CompletedWorkout ${completedWorkout.id} ao CustomWorkout ${customWorkout.id}`);
      
      await prisma.customWorkout.update({
        where: { id: customWorkout.id },
        data: {
          isCompleted: true,
          completedWorkoutId: completedWorkout.id
        }
      });
    } else {
      console.log(`ℹ️ Nenhum CustomWorkout encontrado para vincular (tipo: ${completedWorkout.type}, data: ${workoutDate.toISOString()})`);
    }
  } catch (error) {
    console.error('❌ Erro ao vincular CompletedWorkout ao CustomWorkout:', error);
    // Não falhar a importação se o vínculo falhar
  }
}
