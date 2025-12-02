/**
 * ATHERA FLEX v3.4.0 - Energy Dashboard
 * Dashboard de energia/fadiga com análise inteligente
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Battery, 
  BatteryLow, 
  BatteryMedium, 
  BatteryFull,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Moon,
  Activity,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface EnergyData {
  level: number; // 0-100
  status: 'fresh' | 'moderate' | 'tired' | 'exhausted';
  trend: 'improving' | 'stable' | 'declining';
  tssLoad: number;
  recommendation: 'full' | 'modified' | 'skip' | 'rest';
  factors: {
    sleep?: number;
    stress?: number;
    recentLoad?: number;
  };
  message: string;
}

interface EnergyDashboardProps {
  date?: Date;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
  onRecommendation?: (recommendation: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EnergyDashboard({
  date = new Date(),
  showDetails = true,
  compact = false,
  className,
  onRecommendation,
}: EnergyDashboardProps) {
  const [energy, setEnergy] = useState<EnergyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEnergy = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/context/energy?date=${date.toISOString().split('T')[0]}`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar energia');
      }

      const data = await response.json();
      setEnergy(data);

      if (onRecommendation) {
        onRecommendation(data.recommendation);
      }
    } catch (err) {
      console.error('Erro ao buscar energia:', err);
      setError('Não foi possível carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnergy();
  }, [date]);

  // Loading state
  if (loading) {
    return (
      <Card className={cn('border-purple-200', className)}>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          <span className="ml-2 text-sm text-gray-600">Analisando energia...</span>
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
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchEnergy}
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
  if (!energy) return null;

  // Ícone de bateria baseado no nível
  const getBatteryIcon = () => {
    if (energy.level >= 75) return <BatteryFull className="h-6 w-6" />;
    if (energy.level >= 50) return <BatteryMedium className="h-6 w-6" />;
    if (energy.level >= 25) return <BatteryLow className="h-6 w-6" />;
    return <Battery className="h-6 w-6" />;
  };

  // Ícone de tendência
  const getTrendIcon = () => {
    if (energy.trend === 'improving') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (energy.trend === 'declining') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  // Cor baseada no status
  const getStatusColor = () => {
    if (energy.status === 'fresh') return 'text-green-600 bg-green-100';
    if (energy.status === 'moderate') return 'text-blue-600 bg-blue-100';
    if (energy.status === 'tired') return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  // Label do status
  const getStatusLabel = () => {
    if (energy.status === 'fresh') return 'Fresco';
    if (energy.status === 'moderate') return 'Normal';
    if (energy.status === 'tired') return 'Cansado';
    return 'Exausto';
  };

  // Recomendação
  const getRecommendationBadge = () => {
    const variants = {
      full: { color: 'bg-green-500', label: '✓ Treino Completo', icon: CheckCircle },
      modified: { color: 'bg-blue-500', label: '~ Treino Ajustado', icon: Activity },
      skip: { color: 'bg-orange-500', label: '⚠ Considerar Descanso', icon: AlertCircle },
      rest: { color: 'bg-red-500', label: '✕ Descanso Obrigatório', icon: AlertCircle },
    };

    const rec = variants[energy.recommendation];
    const Icon = rec.icon;

    return (
      <Badge className={cn('text-white font-medium', rec.color)}>
        <Icon className="h-3 w-3 mr-1" />
        {rec.label}
      </Badge>
    );
  };

  // Compact version
  if (compact) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className={cn('flex items-center gap-1 px-3 py-1.5 rounded-full', getStatusColor())}>
          {getBatteryIcon()}
          <span className="text-sm font-semibold ml-1">{energy.level}%</span>
        </div>
        {getRecommendationBadge()}
      </div>
    );
  }

  // Full version
  return (
    <Card className={cn('border-purple-200', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            Nível de Energia
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchEnergy}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score principal */}
        <div className="flex items-center gap-4">
          <div className={cn('p-4 rounded-full', getStatusColor())}>
            {getBatteryIcon()}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-3xl font-bold">{energy.level}%</p>
              <div className="flex items-center gap-2">
                {getTrendIcon()}
                <Badge variant="outline" className={cn('font-medium', getStatusColor())}>
                  {getStatusLabel()}
                </Badge>
              </div>
            </div>
            <Progress value={energy.level} className="h-2" />
          </div>
        </div>

        {/* Recomendação */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Recomendação:</span>
            {getRecommendationBadge()}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {energy.message}
          </p>
        </div>

        {/* Fatores (se detalhes habilitado) */}
        {showDetails && Object.keys(energy.factors).length > 0 && (
          <div className="space-y-3 pt-3 border-t">
            <p className="text-sm font-medium text-gray-700">Fatores Analisados:</p>
            
            <div className="grid grid-cols-2 gap-3">
              {energy.factors.sleep !== undefined && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <Moon className="h-4 w-4 text-indigo-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Sono</p>
                    <p className="text-sm font-medium">{energy.factors.sleep}/10</p>
                  </div>
                </div>
              )}

              {energy.factors.stress !== undefined && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <Activity className="h-4 w-4 text-red-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Stress</p>
                    <p className="text-sm font-medium">{energy.factors.stress}/10</p>
                  </div>
                </div>
              )}

              {energy.factors.recentLoad !== undefined && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 col-span-2">
                  <Zap className="h-4 w-4 text-purple-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Carga Acumulada (7 dias)</p>
                    <p className="text-sm font-medium">{energy.factors.recentLoad.toFixed(0)} TSS</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TSS Load */}
        <div className="flex items-center justify-between pt-2 border-t text-xs text-gray-500">
          <span>TSS Atual: {energy.tssLoad.toFixed(0)}</span>
          <span>Tendência: {energy.trend === 'improving' ? '↗' : energy.trend === 'declining' ? '↘' : '→'}</span>
        </div>
      </CardContent>
    </Card>
  );
}
