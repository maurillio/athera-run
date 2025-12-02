/**
 * ATHERA FLEX v3.3.0 - Adjustment Engine
 * Sistema de aplicação de ajustes e registro de histórico
 */

import { prisma } from '@/lib/db';
import dayjs from 'dayjs';

// ============================================================================
// TYPES
// ============================================================================

export interface AdjustmentResult {
  success: boolean;
  adjustmentId?: number;
  message: string;
  workoutId: number;
  confidence?: number;
}

export interface ApplyAdjustmentParams {
  userId: string;
  completedWorkoutId: number;
  plannedWorkoutId: number;
  confidence: number;
  dateScore: number;
  typeScore: number;
  volumeScore: number;
  intensityScore: number;
  triggeredBy: 'athlete_manual' | 'ai_suggestion' | 'ai_auto' | 'coach';
  reason?: string;
  autoApplied?: boolean;
}

export interface UndoAdjustmentParams {
  adjustmentId: number;
  userId: string;
  reason: string;
}

// ============================================================================
// ADJUSTMENT ENGINE
// ============================================================================

export class AdjustmentEngine {
  
  /**
   * Aplica ajuste: marca treino planejado como completo
   */
  async applyAdjustment(params: ApplyAdjustmentParams): Promise<AdjustmentResult> {
    const {
      userId,
      completedWorkoutId,
      plannedWorkoutId,
      confidence,
      dateScore,
      typeScore,
      volumeScore,
      intensityScore,
      triggeredBy,
      reason,
      autoApplied = false,
    } = params;

    try {
      // Buscar dados dos workouts
      const [completed, planned] = await Promise.all([
        prisma.completedWorkout.findUnique({
          where: { id: completedWorkoutId },
        }),
        prisma.customWorkout.findUnique({
          where: { id: plannedWorkoutId },
        }),
      ]);

      if (!completed) {
        return {
          success: false,
          message: 'Treino completado não encontrado',
          workoutId: plannedWorkoutId,
        };
      }

      if (!planned) {
        return {
          success: false,
          message: 'Treino planejado não encontrado',
          workoutId: plannedWorkoutId,
        };
      }

      // Calcular variação de volume
      const volumeVariance = this.calculateVolumeVariance(
        completed.distance,
        planned.distance
      );

      // Aplicar ajuste em transação
      const result = await prisma.$transaction(async (tx) => {
        // 1. Atualizar CustomWorkout (marcar como completo)
        const updatedWorkout = await tx.customWorkout.update({
          where: { id: plannedWorkoutId },
          data: {
            isCompleted: true,
            executedWorkoutId: completedWorkoutId,
            wasRescheduled: completed.date.getTime() !== planned.date.getTime(),
            originalDate: planned.date,
            rescheduledBy: triggeredBy,
            rescheduledReason: reason || this.generateDefaultReason(completed, planned),
            updatedAt: new Date(),
          },
        });

        // 2. Atualizar CompletedWorkout (adicionar contexto)
        await tx.completedWorkout.update({
          where: { id: completedWorkoutId },
          data: {
            wasPlanned: true,
            plannedDate: planned.date,
            volumeVariance,
            updatedAt: new Date(),
          },
        });

        // 3. Criar registro no histórico
        const adjustment = await tx.workoutAdjustment.create({
          data: {
            workoutId: plannedWorkoutId,
            adjustmentType: 'mark_done',
            originalDate: planned.date,
            newDate: completed.date,
            originalDistance: planned.distance,
            newDistance: completed.distance,
            triggeredBy,
            reason: reason || this.generateDefaultReason(completed, planned),
            confidence,
            autoApplied,
            approved: true,
            approvedAt: new Date(),
          },
        });

        // 4. Registrar decisão para ML (se foi sugestão)
        if (triggeredBy === 'ai_suggestion' || triggeredBy === 'ai_auto') {
          await tx.workoutMatchDecision.create({
            data: {
              userId,
              completedWorkoutId,
              suggestedWorkoutId: plannedWorkoutId,
              confidence,
              dateScore,
              typeScore,
              volumeScore,
              intensityScore,
              action: 'accepted',
              dayOfWeek: dayjs(completed.date).day(),
              weekOfPlan: await this.getWeekOfPlan(plannedWorkoutId, tx),
            },
          });
        }

        return { adjustment, updatedWorkout };
      });

      return {
        success: true,
        adjustmentId: result.adjustment.id,
        message: this.getSuccessMessage(completed, planned, autoApplied),
        workoutId: plannedWorkoutId,
        confidence,
      };
    } catch (error: any) {
      console.error('[AdjustmentEngine] Error applying adjustment:', error);
      return {
        success: false,
        message: `Erro ao aplicar ajuste: ${error.message}`,
        workoutId: plannedWorkoutId,
      };
    }
  }

