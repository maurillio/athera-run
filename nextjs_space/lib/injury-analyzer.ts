/**
 * Injury Analyzer - Sistema de análise e prevenção de lesões
 * 
 * Analisa histórico de lesões e gera recomendações personalizadas
 * para prevenção e ajuste de volume de treino.
 */

export interface InjuryDetail {
  type: string;
  date: string;
  duration?: string;
  treatment?: string;
  status: 'recovered' | 'recovering' | 'chronic';
  recurringRisk?: 'baixo' | 'médio' | 'alto';
  notes?: string;
}

export interface InjuryAnalysis {
  totalInjuries: number;
  recentInjuries: number;
  chronicInjuries: InjuryDetail[];
  recoveringInjuries: InjuryDetail[];
  riskLevel: 'baixo' | 'médio' | 'alto';
  recommendations: string[];
  volumeAdjustment: number; // Multiplicador (0.7 = -30%)
  preventionExercises: PreventionExercise[];
}

export interface PreventionExercise {
  name: string;
  description: string;
  frequency: string;
  duration: string;
  targetInjury: string;
}

/**
 * Verifica se uma data está dentro de X meses
 */
function isWithinMonths(dateStr: string, months: number): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const monthsAgo = new Date(now.setMonth(now.getMonth() - months));
  return date >= monthsAgo;
}

/**
 * Analisa histórico completo de lesões
 */
export function analyzeInjuryHistory(injuries: InjuryDetail[]): InjuryAnalysis {
  if (!injuries || injuries.length === 0) {
    return {
      totalInjuries: 0,
      recentInjuries: 0,
      chronicInjuries: [],
      recoveringInjuries: [],
      riskLevel: 'baixo',
      recommendations: [],
      volumeAdjustment: 1.0,
      preventionExercises: [],
    };
  }

  const analysis: InjuryAnalysis = {
    totalInjuries: injuries.length,
    recentInjuries: injuries.filter(inj => isWithinMonths(inj.date, 6)).length,
    chronicInjuries: injuries.filter(inj => inj.status === 'chronic'),
    recoveringInjuries: injuries.filter(inj => inj.status === 'recovering'),
    riskLevel: 'baixo',
    recommendations: [],
    volumeAdjustment: 1.0,
    preventionExercises: [],
  };

  // Determinar risco e ajustes
  if (analysis.recoveringInjuries.length > 0) {
    analysis.riskLevel = 'alto';
    analysis.volumeAdjustment = 0.7; // -30%
    analysis.recommendations.push(
      'Reduzir volume inicial em 30% devido a lesão em recuperação',
      'Aumentar dias de recuperação entre treinos intensos',
      'Incluir fortalecimento obrigatório 2-3x por semana',
      'Monitorar dor/desconforto diariamente',
      'Priorizar recuperação sobre volume'
    );
  } else if (analysis.recentInjuries > 0 || analysis.chronicInjuries.length > 0) {
    analysis.riskLevel = 'médio';
    analysis.volumeAdjustment = 0.85; // -15%
    analysis.recommendations.push(
      'Reduzir volume inicial em 15% por precaução',
      'Incluir fortalecimento preventivo 2x por semana',
      'Progressão de volume mais conservadora (5-8% por semana)',
      'Atenção especial ao aquecimento e alongamento',
      'Considerar fisioterapia preventiva'
    );
  }

  // Lesões crônicas requerem atenção especial
  if (analysis.chronicInjuries.length > 0) {
    analysis.recommendations.push(
      'Atenção: lesões crônicas identificadas',
      'Evitar treinos que historicamente agravam a lesão',
      'Considerar avaliação biomecânica',
      'Implementar protocolo de prevenção específico'
    );
  }

  // Gerar exercícios de prevenção específicos
  injuries.forEach(injury => {
    const exercises = getPreventionExercises(injury.type);
    exercises.forEach(ex => {
      if (!analysis.preventionExercises.find(e => e.name === ex.name)) {
        analysis.preventionExercises.push(ex);
      }
    });
  });

  return analysis;
}

/**
 * Retorna exercícios de prevenção específicos por tipo de lesão
 */
