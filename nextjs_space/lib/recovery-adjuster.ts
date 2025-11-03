/**
 * Recovery Adjuster - Sistema de ajuste de volume baseado em recuperação
 * 
 * Ajusta o volume de treino baseado em qualidade de sono, estresse e idade
 * para prevenir overtraining e otimizar adaptação.
 */

export interface RecoveryProfile {
  sleepQuality: number; // 1-5
  stressLevel: number; // 1-5
  age: number;
  currentWeeklyKm: number;
  restingHeartRate?: number;
}

export interface VolumeAdjustment {
  original: number;
  adjusted: number;
  reduction: string; // "%"
  multiplier: number;
  reasons: string[];
  recommendations: string[];
}

/**
 * Ajusta volume de treino baseado em fatores de recuperação
 */
export function adjustVolumeForRecovery(profile: RecoveryProfile): VolumeAdjustment {
  let multiplier = 1.0;
  const reasons: string[] = [];
  const recommendations: string[] = [];

  // Fator 1: Qualidade do Sono
  if (profile.sleepQuality <= 2) {
    multiplier *= 0.75; // -25%
    reasons.push('Sono inadequado (<6h/noite)');
    recommendations.push(
      'CRÍTICO: Priorizar sono de 7-9h por noite',
      'Considerar reduzir treinos intensos até regularizar sono',
      'Risco aumentado de lesões e overtraining'
    );
  } else if (profile.sleepQuality === 3) {
    multiplier *= 0.90; // -10%
    reasons.push('Sono regular (6-7h/noite)');
    recommendations.push(
      'Tentar aumentar para 7-8h de sono',
      'Recuperação está comprometida'
    );
  }

  // Fator 2: Nível de Estresse
  if (profile.stressLevel >= 4) {
    multiplier *= 0.85; // -15%
    reasons.push('Estresse alto/muito alto');
    recommendations.push(
      'Estresse crônico prejudica recuperação',
      'Considerar técnicas de relaxamento (yoga, meditação)',
      'Monitorar FC repouso (indicador de fadiga)'
    );
  } else if (profile.stressLevel === 3) {
    multiplier *= 0.95; // -5%
    reasons.push('Estresse moderado');
  }

  // Fator 3: Idade (Masters 50+)
  if (profile.age >= 60) {
    multiplier *= 0.80; // -20%
    reasons.push('Idade 60+ anos (recuperação mais lenta)');
    recommendations.push(
      'Recuperação é mais lenta após 60 anos',
      'Aumentar dias entre treinos intensos',
      'Priorizar qualidade sobre volume',
      'Incluir fortalecimento 2-3x por semana'
    );
  } else if (profile.age >= 50) {
    multiplier *= 0.90; // -10%
    reasons.push('Idade 50-59 anos (recuperação moderada)');
    recommendations.push(
      'Dar atenção especial à recuperação',
      'Incluir treinos de força regularmente'
    );
  }

  // Fator 4: FC Repouso (se disponível)
  if (profile.restingHeartRate && profile.restingHeartRate > 75) {
    multiplier *= 0.95; // -5%
    reasons.push('FC repouso elevada (possível fadiga)');
    recommendations.push(
      'FC repouso acima de 75 bpm é alta',
      'Pode indicar fadiga acumulada ou falta de condicionamento',
      'Monitorar diariamente - aumento de 5-10 bpm pode indicar overtraining'
    );
  }

  const adjusted = Math.round(profile.currentWeeklyKm * multiplier);
  const reductionPercent = Math.round((1 - multiplier) * 100);

  // Recomendações gerais se houver redução significativa
  if (multiplier < 0.85) {
    recommendations.push(
      '⚠️ Volume ajustado significativamente',
      'Focar em recuperação e sono adequado',
      'Considerar avaliar com médico/nutricionista',
      'Retomar volume gradualmente quando condições melhorarem'
    );
  }

  return {
    original: profile.currentWeeklyKm,
    adjusted,
    reduction: `${reductionPercent}%`,
    multiplier,
    reasons,
    recommendations,
  };
}

/**
 * Gera texto explicativo da redução
 */
export function generateReductionReason(profile: RecoveryProfile): string {
  const reasons: string[] = [];
  
  if (profile.sleepQuality < 3) {
    reasons.push('sono inadequado');
  }
  if (profile.stressLevel > 3) {
    reasons.push('alto estresse');
  }
  if (profile.age >= 50) {
    reasons.push('idade avançada');
  }
  
  if (reasons.length === 0) {
    return 'Sem ajustes necessários';
  }
  
  return `Reduzido devido a: ${reasons.join(', ')}`;
}

/**
 * Calcula capacidade de recuperação (0-100)
 */
