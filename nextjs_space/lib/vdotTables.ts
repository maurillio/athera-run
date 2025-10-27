
// Tabelas VDOT de Jack Daniels para cálculo preciso de paces
// Baseado em estudos científicos de fisiologia do exercício

export interface VDOTPaces {
  easy: string;      // 65-79% HRmax
  marathon: string;  // 80-90% HRmax
  threshold: string; // 88-92% HRmax
  interval: string;  // 98-100% HRmax
  repetition: string; // Pace de 1500m
}

// Tabela simplificada de VDOT para paces (min:seg por km)
// Fonte: Jack Daniels' Running Formula
const VDOT_TABLE: Record<number, VDOTPaces> = {
  30: { easy: '7:05', marathon: '6:24', threshold: '5:53', interval: '5:13', repetition: '4:48' },
  35: { easy: '6:24', marathon: '5:47', threshold: '5:19', interval: '4:43', repetition: '4:20' },
  40: { easy: '5:53', marathon: '5:19', threshold: '4:53', interval: '4:20', repetition: '3:59' },
  45: { easy: '5:28', marathon: '4:56', threshold: '4:32', interval: '4:01', repetition: '3:42' },
  50: { easy: '5:07', marathon: '4:37', threshold: '4:14', interval: '3:45', repetition: '3:28' },
  55: { easy: '4:50', marathon: '4:21', threshold: '4:00', interval: '3:32', repetition: '3:16' },
  60: { easy: '4:35', marathon: '4:08', threshold: '3:47', interval: '3:21', repetition: '3:06' },
  65: { easy: '4:22', marathon: '3:56', threshold: '3:36', interval: '3:11', repetition: '2:57' },
  70: { easy: '4:11', marathon: '3:46', threshold: '3:27', interval: '3:03', repetition: '2:50' },
  75: { easy: '4:01', marathon: '3:37', threshold: '3:18', interval: '2:56', repetition: '2:43' },
};

export function getVDOTPaces(vdot: number): VDOTPaces {
  // Arredondar para o VDOT mais próximo na tabela
  const roundedVDOT = Math.round(vdot / 5) * 5;
  const clampedVDOT = Math.max(30, Math.min(75, roundedVDOT));
  
  return VDOT_TABLE[clampedVDOT];
}

// Estima VDOT baseado em tempo de corrida recente
export function estimateVDOTFromRace(distance: string, timeInMinutes: number): number {
  // Fórmulas baseadas em equivalências de performance de Jack Daniels
  if (distance === '5k') {
    // 5K em minutos -> VDOT
    if (timeInMinutes >= 35) return 30; // ~35min = iniciante
    if (timeInMinutes >= 30) return 35; // ~30min
    if (timeInMinutes >= 26) return 40; // ~26min
    if (timeInMinutes >= 23) return 45; // ~23min
    if (timeInMinutes >= 21) return 50; // ~21min
    if (timeInMinutes >= 19) return 55; // ~19min
    if (timeInMinutes >= 18) return 60; // ~18min
    return 65;
  }
  
  if (distance === '10k') {
    if (timeInMinutes >= 75) return 30;
    if (timeInMinutes >= 65) return 35;
    if (timeInMinutes >= 57) return 40;
    if (timeInMinutes >= 51) return 45;
    if (timeInMinutes >= 46) return 50;
    if (timeInMinutes >= 42) return 55;
    if (timeInMinutes >= 39) return 60;
    return 65;
  }
  
  if (distance === 'half_marathon') {
    if (timeInMinutes >= 165) return 30; // ~2h45min
    if (timeInMinutes >= 145) return 35; // ~2h25min
    if (timeInMinutes >= 125) return 40; // ~2h05min
    if (timeInMinutes >= 110) return 45; // ~1h50min
    if (timeInMinutes >= 100) return 50; // ~1h40min
    if (timeInMinutes >= 92) return 55; // ~1h32min
    if (timeInMinutes >= 85) return 60; // ~1h25min
    return 65;
  }
  
  if (distance === 'marathon') {
    if (timeInMinutes >= 350) return 30; // ~5h50min
    if (timeInMinutes >= 310) return 35; // ~5h10min
    if (timeInMinutes >= 270) return 40; // ~4h30min
    if (timeInMinutes >= 240) return 45; // ~4h00min
    if (timeInMinutes >= 215) return 50; // ~3h35min
    if (timeInMinutes >= 195) return 55; // ~3h15min
    if (timeInMinutes >= 180) return 60; // ~3h00min
    return 65;
  }
  
  // Default baseado no nível
  return 45;
}

