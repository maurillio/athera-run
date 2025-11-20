import { AI_FIELD_CONFIGS, AIPlanAnalysis, AIFieldInfo, FieldStatus } from '@/types/ai-transparency';

/**
 * Analisa o perfil do usuário e retorna insights sobre uso de dados pela IA
 */
export async function analyzeProfileForAI(
  userId: string,
  profileData: any
): Promise<AIPlanAnalysis> {
  const fieldsUsed: AIFieldInfo[] = [];
  const fieldsNotUsed: AIFieldInfo[] = [];
  const fieldsConflicting: AIFieldInfo[] = [];
  const fieldsMissing: AIFieldInfo[] = [];

  // Analisar cada campo configurado
  for (const config of AI_FIELD_CONFIGS) {
    const value = getFieldValue(profileData, config.field);
    const hasValue = value !== undefined && value !== null && value !== '';

    if (hasValue) {
      // Campo tem valor - verificar se foi usado ou tem conflito
      const conflict = checkFieldConflict(config.field, value, profileData);
      
      if (conflict) {
        fieldsConflicting.push({
          field: config.field,
          label: config.label,
          value,
          status: 'conflicting',
          importance: config.importance,
          impact: config.impact,
          howUsed: config.howUsed,
          conflictsWith: conflict.conflictsWith,
          suggestion: conflict.suggestion,
        });
      } else {
        fieldsUsed.push({
          field: config.field,
          label: config.label,
          value,
          status: 'used',
          importance: config.importance,
          impact: config.impact,
          howUsed: config.howUsed,
        });
      }
    } else {
      // Campo não tem valor
      fieldsMissing.push({
        field: config.field,
        label: config.label,
        value: null,
        status: 'missing',
        importance: config.importance,
        impact: config.impact,
        howUsed: config.howUsed,
        suggestion: getSuggestionForMissingField(config.field, config.importance),
      });
    }
  }

  // Calcular score de completude
  const totalFields = AI_FIELD_CONFIGS.length;
  const criticalFields = AI_FIELD_CONFIGS.filter(f => f.importance === 'critical');
  const highFields = AI_FIELD_CONFIGS.filter(f => f.importance === 'high');
  
  const criticalFilled = criticalFields.filter(f => {
    const value = getFieldValue(profileData, f.field);
    return value !== undefined && value !== null && value !== '';
  }).length;
  
  const highFilled = highFields.filter(f => {
    const value = getFieldValue(profileData, f.field);
    return value !== undefined && value !== null && value !== '';
  }).length;

  // Score ponderado: críticos valem 40%, high valem 30%, resto 30%
  const criticalScore = (criticalFilled / criticalFields.length) * 40;
  const highScore = (highFilled / highFields.length) * 30;
  const otherScore = (fieldsUsed.length / totalFields) * 30;
  const completenessScore = Math.round(criticalScore + highScore + otherScore);

  // Gerar raciocínio da IA
  const aiReasoning = generateAIReasoning(profileData, fieldsUsed);

  // Gerar recomendações
  const recommendations = generateRecommendations(
    fieldsMissing,
    fieldsConflicting,
    completenessScore,
    profileData
  );

  return {
    userId,
    generatedAt: new Date(),
    fieldsUsed,
    fieldsNotUsed,
    fieldsConflicting,
    fieldsMissing,
    completenessScore,
    aiReasoning,
    recommendations,
  };
}

function getFieldValue(data: any, field: string): any {
  // Suportar nested fields (ex: trainingSchedule.0.running)
  const parts = field.split('.');
  let value = data;
  
  for (const part of parts) {
    if (value === undefined || value === null) return undefined;
    value = value[part];
  }
  
  return value;
}

function checkFieldConflict(
  field: string,
  value: any,
  data: any
): { conflictsWith: string; suggestion: string } | null {
  // Verificar conflitos conhecidos
  
  // Exemplo: FC máxima vs idade
  if (field === 'maxHeartRate' && data.age) {
    const theoreticalMax = 220 - data.age;
    const userMax = parseInt(value);
    
    if (Math.abs(userMax - theoreticalMax) > 20) {
      return {
        conflictsWith: `Idade (${data.age} anos → FC máxima teórica ${theoreticalMax}bpm)`,
        suggestion: `Seu valor (${userMax}bpm) difere muito da estimativa teórica. Se fez teste, mantenha. Caso contrário, considere usar ${theoreticalMax}bpm.`,
      };
    }
  }
  
  // Exemplo: Longão maior que distância meta
  if (field === 'longestRun' && data.goalDistance) {
    const longest = parseFloat(value);
    const goalKm = parseFloat(data.goalDistance);
    
    if (longest > goalKm) {
      return {
        conflictsWith: `Distância meta (${goalKm}km)`,
        suggestion: `Seu longão atual (${longest}km) já é maior que a meta. Considere uma distância maior ou tempo mais agressivo.`,
      };
    }
  }

  return null;
}

