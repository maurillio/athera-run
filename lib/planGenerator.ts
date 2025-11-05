/**
 * Sistema de Geração de Planos de Treinamento Científico
 * Baseado em:
 * - Jack Daniels' Running Formula (VDOT system)
 * - Couch to 5K progression (iniciantes)
 * - 10% Rule com cutback weeks
 * - Periodização baseada em evidências científicas
 */

import { 
  getVDOTPaces, 
  estimateVDOTFromLevel, 
  estimateVDOTFromRace,
  calculateTargetPace,
  estimateVDOTFromPaces 
} from './vdotTables';

export interface UserProfile {
  runningLevel: string;
  goalDistance: string;
  targetRaceDate: Date;
  currentWeeklyKm: number;
  longestRun: number;
  currentVDOT?: number;
  targetTime?: string;
  weight: number;
  age?: number;
  gender?: string;
  usualPaces?: Record<string, string>;
}

export interface TrainingPlan {
  totalWeeks: number;
  phases: {
    name: string;
    weeks: number;
    weeklyVolume: { min: number; max: number };
    longRunPercentage: number;
    workoutsPerWeek: { easy: number; quality: number; long: number };
  }[];
}

// Calcula duração ideal do plano baseado no nível e condicionamento atual
export function calculatePlanDuration(
  level: string, 
  goalDistance: string, 
  currentWeeklyKm: number,
  targetRaceDate?: Date
): number {
  // Durações mínimas recomendadas baseadas na ciência do treinamento
  const minDurations = {
    '5k': { beginner: 12, intermediate: 8, advanced: 8 },
    '10k': { beginner: 16, intermediate: 12, advanced: 10 },
    'half_marathon': { beginner: 20, intermediate: 16, advanced: 14 },
    'marathon': { beginner: 28, intermediate: 24, advanced: 20 },
    'conditioning': { beginner: 12, intermediate: 12, advanced: 12 },
  };

  let minDuration = minDurations[goalDistance as keyof typeof minDurations]?.[level as keyof typeof minDurations['5k']] || 16;
  
  // Para iniciantes sem base, adicionar semanas de adaptação
  if (level === 'beginner' && currentWeeklyKm < 10) {
    minDuration += 4;
  }
  
  // Se há uma data alvo, calcular semanas disponíveis
  if (targetRaceDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const raceDate = new Date(targetRaceDate);
    raceDate.setHours(0, 0, 0, 0);
    
    // Calcular diferença em semanas
    const diffTime = raceDate.getTime() - today.getTime();
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    
    // Se há tempo suficiente, usar todas as semanas disponíveis
    if (diffWeeks >= minDuration) {
      return diffWeeks;
    }
    
    // Se o tempo é muito curto, usar o mínimo recomendado
    // (o aviso será dado na API)
    return minDuration;
  }
  
  // Se não há data alvo, usar duração mínima recomendada
  return minDuration;
}

// Calcula volume base semanal SEGURO para iniciar o treino
export function calculateBaseVolume(profile: UserProfile): number {
  const { currentWeeklyKm, runningLevel, goalDistance, longestRun } = profile;
  
  // Para iniciantes ABSOLUTOS (nunca correram), começar muito devagar
  if (runningLevel === 'beginner' && (currentWeeklyKm === 0 || !currentWeeklyKm)) {
    // Couch to 5K style: começar com 3-4 sessões por semana de 20-30min
    // Aproximadamente 2-3km por sessão no início
    return 8; // 8km total na primeira semana (muito conservador)
  }
  
  // Para quem já corre um pouco, começar com o volume atual ou um pouco menos
  if (runningLevel === 'beginner' && currentWeeklyKm > 0 && currentWeeklyKm < 20) {
    return Math.max(currentWeeklyKm * 0.9, 10); // Começar com 90% do atual
  }
  
  // Volume mínimo seguro baseado no nível (para quem já tem base)
  const minVolumes = {
    beginner: 15,     // Já corre há alguns meses
    intermediate: 30,  // Corre regularmente há 6+ meses
    advanced: 50,      // Corre consistentemente há anos
  };

  // Volume objetivo baseado na distância e nível
  const targetVolumes = {
    '5k': { beginner: 20, intermediate: 35, advanced: 50 },
    '10k': { beginner: 30, intermediate: 50, advanced: 65 },
    'half_marathon': { beginner: 45, intermediate: 65, advanced: 85 },
    'marathon': { beginner: 60, intermediate: 85, advanced: 110 },
    'conditioning': { beginner: 25, intermediate: 40, advanced: 55 },
  };

  const minVol = minVolumes[runningLevel as keyof typeof minVolumes] || 20;
  const targetVol = targetVolumes[goalDistance as keyof typeof targetVolumes]?.[runningLevel as keyof typeof targetVolumes['5k']] || 40;

  // Começar conservador: usar o menor entre volume atual e volume mínimo recomendado
  let startVol = currentWeeklyKm > 0 ? Math.min(currentWeeklyKm, minVol) : minVol;
  
  // Verificar se o long run atual é apropriado
  if (longestRun > startVol * 0.3) {
    // Se o long run é mais de 30% do volume semanal, está OK
    startVol = Math.max(startVol, longestRun * 3);
  }
  
  return Math.round(startVol);
}

