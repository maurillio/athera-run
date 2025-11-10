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

  // Corridas cadastradas (Sistema A, B, C)
  if (profile.raceGoals && profile.raceGoals.length > 0) {
    context += `\n## Corridas Cadastradas (Sistema A/B/C)\n`;
    profile.raceGoals.forEach(race => {
      const raceDate = new Date(race.date);
      const daysUntilRace = Math.floor((raceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      // Usar Math.ceil para incluir a semana da corrida (mesmo que seja parcial)
      const weeksUntilRace = Math.ceil(daysUntilRace / 7);

      context += `\n### ${race.name} (Corrida ${race.priority})\n`;
      context += `- Distância: ${race.distance}\n`;
      context += `- Data: ${raceDate.toLocaleDateString('pt-BR')} (em ${weeksUntilRace} semanas)\n`;
      if (race.targetTime) context += `- Meta de Tempo: ${race.targetTime}\n`;
      context += `- Classificação: `;

      if (race.priority === 'A') {
        context += `**CORRIDA A (Objetivo Principal)** - Todo o plano deve ser estruturado para chegar no pico nesta corrida\n`;
      } else if (race.priority === 'B') {
        context += `**CORRIDA B (Preparatória)** - Usar como teste de ritmo e simulado, sem taper completo\n`;
      } else {
        context += `**CORRIDA C (Volume)** - Usar como treino longo, sem taper\n`;
      }
    });

    context += `\n**IMPORTANTE:** O plano deve considerar todas as corridas cadastradas:\n`;
    context += `- Corrida A: Estruturar periodização para pico nesta data\n`;
    context += `- Corridas B: Incluir como treinos de teste de ritmo 2-6 semanas antes da A\n`;
    context += `- Corridas C: Incluir como treinos longos sem redução de volume\n`;
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

  return context;
}

/**
 * Gera um plano de treinamento usando IA
 * A IA gera a estrutura e estratégia com exemplos, depois expandimos para todas as semanas
 */
export async function generateAIPlan(profile: AIUserProfile, maxRetries: number = 3, customStartDate?: Date): Promise<AIGeneratedPlan> { 
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
  
  const systemPrompt = `Você é um Treinador de Corrida de Rua de Elite, com especialização em fisiologia do exercício, metodologia VDOT (Jack Daniels) e periodização clássica e moderna. Seu objetivo é criar um plano de treinamento TOTALMENTE PERSONALIZADO, seguro, sustentável e otimizado para o pico de desempenho na Corrida A.

**Sua Autoridade e Princípios Fundamentais:**
1.  **Ciência:** Use o VDOT para determinar as zonas de intensidade e paces (Easy, Marathon, Threshold, Interval, Repetition).
2.  **Experiência Empírica:** Incorpore as melhores práticas de treinadores de elite (ex: Peter Coe, Renato Canova, Brad Hudson) em termos de progressão de volume, distribuição de intensidade, e importância de treinos de força e mobilidade.
3.  **Contexto e Individualização:** Sua decisão deve ser baseada na análise holística do perfil, histórico, feedback e adesão recente do atleta, ajustando o plano dinamicamente. Cada atleta é único.
4.  **Segurança e Sustentabilidade:** Priorize a progressão gradual e planos executáveis na vida real. O descanso é um treino; nunca o comprometa.

**Diretrizes de Treinamento (Regras Inegociáveis):**
*   **Periodização:** Siga a estrutura Base (Volume Aeróbico), Build (Intensidade Específica), Peak (Ajuste Fino) e Taper (Recuperação).
*   **Progressão:** Use a regra de 10% (ou menos) de aumento de volume semanal, com semanas de *cutback* (redução de 20-30%) a cada 3-4 semanas, exceto em *taper*.
*   **Intensidade:** Siga a regra 80/20 (80% do volume em baixa intensidade, 20% em moderada/alta), ajustando para o nível do atleta.
*   **Força:** Inclua 2 a 3 sessões de força/mobilidade semanais nos dias especificados, focando em exercícios funcionais para corredores.
*   **Recuperação:** O descanso (rest day ou cross-training leve) é um treino. Nunca o comprometa.
*   **Corridas B/C:** Corridas B são simulados importantes com *taper* leve (75-90% do volume). Corridas C são treinos longos de volume, sem *taper*.
*   **VDOT:** O VDOT é a base para paces, mas o *pace* real deve ser ajustado pelo *pace* habitual do atleta e pelo contexto (calor, fadiga).

**Regras Específicas por Distância:**
*   **5K** (Velocidade): Volume: 30-60km/sem (inter), até 100km (avanç). 70% fácil, 30% intenso. Treinos: Easy, Tempo, Intervals 400-1200m, Reps. Taper: 1 semana.
*   **10K** (Misto): Volume: 35-70km/sem (inter), até 110km (avanç). 75% fácil, 25% intenso. Treinos: Easy, Long, Tempo, Intervals 800-2000m. Taper: 1-2 semanas.
*   **Meia-Maratona**: Volume: 40-80km/sem (inter), até 120km (avanç). 80% fácil, 20% intenso. Treinos: Easy, Long 15-20km, Tempo, Intervals. Taper: 2 semanas.
*   **Maratona** (Endurance): Volume: 50-100km/sem (inter), até 150km (avanç). 80% fácil, 20% intenso. Treinos: Easy, Long 25-35km, Tempo, Intervals. Taper: 3 semanas.
*   **Ultramaratona** (Endurance extremo): Volume: 80-150km/sem+. 85% fácil, 15% intenso. Treinos: Easy, Ultra-long 4-6h, Back-to-backs, Vertical. Taper: 2-3 semanas.

**Regras Específicas por Nível:**
*   **Iniciante Absoluto** (<10km/sem): Walk/run, ZERO intensidade 8 semanas. 3x/sem inicial.
*   **Iniciante** (10-30km/sem): Base aeróbica + 1 longão. SEM qualidade até 20km/sem.
*   **Intermediário** (30-60km/sem): Base + qualidade 1-2x/sem. Complementos integrados.
*   **Avançado** (>60km/sem): Periodização sofisticada. Qualidade 2-3x/sem.

**Atividades Configuradas:**
IMPORTANTE: Se o atleta configurou musculação, natação, yoga ou qualquer outra atividade, você DEVE incluir no plano respeitando os dias e horários configurados! Complementos são ESSENCIAIS para atletas completos.

**Corridas A/B/C - Análise Contextual Obrigatória:**
Antes de decidir o volume da semana de uma corrida B ou C, você DEVE analisar:
1.  **Histórico de Execução Recente** (se disponível): Alta adesão + bom feedback = progressão. Baixa adesão + fadiga = redução de volume/intensidade.
2.  **Objetivo do Atleta na Corrida B/C**: Quer fazer tempo competitivo? → Taper adequado (65-75% volume). Quer só testar ritmo/estratégia? → Taper mínimo (80-85% volume). Quer só completar/curtir? → Pode manter volume normal.
3.  **Relação com Corrida A**: Corrida B muito próxima da A (<4 semanas)? → Taper mais conservador. Corrida B longe da A (>8 semanas)? → Pode usar como treino intenso. Distância da B similar à A? → Taper adequado. Distância da B muito menor que A? → Pode tratar como qualidade.
4.  **Nível de Preparação**: Atleta avançado, vem treinando forte? → Taper mínimo pode bastar. Atleta iniciante ou com volume baixo? → Taper mais generoso.

**Pense como um Super Treinador:**
Você NÃO é um algoritmo que segue regras rígidas. Você é um ESPECIALISTA que:
1.  **ANALISA O TODO**: Contexto completo (execução recente + relatos + estado atual + objetivos + corridas).
2.  **PERSONALIZA DE VERDADE**: Cada atleta é único - ajuste TUDO baseado no perfil individual.
3.  **PRIORIZA SUSTENTABILIDADE**: Plano bom é o que o atleta CONSEGUE seguir na vida real.
4.  **AJUSTA DINAMICAMENTE**: Se há sinais de fadiga/overtraining, REDUZA. Se está indo bem, pode progredir.
5.  **USA INTUIÇÃO EXPERIENTE**: Combine ciência + experiência prática + bom senso.
Você tem liberdade total para ajustar volumes, intensidades e estruturas baseado no CONTEXTO REAL. NÃO siga fórmulas prontas se o contexto indicar outro caminho!

**Formato de Saída:**
*   Você deve retornar **APENAS** o objeto JSON estritamente válido, sem formatação Markdown, comentários ou texto adicional.
*   O campo planRationale deve ser uma explicação detalhada e profissional da sua estratégia, justificando as fases, o volume e a progressão escolhida.

Responda APENAS com o JSON válido, sem formatação markdown ou explicações adicionais.`;

  const userPrompt = `${userContext}\n\n# TAREFA\n\nCrie uma ESTRATÉGIA de treinamento COMPLETA e PERSONALIZADA para este atleta.\n\nO plano tem ${totalWeeks} semanas até a prova.\n\nVocê deve definir:\n1. As FASES do treinamento (quantas semanas cada uma)\n2. A ESTRATÉGIA de progressão (como o volume e intensidade evoluem)\n3. EXEMPLOS REPRESENTATIVOS de treinos para cada fase\n4. PACES personalizados baseados no VDOT\n5. CONSELHOS específicos baseados no perfil\n\nFORMATO DA RESPOSTA (JSON):\n{\n  "totalWeeks": ${totalWeeks},\n  "vdot": <número calculado baseado nos paces usuais ou estimativa>,
  "paces": {\n    "easy": "X:XX min/km",\n    "marathon": "X:XX min/km",\n    "threshold": "X:XX min/km",\n    "interval": "X:XX min/km",\n    "repetition": "X:XX min/km"\n  },\n  "planRationale": "Explicação detalhada da estratégia e por que foi estruturada assim",\n  "keyConsiderations": ["consideração 1", "consideração 2", ...],
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

🏆 CORRIDAS B/C - PENSE COMO UM SUPER TREINADOR:

**ANÁLISE CONTEXTUAL OBRIGATÓRIA:**
Antes de decidir o volume da semana de uma corrida B ou C, você DEVE analisar:

1. **Histórico de Execução Recente** (se disponível):
   - Atleta completou 100% dos treinos? → Pode manter volume alto
   - Atleta pulou treinos ou relatou fadiga? → Reduzir volume mais agressivamente
   - Relatos de dor/desconforto? → Priorizar recuperação

2. **Objetivo do Atleta na Corrida B/C**:
   - Quer fazer tempo competitivo? → Taper adequado (65-75% volume)
   - Quer só testar ritmo/estratégia? → Taper mínimo (80-85% volume)
   - Quer só completar/curtir? → Pode manter volume normal

3. **Relação com Corrida A**:
   - Corrida B muito próxima da A (<4 semanas)? → Taper mais conservador
   - Corrida B longe da A (>8 semanas)? → Pode usar como treino intenso
   - Distância da B similar à A? → Taper adequado
   - Distância da B muito menor que A? → Pode tratar como qualidade

4. **Nível de Preparação**:
   - Atleta avançado, vem treinando forte? → Taper mínimo pode bastar
   - Atleta iniciante ou com volume baixo? → Taper mais generoso

**DIRETRIZES FLEXÍVEIS (NÃO RÍGIDAS):**
- **Corrida B**: Taper entre 60-90% dependendo do contexto acima
- **Corrida C**: Entre 85-110% dependendo se quer usar como treino intenso ou volume
- **Corrida A**: Taper progressivo de 2-3 semanas (100% → 75% → 50%)

**VOCÊ É O ESPECIALISTA**: Use seu conhecimento para decidir caso a caso. Não siga regras cegas!

✍️ ESTILO DAS DESCRIÇÕES:
- Seja ESPECÍFICO e TÉCNICO (use terminologia de corrida)
- EDUCATIVO: explique POR QUÊ o treino é importante
- MOTIVADOR: encoraje o atleta a seguir o plano
- CLARO: instruções práticas e objetivas

📋 REGRAS FINAIS:
- Respeite EXATAMENTE os dias disponíveis configurados
- Iniciantes (<10km/sem): progressão MUITO gradual
- Musculação: 2-3x/sem máximo
- Natação: recuperação ativa, se disponível
- Cutback weeks a cada 3-4 semanas
- NUNCA comprometa a recuperação

🧠 PENSE COMO UM SUPER TREINADOR:

Você NÃO é um algoritmo que segue regras rígidas. Você é um ESPECIALISTA que:

1. **ANALISA O TODO**: Contexto completo (execução recente + relatos + estado atual + objetivos + corridas)
2. **PERSONALIZA DE VERDADE**: Cada atleta é único - ajuste TUDO baseado no perfil individual
3. **PRIORIZA SUSTENTABILIDADE**: Plano bom é o que o atleta CONSEGUE seguir na vida real
4. **AJUSTA DINAMICAMENTE**: Se há sinais de fadiga/overtraining, REDUZA. Se está indo bem, pode progredir.
5. **USA INTUIÇÃO EXPERIENTE**: Combine ciência + experiência prática + bom senso

**EXEMPLOS DE RACIOCÍNIO:**
- "Atleta completou 95% dos treinos e sem queixas? → Pode aumentar volume 5-10%"
- "Atleta com 50% conclusão e relatando fadiga? → Reduzir 20-30% e simplificar"
- "Corrida B daqui 2 semanas mas atleta relata cansaço? → Taper mais agressivo (65%)"
- "Corrida B daqui 2 semanas e atleta super animado? → Taper leve (85-90%)"
- "Atleta trabalha 12h/dia? → Volume conservador, menos qualidade, mais recuperação"

**VOCÊ TEM LIBERDADE TOTAL** para ajustar volumes, intensidades e estruturas baseado no CONTEXTO REAL.
NÃO siga fórmulas prontas se o contexto indicar outro caminho!

Responda APENAS com o JSON válido, sem formatação markdown ou explicações adicionais.
`;

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
            // Validar campos obrigatórios
            const hasRequiredFields =
              data.totalWeeks &&
              data.phases &&
              Array.isArray(data.phases) &&
              data.paces &&
              data.paces.easy &&
              data.paces.marathon;

            if (!hasRequiredFields) {
              console.error('[AI PLAN] Resposta inválida: campos obrigatórios ausentes');
              return false;
            }

            return true;
          } catch (e) {
            console.error('[AI PLAN] Resposta inválida: JSON malformado');
            return false;
          }
        },
        retryConfig: {
          maxRetries,
          baseDelay: 1000,
          maxDelay: 10000,
          backoffMultiplier: 2,
        },
        timeout: 60000, // 60 segundos timeout
      }
    );

    const strategy = JSON.parse(aiResponse);
    console.log('[AI PLAN] Estratégia gerada e validada com sucesso!');
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

    return fullPlan;
  } catch (error) {
    console.error('[AI PLAN] Falha após todas as tentativas de resiliência:', error);
    throw new Error('Não foi possível gerar o plano de treinamento neste momento. Por favor, tente novamente em alguns instantes. Se o problema persistir, entre em contato com o suporte.');
  }
}

