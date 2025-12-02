// lib/athera-flex/proactive/BestDaySuggester.ts
// ATHERA FLEX - Best Day Suggester
import { prisma } from '@/lib/prisma';
import { ContextAwarenessEngine } from '../context/ContextAwarenessEngine';

interface DaySuggestion {
  date: Date;
  day_name: string;
  score: number;
  reasons: string[];
  weather: string;
  recovery_status: string;
  recommended_workout_type: string;
}

export class BestDaySuggester {
  private contextEngine: ContextAwarenessEngine;

  constructor() {
    this.contextEngine = new ContextAwarenessEngine();
  }

  async suggestBestDays(user_id: number): Promise<DaySuggestion[]> {
    const today = new Date();
    const next_week_start = new Date(today);
    next_week_start.setDate(today.getDate() + 7);

    const suggestions: DaySuggestion[] = [];

    for (let day = 0; day < 7; day++) {
      const date = new Date(next_week_start);
      date.setDate(date.getDate() + day);

      const suggestion = await this.analyzeSingleDay(user_id, date);
      suggestions.push(suggestion);
    }

    return suggestions.sort((a, b) => b.score - a.score);
  }

  private async analyzeSingleDay(user_id: number, date: Date): Promise<DaySuggestion> {
    const context = await this.contextEngine.analyzeContext(user_id, date);

    const score = this.calculateDayScore(context, date);
    const reasons = this.generateReasons(context, date);
    const recommended_type = this.recommendWorkoutType(context, date);

    return {
      date,
      day_name: this.getDayName(date),
      score,
      reasons,
      weather: context.weather_suitable ? 'Favorável' : 'Atenção',
      recovery_status: context.recovery_adequate ? 'Recuperado' : 'Cansaço residual',
      recommended_workout_type: recommended_type,
    };
  }

  private calculateDayScore(context: any, date: Date): number {
    let score = 50;

    if (context.weather_suitable) score += 30;
    if (context.recovery_adequate) score += 25;
    if (!context.has_conflicting_event) score += 20;

    const day_of_week = date.getDay();
    if (day_of_week === 0 || day_of_week === 6) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  private generateReasons(context: any, date: Date): string[] {
    const reasons: string[] = [];

    if (context.weather_suitable) reasons.push('🌤️ Clima favorável para corrida');
    if (context.recovery_adequate) reasons.push('💪 Totalmente recuperado');
    if (!context.has_conflicting_event) reasons.push('📅 Agenda livre');

    const day_of_week = date.getDay();
    if (day_of_week === 0 || day_of_week === 6) {
      reasons.push('🏖️ Final de semana - mais tempo disponível');
    }

    if (reasons.length === 0) reasons.push('✅ Dia viável para treino');

    return reasons;
  }

  private recommendWorkoutType(context: any, date: Date): string {
    const day_of_week = date.getDay();

    if (day_of_week === 0 || day_of_week === 6) {
      return context.recovery_adequate && context.weather_suitable
        ? 'Longão (volume alto)'
        : 'Corrida Leve (recuperação)';
    }

    if (day_of_week >= 2 && day_of_week <= 4) {
      return context.recovery_adequate
        ? 'Intervalado ou Fartlek (qualidade)'
        : 'Ritmo Moderado';
    }

    return 'Corrida Leve ou Regenerativo';
  }

  private getDayName(date: Date): string {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[date.getDay()];
  }

  async suggestBestDayFor(user_id: number, workout_type: string): Promise<DaySuggestion | null> {
    const all_suggestions = await this.suggestBestDays(user_id);

    const matches = all_suggestions.filter((s) =>
      s.recommended_workout_type.toLowerCase().includes(workout_type.toLowerCase())
    );

    return matches.length > 0 ? matches[0] : all_suggestions[0];
  }
}
