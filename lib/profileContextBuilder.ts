/**
 * Profile Context Builder - v3.1.0
 * 
 * Constrói contexto completo do perfil do atleta para a IA
 * Rastreia TODOS os campos usados para transparência total
 */

import { AthleteProfile, RaceGoal } from '@prisma/client';

export interface ProfileContext {
  // Dados estruturados
  athlete: {
    basics: {
      age?: number;
      gender?: string;
      weight: number;
      height: number;
      runningLevel: string;
    };
    experience: {
      runningYears?: number;
      currentWeeklyKm?: number;
      longestRun?: number;
      hasRunBefore?: boolean;
      otherSportsExperience?: string;
      otherSportsYears?: number;
    };
    performance: {
      currentVDOT?: number;
      bestTimes?: any;
      usualPaces?: any;
      recentLongRunPace?: string;
    };
    health: {
      restingHeartRate?: number;
      sleepQuality?: number;
      stressLevel?: number;
      avgSleepHours?: number;
      currentlyInjured?: boolean;
      injuryDetails?: any;
      medicalConditions?: string;
      medications?: string;
      physicalRestrictions?: string;
    };
    lifecycle: {
      tracksMenstrualCycle?: boolean;
      avgCycleLength?: number;
      lastPeriodDate?: Date;
    };
    availability: {
      trainingSchedule?: any;
      longRunDay?: number;
      workDemand?: string;
      familyDemand?: string;
      hasGymAccess?: boolean;
      hasPoolAccess?: boolean;
      hasTrackAccess?: boolean;
    };
    goals: {
      primaryGoal?: string;
      motivation?: string;
      motivationFactors?: any;
      raceGoals?: Array<{
        raceName: string;
        distance: string;
        raceDate: Date;
        targetTime?: string;
        priority: number;
      }>;
    };
    preferences: {
      trainingPreferences?: any;
    };
  };

  // Tracking de campos usados
  aiGeneratedFields: {
    fieldsConsidered: string[];
    fieldsUsed: string[];
    fieldsIgnored: string[];
    missingFields: string[];
    timestamp: Date;
  };

  // Prompt formatado
  formattedPrompt: string;
}

/**
 * Constrói contexto completo do perfil com tracking de campos
 */
