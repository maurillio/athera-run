// lib/athera-flex/ml/LearningSystem.ts
/**
 * ATHERA FLEX - Learning System
 * Sistema de aprendizado contínuo que evolui com as decisões do usuário
 */

import { prisma } from '@/lib/prisma';

interface UserDecisionPattern {
  userId: number;
  acceptanceRate: number;
  preferredWindow: number; // dias antes/depois
  preferredVolumeAdjustment: number; // % de ajuste
  rejectionReasons: string[];
  dayOfWeekPreference: Record<string, number>; // 0-6 = domingo-sábado
  lastUpdated: Date;
}

interface ThresholdAdjustment {
  userId: number;
  currentMatchThreshold: number;
  recommendedThreshold: number;
  reason: string;
}

export class LearningSystem {
  private static instance: LearningSystem;

  private constructor() {}

  public static getInstance(): LearningSystem {
    if (!LearningSystem.instance) {
      LearningSystem.instance = new LearningSystem();
    }
    return LearningSystem.instance;
  }

  /**
   * Registra decisão do usuário para aprendizado
   */
  async recordDecision(data: {
    userId: number;
    matchId: number;
    decision: 'accept' | 'reject' | 'modify';
    originalSuggestion: any;
    finalChoice?: any;
    reason?: string;
  }): Promise<void> {
    await prisma.user_decision_patterns.create({
      data: {
        user_id: data.userId,
        decision_type: data.decision,
        context_data: {
          matchId: data.matchId,
          originalSuggestion: data.originalSuggestion,
          finalChoice: data.finalChoice,
          timestamp: new Date().toISOString()
        },
        pattern_strength: this.calculatePatternStrength(data.decision)
      }
    });

    // Atualiza padrões agregados
    await this.updateUserPatterns(data.userId);
  }

  /**
   * Calcula força do padrão baseado na decisão
   */
  private calculatePatternStrength(decision: string): number {
    switch (decision) {
      case 'accept': return 1.0;
      case 'reject': return 0.0;
      case 'modify': return 0.5;
      default: return 0.5;
    }
  }