function getSuggestionForMissingField(field: string, importance: string): string {
  const suggestions: Record<string, string> = {
    weight: 'Fundamental para calcular zonas de frequência cardíaca e intensidade ideal',
    age: 'Essencial para estimar FC máxima e ajustar progressão por faixa etária',
    runningLevel: 'Define a estrutura base do seu plano de treino',
    goalDistance: 'Necessário para criar um plano direcionado',
    targetRaceDate: 'Define a duração e periodização do plano',
    currentWeeklyKm: 'Ponto de partida para progressão segura',
    bestTimes: 'Calcula seu VDOT e ritmos personalizados de treino',
    trainingSchedule: 'Define quais dias você pode treinar',
    restingHeartRate: 'Melhora precisão das zonas de FC',
    injuries: 'Previne lesões e ajusta progressão',
  };

  return suggestions[field] || 'Complete este campo para personalização adicional';
}

function generateAIReasoning(data: any, fieldsUsed: AIFieldInfo[]): any {
  const reasoning: any = {};

  // VDOT Calculation
  if (data.bestTimes && Object.keys(data.bestTimes).length > 0) {
    const times = Object.entries(data.bestTimes).map(([dist, time]: [string, any]) => 
      `${dist}: ${time}`
    ).join(', ');
    reasoning.vdotCalculation = `Baseado nos seus recordes (${times}), calculei seu VDOT em aproximadamente ${data.currentVDOT || '45-50'}. Isso define seus ritmos de treino personalizados.`;
  }

  // Volume Decision
  if (data.currentWeeklyKm) {
    reasoning.volumeDecision = `Seu volume atual de ${data.currentWeeklyKm}km/semana será o ponto de partida. Aplicarei a regra dos 10% para progressão segura${data.injuries?.length > 0 ? ', considerando seu histórico de lesões' : ''}.`;
  }

  // Progression Strategy
  if (data.runningLevel && data.goalDistance && data.targetRaceDate) {
    const level = data.runningLevel;
    const weeks = calculateWeeksUntilRace(data.targetRaceDate);
    reasoning.progressionStrategy = `Como ${level}, estruturei ${weeks} semanas de treino até ${data.goalDistance}, com fases de base, construção e pico progressivas.`;
  }

  // Experience Analysis
  if (data.yearsRunning || data.runningLevel) {
    const years = data.yearsRunning || 'iniciante';
    reasoning.experience = `Seu nível (${data.runningLevel}) e experiência (${years} anos) definem a complexidade dos treinos e velocidade de adaptação.`;
  }

  return reasoning;
}

function generateRecommendations(
  missing: AIFieldInfo[],
  conflicting: AIFieldInfo[],
  score: number,
  data: any
): string[] {
  const recs: string[] = [];

  // Recomendações baseadas em campos faltando
  const criticalMissing = missing.filter(f => f.importance === 'critical');
  if (criticalMissing.length > 0) {
    recs.push(`Complete ${criticalMissing.length} campo(s) crítico(s) para plano ideal: ${criticalMissing.map(f => f.label).join(', ')}`);
  }

  const highMissing = missing.filter(f => f.importance === 'high');
  if (highMissing.length > 0) {
    recs.push(`Adicione ${highMissing.length} campo(s) importante(s) para melhor personalização: ${highMissing.map(f => f.label).join(', ')}`);
  }

  // Recomendações de conflitos
  if (conflicting.length > 0) {
    recs.push(`Revise ${conflicting.length} campo(s) com valores conflitantes para evitar inconsistências`);
  }

  // Recomendações específicas
  if (!data.stravaConnected) {
    recs.push('Conecte ao Strava para validar dados automaticamente e obter métricas detalhadas');
  }

  if (!data.restingHeartRate && data.age) {
    recs.push('Adicione FC em repouso para zonas de treino mais precisas (meça ao acordar)');
  }

  if (!data.bestTimes || Object.keys(data.bestTimes).length === 0) {
    recs.push('Adicione seus melhores tempos para calcular VDOT e ritmos personalizados');
  }

  if (score < 50) {
    recs.push('Seu perfil está incompleto. Complete pelo menos 70% para melhor resultado');
  }

  return recs;
}

function calculateWeeksUntilRace(raceDate: string): number {
  const today = new Date();
  const race = new Date(raceDate);
  const diffTime = race.getTime() - today.getTime();
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  return Math.max(1, diffWeeks);
}
