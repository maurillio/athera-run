// ATHERA FLEX - Pattern Analyzer
// Analisa padrões de comportamento do usuário

import { db } from '@/lib/db';

export interface UserPattern {
  userId: string;
  patternType: string;
  confidence: number;
  data: any;
}

export interface BehaviorInsight {
  pattern: string;
  frequency: number;
  confidence: number;
  recommendation?: string;
}

export class PatternAnalyzer {
  /**
   * Analisa padrões de reschedule do usuário
   */
  static async analyzeReschedulePatterns(
    userId: string
  ): Promise<BehaviorInsight[]> {
    const adjustments = await db.workoutAdjustment.findMany({
      where: {
        userId,
        adjustmentType: 'reschedule',
      },
      orderBy: { appliedAt: 'desc' },
      take: 100,
    });

    const patterns: BehaviorInsight[] = [];

    // Padrão 1: Dias da semana preferidos
    const dayPreferences = this.analyzeDayPreferences(adjustments);
    if (dayPreferences) patterns.push(dayPreferences);

    // Padrão 2: Antecedência vs Atraso
    const timingPattern = this.analyzeTimingPattern(adjustments);
    if (timingPattern) patterns.push(timingPattern);

    // Padrão 3: Tipos de treino mais movidos
    const workoutTypePattern = this.analyzeWorkoutTypes(adjustments);
    if (workoutTypePattern) patterns.push(workoutTypePattern);

    return patterns;
  }

  /**
   * Analisa preferências de dias da semana
   */
  private static analyzeDayPreferences(adjustments: any[]): BehaviorInsight | null {
    if (adjustments.length < 5) return null;

    const dayCount: { [key: number]: number } = {};

    adjustments.forEach((adj) => {
      const day = new Date(adj.newDate).getDay();
      dayCount[day] = (dayCount[day] || 0) + 1;
    });

    const mostPreferredDay = Object.entries(dayCount).sort(
      ([, a], [, b]) => b - a
    )[0];

    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return {
      pattern: `Prefere treinar às ${dayNames[parseInt(mostPreferredDay[0])]}`,
      frequency: mostPreferredDay[1],
      confidence: Math.min(mostPreferredDay[1] / adjustments.length, 1),
      recommendation: `Considere planejar treinos principais às ${
        dayNames[parseInt(mostPreferredDay[0])]
      }`,
    };
  }

  /**
   * Analisa se usuário antecipa ou atrasa treinos
   */
  private static analyzeTimingPattern(adjustments: any[]): BehaviorInsight | null {
    if (adjustments.length < 5) return null;

    let anticipates = 0;
    let delays = 0;

    adjustments.forEach((adj) => {
      const diff =
        new Date(adj.newDate).getTime() - new Date(adj.originalDate).getTime();
      if (diff < 0) anticipates++;
      else if (diff > 0) delays++;
    });

    const total = anticipates + delays;
    const ratio = anticipates / total;

    if (ratio > 0.7) {
      return {
        pattern: 'Tende a antecipar treinos',
        frequency: anticipates,
        confidence: ratio,
        recommendation: 'Considere planejar treinos 1-2 dias antes',
      };
    } else if (ratio < 0.3) {
      return {
        pattern: 'Tende a atrasar treinos',
        frequency: delays,
        confidence: 1 - ratio,
        recommendation: 'Considere buffer de recuperação extra',
      };
    }

    return null;
  }

  /**
   * Analisa tipos de treino mais movidos
   */
  private static analyzeWorkoutTypes(adjustments: any[]): BehaviorInsight | null {
    if (adjustments.length < 10) return null;

    // TODO: Implementar análise de tipos de treino
    // Requer join com custom_workouts para pegar workout_type

    return null;
  }

  /**
   * Analisa padrões de volume
   */
  static async analyzeVolumePatterns(userId: string): Promise<BehaviorInsight[]> {
    const adjustments = await db.workoutAdjustment.findMany({
      where: {
        userId,
        adjustmentType: 'volume_adjust',
      },
      orderBy: { appliedAt: 'desc' },
      take: 50,
    });

    if (adjustments.length < 5) return [];

    const avgChange =
      adjustments.reduce((sum, adj) => sum + adj.volumeChangePercent, 0) /
      adjustments.length;

    if (Math.abs(avgChange) < 5) return [];

    return [
      {
        pattern:
          avgChange > 0
            ? 'Tende a aumentar volume'
            : 'Tende a reduzir volume',
        frequency: adjustments.length,
        confidence: Math.min(Math.abs(avgChange) / 50, 1),
        recommendation:
          avgChange > 0
            ? 'Considere planos mais desafiadores'
            : 'Considere reduzir intensidade base',
      },
    ];
  }

  /**
   * Salva padrão identificado no banco
   */
  static async savePattern(
    userId: string,
    patternType: string,
    patternData: any,
    confidence: number
  ): Promise<void> {
    await db.userDecisionPattern.upsert({
      where: {
        userId_patternType: {
          userId,
          patternType,
        },
      },
      create: {
        userId,
        patternType,
        patternData,
        confidence,
        lastUpdated: new Date(),
      },
      update: {
        patternData,
        confidence,
        lastUpdated: new Date(),
      },
    });
  }

  /**
   * Recupera todos os padrões do usuário
   */
  static async getUserPatterns(userId: string): Promise<UserPattern[]> {
    const patterns = await db.userDecisionPattern.findMany({
      where: { userId },
      orderBy: { confidence: 'desc' },
    });

    return patterns.map((p) => ({
      userId: p.userId,
      patternType: p.patternType,
      confidence: p.confidence,
      data: p.patternData,
    }));
  }

  /**
   * Atualiza confiança de um padrão baseado em feedback
   */
  static async updatePatternConfidence(
    userId: string,
    patternType: string,
    feedback: 'positive' | 'negative'
  ): Promise<void> {
    const adjustment = feedback === 'positive' ? 0.1 : -0.1;

    await db.userDecisionPattern.update({
      where: {
        userId_patternType: {
          userId,
          patternType,
        },
      },
      data: {
        confidence: {
          increment: adjustment,
        },
        lastUpdated: new Date(),
      },
    });
  }
}
