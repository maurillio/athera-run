/**
 * ATHERA FLEX v3.4.0 - Proactive Suggestions
 * Componente de sugestões proativas inteligentes
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Calendar,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Lightbulb,
  Target,
  Zap,
  Info,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================================================
// TYPES
// ============================================================================

interface ProactiveSuggestion {
  id: string;
  type: 'reschedule' | 'swap' | 'rest' | 'optimize' | 'alert';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  confidence: number;
  impact: string;
  action?: {
    label: string;
    endpoint: string;
    payload: any;
  };
  workouts?: {
    from: { date: Date; type: string; distance?: number };
    to: { date: Date; type: string; distance?: number };
  };
}

interface ProactiveSuggestionsProps {
  weekStart?: Date;
  weekEnd?: Date;
  maxSuggestions?: number;
  showImpact?: boolean;
  autoRefresh?: boolean;
  className?: string;
  onApply?: (suggestionId: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ProactiveSuggestions({
  weekStart,
  weekEnd,
  maxSuggestions = 5,
  showImpact = true,
  autoRefresh = false,
  className,
  onApply,
}: ProactiveSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ProactiveSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [dates, setDates] = useState({
    start: null as Date | null,
    end: null as Date | null
  });

  useEffect(() => {
    setMounted(true);
    setDates({
      start: weekStart || new Date(),
      end: weekEnd || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
  }, [weekStart, weekEnd]);

  // Prevent hydration errors
  if (!mounted || !dates.start || !dates.end) {
    return (
      <Card className={cn('border-indigo-200', className)}>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </CardContent>
      </Card>
    );
  }

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/athera-flex/proactive/suggestions?start=${dates.start.toISOString()}&end=${dates.end.toISOString()}`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar sugestões');
      }

      const data = await response.json();
      setSuggestions(data.suggestions?.slice(0, maxSuggestions) || []);
    } catch (err) {
      console.error('Erro ao buscar sugestões:', err);
      setError('Não foi possível carregar sugestões');
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = async (suggestion: ProactiveSuggestion) => {
    if (!suggestion.action) return;

    setApplying(suggestion.id);

    try {
      const response = await fetch(suggestion.action.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestion.action.payload),
      });

      if (!response.ok) {
        throw new Error('Erro ao aplicar sugestão');
      }

      // Remover da lista
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));

      if (onApply) {
        onApply(suggestion.id);
      }
    } catch (err) {
      console.error('Erro ao aplicar sugestão:', err);
      alert('Erro ao aplicar sugestão. Tente novamente.');
    } finally {
      setApplying(null);
    }
  };

  useEffect(() => {
    fetchSuggestions();

    if (autoRefresh) {
      const interval = setInterval(fetchSuggestions, 5 * 60 * 1000); // 5 min
      return () => clearInterval(interval);
    }
  }, [weekStart, weekEnd, autoRefresh]);

  // Ícone por tipo
  const getTypeIcon = (type: string) => {
    if (type === 'reschedule') return <Calendar className="h-4 w-4" />;
    if (type === 'swap') return <ArrowRight className="h-4 w-4" />;
    if (type === 'rest') return <Clock className="h-4 w-4" />;
    if (type === 'optimize') return <TrendingUp className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  // Cor por prioridade
  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'border-red-300 bg-red-50';
    if (priority === 'medium') return 'border-orange-300 bg-orange-50';
    return 'border-blue-300 bg-blue-50';
  };

  // Loading state
  if (loading && suggestions.length === 0) {
    return (
      <Card className={cn('border-purple-200', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          <span className="ml-2 text-sm text-gray-600">Gerando sugestões inteligentes...</span>
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
              onClick={fetchSuggestions}
              className="text-red-600 hover:text-red-700"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No suggestions
  if (suggestions.length === 0) {
    return (
      <Card className={cn('border-green-200', className)}>
        <CardContent className="py-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <p className="font-medium text-gray-900 mb-1">Tudo ótimo!</p>
          <p className="text-sm text-gray-600">Nenhuma sugestão no momento. Seu plano está bem organizado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-purple-200', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Sugestões Inteligentes
            <Badge variant="outline" className="ml-2">
              {suggestions.length}
            </Badge>
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchSuggestions}
            className="h-8 w-8 p-0"
            disabled={loading}
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={cn(
              'rounded-lg border-2 p-4 transition-all hover:shadow-md',
              getPriorityColor(suggestion.priority)
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-2">
                <div className={cn(
                  'p-1.5 rounded-lg',
                  suggestion.priority === 'high' ? 'bg-red-200 text-red-700' :
                  suggestion.priority === 'medium' ? 'bg-orange-200 text-orange-700' :
                  'bg-blue-200 text-blue-700'
                )}>
                  {getTypeIcon(suggestion.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{suggestion.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {suggestion.description}
                  </p>
                </div>
              </div>

              <Badge 
                variant="outline" 
                className={cn(
                  'ml-2 text-xs',
                  suggestion.confidence >= 90 ? 'border-green-500 text-green-700' :
                  suggestion.confidence >= 75 ? 'border-blue-500 text-blue-700' :
                  'border-gray-500 text-gray-700'
                )}
              >
                {suggestion.confidence}%
              </Badge>
            </div>

            {/* Workout details */}
            {suggestion.workouts && (
              <div className="my-3 p-2 rounded bg-white/50 border border-gray-200">
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex-1">
                    <p className="font-medium text-gray-700">
                      {format(suggestion.workouts.from.date, 'EEE, dd/MMM', { locale: ptBR })}
                    </p>
                    <p className="text-gray-500">
                      {suggestion.workouts.from.type}
                      {suggestion.workouts.from.distance && ` • ${suggestion.workouts.from.distance}km`}
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 text-purple-600 flex-shrink-0" />

                  <div className="flex-1">
                    <p className="font-medium text-gray-700">
                      {format(suggestion.workouts.to.date, 'EEE, dd/MMM', { locale: ptBR })}
                    </p>
                    <p className="text-gray-500">
                      {suggestion.workouts.to.type}
                      {suggestion.workouts.to.distance && ` • ${suggestion.workouts.to.distance}km`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Impact */}
            {showImpact && suggestion.impact && (
              <div className="flex items-start gap-2 my-2 p-2 rounded bg-white/50">
                <Lightbulb className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700 leading-relaxed">
                  <span className="font-medium">Impacto:</span> {suggestion.impact}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-200">
              {suggestion.action && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8"
                    onClick={() => {
                      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
                    }}
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Ignorar
                  </Button>

                  <Button
                    size="sm"
                    className="text-xs h-8 bg-purple-600 hover:bg-purple-700"
                    onClick={() => applySuggestion(suggestion)}
                    disabled={applying === suggestion.id}
                  >
                    {applying === suggestion.id ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Aplicando...
                      </>
                    ) : (
                      <>
                        <Zap className="h-3 w-3 mr-1" />
                        {suggestion.action.label}
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Info footer */}
        <div className="flex items-center gap-2 pt-3 border-t text-xs text-gray-500">
          <Info className="h-3 w-3" />
          <p>
            Sugestões baseadas em IA • Atualizado em tempo real
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
