
/**
 * Sistema de Classificação Automática de Corridas
 * 
 * Classifica corridas em A, B ou C baseado em:
 * - Distância da corrida
 * - Data em relação à corrida principal
 * - Importância estratégica no plano
 */

export interface RaceToClassify {
  id: number;
  raceName: string;
  distance: string;
  raceDate: Date;
  targetTime?: string;
  isPrimary?: boolean;
}

export interface ClassificationResult {
  raceId: number;
  priority: 'A' | 'B' | 'C';
  weeksBeforeA: number | null;
  trainingSuggest: string;
  periodPhase: string | null;
  reasoning: string;
}

/**
 * Classifica automaticamente múltiplas corridas
 */
export function classifyRaces(races: RaceToClassify[]): ClassificationResult[] {
  if (races.length === 0) return [];
  
  // Encontrar a corrida A (primária ou a mais distante no futuro)
  const primaryRace = races.find(r => r.isPrimary) || 
    [...races].sort((a, b) => b.raceDate.getTime() - a.raceDate.getTime())[0];
  
  const results: ClassificationResult[] = [];
  
  for (const race of races) {
    const result = classifySingleRace(race, primaryRace, races);
    results.push(result);
  }
  
  return results;
}

/**
 * Classifica uma corrida individual baseado na corrida A
 */
