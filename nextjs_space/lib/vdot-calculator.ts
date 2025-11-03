/**
 * VDOT Calculator - Jack Daniels Running Formula
 * 
 * Calcula VDOT a partir de tempos de prova e fornece paces para todas as zonas de treino.
 * VDOT é uma medida de capacidade aeróbica ajustada para eficiência de corrida.
 */

// Tabela simplificada VDOT (Jack Daniels)
// Formato: { vdot: number, paces: { 5k: seconds, 10k: seconds, 21k: seconds, 42k: seconds } }
const VDOT_TABLE = [
  { vdot: 30, times: { '5k': 1800, '10k': 3840, '21k': 8640, '42k': 18720 } }, // 30:00, 64:00, 144:00, 312:00
  { vdot: 35, times: { '5k': 1500, '10k': 3180, '21k': 7080, '42k': 15180 } }, // 25:00, 53:00, 118:00, 253:00
  { vdot: 40, times: { '5k': 1260, '10k': 2640, '21k': 5820, '42k': 12360 } }, // 21:00, 44:00, 97:00, 206:00
  { vdot: 45, times: { '5k': 1080, '10k': 2220, '21k': 4860, '42k': 10260 } }, // 18:00, 37:00, 81:00, 171:00
  { vdot: 50, times: { '5k': 930, '10k': 1920, '21k': 4140, '42k': 8700 } },   // 15:30, 32:00, 69:00, 145:00
  { vdot: 55, times: { '5k': 810, '10k': 1680, '21k': 3600, '42k': 7560 } },   // 13:30, 28:00, 60:00, 126:00
  { vdot: 60, times: { '5k': 720, '10k': 1476, '21k': 3120, '42k': 6540 } },   // 12:00, 24:36, 52:00, 109:00
  { vdot: 65, times: { '5k': 648, '10k': 1320, '21k': 2760, '42k': 5760 } },   // 10:48, 22:00, 46:00, 96:00
  { vdot: 70, times: { '5k': 588, '10k': 1188, '21k': 2460, '42k': 5100 } },   // 9:48, 19:48, 41:00, 85:00
];

/**
 * Converte tempo em string (HH:MM:SS ou MM:SS) para segundos
 */
export function parseTimeToSeconds(timeString: string): number {
  const parts = timeString.split(':').map(Number);
  
  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  } else {
    // Apenas segundos
    return parts[0];
  }
}

/**
 * Converte segundos para string formato MM:SS ou HH:MM:SS
 */
export function secondsToTimeString(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  } else {
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  }
}

/**
 * Calcula VDOT a partir de um tempo de prova
 * Usa interpolação linear entre valores da tabela
 */
export function calculateVDOTFromTime(
  distance: '5k' | '10k' | '21k' | '42k',
  timeInSeconds: number
): number | null {
  // Encontrar VDOT por interpolação
  for (let i = 0; i < VDOT_TABLE.length - 1; i++) {
    const current = VDOT_TABLE[i];
    const next = VDOT_TABLE[i + 1];
    
    const currentTime = current.times[distance];
    const nextTime = next.times[distance];
    
    // Se o tempo está entre current e next
    if (timeInSeconds >= nextTime && timeInSeconds <= currentTime) {
      // Interpolação linear
      const timeRange = currentTime - nextTime;
      const timeOffset = timeInSeconds - nextTime;
      const vdotRange = next.vdot - current.vdot;
      
      const interpolatedVDOT = next.vdot - (timeOffset / timeRange) * vdotRange;
      return Math.round(interpolatedVDOT * 10) / 10; // 1 casa decimal
    }
  }
  
  // Se tempo é muito rápido ou muito lento, usar extremos
  if (timeInSeconds < VDOT_TABLE[VDOT_TABLE.length - 1].times[distance]) {
    return VDOT_TABLE[VDOT_TABLE.length - 1].vdot;
  } else if (timeInSeconds > VDOT_TABLE[0].times[distance]) {
    return VDOT_TABLE[0].vdot;
  }
  
  return null;
}

/**
 * Calcula VDOT médio a partir de múltiplos tempos
 */
export function calculateVDOTFromBestTimes(bestTimes: Record<string, any>): number | null {
  const vdots: number[] = [];
  
  Object.entries(bestTimes).forEach(([distance, data]) => {
    if (data && data.time) {
      const timeInSeconds = typeof data.time === 'string' 
        ? parseTimeToSeconds(data.time)
        : data.time;
      
      const vdot = calculateVDOTFromTime(distance as any, timeInSeconds);
      if (vdot) {
        vdots.push(vdot);
      }
    }
  });
  
  if (vdots.length === 0) return null;
  
  // Média ponderada (tempos mais recentes têm mais peso se houver data)
  const avgVDOT = vdots.reduce((sum, v) => sum + v, 0) / vdots.length;
  return Math.round(avgVDOT * 10) / 10;
}

