/**
 * ATHERA FLEX v3.3.0 - Smart Workout Matcher
 * Sistema inteligente de detecção de correspondência entre treinos
 * executados e planejados
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface MatchScore {
  workoutId: number;
  confidence: number; // 0-100
  dateScore: number;
  typeScore: number;
  volumeScore: number;
  intensityScore: number;
  reasons: string[];
  suggestions?: string[];
  canAutoApply: boolean; // Se confidence >= threshold
}

export interface MatchCriteria {
  dateWindow: number; // ±N dias
  minConfidence: number; // Mínimo para sugerir
  autoApplyThreshold: number; // Mínimo para auto-aplicar
  allowVolumeIncrease: boolean;
  allowVolumeDecrease: boolean;
  maxVolumeVariance: number; // %
  preferSameDay: boolean;
}

interface CompletedWorkoutData {
  id: number;
  date: Date;
  type: string;
  subtype?: string | null;
  distance?: number | null;
  duration?: number | null;
  pace?: string | null;
  avgHeartRate?: number | null;
  perceivedEffort?: number | null;
}

interface PlannedWorkoutData {
  id: number;
  date: Date;
  type: string;
  subtype?: string | null;
  distance?: number | null;
  duration?: number | null;
  targetPace?: string | null;
  targetHeartRate?: string | null;
  targetRPE?: number | null;
  isCompleted: boolean;
  isFlexible: boolean;
  flexibilityWindow: number;
  canSubstitute: boolean;
  minVolumePercent: number;
  maxVolumePercent: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_CRITERIA: MatchCriteria = {
  dateWindow: 3,
  minConfidence: 60,
  autoApplyThreshold: 90,
  allowVolumeIncrease: true,
  allowVolumeDecrease: true,
  maxVolumeVariance: 50,
  preferSameDay: false,
};

// Regras de substituição por tipo de treino
const SUBSTITUTION_RULES: Record<string, string[]> = {
  long_run: ['easy_long', 'recovery_long', 'aerobic_long'],
  tempo: ['threshold', 'steady_state', 'tempo_run'],
  intervals: ['fartlek', 'hill_repeats', 'speed_work', 'track_intervals'],
  easy: ['recovery', 'regeneration', 'easy_run'],
  race: ['goal_pace', 'race_pace', 'time_trial'],
  threshold: ['tempo', 'steady_state', 'lactate_threshold'],
};

// Tipos equivalentes (mesmo tipo, nomes diferentes)
const TYPE_EQUIVALENTS: Record<string, string[]> = {
  running: ['corrida', 'run', 'running'],
  long_run: ['longao', 'long run', 'long_run', 'longa'],
  easy: ['easy', 'leve', 'regenerativo', 'recovery'],
  tempo: ['tempo', 'threshold', 'limiar'],
  intervals: ['intervals', 'intervalos', 'tiros', 'speed'],
  strength: ['musculacao', 'strength', 'gym', 'academia'],
};

// ============================================================================
// SMART WORKOUT MATCHER CLASS
// ============================================================================

export class SmartWorkoutMatcher {
  private criteria: MatchCriteria;

  constructor(criteria?: Partial<MatchCriteria>) {
    this.criteria = { ...DEFAULT_CRITERIA, ...criteria };
  }

  /**
   * Encontra melhor match entre treino completado e planejados
   */
  async findBestMatch(
    completed: CompletedWorkoutData,
    plannedWorkouts: PlannedWorkoutData[]
  ): Promise<MatchScore[]> {
    const matches: MatchScore[] = [];

    // Filtra apenas treinos elegíveis
    const eligibleWorkouts = plannedWorkouts.filter(
      (w) =>
        !w.isCompleted && // Não completado
        w.isFlexible && // Flexível
        this.isWithinDateWindow(completed.date, w.date, w.flexibilityWindow)
    );

    // Calcula score para cada workout elegível
    for (const planned of eligibleWorkouts) {
      const score = this.calculateMatchScore(completed, planned);

      if (score.confidence >= this.criteria.minConfidence) {
        matches.push(score);
      }
    }

    // Ordena por confidence (maior primeiro)
    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calcula score de match (0-100)
   */
  private calculateMatchScore(
    completed: CompletedWorkoutData,
    planned: PlannedWorkoutData
  ): MatchScore {
    const dateScore = this.calculateDateScore(completed.date, planned.date);
    const typeScore = this.calculateTypeScore(
      completed.type,
      completed.subtype,
      planned.type,
      planned.subtype,
      planned.canSubstitute
    );
    const volumeScore = this.calculateVolumeScore(
      completed.distance,
      planned.distance,
      planned.minVolumePercent,
      planned.maxVolumePercent
    );
    const intensityScore = this.calculateIntensityScore(
      completed.pace,
      completed.avgHeartRate,
      completed.perceivedEffort,
      planned.targetPace,
      planned.targetHeartRate,
      planned.targetRPE
    );

    // Pesos dos scores
    const WEIGHTS = {
      date: 0.30, // 30%
      type: 0.25, // 25%
      volume: 0.25, // 25%
      intensity: 0.20, // 20%
    };

    const confidence = Math.round(
      dateScore * WEIGHTS.date +
        typeScore * WEIGHTS.type +
        volumeScore * WEIGHTS.volume +
        intensityScore * WEIGHTS.intensity
    );

    const reasons = this.generateReasons(
      dateScore,
      typeScore,
      volumeScore,
      intensityScore,
      completed,
      planned
    );

    const suggestions = this.generateSuggestions(
      confidence,
      completed,
      planned
    );

    return {
      workoutId: planned.id,
      confidence,
      dateScore,
      typeScore,
      volumeScore,
      intensityScore,
      reasons,
      suggestions,
      canAutoApply: confidence >= this.criteria.autoApplyThreshold,
    };
  }

  /**
   * Score de correspondência de data (0-100)
   */
  private calculateDateScore(
    completedDate: Date,
    plannedDate: Date
  ): number {
    const daysDiff = Math.abs(dayjs(completedDate).diff(dayjs(plannedDate), 'day'));

    if (daysDiff === 0) return 100; // Mesma data = perfeito
    if (daysDiff === 1) return 85; // ±1 dia = muito bom
    if (daysDiff === 2) return 70; // ±2 dias = bom
    if (daysDiff === 3) return 55; // ±3 dias = aceitável
    if (daysDiff === 4) return 40; // ±4 dias = fraco
    if (daysDiff === 5) return 25; // ±5 dias = muito fraco

    return 0; // >5 dias = sem match
  }

  /**
   * Score de correspondência de tipo (0-100)
   */
  private calculateTypeScore(
    completedType: string,
    completedSubtype: string | null | undefined,
    plannedType: string,
    plannedSubtype: string | null | undefined,
    canSubstitute: boolean
  ): number {
    const completed = this.normalizeType(completedType);
    const completedSub = completedSubtype
      ? this.normalizeType(completedSubtype)
      : null;
    const planned = this.normalizeType(plannedType);
    const plannedSub = plannedSubtype ? this.normalizeType(plannedSubtype) : null;

    // Tipo + Subtipo idênticos = perfeito
    if (completed === planned && completedSub === plannedSub) {
      return 100;
    }

    // Tipo idêntico, subtipo diferente = muito bom
    if (completed === planned) {
      return 85;
    }

    // Tipos equivalentes
    if (this.areTypesEquivalent(completed, planned)) {
      return 90;
    }

    // Substituição válida (se permitido)
    if (canSubstitute && this.isValidSubstitution(completed, planned)) {
      return 70;
    }

    // Mesmo gênero (ex: ambos corrida)
    if (this.isSameGenre(completed, planned)) {
      return 50;
    }

    return 0; // Tipos incompatíveis
  }

  /**
   * Score de correspondência de volume (0-100)
   */
  private calculateVolumeScore(
    completedDistance: number | null | undefined,
    plannedDistance: number | null | undefined,
    minPercent: number,
    maxPercent: number
  ): number {
    // Se nenhum tem distância, assume match perfeito
    if (!completedDistance && !plannedDistance) return 100;

    // Se um tem e outro não, score baixo
    if (!completedDistance || !plannedDistance) return 30;

    const variance = ((completedDistance - plannedDistance) / plannedDistance) * 100;
    const absVariance = Math.abs(variance);

    // Dentro da tolerância perfeita (±15%)
    if (absVariance <= 15) return 100;

    // Dentro da tolerância configurada
    const maxVariance = Math.max(100 - minPercent, maxPercent - 100);
    if (absVariance <= maxVariance) {
      // Score decai linearmente
      const score = 100 - (absVariance / maxVariance) * 40;
      return Math.max(score, 60);
    }

    // Fora da tolerância, mas ainda aceitável
    if (absVariance <= 70) {
      return 40;
    }

    return 0;
  }

  /**
   * Score de correspondência de intensidade (0-100)
   */
  private calculateIntensityScore(
    completedPace: string | null | undefined,
    completedHR: number | null | undefined,
    completedRPE: number | null | undefined,
    plannedPace: string | null | undefined,
    plannedHR: string | null | undefined,
    plannedRPE: number | null | undefined
  ): number {
    let totalScore = 0;
    let factors = 0;

    // Score de pace
    if (completedPace && plannedPace) {
      const paceScore = this.comparePaces(completedPace, plannedPace);
      totalScore += paceScore * 100;
      factors++;
    }

    // Score de HR
    if (completedHR && plannedHR) {
      const hrScore = this.compareHeartRates(completedHR, plannedHR);
      totalScore += hrScore * 100;
      factors++;
    }

    // Score de RPE
    if (completedRPE && plannedRPE) {
      const rpeScore = this.compareRPE(completedRPE, plannedRPE);
      totalScore += rpeScore * 100;
      factors++;
    }

    // Se não tem dados de intensidade, assume neutro
    if (factors === 0) return 70;

    return Math.round(totalScore / factors);
  }

  /**
   * Compara paces (retorna 0-1)
   */
  private comparePaces(pace1: string, pace2: string): number {
    try {
      const seconds1 = this.paceToSeconds(pace1);
      const seconds2 = this.paceToSeconds(pace2);

      const diff = Math.abs(seconds1 - seconds2);
      const avgPace = (seconds1 + seconds2) / 2;
      const variance = (diff / avgPace) * 100;

      if (variance <= 5) return 1.0; // ±5% = perfeito
      if (variance <= 10) return 0.9; // ±10% = muito bom
      if (variance <= 15) return 0.8; // ±15% = bom
      if (variance <= 20) return 0.6; // ±20% = aceitável

      return 0.3;
    } catch {
      return 0.5; // Erro no parse = neutro
    }
  }

  /**
   * Converte pace string para segundos (ex: "5:30" → 330)
   */
  private paceToSeconds(pace: string): number {
    const parts = pace.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    throw new Error('Invalid pace format');
  }

  /**
   * Compara heart rates (retorna 0-1)
   */
  private compareHeartRates(hr1: number, hr2: string): number {
    try {
      // Parse HR target (pode ser range: "140-150")
      const hr2Num = parseInt(hr2.split('-')[0]);
      const diff = Math.abs(hr1 - hr2Num);
      const variance = (diff / hr2Num) * 100;

      if (variance <= 5) return 1.0;
      if (variance <= 10) return 0.9;
      if (variance <= 15) return 0.7;

      return 0.4;
    } catch {
      return 0.5;
    }
  }

  /**
   * Compara RPE (retorna 0-1)
   */
  private compareRPE(rpe1: number, rpe2: number): number {
    const diff = Math.abs(rpe1 - rpe2);

    if (diff === 0) return 1.0;
    if (diff === 1) return 0.9;
    if (diff === 2) return 0.7;
    if (diff === 3) return 0.5;

    return 0.2;
  }

  /**
   * Verifica se data está dentro da janela
   */
  private isWithinDateWindow(
    date1: Date,
    date2: Date,
    window: number
  ): boolean {
    const daysDiff = Math.abs(dayjs(date1).diff(dayjs(date2), 'day'));
    return daysDiff <= window;
  }

  /**
   * Normaliza tipo de treino
   */
  private normalizeType(type: string): string {
    return type
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_');
  }

  /**
   * Verifica se tipos são equivalentes
   */
  private areTypesEquivalent(type1: string, type2: string): boolean {
    for (const [, equivalents] of Object.entries(TYPE_EQUIVALENTS)) {
      if (equivalents.includes(type1) && equivalents.includes(type2)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Verifica se é substituição válida
   */
  private isValidSubstitution(executed: string, planned: string): boolean {
    const rules = SUBSTITUTION_RULES[executed] || [];
    return rules.includes(planned);
  }

  /**
   * Verifica se são do mesmo gênero de treino
   */
  private isSameGenre(type1: string, type2: string): boolean {
    const runningTypes = ['running', 'corrida', 'run', 'long_run', 'easy', 'tempo', 'intervals'];
    const strengthTypes = ['strength', 'gym', 'musculacao', 'academia'];
    const cardioTypes = ['cycling', 'swimming', 'bike', 'natacao'];

    if (runningTypes.includes(type1) && runningTypes.includes(type2)) return true;
    if (strengthTypes.includes(type1) && strengthTypes.includes(type2)) return true;
    if (cardioTypes.includes(type1) && cardioTypes.includes(type2)) return true;

    return false;
  }

  /**
   * Gera explicações do match
   */
  private generateReasons(
    dateScore: number,
    typeScore: number,
    volumeScore: number,
    intensityScore: number,
    completed: CompletedWorkoutData,
    planned: PlannedWorkoutData
  ): string[] {
    const reasons: string[] = [];

    // Data
    const daysDiff = Math.abs(dayjs(completed.date).diff(dayjs(planned.date), 'day'));
    if (daysDiff === 0) {
      reasons.push('✅ Mesma data');
    } else {
      reasons.push(`📅 ${daysDiff} dia${daysDiff > 1 ? 's' : ''} de diferença`);
    }

    // Tipo
    if (typeScore >= 90) {
      reasons.push('✅ Tipo idêntico');
    } else if (typeScore >= 70) {
      reasons.push('🔄 Tipo compatível');
    }

    // Volume
    if (completed.distance && planned.distance) {
      const variance = ((completed.distance - planned.distance) / planned.distance) * 100;
      if (Math.abs(variance) <= 15) {
        reasons.push('✅ Volume equivalente');
      } else {
        const sign = variance > 0 ? '+' : '';
        reasons.push(`📊 Volume ${sign}${variance.toFixed(0)}%`);
      }
    }

    // Intensidade
    if (intensityScore >= 80) {
      reasons.push('⚡ Intensidade adequada');
    }

    return reasons;
  }

  /**
   * Gera sugestões de ação
   */
  private generateSuggestions(
    confidence: number,
    completed: CompletedWorkoutData,
    planned: PlannedWorkoutData
  ): string[] {
    const suggestions: string[] = [];

    if (confidence >= 90) {
      suggestions.push('Aplicação automática recomendada');
      suggestions.push('Alta confiança no match');
    } else if (confidence >= 75) {
      suggestions.push('Match muito provável');
      suggestions.push('Confirme para aplicar');
    } else if (confidence >= 60) {
      suggestions.push('Match possível');
      suggestions.push('Revise os detalhes antes de aplicar');
    }

    return suggestions;
  }
}

// ============================================================================
// FACTORY & HELPERS
// ============================================================================

/**
 * Cria matcher com configurações do usuário
 */
export function createMatcherFromUserSettings(settings: any): SmartWorkoutMatcher {
  const criteria: Partial<MatchCriteria> = {
    dateWindow: settings?.flexibilityWindow || 3,
    autoApplyThreshold: settings?.autoAdjustThreshold || 90,
    allowVolumeIncrease: settings?.allowVolumeIncrease ?? true,
    allowVolumeDecrease: settings?.allowVolumeDecrease ?? true,
    maxVolumeVariance: settings?.maxVolumeVariance || 50,
    preferSameDay: settings?.preferSameDay || false,
  };

  return new SmartWorkoutMatcher(criteria);
}
