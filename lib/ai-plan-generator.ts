/**
 * Sistema de Geração de Planos de Treinamento com IA
 *
 * Este sistema usa inteligência artificial para analisar o perfil completo do atleta
 * e gerar planos de treinamento verdadeiramente personalizados baseados em:
 * - Ciência do treinamento esportivo
 * - Perfil individual (idade, peso, experiência, histórico)
 * - Disponibilidade real (dias, horários)
 * - Objetivos específicos
 * - Condições médicas e preferências
 */

import { callLLM } from './llm-client';
import { resilientAICall } from './ai-resilience';
import { buildComprehensiveContext } from './ai-context-builder';
import { LONG_RUN_EXAMPLE, INTERVALS_EXAMPLE, TEMPO_RUN_EXAMPLE, EASY_RUN_EXAMPLE, getWorkoutExample } from './ai-workout-examples';
import type { WorkoutGenerationData } from './types/workout-structure';
import { enhanceWorkout } from './workout-enhancer';
import { buildEnhancedSystemPrompt } from './ai-system-prompt-v3';
import { calculatePaces } from './planGenerator';
import { mapProfileToTrackableFields, trackFieldUsage } from './ai-field-tracking'; // v3.1.0

export interface AIUserProfile {
  // Dados básicos
  runningLevel: string;
  goalDistance: string;
  targetRaceDate: Date;
  currentWeeklyKm: number;
  longestRun: number;
  currentVDOT?: number;
  targetTime?: string;
  weight: number;
  height?: number;
  age?: number;
  gender?: string;
  
  // Disponibilidade e preferências (v1.7.3 - Nova estrutura)
  trainingSchedule?: Record<number, {
    running: boolean;
    activities: string[];
  }>;
  customActivities?: string[];
  longRunDay?: number;
  
  // DEPRECATED: Estrutura antiga (mantida para compatibilidade)
  trainingActivities?: any[];
  
  // Paces usuais (dados reais)
  usualPaces?: Record<string, string>;
  
  // Performance adicional (v1.6.0)
  bestTimes?: Record<string, { time: string; vdot: number; totalSeconds: number; date?: string }>;
  runningYears?: number;
  maxHeartRate?: number;
  recentLongRunPace?: string;
  restingHeartRate?: number;
  
  // Experiência Multiesportiva (v1.6.0)
  otherSportsExperience?: string;
  
  // Saúde e Bem-estar (v1.6.0)
  sleepQuality?: number; // 1-5
  stressLevel?: number; // 1-5
  
  // Informações médicas
  injuries?: string[];
  medicalConditions?: string[];
  limitations?: string[];
  
  // Histórico
  previousRaces?: Array<{ 
    distance: string;
    time: string;
    date: Date;
  }>;

  // Corridas cadastradas (Sistema de Múltiplas Corridas)
  raceGoals?: Array<{ 
    id: number;
    name: string;
    distance: string;
    date: Date;
    targetTime?: string;
    priority: 'A' | 'B' | 'C';
  }>;

  // Equipamentos disponíveis
  hasGymAccess?: boolean;
  hasPoolAccess?: boolean;
  hasTrackAccess?: boolean; // v1.6.0
  
  // Preferências (v1.6.0)
  trainingPreferences?: {
    location?: string[];
    preference?: string;
    groupTraining?: boolean;
    indoorOutdoor?: string;
  };
  motivationFactors?: {
    primary?: string;
    secondary?: string[];
    goals?: string[];
  };

  // v2.5.0: Novos campos para personalização avançada
  hasRunBefore?: boolean;          // Detecta iniciante absoluto
  currentlyInjured?: boolean;      // Flag lesão ativa
  avgSleepHours?: number;          // Horas de sono (recovery)
  tracksMenstrualCycle?: boolean;  // Mulheres (opcional)
  avgCycleLength?: number;         // Duração ciclo menstrual
  lastPeriodDate?: Date;           // Data última menstruação
  workDemand?: string;             // 'sedentary' | 'moderate' | 'physical'
  familyDemand?: string;           // 'low' | 'moderate' | 'high'

  // Contexto de Execução (para ajustes/regeneração)
  recentWorkoutCompletion?: {
    completedCount: number;
    totalCount: number;
    percentage: number;
    period: string; // Ex: "últimas 4 semanas"
  };
  athleteFeedback?: Array<{ 
    date: Date;
    type: 'fatiga' | 'dor' | 'motivacao' | 'desempenho' | 'outro';
    message: string;
  }>;
  currentPhysicalState?: {
    energyLevel?: 'alto' | 'normal' | 'baixo' | 'exausto';
    soreness?: 'nenhuma' | 'leve' | 'moderada' | 'intensa';
    motivation?: 'alta' | 'normal' | 'baixa';
    sleepQuality?: 'otimo' | 'bom' | 'regular' | 'ruim';
  };

  // v2.1.0: Dados do Strava (Premium only)
  stravaData?: {
    hasStravaData: boolean;
    recentRunsTotals?: {
      count: number;
      distance: number;
      moving_time: number;
      elevation_gain: number;
    };
    ytdRunsTotals?: {
      count: number;
      distance: number;
      moving_time: number;
      elevation_gain: number;
    };
    personalRecords?: Array<{
      type: string;
      distance: number;
      time: number;
      pace: string;
      date: Date;
    }>;
    trainingZones?: {
      maxHeartRate?: number;
      restingHeartRate?: number;
      zones: any;
    };
    primaryGear?: {
      name: string;
      distance: number;
      brand?: string;
      model?: string;
    };
  };
}

export interface AIGeneratedPlan {
  // Estrutura do plano
  totalWeeks: number;
  startDate: Date;
  targetRaceDate: Date;
  
  // Fases do treinamento
  phases: Array<{ 
    name: string;
    weeks: number;
    focus: string;
    description: string;
  }>;
  
  // Semanas detalhadas
  weeks: Array<{ 
    weekNumber: number;
    startDate: Date;
    endDate: Date;
    phase: string;
    focus: string;
    totalDistance: number;
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
      targetHeartRate?: string;
      targetRPE?: number;
      isStrengthSpecific?: boolean;
      equipmentRequired?: string;
    }>;
  }>;
  
  // Ritmos personalizados
  paces: { 
    easy: string;
    marathon: string;
    threshold: string;
    interval: string;
    repetition: string;
  };
  
  // VDOT calculado
  vdot: number;
  
  // Explicações e conselhos
  planRationale: string;
  keyConsiderations: string[];
  progressionStrategy: string;
  nutritionAdvice?: string;
  injuryPreventionTips?: string[];
  
  // Avisos importantes
  warnings?: {
    isShortNotice?: boolean;
    shortNoticeMessage?: string;
  };
}

/**
 * Prepara o contexto completo do usuário para a IA
 * @deprecated v1.3.0 - Use buildComprehensiveContext from ai-context-builder.ts
 */