/**
 * Ajustes científicos baseados no gênero
 * 
 * Baseado em pesquisas:
 * - Tarnopolsky (2008): Diferenças no metabolismo energético
 * - Devries et al. (2006): Recuperação muscular
 * - Costill et al. (1987): Diferenças na composição corporal
 */
function applyGenderAdjustments(plan: TrainingPlan, gender?: string): TrainingPlan {
  if (!gender) return plan;
  
  const adjustedPlan = JSON.parse(JSON.stringify(plan)); // Deep clone
  
  if (gender === 'female') {
    // Mulheres têm melhor utilização de gordura como energia (Tarnopolsky, 2008)
    // Ajustar para enfatizar treinos longos e aeróbicos
    adjustedPlan.phases = adjustedPlan.phases.map((phase: any) => ({
      ...phase,
      // Aumentar porcentagem do longão em 2-5%
      longRunPercentage: Math.min(phase.longRunPercentage * 1.05, 0.45),
      // Aumentar ênfase em treinos fáceis (melhor oxidação de gordura)
      workoutsPerWeek: {
        ...phase.workoutsPerWeek,
        easy: Math.max(phase.workoutsPerWeek.easy, 2),
      },
    }));
  } else if (gender === 'male') {
    // Homens têm maior capacidade anaeróbica (Costill et al., 1987)
    // Enfatizar treinos de alta intensidade
    adjustedPlan.phases = adjustedPlan.phases.map((phase: any, index: number) => {
      // Nas fases de construção e pico, aumentar treinos de qualidade
      const isIntensityPhase = index >= Math.floor(adjustedPlan.phases.length / 2);
      
      return {
        ...phase,
        workoutsPerWeek: {
          ...phase.workoutsPerWeek,
          // Aumentar treinos de qualidade nas fases finais
          quality: isIntensityPhase 
            ? Math.min(phase.workoutsPerWeek.quality + 1, 3)
            : phase.workoutsPerWeek.quality,
        },
      };
    });
  }
  
  return adjustedPlan;
}

