/**
 * Sistema Avançado de Apresentação de Treinos - v2.0.0
 * 
 * Tipos TypeScript para estrutura detalhada de treinos
 * Baseado em best practices de TrainingPeaks, Strava, e literatura científica
 */

/**
 * Níveis de intensidade de treino
 */
export type IntensityLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Tipos de intensidade com labels
 */
export const INTENSITY_LABELS = {
  1: { pt: 'Muito Leve', en: 'Very Easy', es: 'Muy Fácil' },
  2: { pt: 'Leve', en: 'Easy', es: 'Fácil' },
  3: { pt: 'Moderado', en: 'Moderate', es: 'Moderado' },
  4: { pt: 'Intenso', en: 'Hard', es: 'Intenso' },
  5: { pt: 'Muito Intenso', en: 'Very Hard', es: 'Muy Intenso' }
} as const;

/**
 * Zonas de frequência cardíaca
 */
export interface HeartRateZone {
  min: number; // percentual da FC máxima
  max: number; // percentual da FC máxima
  bpmMin?: number; // BPM calculado (opcional)
  bpmMax?: number; // BPM calculado (opcional)
}

/**
 * Fase de um treino (aquecimento, principal, desaquecimento)
 */
export interface WorkoutPhase {
  duration: number; // minutos
  description: string; // Descrição geral da fase
  steps: string[]; // Lista ordenada de passos a seguir
  intensity: 'very-easy' | 'easy' | 'moderate' | 'hard' | 'very-hard';
  heartRateZone?: HeartRateZone;
  pace?: string; // ex: "6:00" (min/km)
  notes?: string[]; // Notas adicionais importantes
}

/**
 * Estrutura de treino intervalado
 */
export interface IntervalStructure {
  workInterval: {
    duration: string; // ex: "2 min", "400m", "800m"
    pace: string; // ex: "4:30" (min/km)
    intensity: string; // ex: "95-100% VO₂max"
    description?: string;
  };
  recoveryInterval: {
    duration: string; // ex: "2 min", "200m"
    type: 'jog' | 'walk' | 'rest';
    pace?: string;
    description?: string;
  };
  repetitions: number;
  notes?: string[];
  setStructure?: string; // ex: "3 sets of 4 reps"
}

/**
 * Treino estruturado completo (parte principal)
 * Pode ser contínuo OU intervalado
 */
export type MainWorkoutStructure = WorkoutPhase | IntervalStructure;

/**
 * Função helper para detectar se é intervalo
 */
export function isIntervalWorkout(
  workout: MainWorkoutStructure
): workout is IntervalStructure {
  return 'workInterval' in workout && 'recoveryInterval' in workout;
}

/**
 * Treino com estrutura completa e enriquecimento educacional
 */
export interface EnhancedWorkout {
  // Campos básicos (do schema existente)
  id: number;
  weekId: number;
  dayOfWeek: number;
  date: Date | string;
  type: string;
  subtype?: string | null;
  title: string;
  description: string;
  distance?: number | null;
  duration?: number | null;
  targetPace?: string | null;
  isCompleted: boolean;
  
  // Estrutura em 3 fases (v2.0.0)
  warmUpStructure?: WorkoutPhase | null;
  mainWorkoutStruct?: MainWorkoutStructure | null;
  coolDownStructure?: WorkoutPhase | null;
  
  // Enriquecimento educacional (v2.0.0)
  objective?: string | null; // Por que fazer este treino?
  scientificBasis?: string | null; // Fundamento científico
  tips?: string[] | null; // Dicas práticas de execução
  commonMistakes?: string[] | null; // Erros comuns a evitar
  successCriteria?: string[] | null; // Como saber que executou bem
  
  // Métricas avançadas (v2.0.0)
  intensityLevel?: IntensityLevel | null;
  expectedRPE?: number | null; // 1-10 scale
  heartRateZones?: Record<string, HeartRateZone> | null;
  intervals?: IntervalStructure | null;
  expectedDuration?: number | null; // minutos total
  
  // Campos legacy (manter compatibilidade)
  warmup?: string | null;
  mainSet?: string | null;
  cooldown?: string | null;
  targetHeartRate?: string | null;
  targetRPE?: number | null;
  equipmentRequired?: string | null;
  isStrengthSpecific?: boolean;
}

