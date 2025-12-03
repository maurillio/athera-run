/**
 * ATHERA FLEX v4.0.6 - Proactive Week View
 * Visualização semanal de treinos com sugestões de reorganização
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface WorkoutSuggestion {
  id: string;
  originalDate: string;
  suggestedDate: string;
  type: 'reschedule' | 'swap' | 'intensity_adjust';
  workoutName: string;
  workoutType: string; // 'long_run' | 'interval' | 'easy' | 'tempo'
  originalIntensity: string;
  suggestedIntensity?: string;
  reason: string;
  confidence: number; // 0-100
  impact: 'positive' | 'neutral' | 'caution';
  estimatedImprovement: string;
}

interface DaySchedule {
  date: string;
  dayOfWeek: string;
  workouts: Array<{
    id: string;
    name: string;
    type: string;
    status: 'scheduled' | 'suggested' | 'completed';
    intensity: string;
  }>;
  suggestions: WorkoutSuggestion[];
  energyForecast?: number; // 0-100
  weatherRisk?: boolean;
}

interface ProactiveWeekViewProps {
  className?: string;
  onAcceptSuggestion?: (suggestionId: string) => void;
  onRejectSuggestion?: (suggestionId: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ProactiveWeekView({
  className,
  onAcceptSuggestion,
  onRejectSuggestion,
}: ProactiveWeekViewProps) {
  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = semana atual, 1 = próxima, etc
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const fetchWeekSuggestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/athera-flex/proactive/suggestions?weekOffset=${weekOffset}`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar sugestões');
      }

      const data = await response.json();

      if (data.success && data.suggestions) {
        // Transformar sugestões em schedule semanal
        const schedule = generateWeekSchedule(data.suggestions);
        setWeekSchedule(schedule);
      } else {
        // Fallback para dados mock
        setWeekSchedule(generateMockWeekSchedule());
      }
    } catch (err) {
      console.error('Erro ao buscar sugestões:', err);
      setError('Não foi possível carregar sugestões');
      // Mostrar dados mock mesmo com erro
      setWeekSchedule(generateMockWeekSchedule());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeekSuggestions();
  }, [weekOffset]);

  // Gerar schedule mock para desenvolvimento
  const generateMockWeekSchedule = (): DaySchedule[] => {
    const today = new Date();
    const schedule: DaySchedule[] = [];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + (weekOffset * 7) + i);
      
      const hasSuggestion = Math.random() > 0.6;
      
      schedule.push({
        date: date.toISOString().split('T')[0],
        dayOfWeek: dayNames[date.getDay()],
        workouts: [
          {
            id: `workout-${i}`,
            name: i % 3 === 0 ? 'Longão' : i % 2 === 0 ? 'Intervalado' : 'Regenerativo',
            type: i % 3 === 0 ? 'long_run' : i % 2 === 0 ? 'interval' : 'easy',
            status: 'scheduled',
            intensity: i % 2 === 0 ? 'Alta' : 'Média',
          }
        ],
        suggestions: hasSuggestion ? [{
          id: `suggestion-${i}`,
          originalDate: date.toISOString().split('T')[0],
          suggestedDate: date.toISOString().split('T')[0],
          type: 'reschedule',
          workoutName: 'Treino Intervalado',
          workoutType: 'interval',
          originalIntensity: 'Alta',
          suggestedIntensity: 'Média',
          reason: 'Energia prevista baixa para este dia. Sugerimos reduzir intensidade.',
          confidence: Math.round(Math.random() * 30 + 70),
          impact: 'positive',
          estimatedImprovement: '+15% performance prevista',
        }] : [],
        energyForecast: Math.round(Math.random() * 30 + 60),
        weatherRisk: Math.random() > 0.8,
      });
    }

    return schedule;
  };

  const generateWeekSchedule = (suggestions: any[]): DaySchedule[] => {
    // TODO: Implementar transformação de sugestões reais em schedule
    return generateMockWeekSchedule();
  };

  const handleAccept = async (suggestionId: string) => {
    setProcessingIds(prev => new Set(prev).add(suggestionId));

    try {
      const response = await fetch('/api/athera-flex/proactive/apply-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestionId, action: 'accept' }),
      });

      if (response.ok) {
        if (onAcceptSuggestion) onAcceptSuggestion(suggestionId);
        await fetchWeekSuggestions(); // Refresh
      }
    } catch (err) {
      console.error('Erro ao aceitar sugestão:', err);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(suggestionId);
        return next;
      });
    }
  };

  const handleReject = async (suggestionId: string) => {
    setProcessingIds(prev => new Set(prev).add(suggestionId));

    try {
      const response = await fetch('/api/athera-flex/proactive/apply-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestionId, action: 'reject' }),
      });

      if (response.ok) {
        if (onRejectSuggestion) onRejectSuggestion(suggestionId);
        await fetchWeekSuggestions(); // Refresh
      }
    } catch (err) {
      console.error('Erro ao rejeitar sugestão:', err);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(suggestionId);
        return next;
      });
    }
  };

  const getWeekLabel = () => {
    if (weekOffset === 0) return 'Esta Semana';
    if (weekOffset === 1) return 'Próxima Semana';
    return `Daqui a ${weekOffset} semanas`;
  };

  // Loading state
  if (loading && weekSchedule.length === 0) {
    return (
      <Card className={cn('border-blue-200', className)}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-600">Carregando semana...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-blue-200', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Visão Proativa
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
              disabled={weekOffset === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Badge variant="outline" className="font-medium">
              {getWeekLabel()}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setWeekOffset(weekOffset + 1)}
              disabled={weekOffset >= 4}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchWeekSuggestions}
              disabled={loading}
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Grid de dias */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {weekSchedule.map((day, index) => (
            <div
              key={day.date}
              className={cn(
                'p-3 rounded-lg border-2 transition-all',
                day.suggestions.length > 0 
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 bg-white',
                'hover:shadow-md'
              )}
            >
              {/* Header do dia */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    {day.dayOfWeek}
                  </p>
                  <p className="text-sm font-bold">
                    {new Date(day.date).getDate()}
                  </p>
                </div>
                {day.energyForecast && (
                  <div className="flex items-center gap-1">
                    <Zap className={cn(
                      'h-3 w-3',
                      day.energyForecast >= 75 ? 'text-green-600' :
                      day.energyForecast >= 50 ? 'text-yellow-600' :
                      'text-red-600'
                    )} />
                    <span className="text-xs font-medium">
                      {day.energyForecast}%
                    </span>
                  </div>
                )}
              </div>

              {/* Treinos agendados */}
              {day.workouts.map(workout => (
                <div
                  key={workout.id}
                  className={cn(
                    'mb-2 p-2 rounded text-xs',
                    workout.status === 'completed' && 'bg-green-100 text-green-700',
                    workout.status === 'scheduled' && 'bg-gray-100 text-gray-700',
                    workout.status === 'suggested' && 'bg-blue-100 text-blue-700'
                  )}
                >
                  <p className="font-medium truncate">{workout.name}</p>
                  <p className="text-[10px] opacity-75">{workout.intensity}</p>
                </div>
              ))}

              {/* Badge de sugestão */}
              {day.suggestions.length > 0 && (
                <Badge 
                  variant="outline" 
                  className="w-full justify-center text-[10px] bg-blue-500 text-white border-blue-600"
                >
                  {day.suggestions.length} sugestão(ões)
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* Detalhes das sugestões */}
        {weekSchedule.some(day => day.suggestions.length > 0) && (
          <div className="pt-4 border-t space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Sugestões da Semana
            </h3>

            {weekSchedule.map(day => 
              day.suggestions.map(suggestion => (
                <div
                  key={suggestion.id}
                  className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-blue-600 text-white">
                          {suggestion.confidence}% confiança
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {day.dayOfWeek}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-gray-900">
                        {suggestion.workoutName}
                      </h4>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAccept(suggestion.id)}
                        disabled={processingIds.has(suggestion.id)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        {processingIds.has(suggestion.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(suggestion.id)}
                        disabled={processingIds.has(suggestion.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {processingIds.has(suggestion.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Mudança sugerida */}
                  {suggestion.suggestedIntensity && (
                    <div className="mb-2 p-2 rounded bg-white text-sm">
                      <span className="text-gray-600">
                        {suggestion.originalIntensity}
                      </span>
                      <span className="mx-2">→</span>
                      <span className="font-medium text-blue-600">
                        {suggestion.suggestedIntensity}
                      </span>
                    </div>
                  )}

                  {/* Razão */}
                  <p className="text-sm text-gray-700 mb-2">
                    {suggestion.reason}
                  </p>

                  {/* Impacto esperado */}
                  <div className="flex items-center gap-2 text-xs">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-green-600 font-medium">
                      {suggestion.estimatedImprovement}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Estado vazio */}
        {!loading && weekSchedule.every(day => day.suggestions.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <p className="font-medium">Nenhuma sugestão no momento</p>
            <p className="text-sm">Sua semana está otimizada! 🎯</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
