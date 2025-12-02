/**
 * ATHERA FLEX v3.3.0 - Workout Adjustment Modal
 * Modal principal que mostra sugestões de matches inteligentes
 */

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Calendar, CheckCircle2, XCircle, Activity, TrendingUp, Clock, Award, Zap, Info } from 'lucide-react';
import { formatLocalizedDate } from '@/lib/utils/date-formatter';
import { useTranslations } from '@/lib/i18n/hooks';
import type { MatchSuggestion } from '@/hooks/useWorkoutMatcher';

// ============================================================================
// TYPES
// ============================================================================

interface WorkoutAdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestion: MatchSuggestion | null;
  onApply: () => Promise<void>;
  onReject: () => Promise<void>;
  isPremium?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function WorkoutAdjustmentModal({
  open,
  onOpenChange,
  suggestion,
  onApply,
  onReject,
  isPremium = false,
}: WorkoutAdjustmentModalProps) {
  const t = useTranslations('flex');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!suggestion) return null;

  const { completedWorkout, plannedWorkout, bestMatch } = suggestion;
  const confidence = bestMatch.confidence;

  // Determinar cor baseado no confidence
  const getConfidenceColor = (conf: number) => {
    if (conf >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (conf >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (conf >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 90) return 'Alta Confiança';
    if (conf >= 75) return 'Boa Confiança';
    if (conf >= 60) return 'Confiança Média';
    return 'Baixa Confiança';
  };

  const handleApply = async () => {
    setLoading(true);
    setError(null);

    try {
      await onApply();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao aplicar ajuste');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setError(null);

    try {
      await onReject();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao rejeitar sugestão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Zap className="h-6 w-6 text-yellow-500" />
            Match Detectado!
          </DialogTitle>
          <DialogDescription>
            Detectamos que seu treino de {formatLocalizedDate(completedWorkout.date, 'pt-BR')} 
            pode corresponder ao treino planejado para {formatLocalizedDate(plannedWorkout?.date, 'pt-BR')}
          </DialogDescription>
        </DialogHeader>

        {/* Confidence Score */}
        <Card className={`border-2 ${getConfidenceColor(confidence)}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Confiança do Match
                </p>
                <p className="text-4xl font-extrabold">{confidence}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {getConfidenceLabel(confidence)}
                </p>
              </div>
              
              {suggestion.shouldAutoApply && isPremium && (
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Award className="h-3 w-3 mr-1" />
                  Auto-Adjust Elegível
                </Badge>
              )}
            </div>

            <Progress value={confidence} className="h-2" />
          </CardContent>
        </Card>

        {/* Comparação Lado a Lado */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Treino Executado */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                Treino Executado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Data</p>
                <p className="font-semibold flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatLocalizedDate(completedWorkout.date, 'pt-BR')}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="font-semibold flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  {completedWorkout.type}
                </p>
              </div>

              {completedWorkout.distance && (
                <div>
                  <p className="text-xs text-muted-foreground">Distância</p>
                  <p className="font-semibold flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {completedWorkout.distance.toFixed(2)} km
                  </p>
                </div>
              )}

              {completedWorkout.duration && (
                <div>
                  <p className="text-xs text-muted-foreground">Duração</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {Math.floor(completedWorkout.duration / 60)} min
                  </p>
                </div>
              )}

              {completedWorkout.pace && (
                <div>
                  <p className="text-xs text-muted-foreground">Pace</p>
                  <p className="font-semibold">{completedWorkout.pace} /km</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Treino Planejado */}
          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                Treino Planejado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Data</p>
                <p className="font-semibold flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatLocalizedDate(plannedWorkout?.date, 'pt-BR')}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Título</p>
                <p className="font-semibold">{plannedWorkout?.title}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="font-semibold flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  {plannedWorkout?.type}
                </p>
              </div>

              {plannedWorkout?.distance && (
                <div>
                  <p className="text-xs text-muted-foreground">Distância</p>
                  <p className="font-semibold flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {plannedWorkout.distance.toFixed(2)} km
                  </p>
                </div>
              )}

              {plannedWorkout?.duration && (
                <div>
                  <p className="text-xs text-muted-foreground">Duração</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {Math.floor(plannedWorkout.duration / 60)} min
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Scores Detalhados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Análise Detalhada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Date Score */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">📅 Data</span>
                <span className="text-sm font-semibold">{bestMatch.dateScore}/100</span>
              </div>
              <Progress value={bestMatch.dateScore} className="h-1" />
            </div>

            {/* Type Score */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">🏃 Tipo</span>
                <span className="text-sm font-semibold">{bestMatch.typeScore}/100</span>
              </div>
              <Progress value={bestMatch.typeScore} className="h-1" />
            </div>

            {/* Volume Score */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">📊 Volume</span>
                <span className="text-sm font-semibold">{bestMatch.volumeScore}/100</span>
              </div>
              <Progress value={bestMatch.volumeScore} className="h-1" />
            </div>

            {/* Intensity Score */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">⚡ Intensidade</span>
                <span className="text-sm font-semibold">{bestMatch.intensityScore}/100</span>
              </div>
              <Progress value={bestMatch.intensityScore} className="h-1" />
            </div>
          </CardContent>
        </Card>

        {/* Razões do Match */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="h-4 w-4" />
              Por que este match?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {bestMatch.reasons.map((reason, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                {error}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Separator />

        <div className="flex gap-3">
          <Button
            onClick={handleApply}
            disabled={loading}
            className="flex-1"
            size="lg"
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Aplicando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Aplicar Ajuste
              </>
            )}
          </Button>

          <Button
            onClick={handleReject}
            disabled={loading}
            variant="outline"
            size="lg"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Rejeitar
          </Button>
        </div>

        {/* Footer Info */}
        <p className="text-xs text-muted-foreground text-center">
          Ao aplicar, o treino de {formatLocalizedDate(plannedWorkout?.date, 'pt-BR')} será 
          marcado como completo e vinculado ao seu treino de {formatLocalizedDate(completedWorkout.date, 'pt-BR')}
        </p>
      </DialogContent>
    </Dialog>
  );
}
