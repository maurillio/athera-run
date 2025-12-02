/**
 * ATHERA FLEX v3.4.0 - Recovery Score
 * Componente de recovery score com análise de recuperação
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Activity,
  Moon,
  Dumbbell,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ============================================================================
// TYPES
// ============================================================================

interface RecoveryData {
  score: number; // 0-100
  status: 'optimal' | 'good' | 'fair' | 'poor';
  canDoHard: boolean;
  needsRest: boolean;
  isFatigued: boolean;
  factors: {
    recentIntensity: number;
    consecutiveDays: number;
    lastRestDay: number;
    hrvScore?: number;
  };
  recommendation: string;
  nextAction: string;
}

interface RecoveryScoreProps {
  date?: Date;
  workoutIntensity?: 'easy' | 'moderate' | 'hard';
  showFactors?: boolean;
  compact?: boolean;
  className?: string;
  onDecision?: (canDoHard: boolean) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function RecoveryScore({
  date = new Date(),
  workoutIntensity = 'moderate',
  showFactors = true,
  compact = false,
  className,
  onDecision,
}: RecoveryScoreProps) {
  const [recovery, setRecovery] = useState<RecoveryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecovery = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/context/recovery?date=${date.toISOString().split('T')[0]}&intensity=${workoutIntensity}`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar recuperação');
      }

      const data = await response.json();
      setRecovery(data);

      if (onDecision) {
        onDecision(data.canDoHard);
      }
    } catch (err) {
      console.error('Erro ao buscar recuperação:', err);
      setError('Não foi possível carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecovery();
  }, [date, workoutIntensity]);

  // Loading state
  if (loading) {
    return (
      <Card className={cn('border-blue-200', className)}>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2 text-sm text-gray-600">Calculando recuperação...</span>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn('border-red-200', className)}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchRecovery}
              className="text-red-600 hover:text-red-700"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data
  if (!recovery) return null;

  // Cor baseada no status
  const getStatusColor = () => {
    if (recovery.status === 'optimal') return 'text-green-600 bg-green-100 border-green-300';
    if (recovery.status === 'good') return 'text-blue-600 bg-blue-100 border-blue-300';
    if (recovery.status === 'fair') return 'text-orange-600 bg-orange-100 border-orange-300';
    return 'text-red-600 bg-red-100 border-red-300';
  };

  // Label do status
  const getStatusLabel = () => {
    if (recovery.status === 'optimal') return 'Ótima';
    if (recovery.status === 'good') return 'Boa';
    if (recovery.status === 'fair') return 'Regular';
    return 'Ruim';
  };

  // Ícone de decisão
  const getDecisionIcon = () => {
    if (recovery.needsRest) return <XCircle className="h-5 w-5 text-red-600" />;
    if (recovery.canDoHard) return <CheckCircle className="h-5 w-5 text-green-600" />;
    return <AlertTriangle className="h-5 w-5 text-orange-600" />;
  };

  // Compact version
  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full border-2',
          getStatusColor()
        )}>
          <Heart className="h-4 w-4" />
          <span className="text-sm font-semibold">{recovery.score}%</span>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              {getDecisionIcon()}
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{recovery.recommendation}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  // Full version
  return (
    <Card className={cn('border-2', getStatusColor().split('bg-')[0] + 'border-' + getStatusColor().split('border-')[1], className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Recovery Score
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchRecovery}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score principal */}
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center">
            <div className={cn(
              'absolute inset-0 rounded-full border-8',
              recovery.score >= 75 ? 'border-green-200' :
              recovery.score >= 50 ? 'border-blue-200' :
              recovery.score >= 25 ? 'border-orange-200' : 'border-red-200'
            )}></div>
            <div className="relative p-8">
              <p className="text-5xl font-bold">{recovery.score}</p>
              <p className="text-sm text-gray-500 mt-1">/ 100</p>
            </div>
          </div>
          
          <Badge className={cn('mt-4 text-sm', getStatusColor())}>
            Recuperação: {getStatusLabel()}
          </Badge>
        </div>

        {/* Decisões */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t">
          <div className={cn(
            'flex flex-col items-center p-3 rounded-lg border-2',
            recovery.canDoHard ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          )}>
            {recovery.canDoHard ? (
              <CheckCircle className="h-5 w-5 text-green-600 mb-1" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-400 mb-1" />
            )}
            <p className="text-xs text-center font-medium">Treino Intenso</p>
          </div>

          <div className={cn(
            'flex flex-col items-center p-3 rounded-lg border-2',
            !recovery.isFatigued ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
          )}>
            {!recovery.isFatigued ? (
              <CheckCircle className="h-5 w-5 text-blue-600 mb-1" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-orange-500 mb-1" />
            )}
            <p className="text-xs text-center font-medium">Sem Fadiga</p>
          </div>

          <div className={cn(
            'flex flex-col items-center p-3 rounded-lg border-2',
            !recovery.needsRest ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          )}>
            {!recovery.needsRest ? (
              <CheckCircle className="h-5 w-5 text-green-600 mb-1" />
            ) : (
              <Moon className="h-5 w-5 text-red-600 mb-1" />
            )}
            <p className="text-xs text-center font-medium">Pronto</p>
          </div>
        </div>

        {/* Recomendação */}
        <div className={cn(
          'rounded-lg p-3 border-2',
          recovery.needsRest ? 'bg-red-50 border-red-200' :
          recovery.canDoHard ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
        )}>
          <div className="flex items-start gap-2">
            {getDecisionIcon()}
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">{recovery.recommendation}</p>
              <p className="text-xs text-gray-600">{recovery.nextAction}</p>
            </div>
          </div>
        </div>

        {/* Fatores */}
        {showFactors && (
          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">Fatores Analisados</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-gray-50">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-500" />
                  <span className="text-xs text-gray-600">Intensidade Recente</span>
                </div>
                <span className="text-sm font-medium">{recovery.factors.recentIntensity.toFixed(0)}%</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-gray-50">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-gray-600">Dias Consecutivos</span>
                </div>
                <span className="text-sm font-medium">{recovery.factors.consecutiveDays} dias</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-gray-50">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs text-gray-600">Último Descanso</span>
                </div>
                <span className="text-sm font-medium">há {recovery.factors.lastRestDay} dias</span>
              </div>

              {recovery.factors.hrvScore !== undefined && (
                <div className="flex items-center justify-between p-2 rounded bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-gray-600">HRV Score</span>
                  </div>
                  <span className="text-sm font-medium">{recovery.factors.hrvScore}/100</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
