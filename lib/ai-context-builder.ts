/**
 * AI Context Builder - Constrói contexto completo para geração de planos pela IA
 * 
 * Integra TODOS os dados do atleta em um prompt estruturado e científico
 */

import { 
  calculateAllPaces, 
  interpretVDOT, 
  interpretRestingHR, 
  estimateMaxHR, 
  calculateIMC, 
  interpretIMC,
  calculateHRZones 
} from './vdot-calculator';
import { 
  analyzeInjuryHistory, 
  interpretSleep, 
  interpretStress 
} from './injury-analyzer';
import { 
  adjustVolumeForRecovery, 
  calculateRecoveryCapacity, 
  interpretRecoveryCapacity,
  assessOvertrainingRisk 
} from './recovery-adjuster';

export interface ComprehensiveProfile {
  // Básicos
  age: number;
  gender: string;
  weight: number;
  height: number;
  
  // Fisiologia
  restingHeartRate?: number;
  maxHeartRate?: number;
  sleepQuality?: number;
  stressLevel?: number;
  
  // Experiência
  runningYears?: number;
  runningLevel: string;
  currentWeeklyKm: number;
  longestRun: number;
  otherSportsExperience?: string;
  
  // Performance
  currentVDOT?: number;
  bestTimes?: Record<string, any>;
  lastVDOTUpdate?: Date;
  
  // Lesões e Saúde
  injuryDetails?: any[];
  injuryRecoveryStatus?: string;
  lastInjuryDate?: Date;
  medicalConditions?: string;
  medications?: string;
  
  // Objetivos
  goalType?: string; // 'race' | 'start' | 'fitness'
  isOpenGoal?: boolean; // Se é objetivo aberto (sem corrida específica)
  goalDistance: string;
  targetRaceDate: Date;
  targetTime?: string;
  raceGoals?: any[];
  
  // Infraestrutura
  hasGymAccess?: boolean;
  hasPoolAccess?: boolean;
  hasTrackAccess?: boolean;
  
  // Disponibilidade e Preferências (Nova estrutura v1.3.0)
  trainingSchedule?: Record<number, { running: boolean; activities: string[] }>;
  customActivities?: string[];
  trainingPreferences?: {
    solo?: boolean;
    group?: boolean;
    indoor?: boolean;
    outdoor?: boolean;
  };
  motivationFactors?: any;
  longRunDay?: number;
  
  // v2.5.0: Novos campos para personalização avançada
  hasRunBefore?: boolean;          // Detecta iniciante absoluto
  currentlyInjured?: boolean;      // Flag lesão ativa
  avgSleepHours?: number;          // Horas de sono (recovery)
  tracksMenstrualCycle?: boolean;  // Mulheres (opcional)
  avgCycleLength?: number;         // Duração ciclo menstrual
  lastPeriodDate?: Date;           // Data última menstruação
  workDemand?: string;             // 'sedentary' | 'moderate' | 'physical'
  familyDemand?: string;           // 'low' | 'moderate' | 'high'
  
  // Contexto de execução
  recentWorkoutCompletion?: any;
}

/**
 * Constrói contexto completo para a IA
 */
