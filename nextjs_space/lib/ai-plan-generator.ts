
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
  
  // Disponibilidade e preferências
  trainingActivities?: any[];
  longRunDay?: number;
  
  // Paces usuais (dados reais)
  usualPaces?: Record<string, string>;
  
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
  
  // Equipamentos disponíveis
  hasGymAccess?: boolean;
  hasPoolAccess?: boolean;
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
}

/**
 * Prepara o contexto completo do usuário para a IA
 */
function prepareUserContext(profile: AIUserProfile): string {
  const today = new Date();
  const raceDate = new Date(profile.targetRaceDate);
  const weeksUntilRace = Math.floor((raceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7));
  
  let context = `# PERFIL DO ATLETA\n\n`;
  
  // Dados básicos
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
  
  // Paces usuais (dados reais!)
  if (profile.usualPaces && Object.keys(profile.usualPaces).length > 0) {
    context += `\n## Paces Usuais (Dados Reais de Corridas)\n`;
    Object.entries(profile.usualPaces).forEach(([distance, pace]) => {
      if (pace && pace !== '') {
        context += `- ${distance}: ${pace}\n`;
      }
    });
  }
  
  // Disponibilidade
  if (profile.trainingActivities && profile.trainingActivities.length > 0) {
    context += `\n## Disponibilidade e Preferências de Treino\n`;
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
  
  return context;
}

/**
 * Gera um plano de treinamento usando IA
 * A IA gera a estrutura e estratégia com exemplos, depois expandimos para todas as semanas
 */
export async function generateAIPlan(profile: AIUserProfile, maxRetries: number = 3): Promise<AIGeneratedPlan> {
  const userContext = prepareUserContext(profile);
  
  const today = new Date();
  const raceDate = new Date(profile.targetRaceDate);
  const totalWeeks = Math.floor((raceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7));
  
  console.log(`[AI PLAN] Total de semanas calculado: ${totalWeeks}`);
  
  const systemPrompt = `Você é um treinador de corrida expert com profundo conhecimento em:
- Fisiologia do exercício
- Periodização de treinamento
- Sistema VDOT de Jack Daniels
- Prevenção de lesões
- Nutrição esportiva
- Princípios científicos do treinamento (10% rule, cutback weeks, progressive overload)

Sua missão é criar ESTRATÉGIAS de treinamento PERSONALIZADAS e CIENTÍFICAS baseadas no perfil completo do atleta.

PRINCÍPIOS FUNDAMENTAIS:
1. SEGURANÇA PRIMEIRO: Progressão gradual, respeitar limitações, prevenir lesões
2. PERSONALIZAÇÃO: Cada atleta é único - considere TODOS os aspectos do perfil
3. CIÊNCIA: Baseie-se em evidências científicas reconhecidas
4. PRATICIDADE: Respeite a disponibilidade real do atleta
5. MOTIVAÇÃO: Crie um plano desafiador mas alcançável

REGRAS CIENTÍFICAS ESSENCIAIS:
- Regra dos 10%: Aumentar volume no máximo 10% por semana
- Cutback weeks: A cada 3-4 semanas, reduzir 20% do volume para recuperação
- Long runs: Não exceder 30-35% do volume semanal
- Easy runs: 70-80% dos treinos devem ser em ritmo fácil
- Polarização: Evitar "junk miles" - ou é fácil ou é intenso
- Recovery: Dar tempo adequado entre treinos intensos (48-72h)
- Periodização: Base → Construção → Pico → Polimento

IMPORTANTE SOBRE INICIANTES:
- Se o atleta corre <10km/semana: começar com walk/run
- Adaptação neuromuscular vem antes de velocidade
- Primeiras 4-6 semanas focadas em consistência
- Não adicionar intensidade antes de ter base aeróbica sólida`;

  const userPrompt = `${userContext}

# TAREFA

Crie uma ESTRATÉGIA de treinamento COMPLETA e PERSONALIZADA para este atleta.

O plano tem ${totalWeeks} semanas até a prova.

Você deve definir:
1. As FASES do treinamento (quantas semanas cada uma)
2. A ESTRATÉGIA de progressão (como o volume e intensidade evoluem)
3. EXEMPLOS REPRESENTATIVOS de treinos para cada fase
4. PACES personalizados baseados no VDOT
5. CONSELHOS específicos baseados no perfil

FORMATO DA RESPOSTA (JSON):
{
  "totalWeeks": ${totalWeeks},
  "vdot": <número calculado baseado nos paces usuais ou estimativa>,
  "paces": {
    "easy": "X:XX min/km",
    "marathon": "X:XX min/km",
    "threshold": "X:XX min/km",
    "interval": "X:XX min/km",
    "repetition": "X:XX min/km"
  },
  "planRationale": "Explicação detalhada da estratégia e por que foi estruturada assim",
  "keyConsiderations": ["consideração 1", "consideração 2", ...],
  "progressionStrategy": "Como o plano progride do início ao fim",
  "nutritionAdvice": "Conselhos nutricionais para este objetivo",
  "injuryPreventionTips": ["dica 1", "dica 2", ...],
  "phases": [
    {
      "name": "Nome da Fase (ex: Base Aeróbica)",
      "weeks": <número de semanas>,
      "focus": "Foco principal da fase",
      "description": "Descrição do que acontece nesta fase",
      "weeklyKmStart": <km no início da fase>,
      "weeklyKmEnd": <km no fim da fase>,
      "keyWorkouts": {
        "easy": {
          "frequency": <quantos por semana>,
          "description": "Como fazer"
        },
        "long": {
          "distanceStart": <km no início>,
          "distanceEnd": <km no fim>,
          "description": "Como fazer"
        },
        "quality": {
          "type": "tempo|intervals|fartlek|none",
          "frequency": <quantos por semana, 0 se none>,
          "description": "Como fazer"
        },
        "strength": {
          "frequency": <quantos por semana>,
          "description": "Como fazer"
        }
      }
    }
  ],
  "weeklyPattern": {
    "description": "Padrão típico de distribuição semanal",
    "restDays": [<dias da semana para descanso, 0=dom, 6=sáb>],
    "longRunDay": <dia do longão>,
    "qualityDays": [<dias para treinos de qualidade>],
    "strengthDays": [<dias para musculação>]
  }
}

IMPORTANTE:
- Seja ESPECÍFICO nas descrições
- Use linguagem MOTIVADORA e EDUCATIVA
- Respeite os dias disponíveis do atleta
- Para iniciantes (<10km/semana), comece MUITO gradual
- Limite strength training a 2-3x por semana
- Defina cutback weeks (semanas de recuperação) a cada 3-4 semanas

Responda APENAS com o JSON válido, sem formatação markdown ou explicações adicionais.`;

  // Tentar gerar estratégia com retries
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[AI PLAN] Tentativa ${attempt} de ${maxRetries}...`);
      
      const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.5,
          max_tokens: 8000, // Estratégia precisa de menos tokens que plano completo
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText}\n${errorText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      try {
        const strategy = JSON.parse(aiResponse);
        
        console.log(`[AI PLAN] Estratégia parseada com sucesso na tentativa ${attempt}!`);
        console.log(`[AI PLAN] Expandindo estratégia para ${totalWeeks} semanas...`);
        
        // Expandir estratégia em plano completo
        const fullPlan = expandStrategyToPlan(strategy, profile, totalWeeks);
        
        return fullPlan;
      } catch (parseError) {
        console.error(`[AI PLAN] Erro ao parsear JSON na tentativa ${attempt}:`, parseError);
        console.error(`[AI PLAN] JSON bruto (primeiros 1000 chars):`, aiResponse.substring(0, 1000));
        console.error(`[AI PLAN] JSON bruto (últimos 1000 chars):`, aiResponse.substring(Math.max(0, aiResponse.length - 1000)));
        
        if (attempt === maxRetries) {
          throw parseError;
        }
        // Tentar novamente
        continue;
      }
    } catch (error) {
      console.error(`[AI PLAN] Erro na tentativa ${attempt}:`, error);
      if (attempt === maxRetries) {
        throw new Error('Falha ao gerar plano com IA após múltiplas tentativas. Por favor, tente novamente mais tarde.');
      }
      // Aguardar um pouco antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw new Error('Falha ao gerar plano com IA. Por favor, tente novamente.');
}

/**
 * Expande uma estratégia gerada pela IA em um plano completo com todas as semanas
 */
function expandStrategyToPlan(strategy: any, profile: AIUserProfile, totalWeeks: number): AIGeneratedPlan {
  console.log(`[AI PLAN] Expandindo estratégia para ${totalWeeks} semanas...`);
  
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  
  // Começar na próxima segunda-feira
  const dayOfWeek = startDate.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;
  if (daysUntilMonday > 0) {
    startDate.setDate(startDate.getDate() + daysUntilMonday);
  }
  
  const weeks: any[] = [];
  let weekNumber = 1;
  let currentWeekStart = new Date(startDate);
  
  // Determinar dias disponíveis SEPARADOS POR TIPO DE ATIVIDADE
  const availability = getActivityAvailability(profile);
  
  console.log('[AI PLAN] Disponibilidade extraída:', {
    runningDays: availability.runningDays,
    strengthDays: availability.strengthDays,
    swimmingDays: availability.swimmingDays,
    longRunDay: availability.longRunDay,
  });
  
  // Processar cada fase
  for (const phase of strategy.phases) {
    console.log(`[AI PLAN] Processando fase: ${phase.name} (${phase.weeks} semanas)`);
    
    const phaseWeeks = Math.min(phase.weeks, totalWeeks - weekNumber + 1);
    const weeklyKmRange = phase.weeklyKmEnd - phase.weeklyKmStart;
    
    for (let phaseWeek = 0; phaseWeek < phaseWeeks; phaseWeek++) {
      const weekProgress = phaseWeek / phaseWeeks;
      
      // Calcular volume da semana com progressão
      let weeklyKm = phase.weeklyKmStart + (weeklyKmRange * weekProgress);
      
      // Aplicar cutback weeks (cada 4ª semana)
      const isCutbackWeek = weekNumber % 4 === 0;
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
      });
      
      const week = {
        weekNumber,
        startDate: new Date(currentWeekStart),
        endDate: new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
        phase: phase.name,
        focus: phase.focus,
        totalDistance: Math.round(weeklyKm * 10) / 10,
        workouts,
      };
      
      weeks.push(week);
      weekNumber++;
      currentWeekStart = new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      if (weekNumber > totalWeeks) break;
    }
    
    if (weekNumber > totalWeeks) break;
  }
  
  return {
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
}

/**
 * Extrai informações de disponibilidade do perfil, separadas por tipo de atividade
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
  
  if (profile.trainingActivities && profile.trainingActivities.length > 0) {
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
  
  // Fallbacks caso não haja configuração
  const finalRunningDays = runningDays.length > 0 ? [...new Set(runningDays)].sort() : [0, 2, 4]; // Dom, Ter, Qui
  const finalStrengthDays = strengthDays.length > 0 ? [...new Set(strengthDays)].sort() : [1, 3, 5]; // Seg, Qua, Sex
  const finalSwimmingDays = swimmingDays.length > 0 ? [...new Set(swimmingDays)].sort() : [];
  
  const longRunDay = profile.longRunDay !== null && profile.longRunDay !== undefined 
    ? profile.longRunDay 
    : (finalRunningDays.includes(0) ? 0 : finalRunningDays[finalRunningDays.length - 1]);
  
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
  
  // Calcular frequências desejadas
  const easyRunsCount = params.keyWorkouts.easy.frequency || 2;
  const qualityFreq = params.keyWorkouts.quality.frequency || 1;
  const strengthFreq = params.keyWorkouts.strength.frequency || 2;
  
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
  
  // Mapa de alocação de dias: rastrear o que foi alocado para cada dia
  const dayAllocation = new Map<number, string>();
  
  // PRIORIDADE 1: LONGÃO no dia configurado
  dayAllocation.set(availability.longRunDay, 'long_run');
  
  // PRIORIDADE 2: TREINOS DE QUALIDADE (apenas em dias de corrida e não em cutback weeks)
  if (!params.isCutbackWeek) {
    qualityDays.forEach(day => {
      if (!dayAllocation.has(day)) {
        dayAllocation.set(day, 'quality');
      }
    });
  }
  
  // PRIORIDADE 3: TREINOS FÁCEIS (apenas em dias de corrida)
  easyDays.forEach(day => {
    if (!dayAllocation.has(day)) {
      dayAllocation.set(day, 'easy');
    }
  });
  
  // PRIORIDADE 4: MUSCULAÇÃO - usar TODOS os dias configurados
  strengthDaysToUse.forEach(day => {
    if (!dayAllocation.has(day)) {
      dayAllocation.set(day, 'strength');
    }
  });
  
  // PRIORIDADE 5: OUTRAS ATIVIDADES (natação, muay-thai, etc)
  availability.otherActivityDays.forEach((days, activityId) => {
    days.forEach(day => {
      if (!dayAllocation.has(day)) {
        dayAllocation.set(day, `other:${activityId}`);
      }
    });
  });
  
  console.log('[WORKOUT GEN] Mapa de alocação final:', Array.from(dayAllocation.entries()));
  
  // Gerar treino para cada dia da semana
  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    const date = new Date(params.currentWeekStart);
    date.setDate(date.getDate() + dayOfWeek);
    
    let workout: any = null;
    const allocation = dayAllocation.get(dayOfWeek);
    
    if (allocation === 'long_run') {
      const timeInfo = runningTimeText ? ` • ${runningTimeText}` : '';
      workout = {
        dayOfWeek,
        date,
        type: 'running',
        subtype: 'long',
        title: `Longão - ${Math.round(params.longRunKm)}km${timeInfo}`,
        description: params.keyWorkouts.long.description || `Treino longo semanal em ritmo confortável. O mais importante da semana!${runningTimeText ? ` Horário preferido: ${runningTimeText}.` : ''}`,
        distance: Math.round(params.longRunKm * 10) / 10,
        duration: null,
        targetPace: params.paces.easy,
        warmup: null,
        mainSet: `${Math.round(params.longRunKm)}km em ritmo fácil (${params.paces.easy})`,
        cooldown: null,
      };
    }
    else if (allocation === 'quality') {
      const qualityType = params.keyWorkouts.quality.type;
      const timeInfo = runningTimeText ? ` • ${runningTimeText}` : '';
      
      if (qualityType === 'tempo') {
        workout = {
          dayOfWeek,
          date,
          type: 'running',
          subtype: 'tempo',
          title: `Treino de Ritmo (Tempo Run)${timeInfo}`,
          description: params.keyWorkouts.quality.description || `Treino em ritmo controlado e sustentado.${runningTimeText ? ` Horário preferido: ${runningTimeText}.` : ''}`,
          distance: Math.round(easyRunKm * 10) / 10,
          duration: null,
          targetPace: params.paces.threshold,
          warmup: '10 min fácil',
          mainSet: `20-30 min em ritmo threshold (${params.paces.threshold})`,
          cooldown: '10 min fácil',
        };
      } else if (qualityType === 'intervals') {
        workout = {
          dayOfWeek,
          date,
          type: 'running',
          subtype: 'intervals',
          title: `Treino Intervalado${timeInfo}`,
          description: params.keyWorkouts.quality.description || `Treino de velocidade com recuperação.${runningTimeText ? ` Horário preferido: ${runningTimeText}.` : ''}`,
          distance: Math.round(easyRunKm * 10) / 10,
          duration: null,
          targetPace: params.paces.interval,
          warmup: '15 min fácil',
          mainSet: `6-8 x 800m em ${params.paces.interval} (recuperação 2 min)`,
          cooldown: '10 min fácil',
        };
      } else {
        // Fartlek ou treino fácil
        workout = {
          dayOfWeek,
          date,
          type: 'running',
          subtype: 'easy',
          title: `Treino Fácil - ${Math.round(easyRunKm)}km${timeInfo}`,
          description: `Corrida em ritmo confortável para construir base aeróbica.${runningTimeText ? ` Horário preferido: ${runningTimeText}.` : ''}`,
          distance: Math.round(easyRunKm * 10) / 10,
          duration: null,
          targetPace: params.paces.easy,
        };
      }
    }
    else if (allocation === 'easy') {
      const timeInfo = runningTimeText ? ` • ${runningTimeText}` : '';
      workout = {
        dayOfWeek,
        date,
        type: 'running',
        subtype: 'easy',
        title: `Treino Fácil - ${Math.round(easyRunKm)}km${timeInfo}`,
        description: `Corrida em ritmo confortável. Foque em manter o ritmo fácil e respiração controlada.${runningTimeText ? ` Horário preferido: ${runningTimeText}.` : ''}`,
        distance: Math.round(easyRunKm * 10) / 10,
        duration: null,
        targetPace: params.paces.easy,
      };
    }
    else if (allocation === 'strength') {
      const timeInfo = strengthTimeText ? ` • ${strengthTimeText}` : '';
      workout = {
        dayOfWeek,
        date,
        type: 'strength',
        title: `Musculação${timeInfo}`,
        description: params.keyWorkouts.strength.description || `Treino de força para corrida. Foque em membros inferiores e core.${strengthTimeText ? ` Horário preferido: ${strengthTimeText}.` : ''}`,
        distance: null,
        duration: 45,
        targetPace: null,
      };
    }
    else if (allocation && allocation.startsWith('other:')) {
      const activityId = allocation.replace('other:', '');
      const timeInfo = getPreferredTimeText(activityId);
      const timeInfoShort = timeInfo ? ` • ${timeInfo}` : '';
      
      // Mapear ID da atividade para nome amigável
      let activityName = activityId;
      if (activityId.includes('swim')) activityName = 'Natação';
      else if (activityId.includes('muay') || activityId.includes('thai')) activityName = 'Muay-Thai';
      else if (activityId.includes('yoga')) activityName = 'Yoga';
      else if (activityId.includes('bike') || activityId.includes('cycling')) activityName = 'Ciclismo';
      
      workout = {
        dayOfWeek,
        date,
        type: 'cross-training',
        subtype: activityId,
        title: `${activityName}${timeInfoShort}`,
        description: `Treino complementar de ${activityName.toLowerCase()}.${timeInfo ? ` Horário preferido: ${timeInfo}.` : ''} Aproveite para trabalhar outros grupos musculares e dar uma pausa da corrida.`,
        distance: null,
        duration: 45,
        targetPace: null,
      };
    }
    else {
      // Dia de descanso (não configurado pelo usuário)
      workout = {
        dayOfWeek,
        date,
        type: 'rest',
        title: 'Descanso',
        description: 'Dia de recuperação completa. Hidrate-se bem, cuide do sono e considere alongamento leve ou caminhada se sentir necessidade.',
        distance: null,
        duration: null,
        targetPace: null,
      };
    }
    
    workouts.push(workout);
  }
  
  // Log de resumo
  const summary = {
    running: workouts.filter(w => w.type === 'running').length,
    strength: workouts.filter(w => w.type === 'strength').length,
    crossTraining: workouts.filter(w => w.type === 'cross-training').length,
    rest: workouts.filter(w => w.type === 'rest').length,
  };
  
  console.log(`[WORKOUT GEN] Semana ${params.weekNumber}: Resumo - Running: ${summary.running}, Strength: ${summary.strength}, Cross: ${summary.crossTraining}, Rest: ${summary.rest}`);
  
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
  
  if (!plan.vdot || plan.vdot < 20 || plan.vdot > 85) {
    errors.push('VDOT fora do intervalo esperado (20-85)');
  }
  
  if (!plan.paces || !plan.paces.easy || !plan.paces.marathon) {
    errors.push('Paces obrigatórios ausentes');
  }
  
  plan.weeks?.forEach((week, index) => {
    if (!week.workouts || week.workouts.length !== 7) {
      errors.push(`Semana ${index + 1} não tem 7 treinos`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}