export function getPreventionExercises(injuryType: string): PreventionExercise[] {
  const injuryLower = injuryType.toLowerCase();
  const exercises: PreventionExercise[] = [];

  // Fascite Plantar
  if (injuryLower.includes('fascite') || injuryLower.includes('plantar')) {
    exercises.push(
      {
        name: 'Alongamento de Panturrilha na Parede',
        description: 'Apoiar mãos na parede, uma perna à frente flexionada, outra atrás estendida. Empurrar calcanhar da perna de trás no chão.',
        frequency: '2-3x ao dia',
        duration: '30 segundos cada perna',
        targetInjury: 'Fascite Plantar',
      },
      {
        name: 'Massagem com Bola na Sola do Pé',
        description: 'Rolar bola de tênis ou garrafa congelada sob o arco do pé com pressão moderada.',
        frequency: 'Diariamente',
        duration: '3-5 minutos cada pé',
        targetInjury: 'Fascite Plantar',
      },
      {
        name: 'Alongamento com Toalha',
        description: 'Sentado, passar toalha sob os dedos do pé e puxar em direção ao corpo, mantendo joelho estendido.',
        frequency: '2x ao dia',
        duration: '20-30 segundos, 3 repetições',
        targetInjury: 'Fascite Plantar',
      }
    );
  }

  // Canelite (Shin Splints)
  if (injuryLower.includes('canelite') || injuryLower.includes('shin') || injuryLower.includes('canela')) {
    exercises.push(
      {
        name: 'Fortalecimento de Tibial Anterior',
        description: 'Sentado, elevar dedos dos pés mantendo calcanhar no chão. Pode adicionar resistência com elástico.',
        frequency: '3x por semana',
        duration: '3 séries de 15 repetições',
        targetInjury: 'Canelite',
      },
      {
        name: 'Escrita com o Pé',
        description: 'Sentado, "escrever" o alfabeto no ar com os dedos do pé, movimentando apenas o tornozelo.',
        frequency: 'Diariamente',
        duration: '2-3 alfabetos cada pé',
        targetInjury: 'Canelite',
      },
      {
        name: 'Caminhada nos Calcanhares',
        description: 'Caminhar apoiando apenas nos calcanhares, dedos elevados, por 30-60 segundos.',
        frequency: '2-3x por semana',
        duration: '3 séries de 30-60 segundos',
        targetInjury: 'Canelite',
      }
    );
  }

  // Condromalácia Patelar (Joelho do Corredor)
  if (injuryLower.includes('joelho') || injuryLower.includes('condromalácia') || injuryLower.includes('patelar')) {
    exercises.push(
      {
        name: 'Fortalecimento de VMO (Vasto Medial Oblíquo)',
        description: 'Sentado, joelho 30° flexionado, contrair quadríceps empurrando joelho para baixo, manter 5 segundos.',
        frequency: '3x por semana',
        duration: '3 séries de 15 repetições',
        targetInjury: 'Condromalácia Patelar',
      },
      {
        name: 'Agachamento na Parede',
        description: 'Costas na parede, descer até 60-90° de flexão, manter posição. Joelhos alinhados com pés.',
        frequency: '2-3x por semana',
        duration: '3 séries de 30-60 segundos',
        targetInjury: 'Condromalácia Patelar',
      },
      {
        name: 'Ponte de Glúteo',
        description: 'Deitado, joelhos flexionados, elevar quadril contraindo glúteos, manter 3 segundos.',
        frequency: '3x por semana',
        duration: '3 séries de 15 repetições',
        targetInjury: 'Condromalácia Patelar',
      }
    );
  }

  // Tendinite de Aquiles
  if (injuryLower.includes('aquiles') || injuryLower.includes('tendinite') || injuryLower.includes('tendão')) {
    exercises.push(
      {
        name: 'Elevação Excêntrica de Panturrilha',
        description: 'Na borda de um degrau, subir com as duas pernas, descer lentamente com uma só (4-5 segundos).',
        frequency: '3x por semana',
        duration: '3 séries de 12 repetições cada perna',
        targetInjury: 'Tendinite de Aquiles',
      },
      {
        name: 'Alongamento de Sóleo',
        description: 'Igual alongamento de panturrilha mas com joelho da perna de trás levemente flexionado.',
        frequency: '2x ao dia',
        duration: '30 segundos cada perna, 3 repetições',
        targetInjury: 'Tendinite de Aquiles',
      }
    );
  }

  // Síndrome da Banda Iliotibial
  if (injuryLower.includes('banda') || injuryLower.includes('iliotibial') || injuryLower.includes('tfl')) {
    exercises.push(
      {
        name: 'Liberação Miofascial com Rolo',
        description: 'Deitar de lado sobre rolo de espuma, rolar da lateral do quadril até joelho.',
        frequency: 'Diariamente',
        duration: '2-3 minutos cada lado',
        targetInjury: 'Banda Iliotibial',
      },
      {
        name: 'Alongamento de TFL',
        description: 'Em pé, cruzar perna afetada atrás, inclinar tronco para lado oposto.',
        frequency: '2x ao dia',
        duration: '30 segundos cada lado, 3 repetições',
        targetInjury: 'Banda Iliotibial',
      },
      {
        name: 'Fortalecimento de Abdutores',
        description: 'Deitado de lado, elevar perna de cima mantendo-a estendida e ligeiramente para trás.',
        frequency: '3x por semana',
        duration: '3 séries de 15 repetições cada lado',
        targetInjury: 'Banda Iliotibial',
      }
    );
  }

  // Síndrome do Piriforme
  if (injuryLower.includes('piriforme') || injuryLower.includes('glúteo') || injuryLower.includes('ciático')) {
    exercises.push(
      {
        name: 'Alongamento do Piriforme (Figura 4)',
        description: 'Deitado, cruzar tornozelo sobre joelho oposto, puxar coxa em direção ao peito.',
        frequency: '2-3x ao dia',
        duration: '30-60 segundos cada lado',
        targetInjury: 'Síndrome do Piriforme',
      },
      {
        name: 'Liberação com Bola de Tênis',
        description: 'Sentado, colocar bola de tênis sob glúteo, rolar sobre pontos de tensão.',
        frequency: 'Diariamente',
        duration: '3-5 minutos cada lado',
        targetInjury: 'Síndrome do Piriforme',
      }
    );
  }

  // Exercícios gerais de prevenção (sempre incluir)
  if (exercises.length === 0) {
    exercises.push(
      {
        name: 'Fortalecimento de Core (Prancha)',
        description: 'Posição de prancha, corpo alinhado, contrair abdômen e glúteos.',
        frequency: '3x por semana',
        duration: '3 séries de 30-60 segundos',
        targetInjury: 'Prevenção Geral',
      },
      {
        name: 'Agachamento Unilateral',
        description: 'Agachamento em uma perna só, manter equilíbrio e controle.',
        frequency: '2-3x por semana',
        duration: '3 séries de 10 repetições cada perna',
        targetInjury: 'Prevenção Geral',
      }
    );
  }

  return exercises;
}