export function calculateRecoveryCapacity(profile: RecoveryProfile): number {
  let capacity = 100;
  
  // Sono (30% do peso)
  const sleepScore = (profile.sleepQuality / 5) * 30;
  capacity -= (30 - sleepScore);
  
  // Estresse (25% do peso)
  const stressScore = ((6 - profile.stressLevel) / 5) * 25;
  capacity -= (25 - stressScore);
  
  // Idade (20% do peso)
  let ageScore = 20;
  if (profile.age >= 60) ageScore = 10;
  else if (profile.age >= 50) ageScore = 15;
  else if (profile.age >= 40) ageScore = 18;
  capacity -= (20 - ageScore);
  
  // FC Repouso (25% do peso)
  let hrScore = 20;
  if (profile.restingHeartRate) {
    if (profile.restingHeartRate < 50) hrScore = 25;
    else if (profile.restingHeartRate < 60) hrScore = 22;
    else if (profile.restingHeartRate < 70) hrScore = 18;
    else if (profile.restingHeartRate < 80) hrScore = 12;
    else hrScore = 5;
  }
  capacity -= (25 - hrScore);
  
  return Math.max(0, Math.min(100, Math.round(capacity)));
}

/**
 * Interpreta capacidade de recuperação
 */
export function interpretRecoveryCapacity(capacity: number): {
  level: string;
  color: string;
  message: string;
} {
  if (capacity >= 80) {
    return {
      level: 'Excelente',
      color: 'green',
      message: 'Ótima capacidade de recuperação. Pode treinar com volume completo.',
    };
  } else if (capacity >= 60) {
    return {
      level: 'Boa',
      color: 'blue',
      message: 'Boa capacidade de recuperação. Volume pode ser mantido.',
    };
  } else if (capacity >= 40) {
    return {
      level: 'Regular',
      color: 'yellow',
      message: 'Capacidade moderada. Considerar reduzir volume 10-15%.',
    };
  } else if (capacity >= 20) {
    return {
      level: 'Baixa',
      color: 'orange',
      message: 'Capacidade comprometida. Reduzir volume 20-30%.',
    };
  } else {
    return {
      level: 'Crítica',
      color: 'red',
      message: 'Recuperação muito comprometida. Reduzir volume 30-40% e priorizar descanso.',
    };
  }
}

/**
 * Sugere dias de treino por semana baseado em recuperação
 */
export function suggestTrainingDays(recoveryCapacity: number, currentDays: number): {
  suggested: number;
  change: string;
  reason: string;
} {
  if (recoveryCapacity >= 80) {
    return {
      suggested: currentDays,
      change: 'Manter',
      reason: 'Recuperação excelente permite volume atual',
    };
  } else if (recoveryCapacity >= 60) {
    return {
      suggested: currentDays,
      change: 'Manter',
      reason: 'Recuperação boa suporta volume atual',
    };
  } else if (recoveryCapacity >= 40) {
    const suggested = Math.max(3, currentDays - 1);
    return {
      suggested,
      change: currentDays > suggested ? 'Reduzir 1 dia' : 'Manter',
      reason: 'Recuperação regular sugere mais descanso',
    };
  } else {
    const suggested = Math.max(3, currentDays - 2);
    return {
      suggested,
      change: currentDays > suggested ? 'Reduzir 2 dias' : 'Reduzir',
      reason: 'Recuperação comprometida requer mais descanso',
    };
  }
}

/**
 * Analisa se atleta está em risco de overtraining
 */
export function assessOvertrainingRisk(profile: RecoveryProfile & {
  recentInjuries?: number;
  motivation?: number; // 1-5
}): {
  risk: 'baixo' | 'médio' | 'alto';
  indicators: string[];
  actions: string[];
} {
  const indicators: string[] = [];
  const actions: string[] = [];
  let riskScore = 0;

  // Indicadores de overtraining
  if (profile.sleepQuality < 3) {
    indicators.push('Sono inadequado');
    riskScore += 2;
  }
  
  if (profile.stressLevel > 3) {
    indicators.push('Estresse elevado');
    riskScore += 1;
  }
  
  if (profile.restingHeartRate && profile.restingHeartRate > 75) {
    indicators.push('FC repouso elevada');
    riskScore += 2;
  }
  
  if (profile.recentInjuries && profile.recentInjuries > 0) {
    indicators.push('Lesões recentes');
    riskScore += 2;
  }
  
  if (profile.motivation && profile.motivation < 3) {
    indicators.push('Motivação baixa');
    riskScore += 1;
  }

  // Determinar risco e ações
  if (riskScore >= 5) {
    actions.push(
      'ATENÇÃO: Alto risco de overtraining',
      'Reduzir volume imediatamente em 30-40%',
      'Tirar 3-7 dias de descanso completo',
      'Consultar profissional de saúde',
      'Avaliar nutrição e hidratação',
      'Considerar exames (hemograma, cortisol)'
    );
    return { risk: 'alto', indicators, actions };
  } else if (riskScore >= 3) {
    actions.push(
      'Risco moderado de overtraining',
      'Reduzir intensidade dos treinos',
      'Adicionar 1-2 dias de descanso',
      'Priorizar sono de 8h+',
      'Monitorar FC repouso diariamente'
    );
    return { risk: 'médio', indicators, actions };
  } else {
    actions.push(
      'Risco baixo - continuar monitorando',
      'Manter hábitos saudáveis de sono',
      'Gerenciar estresse adequadamente'
    );
    return { risk: 'baixo', indicators, actions };
  }
}
