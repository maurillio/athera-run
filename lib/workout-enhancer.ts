/**
 * Workout Enhancer v2.0.0
 * 
 * Enriquece treinos básicos com estrutura detalhada em 3 fases
 * e conteúdo educacional baseado em best practices internacionais
 */

import type { WorkoutPhase, IntervalStructure } from './types/workout-structure';

interface BasicWorkout {
  type: string;
  subtype?: string;
  distance?: number;
  targetPace?: string;
  warmup?: string | null;
  mainSet?: string;
  cooldown?: string | null;
}

interface EnhancedWorkoutFields {
  warmUpStructure?: WorkoutPhase;
  mainWorkoutStruct?: WorkoutPhase | IntervalStructure;
  coolDownStructure?: WorkoutPhase;
  objective?: string;
  scientificBasis?: string;
  tips?: string[];
  commonMistakes?: string[];
  successCriteria?: string[];
  intensityLevel?: number;
  expectedRPE?: number;
  expectedDuration?: number;
  heartRateZones?: any;
  intervals?: IntervalStructure;
}

/**
 * Enriquece um treino básico com estrutura v2.0.0
 */
export function enhanceWorkout(workout: BasicWorkout, paces: any): BasicWorkout & EnhancedWorkoutFields {
  const type = workout.subtype || workout.type;
  
  switch (type) {
    case 'long':
      return enhanceLongRun(workout, paces);
    case 'intervals':
      return enhanceIntervals(workout, paces);
    case 'tempo':
      return enhanceTempoRun(workout, paces);
    case 'easy':
      return enhanceEasyRun(workout, paces);
    default:
      return workout;
  }
}

/**
 * LONGÃO - Estrutura completa
 */
function enhanceLongRun(workout: BasicWorkout, paces: any): BasicWorkout & EnhancedWorkoutFields {
  const distance = workout.distance || 15;
  const pace = workout.targetPace || paces.easy;
  
  // Proteção: se pace não existir ou não tiver o formato correto
  let duration = 60; // default 60 min
  if (pace && typeof pace === 'string' && pace.includes(':')) {
    const [minStr, secStr] = pace.split(':');
    const min = parseFloat(minStr) || 0;
    const sec = parseFloat(secStr) || 0;
    duration = Math.round((distance / (1 / min * 60 + sec)) * 60);
  }
  
  return {
    ...workout,
    
    warmUpStructure: {
      duration: 10,
      description: 'Aquecimento progressivo preparando o corpo para esforço prolongado',
      steps: [
        '5 minutos de caminhada rápida ou trote muito leve',
        'Alongamento dinâmico: 10 leg swings cada perna, 10 high knees, 10 butt kicks',
        '2 acelerações progressivas de 40 metros (60% → 85% intensidade)',
        'Movimento circular de braços e rotação de tronco'
      ],
      intensity: 'very-easy',
      heartRateZone: { min: 50, max: 65 },
      notes: [
        'Comece devagar, sem pressa',
        'O objetivo é preparar músculos e articulações',
        'Se sentir frio, adicione mais 2-3 minutos de trote'
      ]
    },
    
    mainWorkoutStruct: {
      duration,
      description: `${distance}km em ritmo confortável de conversação fácil`,
      steps: [
        `Mantenha pace constante de ${pace} durante todo o percurso`,
        'Foque em boa postura: olhar no horizonte, ombros relaxados, core engajado',
        'Cadência ideal: 170-180 passos por minuto',
        'Hidrate a cada 20-30 minutos',
        distance > 15 ? 'Se treino >90min: gel/goma a cada 45-60 min' : 'Mantenha hidratação regular'
      ],
      intensity: 'easy',
      heartRateZone: { min: 60, max: 75 },
      pace,
      notes: [
        'Deve conseguir conversar facilmente durante todo o treino',
        'Últimos 2km podem ser ligeiramente mais rápidos (progressivo)',
        'Se sentir muito cansado, reduza pace ao invés de parar'
      ]
    },
    
    coolDownStructure: {
      duration: 10,
      description: 'Desaquecimento e alongamento completo',
      steps: [
        '5 minutos de trote muito leve ou caminhada',
        'Alongamento estático (20-30s cada):',
        '• Posteriores de coxa (hamstrings)',
        '• Quadríceps',
        '• Panturrilha',
        '• Glúteos',
        '• Flexores do quadril'
      ],
      intensity: 'very-easy',
      notes: [
        'Não pule o alongamento',
        'Hidrate e alimente-se logo após'
      ]
    },
    
    objective: 'Desenvolver resistência aeróbica base, melhorar eficiência na utilização de gordura como combustível e preparar sistema cardiovascular para esforços prolongados',
    
    scientificBasis: 'Corridas longas em Z2 (60-75% FC max) maximizam adaptações mitocondriais, aumentam densidade capilar e treinam o corpo a usar gordura eficientemente, economizando glicogênio para esforços mais intensos.',
    
    tips: [
      'Mantenha ritmo que permita conversar facilmente - se ficou sem fôlego, está rápido demais',
      'Foque em completar a distância, não em bater recordes de pace',
      'Use este treino para trabalhar aspectos técnicos: postura, cadência, respiração',
      'Planeje rota com água disponível ou leve garrafa/mochila de hidratação',
      'Alimente-se 1-2h antes com carboidratos de fácil digestão'
    ],
    
    commonMistakes: [
      'Começar rápido demais e não conseguir completar a distância',
      'Pular aquecimento e desaquecimento',
      'Não hidratar adequadamente em treinos longos (>60 min)',
      'Ignorar sinais de fadiga excessiva'
    ],
    
    successCriteria: [
      'Completou a distância planejada sem parar',
      'FC permaneceu na zona alvo (60-75% máxima)',
      'Terminou com energia para fazer cool-down completo',
      'Conseguiu conversar facilmente durante maior parte do treino'
    ],
    
    intensityLevel: 2,
    expectedRPE: 4,
    expectedDuration: duration + 20, // incluindo warm-up e cool-down
    
    heartRateZones: {
      warmup: { min: 50, max: 65 },
      main: { min: 60, max: 75 },
      cooldown: { min: 50, max: 60 }
    }
  };
}

