
/**
 * Gerador de Planos de Treinamento para Múltiplas Corridas
 * 
 * Cria planos integrados que consideram:
 * - Corrida A (objetivo principal)
 * - Corridas B (preparatórias)
 * - Corridas C (volume/experiência)
 * - Periodização científica adequada
 */

import type { AIUserProfile } from './ai-plan-generator';
import { classifyRaces, type ClassificationResult } from './race-classifier';
import { callLLM } from './llm-client';
import { resilientAICall } from './ai-resilience';

export interface RaceInPlan {
  id: number;
  raceName: string;
  distance: string;
  raceDate: Date;
  targetTime?: string;
  priority: 'A' | 'B' | 'C';
  weeksBeforeA: number | null;
  trainingSuggest: string;
  periodPhase: string | null;
}

export interface MultiRaceProfile extends AIUserProfile {
  races: RaceInPlan[];
}

export interface MultiRacePlan {
  totalWeeks: number;
  startDate: Date;
  primaryRaceDate: Date;
  
  // Estrutura de periodização integrada
  periodization: {
    phases: Array<{
      name: string;
      weeks: number;
      weekStart: number;
      weekEnd: number;
      focus: string;
      description: string;
      raceWeeks: number[]; // Semanas com corridas
      races: Array<{
        raceId: number;
        raceName: string;
        weekNumber: number;
        priority: 'A' | 'B' | 'C';
        distanceOptimization: string;
      }>;
    }>;
  };
  
  // Semanas detalhadas
  weeks: Array<{
    weekNumber: number;
    startDate: Date;
    endDate: Date;
    phase: string;
    focus: string;
    totalDistance: number;
    hasRace: boolean;
    raceInfo?: {
      raceId: number;
      raceName: string;
      priority: 'A' | 'B' | 'C';
      tapering: boolean;
    };
    workouts: Array<{
      dayOfWeek: number;
      date: Date;
      type: string;
      subtype?: string;
      title: string;
      description: string;
      distance?: number;
      duration?: number;
      targetPace?: string;
      warmup?: string;
      mainSet?: string;
      cooldown?: string;
    }>;
  }>;
  
  // Paces e métricas
  paces: {
    easy: string;
    marathon: string;
    threshold: string;
    interval: string;
    repetition: string;
  };
  
  vdot: number;
  
  // Conselhos específicos para múltiplas corridas
  planRationale: string;
  keyConsiderations: string[];
  progressionStrategy: string;
  raceIntegrationStrategy: string;
  nutritionAdvice?: string;
  injuryPreventionTips?: string[];
}

/**
 * Gera plano de treinamento integrado para múltiplas corridas
 */
export async function generateMultiRacePlan(
  profile: MultiRaceProfile,
  maxRetries: number = 3
): Promise<MultiRacePlan> {
  console.log('[MULTI-RACE] Iniciando geração de plano com múltiplas corridas...');
  console.log('[MULTI-RACE] Total de corridas:', profile.races.length);
  
  // Encontrar corrida A (primária)
  const raceA = profile.races.find(r => r.priority === 'A');
  if (!raceA) {
    throw new Error('Nenhuma corrida A (primária) encontrada');
  }
  
  const today = new Date();
  const raceDate = new Date(raceA.raceDate);
  const totalWeeks = Math.floor((raceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7));
  
  console.log(`[MULTI-RACE] Corrida A: ${raceA.raceName} em ${raceDate.toLocaleDateString('pt-BR')}`);
  console.log(`[MULTI-RACE] Total de semanas até corrida A: ${totalWeeks}`);
  
  // Preparar contexto para a IA
  const context = prepareMultiRaceContext(profile, raceA, totalWeeks);
  
  // Gerar estratégia com IA
  const strategy = await generateAIStrategy(context, totalWeeks, maxRetries);
  
  // Expandir estratégia em plano completo
  const fullPlan = expandMultiRaceStrategy(strategy, profile, totalWeeks, raceA);
  
  return fullPlan;
}

/**
 * Prepara contexto completo para a IA
 */