// Gera estrutura do plano com periodização científica
export function generatePlanStructure(profile: UserProfile): TrainingPlan {
  const { runningLevel, goalDistance, currentWeeklyKm, gender, targetRaceDate } = profile;
  const totalWeeks = calculatePlanDuration(runningLevel, goalDistance, currentWeeklyKm, targetRaceDate);
  const baseVolume = calculateBaseVolume(profile);

  // PLANO ESPECÍFICO: Apenas Ganhar Condicionamento
  if (goalDistance === 'conditioning') {
    const plan = {
      totalWeeks,
      phases: [
        {
          name: 'Adaptação Inicial',
          weeks: Math.floor(totalWeeks * 0.4),
          weeklyVolume: { min: baseVolume, max: baseVolume * 1.4 },
          longRunPercentage: 0.30,
          workoutsPerWeek: { easy: 3, quality: 0, long: 1 },
        },
        {
          name: 'Desenvolvimento',
          weeks: Math.floor(totalWeeks * 0.4),
          weeklyVolume: { min: baseVolume * 1.3, max: baseVolume * 1.8 },
          longRunPercentage: 0.30,
          workoutsPerWeek: { easy: 3, quality: 1, long: 1 },
        },
        {
          name: 'Consolidação',
          weeks: Math.ceil(totalWeeks * 0.2),
          weeklyVolume: { min: baseVolume * 1.5, max: baseVolume * 2.0 },
          longRunPercentage: 0.30,
          workoutsPerWeek: { easy: 2, quality: 1, long: 1 },
        },
      ],
    };
    return applyGenderAdjustments(plan, gender);
  }

  // PLANO ESPECÍFICO: 5km
  if (goalDistance === '5k') {
    if (runningLevel === 'beginner') {
      const plan = {
        totalWeeks,
        phases: [
          {
            name: 'Base Aeróbica',
            weeks: Math.floor(totalWeeks * 0.5),
            weeklyVolume: { min: baseVolume, max: baseVolume * 1.4 },
            longRunPercentage: 0.28,
            workoutsPerWeek: { easy: 3, quality: 0, long: 1 },
          },
          {
            name: 'Construção',
            weeks: Math.floor(totalWeeks * 0.3),
            weeklyVolume: { min: baseVolume * 1.3, max: baseVolume * 1.7 },
            longRunPercentage: 0.30,
            workoutsPerWeek: { easy: 2, quality: 1, long: 1 },
          },
          {
            name: 'Polimento',
            weeks: Math.ceil(totalWeeks * 0.2),
            weeklyVolume: { min: baseVolume * 1.0, max: baseVolume * 1.4 },
            longRunPercentage: 0.25,
            workoutsPerWeek: { easy: 2, quality: 1, long: 1 },
          },
        ],
      };
      return applyGenderAdjustments(plan, gender);
    } else {
      // Intermediário/Avançado 5k
      const plan = {
        totalWeeks,
        phases: [
          {
            name: 'Base Aeróbica',
            weeks: Math.floor(totalWeeks * 0.35),
            weeklyVolume: { min: baseVolume, max: baseVolume * 1.3 },
            longRunPercentage: 0.25,
            workoutsPerWeek: { easy: 2, quality: 1, long: 1 },
          },
          {
            name: 'Construção',
            weeks: Math.floor(totalWeeks * 0.40),
            weeklyVolume: { min: baseVolume * 1.2, max: baseVolume * 1.6 },
            longRunPercentage: 0.25,
            workoutsPerWeek: { easy: 2, quality: 2, long: 1 },
          },
          {
            name: 'Pico e Polimento',
            weeks: Math.ceil(totalWeeks * 0.25),
            weeklyVolume: { min: baseVolume * 1.0, max: baseVolume * 1.3 },
            longRunPercentage: 0.22,
            workoutsPerWeek: { easy: 2, quality: 1, long: 1 },
          },
        ],
      };
      return applyGenderAdjustments(plan, gender);
    }
  }

  // Para iniciantes ABSOLUTOS, usar progressão Couch to 5K style
  if (runningLevel === 'beginner' && currentWeeklyKm < 10) {
    const plan = {
      totalWeeks,
      phases: [
        {
          name: 'Adaptação (Walk/Run)',
          weeks: 6,
          weeklyVolume: { min: baseVolume, max: baseVolume * 1.8 },
          longRunPercentage: 0.30,
          workoutsPerWeek: { easy: 3, quality: 0, long: 1 }, // 4 treinos/semana
        },
        {
          name: 'Base Aeróbica',
          weeks: Math.floor((totalWeeks - 6) * 0.5),
          weeklyVolume: { min: baseVolume * 1.8, max: baseVolume * 2.5 },
          longRunPercentage: 0.30,
          workoutsPerWeek: { easy: 3, quality: 1, long: 1 },
        },
        {
          name: 'Construção',
          weeks: Math.floor((totalWeeks - 6) * 0.35),
          weeklyVolume: { min: baseVolume * 2.5, max: baseVolume * 3.2 },
          longRunPercentage: 0.35,
          workoutsPerWeek: { easy: 2, quality: 1, long: 1 },
        },
        {
          name: 'Polimento',
          weeks: Math.ceil((totalWeeks - 6) * 0.15),
          weeklyVolume: { min: baseVolume * 2.0, max: baseVolume * 2.5 },
          longRunPercentage: 0.30,
          workoutsPerWeek: { easy: 2, quality: 1, long: 1 },
        },
      ],
    };
    return applyGenderAdjustments(plan, gender);
  }

  // Para iniciantes com alguma base
  if (runningLevel === 'beginner') {
    const plan = {
      totalWeeks,
      phases: [
        {
          name: 'Base Aeróbica',
          weeks: Math.floor(totalWeeks * 0.45),
          weeklyVolume: { min: baseVolume, max: baseVolume * 1.5 },
          longRunPercentage: 0.28,
          workoutsPerWeek: { easy: 3, quality: 0, long: 1 },
        },
        {
          name: 'Construção',
          weeks: Math.floor(totalWeeks * 0.35),
          weeklyVolume: { min: baseVolume * 1.4, max: baseVolume * 2.0 },
          longRunPercentage: 0.32,
          workoutsPerWeek: { easy: 2, quality: 1, long: 1 },
        },
        {
          name: 'Polimento',
          weeks: Math.ceil(totalWeeks * 0.20),
          weeklyVolume: { min: baseVolume * 1.2, max: baseVolume * 1.6 },
          longRunPercentage: 0.30,
          workoutsPerWeek: { easy: 2, quality: 1, long: 1 },
        },
      ],
    };
    return applyGenderAdjustments(plan, gender);
  }

  // Para intermediários
  if (runningLevel === 'intermediate') {
    if (goalDistance === '10k') {
      const plan = {
        totalWeeks,
        phases: [
          {
            name: 'Base Aeróbica',
            weeks: Math.floor(totalWeeks * 0.40),
            weeklyVolume: { min: baseVolume, max: baseVolume * 1.3 },
            longRunPercentage: 0.25,
            workoutsPerWeek: { easy: 2, quality: 1, long: 1 },
          },
          {
            name: 'Construção',
            weeks: Math.floor(totalWeeks * 0.35),
            weeklyVolume: { min: baseVolume * 1.2, max: baseVolume * 1.6 },
            longRunPercentage: 0.28,
            workoutsPerWeek: { easy: 2, quality: 2, long: 1 },
          },
          {
            name: 'Pico e Polimento',
            weeks: Math.ceil(totalWeeks * 0.25),
            weeklyVolume: { min: baseVolume * 1.0, max: baseVolume * 1.4 },
            longRunPercentage: 0.25,
            workoutsPerWeek: { easy: 2, quality: 1, long: 1 },
          },
        ],
      };
      return applyGenderAdjustments(plan, gender);
    } else {
      const plan = {
        totalWeeks,
        phases: [
          {
            name: 'Base Aeróbica',
            weeks: Math.floor(totalWeeks * 0.35),
            weeklyVolume: { min: baseVolume, max: baseVolume * 1.4 },
            longRunPercentage: 0.30,
            workoutsPerWeek: { easy: 2, quality: 1, long: 1 },
          },
          {
            name: 'Construção',
            weeks: Math.floor(totalWeeks * 0.35),
            weeklyVolume: { min: baseVolume * 1.3, max: baseVolume * 1.8 },
            longRunPercentage: 0.35,
            workoutsPerWeek: { easy: 2, quality: 2, long: 1 },
          },
          {
            name: 'Pico',
            weeks: Math.floor(totalWeeks * 0.20),
            weeklyVolume: { min: baseVolume * 1.6, max: baseVolume * 2.0 },
            longRunPercentage: 0.38,
            workoutsPerWeek: { easy: 2, quality: 2, long: 1 },
          },
          {
            name: 'Polimento',
            weeks: Math.ceil(totalWeeks * 0.10),
            weeklyVolume: { min: baseVolume * 0.7, max: baseVolume * 1.0 },
            longRunPercentage: 0.30,
            workoutsPerWeek: { easy: 2, quality: 1, long: 1 },
          },
        ],
      };
      return applyGenderAdjustments(plan, gender);
    }
  }

  // Para avançados (Marathon)
  const plan = {
    totalWeeks,
    phases: [
      {
        name: 'Base Aeróbica',
        weeks: Math.floor(totalWeeks * 0.30),
        weeklyVolume: { min: baseVolume, max: baseVolume * 1.4 },
        longRunPercentage: 0.25,
        workoutsPerWeek: { easy: 3, quality: 1, long: 1 },
      },
      {
        name: 'Construção Volume',
        weeks: Math.floor(totalWeeks * 0.25),
        weeklyVolume: { min: baseVolume * 1.3, max: baseVolume * 1.8 },
        longRunPercentage: 0.30,
        workoutsPerWeek: { easy: 2, quality: 2, long: 1 },
      },
      {
        name: 'Construção Intensidade',
        weeks: Math.floor(totalWeeks * 0.20),
        weeklyVolume: { min: baseVolume * 1.6, max: baseVolume * 2.1 },
        longRunPercentage: 0.35,
        workoutsPerWeek: { easy: 2, quality: 2, long: 1 },
      },
      {
        name: 'Pico',
        weeks: Math.floor(totalWeeks * 0.15),
        weeklyVolume: { min: baseVolume * 1.8, max: baseVolume * 2.2 },
        longRunPercentage: 0.40,
        workoutsPerWeek: { easy: 2, quality: 2, long: 1 },
      },
      {
        name: 'Polimento',
        weeks: Math.ceil(totalWeeks * 0.10),
        weeklyVolume: { min: baseVolume * 0.6, max: baseVolume * 0.9 },
        longRunPercentage: 0.25,
        workoutsPerWeek: { easy: 2, quality: 1, long: 1 },
      },
    ],
  };
  return applyGenderAdjustments(plan, gender);
}

