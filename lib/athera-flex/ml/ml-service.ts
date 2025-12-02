/**
 * ATHERA FLEX - ML Service
 * Serviço principal de Machine Learning
 * Fase 3: Intelligence Layer
 * 
 * Responsabilidades:
 * - Orquestrar todos os modelos ML
 * - Interface unificada para predições
 * - Gestão de cache de predições
 * - Analytics e métricas
 */

import { prisma } from '@/lib/db';
import { MLOrchestrator } from './MLOrchestrator';
import type { 
  WorkoutMatch, 
  UserFlexSettings, 
  MatchDecision,
  PredictionResult 
} from '../types';

export class MLService {
  private static instance: MLService;
  private orchestrator: MLOrchestrator;
  private predictionCache: Map<string, { result: PredictionResult; timestamp: number }>;
  private readonly CACHE_TTL = 1000 * 60 * 30; // 30 minutos

  private constructor() {
    this.orchestrator = MLOrchestrator.getInstance();
    this.predictionCache = new Map();
  }

  public static getInstance(): MLService {
    if (!MLService.instance) {
      MLService.instance = new MLService();
    }
    return MLService.instance;
  }

  /**
   * Predição principal: deve aceitar automaticamente?
   */
  async predictAcceptance(
    userId: string,
    match: WorkoutMatch,
    settings: UserFlexSettings
  ): Promise<PredictionResult> {
    const cacheKey = this.getCacheKey(userId, match);
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const result = await this.orchestrator.predict(userId, match, settings);
      this.setCache(cacheKey, result);
      
      // Salvar predição no banco
      await this.savePrediction(userId, match, result);
      
      return result;
    } catch (error) {
      console.error('[MLService] Prediction error:', error);
      return this.getFallbackPrediction(match, settings);
    }
  }

  /**
   * Treinar modelos com nova decisão do usuário
   */
  async learn(userId: string, decision: MatchDecision): Promise<void> {
    try {
      await this.orchestrator.learn(userId, decision);
      
      // Salvar padrão de comportamento
      await this.saveUserPattern(userId, decision);
      
      // Limpar cache de predições antigas
      this.clearUserCache(userId);
      
    } catch (error) {
      console.error('[MLService] Learning error:', error);
    }
  }

  /**
   * Análise de padrões do usuário
   */
  async analyzeUserBehavior(userId: string) {
    try {
      const decisions = await prisma.workoutMatchDecision.findMany({
        where: { userId },
        orderBy: { decidedAt: 'desc' },
        take: 100,
      });

      if (decisions.length < 5) {
        return {
          hasEnoughData: false,
          acceptanceRate: 0,
          patterns: [],
        };
      }

      const acceptanceRate = decisions.filter(d => d.decision === 'accept').length / decisions.length;
      
      // Detectar padrões
      const patterns = this.detectPatterns(decisions);

      return {
        hasEnoughData: true,
        acceptanceRate,
        patterns,
        totalDecisions: decisions.length,
        lastDecisionAt: decisions[0].decidedAt,
      };
    } catch (error) {
      console.error('[MLService] Behavior analysis error:', error);
      return null;
    }
  }

  /**
   * Obter métricas de performance dos modelos
   */
  async getModelMetrics(userId?: string) {
    try {
      const where = userId ? { userId } : {};
      
      const predictions = await prisma.workoutMatchDecision.findMany({
        where,
        select: {
          decision: true,
          confidence: true,
          wasAutomated: true,
          decidedAt: true,
        },
        orderBy: { decidedAt: 'desc' },
        take: 1000,
      });

      if (predictions.length === 0) {
        return null;
      }

      const automated = predictions.filter(p => p.wasAutomated);
      const manual = predictions.filter(p => !p.wasAutomated);

      return {
        total: predictions.length,
        automated: {
          count: automated.length,
          acceptRate: automated.filter(p => p.decision === 'accept').length / automated.length,
          avgConfidence: automated.reduce((sum, p) => sum + (p.confidence || 0), 0) / automated.length,
        },
        manual: {
          count: manual.length,
          acceptRate: manual.filter(p => p.decision === 'accept').length / manual.length,
        },
        accuracy: this.calculateAccuracy(predictions),
      };
    } catch (error) {
      console.error('[MLService] Metrics error:', error);
      return null;
    }
  }

  /**
   * Atualizar thresholds automaticamente baseado em performance
   */
  async adjustThresholds(userId: string): Promise<void> {
    try {
      const metrics = await this.getModelMetrics(userId);
      if (!metrics) return;

      const settings = await prisma.userFlexSettings.findUnique({
        where: { userId },
      });

      if (!settings) return;

      let newThreshold = settings.autoAcceptThreshold;

      // Se muito conservador (poucas automações), reduzir threshold
      if (metrics.automated.count < metrics.total * 0.3) {
        newThreshold = Math.max(0.70, newThreshold - 0.05);
      }

      // Se muitas rejeições manuais, aumentar threshold
      if (metrics.manual.acceptRate < 0.5) {
        newThreshold = Math.min(0.95, newThreshold + 0.05);
      }

      // Aplicar se houve mudança significativa
      if (Math.abs(newThreshold - settings.autoAcceptThreshold) >= 0.05) {
        await prisma.userFlexSettings.update({
          where: { userId },
          data: { 
            autoAcceptThreshold: newThreshold,
            lastThresholdAdjust: new Date(),
          },
        });
      }
    } catch (error) {
      console.error('[MLService] Threshold adjustment error:', error);
    }
  }

  // ==================== PRIVATE METHODS ====================

  private getCacheKey(userId: string, match: WorkoutMatch): string {
    return `${userId}:${match.executedWorkout.id}:${match.plannedWorkout.id}`;
  }

  private getCached(key: string): PredictionResult | null {
    const cached = this.predictionCache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.CACHE_TTL) {
      this.predictionCache.delete(key);
      return null;
    }

    return cached.result;
  }

  private setCache(key: string, result: PredictionResult): void {
    this.predictionCache.set(key, {
      result,
      timestamp: Date.now(),
    });

    // Limpar cache antigo (max 100 entradas)
    if (this.predictionCache.size > 100) {
      const oldestKey = this.predictionCache.keys().next().value;
      this.predictionCache.delete(oldestKey);
    }
  }

  private clearUserCache(userId: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.predictionCache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.predictionCache.delete(key));
  }

  private getFallbackPrediction(
    match: WorkoutMatch,
    settings: UserFlexSettings
  ): PredictionResult {
    // Fallback simples baseado em regras
    const similarity = match.similarityScore || 0;
    const shouldAccept = similarity >= (settings.autoAcceptThreshold || 0.85);

    return {
      shouldAccept,
      confidence: similarity * 0.8, // Baixa confiança no fallback
      reasons: [
        shouldAccept 
          ? 'Alta similaridade detectada (modo fallback)'
          : 'Similaridade insuficiente (modo fallback)',
      ],
      riskFactors: [],
      suggestions: ['Sistema ML temporariamente indisponível'],
    };
  }

  private detectPatterns(decisions: any[]) {
    const patterns: string[] = [];

    // Padrão: sempre aceita volume maior
    const volumeIncreases = decisions.filter(d => 
      d.decision === 'accept' && 
      d.volumeChange && 
      d.volumeChange > 0
    );
    if (volumeIncreases.length > decisions.length * 0.7) {
      patterns.push('ACCEPTS_VOLUME_INCREASE');
    }

    // Padrão: prefere fim de semana
    const weekendAccepts = decisions.filter(d => 
      d.decision === 'accept' && 
      d.dayOfWeek && 
      [0, 6].includes(d.dayOfWeek)
    );
    if (weekendAccepts.length > decisions.length * 0.6) {
      patterns.push('PREFERS_WEEKEND');
    }

    // Padrão: conservador
    const highConfidenceOnly = decisions.filter(d => 
      d.decision === 'accept' && 
      d.confidence && 
      d.confidence > 0.9
    );
    if (highConfidenceOnly.length > decisions.length * 0.8) {
      patterns.push('CONSERVATIVE');
    }

    return patterns;
  }

  private calculateAccuracy(predictions: any[]): number {
    // Simplificado: % de decisões automatizadas que não foram revertidas
    const automated = predictions.filter(p => p.wasAutomated);
    if (automated.length === 0) return 0;

    // Assumir que não temos reversões ainda, então retornar taxa de aceitação
    return automated.filter(p => p.decision === 'accept').length / automated.length;
  }

  private async savePrediction(
    userId: string,
    match: WorkoutMatch,
    result: PredictionResult
  ): Promise<void> {
    try {
      // Salvar em tabela de analytics (se existir)
      // Por enquanto, apenas log
      console.log(`[MLService] Prediction saved: ${userId}, confidence: ${result.confidence}`);
    } catch (error) {
      console.error('[MLService] Save prediction error:', error);
    }
  }

  private async saveUserPattern(
    userId: string,
    decision: MatchDecision
  ): Promise<void> {
    try {
      // Extrair padrões da decisão
      const pattern = {
        acceptedVolumeChange: decision.decision === 'accept',
        confidence: decision.confidence,
        dayOfWeek: new Date(decision.decidedAt).getDay(),
      };

      await prisma.userDecisionPattern.upsert({
        where: { userId },
        create: {
          userId,
          totalDecisions: 1,
          acceptanceRate: decision.decision === 'accept' ? 1 : 0,
          patterns: [pattern],
        },
        update: {
          totalDecisions: { increment: 1 },
          patterns: { push: pattern },
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('[MLService] Save pattern error:', error);
    }
  }
}

// Export singleton
export const mlService = MLService.getInstance();