function prepareMultiRaceContext(
  profile: MultiRaceProfile,
  raceA: RaceInPlan,
  totalWeeks: number
): string {
  let context = `# PERFIL DO ATLETA E SISTEMA DE MÚLTIPLAS CORRIDAS\n\n`;
  
  // Dados básicos
  context += `## Dados Básicos\n`;
  context += `- Nível: ${profile.runningLevel}\n`;
  context += `- Volume Semanal Atual: ${profile.currentWeeklyKm}km\n`;
  context += `- Maior Corrida Recente: ${profile.longestRun}km\n`;
  if (profile.age) context += `- Idade: ${profile.age} anos\n`;
  context += `- Peso: ${profile.weight}kg\n`;
  if (profile.currentVDOT) context += `- VDOT Atual: ${profile.currentVDOT}\n`;
  
  // SISTEMA DE MÚLTIPLAS CORRIDAS
  context += `\n## SISTEMA DE MÚLTIPLAS CORRIDAS (A, B, C)\n\n`;
  context += `### Corrida A - OBJETIVO PRINCIPAL\n`;
  context += `- 🎯 ${raceA.raceName}\n`;
  context += `- Distância: ${raceA.distance}\n`;
  context += `- Data: ${new Date(raceA.raceDate).toLocaleDateString('pt-BR')}\n`;
  context += `- Semanas de treino: ${totalWeeks}\n`;
  if (raceA.targetTime) context += `- Meta de tempo: ${raceA.targetTime}\n`;
  context += `\n**TODA a periodização deve culminar nesta corrida!**\n`;
  
  // Corridas B
  const racesB = profile.races.filter(r => r.priority === 'B');
  if (racesB.length > 0) {
    context += `\n### Corridas B - PREPARATÓRIAS (${racesB.length})\n`;
    context += `Estas corridas devem ser INTEGRADAS ao plano como testes de ritmo:\n\n`;
    racesB.forEach(race => {
      context += `- **${race.raceName}** (${race.distance})\n`;
      context += `  - Data: ${new Date(race.raceDate).toLocaleDateString('pt-BR')}\n`;
      context += `  - Semanas antes da corrida A: ${race.weeksBeforeA}\n`;
      context += `  - Fase: ${race.periodPhase}\n`;
      context += `  - Estratégia: ${race.trainingSuggest}\n\n`;
    });
  }
  
  // Corridas C
  const racesC = profile.races.filter(r => r.priority === 'C');
  if (racesC.length > 0) {
    context += `\n### Corridas C - VOLUME/EXPERIÊNCIA (${racesC.length})\n`;
    context += `Estas corridas substituem o treino longo da semana - SEM taper:\n\n`;
    racesC.forEach(race => {
      context += `- **${race.raceName}** (${race.distance})\n`;
      context += `  - Data: ${new Date(race.raceDate).toLocaleDateString('pt-BR')}\n`;
      context += `  - Uso: ${race.trainingSuggest}\n\n`;
    });
  }
  
  // Disponibilidade
  if (profile.trainingActivities && profile.trainingActivities.length > 0) {
    context += `\n## Disponibilidade de Treino\n`;
    profile.trainingActivities.forEach((activity: any) => {
      if (activity.availableDays && activity.availableDays.length > 0) {
        const days = activity.availableDays.map((d: number) => 
          ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d]
        ).join(', ');
        context += `- ${activity.name}: ${days}\n`;
      }
    });
  }
  
  // Paces usuais
  if (profile.usualPaces && Object.keys(profile.usualPaces).length > 0) {
    context += `\n## Paces Reais de Corridas Anteriores\n`;
    Object.entries(profile.usualPaces).forEach(([distance, pace]) => {
      if (pace && pace !== '' && pace !== 'never') {
        context += `- ${distance}: ${pace}\n`;
      }
    });
  }
  
  return context;
}

/**
 * Gera estratégia usando IA
 */