export function buildComprehensiveContext(profile: ComprehensiveProfile): string {
  let context = '';

  // ═══════════════════════════════════════
  // 1. PERFIL FISIOLÓGICO
  // ═══════════════════════════════════════
  
  context += `═══════════════════════════════════════\n`;
  context += `1. PERFIL FISIOLÓGICO\n`;
  context += `═══════════════════════════════════════\n\n`;
  
  context += `Idade: ${profile.age} anos\n`;
  context += `Gênero: ${profile.gender === 'male' ? 'Masculino' : 'Feminino'}\n`;
  context += `Peso: ${profile.weight} kg\n`;
  context += `Altura: ${profile.height} cm\n`;
  
  const imc = calculateIMC(profile.weight, profile.height);
  context += `IMC: ${imc} (${interpretIMC(imc)})\n\n`;
  
  if (profile.restingHeartRate) {
    context += `FC Repouso: ${profile.restingHeartRate} bpm\n`;
    context += `Interpretação: ${interpretRestingHR(profile.restingHeartRate)}\n\n`;
    
    const maxHR = profile.maxHeartRate || estimateMaxHR(profile.age);
    context += `FC Máxima: ${maxHR} bpm ${!profile.maxHeartRate ? '(estimada)' : ''}\n`;
    
    const hrZones = calculateHRZones(maxHR, profile.restingHeartRate);
    context += `\nZonas de FC (Karvonen):\n`;
    context += `  Zona 1 (Recuperação): ${hrZones.zone1.min}-${hrZones.zone1.max} bpm\n`;
    context += `  Zona 2 (Base Aeróbica): ${hrZones.zone2.min}-${hrZones.zone2.max} bpm\n`;
    context += `  Zona 3 (Moderado): ${hrZones.zone3.min}-${hrZones.zone3.max} bpm\n`;
    context += `  Zona 4 (Limiar): ${hrZones.zone4.min}-${hrZones.zone4.max} bpm\n`;
    context += `  Zona 5 (VO2max): ${hrZones.zone5.min}-${hrZones.zone5.max} bpm\n\n`;
  }
  
  if (profile.restingHeartRate && profile.restingHeartRate < 55) {
    context += `✅ EXCELENTE base aeróbica indicada pela FC repouso baixa\n`;
    context += `   Atleta adaptado ao treino aeróbico\n\n`;
  } else if (profile.restingHeartRate && profile.restingHeartRate < 65) {
    context += `✅ BOA base aeróbica\n\n`;
  } else if (profile.restingHeartRate && profile.restingHeartRate > 75) {
    context += `⚠️ FC repouso elevada - base aeróbica em desenvolvimento\n`;
    context += `   Pode indicar fadiga ou falta de condicionamento\n\n`;
  }
  
  // ═══════════════════════════════════════
  // 2. BASE ESPORTIVA E EXPERIÊNCIA
  // ═══════════════════════════════════════
  
  context += `\n═══════════════════════════════════════\n`;
  context += `2. BASE ESPORTIVA E EXPERIÊNCIA\n`;
  context += `═══════════════════════════════════════\n\n`;
  
  // ✅ v2.5.0: Detecção de iniciante absoluto
  if (profile.hasRunBefore === false) {
    context += `\n🚨 ATENÇÃO: INICIANTE ABSOLUTO\n`;
    context += `═══════════════════════════════════════\n`;
    context += `Esta pessoa NUNCA correu antes!\n\n`;
    
    context += `PROTOCOLO OBRIGATÓRIO:\n`;
    context += `1. Começar com protocolo Walk/Run (Couch to 5K)\n`;
    context += `2. ZERO treinos de qualidade por 8-12 semanas\n`;
    context += `3. Foco: Criar hábito sem lesão\n`;
    context += `4. Progressão ULTRA conservadora (5% semanal)\n`;
    context += `5. Celebrar cada pequena vitória\n`;
    context += `6. Linguagem acolhedora e encorajadora\n\n`;
    
    if (profile.otherSportsExperience && profile.otherSportsExperience.length > 0) {
      context += `✅ PONTO POSITIVO: Tem experiência em outros esportes\n`;
      context += `   ${profile.otherSportsExperience}\n`;
      context += `   Isso indica base aeróbica existente\n`;
      context += `   Progressão pode ser um pouco mais rápida (mas ainda conservadora!)\n\n`;
    } else {
      context += `⚠️ SEM base aeróbica de outros esportes\n`;
      context += `   Progressão deve ser EXTREMAMENTE gradual\n\n`;
    }
    
    context += `═══════════════════════════════════════\n\n`;
  }
  
  context += `Nível de Corrida: ${profile.runningLevel}\n`;
  if (profile.runningYears) {
    context += `Tempo de Prática: ${profile.runningYears} ano(s)\n`;
  }
  context += `Volume Semanal Atual: ${profile.currentWeeklyKm} km\n`;
  context += `Longão Mais Recente: ${profile.longestRun} km\n\n`;
  
  if (profile.otherSportsExperience) {
    context += `Outros Esportes: ${profile.otherSportsExperience}\n`;
    context += `\n💡 IMPACTO NA BASE AERÓBICA:\n`;
    context += analyzeOtherSports(profile.otherSportsExperience);
    context += `\n\n`;
  }
  
  // ═══════════════════════════════════════
  // 3. PERFORMANCE E VDOT
  // ═══════════════════════════════════════
  
  context += `\n═══════════════════════════════════════\n`;
  context += `3. PERFORMANCE ATUAL (VDOT)\n`;
  context += `═══════════════════════════════════════\n\n`;
  
  if (profile.currentVDOT) {
    context += `VDOT Atual: ${profile.currentVDOT}\n`;
    context += `Nível: ${interpretVDOT(profile.currentVDOT)}\n\n`;
    
    const paces = calculateAllPaces(profile.currentVDOT);
    context += `Paces de Treino Calculados:\n`;
    context += `  Easy/Recuperação: ${paces.easy} min/km\n`;
    context += `  Marathon Pace: ${paces.marathon} min/km\n`;
    context += `  Threshold/Tempo: ${paces.threshold} min/km\n`;
    context += `  Interval/VO2max: ${paces.interval} min/km\n`;
    context += `  Repetition: ${paces.repetition} min/km\n\n`;
  }
  
  if (profile.bestTimes) {
    context += `Melhores Tempos Registrados:\n`;
    Object.entries(profile.bestTimes).forEach(([distance, data]: [string, any]) => {
      if (data && data.time) {
        context += `  ${distance}: ${data.time}`;
        if (data.date) {
          context += ` (${new Date(data.date).toLocaleDateString('pt-BR')})`;
        }
        if (data.vdot) {
          context += ` - VDOT ${data.vdot}`;
        }
        context += `\n`;
      }
    });
    context += `\n`;
  }
  
  // ═══════════════════════════════════════
  // 4. HISTÓRICO DE LESÕES E SAÚDE
  // ═══════════════════════════════════════
  
  context += `\n═══════════════════════════════════════\n`;
  context += `4. HISTÓRICO DE LESÕES E SAÚDE\n`;
  context += `═══════════════════════════════════════\n\n`;
  
  // ✅ v2.5.0: Detecção de lesão ativa
  if (profile.currentlyInjured === true) {
    context += `\n🚨 LESÃO ATIVA DETECTADA!\n`;
    context += `═══════════════════════════════════════\n`;
    context += `PROTOCOLO DE SEGURANÇA OBRIGATÓRIO:\n\n`;
    
    context += `1. Volume inicial: 50% do volume atual\n`;
    context += `2. ZERO intensidade alta por 4 semanas mínimo\n`;
    context += `3. Progressão: 5% semanal (ao invés de 10%)\n`;
    context += `4. Incluir strength training & cross-training\n`;
    context += `5. Monitorar dor a CADA treino\n`;
    context += `6. Recomendar consulta médica antes de iniciar\n`;
    context += `7. Se dor retornar: PARAR imediatamente\n\n`;
    
    context += `⚠️ PRIORIDADE: Recuperação > Performance\n`;
    context += `   Melhor prevenir recaída do que forçar progressão\n\n`;
    context += `═══════════════════════════════════════\n\n`;
  }
  
  if (profile.injuryDetails && profile.injuryDetails.length > 0) {
    const analysis = analyzeInjuryHistory(profile.injuryDetails);
    
    context += `Total de Lesões: ${analysis.totalInjuries}\n`;
    context += `Lesões Recentes (6 meses): ${analysis.recentInjuries}\n`;
    context += `Lesões Crônicas: ${analysis.chronicInjuries.length}\n`;
    context += `Em Recuperação: ${analysis.recoveringInjuries.length}\n`;
    context += `Nível de Risco: ${analysis.riskLevel.toUpperCase()}\n\n`;
    
    if (analysis.recommendations.length > 0) {
      context += `⚠️ AJUSTES NECESSÁRIOS POR LESÕES:\n`;
      analysis.recommendations.forEach(rec => {
        context += `  • ${rec}\n`;
      });
      context += `\n`;
    }
    
    if (analysis.preventionExercises.length > 0) {
      context += `🔒 EXERCÍCIOS DE PREVENÇÃO OBRIGATÓRIOS:\n`;
      analysis.preventionExercises.slice(0, 3).forEach(ex => {
        context += `  • ${ex.name} (${ex.frequency})\n`;
      });
      context += `\n`;
    }
    
    context += `Volume Inicial Ajustado: ${Math.round(profile.currentWeeklyKm * analysis.volumeAdjustment)}km (${Math.round((1 - analysis.volumeAdjustment) * 100)}% redução)\n\n`;
  } else {
    context += `✅ Sem histórico de lesões\n\n`;
  }
  
  if (profile.medicalConditions) {
    context += `Condições Médicas: ${profile.medicalConditions}\n`;
  }
  
  if (profile.medications) {
    context += `Medicamentos: ${profile.medications}\n`;
    context += analyzeMedicationImpact(profile.medications);
    context += `\n`;
  }
  
  // ═══════════════════════════════════════
  // 5. SONO, LIFESTYLE E RECUPERAÇÃO (v2.5.0)
  // ═══════════════════════════════════════
  
  context += `\n═══════════════════════════════════════\n`;
  context += `5. SONO, LIFESTYLE E RECUPERAÇÃO\n`;
  context += `═══════════════════════════════════════\n\n`;
  
  // ✅ v2.5.0: Sono médio (mais preciso que sleepQuality 1-5)
  if (profile.avgSleepHours !== undefined && profile.avgSleepHours !== null) {
    context += `Sono Médio: ${profile.avgSleepHours}h por noite\n`;
    
    if (profile.avgSleepHours < 6) {
      context += `🚨 CRÍTICO: Sono INSUFICIENTE (<6h)\n`;
      context += `\nIMPACTO NO TREINAMENTO:\n`;
      context += `  • Reduzir volume planejado em 20%\n`;
      context += `  • Aumentar dias de descanso\n`;
      context += `  • Priorizar recuperação sobre intensidade\n`;
      context += `  • Monitorar sinais de overtraining\n`;
      context += `  • Recomendar melhorar higiene do sono\n\n`;
    } else if (profile.avgSleepHours < 7) {
      context += `⚠️ Sono LIMÍTROFE (6-7h)\n`;
      context += `  • Volume moderado recomendado\n`;
      context += `  • Dar atenção extra a recuperação\n`;
      context += `  • Evitar treinos muito intensos\n\n`;
    } else if (profile.avgSleepHours >= 8) {
      context += `✅ EXCELENTE! Sono adequado (≥8h)\n`;
      context += `  Capacidade de recuperação otimizada\n`;
      context += `  Pode suportar volume e intensidade maiores\n\n`;
    } else {
      context += `✅ Sono ADEQUADO (7-8h)\n`;
      context += `  Recuperação normal esperada\n\n`;
    }
  } else if (profile.sleepQuality) {
    // Fallback para estrutura antiga (1-5)
    context += `Qualidade do Sono: ${profile.sleepQuality}/5 (${interpretSleep(profile.sleepQuality)})\n\n`;
  }
  
  // ✅ v2.5.0: Demanda de trabalho
  if (profile.workDemand) {
    context += `Demanda de Trabalho: ${profile.workDemand}\n`;
    
    if (profile.workDemand === 'physical') {
      context += `⚠️ Trabalho FÍSICO detectado\n`;
      context += `  • Considerar fadiga acumulada diária\n`;
      context += `  • Trabalho JÁ é treinamento de resistência\n`;
      context += `  • Volume de corrida deve ser moderado\n`;
      context += `  • Priorizar qualidade > quantidade\n\n`;
    } else if (profile.workDemand === 'sedentary') {
      context += `  Sedentário (escritório)\n`;
      context += `  • Pode absorver mais volume de treino\n`;
      context += `  • Incluir mobility work (compensar postura)\n\n`;
    } else {
      context += `  Moderado\n\n`;
    }
  }
  
  // ✅ v2.5.0: Demanda familiar
  if (profile.familyDemand) {
    context += `Demanda Familiar: ${profile.familyDemand}\n`;
    
    if (profile.familyDemand === 'high') {
      context += `⚠️ Alta demanda familiar detectada\n`;
      context += `  • Planejar treinos flexíveis\n`;
      context += `  • Considerar treinos mais curtos e intensos\n`;
      context += `  • Evitar longões muito longos\n`;
      context += `  • Realismo na programação é CRÍTICO\n\n`;
    } else if (profile.familyDemand === 'low') {
      context += `  Baixa (flexibilidade alta)\n`;
      context += `  • Pode planejar treinos longos\n\n`;
    } else {
      context += `  Moderada\n\n`;
    }
  }
  
  // ✅ v2.5.0: Ajuste de volume por lifestyle
  if ((profile.workDemand === 'physical' || profile.familyDemand === 'high') ||
      (profile.avgSleepHours && profile.avgSleepHours < 6)) {
    context += `\n💡 AJUSTE DE VOLUME POR LIFESTYLE:\n`;
    context += `   Vida exigente detectada!\n`;
    
    let reductionPercent = 0;
    const reasons = [];
    
    if (profile.avgSleepHours && profile.avgSleepHours < 6) {
      reductionPercent += 20;
      reasons.push('Sono insuficiente');
    }
    if (profile.workDemand === 'physical') {
      reductionPercent += 10;
      reasons.push('Trabalho físico');
    }
    if (profile.familyDemand === 'high') {
      reductionPercent += 10;
      reasons.push('Alta demanda familiar');
    }
    
    reductionPercent = Math.min(reductionPercent, 30); // Cap em 30%
    
    context += `   Redução recomendada: ${reductionPercent}%\n`;
    context += `   Motivos: ${reasons.join(', ')}\n`;
    context += `   Estratégia: Qualidade > Quantidade\n`;
    context += `   Foco: Treinos eficientes e flexíveis\n\n`;
  }
  
  // Estresse (estrutura antiga mantida)
  if (profile.stressLevel) {
    context += `Nível de Estresse: ${profile.stressLevel}/5 (${interpretStress(profile.stressLevel)})\n\n`;
  }
  
  // ✅ v2.5.0: Ciclo menstrual (apenas mulheres)
  if (profile.gender === 'female' && profile.tracksMenstrualCycle === true) {
    context += `\n📊 OTIMIZAÇÃO POR CICLO MENSTRUAL\n`;
    context += `═══════════════════════════════════════\n`;
    context += `Atleta rastreia ciclo: SIM\n`;
    
    if (profile.avgCycleLength) {
      context += `Duração média do ciclo: ${profile.avgCycleLength} dias\n`;
    } else {
      context += `Duração média do ciclo: 28 dias (padrão)\n`;
    }
    
    if (profile.lastPeriodDate) {
      const lastPeriod = new Date(profile.lastPeriodDate);
      const today = new Date();
      const daysSinceLastPeriod = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
      context += `Última menstruação: ${daysSinceLastPeriod} dias atrás\n`;
      
      const cycleLength = profile.avgCycleLength || 28;
      const currentDay = (daysSinceLastPeriod % cycleLength) + 1;
      
      let currentPhase = '';
      if (currentDay >= 1 && currentDay <= 5) {
        currentPhase = 'Menstruação (dias 1-5)';
      } else if (currentDay >= 6 && currentDay <= 14) {
        currentPhase = 'Fase Folicular (dias 6-14) - MELHOR PARA INTENSIDADE';
      } else if (currentDay >= 15 && currentDay <= cycleLength) {
        currentPhase = 'Fase Lútea (dias 15-28) - MELHOR PARA VOLUME';
      }
      
      context += `Fase atual estimada: ${currentPhase}\n\n`;
    }
    
    context += `\n💡 ESTRATÉGIA DE PERIODIZAÇÃO HORMONAL:\n`;
    context += `\n1. FASE FOLICULAR (dias 1-14):\n`;
    context += `   • ALTA testosterona/estrogênio = melhor performance\n`;
    context += `   • PRIORIZAR: Treinos de ALTA intensidade\n`;
    context += `   • Treinos chave: Intervalados, tempo runs, testes\n`;
    context += `   • Energia e força em pico\n`;
    context += `   • Recuperação mais rápida\n\n`;
    
    context += `2. FASE LÚTEA (dias 15-28):\n`;
    context += `   • ALTA progesterona = metabolismo diferente\n`;
    context += `   • PRIORIZAR: Treinos de VOLUME, intensidade moderada\n`;
    context += `   • Treinos chave: Longões, easy runs, base aeróbica\n`;
    context += `   • Pode ter mais fadiga\n`;
    context += `   • Recuperação mais lenta\n`;
    context += `   • Retenção de líquidos possível\n\n`;
    
    context += `3. MENSTRUAÇÃO (dias 1-5):\n`;
    context += `   • Ajustar volume conforme energia\n`;
    context += `   • OK para treinar (não é obrigatório parar)\n`;
    context += `   • Evitar treinos muito intensos se sentir mal\n`;
    context += `   • Hidratação e ferro importantes\n\n`;
    
    context += `⚠️ INSTRUÇÕES PARA IA:\n`;
    context += `   • Planejar treinos CHAVE para dias 7-14 (melhor janela)\n`;
    context += `   • Longões e volume em fase lútea\n`;
    context += `   • Flexibilidade na primeira semana do ciclo\n`;
    context += `   • Educação sobre ajustes por fase\n\n`;
    
    context += `═══════════════════════════════════════\n\n`;
  }
  
  // Cálculo de capacidade de recuperação (estrutura antiga mantida)
  const recoveryCapacity = calculateRecoveryCapacity({
    sleepQuality: profile.sleepQuality || 3,
    stressLevel: profile.stressLevel || 3,
    age: profile.age,
    currentWeeklyKm: profile.currentWeeklyKm,
    restingHeartRate: profile.restingHeartRate,
  });
  
  const recoveryInterpretation = interpretRecoveryCapacity(recoveryCapacity);
  context += `Capacidade de Recuperação: ${recoveryCapacity}/100 (${recoveryInterpretation.level})\n`;
  context += `Status: ${recoveryInterpretation.message}\n\n`;
  
  // Ajuste de volume por recuperação
  const volumeAdjustment = adjustVolumeForRecovery({
    sleepQuality: profile.sleepQuality || 3,
    stressLevel: profile.stressLevel || 3,
    age: profile.age,
    currentWeeklyKm: profile.currentWeeklyKm,
    restingHeartRate: profile.restingHeartRate,
  });
  
  if (volumeAdjustment.multiplier < 1.0) {
    context += `⚠️ AJUSTE DE VOLUME POR RECUPERAÇÃO:\n`;
    context += `  Original: ${volumeAdjustment.original}km\n`;
    context += `  Ajustado: ${volumeAdjustment.adjusted}km (-${volumeAdjustment.reduction})\n`;
    context += `  Razões: ${volumeAdjustment.reasons.join(', ')}\n\n`;
    
    if (volumeAdjustment.recommendations.length > 0) {
      context += `  Recomendações:\n`;
      volumeAdjustment.recommendations.forEach(rec => {
        context += `    • ${rec}\n`;
      });
      context += `\n`;
    }
  }
  
  // Risco de overtraining
  const overtrainingRisk = assessOvertrainingRisk({
    sleepQuality: profile.sleepQuality || 3,
    stressLevel: profile.stressLevel || 3,
    age: profile.age,
    currentWeeklyKm: profile.currentWeeklyKm,
    restingHeartRate: profile.restingHeartRate,
    recentInjuries: profile.injuryDetails?.filter((inj: any) => inj.status === 'recovering').length || 0,
  });
  
  if (overtrainingRisk.risk !== 'baixo') {
    context += `⚠️ RISCO DE OVERTRAINING: ${overtrainingRisk.risk.toUpperCase()}\n`;
    if (overtrainingRisk.indicators.length > 0) {
      context += `  Indicadores: ${overtrainingRisk.indicators.join(', ')}\n`;
    }
    context += `\n`;
  }
  
  // ═══════════════════════════════════════
  // 6. INFRAESTRUTURA DISPONÍVEL
  // ═══════════════════════════════════════
  
  context += `\n═══════════════════════════════════════\n`;
  context += `6. INFRAESTRUTURA DISPONÍVEL\n`;
  context += `═══════════════════════════════════════\n\n`;
  
  context += `Academia/Musculação: ${profile.hasGymAccess ? 'SIM ✅' : 'NÃO'}\n`;
  context += `Piscina/Natação: ${profile.hasPoolAccess ? 'SIM ✅' : 'NÃO'}\n`;
  context += `Pista de Atletismo: ${profile.hasTrackAccess ? 'SIM ✅' : 'NÃO'}\n\n`;
  
  if (profile.hasGymAccess) {
    context += `✅ INCLUIR musculação 2x por semana (fortalecimento preventivo)\n`;
  }
  
  if (profile.hasPoolAccess) {
    context += `✅ OPÇÃO de natação como cross-training (recuperação ativa)\n`;
  }
  
  context += `\n`;
  
  // ═══════════════════════════════════════
  // 7. DISPONIBILIDADE E ATIVIDADES
  // ═══════════════════════════════════════
  
  context += `\n═══════════════════════════════════════\n`;
  context += `7. DISPONIBILIDADE E ATIVIDADES\n`;
  context += `═══════════════════════════════════════\n\n`;
  
  // Nova estrutura de disponibilidade
  if (profile.trainingSchedule && Object.keys(profile.trainingSchedule).length > 0) {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    context += `AGENDA SEMANAL:\n`;
    
    Object.entries(profile.trainingSchedule).forEach(([dayNum, schedule]: [string, any]) => {
      const dayIndex = parseInt(dayNum);
      const activities = [];
      
      if (schedule.running) {
        activities.push('🏃 Corrida');
        if (profile.longRunDay === dayIndex) {
          activities.push('(DIA DO LONGÃO)');
        }
      }
      
      if (schedule.activities && schedule.activities.length > 0) {
        schedule.activities.forEach((activity: string) => {
          // Formata nome da atividade
          const activityName = activity.split('_').map((w: string) => 
            w.charAt(0).toUpperCase() + w.slice(1)
          ).join(' ');
          activities.push(`✨ ${activityName}`);
        });
      }
      
      if (activities.length > 0) {
        context += `  ${days[dayIndex]}: ${activities.join(', ')}\n`;
      }
    });
    
    context += `\n`;
    
    // Análise de volume
    const runningDays = Object.values(profile.trainingSchedule).filter((s: any) => s.running).length;
    const totalActiveDays = Object.values(profile.trainingSchedule).filter((s: any) => 
      s.running || (s.activities && s.activities.length > 0)
    ).length;
    
    context += `ANÁLISE DE DISPONIBILIDADE:\n`;
    context += `  Dias de corrida: ${runningDays}/semana\n`;
    context += `  Total de dias ativos: ${totalActiveDays}/semana\n`;
    
    if (runningDays < 3) {
      context += `  ⚠️ ATENÇÃO: Apenas ${runningDays} dias de corrida - plano conservador\n`;
    } else if (runningDays >= 5) {
      context += `  ✓ Excelente disponibilidade para progressão\n`;
    }
    
    context += `\n`;
    
    // Esportes complementares
    const allActivities = new Set<string>();
    Object.values(profile.trainingSchedule).forEach((s: any) => {
      if (s.activities) {
        s.activities.forEach((a: string) => allActivities.add(a));
      }
    });
    
    if (allActivities.size > 0) {
      context += `ATIVIDADES COMPLEMENTARES:\n`;
      allActivities.forEach(activity => {
        const activityName = activity.split('_').map((w: string) => 
          w.charAt(0).toUpperCase() + w.slice(1)
        ).join(' ');
        context += `  • ${activityName}`;
        
        // Recomendação baseada na atividade
        if (activity === 'musculacao') {
          context += ` → Considerar fortalecimento de core e membros inferiores\n`;
        } else if (activity === 'yoga' || activity === 'pilates') {
          context += ` → Excelente para flexibilidade e prevenção de lesões\n`;
        } else if (activity === 'natacao') {
          context += ` → Ótimo para recuperação ativa (baixo impacto)\n`;
        } else if (activity === 'ciclismo') {
          context += ` → Bom para cross-training cardiovascular\n`;
        } else {
          context += ` → Integrar ao plano como complemento\n`;
        }
      });
      context += `\n`;
    }
  }
  
  // Infraestrutura disponível
  const infrastructure = [];
  if (profile.hasGymAccess) infrastructure.push('Academia');
  if (profile.hasPoolAccess) infrastructure.push('Piscina');
  if (profile.hasTrackAccess) infrastructure.push('Pista de Atletismo');
  
  if (infrastructure.length > 0) {
    context += `INFRAESTRUTURA DISPONÍVEL:\n`;
    infrastructure.forEach(infra => {
      context += `  ✓ ${infra}\n`;
    });
    context += `\n`;
  }
  
  // ═══════════════════════════════════════
  // 8. PREFERÊNCIAS DE TREINO
  // ═══════════════════════════════════════
  
  context += `\n═══════════════════════════════════════\n`;
  context += `8. PREFERÊNCIAS DE TREINO\n`;
  context += `═══════════════════════════════════════\n\n`;
  
  if (profile.trainingPreferences) {
    // Estilo de treino
    const trainingStyle = [];
    if (profile.trainingPreferences.solo) trainingStyle.push('Solo');
    if (profile.trainingPreferences.group) trainingStyle.push('Grupo');
    
    if (trainingStyle.length > 0) {
      context += `ESTILO DE TREINO: ${trainingStyle.join(' e ')}\n`;
      
      if (profile.trainingPreferences.solo && !profile.trainingPreferences.group) {
        context += `  → Atleta prefere treinar sozinho\n`;
        context += `  → Plano deve ser autogerenciável\n`;
        context += `  → Motivação intrínseca importante\n`;
      } else if (profile.trainingPreferences.group && !profile.trainingPreferences.solo) {
        context += `  → Atleta prefere treinar em grupo\n`;
        context += `  → Considerar assessorias ou grupos de corrida\n`;
        context += `  → Motivação social importante\n`;
      } else {
        context += `  → Flexível quanto ao estilo de treino\n`;
      }
      context += `\n`;
    }
    
    // Ambiente preferido
    const environment = [];
    if (profile.trainingPreferences.indoor) environment.push('Indoor');
    if (profile.trainingPreferences.outdoor) environment.push('Outdoor');
    
    if (environment.length > 0) {
      context += `AMBIENTE PREFERIDO: ${environment.join(' e ')}\n`;
      
      if (profile.trainingPreferences.outdoor && !profile.trainingPreferences.indoor) {
        context += `  → Prefere treinar ao ar livre\n`;
        context += `  → Considerar variação de terrenos (rua, parque, trilha)\n`;
      } else if (profile.trainingPreferences.indoor && !profile.trainingPreferences.outdoor) {
        context += `  → Prefere treinar em ambiente fechado\n`;
        context += `  → Priorizar academia/esteira quando disponível\n`;
      } else {
        context += `  → Flexível quanto ao ambiente de treino\n`;
      }
      context += `\n`;
    }
  }
  
  // ═══════════════════════════════════════
  // 9. MOTIVAÇÃO
  // ═══════════════════════════════════════
  
  context += `\n═══════════════════════════════════════\n`;
  context += `9. MOTIVAÇÃO\n`;
  context += `═══════════════════════════════════════\n\n`;
  
  if (profile.motivationFactors) {
    context += `Motivação Principal: ${profile.motivationFactors.primary || 'Não informada'}\n`;
    if (profile.motivationFactors.secondary) {
      context += `Motivações Secundárias: ${profile.motivationFactors.secondary.join(', ')}\n`;
    }
    context += `\n`;
    context += generateMotivationalMessages(profile.motivationFactors);
    context += `\n`;
  }
  
  
  // ═══════════════════════════════════════
  // 10. OBJETIVO E PRAZO
  // ═══════════════════════════════════════
  
  context += `\n═══════════════════════════════════════\n`;
  context += `10. OBJETIVO E PRAZO\n`;
  context += `═══════════════════════════════════════\n\n`;
  
  // Verifica se é objetivo aberto (sem corrida específica)
  if (profile.isOpenGoal) {
    const goalTypeLabels: any = {
      start: 'COMEÇAR A CORRER',
      fitness: 'GANHAR CONDICIONAMENTO GERAL'
    };
    
    context += `⚠️ OBJETIVO ABERTO - ${goalTypeLabels[profile.goalType || 'start']}\n`;
    context += `Atleta NÃO tem uma corrida/prova específica em mente.\n`;
    context += `\n`;
    context += `Meta Inicial: Completar ${profile.goalDistance} de forma confortável\n`;
    context += `Prazo Flexível: ${new Date(profile.targetRaceDate).toLocaleDateString('pt-BR')}\n`;
    context += `\n`;
    context += `🎯 ABORDAGEM RECOMENDADA:\n`;
    context += `- Foco em BASE AERÓBICA e adaptação cardiovascular\n`;
    context += `- Progressão GRADUAL e sustentável (evitar burnout)\n`;
    context += `- Prioridade: Criar HÁBITO e prevenir lesões\n`;
    context += `- Ritmo CONFORTÁVEL (teste da conversação)\n`;
    context += `- Volume progressivo com semanas de recuperação\n`;
    context += `- Sem pressão de data - ajustar conforme evolução\n`;
    context += `\n`;
    context += `💡 OBJETIVO: Desenvolver base sólida para futuras corridas\n`;
    context += `\n`;
  } else {
    // Objetivo com corrida específica
    context += `🏁 CORRIDA ALVO ESPECÍFICA\n`;
    context += `Distância Objetivo: ${profile.goalDistance}\n`;
    context += `Data da Prova: ${new Date(profile.targetRaceDate).toLocaleDateString('pt-BR')}\n`;
    
    const weeksAvailable = calculateWeeksUntilRace(profile.targetRaceDate);
    context += `Semanas Disponíveis: ${weeksAvailable}\n`;
    
    if (profile.targetTime) {
      context += `Meta de Tempo: ${profile.targetTime}\n`;
    }
    
    context += `\n`;
    context += assessGoalViability(profile, weeksAvailable);
    context += `\n`;
  }
  
  // ═══════════════════════════════════════
  // 11. RECOMENDAÇÕES FINAIS
  // ═══════════════════════════════════════
  
  context += `\n═══════════════════════════════════════\n`;
  context += `11. RECOMENDAÇÕES FINAIS PARA O PLANO:\n`;
  context += `═══════════════════════════════════════\n\n`;
  
  context += generateFinalRecommendations(profile);
  
  return context;
}