  /**
   * Analisa padrões do usuário
   */
  async analyzeUserPatterns(userId: number): Promise<UserDecisionPattern> {
    const decisions = await prisma.user_decision_patterns.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 50 // últimas 50 decisões
    });

    if (decisions.length === 0) {
      return this.getDefaultPattern(userId);
    }

    const acceptCount = decisions.filter(d => d.decision_type === 'accept').length;
    const acceptanceRate = acceptCount / decisions.length;

    // Analisa preferências de janela temporal
    const windowPreferences = this.analyzeWindowPreferences(decisions);
    
    // Analisa preferências de volume
    const volumePreferences = this.analyzeVolumePreferences(decisions);

    // Analisa dias da semana preferidos
    const dayPreferences = this.analyzeDayPreferences(decisions);

    // Extrai razões de rejeição
    const rejectionReasons = this.extractRejectionReasons(decisions);

    return {
      userId,
      acceptanceRate,
      preferredWindow: windowPreferences,
      preferredVolumeAdjustment: volumePreferences,
      rejectionReasons,
      dayOfWeekPreference: dayPreferences,
      lastUpdated: new Date()
    };
  }

  /**
   * Padrão default para novos usuários
   */
  private getDefaultPattern(userId: number): UserDecisionPattern {
    return {
      userId,
      acceptanceRate: 0.7, // assume 70% de aceitação inicial
      preferredWindow: 3, // ±3 dias
      preferredVolumeAdjustment: 100, // volume igual
      rejectionReasons: [],
      dayOfWeekPreference: {
        '0': 0.5, '1': 0.8, '2': 0.8, '3': 0.8, 
        '4': 0.8, '5': 0.8, '6': 0.7
      },
      lastUpdated: new Date()
    };
  }

  /**
   * Analisa preferências de janela temporal
   */
  private analyzeWindowPreferences(decisions: any[]): number {
    const windowData = decisions
      .filter(d => d.decision_type === 'accept' && d.context_data?.originalSuggestion)
      .map(d => {
        const original = d.context_data.originalSuggestion;
        if (original.rescheduleTo && original.originalDate) {
          const diff = Math.abs(
            new Date(original.rescheduleTo).getTime() - 
            new Date(original.originalDate).getTime()
          ) / (1000 * 60 * 60 * 24);
          return diff;
        }
        return null;
      })
      .filter(d => d !== null) as number[];

    if (windowData.length === 0) return 3;

    const avg = windowData.reduce((a, b) => a + b, 0) / windowData.length;
    return Math.round(avg);
  }

  /**
   * Analisa preferências de volume
   */
  private analyzeVolumePreferences(decisions: any[]): number {
    const volumeData = decisions
      .filter(d => d.decision_type === 'accept' && d.context_data?.originalSuggestion?.volumeAdjustment)
      .map(d => d.context_data.originalSuggestion.volumeAdjustment);

    if (volumeData.length === 0) return 100;

    const avg = volumeData.reduce((a: number, b: number) => a + b, 0) / volumeData.length;
    return Math.round(avg);
  }

  /**
   * Analisa dias da semana preferidos
   */
  private analyzeDayPreferences(decisions: any[]): Record<string, number> {
    const dayCount: Record<string, number> = {};
    const dayTotal: Record<string, number> = {};

    for (let i = 0; i < 7; i++) {
      dayCount[i.toString()] = 0;
      dayTotal[i.toString()] = 0;
    }

    decisions.forEach(d => {
      if (d.context_data?.originalSuggestion?.rescheduleTo) {
        const date = new Date(d.context_data.originalSuggestion.rescheduleTo);
        const day = date.getDay().toString();
        
        dayTotal[day]++;
        if (d.decision_type === 'accept') {
          dayCount[day]++;
        }
      }
    });

    const preferences: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const day = i.toString();
      preferences[day] = dayTotal[day] > 0 
        ? dayCount[day] / dayTotal[day]
        : 0.7; // default
    }

    return preferences;
  }

  /**
   * Extrai razões de rejeição comuns
   */
  private extractRejectionReasons(decisions: any[]): string[] {
    const reasons = decisions
      .filter(d => d.decision_type === 'reject' && d.context_data?.reason)
      .map(d => d.context_data.reason);

    // Conta frequência
    const reasonCount: Record<string, number> = {};
    reasons.forEach(r => {
      reasonCount[r] = (reasonCount[r] || 0) + 1;
    });

    // Retorna top 3 mais frequentes
    return Object.entries(reasonCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([reason]) => reason);
  }

  /**
   * Atualiza padrões agregados do usuário
   */
  private async updateUserPatterns(userId: number): Promise<void> {
    const patterns = await this.analyzeUserPatterns(userId);

    // Atualiza settings com base nos padrões
    const settings = await prisma.user_flex_settings.findUnique({
      where: { user_id: userId }
    });

    if (settings) {
      // Ajusta auto_accept_threshold baseado na taxa de aceitação
      const newThreshold = this.calculateOptimalThreshold(patterns.acceptanceRate);

      await prisma.user_flex_settings.update({
        where: { user_id: userId },
        data: {
          auto_accept_threshold: newThreshold,
          flexibility_window: patterns.preferredWindow,
          updated_at: new Date()
        }
      });
    }
  }

  /**
   * Calcula threshold ótimo baseado na taxa de aceitação
   */
  private calculateOptimalThreshold(acceptanceRate: number): number {
    if (acceptanceRate >= 0.9) return 0.70; // muito conservador
    if (acceptanceRate >= 0.8) return 0.75; // conservador
    if (acceptanceRate >= 0.6) return 0.80; // balanceado
    if (acceptanceRate >= 0.4) return 0.85; // liberal
    return 0.90; // muito liberal
  }

  /**
   * Recomenda ajuste de threshold
   */
  async recommendThresholdAdjustment(userId: number): Promise<ThresholdAdjustment | null> {
    const patterns = await this.analyzeUserPatterns(userId);
    const settings = await prisma.user_flex_settings.findUnique({
      where: { user_id: userId }
    });

    if (!settings) return null;

    const currentThreshold = settings.auto_accept_threshold;
    const recommendedThreshold = this.calculateOptimalThreshold(patterns.acceptanceRate);

    if (Math.abs(currentThreshold - recommendedThreshold) >= 0.05) {
      return {
        userId,
        currentMatchThreshold: currentThreshold,
        recommendedThreshold,
        reason: this.getThresholdAdjustmentReason(patterns.acceptanceRate)
      };
    }

    return null;
  }

  /**
   * Explica razão do ajuste
   */
  private getThresholdAdjustmentReason(acceptanceRate: number): string {
    if (acceptanceRate >= 0.9) {
      return 'Você aceita quase todas as sugestões. Podemos ser mais seletivos e só mostrar matches ainda melhores.';
    } else if (acceptanceRate >= 0.8) {
      return 'Alta taxa de aceitação. Podemos elevar os critérios um pouco.';
    } else if (acceptanceRate >= 0.6) {
      return 'Balanceado. Threshold atual parece adequado.';
    } else if (acceptanceRate >= 0.4) {
      return 'Você rejeita muitas sugestões. Vamos relaxar os critérios para mostrar mais opções.';
    } else {
      return 'Baixa taxa de aceitação. Vamos ser mais flexíveis para encontrar matches que você aprove.';
    }
  }

  /**
   * Exporta relatório de aprendizado (Analytics Dashboard)
   */
  async getAnalyticsReport(userId?: number): Promise<any> {
    const where = userId ? { user_id: userId } : {};

    const totalDecisions = await prisma.user_decision_patterns.count({ where });
    const acceptCount = await prisma.user_decision_patterns.count({
      where: { ...where, decision_type: 'accept' }
    });

    const recentPatterns = await prisma.user_decision_patterns.groupBy({
      by: ['user_id'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });

    return {
      overview: {
        totalDecisions,
        acceptCount,
        acceptanceRate: totalDecisions > 0 ? acceptCount / totalDecisions : 0,
        lastUpdated: new Date()
      },
      topUsers: recentPatterns.map(p => ({
        userId: p.user_id,
        decisionsCount: p._count.id
      })),
      trends: await this.calculateTrends(userId)
    };
  }

  /**
   * Calcula tendências ao longo do tempo
   */
  private async calculateTrends(userId?: number): Promise<any> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const where = userId 
      ? { user_id: userId, created_at: { gte: thirtyDaysAgo } }
      : { created_at: { gte: thirtyDaysAgo } };

    const decisions = await prisma.user_decision_patterns.findMany({
      where,
      orderBy: { created_at: 'asc' }
    });

    // Agrupa por semana
    const weeklyData: Record<string, { accept: number; total: number }> = {};

    decisions.forEach(d => {
      const week = this.getWeekKey(new Date(d.created_at));
      if (!weeklyData[week]) {
        weeklyData[week] = { accept: 0, total: 0 };
      }
      weeklyData[week].total++;
      if (d.decision_type === 'accept') {
        weeklyData[week].accept++;
      }
    });

    return Object.entries(weeklyData).map(([week, data]) => ({
      week,
      acceptanceRate: data.total > 0 ? data.accept / data.total : 0,
      totalDecisions: data.total
    }));
  }

  /**
   * Helper: retorna chave da semana (YYYY-WW)
   */
  private getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const week = Math.ceil(date.getDate() / 7);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }
}

export const learningSystem = LearningSystem.getInstance();
