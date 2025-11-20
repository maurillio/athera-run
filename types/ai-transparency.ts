/**
 * AI TRANSPARENCY SYSTEM v2.7.0
 * Tipos e interfaces para o sistema de transparência da IA
 */

export type FieldImportance = 'critical' | 'high' | 'medium' | 'low';
export type FieldStatus = 'used' | 'not-used' | 'missing' | 'conflicting';

export interface AIFieldInfo {
  field: string;
  label: string;
  value: any;
  status: FieldStatus;
  importance: FieldImportance;
  impact: string; // O que este campo afeta no plano
  howUsed?: string; // Como é usado pela IA
  reason?: string; // Por que não foi usado (se aplicável)
  conflictsWith?: string; // Campo com o qual conflita (se aplicável)
  suggestion?: string; // Sugestão de correção
}

export interface AIPlanAnalysis {
  planId?: string;
  userId: string;
  generatedAt: Date;
  
  fieldsUsed: AIFieldInfo[];
  fieldsNotUsed: AIFieldInfo[];
  fieldsConflicting: AIFieldInfo[];
  fieldsMissing: AIFieldInfo[];
  
  completenessScore: number; // 0-100
  
  aiReasoning: {
    vdotCalculation?: string;
    volumeDecision?: string;
    intensityDistribution?: string;
    weeklyStructure?: string;
    progressionStrategy?: string;
    injuries?: string;
    availability?: string;
    experience?: string;
  };
  
  recommendations: string[];
}

export interface AIFieldConfig {
  field: string;
  label: string;
  importance: FieldImportance;
  impact: string;
  howUsed: string;
  requiredFor?: string[]; // Quais features precisam deste campo
  category: 'basic' | 'performance' | 'health' | 'goals' | 'availability' | 'advanced';
}