/**
 * INTERVALOS - Estrutura completa
 */
function enhanceIntervals(workout: BasicWorkout, paces: any): BasicWorkout & EnhancedWorkoutFields {
  const pace = workout.targetPace || paces.interval;
  const reps = 8;
  const workDistance = 400; // metros
  const recoveryTime = 2; // minutos
  
  return {
    ...workout,
    
    warmUpStructure: {
      duration: 20,
      description: 'Aquecimento estendido preparando para esforço intenso',
      steps: [
        '10 minutos de trote leve em pace confortável',
        'Drills dinâmicos (2 min): leg swings, high knees, butt kicks, lunges',
        'Alongamento dinâmico focado em posteriores e quadríceps',
        '4 acelerações progressivas de 60 metros (70% → 95% intensidade)',
        '2-3 minutos de trote recuperativo antes de iniciar série'
      ],
      intensity: 'easy',
      heartRateZone: { min: 60, max: 70 },
      notes: [
        'Aquecimento é CRÍTICO para treinos de velocidade',
        'Não pule as acelerações - preparam corpo para intensidade',
        'Se sentir músculos tensos, alongue mais antes de começar'
      ]
    },
    
    mainWorkoutStruct: {
      duration: 30,
      description: `${reps}x${workDistance}m em ritmo intenso com recuperação ativa`,
      steps: [
        `Execute ${reps} repetições de ${workDistance}m em pace de ${pace}`,
        `Recuperação: ${recoveryTime} min de trote suave ou caminhada entre cada repetição`,
        'Foque em manter boa forma técnica em todas as repetições',
        'Controle respiração: 2 passos inspira, 2 passos expira',
        'Última repetição deve ser tão boa quanto a primeira'
      ],
      intensity: 'very-hard',
      heartRateZone: { min: 85, max: 95 },
      pace,
      notes: [
        'Se não conseguir manter pace, reduza número de repetições',
        'Qualidade > Quantidade - melhor fazer 6 reps perfeitas que 8 ruins',
        'Monitore forma: se começar a "quebrar", pare'
      ]
    },
    
    coolDownStructure: {
      duration: 15,
      description: 'Desaquecimento ativo para remoção de lactato',
      steps: [
        '10 minutos de trote MUITO leve',
        'Caminhada de 2-3 minutos',
        'Alongamento estático completo (30s cada grupo muscular)',
        'Foco em posteriores, quadríceps e panturrilhas'
      ],
      intensity: 'very-easy',
      notes: [
        'Desaquecimento ativo ajuda a remover lactato',
        'Não pare abruptamente após treino intenso'
      ]
    },
    
    objective: 'Aumentar VO₂max, melhorar velocidade máxima aeróbica e desenvolver economia de corrida através de estímulos de alta intensidade',
    
    scientificBasis: 'Intervalos em Z4-Z5 (85-95% FC max) melhoram VO₂max ao forçar adaptações cardiovasculares e musculares. Treinos de velocidade aumentam eficiência neuromuscular e economia de corrida.',
    
    tips: [
      'Primeira repetição deve ser controlada - não comece explodindo',
      'Recuperação COMPLETA entre séries - respeite os tempos',
      'Mantenha cadência alta (180+ passos/min) durante work intervals',
      'Hidrate bem antes do treino e entre as séries se necessário',
      'Faça este treino em pista ou terreno plano e firme'
    ],
    
    commonMistakes: [
      'Começar muito rápido e "morrer" nas últimas repetições',
      'Recuperação insuficiente entre séries',
      'Pular aquecimento adequado (risco de lesão)',
      'Fazer intervalos quando excessivamente fatigado'
    ],
    
    successCriteria: [
      'Completou todas as repetições no pace alvo (±5s/km)',
      'Manteve boa forma técnica até o final',
      'Última repetição foi similar à primeira em qualidade',
      'FC retornou a <120 bpm durante recuperações'
    ],
    
    intensityLevel: 5,
    expectedRPE: 8,
    expectedDuration: 65, // warm-up + main + cool-down
    
    intervals: {
      workInterval: {
        duration: `${workDistance}m`,
        pace,
        intensity: 'very-hard'
      },
      recoveryInterval: {
        duration: `${recoveryTime} min`,
        type: 'jog',
        pace: paces.easy
      },
      repetitions: reps,
      notes: [
        'Foque em manter pace consistente em todas as reps',
        'Recuperação deve ser ativa (trote leve ou caminhada)'
      ]
    },
    
    heartRateZones: {
      warmup: { min: 60, max: 70 },
      main: { min: 85, max: 95 },
      cooldown: { min: 50, max: 65 }
    }
  };
}