export function buildProfileContext(
  profile: AthleteProfile,
  raceGoals?: RaceGoal[]
): ProfileContext {
  const fieldsConsidered: string[] = [];
  const fieldsUsed: string[] = [];
  const fieldsIgnored: string[] = [];
  const missingFields: string[] = [];

  // Helper para rastrear campo
  const trackField = (fieldName: string, value: any) => {
    fieldsConsidered.push(fieldName);
    if (value !== null && value !== undefined && value !== '') {
      fieldsUsed.push(fieldName);
      return true;
    } else {
      missingFields.push(fieldName);
      return false;
    }
  };

  // Helper para rastrear campo mas não usar
  const trackIgnored = (fieldName: string) => {
    fieldsConsidered.push(fieldName);
    fieldsIgnored.push(fieldName);
  };

  // Construir contexto estruturado
  const context: ProfileContext = {
    athlete: {
      basics: {
        age: trackField('age', profile.age) ? profile.age! : undefined,
        gender: trackField('gender', profile.gender) ? profile.gender! : undefined,
        weight: profile.weight,
        height: profile.height,
        runningLevel: profile.runningLevel,
      },
      experience: {
        runningYears: trackField('runningYears', profile.runningYears) ? profile.runningYears! : undefined,
        currentWeeklyKm: trackField('currentWeeklyKm', profile.currentWeeklyKm) ? profile.currentWeeklyKm! : undefined,
        longestRun: trackField('longestRun', profile.longestRun) ? profile.longestRun! : undefined,
        hasRunBefore: trackField('hasRunBefore', profile.hasRunBefore) ? profile.hasRunBefore : undefined,
        otherSportsExperience: trackField('otherSportsExperience', profile.otherSportsExperience) ? profile.otherSportsExperience! : undefined,
        otherSportsYears: trackField('otherSportsYears', profile.otherSportsYears) ? profile.otherSportsYears! : undefined,
      },
      performance: {
        currentVDOT: trackField('currentVDOT', profile.currentVDOT) ? profile.currentVDOT! : undefined,
        bestTimes: trackField('bestTimes', profile.bestTimes) ? profile.bestTimes : undefined,
        usualPaces: trackField('usualPaces', profile.usualPaces) ? profile.usualPaces : undefined,
        recentLongRunPace: trackField('recentLongRunPace', profile.recentLongRunPace) ? profile.recentLongRunPace! : undefined,
      },
      health: {
        restingHeartRate: trackField('restingHeartRate', profile.restingHeartRate) ? profile.restingHeartRate! : undefined,
        sleepQuality: trackField('sleepQuality', profile.sleepQuality) ? profile.sleepQuality! : undefined,
        stressLevel: trackField('stressLevel', profile.stressLevel) ? profile.stressLevel! : undefined,
        avgSleepHours: trackField('avgSleepHours', profile.avgSleepHours) ? profile.avgSleepHours! : undefined,
        currentlyInjured: trackField('currentlyInjured', profile.currentlyInjured) ? profile.currentlyInjured : undefined,
        injuryDetails: trackField('injuryDetails', profile.injuryDetails) ? profile.injuryDetails : undefined,
        medicalConditions: trackField('medicalConditions', profile.medicalConditions) ? profile.medicalConditions! : undefined,
        medications: trackField('medications', profile.medications) ? profile.medications! : undefined,
        physicalRestrictions: trackField('physicalRestrictions', profile.physicalRestrictions) ? profile.physicalRestrictions! : undefined,
      },
      lifecycle: {
        tracksMenstrualCycle: trackField('tracksMenstrualCycle', profile.tracksMenstrualCycle) ? profile.tracksMenstrualCycle! : undefined,
        avgCycleLength: trackField('avgCycleLength', profile.avgCycleLength) ? profile.avgCycleLength! : undefined,
        lastPeriodDate: trackField('lastPeriodDate', profile.lastPeriodDate) ? profile.lastPeriodDate! : undefined,
      },
      availability: {
        trainingSchedule: trackField('trainingSchedule', profile.trainingSchedule) ? profile.trainingSchedule : undefined,
        longRunDay: trackField('longRunDay', profile.longRunDay) ? profile.longRunDay! : undefined,
        workDemand: trackField('workDemand', profile.workDemand) ? profile.workDemand! : undefined,
        familyDemand: trackField('familyDemand', profile.familyDemand) ? profile.familyDemand! : undefined,
        hasGymAccess: trackField('hasGymAccess', profile.hasGymAccess) ? profile.hasGymAccess! : undefined,
        hasPoolAccess: trackField('hasPoolAccess', profile.hasPoolAccess) ? profile.hasPoolAccess! : undefined,
        hasTrackAccess: trackField('hasTrackAccess', profile.hasTrackAccess) ? profile.hasTrackAccess! : undefined,
      },
      goals: {
        primaryGoal: trackField('primaryGoal', (profile as any).primaryGoal) ? (profile as any).primaryGoal : undefined,
        motivation: trackField('motivation', (profile as any).motivation) ? (profile as any).motivation : undefined,
        motivationFactors: trackField('motivationFactors', profile.motivationFactors) ? profile.motivationFactors : undefined,
        raceGoals: raceGoals?.map(goal => ({
          raceName: goal.raceName,
          distance: goal.distance,
          raceDate: goal.raceDate,
          targetTime: goal.targetTime || undefined,
          priority: goal.priority,
        })),
      },
      preferences: {
        trainingPreferences: trackField('trainingPreferences', profile.trainingPreferences) ? profile.trainingPreferences : undefined,
      },
    },

    aiGeneratedFields: {
      fieldsConsidered,
      fieldsUsed,
      fieldsIgnored,
      missingFields,
      timestamp: new Date(),
    },

    formattedPrompt: '', // Será preenchido abaixo
  };

  // Ignorar campos internos/deprecated
  trackIgnored('stravaAthleteId');
  trackIgnored('stravaAccessToken');
  trackIgnored('stravaRefreshToken');
  trackIgnored('stravaTokenExpiry');
  trackIgnored('goalDistance'); // deprecated
  trackIgnored('targetRaceDate'); // deprecated
  trackIgnored('targetTime'); // deprecated
  trackIgnored('injuries'); // deprecated
  trackIgnored('injuryHistory'); // deprecated
  trackIgnored('weeklyAvailability'); // deprecated
  trackIgnored('trainingActivities'); // deprecated

  // Construir prompt formatado
  context.formattedPrompt = formatPromptFromContext(context);

  return context;
}

/**
 * Formata contexto em prompt legível para IA
 */