// Funções auxiliares

function analyzeOtherSports(sports: string): string {
  const lower = sports.toLowerCase();
  let analysis = '';
  
  if (lower.includes('natação') || lower.includes('nadar')) {
    analysis += '  • Natação: EXCELENTE base aeróbica sem impacto\n';
    analysis += '    → Pode iniciar com volume maior que iniciante típico\n';
  }
  
  if (lower.includes('ciclismo') || lower.includes('bike')) {
    analysis += '  • Ciclismo: BOA base aeróbica, fortalece pernas\n';
    analysis += '    → Transferência moderada para corrida\n';
  }
  
  if (lower.includes('futebol') || lower.includes('vôlei') || lower.includes('basquete')) {
    analysis += '  • Esportes coletivos: Base de sprint e agilidade\n';
    analysis += '    → Atenção ao impacto (histórico de torções?)\n';
  }
  
  if (lower.includes('artes marciais') || lower.includes('luta')) {
    analysis += '  • Artes Marciais: Boa resistência e disciplina mental\n';
    analysis += '    → Base cardiovascular desenvolvida\n';
  }
  
  return analysis || '  • Base esportiva prévia ajuda na adaptação\n';
}

function analyzeMedicationImpact(medications: string): string {
  const lower = medications.toLowerCase();
  let analysis = '\n  Impacto no Treino:\n';
  
  if (lower.includes('beta') || lower.includes('bloqueador')) {
    analysis += '    ⚠️ Beta-bloqueador: FC será MENOR (não usar zones de FC)\n';
  }
  
  if (lower.includes('asma') || lower.includes('bombinha')) {
    analysis += '    • Asma controlada: OK, evitar treinos muito intensos em dias ruins\n';
  }
  
  return analysis;
}