async function generateAIStrategy(
  context: string,
  totalWeeks: number,
  maxRetries: number
): Promise<any> {
  const systemPrompt = `Você é um treinador expert em PERIODIZAÇÃO para múltiplas corridas.

ESPECIALIZAÇÃO:
- Periodização linear e ondulada
- Integração de múltiplas corridas (A, B, C)
- Sistema de Jack Daniels (VDOT)
- Tapering e peaking estratégico

PRINCÍPIOS CRÍTICOS PARA MÚLTIPLAS CORRIDAS:

1. CORRIDA A (Objetivo Principal):
   - TODO o plano culmina aqui
   - Taper completo de 2-3 semanas
   - Pico de forma EXATO na data

2. CORRIDAS B (Preparatórias - 2 a 6 semanas antes da A):
   - Mini-taper de 4-7 dias
   - Usar como teste de ritmo REAL
   - Integrar na fase de peak
   - Recuperação de 5-7 dias após

3. CORRIDAS C (Volume - >6 semanas ou <2 semanas antes da A):
   - SEM taper (treino normal na semana)
   - Substituem o longão da semana
   - Recuperação de 2-3 dias após
   - Não afetar o treino regular

PERIODIZAÇÃO:
- Base (primeiras 40%): Volume baixo→moderado, intensidade mínima
- Build (30%): Volume moderado→alto, adicionar qualidade
- Peak (20%): Volume alto, qualidade alta, incluir corridas B
- Taper (10%): Reduzir volume 50-70%, manter intensidade

REGRAS INVIOLÁVEIS:
- Nunca ultrapassar 10% de aumento semanal
- Cutback weeks a cada 3-4 semanas (reduzir 20-30%)
- 48-72h entre treinos intensos
- Long run max 30% do volume semanal
- Recuperação adequada após corridas B e C`;

  const userPrompt = `${context}

# TAREFA: CRIAR ESTRATÉGIA DE PERIODIZAÇÃO INTEGRADA

Crie uma estratégia que INTEGRE todas as corridas de forma CIENTÍFICA.

FORMATO DA RESPOSTA (JSON):
{
  "totalWeeks": ${totalWeeks},
  "vdot": <estimativa baseada nos paces>,
  "paces": {
    "easy": "X:XX min/km",
    "marathon": "X:XX min/km",
    "threshold": "X:XX min/km",
    "interval": "X:XX min/km",
    "repetition": "X:XX min/km"
  },
  "planRationale": "Explicação da estratégia geral do plano",
  "raceIntegrationStrategy": "Como as corridas B e C foram integradas",
  "keyConsiderations": ["ponto1", "ponto2", ...],
  "progressionStrategy": "Como o volume e intensidade progridem",
  "nutritionAdvice": "Conselhos nutricionais",
  "injuryPreventionTips": ["dica1", "dica2", ...],
  "phases": [
    {
      "name": "Nome da Fase",
      "weeks": <número de semanas>,
      "focus": "Foco principal",
      "description": "Descrição detalhada",
      "weeklyKmStart": <km inicial>,
      "weeklyKmEnd": <km final>,
      "raceWeeks": [<semanas com corridas B ou C>],
      "keyWorkouts": {
        "easy": { "frequency": 2-3, "description": "..." },
        "long": { "distanceStart": X, "distanceEnd": Y, "description": "..." },
        "quality": { "type": "tempo|intervals|none", "frequency": 0-2, "description": "..." },
        "strength": { "frequency": 2-3, "description": "..." }
      },
      "taperInstructions": "Se fase tiver corridas B: instruções de mini-taper"
    }
  ],
  "weeklyPattern": {
    "description": "Padrão semanal típico",
    "restDays": [dias],
    "longRunDay": X,
    "qualityDays": [dias],
    "strengthDays": [dias]
  },
  "raceWeekAdjustments": {
    "corrida_b": {
      "weekBefore": "O que fazer na semana antes da corrida B",
      "raceWeek": "Como ajustar a semana da corrida B",
      "weekAfter": "Recuperação pós-corrida B"
    },
    "corrida_c": {
      "raceWeek": "Como tratar a semana da corrida C (sem taper)",
      "recovery": "Recuperação rápida 2-3 dias"
    }
  }
}

IMPORTANTE:
- Para corridas B: SEMPRE incluir mini-taper
- Para corridas C: SEM taper, mantém rotina
- Periodização DEVE culminar na corrida A
- Respeitar disponibilidade do atleta`;

  console.log('[MULTI-RACE AI] Gerando estratégia com sistema resiliente...');

  // Cache key baseado nas corridas
  const raceIds = context.match(/id: (\d+)/g)?.join('-') || 'default';
  const cacheKey = `multi-race-plan-${raceIds}-${totalWeeks}w`;

  try {
    const aiResponse = await resilientAICall(
      () => callLLM({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 8000,
      }),
      {
        cacheKey,
        cacheTTL: 7200000, // 2 horas (planos multi-race são mais estáveis)
        validateResponse: (response: string) => {
          try {
            const data = JSON.parse(response);
            return (
              data.totalWeeks &&
              data.phases &&
              Array.isArray(data.phases) &&
              data.paces &&
              data.raceIntegrationStrategy
            );
          } catch {
            return false;
          }
        },
        retryConfig: {
          maxRetries,
          baseDelay: 1000,
          maxDelay: 10000,
          backoffMultiplier: 2,
        },
        timeout: 60000, // 60 segundos
      }
    );

    const strategy = JSON.parse(aiResponse);
    console.log('[MULTI-RACE AI] Estratégia gerada e validada com sucesso!');
    return strategy;
  } catch (error) {
    console.error('[MULTI-RACE AI] Falha após todas as tentativas:', error);
    throw new Error('Não foi possível gerar o plano integrado neste momento. Por favor, tente novamente em alguns instantes.');
  }
}

/**
 * Expande estratégia em plano completo
 */
function expandMultiRaceStrategy(
  strategy: any,
  profile: MultiRaceProfile,
  totalWeeks: number,
  raceA: RaceInPlan
): MultiRacePlan {
  console.log('[MULTI-RACE] Expandindo estratégia em plano completo...');
  
  // Implementação similar ao ai-plan-generator.ts mas com:
  // 1. Integração de corridas B e C
  // 2. Mini-tapers para corridas B
  // 3. Ajustes de volume nas semanas de corrida
  
  // Por ora, retornar estrutura básica
  // TODO: Implementar expansão completa
  
  return {
    totalWeeks,
    startDate: new Date(),
    primaryRaceDate: new Date(raceA.raceDate),
    periodization: {
      phases: strategy.phases || []
    },
    weeks: [],
    paces: strategy.paces,
    vdot: strategy.vdot,
    planRationale: strategy.planRationale,
    keyConsiderations: strategy.keyConsiderations,
    progressionStrategy: strategy.progressionStrategy,
    raceIntegrationStrategy: strategy.raceIntegrationStrategy,
    nutritionAdvice: strategy.nutritionAdvice,
    injuryPreventionTips: strategy.injuryPreventionTips,
  };
}