function formatPromptFromContext(context: ProfileContext): string {
  const { athlete } = context;
  let prompt = '# Perfil do Atleta\n\n';

  // Básico
  prompt += '## Dados Básicos\n';
  if (athlete.basics.age) prompt += `- Idade: ${athlete.basics.age} anos\n`;
  if (athlete.basics.gender) prompt += `- Gênero: ${athlete.basics.gender}\n`;
  prompt += `- Peso: ${athlete.basics.weight}kg\n`;
  prompt += `- Altura: ${athlete.basics.height}cm\n`;
  prompt += `- Nível: ${athlete.basics.runningLevel}\n\n`;

  // Experiência
  if (athlete.experience.runningYears || athlete.experience.currentWeeklyKm) {
    prompt += '## Experiência\n';
    if (athlete.experience.hasRunBefore !== undefined) {
      prompt += `- Já correu antes: ${athlete.experience.hasRunBefore ? 'Sim' : 'Não'}\n`;
    }
    if (athlete.experience.runningYears) {
      prompt += `- Anos de corrida: ${athlete.experience.runningYears}\n`;
    }
    if (athlete.experience.currentWeeklyKm) {
      prompt += `- Km semanal atual: ${athlete.experience.currentWeeklyKm}km\n`;
    }
    if (athlete.experience.longestRun) {
      prompt += `- Maior corrida: ${athlete.experience.longestRun}km\n`;
    }
    prompt += '\n';
  }

  // Performance
  if (athlete.performance.currentVDOT || athlete.performance.bestTimes) {
    prompt += '## Performance\n';
    if (athlete.performance.currentVDOT) {
      prompt += `- VDOT atual: ${athlete.performance.currentVDOT}\n`;
    }
    if (athlete.performance.bestTimes) {
      prompt += `- Melhores tempos: ${JSON.stringify(athlete.performance.bestTimes)}\n`;
    }
    prompt += '\n';
  }

  // Saúde
  prompt += '## Saúde\n';
  if (athlete.health.restingHeartRate) {
    prompt += `- FC repouso: ${athlete.health.restingHeartRate}bpm\n`;
  }
  if (athlete.health.sleepQuality) {
    prompt += `- Qualidade sono: ${athlete.health.sleepQuality}/10\n`;
  }
  if (athlete.health.avgSleepHours) {
    prompt += `- Horas de sono: ${athlete.health.avgSleepHours}h/noite\n`;
  }
  if (athlete.health.stressLevel) {
    prompt += `- Nível estresse: ${athlete.health.stressLevel}/10\n`;
  }
  if (athlete.health.currentlyInjured !== undefined) {
    prompt += `- Lesionado: ${athlete.health.currentlyInjured ? 'Sim' : 'Não'}\n`;
  }
  if (athlete.health.injuryDetails) {
    prompt += `- Detalhes lesões: ${JSON.stringify(athlete.health.injuryDetails)}\n`;
  }
  prompt += '\n';

  // Disponibilidade
  if (athlete.availability.trainingSchedule) {
    prompt += '## Disponibilidade\n';
    prompt += `- Agenda: ${JSON.stringify(athlete.availability.trainingSchedule)}\n`;
    if (athlete.availability.longRunDay) {
      prompt += `- Dia do longão: ${athlete.availability.longRunDay}\n`;
    }
    if (athlete.availability.workDemand) {
      prompt += `- Demanda trabalho: ${athlete.availability.workDemand}\n`;
    }
    if (athlete.availability.familyDemand) {
      prompt += `- Demanda familiar: ${athlete.availability.familyDemand}\n`;
    }
    prompt += '\n';
  }

  // Objetivos
  if (athlete.goals.raceGoals && athlete.goals.raceGoals.length > 0) {
    prompt += '## Objetivos de Corrida\n';
    athlete.goals.raceGoals.forEach((goal, i) => {
      prompt += `${i + 1}. ${goal.raceName} (${goal.distance}) - ${goal.raceDate.toLocaleDateString()}\n`;
      if (goal.targetTime) prompt += `   Meta: ${goal.targetTime}\n`;
    });
    prompt += '\n';
  }

  return prompt;
}

/**
 * Salva tracking de campos usados pela IA (para análise futura)
 */
export async function saveFieldTracking(
  userId: string,
  context: ProfileContext
): Promise<void> {
  // TODO: Implementar salvamento no banco
  // Tabela: ai_field_usage
  // Campos: userId, fieldsUsed[], timestamp
  console.log('[AI Tracking]', {
    userId,
    fieldsUsed: context.aiGeneratedFields.fieldsUsed.length,
    missingFields: context.aiGeneratedFields.missingFields.length,
  });
}