function generateMotivationalMessages(motivation: any): string {
  let message = '💬 MENSAGENS PERSONALIZADAS:\n';
  
  if (motivation.primary === 'saúde') {
    message += '  • Focar em consistência e bem-estar\n';
  } else if (motivation.primary === 'competição') {
    message += '  • Incluir treinos de qualidade e simulados\n';
  } else if (motivation.primary === 'desafio') {
    message += '  • Progressão clara e metas intermediárias\n';
  }
  
  return message;
}

function calculateWeeksUntilRace(raceDate: Date): number {
  const now = new Date();
  const diff = new Date(raceDate).getTime() - now.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
}

function assessGoalViability(profile: ComprehensiveProfile, weeks: number): string {
  let assessment = 'VIABILIDADE DO OBJETIVO:\n';
  
  if (weeks < 8) {
    assessment += '  ⚠️ PRAZO CURTO (< 8 semanas)\n';
    assessment += '  → Focar em completar, não em tempo meta\n';
  } else if (weeks > 40) {
    assessment += '  ✅ PRAZO LONGO - Planejar em fases\n';
  } else {
    assessment += '  ✅ Prazo adequado para preparação completa\n';
  }
  
  return assessment;
}

function generateFinalRecommendations(profile: ComprehensiveProfile): string {
  const recs: string[] = [];
  
  // Baseado em todos os fatores analisados
  if (profile.sleepQuality && profile.sleepQuality < 3) {
    recs.push('🔴 PRIORIZAR sono de 7-9h (crítico para recuperação)');
  }
  
  if (profile.injuryDetails && profile.injuryDetails.length > 0) {
    recs.push('🔒 INCLUIR exercícios de prevenção OBRIGATÓRIOS');
  }
  
  if (profile.hasGymAccess) {
    recs.push('💪 INCLUIR musculação 2x/semana (fortalecimento)');
  }
  
  if (profile.age >= 50) {
    recs.push('⏰ AUMENTAR tempo de recuperação entre treinos intensos');
  }
  
  if (profile.currentVDOT && profile.currentVDOT < 40) {
    recs.push('📈 FOCAR em base aeróbica (80% easy pace)');
  } else if (profile.currentVDOT && profile.currentVDOT >= 55) {
    recs.push('🎯 INCLUIR treinos de qualidade (threshold e intervals)');
  }
  
  if (recs.length === 0) {
    recs.push('✅ Condições boas para treinamento normal');
  }
  
  return recs.join('\n');
}