// Estima VDOT baseado no nível de experiência
export function estimateVDOTFromLevel(level: string, hasRecentRace: boolean = false): number {
  const baseVDOT = {
    beginner: 35,     // Iniciante: nunca correu ou menos de 6 meses
    intermediate: 50, // Intermediário: 6 meses a 2 anos, corre regularmente
    advanced: 60,     // Avançado: mais de 2 anos, treina consistentemente
  };
  
  const vdot = baseVDOT[level as keyof typeof baseVDOT] || 45;
  
  // Se não tem corrida recente, reduzir um pouco
  if (!hasRecentRace && level !== 'beginner') {
    return vdot - 5;
  }
  
  return vdot;
}

// Converte pace string (min:seg/km) para segundos por km
export function paceToSeconds(pace: string): number {
  const [min, sec] = pace.replace('/km', '').split(':').map(Number);
  return min * 60 + sec;
}

// Converte segundos por km para pace string
export function secondsToPace(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}/km`;
}

/**
 * Calcula VDOT baseado nos paces usuais informados pelo usuário
 * Usa múltiplas distâncias para maior precisão
 * 
 * @param usualPaces - Objeto com paces usuais: { "5k": "5:30", "10k": "6:00", ... }
 * @returns VDOT estimado baseado nos paces reais do usuário
 */
export function estimateVDOTFromPaces(usualPaces: Record<string, string>): number | null {
  if (!usualPaces || Object.keys(usualPaces).length === 0) {
    return null;
  }

  const vdotEstimates: number[] = [];

  // Para cada distância com pace informado, calcular tempo total e estimar VDOT
  Object.entries(usualPaces).forEach(([distance, pace]) => {
    if (!pace || pace === 'never' || pace === '' || pace === 'N/A') return;

    // Extrair números do pace (formato: "5:00-5:30")
    // Pegar o valor médio se for um range
    let avgPaceSeconds: number;
    
    if (pace.includes('-')) {
      const [min, max] = pace.split('-').map(p => paceToSeconds(p.trim()));
      avgPaceSeconds = (min + max) / 2;
    } else {
      avgPaceSeconds = paceToSeconds(pace);
    }

    // Calcular tempo total para a distância
    let distanceKm: number;
    let distanceKey: string;
    
    if (distance === '5k') {
      distanceKm = 5;
      distanceKey = '5k';
    } else if (distance === '10k') {
      distanceKm = 10;
      distanceKey = '10k';
    } else if (distance === '21k' || distance === 'half_marathon') {
      distanceKm = 21.1;
      distanceKey = 'half_marathon';
    } else if (distance === '42k' || distance === 'marathon') {
      distanceKm = 42.2;
      distanceKey = 'marathon';
    } else {
      return; // Distância não reconhecida
    }

    const totalTimeMinutes = (avgPaceSeconds * distanceKm) / 60;
    const estimatedVDOT = estimateVDOTFromRace(distanceKey, totalTimeMinutes);
    
    vdotEstimates.push(estimatedVDOT);
  });

  // Se não conseguiu estimar nenhum VDOT, retornar null
  if (vdotEstimates.length === 0) {
    return null;
  }

  // Retornar a média dos VDOTs estimados para maior precisão
  const avgVDOT = vdotEstimates.reduce((sum, v) => sum + v, 0) / vdotEstimates.length;
  
  // Arredondar para o inteiro mais próximo
  return Math.round(avgVDOT);
}

// Calcula pace alvo para um treino baseado no VDOT e tipo
export function calculateTargetPace(vdot: number, workoutType: string): string {
  const paces = getVDOTPaces(vdot);
  
  switch (workoutType) {
    case 'easy':
    case 'recovery':
      return paces.easy;
    case 'long':
      // Long runs são um pouco mais lentos que easy
      const easySeconds = paceToSeconds(paces.easy);
      return secondsToPace(easySeconds + 10);
    case 'marathon':
      return paces.marathon;
    case 'tempo':
    case 'threshold':
      return paces.threshold;
    case 'intervals':
    case 'interval':
      return paces.interval;
    case 'repetitions':
    case 'repetition':
      return paces.repetition;
    default:
      return paces.easy;
  }
}