  /**
   * Desfaz ajuste aplicado
   */
  async undoAdjustment(params: UndoAdjustmentParams): Promise<AdjustmentResult> {
    const { adjustmentId, userId, reason } = params;

    try {
      // Buscar ajuste
      const adjustment = await prisma.workoutAdjustment.findUnique({
        where: { id: adjustmentId },
        include: {
          workout: true,
        },
      });

      if (!adjustment) {
        return {
          success: false,
          message: 'Ajuste não encontrado',
          workoutId: 0,
        };
      }

      // Verificar se pode desfazer (até 7 dias)
      const daysSince = dayjs().diff(dayjs(adjustment.approvedAt), 'day');
      if (daysSince > 7) {
        return {
          success: false,
          message: 'Ajuste não pode ser desfeito após 7 dias',
          workoutId: adjustment.workoutId,
        };
      }

      // Desfazer em transação
      await prisma.$transaction(async (tx) => {
        // 1. Reverter CustomWorkout
        await tx.customWorkout.update({
          where: { id: adjustment.workoutId },
          data: {
            isCompleted: false,
            executedWorkoutId: null,
            wasRescheduled: false,
            originalDate: null,
            rescheduledBy: null,
            rescheduledReason: null,
            updatedAt: new Date(),
          },
        });

        // 2. Reverter CompletedWorkout
        if (adjustment.workout.executedWorkoutId) {
          await tx.completedWorkout.update({
            where: { id: adjustment.workout.executedWorkoutId },
            data: {
              wasPlanned: false,
              plannedDate: null,
              volumeVariance: null,
              updatedAt: new Date(),
            },
          });
        }

        // 3. Marcar ajuste como desfeito
        await tx.workoutAdjustment.update({
          where: { id: adjustmentId },
          data: {
            undoneAt: new Date(),
            undoReason: reason,
            updatedAt: new Date(),
          },
        });

        // 4. Registrar decisão de desfazer (ML)
        const decision = await tx.workoutMatchDecision.findFirst({
          where: {
            userId,
            suggestedWorkoutId: adjustment.workoutId,
          },
          orderBy: { createdAt: 'desc' },
        });

        if (decision) {
          await tx.workoutMatchDecision.update({
            where: { id: decision.id },
            data: {
              action: 'rejected',
            },
          });
        }
      });

      return {
        success: true,
        adjustmentId,
        message: 'Ajuste desfeito com sucesso',
        workoutId: adjustment.workoutId,
      };
    } catch (error: any) {
      console.error('[AdjustmentEngine] Error undoing adjustment:', error);
      return {
        success: false,
        message: `Erro ao desfazer ajuste: ${error.message}`,
        workoutId: 0,
      };
    }
  }

  /**
   * Rejeita sugestão de ajuste
   */
  async rejectSuggestion(
    userId: string,
    completedWorkoutId: number,
    plannedWorkoutId: number,
    confidence: number,
    reason?: string
  ): Promise<void> {
    try {
      await prisma.workoutMatchDecision.create({
        data: {
          userId,
          completedWorkoutId,
          suggestedWorkoutId: plannedWorkoutId,
          confidence,
          action: 'rejected',
          dayOfWeek: dayjs().day(),
        },
      });
    } catch (error) {
      console.error('[AdjustmentEngine] Error rejecting suggestion:', error);
    }
  }

  /**
   * Busca histórico de ajustes de um usuário
   */
  async getAdjustmentHistory(
    userId: string,
    limit: number = 50
  ): Promise<any[]> {
    try {
      const profile = await prisma.athleteProfile.findUnique({
        where: { userId },
      });

      if (!profile) return [];

      const plan = await prisma.customTrainingPlan.findFirst({
        where: { athleteId: profile.id },
      });

      if (!plan) return [];

      const adjustments = await prisma.workoutAdjustment.findMany({
        where: {
          workout: {
            week: {
              planId: plan.id,
            },
          },
        },
        include: {
          workout: {
            select: {
              id: true,
              title: true,
              date: true,
              distance: true,
              type: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });

      return adjustments;
    } catch (error) {
      console.error('[AdjustmentEngine] Error fetching history:', error);
      return [];
    }
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private calculateVolumeVariance(
    completedDistance: number | null,
    plannedDistance: number | null
  ): number | null {
    if (!completedDistance || !plannedDistance) return null;
    return ((completedDistance - plannedDistance) / plannedDistance) * 100;
  }

  private generateDefaultReason(
    completed: any,
    planned: any
  ): string {
    const daysDiff = Math.abs(dayjs(completed.date).diff(dayjs(planned.date), 'day'));
    
    if (daysDiff === 0) {
      return 'Treino executado na data planejada';
    } else if (daysDiff === 1) {
      return `Treino antecipado/adiado em 1 dia`;
    } else {
      return `Treino realizado ${daysDiff} dias ${
        dayjs(completed.date).isBefore(planned.date) ? 'antes' : 'depois'
      } do planejado`;
    }
  }

  private getSuccessMessage(
    completed: any,
    planned: any,
    autoApplied: boolean
  ): string {
    const variance = this.calculateVolumeVariance(completed.distance, planned.distance);
    const varianceText = variance
      ? ` (${variance > 0 ? '+' : ''}${variance.toFixed(0)}% volume)`
      : '';

    if (autoApplied) {
      return `✅ Ajuste aplicado automaticamente${varianceText}`;
    }

    return `✅ Treino marcado como completo${varianceText}`;
  }

  private async getWeekOfPlan(
    workoutId: number,
    tx: any
  ): Promise<number | null> {
    try {
      const workout = await tx.customWorkout.findUnique({
        where: { id: workoutId },
        include: {
          week: true,
        },
      });

      return workout?.week?.weekNumber || null;
    } catch {
      return null;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const adjustmentEngine = new AdjustmentEngine();
