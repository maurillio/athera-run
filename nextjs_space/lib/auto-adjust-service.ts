
/**
 * Sistema de Ajuste Inteligente Automático
 *
 * Analisa TODO o histórico do atleta (atividades Strava, treinos manuais e relatos)
 * e faz ajustes progressivos e científicos no plano de treinamento usando IA avançada.
 */

import prisma from './db';
import { callLLM } from './llm-client';
import { resilientLLMCall } from './ai-resilience';

interface AdjustmentDecision {
  needsAdjustment: boolean;
  adjustmentType: 'reduce_volume' | 'increase_volume' | 'increase_rest' | 'skip_intensity' | 'add_intensity' | 'full_rest' | 'maintain' | null;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  summary: string;
  specificChanges: {
    weekNumber?: number;
    changeType: string;
    description: string;
  }[];
}

export class AutoAdjustService {
  private athleteId: number;
  
  constructor(athleteId: number) {
    this.athleteId = athleteId;
  }
  
  /**
   * Verifica se deve executar o ajuste automático
   * Evita ajustes muito frequentes (mínimo de 24 horas entre ajustes)
   */
  async shouldExecuteAutoAdjust(): Promise<boolean> {
    const profile = await prisma.athleteProfile.findUnique({
      where: { id: this.athleteId },
      select: { 
        autoAdjustEnabled: true, 
        lastAutoAdjustDate: true,
        hasCustomPlan: true
      }
    });
    
    if (!profile || !profile.autoAdjustEnabled || !profile.hasCustomPlan) {
      return false;
    }
    
    // Se nunca foi executado, pode executar
    if (!profile.lastAutoAdjustDate) {
      return true;
    }
    
    // Verifica se passou pelo menos 24 horas desde o último ajuste
    const hoursSinceLastAdjust = (Date.now() - profile.lastAutoAdjustDate.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastAdjust >= 24;
  }
  
  /**
   * Coleta TODO o histórico relevante do atleta
   */
  async collectFullHistory() {
    const profile = await prisma.athleteProfile.findUnique({
      where: { id: this.athleteId },
      include: {
        customPlan: {
          include: {
            weeks: {
              where: {
                startDate: {
                  gte: new Date() // Apenas semanas futuras
                }
              },
              include: {
                workouts: {
                  orderBy: { date: 'asc' }
                }
              },
              orderBy: { weekNumber: 'asc' }
            }
          }
        }
      }
    });
    
    if (!profile) {
      throw new Error('Perfil não encontrado');
    }
    
    // Buscar TODAS as atividades completadas (sem limite de data)
    const completedWorkouts = await prisma.completedWorkout.findMany({
      where: { athleteId: this.athleteId },
      orderBy: { date: 'desc' },
      take: 200 // Últimas 200 atividades
    });
    
    // Buscar TODOS os relatos (sem limite de data)
    const trainingLogs = await prisma.trainingLog.findMany({
      where: { athleteId: this.athleteId },
      orderBy: { date: 'desc' },
      take: 200 // Últimos 200 relatos
    });
    
    // Buscar análises anteriores para contexto
    const previousAnalyses = await prisma.aIAnalysis.findMany({
      where: { 
        athleteId: this.athleteId,
        analysisType: 'auto_adjust'
      },
      orderBy: { createdAt: 'desc' },
      take: 5 // Últimas 5 análises
    });
    
    return {
      profile,
      completedWorkouts,
      trainingLogs,
      previousAnalyses
    };
  }
  
  /**
   * Analisa o histórico completo e decide ajustes usando IA avançada
   */
  async analyzeAndDecide(): Promise<AdjustmentDecision> {
    const history = await this.collectFullHistory();
    const { profile, completedWorkouts, trainingLogs, previousAnalyses } = history;
    
    // Preparar contexto rico para IA
    const context = {
      athlete: {
        level: profile.runningLevel,
        age: profile.age,
        weight: profile.weight,
        weeklyAvailability: profile.weeklyAvailability,
        injuries: profile.injuries,
        medicalConditions: profile.medicalConditions,
        medications: profile.medications,
        physicalRestrictions: profile.physicalRestrictions,
        currentVDOT: profile.currentVDOT,
        experienceDescription: profile.experienceDescription,
        trainingActivities: profile.trainingActivities
      },
      currentPlan: profile.customPlan ? {
        goalDistance: profile.customPlan.goalDistance,
        runningLevel: profile.customPlan.runningLevel,
        targetRaceDate: profile.customPlan.targetRaceDate,
        currentWeek: profile.customPlan.currentWeek,
        totalWeeks: profile.customPlan.totalWeeks,
        completionRate: profile.customPlan.completionRate,
        upcomingWeeks: profile.customPlan.weeks.slice(0, 4).map(week => ({
          weekNumber: week.weekNumber,
          startDate: week.startDate,
          phase: week.phase,
          focus: week.focus,
          totalDistance: week.totalDistance,
          workouts: week.workouts.map(w => ({
            date: w.date,
            type: w.type,
            subtype: w.subtype,
            title: w.title,
            distance: w.distance,
            duration: w.duration
          }))
        }))
      } : null,
      recentActivity: {
        // Últimas 4 semanas de atividades
        last4Weeks: completedWorkouts.filter(w => {
          const daysDiff = (Date.now() - w.date.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 28;
        }).map(w => ({
          date: w.date,
          source: w.source,
          type: w.type,
          subtype: w.subtype,
          distance: w.distance,
          duration: w.duration,
          pace: w.pace,
          avgHeartRate: w.avgHeartRate,
          perceivedEffort: w.perceivedEffort,
          feeling: w.feeling,
          hasInjuryAlert: w.hasInjuryAlert,
          injuryNotes: w.injuryNotes
        })),
        // Últimas 12 semanas (resumo)
        last12WeeksSummary: this.summarizeWorkouts(completedWorkouts, 84), // 12 semanas
        // Todo histórico (estatísticas)
        fullHistoryStats: this.calculateFullStats(completedWorkouts)
      },
      recentLogs: {
        // Últimos 14 dias de relatos
        last14Days: trainingLogs.filter(log => {
          const daysDiff = (Date.now() - log.date.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 14;
        }).map(log => ({
          date: log.date,
          workoutCompleted: log.workoutCompleted,
          overallFeeling: log.overallFeeling,
          energyLevel: log.energyLevel,
          sleepQuality: log.sleepQuality,
          stressLevel: log.stressLevel,
          motivationLevel: log.motivationLevel,
          trainingDifficulty: log.trainingDifficulty,
          perceivedEffort: log.perceivedEffort,
          hasPain: log.hasPain,
          painDescription: log.painDescription,
          painIntensity: log.painIntensity,
          hasInjury: log.hasInjury,
          injuryDescription: log.injuryDescription,
          hasIllness: log.hasIllness,
          illnessDescription: log.illnessDescription,
          notes: log.notes
        })),
        // Último mês (resumo)
        lastMonthSummary: this.summarizeLogs(trainingLogs, 30)
      },
      previousAdjustments: previousAnalyses.map(a => ({
        date: a.createdAt,
        summary: a.summary,
        recommendations: a.recommendations,
        hasAlerts: a.hasAlerts
      }))
    };
    
    // Chamar IA para análise profunda e científica com sistema resiliente
    console.log('[AUTO-ADJUST] Analisando com IA resiliente...');

    // Cache key baseado no athleteId e timestamp do dia (atualiza diariamente)
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `auto-adjust-${this.athleteId}-${today}`;

    const aiResponseText = await resilientLLMCall(
      () => callLLM({
        messages: [{
          role: 'system',
          content: `Você é um treinador de corrida PhD em fisiologia do exercício, especialista em periodização e treinamento científico.

Sua missão é analisar o histórico COMPLETO do atleta (não apenas 7 dias) e decidir se o plano de treinamento precisa de ajustes PROGRESSIVOS e CIENTÍFICOS.

PRINCÍPIOS CIENTÍFICOS:
1. **Princípio da Sobrecarga Progressiva**: Aumento gradual de carga (não mais que 10% por semana)
2. **Princípio da Especificidade**: Treinos devem ser específicos para o objetivo
3. **Princípio da Recuperação**: Adaptação ocorre durante o descanso, não durante o treino
4. **Princípio da Individualização**: Cada atleta responde diferentemente ao estímulo
5. **Princípio da Reversibilidade**: Carga inadequada leva à perda de condicionamento

ANÁLISE HOLÍSTICA:
- Analise a PROGRESSÃO ao longo das últimas 12 semanas
- Considere TODAS as atividades (Strava + manuais)
- Avalie TODOS os relatos de sensações e sintomas
- Compare o volume planejado vs executado
- Identifique TENDÊNCIAS, não apenas pontos isolados
- Considere o contexto completo do atleta (idade, experiência, restrições)

CRITÉRIOS PARA AJUSTES:
**REDUZIR VOLUME/INTENSIDADE**:
- Tendência de fadiga persistente (3+ semanas de energia baixa)
- Taxa de completude < 70% nas últimas 4 semanas
- Dores recorrentes na mesma região por 2+ semanas
- Sinais de overtraining: sono ruim + stress alto + energia baixa + motivação baixa
- Doença ou lesão ativa
- Volume atual muito acima da capacidade histórica (>150% do normal)

**AUMENTAR VOLUME/INTENSIDADE**:
- Atleta consistentemente reportando treinos "muito fáceis"
- Taxa de completude > 95% nas últimas 4 semanas
- Energia e motivação altas consistentemente
- RPE consistentemente baixo (≤5) em treinos que deveriam ser desafiadores
- Progressão estagnada (sem evolução há 3+ semanas)
- Volume atual muito abaixo da capacidade histórica (<70% do normal)

**ADICIONAR DESCANSO**:
- Cansaço acumulado sem sinais de recuperação
- Frequência cardíaca elevada em repouso/treinos leves
- Qualidade de sono diminuindo progressivamente

**MANTER PLANO**:
- Progressão adequada e sustentável
- Sensações e sintomas dentro do esperado
- Taxa de completude entre 75-90%
- Sem sinais de overtraining ou subtreinamento

TIPOS DE AJUSTE:
- **reduce_volume**: Reduzir 15-25% do volume se fadiga persistente
- **increase_volume**: Aumentar 5-10% do volume se capacidade excedente
- **increase_rest**: Adicionar dias de recuperação ou reduzir intensidade
- **skip_intensity**: Remover/adiar treinos intensos
- **add_intensity**: Adicionar treinos de qualidade
- **full_rest**: Semana completa de recuperação
- **maintain**: Manter plano atual

RESPONDA APENAS COM JSON VÁLIDO:
{
  "needsAdjustment": true/false,
  "adjustmentType": "reduce_volume" | "increase_volume" | "increase_rest" | "skip_intensity" | "add_intensity" | "full_rest" | "maintain",
  "reason": "explicação científica detalhada baseada nos dados",
  "severity": "low" | "medium" | "high",
  "summary": "resumo executivo da análise",
  "specificChanges": [
    {
      "weekNumber": 25,
      "changeType": "reduce_distance",
      "description": "Reduzir corrida longa de 25km para 20km"
    }
  ]
}`
        }, {
          role: 'user',
          content: `Analise este atleta COMPLETO e determine ajustes necessários:

${JSON.stringify(context, null, 2)}

IMPORTANTE: Faça uma análise PROFUNDA considerando:
1. Progressão nas últimas 12 semanas
2. Todos os relatos e sintomas
3. Tendências de fadiga, dor ou motivação
4. Comparação entre volume planejado vs executado
5. Princípios científicos de treinamento
6. Individualização baseada no perfil completo

Seja CONSERVADOR - prefira manter o plano a menos que haja evidências claras de necessidade de ajuste.`
        }],
        max_tokens: 1500,
        temperature: 0.2,
        response_format: { type: "json_object" }
      }),
      {
        cacheKey,
        cacheTTL: 3600000, // 1 hora
        validateResponse: (response: string) => {
          try {
            const data = JSON.parse(response);
            return (
              typeof data.needsAdjustment === 'boolean' &&
              data.adjustmentType !== undefined &&
              typeof data.reason === 'string' &&
              typeof data.severity === 'string'
            );
          } catch {
            return false;
          }
        },
        retryConfig: {
          maxRetries: 3,
          baseDelay: 2000,
          maxDelay: 10000,
          backoffMultiplier: 2,
        },
        timeout: 45000, // 45 segundos
        fallbackResponse: JSON.stringify({
          needsAdjustment: false,
          adjustmentType: 'maintain',
          reason: 'Sistema de análise temporariamente indisponível. Plano mantido por segurança.',
          severity: 'low',
          summary: 'Análise adiada - sistema indisponível',
          specificChanges: []
        })
      }
    );

    const decision: AdjustmentDecision = JSON.parse(aiResponseText);
    console.log('[AUTO-ADJUST] Decisão da IA:', decision.adjustmentType);
    
    return decision;
  }
  
  /**
   * Aplica os ajustes decididos pela IA no plano
   */
  async applyAdjustments(decision: AdjustmentDecision) {
    if (!decision.needsAdjustment || !decision.adjustmentType || decision.adjustmentType === 'maintain') {
      console.log('Nenhum ajuste necessário');
      return { applied: false, message: 'Plano mantido' };
    }
    
    const profile = await prisma.athleteProfile.findUnique({
      where: { id: this.athleteId },
      include: {
        customPlan: {
          include: {
            weeks: {
              where: {
                startDate: {
                  gte: new Date()
                }
              },
              include: {
                workouts: true
              },
              orderBy: { weekNumber: 'asc' }
            }
          }
        }
      }
    });
    
    if (!profile?.customPlan) {
      throw new Error('Plano não encontrado');
    }
    
    // Aplicar ajustes baseados no tipo
    switch (decision.adjustmentType) {
      case 'reduce_volume':
        await this.reduceVolume(profile.customPlan.id, 0.20); // 20% de redução
        break;
      case 'increase_volume':
        await this.increaseVolume(profile.customPlan.id, 0.10); // 10% de aumento
        break;
      case 'increase_rest':
        await this.increaseRest(profile.customPlan.id);
        break;
      case 'skip_intensity':
        await this.skipIntensityWorkouts(profile.customPlan.id);
        break;
      case 'add_intensity':
        await this.addIntensityWorkouts(profile.customPlan.id);
        break;
      case 'full_rest':
        await this.applyFullRestWeek(profile.customPlan.id);
        break;
    }
    
    // Registrar análise
    await prisma.aIAnalysis.create({
      data: {
        athleteId: this.athleteId,
        analysisType: 'auto_adjust',
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Últimos 90 dias
        endDate: new Date(),
        summary: decision.summary,
        insights: `Análise automática completa do histórico do atleta.`,
        recommendations: `Ajuste aplicado: ${decision.adjustmentType}\n\nMotivo: ${decision.reason}\n\nMudanças específicas:\n${decision.specificChanges.map(c => `- ${c.description}`).join('\n')}`,
        metrics: {
          adjustmentType: decision.adjustmentType,
          severity: decision.severity,
          specificChanges: decision.specificChanges
        },
        hasAlerts: decision.severity === 'high',
        alerts: decision.severity === 'high' ? decision.reason : null
      }
    });
    
    // Atualizar data do último ajuste
    await prisma.athleteProfile.update({
      where: { id: this.athleteId },
      data: { lastAutoAdjustDate: new Date() }
    });
    
    return {
      applied: true,
      message: `Ajuste aplicado: ${decision.adjustmentType}`,
      details: decision
    };
  }
  
  /**
   * Executa o fluxo completo de ajuste automático
   */
  async execute() {
    // Verificar se deve executar
    const shouldExecute = await this.shouldExecuteAutoAdjust();
    if (!shouldExecute) {
      return { 
        executed: false, 
        reason: 'Ajuste automático não habilitado ou executado recentemente' 
      };
    }
    
    // Analisar e decidir
    const decision = await this.analyzeAndDecide();
    
    // Aplicar ajustes
    const result = await this.applyAdjustments(decision);
    
    return {
      executed: true,
      decision,
      result
    };
  }
  
  // ========== FUNÇÕES AUXILIARES ==========
  
  private summarizeWorkouts(workouts: any[], days: number) {
    const filtered = workouts.filter(w => {
      const daysDiff = (Date.now() - w.date.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= days;
    });
    
    const running = filtered.filter(w => w.type === 'running');
    const totalDistance = running.reduce((sum, w) => sum + (w.distance || 0), 0);
    const totalDuration = filtered.reduce((sum, w) => sum + (w.duration || 0), 0);
    const avgEffort = filtered.filter(w => w.perceivedEffort).reduce((sum, w) => sum + (w.perceivedEffort || 0), 0) / filtered.filter(w => w.perceivedEffort).length;
    
    return {
      totalWorkouts: filtered.length,
      runningWorkouts: running.length,
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalDuration: Math.round(totalDuration),
      avgDistance: running.length > 0 ? Math.round((totalDistance / running.length) * 10) / 10 : 0,
      avgEffort: Math.round(avgEffort * 10) / 10 || null,
      workoutsByFeeling: {
        great: filtered.filter(w => w.feeling === 'great').length,
        good: filtered.filter(w => w.feeling === 'good').length,
        ok: filtered.filter(w => w.feeling === 'ok').length,
        tired: filtered.filter(w => w.feeling === 'tired').length,
        bad: filtered.filter(w => w.feeling === 'bad').length
      },
      injuryAlerts: filtered.filter(w => w.hasInjuryAlert).length
    };
  }
  
  private calculateFullStats(workouts: any[]) {
    const running = workouts.filter(w => w.type === 'running');
    const distances = running.map(w => w.distance || 0);
    const paces = running.filter(w => w.pace).map(w => {
      const match = w.pace.match(/(\d+):(\d+)/);
      return match ? parseInt(match[1]) * 60 + parseInt(match[2]) : 0;
    });
    
    return {
      totalWorkouts: workouts.length,
      totalDistance: Math.round(running.reduce((sum, w) => sum + (w.distance || 0), 0) * 10) / 10,
      longestRun: Math.max(...distances, 0),
      averagePace: paces.length > 0 ? this.formatPace(paces.reduce((a, b) => a + b, 0) / paces.length) : null,
      bestPace: paces.length > 0 ? this.formatPace(Math.min(...paces)) : null
    };
  }
  
  private summarizeLogs(logs: any[], days: number) {
    const filtered = logs.filter(log => {
      const daysDiff = (Date.now() - log.date.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= days;
    });
    
    const completed = filtered.filter(l => l.workoutCompleted).length;
    const energyLevels = filtered.filter(l => l.energyLevel).map(l => l.energyLevel);
    const sleepQuality = filtered.filter(l => l.sleepQuality).map(l => l.sleepQuality);
    const stressLevels = filtered.filter(l => l.stressLevel).map(l => l.stressLevel);
    const motivationLevels = filtered.filter(l => l.motivationLevel).map(l => l.motivationLevel);
    
    return {
      totalLogs: filtered.length,
      completionRate: filtered.length > 0 ? Math.round((completed / filtered.length) * 100) : 0,
      avgEnergy: energyLevels.length > 0 ? Math.round((energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length) * 10) / 10 : null,
      avgSleep: sleepQuality.length > 0 ? Math.round((sleepQuality.reduce((a, b) => a + b, 0) / sleepQuality.length) * 10) / 10 : null,
      avgStress: stressLevels.length > 0 ? Math.round((stressLevels.reduce((a, b) => a + b, 0) / stressLevels.length) * 10) / 10 : null,
      avgMotivation: motivationLevels.length > 0 ? Math.round((motivationLevels.reduce((a, b) => a + b, 0) / motivationLevels.length) * 10) / 10 : null,
      painReports: filtered.filter(l => l.hasPain).length,
      injuryReports: filtered.filter(l => l.hasInjury).length,
      illnessReports: filtered.filter(l => l.hasIllness).length
    };
  }
  
  private formatPace(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  private async reduceVolume(planId: number, percentage: number) {
    const plan = await prisma.customTrainingPlan.findUnique({
      where: { id: planId },
      include: {
        weeks: {
          where: { startDate: { gte: new Date() } },
          include: { workouts: true }
        }
      }
    });
    
    if (!plan) return;
    
    // Reduzir distância de todos os treinos futuros
    for (const week of plan.weeks) {
      for (const workout of week.workouts) {
        if (workout.type === 'running' && workout.distance) {
          await prisma.customWorkout.update({
            where: { id: workout.id },
            data: {
              distance: Math.round(workout.distance * (1 - percentage) * 10) / 10,
              description: `${workout.description}\n\n⚡ AJUSTADO AUTOMATICAMENTE: Distância reduzida em ${Math.round(percentage * 100)}% para otimizar recuperação.`
            }
          });
        }
      }
    }
  }
  
  private async increaseVolume(planId: number, percentage: number) {
    const plan = await prisma.customTrainingPlan.findUnique({
      where: { id: planId },
      include: {
        weeks: {
          where: { startDate: { gte: new Date() } },
          include: { workouts: true }
        }
      }
    });
    
    if (!plan) return;
    
    // Aumentar distância de treinos futuros gradualmente
    for (const week of plan.weeks.slice(0, 3)) { // Apenas próximas 3 semanas
      for (const workout of week.workouts) {
        if (workout.type === 'running' && workout.distance && workout.subtype !== 'long') {
          await prisma.customWorkout.update({
            where: { id: workout.id },
            data: {
              distance: Math.round(workout.distance * (1 + percentage) * 10) / 10,
              description: `${workout.description}\n\n⚡ AJUSTADO AUTOMATICAMENTE: Distância aumentada em ${Math.round(percentage * 100)}% devido à capacidade excedente.`
            }
          });
        }
      }
    }
  }
  
  private async increaseRest(planId: number) {
    const plan = await prisma.customTrainingPlan.findUnique({
      where: { id: planId },
      include: {
        weeks: {
          where: { startDate: { gte: new Date() } },
          include: { workouts: { orderBy: { date: 'asc' } } },
          orderBy: { weekNumber: 'asc' }
        }
      }
    });
    
    if (!plan || plan.weeks.length === 0) return;
    
    // Substituir próximo treino de intensidade por descanso ou corrida leve
    const nextWeek = plan.weeks[0];
    const intensityWorkout = nextWeek.workouts.find(w => 
      w.type === 'running' && (w.subtype === 'intervals' || w.subtype === 'tempo')
    );
    
    if (intensityWorkout) {
      await prisma.customWorkout.update({
        where: { id: intensityWorkout.id },
        data: {
          type: 'running',
          subtype: 'easy',
          title: 'Corrida Leve (Ajustado)',
          distance: intensityWorkout.distance ? intensityWorkout.distance * 0.6 : 5,
          description: '⚡ AJUSTADO AUTOMATICAMENTE: Treino de intensidade substituído por corrida leve para aumentar recuperação.\n\nCorrida em ritmo confortável, conversando durante todo o percurso.'
        }
      });
    }
  }
  
  private async skipIntensityWorkouts(planId: number) {
    const plan = await prisma.customTrainingPlan.findUnique({
      where: { id: planId },
      include: {
        weeks: {
          where: { startDate: { gte: new Date() } },
          include: { workouts: true },
          orderBy: { weekNumber: 'asc' }
        }
      }
    });
    
    if (!plan) return;
    
    // Remover treinos de intensidade das próximas 2 semanas
    for (const week of plan.weeks.slice(0, 2)) {
      for (const workout of week.workouts) {
        if (workout.type === 'running' && (workout.subtype === 'intervals' || workout.subtype === 'tempo')) {
          await prisma.customWorkout.update({
            where: { id: workout.id },
            data: {
              type: 'rest',
              subtype: null,
              title: 'Descanso (Ajustado)',
              distance: null,
              description: '⚡ AJUSTADO AUTOMATICAMENTE: Treino de intensidade removido para prevenir overtraining.\n\nDia de descanso completo ou atividade leve (caminhada, alongamento).'
            }
          });
        }
      }
    }
  }
  
  private async addIntensityWorkouts(planId: number) {
    // Implementação simplificada - em produção seria mais complexo
    console.log('Adicionar intensidade - implementação futura');
  }
  
  private async applyFullRestWeek(planId: number) {
    const plan = await prisma.customTrainingPlan.findUnique({
      where: { id: planId },
      include: {
        weeks: {
          where: { startDate: { gte: new Date() } },
          include: { workouts: true },
          orderBy: { weekNumber: 'asc' }
        }
      }
    });
    
    if (!plan || plan.weeks.length === 0) return;
    
    // Transformar próxima semana em semana de descanso
    const nextWeek = plan.weeks[0];
    for (const workout of nextWeek.workouts) {
      await prisma.customWorkout.update({
        where: { id: workout.id },
        data: {
          type: 'rest',
          subtype: null,
          title: 'Descanso Completo (Ajustado)',
          distance: null,
          duration: null,
          description: '⚡ AJUSTADO AUTOMATICAMENTE: Semana de descanso completo prescrita devido a sinais de fadiga/lesão.\n\nPriorize recuperação total: sono, nutrição, hidratação. Atividades leves opcionais.'
        }
      });
    }
  }
}

/**
 * Função auxiliar para executar ajuste automático quando uma atividade é adicionada
 */
export async function triggerAutoAdjustIfEnabled(athleteId: number) {
  try {
    const service = new AutoAdjustService(athleteId);
    const result = await service.execute();
    console.log('Auto-adjust result:', result);
    return result;
  } catch (error) {
    console.error('Error in auto-adjust:', error);
    return { executed: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
