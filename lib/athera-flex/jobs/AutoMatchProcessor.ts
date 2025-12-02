/**
 * ATHERA FLEX - Background Job: Auto Match Processor
 * Processa automaticamente matches de treinos quando Strava sync acontece
 * Fase 3 - Sessão 4
 */

import { db } from '@/lib/db';
import { MLOrchestrator } from '../ml/MLOrchestrator';
import { notificationService } from '@/lib/notifications/NotificationService';

export class AutoMatchProcessor {
  private orchestrator: MLOrchestrator;

  constructor() {
    this.orchestrator = new MLOrchestrator();
  }

  /**
   * Processa todas atividades novas do Strava e tenta fazer match automático
   * Chamado após sync do Strava
   */
  async processNewActivities(userId: string): Promise<{
    processed: number;
    matched: number;
    pending: number;
  }> {
    console.log(`[AutoMatch] Iniciando processamento para user ${userId}`);

    try {
      // 1. Busca atividades recentes (últimos 7 dias) ainda não processadas
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentActivities = await db.stravaActivity.findMany({
        where: {
          userId,
          start_date: {
            gte: sevenDaysAgo
          },
          // Atividades que ainda não têm decisão
          NOT: {
            workout_match_decisions: {
              some: {}
            }
          }
        },
        orderBy: {
          start_date: 'asc'
        }
      });

      console.log(`[AutoMatch] ${recentActivities.length} atividades para processar`);

      let matched = 0;
      let pending = 0;

      // 2. Para cada atividade, busca treino planejado correspondente
      for (const activity of recentActivities) {
        const result = await this.tryAutoMatch(userId, activity);
        
        if (result.matched) {
          matched++;
        } else {
          pending++;
        }
      }

      console.log(`[AutoMatch] Finalizado - Matched: ${matched}, Pending: ${pending}`);

      return {
        processed: recentActivities.length,
        matched,
        pending
      };

    } catch (error) {
      console.error('[AutoMatch] Erro ao processar:', error);
      throw error;
    }
  }

  /**
   * Tenta fazer match automático de uma atividade específica
   */
  private async tryAutoMatch(
    userId: string,
    activity: any
  ): Promise<{ matched: boolean; reason?: string }> {
    try {
      // 1. Busca treinos planejados próximos à data da atividade
      const activityDate = new Date(activity.start_date);
      const searchStart = new Date(activityDate);
      searchStart.setDate(searchStart.getDate() - 3); // 3 dias antes
      const searchEnd = new Date(activityDate);
      searchEnd.setDate(searchEnd.getDate() + 3); // 3 dias depois

      const candidateWorkouts = await db.customWorkout.findMany({
        where: {
          training_plan: {
            user_id: userId
          },
          date: {
            gte: searchStart,
            lte: searchEnd
          },
          // Ainda não tem atividade associada
          executed_workout_id: null
        },
        include: {
          training_plan: {
            include: {
              race_goal: true
            }
          }
        },
        orderBy: {
          date: 'asc'
        }
      });

      if (candidateWorkouts.length === 0) {
        console.log(`[AutoMatch] Nenhum treino candidato para atividade ${activity.activity_id}`);
        return { matched: false, reason: 'no_candidate_workouts' };
      }

      // 2. Tenta match com cada candidato (do mais próximo ao mais distante)
      for (const workout of candidateWorkouts) {
        const matchResult = await this.orchestrator.decide({
          userId,
          scenario: 'check_match',
          data: {
            planned: {
              workoutType: workout.workout_type || 'easy',
              distance: workout.distance || 0,
              duration: workout.duration || 0,
              pace: workout.target_pace,
              description: workout.description
            },
            executed: {
              distance: activity.distance / 1000,
              duration: activity.moving_time,
              pace: (activity.moving_time / 60) / (activity.distance / 1000),
              heartRate: activity.average_heartrate,
              elevation: activity.total_elevation_gain,
            },
            context: {
              scheduledDate: workout.date,
              executedDate: activityDate,
            }
          }
        });

        // 3. Se match score >= 85%, aceita automaticamente
        const matchScore = matchResult.mlMetadata.scores.matchScore;
        
        if (matchScore >= 85) {
          // Registra decisão
          await db.workoutMatchDecision.create({
            data: {
              user_id: userId,
              planned_workout_id: workout.id,
              strava_activity_id: activity.activity_id.toString(),
              match_score: matchScore,
              was_accepted: true,
              decision_source: 'automatic',
              ml_confidence: matchResult.confidence,
              ml_reasoning: matchResult.reasoning
            }
          });

          // Atualiza workout
          await db.customWorkout.update({
            where: { id: workout.id },
            data: {
              executed_workout_id: Number(activity.activity_id),
              was_rescheduled: false
            }
          });

          console.log(`[AutoMatch] ✅ Match automático: Activity ${activity.activity_id} → Workout ${workout.id} (score: ${matchScore}%)`);

          // Envia notificação de auto-aceite
          await this.sendAutoMatchNotification({
            userId,
            workoutName: workout.name || workout.workout_type,
            activityDate: activityDate,
            matchScore
          });

          return { matched: true };
        }

        // 4. Se match score entre 60-84%, registra como pendente revisão
        if (matchScore >= 60) {
          await db.workoutMatchDecision.create({
            data: {
              user_id: userId,
              planned_workout_id: workout.id,
              strava_activity_id: activity.activity_id.toString(),
              match_score: matchScore,
              was_accepted: false, // Pendente
              decision_source: 'automatic',
              ml_confidence: matchResult.confidence,
              ml_reasoning: matchResult.reasoning
            }
          });

          console.log(`[AutoMatch] ⏳ Match pendente: Activity ${activity.activity_id} → Workout ${workout.id} (score: ${matchScore}%)`);

          // Envia notificação de match encontrado (precisa revisar)
          await this.sendPendingMatchNotification({
            userId,
            workoutName: workout.name || workout.workout_type,
            activityDate: activityDate,
            matchScore
          });
          return { matched: false, reason: 'pending_review' };
        }
      }

      console.log(`[AutoMatch] ❌ Nenhum match encontrado para activity ${activity.activity_id}`);
      return { matched: false, reason: 'no_match_found' };

    } catch (error) {
      console.error(`[AutoMatch] Erro ao processar activity ${activity.activity_id}:`, error);
      return { matched: false, reason: 'error' };
    }
  }