function prepareUserContext_LEGACY(profile: AIUserProfile): string { 
  const today = new Date();
  const raceDate = new Date(profile.targetRaceDate);
  // Usar Math.ceil para incluir a semana da corrida (mesmo que seja parcial)
  const weeksUntilRace = Math.ceil((raceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7));
  
  let context = `# PERFIL DO ATLETA\n\n`;
  
  // CONTEXTO PROFUNDO - Análise do Perfil (para TODOS os níveis)
  const isAbsoluteBeginner = profile.currentWeeklyKm === 0 || profile.longestRun === 0 || (profile as any).hasRunBefore === false;
  const hasExperience = profile.currentWeeklyKm > 0 && profile.longestRun > 0;
  const hasRaceHistory = profile.usualPaces && Object.keys(profile.usualPaces).length > 0;
  const isHighVolume = profile.currentWeeklyKm >= 50;
  
  context += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  context += `🎯 VOCÊ É UM TREINADOR DE ELITE CRIANDO UM PLANO ÚNICO\n`;
  context += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  context += `⚠️ MISSÃO CRÍTICA:\n`;
  context += `Analise PROFUNDAMENTE este atleta e crie um plano que seja:\n`;
  context += `- 100% ÚNICO para esta pessoa específica\n`;
  context += `- Impossível de confundir com plano de outra pessoa\n`;
  context += `- Baseado em ANÁLISE REAL, não fórmulas prontas\n\n`;
  
  // Análise contextual do perfil
  if (isAbsoluteBeginner) {
    context += `📊 PERFIL DETECTADO: Iniciante Absoluto (sem base de corrida)\n\n`;
    context += `🔍 ANÁLISE OBRIGATÓRIA ANTES DE CRIAR O PLANO:\n\n`;
    context += `1. **Base Atlética:**\n`;
    context += `   - Tem experiência em outros esportes? (${(profile as any).otherSportsExperience || 'não informado'})\n`;
    context += `   - Se sim: Qual capacidade cardiovascular já possui?\n`;
    context += `   - Se não: Precisa construir tudo do zero?\n\n`;
    
    context += `2. **Perfil Físico & Biomecânico:**\n`;
    context += `   - Idade ${profile.age || '?'} anos: Capacidade de recuperação e adaptação?\n`;
    context += `   - Peso ${profile.weight}kg + Altura ${profile.height || '?'}cm: Impacto articular a considerar?\n`;
    context += `   - Histórico de lesões: ${(profile as any).hasInjuryHistory ? 'SIM - ATENÇÃO REDOBRADA' : 'Não'}\n\n`;
    
    context += `3. **Estilo de Vida Real:**\n`;
    context += `   - Sono: ${(profile as any).sleepQuality ? (profile as any).sleepQuality + '/5' : '?'} - Afeta recuperação\n`;
    context += `   - Estresse: ${(profile as any).stressLevel ? (profile as any).stressLevel + '/5' : '?'} - Afeta capacidade de treino\n`;
    context += `   - Tempo disponível: ${Object.keys(profile.trainingSchedule || {}).length} dias/semana\n\n`;
    
    context += `4. **Ponto de Partida Ideal:**\n`;
    context += `   🤔 Perguntas que VOCÊ deve responder:\n`;
    context += `   - Dado TODO esse contexto, qual é o primeiro treino apropriado?\n`;
    context += `   - Caminhada? Por quanto tempo? Por quê?\n`;
    context += `   - Ou já pode trotar? Por quanto tempo? Por quê?\n`;
    context += `   - Qual ritmo de progressão faz sentido para ESTA pessoa?\n`;
    context += `   - Como balancear segurança com motivação?\n\n`;
    
    context += `5. **Progressão Personalizada:**\n`;
    context += `   - Quanto tempo até corrida contínua? (depende da base atlética!)\n`;
    context += `   - Qual % de aumento semanal? (depende de idade, peso, recuperação!)\n`;
    context += `   - Quando introduzir qualidade? (depende de como adapta!)\n\n`;
    
  } else if (hasExperience && !hasRaceHistory) {
    context += `📊 PERFIL DETECTADO: Corredor em Desenvolvimento (${profile.currentWeeklyKm}km/semana)\n\n`;
    context += `🔍 ANÁLISE OBRIGATÓRIA:\n\n`;
    
    context += `1. **Nível Atual Real:**\n`;
    context += `   - Volume: ${profile.currentWeeklyKm}km/semana - Isto é ALTO ou BAIXO para ele?\n`;
    context += `   - Longão: ${profile.longestRun}km - Qual % do volume semanal?\n`;
    context += `   - Anos correndo: ${(profile as any).runningYears || '?'} - Veterano ou ainda adaptando?\n\n`;
    
    context += `2. **Capacidade de Progressão:**\n`;
    context += `   🤔 Analise:\n`;
    context += `   - Com este volume base, quanto pode aumentar SEM risco?\n`;
    context += `   - Já tem base aeróbica? Ou precisa construir mais?\n`;
    context += `   - Pode aguentar treinos de qualidade? Ou ainda precisa volume base?\n`;
    context += `   - Histórico de lesões indica fragilidade ou resiliência?\n\n`;
    
    context += `3. **Gap de Desenvolvimento:**\n`;
    context += `   - O que falta para alcançar ${profile.goalDistance}?\n`;
    context += `   - É questão de volume? Velocidade? Resistência mental?\n`;
    context += `   - Onde estão os pontos fracos desta pessoa?\n`;
    context += `   - Como transformar fraquezas em forças?\n\n`;
    
    context += `4. **Estratégia Individualizada:**\n`;
    context += `   - Perfil de treino atual parece monótono? Precisa variar?\n`;
    context += `   - Ou está progredindo bem e só precisa estrutura?\n`;
    context += `   - Como tornar cada semana diferente e engajante?\n\n`;
    
  } else if (hasRaceHistory && !isHighVolume) {
    context += `📊 PERFIL DETECTADO: Corredor Experiente (${profile.currentWeeklyKm}km/semana, com histórico)\n\n`;
    context += `🔍 ANÁLISE PROFUNDA:\n\n`;
    
    context += `1. **Dados Reais de Performance:**\n`;
    context += `   ${Object.entries(profile.usualPaces || {}).map(([dist, pace]) => `- ${dist}: ${pace}`).join('\n   ')}\n\n`;
    context += `   🤔 O que isso revela:\n`;
    context += `   - Qual é o VDOT real desta pessoa?\n`;
    context += `   - Está correndo próximo do potencial ou tem margem?\n`;
    context += `   - Paces são coerentes entre distâncias?\n`;
    context += `   - Onde está o ponto fraco? (base aeróbica? velocidade? resistência?)\n\n`;
    
    context += `2. **Potencial de Melhora:**\n`;
    context += `   - Volume atual ${profile.currentWeeklyKm}km - Pode aumentar sem overtraining?\n`;
    context += `   - Tempo disponível: ${weeksUntilRace} semanas - Suficiente para que tipo de ganho?\n`;
    context += `   - Idade ${profile.age || '?'} - Capacidade de absorver treinos intensos?\n\n`;
    
    context += `3. **Plano de Ataque Personalizado:**\n`;
    context += `   🎯 Decida baseado no perfil real:\n`;
    context += `   - Este atleta precisa mais de VOLUME ou QUALIDADE?\n`;
    context += `   - Qual mix de treinos vai gerar máximo ganho?\n`;
    context += `   - Como evitar que platee ou se lesione?\n`;
    context += `   - Que tipo de treinos vão mantê-lo engajado?\n\n`;
    
  } else if (isHighVolume) {
    context += `📊 PERFIL DETECTADO: Atleta de Alto Volume (${profile.currentWeeklyKm}km/semana)\n\n`;
    context += `🔍 ANÁLISE DE ATLETA AVANÇADO:\n\n`;
    
    context += `1. **Capacidade Demonstrada:**\n`;
    context += `   - ${profile.currentWeeklyKm}km/semana - Volume substancial!\n`;
    context += `   - Anos de experiência: ${(profile as any).runningYears || '?'}\n`;
    context += `   - Histórico de provas: ${hasRaceHistory ? 'SIM - Use dados reais!' : 'Não disponível'}\n\n`;
    
    context += `2. **Desafio do Alto Rendimento:**\n`;
    context += `   🤔 Questões críticas:\n`;
    context += `   - Como adicionar estímulo SEM overtraining?\n`;
    context += `   - Qual é o limitador atual? (não é volume!)\n`;
    context += `   - Velocidade máxima? Limiar? Economia de corrida?\n`;
    context += `   - Como periodizar para pico no dia certo?\n\n`;
    
    context += `3. **Plano de Elite:**\n`;
    context += `   - Não precisa "aprender a correr" - precisa OTIMIZAR\n`;
    context += `   - Qualidade > Quantidade (já tem quantidade)\n`;
    context += `   - Recuperação estratégica é CRUCIAL\n`;
    context += `   - Cada treino deve ter propósito cirúrgico\n`;
    context += `   - Como evitar monotonia em alto volume?\n\n`;
  }
  
  context += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  context += `💡 PRINCÍPIOS FUNDAMENTAIS PARA TODOS OS NÍVEIS:\n`;
  context += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  context += `1. **Individualização Total:**\n`;
  context += `   - Não existe "plano padrão para intermediário"\n`;
  context += `   - Intermediário de 25 anos ≠ Intermediário de 45 anos\n`;
  context += `   - Mesmo volume, diferentes históricos = planos diferentes\n\n`;
  
  context += `2. **Análise Contextual:**\n`;
  context += `   - Use TODOS os dados: idade, peso, sono, estresse, lesões, disponibilidade\n`;
  context += `   - Pergunte: "O que ESTA pessoa precisa para ter sucesso?"\n`;
  context += `   - Não pergunte: "O que o manual diz para intermediários?"\n\n`;
  
  context += `3. **Progressão Inteligente:**\n`;
  context += `   - Desafiadora mas não temerária\n`;
  context += `   - Baseada em capacidade real, não categoria\n`;
  context += `   - Ajustada por resposta individual (sono, estresse, lesões)\n\n`;
  
  context += `4. **Variação com Propósito:**\n`;
  context += `   - Cada semana deve ser DIFERENTE da anterior\n`;
  context += `   - Mas com LÓGICA de progressão clara\n`;
  context += `   - Monotonia = abandono\n`;
  context += `   - Variedade = engajamento = resultados\n\n`;
  
  context += `5. **Tom Personalizado:**\n`;
  context += `   - Escreva como se conhecesse esta pessoa\n`;
  context += `   - "Dado seu histórico de..." não "Corredores intermediários..."\n`;
  context += `   - "Considerando que você..." não "Neste nível..."\n\n`;
  
  // Dados básicos
  context += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  context += `📋 DADOS COMPLETOS DO ATLETA:\n`;
  context += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  context += `## Dados Básicos\n`;
  context += `- Nível de Corrida: ${profile.runningLevel}\n`;
  context += `- Objetivo: ${profile.goalDistance}\n`;
  context += `- Data da Prova: ${raceDate.toLocaleDateString('pt-BR')}\n`;
  context += `- Semanas até a Prova: ${weeksUntilRace}\n`;
  if (profile.targetTime) context += `- Tempo Alvo: ${profile.targetTime}\n`;
  context += `- Volume Semanal Atual: ${profile.currentWeeklyKm}km\n`;
  context += `- Maior Corrida Recente: ${profile.longestRun}km\n`;
  if (profile.age) context += `- Idade: ${profile.age} anos\n`;
  if (profile.gender) context += `- Gênero: ${profile.gender}\n`;
  context += `- Peso: ${profile.weight}kg\n`;
  if (profile.height) context += `- Altura: ${profile.height}cm\n`;
  if (profile.currentVDOT) context += `- VDOT Atual: ${profile.currentVDOT}\n`;
  
  // Novos campos fisiológicos e de experiência
  if ((profile as any).runningYears) {
    context += `- Anos de Experiência em Corrida: ${(profile as any).runningYears} anos\n`;
  }
  if ((profile as any).maxHeartRate) {
    context += `- FC Máxima: ${(profile as any).maxHeartRate} bpm\n`;
  }
  if ((profile as any).recentLongRunPace) {
    context += `- Pace do Último Longão: ${(profile as any).recentLongRunPace}\n`;
  }
  
  // Estilo de vida
  if ((profile as any).sleepQuality || (profile as any).stressLevel) {
    context += `\n## Estilo de Vida\n`;
    if ((profile as any).sleepQuality) {
      const sleepLabels = ['', 'Ruim', 'Regular', 'Bom', 'Muito Bom', 'Ótimo'];
      context += `- Qualidade do Sono: ${sleepLabels[(profile as any).sleepQuality]} (${(profile as any).sleepQuality}/5)\n`;
    }
    if ((profile as any).stressLevel) {
      const stressLabels = ['', 'Baixo', 'Leve', 'Moderado', 'Alto', 'Muito Alto'];
      context += `- Nível de Estresse Diário: ${stressLabels[(profile as any).stressLevel]} (${(profile as any).stressLevel}/5)\n`;
    }
  }
  
  // Experiência em outros esportes
  if ((profile as any).otherSportsExperience) {
    context += `\n## Base Atlética\n`;
    context += `- Experiência em Outros Esportes: ${(profile as any).otherSportsExperience}\n`;
  }
  
  // Paces usuais (dados reais!)
  if (profile.usualPaces && Object.keys(profile.usualPaces).length > 0) {
    context += `\n## Paces Usuais (Dados Reais de Corridas)\n`;
    Object.entries(profile.usualPaces).forEach(([distance, pace]) => {
      if (pace && pace !== '') {
        context += `- ${distance}: ${pace}\n`;
      }
    });
  }
  
  // Disponibilidade - Suporta AMBAS estruturas (v1.7.3 e v1.2.0)
  context += `\n## Disponibilidade e Preferências de Treino\n`;
  
  // Nova estrutura (v1.7.3) - PRIORIDADE
  if (profile.trainingSchedule) {
    const schedule = profile.trainingSchedule;
    const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    // Dias de corrida
    const runningDays = Object.keys(schedule)
      .filter(day => schedule[parseInt(day)]?.running)
      .map(day => daysOfWeek[parseInt(day)]);
    
    if (runningDays.length > 0) {
      context += `- **Corrida disponível em:** ${runningDays.join(', ')}\n`;
    }
    
    // Dia do longão
    if (profile.longRunDay !== null && profile.longRunDay !== undefined) {
      context += `- **Dia preferido para Longão:** ${daysOfWeek[profile.longRunDay]}\n`;
    }
    
    // Outras atividades por dia
    const otherActivitiesByDay: Record<string, string[]> = {};
    Object.keys(schedule).forEach(dayKey => {
      const dayNum = parseInt(dayKey);
      const dayData = schedule[dayNum];
      
      if (dayData.activities && dayData.activities.length > 0) {
        const dayName = daysOfWeek[dayNum];
        const activities = dayData.activities;
        
        // Se tem corrida E outras atividades
        if (dayData.running) {
          context += `- **${dayName}:** Corrida + ${activities.join(', ')} (ajustar intensidade considerando carga total)\n`;
        } else {
          // Só outras atividades (sem corrida)
          context += `- **${dayName}:** ${activities.join(', ')} - NÃO agendar corrida neste dia, apenas indicar estas atividades\n`;
        }
      }
    });
    
    // Esportes customizados
    if (profile.customActivities && profile.customActivities.length > 0) {
      context += `\n**Esportes Adicionais Praticados pelo Atleta:**\n`;
      profile.customActivities.forEach(sport => {
        const sportName = sport.split('_').map(w => 
          w.charAt(0).toUpperCase() + w.slice(1)
        ).join(' ');
        context += `- ${sportName}\n`;
      });
    }
    
    context += `\n**IMPORTANTE:** Respeite TODAS as atividades do atleta:\n`;
    context += `- Dias com CORRIDA: agende treinos de corrida\n`;
    context += `- Dias com OUTRAS ATIVIDADES SEM corrida: NÃO agende corrida, apenas mencione "realize suas atividades habituais"\n`;
    context += `- Dias com CORRIDA + OUTRAS ATIVIDADES: ajuste a intensidade da corrida considerando a carga total do dia\n`;
    context += `- Dias SEM NENHUMA atividade: descanso completo\n`;
  }
  // Estrutura antiga (v1.2.0) - FALLBACK
  else if (profile.trainingActivities && profile.trainingActivities.length > 0) {
    profile.trainingActivities.forEach((activity: any) => {
      if (activity.availableDays && activity.availableDays.length > 0) {
        const days = activity.availableDays.map((d: number) => 
          ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][d]
        ).join(', ');
        const time = activity.preferredTime === 'morning' ? 'Manhã' : 
                     activity.preferredTime === 'afternoon' ? 'Tarde' : 
                     activity.preferredTime === 'evening' ? 'Noite' : 'Flexível';
        context += `- ${activity.name}: ${days} (${time})\n`;
      }
    });
    if (profile.longRunDay !== null && profile.longRunDay !== undefined) {
      const longRunDayName = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][profile.longRunDay];
      context += `- Dia Preferido para Longão: ${longRunDayName}\n`;
    }
  }
  
  // Informações médicas
  if (profile.injuries && profile.injuries.length > 0) {
    context += `\n## Histórico de Lesões\n`;
    profile.injuries.forEach(injury => {
      context += `- ${injury}\n`;
    });
  }
  
  if (profile.medicalConditions && profile.medicalConditions.length > 0) {
    context += `\n## Condições Médicas\n`;
    profile.medicalConditions.forEach(condition => {
      context += `- ${condition}\n`;
    });
  }
  
  if (profile.limitations && profile.limitations.length > 0) {
    context += `\n## Limitações Físicas\n`;
    profile.limitations.forEach(limitation => {
      context += `- ${limitation}\n`;
    });
  }
  
  // Histórico de provas
  if (profile.previousRaces && profile.previousRaces.length > 0) {
    context += `\n## Histórico de Provas\n`;
    profile.previousRaces.forEach(race => {
      context += `- ${race.distance}: ${race.time} (${new Date(race.date).toLocaleDateString('pt-BR')})\n`;
    });
  }
  
  // Equipamentos
  context += `\n## Acesso a Equipamentos\n`;
  context += `- Academia/Musculação: ${profile.hasGymAccess ? 'Sim' : 'Não'}\n`;
  context += `- Piscina/Natação: ${profile.hasPoolAccess ? 'Sim' : 'Não'}\n`;

  // 🎯 Corridas cadastradas (Sistema A, B, C) - CRÍTICO PARA O PLANO!
  if (profile.raceGoals && profile.raceGoals.length > 0) {
    context += `\n## 🎯 CORRIDAS CADASTRADAS - PLANEJAMENTO OBRIGATÓRIO\n`;
    context += `\n⚠️ **ATENÇÃO CRÍTICA:** O atleta cadastrou corridas com objetivos específicos.\n`;
    context += `TODO o plano DEVE ser estruturado em torno destas datas!\n\n`;
    
    // Encontrar Corrida A (objetivo principal)
    const raciaA = profile.raceGoals.find(r => r.priority === 'A');
    const corridasB = profile.raceGoals.filter(r => r.priority === 'B');
    const corridasC = profile.raceGoals.filter(r => r.priority === 'C');
    
    profile.raceGoals.forEach(race => {
      const raceDate = new Date(race.date);
      const daysUntilRace = Math.floor((raceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const weeksUntilRace = Math.ceil(daysUntilRace / 7);
      const weekNumber = weeksUntilRace; // Número da semana no plano

      context += `### ${race.priority === 'A' ? '🏆' : race.priority === 'B' ? '🥈' : '🥉'} ${race.name}\n`;
      context += `- **Distância:** ${race.distance}\n`;
      context += `- **Data:** ${raceDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
      context += `- **Semana do Plano:** Semana ${weekNumber}\n`;
      context += `- **Dias Restantes:** ${daysUntilRace} dias\n`;
      if (race.targetTime) context += `- **Meta de Tempo:** ${race.targetTime}\n`;
      
      if (race.priority === 'A') {
        context += `\n🏆 **CORRIDA A - OBJETIVO PRINCIPAL DO ATLETA**\n`;
        context += `\n**ESTRUTURA OBRIGATÓRIA DO PLANO:**\n`;
        context += `- **Semana ${Math.max(1, weekNumber - 3)}:** PICO (volume máximo, última corrida longa)\n`;
        context += `- **Semana ${Math.max(1, weekNumber - 2)}:** TAPER 1 (70% volume, longão 60-70% do máximo)\n`;
        context += `- **Semana ${weekNumber - 1}:** TAPER 2 (50% volume, qualidade curta)\n`;
        context += `- **Semana ${weekNumber} (SEMANA DA PROVA):** TAPER FINAL (30% volume, descanso 2-3 dias antes)\n`;
        context += `\n**PROTOCOLO DO TAPER (OBRIGATÓRIO):**\n`;
        context += `1. Semana -2 (Semana ${weekNumber - 2}):\n`;
        context += `   - Volume: 70% do pico\n`;
        context += `   - Longão: 60-70% do máximo (ÚLTIMA corrida longa!)\n`;
        context += `   - Qualidade: 1x sessão em ritmo de prova (curta)\n`;
        context += `2. Semana -1 (Semana ${weekNumber - 1}):\n`;
        context += `   - Volume: 50% do pico\n`;
        context += `   - Corridas fáceis curtas (5-8km)\n`;
        context += `   - 1x sessão: 5km com 3-4x 1km ritmo de prova\n`;
        context += `3. Semana da Prova (Semana ${weekNumber}):\n`;
        context += `   - Volume: 30% do pico\n`;
        context += `   - Segunda: Fácil 5km\n`;
        context += `   - Terça: DESCANSO\n`;
        context += `   - Quarta: 5km com 3x 800m ritmo (manter pernas ativas)\n`;
        context += `   - Quinta: Fácil 3km OU descanso\n`;
        context += `   - Sexta: DESCANSO TOTAL\n`;
        context += `   - Sábado (se prova domingo): DESCANSO TOTAL\n`;
        context += `   - **DIA DA PROVA: 🏁 ${race.name}**\n`;
      } else if (race.priority === 'B') {
        context += `\n🥈 **CORRIDA B - PREPARATÓRIA/TESTE**\n`;
        context += `- Use como simulado de ritmo e teste de estratégia\n`;
        context += `- Mini-taper: Semana da corrida com 80-85% volume\n`;
        context += `- Descanso 1 dia antes\n`;
        context += `- Semana seguinte: Volume normal (recuperação ativa)\n`;
      } else {
        context += `\n🥉 **CORRIDA C - TREINO DE VOLUME**\n`;
        context += `- Tratar como treino longo intenso\n`;
        context += `- SEM taper, SEM redução de volume\n`;
        context += `- Substituir o longão da semana pela corrida\n`;
        context += `- Use para ganhar experiência e acumular km\n`;
      }
      context += `\n`;
    });

    if (raciaA) {
      context += `\n## ⚠️ REGRAS CRÍTICAS PARA O PLANO\n`;
      context += `\n1. **TODA a periodização** deve culminar na Corrida A (${raciaA.name})\n`;
      context += `2. **ÚLTIMA corrida longa** OBRIGATÓRIA 2 semanas antes da Corrida A\n`;
      context += `3. **TAPER de 2 semanas** é OBRIGATÓRIO para Corrida A (não opcional!)\n`;
      context += `4. **Volume MÁXIMO (pico)** deve ocorrer 3 semanas antes da Corrida A\n`;
      context += `5. **Manter INTENSIDADE** durante taper, reduzir apenas VOLUME\n`;
      context += `6. **DESCANSO TOTAL** 1-2 dias antes da Corrida A\n`;
      context += `7. **Semana da prova:** Máximo 30% do volume pico, corridas muito fáceis\n`;
      context += `8. Se houver Corridas B: incluir 4-8 semanas antes da A como simulados\n`;
      context += `9. Se houver Corridas C: incluir como treinos longos (sem taper)\n\n`;
    }
  }

  // Contexto de Execução Recente (SE DISPONÍVEL)
  if (profile.recentWorkoutCompletion) {
    context += `\n## 📊 Execução Recente do Plano\n`;
    context += `- Período analisado: ${profile.recentWorkoutCompletion.period}\n`;
    context += `- Taxa de conclusão: ${profile.recentWorkoutCompletion.percentage}% (${profile.recentWorkoutCompletion.completedCount}/${profile.recentWorkoutCompletion.totalCount} treinos)\n`;

    if (profile.recentWorkoutCompletion.percentage >= 90) {
      context += `- **Análise**: Atleta muito consistente! Está aderindo excelentemente ao plano.\n`;
    } else if (profile.recentWorkoutCompletion.percentage >= 70) {
      context += `- **Análise**: Boa aderência. Considere manter volume atual ou aumentar gradualmente.\n`;
    } else if (profile.recentWorkoutCompletion.percentage >= 50) {
      context += `- **Análise**: Aderência moderada. Pode indicar volume excessivo ou falta de tempo. Considere ajustar.\n`;
    } else {
      context += `- **Análise**: Baixa aderência. ATENÇÃO: Volume ou intensidade podem estar inadequados. Revise o plano!\n`;
    }
  }

  if (profile.athleteFeedback && profile.athleteFeedback.length > 0) {
    context += `\n## 💬 Relatos Recentes do Atleta\n`;
    profile.athleteFeedback.slice(0, 5).forEach(feedback => {
      const dateStr = new Date(feedback.date).toLocaleDateString('pt-BR');
      const typeEmoji = {
        'fatiga': '😫',
        'dor': '🤕',
        'motivacao': '💪',
        'desempenho': '📈',
        'outro': '💭'
      }[feedback.type] || '💭';
      context += `- ${typeEmoji} ${dateStr}: "${feedback.message}"\n`;
    });
    context += `**IMPORTANTE**: Considere esses relatos ao ajustar volume/intensidade!\n`;
  }

  if (profile.currentPhysicalState) {
    context += `\n## 🏃 Estado Físico Atual\n`;
    if (profile.currentPhysicalState.energyLevel) {
      context += `- Nível de energia: ${profile.currentPhysicalState.energyLevel}\n`;
    }
    if (profile.currentPhysicalState.soreness) {
      context += `- Dores musculares: ${profile.currentPhysicalState.soreness}\n`;
    }
    if (profile.currentPhysicalState.motivation) {
      context += `- Motivação: ${profile.currentPhysicalState.motivation}\n`;
    }
    if (profile.currentPhysicalState.sleepQuality) {
      context += `- Qualidade do sono: ${profile.currentPhysicalState.sleepQuality}\n`;
    }

    // Análise contextual
    const isOvertraining = 
      profile.currentPhysicalState.energyLevel === 'baixo' ||
      profile.currentPhysicalState.energyLevel === 'exausto' ||
      profile.currentPhysicalState.soreness === 'intensa';

    if (isOvertraining) {
      context += `\n⚠️ **ALERTA DE OVERTRAINING POTENCIAL**: Atleta mostra sinais de fadiga excessiva. Priorize recuperação!\n`;
    }
  }

  // v2.1.0 - Dados do Strava (Premium)
  if (profile.stravaData?.hasStravaData) {
    context += `\n## 📊 Dados Importados do Strava (Premium)\n`;
    
    // Estatísticas Recentes
    if (profile.stravaData.recentRunsTotals) {
      const stats = profile.stravaData.recentRunsTotals;
      const avgKmPerRun = stats.count > 0 ? (stats.distance / 1000 / stats.count).toFixed(1) : 0;
      const avgPaceMinKm = stats.count > 0 && stats.moving_time > 0 
        ? (stats.moving_time / 60) / (stats.distance / 1000) 
        : 0;
      const paceFormatted = avgPaceMinKm > 0 
        ? `${Math.floor(avgPaceMinKm)}:${String(Math.round((avgPaceMinKm % 1) * 60)).padStart(2, '0')}/km`
        : 'N/A';

      context += `\n### Últimas 4 Semanas (Dados Reais)\n`;
      context += `- Total de corridas: ${stats.count}\n`;
      context += `- Quilometragem total: ${(stats.distance / 1000).toFixed(1)}km\n`;
      context += `- Média por corrida: ${avgKmPerRun}km\n`;
      context += `- Pace médio: ${paceFormatted}\n`;
      context += `- Elevação acumulada: ${Math.round(stats.elevation_gain)}m\n`;
      context += `\n**IMPORTANTE**: Use esses dados REAIS para calibrar o volume e intensidade do plano!\n`;
    }

    // Records Pessoais
    if (profile.stravaData.personalRecords && profile.stravaData.personalRecords.length > 0) {
      context += `\n### Records Pessoais (PRs)\n`;
      profile.stravaData.personalRecords.forEach(pr => {
        const timeFormatted = pr.time >= 3600 
          ? `${Math.floor(pr.time / 3600)}:${String(Math.floor((pr.time % 3600) / 60)).padStart(2, '0')}:${String(pr.time % 60).padStart(2, '0')}`
          : `${Math.floor(pr.time / 60)}:${String(pr.time % 60).padStart(2, '0')}`;
        context += `- **${pr.type}**: ${timeFormatted} (pace: ${pr.pace}/km) - ${new Date(pr.date).toLocaleDateString('pt-BR')}\n`;
      });
      context += `\n**CALIBRAÇÃO**: Use os PRs para estimar VDOT real e definir paces de treino precisos!\n`;
    }

    // Zonas de Treino
    if (profile.stravaData.trainingZones) {
      context += `\n### Zonas de Frequência Cardíaca\n`;
      if (profile.stravaData.trainingZones.maxHeartRate) {
        context += `- FC Máxima: ${profile.stravaData.trainingZones.maxHeartRate} bpm\n`;
      }
      if (profile.stravaData.trainingZones.restingHeartRate) {
        context += `- FC Repouso: ${profile.stravaData.trainingZones.restingHeartRate} bpm\n`;
      }
      if (profile.stravaData.trainingZones.zones) {
        context += `- Zonas configuradas no Strava: Disponíveis\n`;
      }
      context += `\n**TREINOS DE FC**: Referencie essas zonas em treinos de intensidade controlada!\n`;
    }

    // Total Anual (contexto)
    if (profile.stravaData.ytdRunsTotals) {
      const ytd = profile.stravaData.ytdRunsTotals;
      context += `\n### Ano Atual (Contexto)\n`;
      context += `- Total de corridas: ${ytd.count}\n`;
      context += `- Quilometragem total: ${(ytd.distance / 1000).toFixed(1)}km\n`;
      context += `- Média mensal: ${((ytd.distance / 1000) / (new Date().getMonth() + 1)).toFixed(1)}km\n`;
    }

    // Equipamento Principal
    if (profile.stravaData.primaryGear) {
      const gear = profile.stravaData.primaryGear;
      const kmOnShoes = (gear.distance / 1000).toFixed(0);
      context += `\n### Equipamento (Tênis Principal)\n`;
      context += `- ${gear.name}`;
      if (gear.brand && gear.model) {
        context += ` (${gear.brand} ${gear.model})`;
      }
      context += `\n`;
      context += `- Quilometragem: ${kmOnShoes}km\n`;
      
      // Alertas sobre desgaste
      const km = parseInt(kmOnShoes);
      if (km > 800) {
        context += `⚠️ **ALERTA**: Tênis com mais de 800km! Risco de lesão aumentado.\n`;
        context += `**RECOMENDAÇÃO**: Inclua no plano a sugestão de trocar o tênis em breve.\n`;
      } else if (km > 600) {
        context += `⚠️ Tênis próximo do limite recomendado (600-800km)\n`;
        context += `**SUGESTÃO**: Monitorar e considerar troca nas próximas semanas.\n`;
      }
    }

    context += `\n---\n`;
    context += `🎯 **INSTRUÇÕES PARA USO DOS DADOS STRAVA**:\n`;
    context += `1. Use a quilometragem recente (últimas 4 semanas) como BASE REAL para o plano\n`;
    context += `2. Calibre paces de treino usando os PRs reais do atleta\n`;
    context += `3. Referencie FC máx/repouso em treinos de intensidade\n`;
    context += `4. Considere o padrão real de treino (volume, elevação) ao definir progressão\n`;
    context += `5. Se tênis estiver desgastado (>600km), inclua observação sobre troca de equipamento\n`;
    context += `5. NÃO crie plano genérico - personalize baseado nesses DADOS REAIS!\n`;
  }

  return context;
}

/**
 * Valida estratégia gerada pela IA com foco em corridas-alvo
 * Retorna {isValid, errors[], warnings[]}
 */
function validateStrategyWithRaces(
  strategy: any, 
  profile: AIUserProfile, 
  totalWeeks: number
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Verificar campos obrigatórios
  if (!strategy.phases || !Array.isArray(strategy.phases) || strategy.phases.length === 0) {
    errors.push('Estratégia sem fases definidas');
    return { isValid: false, errors, warnings };
  }
  
  // Verificar soma das semanas
  const totalPhaseWeeks = strategy.phases.reduce((sum: number, p: any) => sum + (p.weeks || 0), 0);
  if (Math.abs(totalPhaseWeeks - totalWeeks) > 1) {
    errors.push(`Soma das fases (${totalPhaseWeeks}) diferente do total (${totalWeeks})`);
  }
  
  // Se não há Corrida A, validação básica suficiente
  const raciaA = profile.raceGoals?.find(r => r.priority === 'A');
  if (!raciaA) {
    return { isValid: errors.length === 0, errors, warnings };
  }
  
  console.log('[VALIDAÇÃO] Validando estratégia para Corrida A...');
  
  // VALIDAÇÕES CRÍTICAS PARA CORRIDA A
  
  // 1. Última fase deve ser Taper
  const lastPhase = strategy.phases[strategy.phases.length - 1];
  const isTaperPhase = lastPhase.name.toLowerCase().includes('taper') || 
                       lastPhase.name.toLowerCase().includes('afinamento') ||
                       lastPhase.name.toLowerCase().includes('polimento') ||
                       lastPhase.name.toLowerCase().includes('ajuste');
  
  if (!isTaperPhase) {
    errors.push(`Última fase "${lastPhase.name}" NÃO é taper! Corrida A OBRIGATORIAMENTE precisa de taper.`);
  }
  
  // 2. Taper deve ter 2-3 semanas (mínimo 2 para Corrida A)
  if (isTaperPhase && lastPhase.weeks < 2) {
    errors.push(`Taper com apenas ${lastPhase.weeks} semana(s) - INSUFICIENTE! Mínimo 2 semanas para Corrida A.`);
  }
  
  // 3. Volume deve REDUZIR no taper (pelo menos 40%)
  if (isTaperPhase) {
    const volumeStart = lastPhase.weeklyKmStart || 0;
    const volumeEnd = lastPhase.weeklyKmEnd || 0;
    const reduction = volumeStart > 0 ? (volumeStart - volumeEnd) / volumeStart : 0;
    
    if (reduction < 0.4) {
      errors.push(`Redução de volume no taper ${(reduction * 100).toFixed(0)}% INSUFICIENTE! Mínimo 40% (ideal 60-70%).`);
    }
  }
  
  // 4. Deve haver fase de PICO antes do taper
  if (strategy.phases.length >= 3) {
    const peakPhase = strategy.phases[strategy.phases.length - 2];
    const isPeakPhase = peakPhase.name.toLowerCase().includes('pico') ||
                        peakPhase.name.toLowerCase().includes('peak') ||
                        peakPhase.name.toLowerCase().includes('intensificação') ||
                        peakPhase.weeklyKmEnd >= peakPhase.weeklyKmStart; // volume crescente ou mantido
    
    if (!isPeakPhase) {
      warnings.push(`Fase antes do taper ("${peakPhase.name}") deveria ser fase de PICO com volume máximo`);
    }
  }
  
  // 5. Volume deve crescer gradualmente (máx 20% por fase)
  for (let i = 1; i < strategy.phases.length - 1; i++) { // Não checar última fase (taper)
    const prevPhase = strategy.phases[i - 1];
    const currPhase = strategy.phases[i];
    
    const prevEnd = prevPhase.weeklyKmEnd || 0;
    const currStart = currPhase.weeklyKmStart || 0;
    
    if (prevEnd > 0 && currStart > prevEnd * 1.3) { // Salto > 30%
      warnings.push(`Salto de volume muito grande entre fases: ${prevEnd}km → ${currStart}km (+${(((currStart - prevEnd) / prevEnd) * 100).toFixed(0)}%)`);
    }
  }
  
  const isValid = errors.length === 0;
  
  if (isValid) {
    console.log('[VALIDAÇÃO] ✅ Estratégia VÁLIDA');
  } else {
    console.error('[VALIDAÇÃO] ❌ Estratégia INVÁLIDA:', errors);
  }
  
  if (warnings.length > 0) {
    console.warn('[VALIDAÇÃO] ⚠️ Avisos:', warnings);
  }
  
  return { isValid, errors, warnings };
}

/**
 * Tenta corrigir automaticamente uma estratégia inválida
 */
function autoCorrectStrategy(
  strategy: any,
  profile: AIUserProfile,
  totalWeeks: number,
  errors: string[]
): any {
  console.log('[AUTO-CORREÇÃO] Tentando corrigir estratégia...');
  
  const corrected = JSON.parse(JSON.stringify(strategy)); // Deep clone
  
  const raciaA = profile.raceGoals?.find(r => r.priority === 'A');
  if (!raciaA) return corrected;
  
  // CORREÇÃO 1: Garantir fase de Taper no final
  const lastPhase = corrected.phases[corrected.phases.length - 1];
  const isTaper = lastPhase.name.toLowerCase().includes('taper') ||
                  lastPhase.name.toLowerCase().includes('afinamento');
  
  if (!isTaper) {
    console.log('[AUTO-CORREÇÃO] Adicionando fase de Taper...');
    
    // Pegar volume da última fase
    const lastVolume = lastPhase.weeklyKmEnd || lastPhase.weeklyKmStart || 50;
    
    // Reduzir última fase em 1-2 semanas
    if (lastPhase.weeks > 2) {
      lastPhase.weeks -= 2;
      
      // Adicionar taper de 2 semanas
      corrected.phases.push({
        name: 'Taper (Afinamento)',
        weeks: 2,
        focus: 'Recuperação e preparação final para a prova',
        description: 'Redução progressiva de volume mantendo intensidade',
        weeklyKmStart: lastVolume,
        weeklyKmEnd: Math.round(lastVolume * 0.3),
        keyWorkouts: {
          easy: { frequency: 2, description: 'Corridas fáceis curtas para manutenção' },
          long: { distanceStart: Math.round(lastVolume * 0.3), distanceEnd: 0, description: 'Sem longão na semana da prova' },
          quality: { type: 'tempo', frequency: 1, description: 'Apenas manter pernas ativas' },
          strength: { frequency: 1, description: 'Musculação leve' }
        }
      });
    }
  }
  
  // CORREÇÃO 2: Ajustar duração do taper (mínimo 2 semanas)
  const taperPhase = corrected.phases[corrected.phases.length - 1];
  if (taperPhase.weeks < 2) {
    console.log(`[AUTO-CORREÇÃO] Ajustando taper de ${taperPhase.weeks} para 2 semanas...`);
    const diff = 2 - taperPhase.weeks;
    
    // Pegar semanas de outra fase
    if (corrected.phases.length > 1) {
      const prevPhase = corrected.phases[corrected.phases.length - 2];
      if (prevPhase.weeks > diff) {
        prevPhase.weeks -= diff;
        taperPhase.weeks = 2;
      }
    }
    
    // ✅ BUGFIX: Recalcular totalWeeks após ajuste
    corrected.totalWeeks = corrected.phases.reduce((sum: number, p: any) => sum + p.weeks, 0);
    console.log(`[AUTO-CORREÇÃO] totalWeeks recalculado: ${corrected.totalWeeks}`);
  }
  
  // CORREÇÃO 3: Garantir redução de volume no taper (60-70%)
  // Se volumeStart é 0 ou undefined, calcular baseado no perfil
  let volumeStart = taperPhase.weeklyKmStart;
  
  // Se não tem volume definido, estimar baseado nas fases anteriores ou perfil
  if (!volumeStart || volumeStart === 0) {
    // Tentar pegar da fase anterior
    if (corrected.phases.length > 1) {
      const prevPhase = corrected.phases[corrected.phases.length - 2];
      volumeStart = prevPhase.weeklyKmEnd || prevPhase.weeklyKmStart || profile.currentWeeklyKm || 30;
    } else {
      volumeStart = profile.currentWeeklyKm || 30;
    }
    
    console.log(`[AUTO-CORREÇÃO] Volume de taper não definido, usando ${volumeStart}km baseado no perfil`);
    taperPhase.weeklyKmStart = volumeStart;
  }
  
  const volumeEnd = taperPhase.weeklyKmEnd || 0;
  const reduction = volumeStart > 0 ? (volumeStart - volumeEnd) / volumeStart : 0;
  
  if (reduction < 0.4 || volumeEnd === 0) {
    console.log(`[AUTO-CORREÇÃO] Ajustando redução de volume no taper para 65%...`);
    taperPhase.weeklyKmEnd = Math.round(volumeStart * 0.35); // 65% de redução
    console.log(`[AUTO-CORREÇÃO] Taper ajustado: ${volumeStart}km → ${taperPhase.weeklyKmEnd}km (redução de 65%)`);
  }
  
  console.log('[AUTO-CORREÇÃO] Estratégia corrigida!');
  
  return corrected;
}

/**
 * Gera um plano de treinamento usando IA
 * A IA gera a estrutura e estratégia com exemplos, depois expandimos para todas as semanas
 */
export async function generateAIPlan(profile: AIUserProfile, maxRetries: number = 3, customStartDate?: Date): Promise<AIGeneratedPlan> { 
  // CRITICAL DEBUG: Log what races are in the profile
  console.log('[AI PLAN] 🚀 generateAIPlan INICIADO');
  console.log(`[AI PLAN] Corridas no perfil recebido: ${profile.raceGoals?.length || 0}`);
  if (profile.raceGoals && profile.raceGoals.length > 0) {
    console.log('[AI PLAN] Detalhes das corridas recebidas:');
    profile.raceGoals.forEach((race, idx) => {
      console.log(`[AI PLAN]   ${idx + 1}. ${race.priority}: "${race.name}" (${race.distance}) em ${race.date.toISOString().split('T')[0]}`);
    });
  } else {
    console.log('[AI PLAN] ⚠️⚠️⚠️ PROBLEMA: Nenhuma corrida no perfil! raceGoals está vazio ou undefined');
  }
  
  // v1.3.0: Usar novo context builder completo
  const userContext = buildComprehensiveContext(profile as any);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const raceDate = new Date(profile.targetRaceDate);
  raceDate.setHours(0, 0, 0, 0);
  
  // Usar Math.ceil para incluir a semana da corrida (mesmo que seja parcial)
  const weeksCalculated = Math.ceil((raceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7));
  
  // SEMPRE usar a data escolhida pelo atleta (é a data da corrida dele!)
  // Só validar se a data não é inválida (passado)
  let totalWeeks = weeksCalculated;
  let isShortNotice = false;
  
  if (totalWeeks < 1) {
    // Data no passado ou hoje - INVÁLIDA
    throw new Error('A data da corrida não pode estar no passado. Por favor, escolha uma data futura para sua corrida.');
  }
  
  // Verificar se o tempo é considerado curto para a distância
  const recommendedWeeksByDistance: Record<string, number> = {
    '5K': 8,
    '10K': 10,
    'Meia Maratona': 12,
    'Maratona': 16,
    'Ultramaratona': 20,
  };
  
  const recommendedWeeks = recommendedWeeksByDistance[profile.goalDistance] || 12;
  if (totalWeeks < recommendedWeeks) {
    isShortNotice = true;
    console.warn(`[AI PLAN] ⚠️ AVISO: ${totalWeeks} semanas é um tempo curto para ${profile.goalDistance}. Recomendado: ${recommendedWeeks} semanas.`);
    console.log(`[AI PLAN] Mas vamos gerar o plano mesmo assim respeitando a data escolhida pelo atleta!`);
  }
  
  console.log(`[AI PLAN] Gerando plano de ${totalWeeks} semanas até ${raceDate.toLocaleDateString('pt-BR')}${isShortNotice ? ' (tempo curto)' : ''}`)
  
  // v2.5.0: Use novo prompt integrado com todas as melhorias
  const systemPrompt = buildEnhancedSystemPrompt(profile);

  // User prompt: Tarefa específica
  const userPrompt = `Crie um plano de treino personalizado de ${totalWeeks} semanas para este atleta até a corrida em ${raceDate.toLocaleDateString('pt-BR')}.

Analise TODOS os aspectos do perfil fornecido e crie uma estratégia ÚNICA que faça sentido especificamente para esta pessoa.

Responda APENAS com o JSON válido seguindo a estrutura especificada no sistema.`;

  // Gerar estratégia com sistema de resiliência
  console.log('[AI PLAN] Gerando estratégia com sistema resiliente...');

  // Criar cache key baseado no perfil
  const cacheKey = `ai-plan-${profile.runningLevel}-${profile.goalDistance}-${totalWeeks}w-${profile.currentWeeklyKm}km`;

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
        cacheTTL: 3600000, // 1 hora de cache
        validateResponse: (response: string) => {
          try {
            const data = JSON.parse(response);
            console.log('[AI PLAN] Validando resposta:', { 
              totalWeeks: data.totalWeeks, 
              phasesCount: data.phases?.length,
              hasPaces: !!data.paces,
              hasEasyPace: !!data.paces?.easy,
              easyPaceValue: data.paces?.easy,
              taperWeeks: data.taperWeeks
            });

            // Validar apenas campos ESSENCIAIS
            // Paces podem ser null/undefined (geramos fallback depois)
            const hasRequiredFields =
              data.totalWeeks &&
              data.phases &&
              Array.isArray(data.phases) &&
              data.phases.length > 0;

            if (!hasRequiredFields) {
              console.error('[AI PLAN] Resposta inválida: campos ESSENCIAIS ausentes');
              console.error('[AI PLAN] Missing:', {
                totalWeeks: !data.totalWeeks,
                phases: !data.phases,
                isArray: !Array.isArray(data.phases),
                phasesLength: data.phases?.length
              });
              console.error('[AI PLAN] Data recebida:', JSON.stringify(data, null, 2).substring(0, 1000));
              return false;
            }

            // Log warnings para campos opcionais
            if (!data.paces || !data.paces.easy || data.paces.easy === null) {
              console.warn('[AI PLAN] ⚠️ Paces ausentes ou null, mas aceitando resposta (fallback será gerado)');
            }
            if (data.taperWeeks === undefined || data.taperWeeks === null) {
              console.warn('[AI PLAN] ⚠️ taperWeeks ausente ou null, mas aceitando resposta (default será usado)');
            }

            console.log('[AI PLAN] ✅ Validação passou (campos mínimos presentes)');
            return true;
          } catch (e) {
            console.error('[AI PLAN] Resposta inválida: JSON malformado:', e);
            console.error('[AI PLAN] Response raw:', response.substring(0, 500));
            return false;
          }
        },
        retryConfig: {
          maxRetries,
          baseDelay: 1000,
          maxDelay: 10000,
          backoffMultiplier: 2,
        },
        timeout: 120000, // 120 segundos timeout (aumentado para prompt grande)
      }
    );

    const strategy = JSON.parse(aiResponse);
    console.log('[AI PLAN] Estratégia gerada pela IA!');
    
    // 🔧 GARANTIR PACES PADRÃO se IA não retornou ou retornou null
    // IMPORTANTE: Fazer isso ANTES da validação para que correctedStrategy também tenha os paces
    if (!strategy.paces || !strategy.paces.easy || strategy.paces.easy === null) {
      console.warn('[AI PLAN] ⚠️ Paces ausentes/null na resposta da IA, gerando fallback baseado em VDOT');
      
      // Calcular paces básicos a partir do VDOT ou usar defaults seguros
      const vdot = strategy.vdot || profile.currentVDOT || 35;
      const calculatedPaces = calculatePaces(vdot);
      
      strategy.paces = {
        easy: calculatedPaces.easy,
        marathon: calculatedPaces.marathon,
        threshold: calculatedPaces.threshold,
        interval: calculatedPaces.interval,
        repetition: calculatedPaces.repetition
      };
      console.log('[AI PLAN] ✅ Paces fallback gerados:', strategy.paces);
    }
    
    // 🔧 GARANTIR taperWeeks padrão se ausente ou null
    if (strategy.taperWeeks === undefined || strategy.taperWeeks === null) {
      strategy.taperWeeks = Math.min(2, Math.floor(totalWeeks * 0.1));
      console.warn(`[AI PLAN] ⚠️ taperWeeks ausente/null, usando default: ${strategy.taperWeeks}`);
    }
    
    // ✅ VALIDAÇÃO AUTOMÁTICA DA ESTRATÉGIA
    const validation = validateStrategyWithRaces(strategy, profile, totalWeeks);
    if (!validation.isValid) {
      console.error('[AI PLAN] ❌ ESTRATÉGIA INVÁLIDA:', validation.errors);
      console.error('[AI PLAN] A IA gerou uma estratégia que não respeita as regras críticas!');
      
      // Tentar corrigir automaticamente
      console.log('[AI PLAN] Tentando corrigir automaticamente...');
      const correctedStrategy = autoCorrectStrategy(strategy, profile, totalWeeks, validation.errors);
      
      // Validar novamente
      const revalidation = validateStrategyWithRaces(correctedStrategy, profile, totalWeeks);
      if (revalidation.isValid) {
        console.log('[AI PLAN] ✅ Estratégia corrigida automaticamente!');
        // ✅ COPIAR TODOS os campos corrigidos
        strategy.phases = correctedStrategy.phases;
        strategy.totalWeeks = correctedStrategy.totalWeeks;
        strategy.taperWeeks = correctedStrategy.taperWeeks;
        // MANTER paces do strategy original (que já têm fallbacks)
        console.log(`[AI PLAN] ✅ Campos atualizados: totalWeeks=${strategy.totalWeeks}, taperWeeks=${strategy.taperWeeks}, phases=${strategy.phases.length}`);
      } else {
        console.error('[AI PLAN] ❌ Não foi possível corrigir automaticamente. Erros:', revalidation.errors);
        throw new Error('A estratégia gerada não atende aos requisitos mínimos de qualidade. Por favor, tente novamente.');
      }
    } else {
      console.log('[AI PLAN] ✅ Estratégia validada com sucesso!');
      validation.warnings.forEach(w => console.warn(`[AI PLAN] ⚠️ ${w}`));
    }
    
    console.log(`[AI PLAN] Expandindo estratégia para ${totalWeeks} semanas...`);

    // Expandir estratégia em plano completo (com customStartDate se fornecida)
    const fullPlan = expandStrategyToPlan(strategy, profile, totalWeeks, customStartDate);
    
    // Adicionar aviso se for tempo curto
    if (isShortNotice) {
      fullPlan.warnings = {
        isShortNotice: true,
        shortNoticeMessage: `⚠️ Aviso: ${totalWeeks} semanas é um tempo considerado curto para preparação de ${profile.goalDistance}. O recomendado seria ${recommendedWeeks} semanas. O plano foi otimizado para sua data, mas considere ajustar expectativas ou focar em completar a prova com segurança.`
      };
    }

    // v3.1.0 - Track AI field usage for transparency
    try {
      const trackableFields = mapProfileToTrackableFields(profile as any);
      // Note: We don't have planId here yet (plan not saved), so pass null
      // The tracking will be associated with userId only
      if ((profile as any).userId) {
        await trackFieldUsage((profile as any).userId, null, trackableFields);
        console.log('[AI TRACKING] ✅ Field usage tracked successfully');
      } else {
        console.warn('[AI TRACKING] ⚠️ No userId in profile, skipping field tracking');
      }
    } catch (trackError) {
      console.error('[AI TRACKING] ❌ Error tracking field usage:', trackError);
      // Don't fail plan generation if tracking fails
    }

    return fullPlan;
  } catch (error) {
    console.error('[AI PLAN] ❌ ERRO CRÍTICO ao gerar plano:', error);
    console.error('[AI PLAN] Stack trace:', error instanceof Error ? error.stack : 'No stack');
    console.error('[AI PLAN] Message:', error instanceof Error ? error.message : String(error));
    
    // Re-throw com contexto
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    throw new Error(`Falha ao gerar plano: ${errorMessage}`);
  }
}

