/**
 * STRAVA RACE DETECTOR - v3.2.0
 * FASE 2: Detecção inteligente de corridas-alvo
 * 
 * Identifica automaticamente quando uma atividade do Strava
 * é uma prova e sugere vinculação com RaceGoal
 */

import { prisma } from './db';

interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  start_date: string;
  workout_type?: number;
  location_city?: string;
  location_country?: string;
  kudos_count?: number;
  description?: string;
}

interface RaceDetectionResult {
  isRace: boolean;
  confidence: number; // 0-100
  reasons: string[];
  suggestedRaceGoal?: {
    id: number;
    raceName: string;
    distance: string;
    raceDate: Date;
  };
  suggestedClassification?: 'A' | 'B' | 'C';
  shouldCreateRaceGoal: boolean;
  metadata: {
    distanceKm: number;
    paceMinKm: number;
    officialRaceIndicators: number;
  };
}

/**
 * Detectar se uma atividade do Strava é uma corrida-alvo (prova)
 */
export async function detectRaceActivity(
  activity: StravaActivity,
  athleteId: number
): Promise<RaceDetectionResult> {
  const reasons: string[] = [];
  let confidence = 0;
  const distanceKm = activity.distance / 1000;
  const paceMinKm = (activity.moving_time / 60) / distanceKm;

  // ========================================
  // INDICADORES DE PROVA OFICIAL
  // ========================================

  // 1. Nome da atividade contém palavras-chave de prova
  const raceKeywords = [
    // Português
    'prova', 'corrida', 'maratona', 'meia', 'half', 'desafio', 
    'circuito', 'copa', 'campeonato', 'troféu', 'festival',
    'corrida de rua', 'trail', 'ultra',
    // Inglês
    'race', 'marathon', 'run', 'challenge', 'championship', 
    'cup', 'circuit', 'trophy',
    // Espanhol
    'carrera', 'maraton', 'competición',
    // Distâncias comuns em provas
    '5k', '10k', '15k', '21k', '42k', '42.195', '21.097'
  ];

  const nameMatch = raceKeywords.some(keyword => 
    activity.name.toLowerCase().includes(keyword)
  );

  if (nameMatch) {
    confidence += 35;
    reasons.push('Nome contém palavras-chave de prova');
  }

  // 2. Distância exata de prova oficial
  const officialDistances = [
    { km: 5, tolerance: 0.2, label: '5km' },
    { km: 10, tolerance: 0.3, label: '10km' },
    { km: 15, tolerance: 0.3, label: '15km' },
    { km: 21.097, tolerance: 0.3, label: 'Meia Maratona' },
    { km: 42.195, tolerance: 0.5, label: 'Maratona' },
    { km: 50, tolerance: 1, label: '50km' },
    { km: 100, tolerance: 2, label: '100km' }
  ];

  const officialDistance = officialDistances.find(
    d => Math.abs(distanceKm - d.km) <= d.tolerance
  );

  if (officialDistance) {
    confidence += 25;
    reasons.push(`Distância próxima de prova oficial (${officialDistance.label})`);
  }

  // 3. Pace significativamente mais rápido que usual
  const avgPace = await getAthleteAveragePace(athleteId);
  if (avgPace && paceMinKm < avgPace * 0.92) { // 8% mais rápido
    confidence += 15;
    reasons.push('Pace mais rápido que a média do atleta');
  }

  // 4. Atividade marcada como "Race" no Strava (workout_type = 1)
  if (activity.workout_type === 1) {
    confidence += 25;
    reasons.push('Marcada como "Race" no Strava');
  }

  // 5. Localização em cidade diferente (viagem para prova)
  const profile = await prisma.athleteProfile.findUnique({
    where: { id: athleteId }
  });

  if (activity.location_city && profile) {
    // Aqui poderíamos verificar se é cidade diferente da usual
    // Por ora, apenas indicamos que tem localização
    if (activity.location_city) {
      confidence += 5;
      reasons.push('Atividade com localização especificada');
    }
  }

  // 6. Muitos kudos (indica atividade especial)
  if (activity.kudos_count && activity.kudos_count >= 10) {
    confidence += 10;
    reasons.push('Alto número de kudos (atividade especial)');
  }

  // 7. Descrição menciona prova
  if (activity.description) {
    const descriptionMatch = raceKeywords.some(keyword =>
      activity.description!.toLowerCase().includes(keyword)
    );
    if (descriptionMatch) {
      confidence += 10;
      reasons.push('Descrição menciona prova');
    }
  }

  // 8. Elapsed time muito maior que moving time (tempo parado = largada)
  const timeRatio = activity.elapsed_time / activity.moving_time;
  if (timeRatio > 1.05) {
    confidence += 10;
    reasons.push('Tempo parado indica largada de prova');
  }

  // ========================================
  // ANÁLISE E CLASSIFICAÇÃO
  // ========================================

  const isRace = confidence >= 50;

  // Buscar RaceGoal compatível
  let suggestedRaceGoal;
  let shouldCreateRaceGoal = false;

  if (isRace) {
    const activityDate = new Date(activity.start_date);
    
    // Buscar RaceGoal próxima (+/- 3 dias)
    const raceGoals = await prisma.raceGoal.findMany({
      where: {
        athleteId,
        status: 'active',
        raceDate: {
          gte: new Date(activityDate.getTime() - 3 * 24 * 60 * 60 * 1000),
          lte: new Date(activityDate.getTime() + 3 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { priority: 'asc' }
    });

    // Encontrar RaceGoal com distância compatível
    if (officialDistance) {
      suggestedRaceGoal = raceGoals.find(goal => {
        const goalDistance = parseGoalDistance(goal.distance);
        return goalDistance && Math.abs(goalDistance - distanceKm) <= 1;
      });

      if (suggestedRaceGoal) {
        reasons.push(`Prova encontrada: ${suggestedRaceGoal.raceName}`);
        
        // Atualizar RaceGoal com resultado
        await updateRaceGoalResult(
          suggestedRaceGoal.id,
          activity.moving_time,
          activityDate
        );
      } else {
        // Sugerir criação de RaceGoal
        shouldCreateRaceGoal = true;
        reasons.push('Sugerido criar nova meta de corrida para esta prova');
      }
    }
  }

  // Sugerir classificação (A, B ou C)
  let suggestedClassification: 'A' | 'B' | 'C' | undefined;
  if (isRace) {
    if (officialDistance && 
        (officialDistance.km === 21.097 || officialDistance.km === 42.195)) {
      suggestedClassification = 'A'; // Meia ou maratona = A
    } else if (confidence >= 70) {
      suggestedClassification = 'B'; // Alta confiança = B
    } else {
      suggestedClassification = 'C'; // Confiança moderada = C
    }
  }

  return {
    isRace,
    confidence,
    reasons,
    suggestedRaceGoal: suggestedRaceGoal ? {
      id: suggestedRaceGoal.id,
      raceName: suggestedRaceGoal.raceName,
      distance: suggestedRaceGoal.distance,
      raceDate: suggestedRaceGoal.raceDate
    } : undefined,
    suggestedClassification,
    shouldCreateRaceGoal,
    metadata: {
      distanceKm,
      paceMinKm,
      officialRaceIndicators: Math.floor(confidence / 10)
    }
  };
}

/**
 * Buscar pace médio do atleta (últimas 10 corridas)
 */
async function getAthleteAveragePace(athleteId: number): Promise<number | null> {
  const recentRuns = await prisma.completedWorkout.findMany({
    where: {
      athleteId,
      type: 'running',
      distance: { gte: 5 } // Pelo menos 5km
    },
    orderBy: { date: 'desc' },
    take: 10,
    select: {
      distance: true,
      duration: true
    }
  });

  if (recentRuns.length === 0) return null;

  const totalPace = recentRuns.reduce((sum, run) => {
    const paceMinKm = (run.duration! / 60) / run.distance!;
    return sum + paceMinKm;
  }, 0);

  return totalPace / recentRuns.length;
}

/**
 * Parsear distância da meta (string -> km)
 */
function parseGoalDistance(distance: string): number | null {
  const distanceMap: { [key: string]: number } = {
    '5k': 5,
    '10k': 10,
    '15k': 15,
    '21k': 21.097,
    'half': 21.097,
    'meia': 21.097,
    '42k': 42.195,
    'marathon': 42.195,
    'maratona': 42.195,
    '50k': 50,
    '100k': 100
  };

  const normalized = distance.toLowerCase().trim();
  return distanceMap[normalized] || null;
}

/**
 * Atualizar RaceGoal com resultado da prova
 */
async function updateRaceGoalResult(
  raceGoalId: number,
  timeSeconds: number,
  raceDate: Date
) {
  const hours = Math.floor(timeSeconds / 3600);
  const minutes = Math.floor((timeSeconds % 3600) / 60);
  const seconds = timeSeconds % 60;
  
  const actualTime = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  await prisma.raceGoal.update({
    where: { id: raceGoalId },
    data: {
      actualTime,
      status: 'completed',
      raceDate, // Atualizar com data real
      updatedAt: new Date()
    }
  });

  console.log(`✅ RaceGoal ${raceGoalId} atualizado com resultado: ${actualTime}`);
}

/**
 * Criar notificação para o atleta sobre prova detectada
 */
export async function notifyRaceDetected(
  userId: string,
  detection: RaceDetectionResult
) {
  // TODO: Implementar sistema de notificações
  // Por enquanto, apenas log
  console.log(`🏁 Prova detectada para usuário ${userId}:`, {
    confidence: detection.confidence,
    reasons: detection.reasons,
    shouldCreate: detection.shouldCreateRaceGoal
  });
}