/**
 * Estima VDOT usando múltiplas fontes de informação
 * 
 * ORDEM DE PRIORIDADE (mais preciso → menos preciso):
 * 1. Paces usuais informados pelo usuário (dados reais de corridas)
 * 2. VDOT já calculado anteriormente
 * 3. Tempo alvo para uma prova específica
 * 4. Nível de experiência declarado
 */
export function estimateVDOT(profile: UserProfile): number {
  const { currentVDOT, targetTime, goalDistance, runningLevel, currentWeeklyKm, usualPaces } = profile;

  // PRIORIDADE 1: Paces usuais informados pelo usuário (DADOS REAIS!)
  // Esta é a fonte mais confiável pois vem de performances reais
  if (usualPaces && Object.keys(usualPaces).length > 0) {
    const vdotFromPaces = estimateVDOTFromPaces(usualPaces);
    if (vdotFromPaces !== null && vdotFromPaces > 0) {
      console.log(`[VDOT] Calculado a partir dos paces usuais: ${vdotFromPaces}`);
      return vdotFromPaces;
    }
  }

  // PRIORIDADE 2: VDOT já calculado anteriormente
  if (currentVDOT && currentVDOT > 0) {
    console.log(`[VDOT] Usando VDOT existente: ${currentVDOT}`);
    return currentVDOT;
  }

  // PRIORIDADE 3: Tempo alvo para prova específica
  if (targetTime && targetTime !== '0:00:00') {
    const [hours, minutes, seconds] = targetTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + (seconds / 60);
    const vdotFromTarget = estimateVDOTFromRace(goalDistance, totalMinutes);
    console.log(`[VDOT] Calculado a partir do tempo alvo: ${vdotFromTarget}`);
    return vdotFromTarget;
  }

  // PRIORIDADE 4: Estimativa baseada no nível de experiência
  const hasRecentRace = !!targetTime && targetTime !== '0:00:00';
  const baseVDOT = estimateVDOTFromLevel(runningLevel, hasRecentRace);
  
  // Ajustar para iniciantes absolutos
  if (runningLevel === 'beginner' && currentWeeklyKm < 10) {
    const adjustedVDOT = Math.max(30, baseVDOT - 5);
    console.log(`[VDOT] Estimado para iniciante absoluto: ${adjustedVDOT}`);
    return adjustedVDOT;
  }
  
  console.log(`[VDOT] Estimado baseado no nível ${runningLevel}: ${baseVDOT}`);
  return baseVDOT;
}

