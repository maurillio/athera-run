// lib/athera-flex/proactive/WeekOptimizer.ts
// ATHERA FLEX - Proactive Mode: Week Optimizer
// Otimiza distribuição de treinos na semana considerando contexto

import { prisma } from '@/lib/prisma';
import { ContextAwarenessEngine } from '../context/ContextAwarenessEngine';

interface OptimizationSuggestion {
  workout_id: number;
  current_date: Date;
  suggested_date: Date;
  reason: string;
  confidence: number;
  impact: {
    volume_change: number;
    recovery_improvement: number;
    weather_score: number;
  };
}

interface WeekOptimizationResult {
  week_start: Date;
  week_end: Date;
  suggestions: OptimizationSuggestion[];
  total_volume_km: number;
  optimized_volume_km: number;
  improvement_score: number;
}

export class WeekOptimizer {
  private contextEngine: ContextAwarenessEngine;

  constructor() {
    this.contextEngine = new ContextAwarenessEngine();
  }

  async analyzeWeek(
    user_id: number,
    week_start: Date
  ): Promise<WeekOptimizationResult> {
    const week_end = new Date(week_start);
    week_end.setDate(week_end.getDate() + 7);

    const workouts = await prisma.custom_workouts.findMany({
      where: {
        user_id,
        date: {
          gte: week_start,
          lt: week_end,
        },
      },
      orderBy: { date: 'asc' },
    });

    if (workouts.length === 0) {
      return {
        week_start,
        week_end,
        suggestions: [],
        total_volume_km: 0,
        optimized_volume_km: 0,
        improvement_score: 0,
      };
    }

    const total_volume_km = workouts.reduce((sum, w) => {
      const distance = parseFloat(w.distance || '0');
      return sum + (isNaN(distance) ? 0 : distance);
    }, 0);

    const suggestions: OptimizationSuggestion[] = [];

    for (const workout of workouts) {
      const suggestion = await this.analyzeWorkoutPlacement(
        user_id,
        workout,
        workouts,
        week_start,
        week_end
      );

      if (suggestion && suggestion.confidence > 0.6) {
        suggestions.push(suggestion);
      }
    }

    const optimized_volume_km = total_volume_km;
    const improvement_score = this.calculateImprovementScore(suggestions);

    return {
      week_start,
      week_end,
      suggestions,
      total_volume_km,
      optimized_volume_km,
      improvement_score,
    };
  }

  private async analyzeWorkoutPlacement(
    user_id: number,
    workout: any,
    all_workouts: any[],
    week_start: Date,
    week_end: Date
  ): Promise<OptimizationSuggestion | null> {
    const current_date = new Date(workout.date);
    let best_alternative: OptimizationSuggestion | null = null;
    let best_score = 0;

    for (let day_offset = 0; day_offset < 7; day_offset++) {
      const candidate_date = new Date(week_start);
      candidate_date.setDate(candidate_date.getDate() + day_offset);

      if (candidate_date.toDateString() === current_date.toDateString()) {
        continue;
      }

      const context = await this.contextEngine.analyzeContext(
        user_id,
        candidate_date
      );

      const score = this.calculateDayScore(
        workout,
        context,
        all_workouts,
        candidate_date
      );

      if (score > best_score && score > 70) {
        const impact = {
          volume_change: 0,
          recovery_improvement: context.recovery_adequate ? 20 : 0,
          weather_score: context.weather_suitable ? 30 : 0,
        };

        best_score = score;
        best_alternative = {
          workout_id: workout.id,
          current_date,
          suggested_date: candidate_date,
          reason: this.generateReason(workout, context),
          confidence: score / 100,
          impact,
        };
      }
    }

    return best_alternative;
  }

  private calculateDayScore(
    workout: any,
    context: any,
    all_workouts: any[],
    candidate_date: Date
  ): number {
    let score = 50;

    if (context.weather_suitable) score += 30;
    if (!context.has_conflicting_event) score += 20;
    if (context.recovery_adequate) score += 20;

    const day_of_week = candidate_date.getDay();
    const workout_type = workout.workout_type || '';

    if (workout_type.includes('Longão') && (day_of_week === 0 || day_of_week === 6)) {
      score += 10;
    }

    if (
      (workout_type.includes('Intervalado') || workout_type.includes('Fartlek')) &&
      day_of_week >= 2 &&
      day_of_week <= 4
    ) {
      score += 10;
    }

    const volume_on_day = this.getVolumeOnDay(all_workouts, candidate_date);
    if (volume_on_day > 15) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  private generateReason(workout: any, context: any): string {
    const reasons: string[] = [];

    if (context.weather_suitable) reasons.push('clima favorável');
    if (!context.has_conflicting_event) reasons.push('agenda livre');
    if (context.recovery_adequate) reasons.push('melhor recuperação');

    return reasons.length > 0
      ? reasons.join(', ')
      : 'Melhor distribuição de volume semanal';
  }

  private calculateImprovementScore(suggestions: OptimizationSuggestion[]): number {
    if (suggestions.length === 0) return 0;

    const avg_confidence =
      suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length;

    const avg_impact =
      suggestions.reduce(
        (sum, s) =>
          sum + (s.impact.recovery_improvement + s.impact.weather_score) / 2,
        0
      ) / suggestions.length;

    return Math.round((avg_confidence * 0.6 + (avg_impact / 100) * 0.4) * 100);
  }

  private getVolumeOnDay(workouts: any[], date: Date): number {
    return workouts
      .filter((w) => new Date(w.date).toDateString() === date.toDateString())
      .reduce((sum, w) => {
        const distance = parseFloat(w.distance || '0');
        return sum + (isNaN(distance) ? 0 : distance);
      }, 0);
  }
}
