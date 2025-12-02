// lib/athera-flex/proactive/ProactiveOrchestrator.ts
// ATHERA FLEX - Proactive Orchestrator
import { WeekOptimizer } from './WeekOptimizer';
import { BestDaySuggester } from './BestDaySuggester';
import { prisma } from '@/lib/prisma';

interface ProactiveSuggestion {
  type: 'week_optimization' | 'best_day' | 'volume_warning';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action?: {
    type: string;
    data: any;
  };
  expires_at: Date;
}

export class ProactiveOrchestrator {
  private weekOptimizer: WeekOptimizer;
  private bestDaySuggester: BestDaySuggester;

  constructor() {
    this.weekOptimizer = new WeekOptimizer();
    this.bestDaySuggester = new BestDaySuggester();
  }

  async generateProactiveSuggestions(user_id: number): Promise<ProactiveSuggestion[]> {
    const suggestions: ProactiveSuggestion[] = [];

    const week_optimization = await this.checkWeekOptimization(user_id);
    if (week_optimization) suggestions.push(week_optimization);

    const best_days = await this.checkBestDays(user_id);
    if (best_days) suggestions.push(best_days);

    const volume_warning = await this.checkVolumeWarning(user_id);
    if (volume_warning) suggestions.push(volume_warning);

    return suggestions.sort((a, b) => {
      const priority_order = { high: 3, medium: 2, low: 1 };
      return priority_order[b.priority] - priority_order[a.priority];
    });
  }

  private async checkWeekOptimization(user_id: number): Promise<ProactiveSuggestion | null> {
    const today = new Date();
    const week_start = new Date(today);
    week_start.setDate(today.getDate() - today.getDay());

    const result = await this.weekOptimizer.analyzeWeek(user_id, week_start);

    if (result.suggestions.length > 0 && result.improvement_score > 50) {
      const expires_at = new Date();
      expires_at.setDate(expires_at.getDate() + 3);

      return {
        type: 'week_optimization',
        priority: 'high',
        title: `📊 Encontramos ${result.suggestions.length} oportunidade(s) de otimização`,
        description: `Podemos melhorar sua semana em ${result.improvement_score}% reorganizando ${result.suggestions.length} treino(s)`,
        action: {
          type: 'view_week_optimization',
          data: {
            week_start: result.week_start,
            suggestions: result.suggestions,
            improvement_score: result.improvement_score,
          },
        },
        expires_at,
      };
    }

    return null;
  }

  private async checkBestDays(user_id: number): Promise<ProactiveSuggestion | null> {
    const suggestions = await this.bestDaySuggester.suggestBestDays(user_id);
    const best_days = suggestions.filter((s) => s.score > 80).slice(0, 3);

    if (best_days.length > 0) {
      const expires_at = new Date();
      expires_at.setDate(expires_at.getDate() + 7);

      return {
        type: 'best_day',
        priority: 'medium',
        title: `🎯 ${best_days.length} dia(s) ideais na próxima semana`,
        description: `${best_days[0].day_name} é o melhor dia (score ${best_days[0].score}/100)`,
        action: {
          type: 'view_best_days',
          data: { days: best_days },
        },
        expires_at,
      };
    }

    return null;
  }

  private async checkVolumeWarning(user_id: number): Promise<ProactiveSuggestion | null> {
    const today = new Date();
    const week_start = new Date(today);
    week_start.setDate(today.getDate() - today.getDay());

    const week_end = new Date(week_start);
    week_end.setDate(week_end.getDate() + 7);

    const workouts = await prisma.custom_workouts.findMany({
      where: {
        user_id,
        date: { gte: week_start, lt: week_end },
      },
    });

    const total_volume = workouts.reduce((sum, w) => {
      const distance = parseFloat(w.distance || '0');
      return sum + (isNaN(distance) ? 0 : distance);
    }, 0);

    const settings = await prisma.user_flex_settings.findUnique({
      where: { user_id },
    });

    if (settings && settings.preferred_volume_km) {
      const target = settings.preferred_volume_km;
      const progress = (total_volume / target) * 100;

      if (progress < 70 || progress > 120) {
        const expires_at = new Date();
        expires_at.setDate(expires_at.getDate() + 2);

        return {
          type: 'volume_warning',
          priority: progress < 70 ? 'medium' : 'high',
          title: progress < 70 ? '⚠️ Volume abaixo da meta' : '⚠️ Volume acima da meta',
          description:
            progress < 70
              ? `Você está ${Math.round(100 - progress)}% abaixo da meta semanal`
              : `Você está ${Math.round(progress - 100)}% acima da meta semanal`,
          action: {
            type: 'adjust_volume',
            data: { current: total_volume, target, progress },
          },
          expires_at,
        };
      }
    }

    return null;
  }

  async applyWeekOptimization(
    user_id: number,
    week_start: Date,
    selected_suggestions: number[]
  ): Promise<{ success: boolean; applied_count: number }> {
    const result = await this.weekOptimizer.analyzeWeek(user_id, week_start);
    let applied_count = 0;

    for (const suggestion of result.suggestions) {
      if (selected_suggestions.includes(suggestion.workout_id)) {
        await prisma.custom_workouts.update({
          where: { id: suggestion.workout_id },
          data: {
            date: suggestion.suggested_date,
            was_rescheduled: true,
            original_date: suggestion.current_date,
            rescheduled_by: 'proactive_optimization',
            rescheduled_reason: suggestion.reason,
          },
        });

        await prisma.workout_adjustments.create({
          data: {
            user_id,
            original_workout_id: suggestion.workout_id,
            adjustment_type: 'reschedule',
            reason: `Otimização proativa: ${suggestion.reason}`,
            confidence_score: suggestion.confidence,
            created_at: new Date(),
          },
        });

        applied_count++;
      }
    }

    return { success: true, applied_count };
  }
}