/**
 * Expande uma estratégia gerada pela IA em um plano completo com todas as semanas
 */
function expandStrategyToPlan(strategy: any, profile: AIUserProfile, totalWeeks: number, customStartDate?: Date): AIGeneratedPlan { 
  console.log(`[AI PLAN] Expandindo estratégia para ${totalWeeks} semanas...`);
  console.log('[AI PLAN] DEBUG - strategy.paces recebido:', JSON.stringify(strategy.paces));
  
  // Usar data customizada se fornecida, caso contrário usar próxima segunda-feira
  let startDate: Date;
  
  if (customStartDate) {
    startDate = new Date(customStartDate);
    startDate.setHours(0, 0, 0, 0);
    console.log(`[AI PLAN] Usando data de início customizada: ${startDate.toISOString()}`);
  } else {
    startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    // Começar na PRÓXIMA segunda-feira (ou hoje se for segunda)
    const dayOfWeek = startDate.getDay();
    // Se é segunda (1), começar hoje
    // Se é terça-domingo (2-6, 0), ir para a PRÓXIMA segunda
    let daysToMonday;
    if (dayOfWeek === 1) {
      daysToMonday = 0; // Segunda -> começar hoje
    } else if (dayOfWeek === 0) {
      daysToMonday = 1; // Domingo -> próxima segunda
    } else {
      daysToMonday = 8 - dayOfWeek; // Terça-Sábado -> próxima segunda
    }

    startDate.setDate(startDate.getDate() + daysToMonday);
    console.log(`[AI PLAN] Data de início calculada (próxima segunda): ${startDate.toISOString()}`);
  }

  console.log(`[AI PLAN] Data de início final: ${startDate.toISOString()} (dia da semana: ${startDate.getDay()})`);
  
  // ✅ FIX v1.7.2: Garantir que semanas sempre comecem na Segunda-feira
  // Mesmo que o usuário escolha iniciar em outro dia (ex: Quarta),
  // as "semanas" do plano devem seguir a convenção Segunda→Domingo
  // Isso torna o calendário intuitivo e compatível com padrões universais
  
  /**
   * Calcula a segunda-feira da semana que contém a data fornecida
   * @param date Data qualquer
   * @returns Segunda-feira da semana dessa data
   */
  function getMondayOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay(); // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
    
    // Calcular dias até a segunda-feira
    // Se é Domingo (0): -6 dias para voltar à segunda
    // Se é Segunda (1): 0 dias (já é segunda)
    // Se é Terça (2): -1 dia para voltar à segunda
    // Se é Quarta (3): -2 dias para voltar à segunda
    // etc...
    const diff = day === 0 ? -6 : 1 - day;
    
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  
  const weeks: any[] = [];
  let weekNumber = 1;
  
  // ✅ Começar na segunda-feira da semana que contém o startDate
  // Exemplo: Se startDate = Quarta 12/Nov
  //   → getMondayOfWeek retorna Segunda 10/Nov
  //   → Semana 1: Segunda 10/Nov → Domingo 16/Nov
  //   → Treinos começam apenas em 12/Nov (Quarta)
  let currentWeekStart = getMondayOfWeek(startDate);
  
  console.log(`[AI PLAN] Primeira semana inicia em: ${currentWeekStart.toISOString()} (Segunda-feira)`);
  console.log(`[AI PLAN] Primeiro treino será em: ${startDate.toISOString()} (${['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][startDate.getDay()]})`);
  
  // Determinar dias disponíveis SEPARADOS POR TIPO DE ATIVIDADE
  const availability = getActivityAvailability(profile);
  
  console.log('[AI PLAN] Disponibilidade extraída:', { 
    runningDays: availability.runningDays,
    strengthDays: availability.strengthDays,
    swimmingDays: availability.swimmingDays,
    longRunDay: availability.longRunDay,
  });
  
  // Calcular total de semanas que a IA planejou
  const aiPlannedWeeks = strategy.phases.reduce((sum: number, p: any) => sum + (p.weeks || 0), 0);
  console.log(`[AI PLAN] IA planejou ${aiPlannedWeeks} semanas, precisamos de ${totalWeeks} semanas`);

  // Se IA planejou menos semanas que o necessário, vamos ajustar a última fase
  if (aiPlannedWeeks < totalWeeks) {
    const missingWeeks = totalWeeks - aiPlannedWeeks;
    console.log(`[AI PLAN] ⚠️ Ajustando última fase: adicionando ${missingWeeks} semanas extras`);
    const lastPhase = strategy.phases[strategy.phases.length - 1];
    lastPhase.weeks += missingWeeks;
  }

  // Processar cada fase
  for (const phase of strategy.phases) {
    console.log(`[AI PLAN] Processando fase: ${phase.name} (${phase.weeks} semanas)`);

    const phaseWeeks = Math.min(phase.weeks, totalWeeks - weekNumber + 1);
    const weeklyKmRange = phase.weeklyKmEnd - phase.weeklyKmStart;

    for (let phaseWeek = 0; phaseWeek < phaseWeeks; phaseWeek++) {
      const weekProgress = phaseWeek / phaseWeeks;

      // Calcular volume da semana com progressão
      let weeklyKm = phase.weeklyKmStart + (weeklyKmRange * weekProgress);

      // DETECTAR CORRIDAS A/B/C nesta semana (para passar contexto ao generateWeekWorkouts)
      const weekEnd = new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
      
      console.log(`[AI PLAN] Verificando corridas para semana ${weekNumber}:`, {
        weekStart: currentWeekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        totalRaceGoals: profile.raceGoals?.length || 0
      });
      
      const raceThisWeek = profile.raceGoals?.find(race => {
        const raceDate = new Date(race.date);
        // Normalizar ambas as datas para meia-noite UTC para comparação precisa
        const raceDateNorm = new Date(raceDate.getFullYear(), raceDate.getMonth(), raceDate.getDate());
        const weekStartNorm = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), currentWeekStart.getDate());
        const weekEndNorm = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate());
        
        const isInWeek = raceDateNorm >= weekStartNorm && raceDateNorm <= weekEndNorm;
        
        console.log(`[AI PLAN DEBUG] Checando corrida "${race.name}":`, {
          raceDate: raceDateNorm.toISOString().split('T')[0],
          weekStart: weekStartNorm.toISOString().split('T')[0],
          weekEnd: weekEndNorm.toISOString().split('T')[0],
          isInWeek,
          priority: race.priority
        });
        
        if (isInWeek) {
          console.log(`[AI PLAN DEBUG] ✅ Corrida "${race.name}" encontrada na semana ${weekNumber}!`);
        }
        
        return isInWeek;
      });

      if (raceThisWeek) {
        console.log(`[AI PLAN] ✅ Semana ${weekNumber}: Corrida ${raceThisWeek.priority} "${raceThisWeek.name}" (${raceThisWeek.distance}) detectada na semana - treinos serão ajustados`);
      }

      // Aplicar cutback weeks (cada 4ª semana) - MAS não se for semana de corrida
      // A IA já deve ter considerado corridas B/C no planejamento das fases
      const isCutbackWeek = !raceThisWeek && (weekNumber % 4 === 0);
      if (isCutbackWeek) {
        weeklyKm *= 0.75; // Reduzir 25%
      }

      // Calcular distância do longão (30% do volume semanal)
      const longRunKm = Math.min(weeklyKm * 0.3, 32); // Max 32km para evitar excesso

      // Gerar treinos da semana
      const workouts = generateWeekWorkouts({
        weekNumber,
        phase: phase.name,
        focus: phase.focus,
        weeklyKm,
        longRunKm,
        keyWorkouts: phase.keyWorkouts,
        paces: strategy.paces,
        availability,
        isCutbackWeek,
        currentWeekStart,
        planStartDate: startDate, // ✅ Passar data de início do plano para marcar dias anteriores
        raceThisWeek, // Passar corrida B/C se houver
      });

      const weekStartDate = new Date(currentWeekStart);
      const weekEndDate = new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

      const week = {
        weekNumber,
        startDate: weekStartDate,
        endDate: weekEndDate,
        phase: phase.name,
        focus: phase.focus,
        totalDistance: Math.round(weeklyKm * 10) / 10,
        workouts,
      };

      if (weekNumber <= 2) {
        console.log(`[AI PLAN] Semana ${weekNumber}: ${weekStartDate.toISOString()} (dia ${weekStartDate.getDay()}) até ${weekEndDate.toISOString()} (dia ${weekEndDate.getDay()})`);
        console.log(`[AI PLAN] Semana ${weekNumber} - Total de ${workouts.length} treinos. Primeiros 3:`,
          workouts.slice(0, 3).map(w => ({ date: w.date.toISOString().split('T')[0], dayOfWeek: w.dayOfWeek, type: w.type, title: w.title }))
        );
      }

      weeks.push(week);
      weekNumber++;
      currentWeekStart = new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

      if (weekNumber > totalWeeks) break;
    }

    if (weekNumber > totalWeeks) break;
  }

  console.log(`[AI PLAN] ✅ Geradas ${weeks.length} semanas (esperado: ${totalWeeks})`);
  
  const plan: AIGeneratedPlan = {
    totalWeeks,
    startDate,
    targetRaceDate: new Date(profile.targetRaceDate),
    phases: strategy.phases,
    weeks,
    paces: strategy.paces,
    vdot: strategy.vdot,
    planRationale: strategy.planRationale,
    keyConsiderations: strategy.keyConsiderations,
    progressionStrategy: strategy.progressionStrategy,
    nutritionAdvice: strategy.nutritionAdvice,
    injuryPreventionTips: strategy.injuryPreventionTips,
  };
  
  return plan;
}