// Configuração de todos os campos que a IA usa
export const AI_FIELD_CONFIGS: AIFieldConfig[] = [
  // BASIC DATA (Step 1)
  {
    field: 'weight',
    label: 'Peso',
    importance: 'high',
    impact: 'Cálculo de zonas de FC e ritmo recomendado',
    howUsed: 'Usado no cálculo do VDOT e ajuste de intensidade baseado em peso corporal',
    category: 'basic'
  },
  {
    field: 'height',
    label: 'Altura',
    importance: 'medium',
    impact: 'Análise biomecânica e estimativa de passada',
    howUsed: 'Usado para estimar comprimento de passada ideal e postura',
    category: 'basic'
  },
  {
    field: 'age',
    label: 'Idade',
    importance: 'critical',
    impact: 'FC máxima teórica e capacidade de recuperação',
    howUsed: 'Calcula FC máxima (220 - idade) e ajusta volume/intensidade por faixa etária',
    category: 'basic'
  },
  {
    field: 'gender',
    label: 'Gênero',
    importance: 'high',
    impact: 'Ajustes hormonais e biomecânicos',
    howUsed: 'Considera diferenças fisiológicas e pode ajustar treino por ciclo menstrual',
    category: 'basic'
  },
  
  // SPORT BACKGROUND (Step 2)
  {
    field: 'runningLevel',
    label: 'Nível de Experiência',
    importance: 'critical',
    impact: 'Estrutura base do plano e progressão',
    howUsed: 'Define complexidade dos treinos, volume inicial e taxa de progressão',
    requiredFor: ['plan-generation'],
    category: 'performance'
  },
  {
    field: 'currentWeeklyKm',
    label: 'Quilometragem Semanal Atual',
    importance: 'critical',
    impact: 'Volume inicial do plano',
    howUsed: 'Ponto de partida para progressão segura (regra dos 10%)',
    requiredFor: ['plan-generation'],
    category: 'performance'
  },
  {
    field: 'longestRun',
    label: 'Maior Corrida Recente',
    importance: 'high',
    impact: 'Distância do longão inicial',
    howUsed: 'Define o ponto de partida dos longões e progressão de distância',
    category: 'performance'
  },
  {
    field: 'yearsRunning',
    label: 'Anos de Experiência',
    importance: 'medium',
    impact: 'Adaptação neuromuscular e resiliência',
    howUsed: 'Influencia velocidade de progressão e complexidade de treinos',
    category: 'performance'
  },
  
  // PERFORMANCE (Step 3)
  {
    field: 'bestTimes',
    label: 'Melhores Tempos',
    importance: 'critical',
    impact: 'Cálculo do VDOT e ritmos de treino',
    howUsed: 'Calcula VDOT atual e define zonas de treino personalizadas',
    requiredFor: ['vdot-calculation', 'pace-zones'],
    category: 'performance'
  },
  
  // HEALTH (Step 4)
  {
    field: 'restingHeartRate',
    label: 'FC em Repouso',
    importance: 'high',
    impact: 'Zonas de FC e condicionamento cardiovascular',
    howUsed: 'Calcula zonas de FC usando fórmula de Karvonen',
    requiredFor: ['heart-rate-zones'],
    category: 'health'
  },
  {
    field: 'injuries',
    label: 'Histórico de Lesões',
    importance: 'high',
    impact: 'Prevenção e ajuste de volume',
    howUsed: 'Reduz ritmo de progressão e inclui treinos preventivos',
    category: 'health'
  },
  {
    field: 'currentlyInjured',
    label: 'Lesionado Atualmente',
    importance: 'critical',
    impact: 'Modificação completa do plano',
    howUsed: 'Adapta treinos para reabilitação e recuperação',
    category: 'health'
  },
  {
    field: 'sleepQuality',
    label: 'Qualidade do Sono',
    importance: 'medium',
    impact: 'Capacidade de recuperação',
    howUsed: 'Ajusta volume e intensidade baseado na recuperação',
    category: 'health'
  },
  {
    field: 'avgSleepHours',
    label: 'Horas de Sono',
    importance: 'medium',
    impact: 'Recuperação e adaptação',
    howUsed: 'Considera na programação de treinos intensos',
    category: 'health'
  },
  {
    field: 'stressLevel',
    label: 'Nível de Estresse',
    importance: 'medium',
    impact: 'Carga de treino total',
    howUsed: 'Alto estresse = menos volume/intensidade',
    category: 'health'
  },
  {
    field: 'tracksMenstrualCycle',
    label: 'Ciclo Menstrual',
    importance: 'medium',
    impact: 'Otimização por fase hormonal',
    howUsed: 'Ajusta intensidade por fase do ciclo (folicular/lútea)',
    category: 'health'
  },
  
  // GOALS (Step 5)
  {
    field: 'goalDistance',
    label: 'Distância Meta',
    importance: 'critical',
    impact: 'Estrutura completa do plano',
    howUsed: 'Define tipo de treinos, volume total e pico de distância',
    requiredFor: ['plan-generation'],
    category: 'goals'
  },
  {
    field: 'targetRaceDate',
    label: 'Data da Prova',
    importance: 'critical',
    impact: 'Duração e periodização',
    howUsed: 'Calcula número de semanas e distribui fases de treino',
    requiredFor: ['plan-generation'],
    category: 'goals'
  },
  {
    field: 'targetTime',
    label: 'Tempo Objetivo',
    importance: 'high',
    impact: 'Ritmos de treino específicos',
    howUsed: 'Define ritmo de prova e calcula ritmos de treino',
    category: 'goals'
  },
  
  // AVAILABILITY (Step 6)
  {
    field: 'trainingSchedule',
    label: 'Dias Disponíveis',
    importance: 'critical',
    impact: 'Distribuição semanal de treinos',
    howUsed: 'Aloca treinos nos dias disponíveis e define estrutura semanal',
    requiredFor: ['plan-generation'],
    category: 'availability'
  },
  {
    field: 'longRunDay',
    label: 'Dia do Longão',
    importance: 'high',
    impact: 'Distribuição de carga semanal',
    howUsed: 'Fixa o longão no dia escolhido e organiza outros treinos',
    category: 'availability'
  },
  {
    field: 'hasGymAccess',
    label: 'Acesso à Academia',
    importance: 'low',
    impact: 'Treinos complementares',
    howUsed: 'Inclui treinos de força e condicionamento',
    category: 'availability'
  },
  {
    field: 'hasTrackAccess',
    label: 'Acesso à Pista',
    importance: 'low',
    impact: 'Qualidade dos treinos intervalados',
    howUsed: 'Recomenda treinos intervalados na pista',
    category: 'availability'
  },
  
  // ADVANCED (Strava)
  {
    field: 'stravaStats',
    label: 'Estatísticas Strava',
    importance: 'medium',
    impact: 'Validação de dados e ajustes',
    howUsed: 'Valida informações fornecidas e ajusta baseado em histórico real',
    category: 'advanced'
  },
];
