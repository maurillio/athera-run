/**
 * Onboarding Validator - Validações inteligentes com contexto
 * 
 * Valida dados do onboarding e detecta inconsistências
 */

import { calculateVDOTFromBestTimes, estimateVolumeFromVDOT } from './vdot-calculator';

export interface OnboardingData {
  // Step 1: Básicos
  age: number;
  gender: string;
  weight: number;
  height: number;
  restingHeartRate?: number;
  sleepQuality: number;
  stressLevel: number;

  // Step 2: Base Esportiva
  hasRunBefore: boolean;
  runningYears?: number;
  currentWeeklyKm?: number;
  otherSportsExperience?: string[];
  otherSportsYears?: Record<string, number>;

  // Step 3: Performance
  bestTimes?: Record<string, { time: string; date?: string }>;

  // Step 4: Saúde
  injuries?: any[];
  medicalConditions?: string[];
  medications?: string;

  // Step 5: Objetivos
  goalDistance: string;
  targetRaceDate: Date;
  targetTime?: string;
  motivationFactors?: string[];

  // Step 6: Disponibilidade
  weeklyDays: number;
  availableDays: number[];
  preferredTime: string;
  hasGymAccess: boolean;
  hasPoolAccess: boolean;
  longRunDay?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: ValidationWarning[];
}

export interface ValidationWarning {
  type: 'inconsistency' | 'ambitious_goal' | 'risk' | 'info';
  field: string;
  message: string;
  suggestion?: string;
  actions?: Array<{ label: string; value: string }>;
}

/**
 * Valida Step 1: Dados Básicos
 */