/**
 * Extrai informações de disponibilidade do perfil, separadas por tipo de atividade
 * Suporta AMBAS estruturas: v1.7.3 (trainingSchedule) e v1.2.0 (trainingActivities)
 */
function getActivityAvailability(profile: AIUserProfile): {
  runningDays: number[];
  strengthDays: number[];
  swimmingDays: number[];
  otherActivityDays: Map<string, number[]>;
  preferredTimes: Map<string, string>;
  longRunDay: number;
} { 
  const runningDays: number[] = [];
  const strengthDays: number[] = [];
  const swimmingDays: number[] = [];
  const otherActivityDays = new Map<string, number[]>();
  const preferredTimes = new Map<string, string>();
  
  // PRIORIDADE 1: Nova estrutura (v1.7.3) - trainingSchedule
  if (profile.trainingSchedule) {
    console.log('[AVAILABILITY] Usando estrutura v1.7.3 (trainingSchedule)');
    
    const schedule = profile.trainingSchedule;
    const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    Object.keys(schedule).forEach(dayKey => {
      const dayNum = parseInt(dayKey);
      const dayData = schedule[dayNum];
      
      if (!dayData) return;
      
      // Corrida
      if (dayData.running) {
        runningDays.push(dayNum);
        console.log(`[AVAILABILITY] ✅ Corrida no dia ${dayNum} (${daysOfWeek[dayNum]})`);
      }
      
      // Outras atividades
      if (dayData.activities && Array.isArray(dayData.activities)) {
        dayData.activities.forEach(activity => {
          const activityLower = activity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          
          if (activityLower === 'musculacao' || activityLower === 'musculação') {
            strengthDays.push(dayNum);
            console.log(`[AVAILABILITY] ✅ Musculação no dia ${dayNum} (${daysOfWeek[dayNum]})`);
          } else if (activityLower === 'natacao' || activityLower === 'natação') {
            swimmingDays.push(dayNum);
            console.log(`[AVAILABILITY] ✅ Natação no dia ${dayNum} (${daysOfWeek[dayNum]})`);
          } else {
            // Outras atividades (Yoga, Ciclismo, Pilates, etc.)
            const activityKey = activity.toLowerCase().replace(/\s+/g, '_');
            if (!otherActivityDays.has(activityKey)) {
              otherActivityDays.set(activityKey, []);
            }
            otherActivityDays.get(activityKey)!.push(dayNum);
            console.log(`[AVAILABILITY] ✅ ${activity} no dia ${dayNum} (${daysOfWeek[dayNum]})`);
          }
        });
      }
    });
    
    // Esportes customizados
    if (profile.customActivities && Array.isArray(profile.customActivities)) {
      profile.customActivities.forEach(sport => {
        console.log(`[AVAILABILITY] ℹ️ Esporte adicional praticado: ${sport}`);
        // Esportes customizados já foram mapeados acima no trainingSchedule
      });
    }
  }
  // FALLBACK: Estrutura antiga (v1.2.0) - trainingActivities
  else if (profile.trainingActivities && profile.trainingActivities.length > 0) {
    console.log('[AVAILABILITY] Usando estrutura v1.2.0 (trainingActivities)');
    
    profile.trainingActivities.forEach((activity: any) => {
      if (!activity.availableDays || activity.availableDays.length === 0) return;
      
      const activityId = activity.id || activity.name?.toLowerCase();
      const days = activity.availableDays;
      const time = activity.preferredTime;
      
      // Mapear atividades para suas categorias
      if (activityId === 'running' || activityId === 'corrida') {
        runningDays.push(...days);
        if (time) preferredTimes.set('running', time);
      } else if (activityId === 'strength' || activityId === 'musculação' || activityId === 'musculacao') {
        strengthDays.push(...days);
        if (time) preferredTimes.set('strength', time);
      } else if (activityId === 'swimming' || activityId === 'natação' || activityId === 'natacao') {
        swimmingDays.push(...days);
        if (time) preferredTimes.set('swimming', time);
      } else {
        // Outras atividades (muay-thai, yoga, etc)
        otherActivityDays.set(activityId, days);
        if (time) preferredTimes.set(activityId, time);
      }
    });
  }
  
  // Remover duplicatas e ordenar
  const finalRunningDays = [...new Set(runningDays)].sort();
  const finalStrengthDays = [...new Set(strengthDays)].sort();
  const finalSwimmingDays = [...new Set(swimmingDays)].sort();
  
  // Validar que pelo menos corrida foi configurada
  if (finalRunningDays.length === 0) {
    console.warn('[AVAILABILITY] ⚠️ Nenhum dia de corrida configurado, usando fallback');
    finalRunningDays.push(0, 2, 4); // Dom, Ter, Qui
  }
  
  const longRunDay = profile.longRunDay !== null && profile.longRunDay !== undefined 
    ? profile.longRunDay 
    : (finalRunningDays.includes(0) ? 0 : finalRunningDays[finalRunningDays.length - 1]);
  
  console.log('[AVAILABILITY] Resumo final:', {
    runningDays: finalRunningDays,
    strengthDays: finalStrengthDays,
    swimmingDays: finalSwimmingDays,
    otherActivities: Array.from(otherActivityDays.entries()),
    longRunDay
  });
  
  return {
    runningDays: finalRunningDays,
    strengthDays: finalStrengthDays,
    swimmingDays: finalSwimmingDays,
    otherActivityDays,
    preferredTimes,
    longRunDay,
  };
}