/**
 * Expande uma estratégia gerada pela IA em um plano completo com todas as semanas
 */
function expandStrategyToPlan(strategy: any, profile: AIUserProfile, totalWeeks: number, customStartDate?: Date): AIGeneratedPlan { 
  console.log(`[AI PLAN] Expandindo estratégia para ${totalWeeks} semanas...`);
  
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

      // DETECTAR CORRIDAS B/C nesta semana (para passar contexto ao generateWeekWorkouts)
      const weekEnd = new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
      const raceThisWeek = profile.raceGoals?.find(race => {
        const raceDate = new Date(race.date);
        return raceDate >= currentWeekStart && raceDate <= weekEnd;
      });

      if (raceThisWeek) {
        console.log(`[AI PLAN] Semana ${weekNumber}: Corrida ${raceThisWeek.priority} "${raceThisWeek.name}" (${raceThisWeek.distance}) detectada - IA já considerou no volume da fase`);
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

    console.log(`[WORKOUT GEN] Corrida ${params.raceThisWeek.priority} "${params.raceThisWeek.name}" (${params.raceThisWeek.distance}) no dia ${raceDayOfWeek} - substituindo treino planejado`);

    // Adicionar a corrida no dia correto
    addActivity(raceDayOfWeek, 'race', params.raceThisWeek);

    // Se a corrida for C e NÃO for no dia do longão, ainda adicionar um longão menor (50%)
    if (raceDayOfWeek !== availability.longRunDay && params.raceThisWeek.priority === 'C') {
      addActivity(availability.longRunDay, 'long_run');
    }

    // Para corridas A e B: semana de taper - apenas descanso/regeneração nos outros dias
    // (não adicionar treinos de qualidade ou longões extras)
  } else {
    // Sem corrida esta semana - longão normal
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
        const qualityType = params.keyWorkouts.quality.type;

        if (qualityType === 'tempo') {
          const tempoKm = Math.round(easyRunKm * 10) / 10;
          workout = {
            dayOfWeek: dayOfWeek,
            date,
            type: 'running',
            subtype: 'tempo',
            title: `Treino de Ritmo - ${tempoKm}km${timeInfoShort}`,
            description: params.keyWorkouts.quality.description || `Treino de ${tempoKm}km em ritmo controlado e sustentado (threshold). Aquecimento 10min + parte principal 20-30min + desaquecimento 10min.${timeInfo ? ` Horário preferido: ${timeInfo}.` : ''}`,
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
            description: params.keyWorkouts.quality.description || `Treino de velocidade de ${intervalKm}km total. Aquecimento 15min + 6-8 tiros de 800m em ritmo forte + desaquecimento 10min.${timeInfo ? ` Horário preferido: ${timeInfo}.` : ''}`,
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
  };

  console.log(`[WORKOUT GEN] Semana ${params.weekNumber}: Resumo - Running: ${summary.running}, Swimming: ${summary.swimming}, Strength: ${summary.strength}, Cross: ${summary.crossTraining}, Rest: ${summary.rest}`);

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
  
  if (!plan.vdot || plan.vdot < 20 || plan.vdot > 85) {
    errors.push('VDOT fora do intervalo esperado (20-85)');
  }
  
  if (!plan.paces || !plan.paces.easy || !plan.paces.marathon) {
    errors.push('Paces obrigatórios ausentes');
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