/**
 * Tipo simplificado para criação de workout pela IA
 */
export interface WorkoutGenerationData {
  // Identificação
  dayOfWeek: number;
  date: string;
  type: string;
  subtype?: string;
  title: string;
  description: string;
  
  // Métricas básicas
  distance?: number;
  targetPace?: string;
  duration?: number;
  
  // Estrutura detalhada
  warmUpStructure?: WorkoutPhase;
  mainWorkoutStruct: MainWorkoutStructure;
  coolDownStructure?: WorkoutPhase;
  
  // Educacional
  objective: string;
  scientificBasis?: string;
  tips: string[];
  commonMistakes?: string[];
  successCriteria?: string[];
  
  // Métricas
  intensityLevel: IntensityLevel;
  expectedRPE: number;
  expectedDuration: number;
  heartRateZones?: Record<string, HeartRateZone>;
}

/**
 * Helper para criar WorkoutPhase padrão
 */
export function createWorkoutPhase(
  duration: number,
  description: string,
  steps: string[],
  intensity: WorkoutPhase['intensity']
): WorkoutPhase {
  return {
    duration,
    description,
    steps,
    intensity
  };
}

/**
 * Helper para criar IntervalStructure
 */
export function createIntervalStructure(
  workDuration: string,
  workPace: string,
  recoveryDuration: string,
  recoveryType: IntervalStructure['recoveryInterval']['type'],
  repetitions: number
): IntervalStructure {
  return {
    workInterval: {
      duration: workDuration,
      pace: workPace,
      intensity: 'High'
    },
    recoveryInterval: {
      duration: recoveryDuration,
      type: recoveryType
    },
    repetitions
  };
}

/**
 * Tipos de treino suportados
 */
export const WORKOUT_TYPES = {
  LONG_RUN: 'long_run',
  INTERVALS: 'intervals',
  TEMPO: 'tempo',
  EASY: 'easy',
  RECOVERY: 'recovery',
  RACE_PACE: 'race_pace',
  HILL: 'hill',
  FARTLEK: 'fartlek',
  STRENGTH: 'strength',
  CROSS_TRAINING: 'cross_training',
  REST: 'rest'
} as const;

export type WorkoutType = typeof WORKOUT_TYPES[keyof typeof WORKOUT_TYPES];

/**
 * Mapeamento de tipo → intensidade padrão
 */
export const TYPE_TO_INTENSITY: Record<WorkoutType, IntensityLevel> = {
  [WORKOUT_TYPES.LONG_RUN]: 2,
  [WORKOUT_TYPES.INTERVALS]: 5,
  [WORKOUT_TYPES.TEMPO]: 4,
  [WORKOUT_TYPES.EASY]: 1,
  [WORKOUT_TYPES.RECOVERY]: 1,
  [WORKOUT_TYPES.RACE_PACE]: 4,
  [WORKOUT_TYPES.HILL]: 4,
  [WORKOUT_TYPES.FARTLEK]: 3,
  [WORKOUT_TYPES.STRENGTH]: 3,
  [WORKOUT_TYPES.CROSS_TRAINING]: 2,
  [WORKOUT_TYPES.REST]: 1
};

/**
 * Validação de estrutura de workout
 */
export function validateWorkoutStructure(workout: WorkoutGenerationData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Campos obrigatórios
  if (!workout.title) errors.push('Title is required');
  if (!workout.description) errors.push('Description is required');
  if (!workout.objective) errors.push('Objective is required');
  if (!workout.tips || workout.tips.length === 0) {
    errors.push('At least one tip is required');
  }
  
  // Estrutura principal obrigatória
  if (!workout.mainWorkoutStruct) {
    errors.push('Main workout structure is required');
  }
  
  // Validar níveis
  if (workout.intensityLevel && (workout.intensityLevel < 1 || workout.intensityLevel > 5)) {
    errors.push('Intensity level must be between 1 and 5');
  }
  
  if (workout.expectedRPE && (workout.expectedRPE < 1 || workout.expectedRPE > 10)) {
    errors.push('Expected RPE must be between 1 and 10');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
