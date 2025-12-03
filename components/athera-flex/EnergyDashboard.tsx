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
  Zap,
  LineChart as LineChartIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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
  history?: Array<{
    date: string;
    level: number;
    tss: number;
  }>;
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
  date: propDate,
  showDetails = true,
  compact = false,
  className,
  onRecommendation,
}: EnergyDashboardProps) {
  const [energy, setEnergy] = useState<EnergyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDate(propDate || new Date());
  }, [propDate]);

  // Prevent hydration errors
  if (!mounted || !date) {
    return (
      <Card className={cn('border-purple-200', className)}>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
        </CardContent>
      </Card>
    );
  }

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

      const apiResponse = await response.json();
      
      // API retorna: { success: true, context: { currentLevel, trend, ... } }
      // Componente espera: { level, status, trend, tssLoad, recommendation, factors, message }
      if (apiResponse.success && apiResponse.context) {
        const ctx = apiResponse.context;
        
        // Mapear estrutura da API para estrutura do componente
        const mappedData: EnergyData = {
          level: ctx.currentLevel || 75,
          status: getStatusFromLevel(ctx.currentLevel || 75),
          trend: ctx.trend === 'increasing' ? 'improving' : 
                 ctx.trend === 'decreasing' ? 'declining' : 'stable',
          tssLoad: 0, // Calculado no backend, não retornado
          recommendation: ctx.recommendation || 'full',
          factors: {
            sleep: ctx.sleepQuality === 'excellent' ? 9 : 
                   ctx.sleepQuality === 'good' ? 7 :
                   ctx.sleepQuality === 'fair' ? 5 : 3,
            stress: ctx.stressLevel || 5,
            recentLoad: 0, // Não retornado pela API
          },
          message: ctx.reason || 'Sem dados suficientes',
          history: generateMockHistory(ctx.currentLevel || 75, ctx.trend || 'stable'),
        };

        setEnergy(mappedData);

        if (onRecommendation) {
          onRecommendation(mappedData.recommendation);
        }
      } else {
        throw new Error('Resposta da API inválida');
      }
    } catch (err) {
      console.error('Erro ao buscar energia:', err);
      setError('Não foi possível carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  // Helper: Converte nível numérico em status
  const getStatusFromLevel = (level: number): 'fresh' | 'moderate' | 'tired' | 'exhausted' => {
    if (level >= 75) return 'fresh';
    if (level >= 50) return 'moderate';
    if (level >= 25) return 'tired';
    return 'exhausted';
  };

  // Helper: Gera histórico mock baseado no nível e tendência atuais
  const generateMockHistory = (currentLevel: number, trend: string) => {
    const history = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      let level = currentLevel;
      if (trend === 'increasing') {
        level = Math.max(20, currentLevel - (i * 5));
      } else if (trend === 'decreasing') {
        level = Math.min(100, currentLevel + (i * 5));
      } else {
        level = currentLevel + (Math.random() * 10 - 5);
      }
      
      history.push({
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        level: Math.round(Math.max(0, Math.min(100, level))),
        tss: Math.round(Math.random() * 50 + 50),
      });
    }
    
    return history;
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

        {/* Gráfico de Tendência (7 dias) */}
        {energy.history && energy.history.length > 0 && (
          <div className="space-y-2 pt-3 border-t">
            <div className="flex items-center gap-2">
              <LineChartIcon className="h-4 w-4 text-purple-600" />
              <p className="text-sm font-medium text-gray-700">Tendência (7 dias)</p>
            </div>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={energy.history} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    stroke="#9ca3af"
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    stroke="#9ca3af"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="level" 
                    stroke="#9333ea" 
                    strokeWidth={2}
                    dot={{ fill: '#9333ea', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Energia"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-purple-600" />
                <span>Nível de Energia</span>
              </div>
            </div>
          </div>
        )}

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
