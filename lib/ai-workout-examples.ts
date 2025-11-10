/**
 * Exemplos de Treinos Completos - v2.0.0
 * 
 * Exemplos estruturados para "few-shot learning" da IA
 * Cada exemplo mostra a estrutura COMPLETA esperada
 */

import type { WorkoutGenerationData, IntensityLevel } from './types/workout-structure';

/**
 * Exemplo 1: LONGÃO (Long Run)
 * 
 * Treino de resistência aeróbica, base do treinamento
 * Intensidade: 2/5 (Leve) | RPE: 4/10
 */
export const LONG_RUN_EXAMPLE: WorkoutGenerationData = {
  dayOfWeek: 6, // Sábado
  date: '2025-11-16',
  type: 'long_run',
  title: 'Longão Base Aeróbica',
  description: 'Corrida longa em ritmo confortável para desenvolver resistência aeróbica',
  distance: 15,
  targetPace: '6:00',
  duration: 90,
  
  warmUpStructure: {
    duration: 10,
    description: 'Aquecimento progressivo preparando o corpo para esforço prolongado',
    steps: [
      '5 minutos de caminhada rápida ou trote muito leve (zona 1)',
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
    duration: 90,
    description: '15km em ritmo confortável de conversação fácil',
    steps: [
      'Mantenha pace constante de 6:00/km durante todo o percurso',
      'Foque em boa postura: olhar no horizonte, ombros relaxados, core engajado',
      'Cadência ideal: 170-180 passos por minuto (conte por 30 segundos e multiplique por 6)',
      'Hidrate a cada 20-30 minutos (pequenos goles)',
      'Se treino >90min: consuma gel/goma energética a cada 45-60 minutos',
      'Monitore sensação: deve conseguir conversar FACILMENTE o tempo todo',
      'Últimos 2km podem ser ligeiramente mais rápidos (finish progressivo opcional)'
    ],
    intensity: 'easy',
    heartRateZone: { min: 60, max: 70 },
    pace: '6:00',
    notes: [
      'Regra de ouro: teste da conversa. Se ficou sem fôlego, está rápido demais!',
      'Não há problema em reduzir pace se sentir cansaço',
      'O objetivo é completar a distância, não bater recordes',
      'Preste atenção aos sinais do corpo: dor aguda = pare imediatamente'
    ]
  },
  
  coolDownStructure: {
    duration: 10,
    description: 'Desaquecimento e alongamento completo',
    steps: [
      '5 minutos de trote muito leve ou caminhada (baixar FC gradualmente)',
      'Alongamento estático - manter cada posição por 20-30 segundos:',
      '• Posteriores de coxa (hamstrings): perna estendida, inclinar tronco',
      '• Quadríceps: segurar pé atrás, aproximar calcanhar do glúteo',
      '• Panturrilha: perna estendida atrás, calcanhar no chão',
      '• Glúteos: levar joelho ao peito, abraçar perna',
      '• Flexores do quadril: posição de afundo, empurrar quadril para frente',
      '• Adutores: sentado, solas dos pés juntas, pressionar joelhos para baixo'
    ],
    intensity: 'very-easy',
    notes: [
      'NÃO PULE o alongamento - essencial para recuperação',
      'Hidrate imediatamente após (água ou isotônico)',
      'Alimente-se em até 30 minutos (proteína + carboidrato)'
    ]
  },
  
  objective: 'Desenvolver resistência aeróbica de base, melhorar eficiência na utilização de gordura como combustível, e preparar sistema cardiovascular para esforços prolongados. Este treino é fundamental para construir a base que suportará treinos mais intensos.',
  
  scientificBasis: 'Corridas longas em Zona 2 (60-70% FC max) maximizam adaptações mitocondriais (aumento de 20-30% em densidade mitocondrial após 8-12 semanas), aumentam densidade capilar nos músculos (melhorando entrega de oxigênio), e treinam o corpo a usar gordura eficientemente (economizando glicogênio para esforços mais intensos). Estudos mostram que 70-80% do volume de treino deve ser em Z2 para otimizar performance.',
  
  tips: [
    'Mantenha ritmo que permita conversar facilmente - teste da conversa é mais preciso que pace',
    'Foque em completar a distância, não em performance - longão é volume, não velocidade',
    'Use este treino para trabalhar aspectos técnicos: postura, cadência, respiração nasal/bucal',
    'Planeje rota com água disponível ou leve mochila/garrafa de hidratação',
    'Alimente-se 1-2h antes com carboidratos de fácil digestão (banana, torrada com mel)',
    'Vista roupas confortáveis e calçado apropriado (substitua tênis a cada 600-800km)'
  ],
  
  commonMistakes: [
    'Começar rápido demais e não conseguir completar a distância planejada',
    'Pular aquecimento e desaquecimento (aumenta risco de lesão em 40%)',
    'Não hidratar adequadamente em treinos >60 minutos',
    'Forçar pace ignorando sinais de fadiga (leva a overtraining)',
    'Fazer longão no dia seguinte a treino intenso (recuperação inadequada)'
  ],
  
  successCriteria: [
    'Completou os 15km planejados sem parar ou caminhar',
    'FC permaneceu na zona alvo (60-70% máxima) durante maior parte do treino',
    'Terminou com energia para fazer cool-down completo de 10 minutos',
    'Conseguiu conversar facilmente durante pelo menos 80% do treino',
    'Não sentiu dores agudas durante ou após o treino'
  ],
  
  intensityLevel: 2 as IntensityLevel,
  expectedRPE: 4,
  expectedDuration: 110, // 10 aquec + 90 principal + 10 desaq
  
  heartRateZones: {
    warmUp: { min: 50, max: 65 },
    main: { min: 60, max: 70 },
    coolDown: { min: 50, max: 60 }
  }
};

/**
 * Exemplo 2: INTERVALOS CURTOS (Short Intervals)
 * 
 * Treino de velocidade e VO₂max
 * Intensidade: 5/5 (Muito Intenso) | RPE: 8/10
 */
export const INTERVALS_EXAMPLE: WorkoutGenerationData = {
  dayOfWeek: 2, // Terça
  date: '2025-11-12',
  type: 'intervals',
  subtype: 'vo2max',
  title: 'Tiros de Velocidade 8x400m',
  description: 'Treino intervalado para melhorar VO₂max e velocidade pura',
  distance: 8, // 3.2km intervals + aquec + desaq ≈ 8km total
  targetPace: '4:30',
  duration: 60,
  
  warmUpStructure: {
    duration: 20,
    description: 'Aquecimento estendido essencial para treino de alta intensidade',
    steps: [
      '10 minutos de trote fácil (zona 1-2, pace ~6:30/km)',
      'Drills dinâmicos - 2 séries de cada:',
      '• High knees (joelhos altos): 2x20 metros',
      '• Butt kicks (calcanhares ao glúteo): 2x20 metros',
      '• Leg swings (balanço de perna): 10 para frente/trás cada perna',
      '• Walking lunges (afundos): 10 cada perna',
      '• Arm circles (círculos de braço): 10 para frente, 10 para trás',
      'Ativação específica:',
      '• Mini squats: 15 repetições',
      '• Glute bridges: 15 repetições',
      'Strides (acelerações progressivas):',
      '• 4 repetições de 60 metros a 90% intensidade',
      '• Caminhada de volta como recuperação entre cada'
    ],
    intensity: 'easy',
    heartRateZone: { min: 60, max: 75 },
    notes: [
      'Aquecimento mais longo é CRÍTICO para prevenir lesões',
      'Strides preparam sistema neuromuscular para alta velocidade',
      'Se sentir músculos duros, adicione mais 5 min de trote'
    ]
  },
  
  mainWorkoutStruct: {
    workInterval: {
      duration: '400m',
      pace: '4:30',
      intensity: '95-100% esforço máximo (pace de 5k ou mais rápido)',
      description: 'Cada 400m deve ser corrido em aproximadamente 1:48 (pace 4:30/km). Acelere progressivamente nos primeiros 100m, mantenha nos 200m do meio, e termine forte nos últimos 100m.'
    },
    recoveryInterval: {
      duration: '2-3 minutos',
      type: 'jog',
      pace: '7:00',
      description: '200-300 metros de trote muito suave ou caminhada. O objetivo é FC baixar para ~120-130 bpm antes do próximo interval.'
    },
    repetitions: 8,
    notes: [
      'Mantenha boa forma mesmo quando cansado: postura ereta, braços a 90°, core engajado',
      'Respiração: ritmo rápido mas controlado (2 passos inspirando, 2 expirando)',
      'Se não conseguir manter pace nas últimas 2 reps, PARE (não force lesão)',
      'Meta: última rep deve ser tão boa quanto primeira (sinal de pacing correto)'
    ],
    setStructure: '8 repetições de 400m com recuperação de 2-3 min'
  },
  
  coolDownStructure: {
    duration: 15,
    description: 'Desaquecimento estendido para facilitar recuperação',
    steps: [
      '10 minutos de trote muito leve (zona 1, pace ~7:00/km)',
      'Nos últimos 2-3 minutos, reduzir para caminhada',
      'Alongamento estático completo - 30 segundos cada:',
      '• Posteriores: sentar com pernas estendidas, alcançar pés',
      '• Quadríceps: em pé, segurar pé atrás',
      '• Panturrilha: perna estendida atrás, calcanhar no chão',
      '• Glúteos: deitado, abraçar joelho ao peito',
      '• Flexores: posição de afundo profundo',
      '• Adutores: sentado, solas dos pés juntas',
      'Foam rolling (se disponível): panturrilhas, TI band, glúteos'
    ],
    intensity: 'very-easy',
    notes: [
      'Cool-down é TÃO importante quanto aquecimento',
      'Evita acúmulo de lactato e facilita remoção de metabólitos',
      'Hidrate imediatamente: água + eletrólitos'
    ]
  },
  
  objective: 'Melhorar VO₂max (capacidade aeróbica máxima), aumentar velocidade pura, desenvolver economia de corrida, e treinar sistema neuromuscular para alta intensidade. Intervalos curtos são essenciais para performance em provas de 5k a 21k.',
  
  scientificBasis: 'Intervalos em 95-100% VO₂max estimulam adaptações cardiovasculares e neuromusculares únicas: aumento de stroke volume cardíaco (+10-15%), melhora de enzimas oxidativas musculares (+20-30%), e otimização do recrutamento de fibras tipo IIa. Pesquisas mostram que 8-12 min totais em Z5 por semana é ideal para ganhos de VO₂max sem overtraining.',
  
  tips: [
    'Use pista de atletismo se possível (superfície consistente, medição precisa)',
    'Primeiro interval: NÃO saia em sprint! Acelere progressivamente nos primeiros 100m',
    'Foque em boa técnica: aterrisagem no médio-pé, braços a 90°, olhar no horizonte',
    'Respiração: encontre ritmo (geralmente 2-2 ou 3-3 funciona)',
    'Monitore FC: deve subir para 90-95% máxima durante work intervals',
    'Se treino parece impossível, pode ser sinal de fadiga acumulada - descanse!'
  ],
  
  commonMistakes: [
    'Pular aquecimento completo (risco ALTO de lesão muscular)',
    'Sair muito rápido no primeiro interval (quebra nas últimas reps)',
    'Recuperação insuficiente entre reps (qualidade > quantidade)',
    'Forçar todas as reps mesmo quando forma deteriora (receita para lesão)',
    'Fazer intervalos com menos de 48h de treino intenso anterior'
  ],
  
  successCriteria: [
    'Completou as 8 repetições mantendo pace alvo (±5 seg/400m)',
    'Última repetição tão forte quanto primeira (pacing correto)',
    'FC subiu para zona alvo (90-95% máxima) em cada interval',
    'Manteve boa forma técnica até última rep',
    'Se recuperou adequadamente nos intervalos (FC baixou para ~65-70% máxima)'
  ],
  
  intensityLevel: 5 as IntensityLevel,
  expectedRPE: 8,
  expectedDuration: 60, // 20 aquec + 25 principal + 15 desaq
  
  heartRateZones: {
    warmUp: { min: 60, max: 75 },
    main: { min: 90, max: 95 },
    coolDown: { min: 50, max: 65 }
  },
  
  intervals: {
    workInterval: {
      duration: '400m',
      pace: '4:30',
      intensity: '95-100% VO₂max'
    },
    recoveryInterval: {
      duration: '2-3 min',
      type: 'jog',
      pace: '7:00'
    },
    repetitions: 8
  }
};

/**
 * Exemplo 3: TEMPO RUN (Threshold Run)
 * 
 * Treino de limiar de lactato
 * Intensidade: 4/5 (Intenso) | RPE: 7/10
 */
export const TEMPO_RUN_EXAMPLE: WorkoutGenerationData = {
  dayOfWeek: 4, // Quinta
  date: '2025-11-14',
  type: 'tempo',
  subtype: 'threshold',
  title: 'Tempo Run 8km - Ritmo de Limiar',
  description: 'Treino em pace de limiar de lactato (confortavelmente difícil)',
  distance: 11, // 2 aquec + 8 principal + 1 desaq
  targetPace: '5:15',
  duration: 65,
  
  warmUpStructure: {
    duration: 15,
    description: 'Aquecimento progressivo preparando para esforço sustentado',
    steps: [
      '10 minutos de trote fácil progressivo (começar 6:30/km → terminar 5:45/km)',
      'Drills dinâmicos - 1 série de cada:',
      '• High knees: 2x15 metros',
      '• Butt kicks: 2x15 metros',
      '• Leg swings: 8 cada perna',
      '• Arm swings: 10 para frente/trás',
      'Strides progressivos:',
      '• 3 acelerações de 40-60 metros',
      '• Última stride no pace do tempo run (5:15/km)'
    ],
    intensity: 'easy',
    heartRateZone: { min: 65, max: 75 },
    notes: [
      'Última stride no pace alvo "ensina" o corpo o ritmo correto',
      'Se músculos tensos, adicione 5 min de trote'
    ]
  },
  
  mainWorkoutStruct: {
    duration: 42,
    description: '8km em pace de limiar: "confortavelmente difícil" (threshold pace)',
    steps: [
      'Mantenha pace constante de 5:15/km durante todo o treino',
      'Esforço: deve ser sustentável por 40-60 minutos',
      'Teste da conversa: consegue falar frases curtas (3-5 palavras)',
      'Respiração: ritmo forte mas controlado (não ofegante)',
      'Sensação: "poderia manter por mais 20 minutos se precisasse"',
      'Monitore FC: deve estabilizar em 85-90% máxima após 5-10 min',
      'Postura: mantenha mesmo quando cansado (core engajado, ombros relaxados)'
    ],
    intensity: 'hard',
    heartRateZone: { min: 85, max: 90 },
    pace: '5:15',
    notes: [
      'NÃO comece rápido demais - primeiros km em 5:20-5:18 está OK',
      'Pace deve PARECER fácil nos primeiros 2km (sinal de pacing correto)',
      'Se ritmo deteriora muito nos últimos 2km, começou rápido',
      'Objetivo: pace o mais uniforme possível (variação <5 seg/km)'
    ]
  },
  
  coolDownStructure: {
    duration: 10,
    description: 'Desaquecimento progressivo',
    steps: [
      '10 minutos de trote fácil progressivamente mais lento',
      'Primeiros 5 min: pace ~6:30/km',
      'Últimos 5 min: pace ~7:00/km ou caminhada',
      'Alongamento estático rápido (15s cada grupo muscular principal)'
    ],
    intensity: 'very-easy',
    notes: [
      'Hidrate durante cool-down',
      'Não pare abruptamente - FC deve baixar gradualmente'
    ]
  },
  
  objective: 'Aumentar limiar de lactato (velocidade que o corpo consegue processar lactato produzido), melhorar resistência em pace de prova, e desenvolver resistência mental para esforços sustentados. Tempo runs melhoram performance em provas de 10k a maratona.',
  
  scientificBasis: 'Treinos em limiar de lactato (85-90% FC max) aumentam capacidade do corpo de processar lactato (+15-25% em 8-12 semanas), melhoram densidade mitocondrial, e otimizam metabolismo de carboidratos. Limiar de lactato é o melhor preditor de performance em distâncias de 10k a maratona.',
  
  tips: [
    'Pace deve parecer "confortavelmente difícil" - não confortável, não exaustivo',
    'Pacing é crucial: melhor começar 5-10 seg/km mais devagar',
    'Use relógio, mas confie também na percepção de esforço',
    'Terreno: prefira relativamente plano (pequenas ondulações OK)',
    'Clima: temperatura ideal 10-18°C (ajuste pace se muito quente/frio)'
  ],
  
  commonMistakes: [
    'Começar rápido demais (transformar em race, não treino)',
    'Ignorar sinais de fadiga e forçar pace deteriorado',
    'Fazer tempo run com menos de 48h de intervalo de outro intenso',
    'Não aquecer adequadamente (limiar exige preparo)',
    'Comparar pace com outros atletas (cada um tem seu limiar)'
  ],
  
  successCriteria: [
    'Completou 8km mantendo pace alvo (variação <10 seg/km)',
    'FC estabilizou em zona alvo (85-90% máxima)',
    'Esforço foi "confortavelmente difícil" durante todo treino',
    'Não precisou reduzir pace significativamente nos últimos 2km',
    'Terminou com sensação de "poderia ter feito mais 10 minutos"'
  ],
  
  intensityLevel: 4 as IntensityLevel,
  expectedRPE: 7,
  expectedDuration: 67, // 15 aquec + 42 principal + 10 desaq
  
  heartRateZones: {
    warmUp: { min: 65, max: 75 },
    main: { min: 85, max: 90 },
    coolDown: { min: 55, max: 65 }
  }
};

/**
 * Exemplo 4: REGENERATIVO (Easy Recovery Run)
 * 
 * Treino de recuperação ativa
 * Intensidade: 1/5 (Muito Leve) | RPE: 3/10
 */
export const EASY_RUN_EXAMPLE: WorkoutGenerationData = {
  dayOfWeek: 3, // Quarta
  date: '2025-11-13',
  type: 'easy',
  subtype: 'recovery',
  title: 'Corrida Regenerativa 6km',
  description: 'Corrida leve para recuperação ativa e adaptação aeróbica',
  distance: 6,
  targetPace: '6:30',
  duration: 39,
  
  warmUpStructure: {
    duration: 5,
    description: 'Aquecimento mínimo - integrado nos primeiros km',
    steps: [
      'Primeiros 5 minutos: comece MUITO devagar (7:00-7:30/km)',
      'Deixe corpo aquecer naturalmente',
      'Movimentos suaves de braços e ombros enquanto caminha/trota'
    ],
    intensity: 'very-easy',
    heartRateZone: { min: 50, max: 60 },
    notes: [
      'Regenerativo não precisa de aquecimento formal',
      'Corpo aquece durante a própria corrida'
    ]
  },
  
  mainWorkoutStruct: {
    duration: 39,
    description: '6km em ritmo MUITO confortável - prioridade é recuperação',
    steps: [
      'Pace alvo: 6:30/km (mas pode variar 6:15-7:00 conforme sensação)',
      'REGRA DE OURO: deve conseguir conversar FACILMENTE e manter conversa longa',
      'Se ficou sem fôlego = está RÁPIDO DEMAIS! Reduza o pace',
      'Respiração: predominantemente nasal (sinal de baixa intensidade)',
      'Foco: movimento suave, técnica relaxada, aproveitar a corrida',
      'Permitido caminhar se necessário - não é fracasso, é inteligência',
      'Monitore sensações: pernas devem parecer leves, não pesadas'
    ],
    intensity: 'very-easy',
    heartRateZone: { min: 60, max: 70 },
    pace: '6:30',
    notes: [
      'Objetivo NÃO é treinar, é RECUPERAR ativamente',
      'Corrida regenerativa é tão importante quanto descanso total',
      'Se ontem foi treino intenso e pernas pesadas, OK reduzir para 4-5km',
      'Use este treino para trabalhar detalhes técnicos sem pressão'
    ]
  },
  
  coolDownStructure: {
    duration: 5,
    description: 'Desaquecimento integrado',
    steps: [
      'Últimos 5 minutos: reduzir pace gradualmente',
      'Terminar em caminhada leve (2-3 min)',
      'Alongamento muito leve (opcional): foco em áreas tensas'
    ],
    intensity: 'very-easy',
    notes: [
      'Menos estrutura que outros treinos - mantenha leveza',
      'Hidrate normalmente'
    ]
  },
  
  objective: 'Promover recuperação ativa após treinos intensos, manter volume de treino sem adicionar estresse, desenvolver adaptações aeróbicas de base, e manter hábito de correr. Regenerativos são fundamentais para evitar overtraining.',
  
  scientificBasis: 'Corridas leves em Z1-Z2 (60-70% FC max) aumentam fluxo sanguíneo para músculos (acelerando remoção de metabólitos e entrega de nutrientes), mantêm adaptações mitocondriais sem adicionar fadiga, e estimulam recuperação neuromuscular. Estudos mostram que recuperação ativa é 40% mais efetiva que descanso total.',
  
  tips: [
    'Se em dúvida, corra MAIS DEVAGAR - impossível ser "devagar demais"',
    'Teste da conversa é LEI: se não consegue conversar facilmente, reduza pace',
    'Não compare com pace de treinos anteriores - cada dia é único',
    'Use regenerativo para explorar novas rotas, apreciar paisagem',
    'Ouça música relaxante ou podcast - mantenha leveza mental também'
  ],
  
  commonMistakes: [
    'Transformar regenerativo em treino "moderado" (ego não deixa ir devagar)',
    'Comparar com outros corredores e acelerar (cada um tem seu ritmo)',
    'Pular regenerativos achando que "não contam" (são essenciais!)',
    'Fazer regenerativo no dia após descanso total (deveria ser após intenso)',
    'Ignorar sinais de fadiga excessiva (às vezes descanso total é melhor)'
  ],
  
  successCriteria: [
    'Completou a distância se sentindo MELHOR do que no início',
    'Conseguiu conversar facilmente durante todo o treino (teste real)',
    'FC permaneceu abaixo de 70% máxima',
    'Pernas terminaram leves, não pesadas ou cansadas',
    'Sensação geral: revigorado e pronto para próximo treino'
  ],
  
  intensityLevel: 1 as IntensityLevel,
  expectedRPE: 3,
  expectedDuration: 49, // 5 aquec + 39 principal + 5 desaq
  
  heartRateZones: {
    warmUp: { min: 50, max: 60 },
    main: { min: 60, max: 70 },
    coolDown: { min: 50, max: 60 }
  }
};

/**
 * Array com todos os exemplos para fácil acesso
 */
export const WORKOUT_EXAMPLES = {
  longRun: LONG_RUN_EXAMPLE,
  intervals: INTERVALS_EXAMPLE,
  tempoRun: TEMPO_RUN_EXAMPLE,
  easyRun: EASY_RUN_EXAMPLE
} as const;

/**
 * Função helper para obter exemplo por tipo
 */
export function getWorkoutExample(type: string): WorkoutGenerationData | null {
  switch (type.toLowerCase()) {
    case 'long_run':
    case 'longrun':
    case 'long':
      return LONG_RUN_EXAMPLE;
    
    case 'intervals':
    case 'interval':
    case 'speed':
      return INTERVALS_EXAMPLE;
    
    case 'tempo':
    case 'threshold':
    case 'tempo_run':
      return TEMPO_RUN_EXAMPLE;
    
    case 'easy':
    case 'recovery':
    case 'regenerativo':
      return EASY_RUN_EXAMPLE;
    
    default:
      return null;
  }
}