  /**
   * Processa matches pendentes que precisam de revisão do usuário
   */
  async getPendingMatches(userId: string): Promise<any[]> {
    const pending = await db.workoutMatchDecision.findMany({
      where: {
        user_id: userId,
        was_accepted: false,
        match_score: {
          gte: 60 // Apenas scores razoáveis
        }
      },
      include: {
        custom_workout: {
          include: {
            training_plan: {
              include: {
                race_goal: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Busca dados da atividade Strava para cada match pendente
    const pendingWithActivity = await Promise.all(
      pending.map(async (match) => {
        const activity = await db.stravaActivity.findUnique({
          where: {
            userId_activity_id: {
              userId: userId,
              activity_id: BigInt(match.strava_activity_id)
            }
          }
        });

        return {
          ...match,
          strava_activity: activity
        };
      })
    );

    return pendingWithActivity;
  }

  /**
   * Usuário aceita ou rejeita match pendente
   */
  async resolveMatch(
    userId: string,
    decisionId: number,
    accept: boolean,
    userReason?: string
  ): Promise<void> {
    const decision = await db.workoutMatchDecision.findUnique({
      where: { id: decisionId },
      include: { custom_workout: true }
    });

    if (!decision || decision.user_id !== userId) {
      throw new Error('Decision not found or unauthorized');
    }

    // Atualiza decisão
    await db.workoutMatchDecision.update({
      where: { id: decisionId },
      data: {
        was_accepted: accept,
        decision_source: 'manual',
        user_feedback: userReason,
        resolved_at: new Date()
      }
    });

    // Se aceito, atualiza workout
    if (accept) {
      await db.customWorkout.update({
        where: { id: decision.planned_workout_id },
        data: {
          executed_workout_id: Number(decision.strava_activity_id),
          was_rescheduled: false
        }
      });

      console.log(`[AutoMatch] ✅ Usuário aceitou match: Decision ${decisionId}`);
    } else {
      console.log(`[AutoMatch] ❌ Usuário rejeitou match: Decision ${decisionId} - Reason: ${userReason}`);
    }

    // TODO: Usar feedback para melhorar ML (aprendizado)
  }

  /**
   * Envia notificação quando match é aceito automaticamente
   */
  private async sendAutoMatchNotification(params: {
    userId: string;
    workoutName: string;
    activityDate: Date;
    matchScore: number;
  }): Promise<void> {
    try {
      const { userId, workoutName, activityDate, matchScore } = params;
      
      const dateFormatted = activityDate.toLocaleDateString('pt-BR');
      
      await notificationService.send({
        userId,
        type: 'auto_accepted',
        title: '✅ Treino Sincronizado Automaticamente',
        message: `O treino "${workoutName}" foi sincronizado com sua atividade do Strava de ${dateFormatted}. Confiança: ${Math.round(matchScore)}%`,
        data: {
          workoutName,
          date: activityDate.toISOString(),
          matchScore
        },
        actionUrl: `/calendar?date=${activityDate.toISOString().split('T')[0]}`
      });
    } catch (error) {
      console.error('[AutoMatch] Failed to send auto-match notification:', error);
    }
  }

  /**
   * Envia notificação quando match precisa de revisão
   */
  private async sendPendingMatchNotification(params: {
    userId: string;
    workoutName: string;
    activityDate: Date;
    matchScore: number;
  }): Promise<void> {
    try {
      const { userId, workoutName, activityDate, matchScore } = params;
      
      const dateFormatted = activityDate.toLocaleDateString('pt-BR');
      
      await notificationService.send({
        userId,
        type: 'match_found',
        title: '🔔 Possível Match Encontrado',
        message: `Encontramos uma atividade do Strava (${dateFormatted}) que pode corresponder ao treino "${workoutName}". Revise e confirme. Confiança: ${Math.round(matchScore)}%`,
        data: {
          workoutName,
          date: activityDate.toISOString(),
          matchScore
        },
        actionUrl: `/flex/pending`
      });
    } catch (error) {
      console.error('[AutoMatch] Failed to send pending-match notification:', error);
    }
  }
}