/**
 * TEMPO RUN - Estrutura completa
 */
function enhanceTempoRun(workout: BasicWorkout, paces: any): BasicWorkout & EnhancedWorkoutFields {
  const distance = workout.distance || 8;
  const pace = workout.targetPace || paces.threshold;
  const tempoDuration = pace && typeof pace === 'string' 
    ? Math.round(distance * parseFloat(pace.replace(':', '.')))
    : Math.round(distance * 6); // fallback: ~6 min/km
  
  return {
    ...workout,
    
    warmUpStructure: {
      duration: 15,
      description: 'Aquecimento progressivo para treino de limiar',
      steps: [
        '10 minutos de trote fácil, progressivo',
        'Drills dinâmicos leves (90 segundos)',
        '3 acelerações de 50 metros em ritmo de treino',
        '2 minutos de trote recuperativo'
      ],
      intensity: 'easy',
      heartRateZone: { min: 60, max: 70 },
      notes: [
        'Últimas acelerações devem estar no pace do tempo run',
        'Corpo deve estar aquecido mas não fatigado'
      ]
    },
    
    mainWorkoutStruct: {
      duration: tempoDuration,
      description: `${distance}km em pace de limiar - ritmo "confortavelmente difícil"`,
      steps: [
        `Mantenha pace constante de ${pace} durante ${distance}km`,
        'Ritmo: consegue falar frases curtas mas não conversar fluentemente',
        'Esforço: poderia manter por 60 minutos (mas não 90)',
        'Respiração controlada mas trabalhada - ritmo 3:3 ou 2:2',
        'Foque em relaxar ombros e manter boa postura'
      ],
      intensity: 'hard',
      heartRateZone: { min: 80, max: 90 },
      pace,
      notes: [
        'NÃO comece rápido demais - pace deve ser CONSTANTE',
        'Se não conseguir manter, reduza 10-15s/km',
        'Mental é chave: foque em manter ritmo, não em acelerar'
      ]
    },
    
    coolDownStructure: {
      duration: 10,
      description: 'Desaquecimento ativo',
      steps: [
        '10 minutos de trote muito leve',
        'Alongamento focado em posteriores e quadríceps',
        'Hidratação e nutrição pós-treino'
      ],
      intensity: 'very-easy',
      notes: [
        'Deixe FC baixar naturalmente durante o trote',
        'Alimente-se dentro de 30 minutos'
      ]
    },
    
    objective: 'Melhorar limiar de lactato (pace que pode sustentar por 60 min) e desenvolver resistência em ritmo de corrida, preparando para manter velocidade na prova',
    
    scientificBasis: 'Treinos de limiar (threshold) melhoram a capacidade do corpo de processar e remover lactato, permitindo sustentar paces mais rápidos por mais tempo. Trabalha Z3-Z4 (80-90% FC max).',
    
    tips: [
      'Teste do "talk test": deve conseguir falar frases de 5-6 palavras',
      'Este é o ritmo da sua meia-maratona (aproximadamente)',
      'Mantenha cadência de 170-180 passos/min',
      'Prefira terreno plano para manter pace constante',
      'Foque em relaxar - esforço deve ser controlado, não explosivo'
    ],
    
    commonMistakes: [
      'Começar muito rápido e não conseguir manter',
      'Transformar em corrida de intervalo (pace inconstante)',
      'Fazer muito frequentemente (1x/semana é suficiente)',
      'Ignorar aquecimento adequado'
    ],
    
    successCriteria: [
      'Manteve pace target com variação <10s/km',
      'FC permaneceu em Z3-Z4 (80-90% max)',
      'Conseguiu completar a distância no ritmo planejado',
      'Terminou cansado mas não completamente exausto'
    ],
    
    intensityLevel: 4,
    expectedRPE: 7,
    expectedDuration: tempoDuration + 25,
    
    heartRateZones: {
      warmup: { min: 60, max: 70 },
      main: { min: 80, max: 90 },
      cooldown: { min: 50, max: 65 }
    }
  };
}

