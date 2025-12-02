// ATHERA FLEX - Adjustment Engine
// Centraliza toda lógica de ajustes de treinos

import { db } from '@/lib/db';

export interface WorkoutAdjustment {
  id: number;
  userId: string;
  originalWorkoutId: number;
  executedWorkoutId: number;
  adjustmentType: string;
  originalDate: Date;
  newDate: Date;
  volumeChangePercent: number;
  reason: string;
  appliedBy: string;
  appliedAt: Date;
}

export interface AdjustmentSuggestion {
  type: 'reschedule' | 'volume_adjust' | 'substitute';
  confidence: number;
  reason: string;
  originalWorkout: any;
  suggestedDate?: Date;
  suggestedVolume?: number;
  suggestedType?: string;
}

export class AdjustmentEngine {
  /**
   * Aplica um ajuste aprovado pelo usuário
   */
  static async applyAdjustment(
    userId: string,
    adjustmentData: {
      originalWorkoutId: number;
      executedWorkoutId: number;
      adjustmentType: string;
      originalDate: Date;
      newDate: Date;
      volumeChangePercent: number;
      reason: string;
    }
  ): Promise<WorkoutAdjustment> {
    const adjustment = await db.workoutAdjustment.create({
      data: {
        userId,
        ...adjustmentData,
        appliedBy: 'user',
        appliedAt: new Date(),
      },
    });

    // Atualiza custom_workouts com flags de flexibilidade
    await db.customWorkout.update({
      where: { id: adjustmentData.originalWorkoutId },
      data: {
        was_rescheduled: true,
        original_date: adjustmentData.originalDate,
        rescheduled_by: 'user',
        rescheduled_reason: adjustmentData.reason,
        executed_workout_id: adjustmentData.executedWorkoutId,
      },
    });

    return adjustment as any;
  }

  /**
   * Reverte um ajuste (undo)
   */
  static async undoAdjustment(
    userId: string,
    adjustmentId: number
  ): Promise<void> {
    const adjustment = await db.workoutAdjustment.findUnique({
      where: { id: adjustmentId },
    });

    if (!adjustment || adjustment.userId !== userId) {
      throw new Error('Ajuste não encontrado ou sem permissão');
    }

    // Reverte flags no custom_workouts
    await db.customWorkout.update({
      where: { id: adjustment.originalWorkoutId },
      data: {
        was_rescheduled: false,
        original_date: null,
        rescheduled_by: null,
        rescheduled_reason: null,
        executed_workout_id: null,
      },
    });

    // Remove o ajuste
    await db.workoutAdjustment.delete({
      where: { id: adjustmentId },
    });
  }

  /**
   * Busca histórico de ajustes do usuário
   */
  static async getHistory(
    userId: string,
    limit = 50
  ): Promise<WorkoutAdjustment[]> {
    const adjustments = await db.workoutAdjustment.findMany({
      where: { userId },
      orderBy: { appliedAt: 'desc' },
      take: limit,
    });

    return adjustments as any;
  }

  /**
   * Rejeita uma sugestão automática
   */
  static async rejectSuggestion(
    userId: string,
    originalWorkoutId: number,
    reason: string
  ): Promise<void> {
    // Registra decisão do usuário
    await db.workoutMatchDecision.create({
      data: {
        userId,
        originalWorkoutId,
        executedWorkoutId: null,
        decision: 'rejected',
        confidence: 0,
        autoApplied: false,
        userFeedback: reason,
        decisionReason: `Usuário rejeitou: ${reason}`,
      },
    });

    // Aprende com a rejeição
    await this.learnFromRejection(userId, originalWorkoutId, reason);
  }

  /**
   * Sistema de aprendizado baseado em rejeições
   */
  private static async learnFromRejection(
    userId: string,
    workoutId: number,
    reason: string
  ): Promise<void> {
    // Registra padrão de rejeição
    await db.userDecisionPattern.upsert({
      where: {
        userId_patternType: {
          userId,
          patternType: 'rejection',
        },
      },
      create: {
        userId,
        patternType: 'rejection',
        patternData: { reasons: [reason], count: 1 },
        confidence: 0.1,
        lastUpdated: new Date(),
      },
      update: {
        patternData: {
          // Incrementa contador e adiciona razão
        },
        confidence: { increment: 0.05 },
        lastUpdated: new Date(),
      },
    });
  }

  /**
   * Verifica se um treino pode ser ajustado
   */
  static async canAdjust(
    userId: string,
    workoutId: number
  ): Promise<boolean> {
    const workout = await db.customWorkout.findFirst({
      where: {
        id: workoutId,
        planId: {
          in: await db.userPlan
            .findMany({
              where: { userId },
              select: { id: true },
            })
            .then((plans) => plans.map((p) => p.id)),
        },
      },
    });

    if (!workout) return false;

    // Verifica se está dentro da janela de flexibilidade
    const settings = await db.userFlexSettings.findUnique({
      where: { userId },
    });

    if (!settings) return false;

    const daysDiff = Math.abs(
      (new Date().getTime() - new Date(workout.date).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return daysDiff <= (settings.flexibilityWindow || 3);
  }
}