/**
 * Interpreta o nível de sono
 */
export function interpretSleep(quality: number): string {
  if (quality === 5) return 'Excelente (8h+)';
  if (quality === 4) return 'Bom (7-8h)';
  if (quality === 3) return 'Regular (6-7h)';
  if (quality === 2) return 'Ruim (5-6h)';
  return 'Péssimo (<5h)';
}

/**
 * Interpreta o nível de estresse
 */
export function interpretStress(level: number): string {
  if (level === 1) return 'Muito baixo';
  if (level === 2) return 'Baixo';
  if (level === 3) return 'Moderado';
  if (level === 4) return 'Alto';
  return 'Muito alto';
}

/**
 * Gera mensagens de recomendação baseadas em lesões
 */
export function generateInjuryRecommendations(injuries: InjuryDetail[]): string[] {
  const recommendations: string[] = [];
  
  injuries.forEach(injury => {
    if (injury.status === 'recovering') {
      recommendations.push(
        `⚠️ Lesão em recuperação detectada: ${injury.type}`,
        `Consulte um profissional antes de aumentar volume`
      );
    }
    
    if (injury.status === 'chronic') {
      recommendations.push(
        `⚠️ Lesão crônica identificada: ${injury.type}`,
        `Implementar protocolo de prevenção obrigatório`,
        `Considerar avaliação biomecânica completa`
      );
    }
    
    if (injury.recurringRisk === 'alto') {
      recommendations.push(
        `⚠️ Alto risco de recorrência: ${injury.type}`,
        `Manter exercícios de prevenção indefinidamente`
      );
    }
  });
  
  return recommendations;
}