// Calcula paces usando a tabela científica de Jack Daniels
export function calculatePaces(vdot: number): {
  easy: string;
  marathon: string;
  threshold: string;
  interval: string;
  repetition: string;
} {
  return getVDOTPaces(vdot);
}

// Gera descrição detalhada e motivadora do treino
export function generateWorkoutDescription(
  type: string,
  subtype: string | null,
  distance: number | null,
  pace: string | null,
  isBeginnerWalkRun: boolean = false
): string {
  if (type === 'rest') {
    return 'Dia de descanso completo. Seu corpo precisa deste tempo para se fortalecer e se adaptar ao treinamento. Foque em recuperação, hidratação e sono de qualidade. Este dia é tão importante quanto os treinos!';
  }

  if (type === 'strength') {
    return 'Treino de força focado em prevenção de lesões, fortalecimento de core e membros inferiores. Inclua exercícios como agachamentos, afundos, prancha e elevação de quadril. Use peso corporal ou pesos leves. Este treino torna você um corredor mais forte e resistente!';
  }

  if (type === 'swimming') {
    return 'Natação para recuperação ativa e trabalho cardiovascular de baixo impacto. Foque em técnica e ritmo confortável. A natação ajuda na recuperação muscular enquanto mantém sua capacidade aeróbica.';
  }

  if (type === 'cross_training') {
    return 'Treino cruzado: escolha uma atividade de baixo impacto como ciclismo, natação, elíptico ou caminhada rápida. Mantenha intensidade moderada. Isso mantém seu condicionamento sem o impacto da corrida.';
  }

  if (type === 'pilates') {
    return 'Sessão de Pilates focada em core, flexibilidade, equilíbrio e controle corporal. Excelente complemento ao treinamento de corrida, o Pilates fortalece o centro do corpo, melhora a postura e previne lesões. Trabalha músculos estabilizadores essenciais para uma corrida eficiente.';
  }

  if (type === 'running' || type === 'walk_run') {
    if (isBeginnerWalkRun || type === 'walk_run') {
      return `Treino de adaptação alternando corrida e caminhada. ${pace ? `Ritmo de corrida: ${pace}.` : ''} Comece com 5 minutos de caminhada para aquecimento. Durante o treino, alterne períodos de corrida leve com caminhada ativa para recuperação. Termine com 5 minutos de caminhada para volta à calma. O objetivo é se adaptar gradualmente ao movimento da corrida. Não se preocupe com velocidade!`;
    }
    
    if (subtype === 'easy') {
      return `Corrida em ritmo confortável (${pace}). Este é o pace onde você consegue manter uma conversa tranquilamente. Você deve terminar o treino sentindo que poderia correr mais. Este ritmo desenvolve sua base aeróbica, que é a fundação de todo corredor. A maioria dos seus treinos deve ser neste ritmo!`;
    }
    
    if (subtype === 'long') {
      const distDesc = distance ? `${distance}km` : 'distância planejada';
      return `Corrida longa de ${distDesc} em ritmo controlado (${pace}). Este é o treino mais importante da semana! Mantenha um ritmo onde você consegue conversar, mesmo que com algum esforço. Desenvolve resistência mental e física, ensina seu corpo a usar gordura como energia, e fortalece músculos e tendões. Leve água e/ou gel se for rodar mais de 90 minutos.`;
    }
    
    if (subtype === 'tempo' || subtype === 'threshold') {
      return `Treino de ritmo no pace ${pace}. Este é um ritmo "confortavelmente difícil" - você consegue falar frases curtas, mas não manter uma conversa. Também chamado de "ritmo de limiar", este treino ensina seu corpo a processar lactato mais eficientemente, permitindo que você corra mais rápido por mais tempo. Após aquecimento, mantenha este ritmo por 15-25 minutos.`;
    }
    
    if (subtype === 'intervals') {
      return `Treino intervalado no pace ${pace}. Após aquecimento de 10-15 minutos, faça repetições de 3-5 minutos neste ritmo (você deve estar respirando fortemente, mas controlado), com recuperação de 2-3 minutos em corrida leve entre cada repetição. Este treino melhora sua potência aeróbica máxima (VO2max), tornando você mais eficiente em todos os ritmos.`;
    }
    
    if (subtype === 'recovery') {
      return `Corrida de recuperação super leve (${pace}). Este é o ritmo mais fácil do seu treinamento - deve parecer quase "vergonhosamente lento". O objetivo é promover fluxo sanguíneo para recuperação ativa, não treinar. Se você está se sentindo cansado, substituir por caminhada rápida é perfeitamente aceitável!`;
    }
  }

  return `Treino de ${type}${subtype ? ` - ${subtype}` : ''}.`;
}