/**
 * Gera sugestão inteligente e contextual para dia de descanso
 * Baseado em: fase do treino, semana de cutback, proximidade de corridas, atividades disponíveis
 * INCLUI exercícios específicos de fortalecimento e prevenção de lesões
 */
function generateRestDaySuggestion(context: {
  phase: string;
  isCutbackWeek: boolean;
  weekNumber: number;
  raceThisWeek?: any;
  hasStrength: boolean;
  hasSwimming: boolean;
  hasOtherActivities: boolean;
}): string {
  const { phase, isCutbackWeek, raceThisWeek, hasStrength, hasSwimming, hasOtherActivities } = context;

  // Exercícios de fortalecimento específicos para corredores
  const strengthExercises = [
    '🦵 Agachamento unilateral (3x10 cada perna) - fortalece quadríceps e glúteos',
    '🦶 Elevação de panturrilha (3x15) - previne canelite e fortalece sóleo',
    '💪 Prancha lateral (3x30s cada lado) - estabilidade de core e oblíquos',
    '🏋️ Ponte de glúteo com uma perna (3x12 cada) - ativa glúteo médio',
    '🤸 Afundo reverso (3x10 cada perna) - trabalho excêntrico de quadríceps',
    '🧘 Clamshell (3x15 cada lado) - ativa glúteo médio, previne IT band',
    '⚡ Single leg deadlift (3x8 cada perna) - equilíbrio e posterior de coxa',
  ];

  const mobilityExercises = [
    '🔄 Rotação de quadril 90/90 (2x10 cada lado) - mobilidade de quadril',
    '🦵 Alongamento de flexor de quadril (2x30s cada lado) - essencial para corredores',
    '🦶 Alfabeto com tornozelo (2x completo cada pé) - mobilidade e prevenção',
    '🌊 Cat-cow (2x10 repetições) - mobilidade de coluna e aquecimento',
    '🧘‍♂️ Downward dog to cobra (2x8 repetições) - cadeia posterior completa',
  ];

  const recoveryTools = [
    '🎾 Bola de tênis na sola do pé (5min cada pé) - prevenção de fascite plantar',
    '📦 Rolo de massagem em panturrilha e IT band (10-15min)',
    '❄️ Gelo em áreas inflamadas (15min) se houver desconforto',
    '🛁 Banho de contraste (3x quente/frio) - melhora circulação',
    '💤 Elevação de pernas 15min - reduz inchaço',
  ];

  // Base da descrição
  let description = '💤 Descanso - Dia de recuperação ';

  // Ajustar mensagem baseado na fase
  if (phase === 'base') {
    description += 'ativa. ';
    
    // Sugestões de fortalecimento progressivo
    const selectedExercises = strengthExercises.slice(0, 3);
    const selectedMobility = mobilityExercises.slice(0, 2);
    
    description += '\n\n💪 FORTALECIMENTO (20-30min):\n• ' + selectedExercises.join('\n• ');
    description += '\n\n🧘 MOBILIDADE:\n• ' + selectedMobility.join('\n• ');
    
    if (hasSwimming) {
      description += '\n\n🏊 OU: Natação leve (20-30min) - recuperação ativa sem impacto';
    }
    
    description += '\n\n💡 Nutrição: Proteína adequada (1.6-2g/kg) e hidratação (2-3L água).';
    
  } else if (phase === 'build') {
    description += 'importante. ';
    
    if (isCutbackWeek) {
      description += 'Semana de recuperação - seu corpo está se adaptando ao volume.';
      const selectedRecovery = recoveryTools.slice(0, 3);
      description += '\n\n🔥 RECUPERAÇÃO ATIVA:\n• ' + selectedRecovery.join('\n• ');
      description += '\n\n😴 Priorize: Sono extra (8-9h) e hidratação reforçada';
    } else {
      description += 'O volume está alto - recuperação + fortalecimento leve.';
      const selectedStrength = strengthExercises.slice(3, 5); // Diferentes exercícios
      const selectedRecovery = recoveryTools.slice(0, 2);
      
      description += '\n\n💪 FORTALECIMENTO LEVE (15min):\n• ' + selectedStrength.join('\n• ');
      description += '\n\n🛠️ FERRAMENTAS DE RECUPERAÇÃO:\n• ' + selectedRecovery.join('\n• ');
      
      if (hasStrength) {
        description += '\n\n🏋️ Dica: Aproveite para trabalhar mobilidade de quadril e tornozelo - áreas críticas para corredores.';
      }
    }
    
  } else if (phase === 'peak') {
    description += 'estratégica. ';
    
    if (raceThisWeek) {
      const daysToRace = Math.ceil((new Date(raceThisWeek.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (daysToRace <= 3) {
        description += `🏁 Corrida ${raceThisWeek.priority} em ${daysToRace} dias!`;
        description += '\n\n🎯 DESCANSO ABSOLUTO:';
        description += '\n• Evite ficar em pé por longos períodos';
        description += '\n• Hidratação constante + carboidratos adequados';
        description += '\n• Alongamento suave apenas (5-10min)';
        description += '\n• Visualização mental da prova';
        description += '\n• Prepare equipamento e estratégia';
        description += '\n• Durma 8h+ por noite';
      } else {
        description += 'Fase de pico - recuperação + manutenção.';
        const selectedMobility = mobilityExercises.slice(0, 2);
        description += '\n\n🧘 MOBILIDADE SUAVE (10-15min):\n• ' + selectedMobility.join('\n• ');
        description += '\n\n🧠 Mental: Respiração e meditação (10min) para controle de ansiedade pré-prova';
      }
    } else {
      description += 'Intensidade está alta - recuperação ativa.';
      const selectedRecovery = recoveryTools.slice(1, 4);
      description += '\n\n🛠️ RECUPERAÇÃO:\n• ' + selectedRecovery.join('\n• ');
      description += '\n\n💪 OPCIONAL: Core leve (prancha 3x30s + prancha lateral 2x30s)';
    }
    
  } else if (phase === 'taper') {
    description += 'essencial para chegar fresco na prova. ';
    description += '\n\n🏆 SEMANA DE TAPER:';
    description += '\n• Descanso é sua prioridade #1';
    description += '\n• Alongamento suave diário (10min)';
    description += '\n• Mantenha rotina de sono (8h+)';
    description += '\n• Hidratação e carboidratos adequados';
    description += '\n• Evite atividades desnecessárias';
    description += '\n• Relaxe e confie no treinamento';
    
    if (raceThisWeek) {
      description += '\n\n🎯 Você está preparado(a)! Chegou a hora de colher os frutos do seu treino.';
    }
  }

  // Sempre adicionar dicas de prevenção de lesões
  description += '\n\n🛡️ PREVENÇÃO DE LESÕES:';
  description += '\n• Identifique áreas de desconforto durante o descanso';
  description += '\n• Dor persistente >3 dias? Considere avaliar com profissional';
  description += '\n• Sinais de alerta: dor que piora, inchaço, rigidez matinal excessiva';
  description += '\n• Trabalhe pontos fracos ANTES que virem lesões';

  return description;
}

/**
 * Gera os treinos de uma semana baseado na estratégia E na disponibilidade SEPARADA POR TIPO
 * CRÍTICO: Respeita EXATAMENTE a disponibilidade configurada por CADA USUÁRIO
 */
function generateWeekWorkouts(params: { 
  weekNumber: number;
  phase: string;
  focus: string;
  weeklyKm: number;
  longRunKm: number;
  keyWorkouts: any;
  paces: any;
  availability: { 
    runningDays: number[];
    strengthDays: number[];
    swimmingDays: number[];
    otherActivityDays: Map<string, number[]>;
    preferredTimes: Map<string, string>;
    longRunDay: number;
  };
  isCutbackWeek: boolean;
  currentWeekStart: Date;
  planStartDate: Date; // ✅ v1.7.2: Data de início real do plano (primeiro treino)
  raceThisWeek?: { 
    id: number;
    name: string;
    distance: string;
    date: Date;
    targetTime?: string;
    priority: 'A' | 'B' | 'C';
  };
}): any[] { 
  const workouts: any[] = [];
  const { availability } = params;
  
  console.log(`[WORKOUT GEN] Semana ${params.weekNumber}:`, { 
    runningDays: availability.runningDays,
    strengthDays: availability.strengthDays,
    swimmingDays: availability.swimmingDays,
    otherActivityDays: Array.from(availability.otherActivityDays.entries()),
    longRunDay: availability.longRunDay,
  });

  console.log(`[WORKOUT GEN] DEBUG - strengthDaysToUse que serão usados:`, availability.strengthDays);
  console.log(`[WORKOUT GEN] DEBUG - Tem domingo (0) em strengthDays?`, availability.strengthDays.includes(0));
  console.log(`[WORKOUT GEN] 🔍 DEBUG - params.paces recebido:`, JSON.stringify(params.paces));
  
  // ✅ CRITICAL: Garantir que paces existe e tem os campos necessários
  if (!params.paces || !params.paces.easy) {
    console.error('[WORKOUT GEN] ❌ ERRO: paces undefined ou sem .easy!', params.paces);
    throw new Error('paces não foi passado corretamente para generateWeekWorkouts');
  }
  
  // Garantir que keyWorkouts existe com valores default
  const keyWorkouts = params.keyWorkouts || {
    easy: { frequency: 2 },
    quality: { type: 'tempo', frequency: 1, description: 'Treino de qualidade' },
    strength: { frequency: 2, description: 'Treino de força' }
  };
  
  // Calcular frequências desejadas
  const easyRunsCount = keyWorkouts.easy?.frequency || 2;
  const qualityFreq = keyWorkouts.quality?.frequency || 1;
  const strengthFreq = keyWorkouts.strength?.frequency || 2;
  
  // Calcular km para treinos fáceis (excluindo o longão)
  const totalEasyKm = Math.max(params.weeklyKm - params.longRunKm, 10);
  const easyRunKm = totalEasyKm / (easyRunsCount + qualityFreq);
  
  // Determinar dias de corrida disponíveis (excluindo o dia do longão)
  const runningDaysExcludingLongRun = availability.runningDays.filter(d => d !== availability.longRunDay);
  
  // Alocar treinos de qualidade nos primeiros dias disponíveis
  const qualityDays = runningDaysExcludingLongRun.slice(0, qualityFreq);
  
  // Alocar treinos fáceis nos dias restantes de corrida
  const easyDays = runningDaysExcludingLongRun.filter(d => !qualityDays.includes(d)).slice(0, easyRunsCount);
  
  // NOVA LÓGICA: Alocar musculação em TODOS os dias configurados pelo usuário
  // Sem filtros ou limitações artificiais - se o usuário configurou, usar!
  const strengthDaysToUse = [...availability.strengthDays];
  
  // Função auxiliar para formatar hora preferida
  const getPreferredTimeText = (activityType: string): string => { 
    const time = availability.preferredTimes.get(activityType);
    if (!time) return '';
    
    const timeMap: Record<string, string> = { 
      'early_morning': 'Manhã Cedo (5-7h)',
      'morning': 'Manhã (7-12h)',
      'afternoon': 'Tarde (12-18h)',
      'evening': 'Noite (18-21h)',
      'night': 'Noite (após 21h)',
      'flexible': '',
    };
    
    return timeMap[time] || '';
  };
  
  const runningTimeText = getPreferredTimeText('running');
  const strengthTimeText = getPreferredTimeText('strength');
  
  console.log(`[WORKOUT GEN] Alocação:`, { 
    longRunDay: availability.longRunDay,
    qualityDays,
    easyDays,
    strengthDays: strengthDaysToUse,
  });

  // NOVA ESTRUTURA: Múltiplas atividades por dia com horários específicos
  // Map<dayOfWeek, Array<{type: string, time: string, details?: any}>>
  const dayActivities = new Map<number, Array<{type: string, time: string, details?: any}>>();

  // Função auxiliar para adicionar atividade em um dia
  const addActivity = (day: number, type: string, details?: any) => { 
    if (!dayActivities.has(day)) {
      dayActivities.set(day, []);
    }

    const time = availability.preferredTimes.get(type) || 'flexible';
    dayActivities.get(day)!.push({ type, time, details });
  };

  // ALOCAR TODAS AS ATIVIDADES CONFIGURADAS (sem prioridades - respeitar disponibilidade do usuário)

  // 1. LONGÃO no dia configurado (OU CORRIDA A/B/C se houver nesta semana)
  if (params.raceThisWeek) {
    // Detectar dia da semana da corrida
    const raceDate = new Date(params.raceThisWeek.date);
    const raceDayOfWeek = raceDate.getDay();

    console.log(`[WORKOUT GEN] 🏁 CORRIDA ${params.raceThisWeek.priority} detectada!`);
    console.log(`[WORKOUT GEN]   Nome: "${params.raceThisWeek.name}"`);
    console.log(`[WORKOUT GEN]   Distância: ${params.raceThisWeek.distance}`);
    console.log(`[WORKOUT GEN]   Data: ${raceDate.toISOString()}`);
    console.log(`[WORKOUT GEN]   Dia da semana: ${raceDayOfWeek} (0=Dom, 1=Seg, ..., 6=Sáb)`);
    console.log(`[WORKOUT GEN]   ✅ Substituindo treino do dia ${raceDayOfWeek} pela corrida`);

    // Adicionar a corrida no dia correto
    addActivity(raceDayOfWeek, 'race', params.raceThisWeek);

    // Se a corrida for C e NÃO for no dia do longão, ainda adicionar um longão menor (50%)
    if (raceDayOfWeek !== availability.longRunDay && params.raceThisWeek.priority === 'C') {
      console.log(`[WORKOUT GEN]   Corrida C não é no dia do longão - adicionando longão no dia ${availability.longRunDay}`);
      addActivity(availability.longRunDay, 'long_run');
    }

    // Para corridas A e B: semana de taper - apenas descanso/regeneração nos outros dias
    // (não adicionar treinos de qualidade ou longões extras)
    if (params.raceThisWeek.priority === 'A' || params.raceThisWeek.priority === 'B') {
      console.log(`[WORKOUT GEN]   Corrida ${params.raceThisWeek.priority} = Semana de TAPER (sem treinos pesados)`);
    }
  } else {
    // Sem corrida esta semana - longão normal
    console.log(`[WORKOUT GEN] Sem corrida esta semana - adicionando longão no dia ${availability.longRunDay}`);
    addActivity(availability.longRunDay, 'long_run');
  }

  // 2. TREINOS DE QUALIDADE (apenas em dias de corrida e não em cutback weeks ou semanas de taper)
  const isTaperWeek = params.raceThisWeek && (params.raceThisWeek.priority === 'A' || params.raceThisWeek.priority === 'B');
  if (!params.isCutbackWeek && !isTaperWeek) {
    qualityDays.forEach(day => {
      addActivity(day, 'quality');
    });
  }

  // 3. TREINOS FÁCEIS (apenas em dias de corrida, e reduzidos em semanas de taper)
  if (!isTaperWeek) {
    easyDays.forEach(day => {
      addActivity(day, 'easy');
    });
  } else {
    // Semana de taper: apenas 1-2 treinos fáceis curtos para manter ritmo
    easyDays.slice(0, 1).forEach(day => {
      addActivity(day, 'easy');
    });
  }

  // 4. NATAÇÃO - adicionar em TODOS os dias configurados pelo usuário
  availability.swimmingDays.forEach(day => {
    addActivity(day, 'swimming');
  });

  // 5. MUSCULAÇÃO - adicionar em TODOS os dias configurados pelo usuário
  strengthDaysToUse.forEach(day => {
    addActivity(day, 'strength');
  });

  // 6. OUTRAS ATIVIDADES - adicionar em TODOS os dias configurados
  availability.otherActivityDays.forEach((days, activityId) => {
    days.forEach(day => {
      addActivity(day, activityId);
    });
  });

  // Ordenar atividades de cada dia por horário preferido
  const timeOrder = { 
    'early_morning': 1,
    'morning': 2,
    'afternoon': 3,
    'evening': 4,
    'night': 5,
    'flexible': 6,
  };

  dayActivities.forEach((activities, day) => {
    activities.sort((a, b) => { 
      return (timeOrder[a.time as keyof typeof timeOrder] || 6) - (timeOrder[b.time as keyof typeof timeOrder] || 6);
    });
  });

  console.log('[WORKOUT GEN] Mapa de atividades por dia (múltiplas permitidas):',
    Array.from(dayActivities.entries()).map(([day, acts]) => ({
      day,
      activities: acts.map(a => `${a.type} (${a.time})`)
    })))
  ;
  
  // NOVA LÓGICA: Gerar MÚLTIPLOS treinos por dia (respeitando horários configurados)
  // Iterar pelos 7 dias da semana: Segunda (1) até Domingo (0)
  // Ordem de exibição: Segunda, Terça, Quarta, Quinta, Sexta, Sábado, Domingo
  const daysOrder = [1, 2, 3, 4, 5, 6, 0]; // Segunda primeiro, Domingo por último

  // ✅ FIX: Obter dia da semana do início da semana para calcular offset correto
  // Isso garante que dayOfWeek sempre corresponda ao date.getDay()
  // Bug reportado por camilateste@teste.com (09/Nov/2025)
  const startDayOfWeek = params.currentWeekStart.getDay(); // 0=Dom, 1=Seg, ..., 6=Sáb

  for (let i = 0; i < 7; i++) { 
    const dayOfWeek = daysOrder[i]; // O dia da semana real (0=Dom, 1=Seg, etc)
    
    // ✅ FIX: Calcular offset REAL baseado no dia da semana, não na posição do array
    // Exemplo: Se startDate=Sábado(6) e queremos Domingo(0):
    //   offset = 0 - 6 = -6 → +7 = 1 → Sábado + 1 dia = Domingo ✅
    let daysOffset = dayOfWeek - startDayOfWeek;
    if (daysOffset < 0) {
      daysOffset += 7; // Wrap around para semana seguinte
    }

    const date = new Date(params.currentWeekStart);
    date.setDate(date.getDate() + daysOffset);
    date.setHours(12, 0, 0, 0); // Fixar meio-dia para evitar problemas de timezone

    console.log(`[DEBUG] i=${i}, dayOfWeek=${dayOfWeek}, startDay=${startDayOfWeek}, offset=${daysOffset}, date=${date.toISOString()}, date.getDay()=${date.getDay()}`);

    const activitiesForDay = dayActivities.get(dayOfWeek) || [];

    // ✅ v1.7.2: Se esta data é ANTES do início do plano, marcar como "Preparação"
    // Exemplo: Plano começa Quarta 12/Nov, mas semana começa Segunda 10/Nov
    //   → Segunda e Terça são "Preparação" (antes do início)
    //   → Quarta em diante são treinos normais
    if (date < params.planStartDate) {
      workouts.push({
        dayOfWeek: dayOfWeek,
        date,
        type: 'preparation',
        title: 'Preparação',
        description: 'Seu plano de treino começa em ' + 
          params.planStartDate.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          }) + 
          '. Use este tempo para se preparar: revise seu equipamento, planeje sua rotina e descanse bem.',
        distance: null,
        duration: null,
        targetPace: null,
      });
      continue; // Pular para próximo dia
    }

    // Se não há atividades configuradas para este dia, adicionar descanso com sugestão inteligente
    if (activitiesForDay.length === 0) {
      // Gerar sugestão contextual baseada na fase e proximidade de corridas
      const restDescription = generateRestDaySuggestion({
        phase: params.phase,
        isCutbackWeek: params.isCutbackWeek,
        weekNumber: params.weekNumber,
        raceThisWeek: params.raceThisWeek,
        hasStrength: params.availability.strengthDays.length > 0,
        hasSwimming: params.availability.swimmingDays.length > 0,
        hasOtherActivities: params.availability.otherActivityDays.size > 0,
      });

      workouts.push({
        dayOfWeek: dayOfWeek,
        date,
        type: 'rest',
        title: 'Descanso',
        description: restDescription,
        distance: null,
        duration: null,
        targetPace: null,
      });
      continue;
    }

    // Gerar um treino para cada atividade configurada neste dia
    activitiesForDay.forEach(activity => { 
      const activityType = activity.type;
      const activityTime = activity.time;

      // Formatar horário preferido
      const timeMap: Record<string, string> = { 
        'early_morning': 'Manhã Cedo (5-7h)',
        'morning': 'Manhã (7-12h)',
        'afternoon': 'Tarde (12-18h)',
        'evening': 'Noite (18-21h)',
        'night': 'Noite (após 21h)',
        'flexible': '',
      };
      const timeInfo = timeMap[activityTime] || '';
      const timeInfoShort = timeInfo ? ` • ${timeInfo}` : '';

      let workout: any = null;

      if (activityType === 'long_run') {
        const longKm = Math.round(params.longRunKm * 10) / 10; // Arredondar 1 casa decimal
        workout = {
          dayOfWeek: dayOfWeek,
          date,
          type: 'running',
          subtype: 'long',
          title: `Longão - ${longKm}km${timeInfoShort}`,
          description: `Treino longo de ${longKm}km em ritmo confortável. O mais importante da semana - constrói resistência aeróbica e mental.${timeInfo ? ` Horário preferido: ${timeInfo}.` : ''}`,
          distance: longKm,
          duration: null,
          targetPace: params.paces.easy,
          warmup: null,
          mainSet: `${longKm}km em ritmo fácil (${params.paces.easy})`,
          cooldown: null,
        };
      }
      else if (activityType === 'quality') {
        const qualityType = keyWorkouts.quality?.type || 'tempo';

        if (qualityType === 'tempo') {
          const tempoKm = Math.round(easyRunKm * 10) / 10;
          workout = {
            dayOfWeek: dayOfWeek,
            date,
            type: 'running',
            subtype: 'tempo',
            title: `Treino de Ritmo - ${tempoKm}km${timeInfoShort}`,
            description: params.keyWorkouts?.quality?.description || `Treino de ${tempoKm}km em ritmo controlado e sustentado (threshold). Aquecimento 10min + parte principal 20-30min + desaquecimento 10min.${timeInfo ? ` Horário preferido: ${timeInfo}.` : ''}`,
            distance: tempoKm,
            duration: null,
            targetPace: params.paces.threshold,
            warmup: '10 min fácil',
            mainSet: `20-30 min em ritmo threshold (${params.paces.threshold})`,
            cooldown: '10 min fácil',
          };
        } else if (qualityType === 'intervals') {
          const intervalKm = Math.round(easyRunKm * 10) / 10;
          workout = {
            dayOfWeek: dayOfWeek,
            date,
            type: 'running',
            subtype: 'intervals',
            title: `Treino Intervalado - ${intervalKm}km${timeInfoShort}`,
            description: params.keyWorkouts?.quality?.description || `Treino de velocidade de ${intervalKm}km total. Aquecimento 15min + 6-8 tiros de 800m em ritmo forte + desaquecimento 10min.${timeInfo ? ` Horário preferido: ${timeInfo}.` : ''}`,
            distance: intervalKm,
            duration: null,
            targetPace: params.paces.interval,
            warmup: '15 min fácil',
            mainSet: `6-8 x 800m em ${params.paces.interval} (recuperação 2 min)`,
            cooldown: '10 min fácil',
          };
        } else { 
          // Fartlek ou treino fácil
          const easyKm = Math.round(easyRunKm * 10) / 10;
          workout = {
            dayOfWeek: dayOfWeek,
            date,
            type: 'running',
            subtype: 'easy',
            title: `Treino Fácil - ${easyKm}km${timeInfoShort}`,
            description: `Corrida leve de ${easyKm}km em ritmo confortável para construir base aeróbica e recuperação ativa.${timeInfo ? ` Horário preferido: ${timeInfo}.` : ''}`,
            distance: easyKm,
            duration: null,
            targetPace: params.paces.easy,
          };
        }
      }
      else if (activityType === 'easy') {
        const easyKm = Math.round(easyRunKm * 10) / 10;
        workout = {
          dayOfWeek: dayOfWeek,
          date,
          type: 'running',
          subtype: 'easy',
          title: `Treino Fácil - ${easyKm}km${timeInfoShort}`,
          description: `Corrida leve de ${easyKm}km em ritmo confortável. Foque em manter o ritmo fácil e respiração controlada.${timeInfo ? ` Horário preferido: ${timeInfo}.` : ''}`,
          distance: easyKm,
          duration: null,
          targetPace: params.paces.easy,
        };
      }
      else if (activityType === 'race') {
        // Corrida A, B ou C cadastrada
        const raceInfo = activity.details;
        const isRaceA = raceInfo.priority === 'A';
        const isRaceB = raceInfo.priority === 'B';
        const isRaceC = raceInfo.priority === 'C';

        console.log(`[WORKOUT GEN] 🏁 Criando workout de CORRIDA para dia ${dayOfWeek}:`, {
          name: raceInfo.name,
          distance: raceInfo.distance,
          priority: raceInfo.priority,
          date: date.toISOString()
        });

        let raceDescription = '';
        if (isRaceA) {
          raceDescription = `🏁 CORRIDA A (OBJETIVO PRINCIPAL) - Esta é a corrida para a qual você treinou! Confie no seu treinamento, siga sua estratégia de ritmo, hidrate-se adequadamente e aproveite cada quilômetro. Você está preparado(a)! Descanse bem nos dias anteriores, alimente-se adequadamente e chegue à largada com confiança. BOA PROVA! 🎯`;
        } else if (isRaceB) {
          raceDescription = `🏁 CORRIDA B (Preparatória) - Use como teste de ritmo e simulado para sua corrida principal. Aquecimento de 15-20 min fácil, corra no ritmo planejado, e desacelere nos últimos 2-3km se necessário. Objetivo: testar estratégia de prova sem comprometer o treinamento.`;
        } else if (isRaceC) {
          raceDescription = `🏁 CORRIDA C (Volume) - Use como treino longo intenso. Sem taper, esta corrida faz parte do volume semanal normal. Corra no ritmo confortável, aproveite a experiência e o ambiente de prova. Não force - o objetivo é acumular km.`;
        }

        workout = {
          dayOfWeek: dayOfWeek,
          date,
          type: 'race',
          subtype: raceInfo.priority.toLowerCase(),
          title: `🏁 ${raceInfo.name} - ${raceInfo.distance}${timeInfoShort}`,
          description: raceDescription,
          distance: null, // Distância vem da corrida cadastrada
          duration: null,
          targetPace: raceInfo.targetTime || null,
          raceInfo: {
            name: raceInfo.name,
            distance: raceInfo.distance,
            targetTime: raceInfo.targetTime,
            priority: raceInfo.priority
          }
        };
        
        console.log(`[WORKOUT GEN] ✅ Workout de corrida criado:`, {
          type: workout.type,
          title: workout.title,
          priority: workout.subtype
        });
      }
      else if (activityType === 'swimming') {
        workout = {
          dayOfWeek: dayOfWeek,
          date,
          type: 'swimming',
          title: `Natação${timeInfoShort}`,
          description: `Treino de natação para recuperação ativa e trabalho cardiovascular complementar. Excelente para dar descanso às articulações.${timeInfo ? ` Horário preferido: ${timeInfo}.` : ''}`,
          distance: null,
          duration: 45,
          targetPace: null,
        };
      }
      else if (activityType === 'strength') {
        workout = {
          dayOfWeek: dayOfWeek,
          date,
          type: 'strength',
          title: `Musculação${timeInfoShort}`,
          description: params.keyWorkouts.strength.description || `Treino de força para corrida. Foque em membros inferiores e core.${timeInfo ? ` Horário preferido: ${timeInfo}.` : ''}`,
          distance: null,
          duration: 45,
          targetPace: null,
        };
      }
      else { 
        // Outras atividades (yoga, muay-thai, etc)
        let activityName = activityType;
        if (activityType.includes('swim')) activityName = 'Natação';
        else if (activityType.includes('muay') || activityType.includes('thai')) activityName = 'Muay-Thai';
        else if (activityType.includes('yoga')) activityName = 'Yoga';
        else if (activityType.includes('bike') || activityType.includes('cycling')) activityName = 'Ciclismo';

        workout = {
          dayOfWeek: dayOfWeek,
          date,
          type: 'cross-training',
          subtype: activityType,
          title: `${activityName}${timeInfoShort}`,
          description: `Treino complementar de ${activityName.toLowerCase()}.${timeInfo ? ` Horário preferido: ${timeInfo}.` : ''} Aproveite para trabalhar outros grupos musculares e dar uma pausa da corrida.`,
          distance: null,
          duration: 45,
          targetPace: null,
        };
      }

      if (workout) {
        // 🆕 v2.0.0: Enhance running workouts with detailed structure
        if (workout.type === 'running') {
          console.log(`[WORKOUT ENHANCE] Enriquecendo treino: ${workout.title} (${workout.subtype || workout.type})`);
          const enhanced = enhanceWorkout(workout, params.paces);
          console.log(`[WORKOUT ENHANCE] ✅ Enriquecido: warmUp=${!!enhanced.warmUpStructure}, objective=${!!enhanced.objective}, tips=${!!enhanced.tips}`);
          workout = enhanced;
        }
        workouts.push(workout);
      }
    });
  }
  
  // Log de resumo
  const summary = { 
    running: workouts.filter(w => w.type === 'running').length,
    swimming: workouts.filter(w => w.type === 'swimming').length,
    strength: workouts.filter(w => w.type === 'strength').length,
    crossTraining: workouts.filter(w => w.type === 'cross-training').length,
    rest: workouts.filter(w => w.type === 'rest').length,
    race: workouts.filter(w => w.type === 'race').length,
  };

  console.log(`[WORKOUT GEN] Semana ${params.weekNumber}: Resumo - Running: ${summary.running}, Swimming: ${summary.swimming}, Strength: ${summary.strength}, Cross: ${summary.crossTraining}, Rest: ${summary.rest}, RACE: ${summary.race}`);
  
  // Log específico para corridas
  if (summary.race > 0) {
    const raceWorkouts = workouts.filter(w => w.type === 'race');
    console.log(`[WORKOUT GEN] ✅ CORRIDA(S) ENCONTRADA(S) NA SEMANA ${params.weekNumber}:`);
    raceWorkouts.forEach(race => {
      console.log(`[WORKOUT GEN]   🏁 ${race.title} - Dia ${race.dayOfWeek} (${race.date.toISOString().split('T')[0]})`);
    });
  }

  // Ordenar workouts por data para garantir ordem Segunda → Domingo
  workouts.sort((a, b) => a.date.getTime() - b.date.getTime());

  console.log(`[WORKOUT GEN] DEBUG - Primeiro treino:`, { 
    dayOfWeek: workouts[0]?.dayOfWeek,
    date: workouts[0]?.date,
    type: workouts[0]?.type,
    title: workouts[0]?.title
  });

  return workouts;
}

/**
 * Valida se o plano gerado pela IA está completo e correto
 */
export function validateAIPlan(plan: AIGeneratedPlan): { valid: boolean; errors: string[] } { 
  const errors: string[] = [];
  
  if (!plan.totalWeeks || plan.totalWeeks < 1) {
    errors.push('Total de semanas inválido');
  }
  
  if (!plan.weeks || plan.weeks.length !== plan.totalWeeks) {
    errors.push(`Número de semanas inconsistente: esperado ${plan.totalWeeks}, recebido ${plan.weeks?.length || 0}`);
  }
  
  // VDOT: permitir null para iniciantes absolutos (v3.0.0)
  if (plan.vdot && (plan.vdot < 20 || plan.vdot > 85)) {
    errors.push('VDOT fora do intervalo esperado (20-85)');
  }
  
  // Paces: exigir apenas easy pace (pode ser descritivo para iniciantes)
  if (!plan.paces || !plan.paces.easy) {
    errors.push('Pace mínimo (easy) ausente');
  }
  
  plan.weeks?.forEach((week, index) => { 
    if (!week.workouts || week.workouts.length === 0) {
      errors.push(`Semana ${index + 1} não tem treinos`);
      return;
    }

    // Validar que há treino para cada dia da semana (0-6)
    // Com múltiplas atividades por dia, pode haver mais de 7 treinos total
    const daysWithWorkouts = new Set(week.workouts.map((w: any) => w.dayOfWeek));
    if (daysWithWorkouts.size !== 7) {
      const missingDays = [];
      for (let day = 0; day < 7; day++) { 
        if (!daysWithWorkouts.has(day)) {
          const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
          missingDays.push(dayNames[day]);
        }
      }
      errors.push(`Semana ${index + 1} não tem treinos para: ${missingDays.join(', ')}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}