function classifySingleRace(
  race: RaceToClassify,
  primaryRace: RaceToClassify,
  allRaces: RaceToClassify[]
): ClassificationResult {
  const isPrimaryRace = race.id === primaryRace.id;
  
  // CORRIDA A: Objetivo principal
  if (isPrimaryRace) {
    return {
      raceId: race.id,
      priority: 'A',
      weeksBeforeA: 0,
      trainingSuggest: `Esta é sua corrida objetivo! Todo o plano será estruturado para atingir o pico de performance nesta data. Foque em descansar bem na semana anterior e confiar no seu treino.`,
      periodPhase: 'race',
      reasoning: 'Corrida objetivo principal do ciclo de treinamento'
    };
  }
  
  // Calcular semanas antes da corrida A
  const weeksBeforeA = Math.floor(
    (primaryRace.raceDate.getTime() - race.raceDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
  );
  
  // Corrida após a corrida A
  if (weeksBeforeA < 0) {
    return {
      raceId: race.id,
      priority: 'C',
      weeksBeforeA,
      trainingSuggest: `Esta corrida acontece após seu objetivo principal. Pode ser usada como celebração do treino ou início de um novo ciclo. Corra de forma recreativa e aproveite!`,
      periodPhase: null,
      reasoning: 'Corrida após o objetivo principal'
    };
  }
  
  // Classificação baseada em timing e distância
  const distanceWeight = getDistanceWeight(race.distance);
  const primaryDistanceWeight = getDistanceWeight(primaryRace.distance);
  
  // CORRIDA B: Provas preparatórias estratégicas
  // - 2-6 semanas antes da corrida A
  // - Mesma distância ou ligeiramente menor
  // - Servem como teste de ritmo
  if (weeksBeforeA >= 2 && weeksBeforeA <= 6 && distanceWeight >= primaryDistanceWeight * 0.5) {
    const phase = getPeriodPhase(weeksBeforeA);
    return {
      raceId: race.id,
      priority: 'B',
      weeksBeforeA,
      trainingSuggest: `Prova preparatória estratégica! Use para testar seu ritmo de prova e validar sua estratégia. ${getSuggestByWeeksBeforeA(weeksBeforeA, race.distance)}`,
      periodPhase: phase,
      reasoning: `Prova ${weeksBeforeA} semanas antes da corrida A - ideal para teste de ritmo`
    };
  }
  
  // CORRIDA B: Prova de média distância no período de build
  // - 7-12 semanas antes da corrida A
  // - Distância moderada
  if (weeksBeforeA >= 7 && weeksBeforeA <= 12 && distanceWeight >= 0.4) {
    const phase = getPeriodPhase(weeksBeforeA);
    return {
      raceId: race.id,
      priority: 'B',
      weeksBeforeA,
      trainingSuggest: `Prova de preparação no período de construção. Use como estímulo de qualidade dentro do seu treino. Não precisa fazer taper - corra com base sólida.`,
      periodPhase: phase,
      reasoning: `Prova no período de construção - bom estímulo de velocidade`
    };
  }
  
  // CORRIDA C: Todas as outras
  // - Muito longe da corrida A (>12 semanas)
  // - Muito perto (<2 semanas)
  // - Distância muito diferente
  const phase = getPeriodPhase(weeksBeforeA);
  let suggestion = '';
  
  if (weeksBeforeA > 12) {
    suggestion = `Esta corrida está no início do seu ciclo de treinamento. Use como treino de volume - não force ritmo. O foco é ganhar experiência e adaptar o corpo.`;
  } else if (weeksBeforeA < 2) {
    suggestion = `Esta corrida está muito próxima do seu objetivo. EVITE correr forte! Se participar, use apenas como treino regenerativo em ritmo muito confortável.`;
  } else {
    suggestion = `Use esta corrida como um treino longo de qualidade. Não é necessário taper - mantenha como parte da sua rotina de treinos.`;
  }
  
  return {
    raceId: race.id,
    priority: 'C',
    weeksBeforeA,
    trainingSuggest: suggestion,
    periodPhase: phase,
    reasoning: `Corrida de volume/experiência - ${weeksBeforeA} semanas antes da corrida A`
  };
}

/**
 * Retorna peso relativo da distância (0 a 1)
 */
function getDistanceWeight(distance: string): number {
  const weights: Record<string, number> = {
    '5k': 0.3,
    '10k': 0.5,
    '15k': 0.6,
    '10mile': 0.7,
    'half_marathon': 0.8,
    '30k': 0.9,
    'marathon': 1.0,
  };
  return weights[distance] || 0.5;
}

/**
 * Determina a fase da periodização baseado em semanas antes da corrida A
 */
function getPeriodPhase(weeksBeforeA: number): string {
  if (weeksBeforeA >= 16) return 'base';
  if (weeksBeforeA >= 8) return 'build';
  if (weeksBeforeA >= 3) return 'peak';
  if (weeksBeforeA >= 1) return 'taper';
  return 'race';
}

/**
 * Sugestões específicas baseadas em timing
 */
function getSuggestByWeeksBeforeA(weeks: number, distance: string): string {
  if (weeks === 6) {
    return `Ideal para um teste completo de ritmo. Faça uma semana de polimento leve antes e dê tudo!`;
  } else if (weeks === 5) {
    return `Última chance de testar ritmo de prova. Ajuste sua estratégia baseado nesta corrida.`;
  } else if (weeks === 4) {
    return `Use como simulado específico. Mantenha a rotina de treino normalmente na semana.`;
  } else if (weeks === 3) {
    return `Teste final de ritmo. Reduza 30% do volume na semana para correr bem.`;
  } else if (weeks === 2) {
    return `CUIDADO! Muito próximo da corrida A. Se correr, mantenha ritmo controlado (80-85% do esforço).`;
  }
  return '';
}

/**
 * Retorna descrição amigável da classificação
 */
export function getPriorityDescription(priority: 'A' | 'B' | 'C'): {
  label: string;
  description: string;
  color: string;
} {
  const descriptions = {
    A: {
      label: 'Corrida A - Objetivo Principal',
      description: 'Seu objetivo principal! Todo o plano é estruturado para você atingir o pico aqui.',
      color: 'red'
    },
    B: {
      label: 'Corrida B - Preparatória',
      description: 'Prova preparatória importante. Use como teste de ritmo e validação da estratégia.',
      color: 'yellow'
    },
    C: {
      label: 'Corrida C - Volume/Experiência',
      description: 'Corrida de volume. Use como treino longo de qualidade, sem necessidade de taper.',
      color: 'blue'
    }
  };
  
  return descriptions[priority];
}

/**
 * Gera sugestão de como encaixar a corrida no plano
 */
export function generateTrainingSuggestion(
  race: RaceToClassify,
  primaryRace: RaceToClassify
): string {
  const classification = classifySingleRace(race, primaryRace, [race, primaryRace]);
  return classification.trainingSuggest;
}
