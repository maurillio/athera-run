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
  
  // Preferências
  trainingPreferences?: any;
  motivationFactors?: any;
  trainingActivities?: any[];
  longRunDay?: number;
  
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
  // 5. RECUPERAÇÃO E CARGA MENTAL
  // ═══════════════════════════════════════
  
  context += `\n═══════════════════════════════════════\n`;
  context += `5. RECUPERAÇÃO E CARGA MENTAL\n`;
  context += `═══════════════════════════════════════\n\n`;
  
  if (profile.sleepQuality) {
    context += `Sono: ${profile.sleepQuality}/5 (${interpretSleep(profile.sleepQuality)})\n`;
  }
  
  if (profile.stressLevel) {
    context += `Estresse: ${profile.stressLevel}/5 (${interpretStress(profile.stressLevel)})\n\n`;
  }
  
  // Calcular capacidade de recuperação
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
  // 7. MOTIVAÇÃO E PREFERÊNCIAS
  // ═══════════════════════════════════════
  
  context += `\n═══════════════════════════════════════\n`;
  context += `7. MOTIVAÇÃO E PREFERÊNCIAS\n`;
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
  
  if (profile.trainingPreferences) {
    context += `Preferências de Treino:\n`;
    if (profile.trainingPreferences.location) {
      context += `  Local: ${profile.trainingPreferences.location.join(', ')}\n`;
    }
    if (profile.trainingPreferences.groupTraining !== undefined) {
      context += `  Estilo: ${profile.trainingPreferences.groupTraining ? 'Grupo' : 'Solo'}\n`;
    }
    context += `\n`;
  }
  
  // ═══════════════════════════════════════
  // 8. OBJETIVO E PRAZO
  // ═══════════════════════════════════════
  
  context += `\n═══════════════════════════════════════\n`;
  context += `8. OBJETIVO E PRAZO\n`;
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
  // 9. RECOMENDAÇÕES FINAIS
  // ═══════════════════════════════════════
  
  context += `\n═══════════════════════════════════════\n`;
  context += `RECOMENDAÇÕES FINAIS PARA O PLANO:\n`;
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
