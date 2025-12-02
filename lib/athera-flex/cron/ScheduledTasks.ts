// lib/athera-flex/cron/ScheduledTasks.ts
/**
 * ATHERA FLEX - Scheduled Tasks
 * Tarefas agendadas para processar matches automaticamente
 * 
 * IMPORTANTE: Estas funções devem ser chamadas via Vercel Cron Jobs
 * Configurar em vercel.json
 */

import { prisma } from '@/lib/prisma';
import { WorkoutMatcher } from '../core/WorkoutMatcher';
import { adjustmentEngine } from '../adjustment-engine';
import { mlOrchestrator } from '../ml/MLOrchestrator';
import { notificationService } from '@/lib/notifications/NotificationService';

interface CronJobResult {
  success: boolean;
  matchesFound: number;
  autoAccepted: number;
  suggestionsSent: number;
  errors: string[];
  executionTime: number;
}

export class ScheduledTasks {
  private static instance: ScheduledTasks;

  private constructor() {}

  public static getInstance(): ScheduledTasks {
    if (!ScheduledTasks.instance) {
      ScheduledTasks.instance = new ScheduledTasks();
    }
    return ScheduledTasks.instance;
  }

  /**
   * CRON 1: Processa matches diários (roda a cada 6 horas)
   * Detecta novos treinos do Strava e tenta match automático
   */
  async processDailyMatches(): Promise<CronJobResult> {
    const startTime = Date.now();
    const result: CronJobResult = {
      success: true,
      matchesFound: 0,
      autoAccepted: 0,
      suggestionsSent: 0,
      errors: [],
      executionTime: 0
    };

    try {
      console.log('[ATHERA FLEX CRON] Iniciando processamento diário de matches...');

      // Busca todos usuários com Athera Flex ativo
      const activeUsers = await prisma.user_flex_settings.findMany({
        where: {
          auto_detect_enabled: true
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              subscription_tier: true
            }
          }
        }
      });

      console.log(`[ATHERA FLEX CRON] ${activeUsers.length} usuários ativos encontrados`);

      // Processa cada usuário
      for (const userSettings of activeUsers) {
        try {
          const userId = userSettings.user_id;

          // Busca treinos do Strava não matcheados (últimas 48h)
          const recentWorkouts = await this.getUnmatchedStravaWorkouts(userId);

          if (recentWorkouts.length === 0) continue;

          console.log(`[ATHERA FLEX CRON] User ${userId}: ${recentWorkouts.length} treinos para processar`);

          // Tenta match para cada treino
          for (const workout of recentWorkouts) {
            try {
              const matcher = new WorkoutMatcher();
              const matches = await matcher.findMatches({
                userId,
                executedWorkout: workout,
                flexibilityWindow: userSettings.flexibility_window
              });

              if (matches.length === 0) continue;

              result.matchesFound++;
              const bestMatch = matches[0];

              // Decide se aceita automaticamente ou sugere
              if (bestMatch.score >= userSettings.auto_accept_threshold) {
                // Auto-aceita
                await this.autoAcceptMatch(userId, bestMatch, workout);
                result.autoAccepted++;

                // Notifica
                await notificationService.notifyAutoAccepted(userId, {
                  matchId: bestMatch.id,
                  executedWorkout: workout,
                  plannedWorkout: bestMatch.plannedWorkout,
                  score: bestMatch.score
                });

              } else {
                // Salva como sugestão
                await this.saveSuggestion(userId, bestMatch, workout);
                result.suggestionsSent++;

                // Notifica
                await notificationService.notifyMatchFound(userId, {
                  matchId: bestMatch.id,
                  executedWorkout: workout,
                  plannedWorkout: bestMatch.plannedWorkout,
                  score: bestMatch.score
                });
              }

            } catch (error) {
              console.error(`[ATHERA FLEX CRON] Erro processando treino ${workout.id}:`, error);
              result.errors.push(`Workout ${workout.id}: ${error}`);
            }
          }

        } catch (error) {
          console.error(`[ATHERA FLEX CRON] Erro processando user ${userSettings.user_id}:`, error);
          result.errors.push(`User ${userSettings.user_id}: ${error}`);
        }
      }

