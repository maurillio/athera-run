/**
 * ATHERA FLEX v3.4.0 - Scenario Comparison
 * Comparação lado-a-lado: Plano Original vs Plano Ajustado
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Activity,
  Target,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface WorkoutSummary {
  totalWorkouts: number;
  totalDistance: number;
  totalVolume: number; // minutos
  avgIntensity: number;
  restDays: number;
}

interface ScenarioComparisonProps {
  original: WorkoutSummary;
  adjusted: WorkoutSummary;
  weekRange: {
    start: Date;
    end: Date;
  };
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ScenarioComparison({
  original,
  adjusted,
  weekRange,
  className,
}: ScenarioComparisonProps) {
  
  const calculateDiff = (original: number, adjusted: number) => {
    const diff = adjusted - original;
    const percentDiff = original === 0 ? 0 : ((diff / original) * 100);
    return { diff, percentDiff };
  };

  const getChangeIcon = (diff: number) => {
    if (diff > 5) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (diff < -5) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getChangeColor = (diff: number) => {
    if (diff > 5) return 'text-green-600';
    if (diff < -5) return 'text-red-600';
    return 'text-gray-600';
  };

  const workoutsDiff = calculateDiff(original.totalWorkouts, adjusted.totalWorkouts);
  const distanceDiff = calculateDiff(original.totalDistance, adjusted.totalDistance);
  const volumeDiff = calculateDiff(original.totalVolume, adjusted.totalVolume);
  const intensityDiff = calculateDiff(original.avgIntensity, adjusted.avgIntensity);
  const restDiff = calculateDiff(original.restDays, adjusted.restDays);

  return (
    <Card className={cn('border-purple-200', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Comparação de Cenários
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {weekRange.start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} 
            {' - '}
            {weekRange.end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Headers */}
        <div className="grid grid-cols-3 gap-4 pb-3 border-b">
          <div className="text-sm font-medium text-gray-700">Métrica</div>
          <div className="text-sm font-medium text-blue-700 text-center">Original</div>
          <div className="text-sm font-medium text-purple-700 text-center">Ajustado</div>
        </div>

        {/* Total Workouts */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-700">Total de Treinos</span>
          </div>
          <div className="text-center text-lg font-semibold text-blue-700">
            {original.totalWorkouts}
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg font-semibold text-purple-700">
              {adjusted.totalWorkouts}
            </span>
            {workoutsDiff.diff !== 0 && (
              <Badge variant="outline" className={cn('text-xs', getChangeColor(workoutsDiff.percentDiff))}>
                {getChangeIcon(workoutsDiff.percentDiff)}
                {workoutsDiff.diff > 0 ? '+' : ''}{workoutsDiff.diff}
              </Badge>
            )}
          </div>
        </div>

        {/* Total Distance */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-700">Distância Total</span>
          </div>
          <div className="text-center text-lg font-semibold text-blue-700">
            {original.totalDistance.toFixed(1)} km
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg font-semibold text-purple-700">
              {adjusted.totalDistance.toFixed(1)} km
            </span>
            {distanceDiff.diff !== 0 && (
              <Badge variant="outline" className={cn('text-xs', getChangeColor(distanceDiff.percentDiff))}>
                {getChangeIcon(distanceDiff.percentDiff)}
                {distanceDiff.percentDiff > 0 ? '+' : ''}{distanceDiff.percentDiff.toFixed(0)}%
              </Badge>
            )}
          </div>
        </div>

        {/* Volume */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-700">Volume (min)</span>
          </div>
          <div className="text-center text-lg font-semibold text-blue-700">
            {original.totalVolume} min
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg font-semibold text-purple-700">
              {adjusted.totalVolume} min
            </span>
            {volumeDiff.diff !== 0 && (
              <Badge variant="outline" className={cn('text-xs', getChangeColor(volumeDiff.percentDiff))}>
                {getChangeIcon(volumeDiff.percentDiff)}
                {volumeDiff.percentDiff > 0 ? '+' : ''}{volumeDiff.percentDiff.toFixed(0)}%
              </Badge>
            )}
          </div>
        </div>

        {/* Avg Intensity */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-700">Intensidade Média</span>
          </div>
          <div className="text-center text-lg font-semibold text-blue-700">
            {original.avgIntensity}/10
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg font-semibold text-purple-700">
              {adjusted.avgIntensity}/10
            </span>
            {intensityDiff.diff !== 0 && (
              <Badge variant="outline" className={cn('text-xs', getChangeColor(intensityDiff.percentDiff))}>
                {getChangeIcon(intensityDiff.percentDiff)}
                {intensityDiff.diff > 0 ? '+' : ''}{intensityDiff.diff.toFixed(1)}
              </Badge>
            )}
          </div>
        </div>

        {/* Rest Days */}
        <div className="grid grid-cols-3 gap-4 items-center pb-4 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-700">Dias de Descanso</span>
          </div>
          <div className="text-center text-lg font-semibold text-blue-700">
            {original.restDays}
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg font-semibold text-purple-700">
              {adjusted.restDays}
            </span>
            {restDiff.diff !== 0 && (
              <Badge variant="outline" className={cn('text-xs', getChangeColor(-restDiff.percentDiff))}>
                {getChangeIcon(-restDiff.percentDiff)}
                {restDiff.diff > 0 ? '+' : ''}{restDiff.diff}
              </Badge>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span className="text-xs text-gray-600">Plano Original</span>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-500"></div>
            <span className="text-xs text-gray-600">Plano Ajustado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