/**
 * Calcula paces para todas as zonas de treino baseado no VDOT
 * Retorna pace em min/km
 */
export function calculateAllPaces(vdot: number) {
  // Fórmulas de Jack Daniels para cada zona
  // Velocidade (m/min) baseada no VDOT
  
  const vo2max = 0.000104 * Math.pow(vdot, 3) - 0.0182 * Math.pow(vdot, 2) + 1.9 * vdot + 10;
  
  // Percentuais de VO2max para cada zona
  const easyPercent = 0.60; // 60-79% VO2max
  const marathonPercent = 0.84; // 84-88% VO2max
  const thresholdPercent = 0.89; // 89-92% VO2max
  const intervalPercent = 0.98; // 98-100% VO2max
  const repetitionPercent = 1.05; // 105-120% VO2max
  
  // Velocidade em m/min
  const easySpeed = vo2max * easyPercent * 16.67; // 16.67 = conversão
  const marathonSpeed = vo2max * marathonPercent * 16.67;
  const thresholdSpeed = vo2max * thresholdPercent * 16.67;
  const intervalSpeed = vo2max * intervalPercent * 16.67;
  const repetitionSpeed = vo2max * repetitionPercent * 16.67;
  
  // Converter para min/km
  const speedToPace = (speed: number) => {
    const pace = 1000 / speed; // min/km
    return secondsToTimeString(Math.round(pace * 60));
  };
  
  return {
    easy: speedToPace(easySpeed),
    marathon: speedToPace(marathonSpeed),
    threshold: speedToPace(thresholdSpeed),
    interval: speedToPace(intervalSpeed),
    repetition: speedToPace(repetitionSpeed),
  };
}

/**
 * Interpreta o nível do atleta baseado no VDOT
 */
export function interpretVDOT(vdot: number): string {
  if (vdot < 35) return 'Iniciante';
  if (vdot < 45) return 'Intermediário';
  if (vdot < 55) return 'Avançado';
  if (vdot < 65) return 'Elite Amador';
  if (vdot < 75) return 'Elite';
  return 'Elite Mundial';
}

/**
 * Interpreta FC repouso
 */
export function interpretRestingHR(hr: number): string {
  if (hr < 50) return 'Excelente (atleta adaptado)';
  if (hr < 60) return 'Muito bom';
  if (hr < 70) return 'Bom';
  if (hr < 80) return 'Regular';
  return 'Acima do normal (considere avaliação médica)';
}

/**
 * Estima FC máxima pela idade (fórmula Tanaka)
 */
export function estimateMaxHR(age: number): number {
  return Math.round(208 - (0.7 * age));
}

/**
 * Calcula zonas de FC baseadas em FC máxima e repouso (Karvonen)
 */
export function calculateHRZones(maxHR: number, restingHR: number) {
  const hrReserve = maxHR - restingHR;
  
  return {
    zone1: { // Recuperação
      min: Math.round(restingHR + hrReserve * 0.50),
      max: Math.round(restingHR + hrReserve * 0.60),
      name: 'Recuperação',
    },
    zone2: { // Base aeróbica
      min: Math.round(restingHR + hrReserve * 0.60),
      max: Math.round(restingHR + hrReserve * 0.70),
      name: 'Base Aeróbica',
    },
    zone3: { // Ritmo moderado
      min: Math.round(restingHR + hrReserve * 0.70),
      max: Math.round(restingHR + hrReserve * 0.80),
      name: 'Ritmo Moderado',
    },
    zone4: { // Limiar
      min: Math.round(restingHR + hrReserve * 0.80),
      max: Math.round(restingHR + hrReserve * 0.90),
      name: 'Limiar',
    },
    zone5: { // VO2max
      min: Math.round(restingHR + hrReserve * 0.90),
      max: maxHR,
      name: 'VO2max',
    },
  };
}

/**
 * Estima volume semanal esperado baseado no VDOT
 */
export function estimateVolumeFromVDOT(vdot: number): { min: number; max: number } {
  if (vdot < 35) return { min: 15, max: 25 };
  if (vdot < 45) return { min: 30, max: 50 };
  if (vdot < 55) return { min: 50, max: 70 };
  if (vdot < 65) return { min: 70, max: 100 };
  return { min: 100, max: 150 };
}

/**
 * Calcula IMC
 */
export function calculateIMC(weight: number, height: number): number {
  // height em cm, weight em kg
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
}

/**
 * Interpreta IMC
 */
export function interpretIMC(imc: number): string {
  if (imc < 18.5) return 'Abaixo do peso';
  if (imc < 25) return 'Peso normal';
  if (imc < 30) return 'Sobrepeso';
  if (imc < 35) return 'Obesidade Grau I';
  if (imc < 40) return 'Obesidade Grau II';
  return 'Obesidade Grau III';
}