export function validateStep1(data: Partial<OnboardingData>): ValidationResult {
  const errors: string[] = [];
  const warnings: ValidationWarning[] = [];

  // Obrigatórios
  if (!data.age || data.age < 15 || data.age > 100) {
    errors.push('Idade deve estar entre 15 e 100 anos');
  }

  if (!data.gender || !['male', 'female'].includes(data.gender)) {
    errors.push('Gênero é obrigatório');
  }

  if (!data.weight || data.weight < 30 || data.weight > 300) {
    errors.push('Peso deve estar entre 30 e 300 kg');
  }

  if (!data.height || data.height < 100 || data.height > 250) {
    errors.push('Altura deve estar entre 100 e 250 cm');
  }

  // Validações opcionais com avisos
  if (data.restingHeartRate) {
    if (data.restingHeartRate < 40) {
      warnings.push({
        type: 'info',
        field: 'restingHeartRate',
        message: 'FC repouso muito baixa (atleta de elite). Confirme a medição.',
        suggestion: 'Valores abaixo de 40 bpm são raros',
      });
    } else if (data.restingHeartRate > 90) {
      warnings.push({
        type: 'risk',
        field: 'restingHeartRate',
        message: 'FC repouso elevada. Considere avaliação médica antes de iniciar.',
        suggestion: 'Valores acima de 90 bpm podem indicar problemas de saúde',
      });
    }
  }

  if (data.sleepQuality && data.sleepQuality < 3) {
    warnings.push({
      type: 'risk',
      field: 'sleepQuality',
      message: 'Sono inadequado pode comprometer recuperação e aumentar risco de lesões.',
      suggestion: 'Tente melhorar qualidade do sono antes de iniciar treinos intensos',
    });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Valida Step 2: Base Esportiva
 */
export function validateStep2(data: Partial<OnboardingData>): ValidationResult {
  const errors: string[] = [];
  const warnings: ValidationWarning[] = [];

  if (data.hasRunBefore === undefined) {
    errors.push('Informe se já praticou corrida antes');
  }

  if (data.hasRunBefore && data.currentWeeklyKm && data.currentWeeklyKm > 150) {
    warnings.push({
      type: 'info',
      field: 'currentWeeklyKm',
      message: 'Volume semanal muito alto (atleta avançado/elite)',
      suggestion: 'Confirme o volume de 150+ km/semana',
    });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Valida Step 3: Performance (CRÍTICO - detecta inconsistências)
 */
export function validateStep3(data: Partial<OnboardingData>): ValidationResult {
  const errors: string[] = [];
  const warnings: ValidationWarning[] = [];

  if (!data.bestTimes || Object.keys(data.bestTimes).length === 0) {
    // Opcional, mas vamos avisar
    warnings.push({
      type: 'info',
      field: 'bestTimes',
      message: 'Nenhum tempo registrado. VDOT será estimado de forma conservadora.',
      suggestion: 'Adicione pelo menos um tempo de prova para melhor personalização',
    });
    
    return { valid: true, warnings };
  }

  // Calcular VDOT
  const vdot = calculateVDOTFromBestTimes(data.bestTimes);
  
  if (vdot && data.currentWeeklyKm) {
    const expectedVolume = estimateVolumeFromVDOT(vdot);
    
    // Detectar inconsistência: VDOT alto mas volume baixo
    if (vdot >= 50 && data.currentWeeklyKm < expectedVolume.min * 0.6) {
      warnings.push({
        type: 'inconsistency',
        field: 'volume_vs_vdot',
        message: `Seu pace indica nível avançado (VDOT ${vdot}), mas volume atual (${data.currentWeeklyKm}km/sem) é baixo para esse nível. Está voltando de pausa ou lesão?`,
        suggestion: 'Volume esperado para seu nível: ' + expectedVolume.min + '-' + expectedVolume.max + ' km/semana',
        actions: [
          { label: 'Sim, voltando de pausa/lesão', value: 'returning' },
          { label: 'Não, sempre corri com volume baixo', value: 'low_volume' },
          { label: 'Vou ajustar meu volume', value: 'adjust' },
        ],
      });
    }
    
    // Detectar inconsistência: VDOT baixo mas volume alto
    if (vdot < 40 && data.currentWeeklyKm > expectedVolume.max * 1.5) {
      warnings.push({
        type: 'inconsistency',
        field: 'volume_vs_vdot',
        message: `Volume alto (${data.currentWeeklyKm}km/sem) para seu nível atual (VDOT ${vdot}). Pode estar treinando com intensidade incorreta.`,
        suggestion: 'Verifique se seus tempos estão corretos ou se está treinando muito devagar',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Valida Step 4: Saúde e Lesões
 */
export function validateStep4(data: Partial<OnboardingData>): ValidationResult {
  const errors: string[] = [];
  const warnings: ValidationWarning[] = [];

  if (data.injuries && data.injuries.length > 0) {
    const recovering = data.injuries.filter((inj: any) => inj.status === 'recovering');
    
    if (recovering.length > 0) {
      warnings.push({
        type: 'risk',
        field: 'injuries',
        message: `${recovering.length} lesão(ões) em recuperação detectada(s). Volume inicial será reduzido.`,
        suggestion: 'Consulte um profissional antes de iniciar treinos intensos',
      });
    }
  }

  if (data.medicalConditions && data.medicalConditions.length > 0) {
    warnings.push({
      type: 'info',
      field: 'medicalConditions',
      message: 'Condições médicas identificadas. Plano será ajustado.',
      suggestion: 'Sempre consulte seu médico antes de iniciar atividades físicas',
    });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Valida Step 5: Objetivos
 */
export function validateStep5(data: Partial<OnboardingData>): ValidationResult {
  const errors: string[] = [];
  const warnings: ValidationWarning[] = [];

  if (!data.goalDistance) {
    errors.push('Distância objetivo é obrigatória');
  }

  if (!data.targetRaceDate) {
    errors.push('Data da prova é obrigatória');
  } else {
    const raceDate = new Date(data.targetRaceDate);
    const now = new Date();
    const weeksUntilRace = Math.floor((raceDate.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000));

    // Prazo muito curto
    if (weeksUntilRace < 8) {
      warnings.push({
        type: 'risk',
        field: 'targetRaceDate',
        message: `Apenas ${weeksUntilRace} semanas até a prova. Tempo mínimo recomendado: 8-12 semanas.`,
        suggestion: 'Considere escolher outra corrida com mais tempo de preparação',
      });
    }

    // Prazo muito longo
    if (weeksUntilRace > 40) {
      warnings.push({
        type: 'info',
        field: 'targetRaceDate',
        message: `Prova em ${weeksUntilRace} semanas. Vamos criar um plano em fases.`,
        suggestion: 'Planos muito longos serão divididos em mesociclos',
      });
    }
  }

  // Validar meta de tempo vs VDOT atual
  if (data.targetTime && data.bestTimes) {
    const currentVDOT = calculateVDOTFromBestTimes(data.bestTimes);
    
    if (currentVDOT) {
      // TODO: Calcular VDOT necessário para meta e comparar
      // Se meta muito ambiciosa, avisar
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Valida Step 6: Disponibilidade
 */
export function validateStep6(data: Partial<OnboardingData>): ValidationResult {
  const errors: string[] = [];
  const warnings: ValidationWarning[] = [];

  if (!data.weeklyDays || data.weeklyDays < 3 || data.weeklyDays > 7) {
    errors.push('Dias de treino por semana deve estar entre 3 e 7');
  }

  if (!data.availableDays || data.availableDays.length === 0) {
    errors.push('Selecione os dias disponíveis para treinar');
  }

  if (data.availableDays && data.weeklyDays && data.availableDays.length < data.weeklyDays) {
    errors.push(`Você informou ${data.weeklyDays} dias mas selecionou apenas ${data.availableDays.length}`);
  }

  if (!data.preferredTime) {
    errors.push('Selecione o horário preferido para treinar');
  }

  if (data.weeklyDays && data.weeklyDays < 4 && data.goalDistance === 'marathon') {
    warnings.push({
      type: 'ambitious_goal',
      field: 'weeklyDays',
      message: 'Treinar apenas ' + data.weeklyDays + ' dias por semana para maratona é desafiador.',
      suggestion: 'Recomendamos no mínimo 4-5 dias para maratona. Considere aumentar disponibilidade.',
    });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Validação completa do onboarding
 */
export function validateCompleteOnboarding(data: OnboardingData): ValidationResult {
  const results = [
    validateStep1(data),
    validateStep2(data),
    validateStep3(data),
    validateStep4(data),
    validateStep5(data),
    validateStep6(data),
  ];

  const allErrors = results.flatMap(r => r.errors || []);
  const allWarnings = results.flatMap(r => r.warnings || []);

  return {
    valid: allErrors.length === 0,
    errors: allErrors.length > 0 ? allErrors : undefined,
    warnings: allWarnings.length > 0 ? allWarnings : undefined,
  };
}