/**
 * CORRIDA FÁCIL/REGENERATIVA - Estrutura completa
 */
function enhanceEasyRun(workout: BasicWorkout, paces: any): BasicWorkout & EnhancedWorkoutFields {
  const distance = workout.distance || 6;
  const pace = workout.targetPace || paces.easy;
  const duration = pace && typeof pace === 'string' 
    ? Math.round(distance * parseFloat(pace.replace(':', '.')))
    : Math.round(distance * 6); // fallback: ~6 min/km
  
  return {
    ...workout,
    
    warmUpStructure: {
      duration: 5,
      description: 'Aquecimento leve - primeiros minutos progressivos',
      steps: [
        'Primeiros 2-3 minutos MUITO devagar',
        'Aumente pace gradualmente até ritmo de treino',
        'Movimento de braços e ombros durante os primeiros minutos'
      ],
      intensity: 'very-easy',
      heartRateZone: { min: 50, max: 60 },
      notes: [
        'Aquecimento é integrado ao próprio treino',
        'Sem pressa - deixe corpo acordar naturalmente'
      ]
    },
    
    mainWorkoutStruct: {
      duration,
      description: `${distance}km em ritmo MUITO confortável - recuperação ativa`,
      steps: [
        `Mantenha pace de ${pace} ou MAIS LENTO`,
        'Regra de ouro: deve conseguir conversar fluentemente',
        'Se ficou sem fôlego = MUITO RÁPIDO - reduza pace',
        'Foque em técnica e movimento eficiente',
        'Aproveite para observar postura e cadência'
      ],
      intensity: 'easy',
      heartRateZone: { min: 60, max: 70 },
      pace,
      notes: [
        'Objetivo é RECUPERAÇÃO, não performance',
        'Mais devagar é SEMPRE melhor que rápido demais',
        'Este treino constrói base aeróbica sem estresse'
      ]
    },
    
    coolDownStructure: {
      duration: 5,
      description: 'Últimos minutos ainda mais leves',
      steps: [
        'Últimos 2-3 minutos reduzindo pace gradualmente',
        'Alongamento leve e opcional',
        'Hidratação'
      ],
      intensity: 'very-easy',
      notes: [
        'Termine sentindo-se bem, não cansado',
        'Você deve terminar com MAIS energia que começou'
      ]
    },
    
    objective: 'Recuperação ativa, manutenção de base aeróbica e adaptação de tecidos conectivos sem gerar fadiga adicional',
    
    scientificBasis: 'Corridas em Z1-Z2 (60-70% FC max) promovem recuperação ativa mantendo fluxo sanguíneo, desenvolvem base aeróbica e fortalecem tendões/ligamentos com baixo estresse.',
    
    tips: [
      'Se tem dúvida se está devagar o suficiente, diminua mais',
      'Use para trabalhar aspectos técnicos: postura, cadência, respiração',
      'Este treino NUNCA deve deixá-lo cansado',
      'Perfeito para dia seguinte a treinos intensos',
      'Ouça seu corpo - se estiver muito cansado, caminhe parte do percurso'
    ],
    
    commonMistakes: [
      'Correr rápido demais - ego não deixa correr devagar',
      'Tentar "compensar" dia perdido correndo mais rápido',
      'Pular este treino achando que é "perda de tempo"',
      'Não respeitar sinais de fadiga'
    ],
    
    successCriteria: [
      'Terminou se sentindo BEM, não cansado',
      'Conseguiu conversar facilmente durante TODO o treino',
      'FC permaneceu em Z1-Z2 (60-70% max)',
      'Sentiu que poderia fazer mais (e não fez!)'
    ],
    
    intensityLevel: 1,
    expectedRPE: 3,
    expectedDuration: duration + 10,
    
    heartRateZones: {
      warmup: { min: 50, max: 60 },
      main: { min: 60, max: 70 },
      cooldown: { min: 50, max: 60 }
    }
  };
}