      result.executionTime = Date.now() - startTime;
      console.log('[ATHERA FLEX CRON] Processamento concluído:', result);

    } catch (error) {
      console.error('[ATHERA FLEX CRON] Erro crítico:', error);
      result.success = false;
      result.errors.push(`Critical: ${error}`);
      result.executionTime = Date.now() - startTime;
    }

    return result;
  }

  /**
   * CRON 2: Treina modelos ML (roda 1x por dia, meia-noite)
   * Atualiza modelos com novos dados
   */
  async trainMLModels(): Promise<CronJobResult> {
    const startTime = Date.now();
    const result: CronJobResult = {
      success: true,
      matchesFound: 0,
      autoAccepted: 0,
      suggestionsSent: 0,
      errors: [],
      executionTime: 0
    };

    try {
      console.log('[ATHERA FLEX CRON] Iniciando treinamento de modelos ML...');

      // Busca usuários com dados suficientes para treinar
      const usersWithData = await prisma.workout_match_decisions.groupBy({
        by: ['user_id'],
        _count: { id: true },
        having: {
          id: {
            _count: {
              gte: 10 // mínimo 10 decisões
            }
          }
        }
      });

      console.log(`[ATHERA FLEX CRON] ${usersWithData.length} usuários com dados suficientes`);

      // Treina modelo para cada usuário
      for (const userData of usersWithData) {
        try {
          await mlOrchestrator.trainUserModels(userData.user_id);
          console.log(`[ATHERA FLEX CRON] Modelo treinado para user ${userData.user_id}`);
        } catch (error) {
          console.error(`[ATHERA FLEX CRON] Erro treinando user ${userData.user_id}:`, error);
          result.errors.push(`User ${userData.user_id} training failed: ${error}`);
        }
      }

      result.executionTime = Date.now() - startTime;
      console.log('[ATHERA FLEX CRON] Treinamento concluído:', result);

    } catch (error) {
      console.error('[ATHERA FLEX CRON] Erro crítico no treinamento:', error);
      result.success = false;
      result.errors.push(`Critical: ${error}`);
      result.executionTime = Date.now() - startTime;
    }

    return result;
  }

  /**
   * CRON 3: Limpa notificações antigas (roda 1x por semana)
   * Remove notificações lidas com mais de 30 dias
   */
  async cleanupOldNotifications(): Promise<CronJobResult> {
    const startTime = Date.now();
    const result: CronJobResult = {
      success: true,
      matchesFound: 0,
      autoAccepted: 0,
      suggestionsSent: 0,
      errors: [],
      executionTime: 0
    };

    try {
      console.log('[ATHERA FLEX CRON] Iniciando limpeza de notificações antigas...');

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deleted = await prisma.notifications.deleteMany({
        where: {
          read: true,
          created_at: {
            lt: thirtyDaysAgo
          }
        }
      });

      console.log(`[ATHERA FLEX CRON] ${deleted.count} notificações removidas`);

      result.executionTime = Date.now() - startTime;

    } catch (error) {
      console.error('[ATHERA FLEX CRON] Erro na limpeza:', error);
      result.success = false;
      result.errors.push(`Cleanup failed: ${error}`);
      result.executionTime = Date.now() - startTime;
    }

    return result;
  }

  /**
   * CRON 4: Ajusta thresholds inteligentes (roda 1x por dia)
   * Analisa padrões e sugere ajustes
   */
  async adjustIntelligentThresholds(): Promise<CronJobResult> {
    const startTime = Date.now();
    const result: CronJobResult = {
      success: true,
      matchesFound: 0,
      autoAccepted: 0,
      suggestionsSent: 0,
      errors: [],
      executionTime: 0
    };

    try {
      console.log('[ATHERA FLEX CRON] Iniciando ajuste de thresholds...');

      const activeUsers = await prisma.user_flex_settings.findMany({
        where: {
          auto_detect_enabled: true
        }
      });

      for (const user of activeUsers) {
        try {
          const recommendation = await mlOrchestrator.recommendThresholdAdjustment(user.user_id);

          if (recommendation) {
            // Notifica usuário sobre sugestão de ajuste
            await notificationService.notifyThresholdRecommendation(
              user.user_id,
              recommendation
            );
            result.suggestionsSent++;
          }

        } catch (error) {
          console.error(`[ATHERA FLEX CRON] Erro ajustando user ${user.user_id}:`, error);
          result.errors.push(`User ${user.user_id}: ${error}`);
        }
      }

      result.executionTime = Date.now() - startTime;
      console.log('[ATHERA FLEX CRON] Ajuste concluído:', result);

    } catch (error) {
      console.error('[ATHERA FLEX CRON] Erro crítico:', error);
      result.success = false;
      result.errors.push(`Critical: ${error}`);
      result.executionTime = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Helper: Busca treinos não matcheados
   */
  private async getUnmatchedStravaWorkouts(userId: number): Promise<any[]> {
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

    // Busca treinos do Strava que ainda não têm match
    const workouts = await prisma.$queryRaw`
      SELECT sw.*
      FROM strava_workouts sw
      LEFT JOIN workout_adjustments wa ON wa.executed_workout_id = sw.id
      WHERE sw.user_id = ${userId}
        AND sw.start_date >= ${fortyEightHoursAgo}
        AND wa.id IS NULL
      ORDER BY sw.start_date DESC
    `;

    return workouts as any[];
  }

  /**
   * Helper: Auto-aceita match
   */
  private async autoAcceptMatch(userId: number, match: any, workout: any): Promise<void> {
    await adjustmentEngine.applyAdjustment({
      userId,
      adjustmentId: match.id,
      decision: 'accept',
      executedWorkoutId: workout.id,
      appliedBy: 'system_auto',
      autoAccepted: true
    });

    // Registra decisão para ML
    await prisma.workout_match_decisions.create({
      data: {
        user_id: userId,
        match_id: match.id,
        decision: 'accept',
        confidence_score: match.score,
        auto_decided: true,
        decided_at: new Date()
      }
    });
  }

  /**
   * Helper: Salva sugestão para usuário revisar
   */
  private async saveSuggestion(userId: number, match: any, workout: any): Promise<void> {
    await prisma.workout_adjustments.create({
      data: {
        user_id: userId,
        custom_workout_id: match.plannedWorkout.id,
        adjustment_type: 'reschedule',
        status: 'pending',
        original_date: match.plannedWorkout.scheduled_date,
        new_date: workout.start_date,
        confidence_score: match.score,
        suggested_by: 'system',
        executed_workout_id: workout.id
      }
    });
  }
}

export const scheduledTasks = ScheduledTasks.getInstance();
