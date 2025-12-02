/**
 * ATHERA FLEX v3.4.0 - Adjustment Explanation Modal
 * Modal que explica em linguagem natural o porquê de um ajuste
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  TrendingUp, 
  Calendar,
  Target,
  Info,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface AdjustmentExplanation {
  summary: string;
  reasons: {
    title: string;
    description: string;
    impact: 'positive' | 'neutral' | 'negative';
  }[];
  mlFactors: {
    dateMatch: number;
    typeMatch: number;
    volumeMatch: number;
    intensityMatch: number;
  };
  recommendation: string;
  confidence: number;
}

interface AdjustmentExplanationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adjustmentId: string;
  plannedWorkout?: {
    date: Date;
    type: string;
    distance: number;
  };
  completedWorkout?: {
    date: Date;
    type: string;
    distance: number;
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AdjustmentExplanationModal({
  open,
  onOpenChange,
  adjustmentId,
  plannedWorkout,
  completedWorkout,
}: AdjustmentExplanationModalProps) {
  const [explanation, setExplanation] = useState<AdjustmentExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && adjustmentId) {
      fetchExplanation();
    }
  }, [open, adjustmentId]);

  const fetchExplanation = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/athera-flex/explain/${adjustmentId}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar explicação');
      }

      const data = await response.json();
      setExplanation(data);
    } catch (err) {
      console.error('Erro ao buscar explicação:', err);
      setError('Não foi possível carregar a explicação');
    } finally {
      setLoading(false);
    }
  };

  const getImpactIcon = (impact: string) => {
    if (impact === 'positive') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (impact === 'negative') return <AlertCircle className="h-4 w-4 text-red-600" />;
    return <Info className="h-4 w-4 text-blue-600" />;
  };

  const getImpactColor = (impact: string) => {
    if (impact === 'positive') return 'border-green-200 bg-green-50';
    if (impact === 'negative') return 'border-red-200 bg-red-50';
    return 'border-blue-200 bg-blue-50';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <DialogTitle>Por Que Este Ajuste?</DialogTitle>
          </div>
          <DialogDescription>
            Explicação detalhada gerada por IA sobre o match inteligente
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className="ml-3 text-gray-600">Gerando explicação...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <AlertCircle className="h-5 w-5 inline mr-2" />
            {error}
          </div>
        )}

        {explanation && !loading && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Sparkles className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-purple-900 mb-2">Resumo</h3>
                  <p className="text-sm text-purple-800 leading-relaxed">
                    {explanation.summary}
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    'font-semibold',
                    explanation.confidence >= 90 ? 'border-green-500 text-green-700' :
                    explanation.confidence >= 75 ? 'border-blue-500 text-blue-700' :
                    'border-orange-500 text-orange-700'
                  )}
                >
                  {explanation.confidence}% confiança
                </Badge>
              </div>
            </div>

            {/* Workout Comparison */}
            {plannedWorkout && completedWorkout && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border-2 border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Planejado</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {plannedWorkout.date.toLocaleDateString('pt-BR')}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {plannedWorkout.type}
                  </p>
                  <p className="text-sm text-gray-600">
                    {plannedWorkout.distance}km
                  </p>
                </div>

                <div className="p-3 border-2 border-purple-200 rounded-lg bg-purple-50">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Realizado</span>
                  </div>
                  <p className="text-xs text-purple-600">
                    {completedWorkout.date.toLocaleDateString('pt-BR')}
                  </p>
                  <p className="font-semibold text-purple-900">
                    {completedWorkout.type}
                  </p>
                  <p className="text-sm text-purple-700">
                    {completedWorkout.distance}km
                  </p>
                </div>
              </div>
            )}

            {/* ML Factors */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Análise do Machine Learning
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Match de Data</span>
                    <Badge variant="outline" className="text-xs">
                      {explanation.mlFactors.dateMatch}%
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${explanation.mlFactors.dateMatch}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Match de Tipo</span>
                    <Badge variant="outline" className="text-xs">
                      {explanation.mlFactors.typeMatch}%
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${explanation.mlFactors.typeMatch}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Match de Volume</span>
                    <Badge variant="outline" className="text-xs">
                      {explanation.mlFactors.volumeMatch}%
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${explanation.mlFactors.volumeMatch}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Match de Intensidade</span>
                    <Badge variant="outline" className="text-xs">
                      {explanation.mlFactors.intensityMatch}%
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all"
                      style={{ width: `${explanation.mlFactors.intensityMatch}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Reasons */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                Razões do Ajuste
              </h3>
              
              <div className="space-y-3">
                {explanation.reasons.map((reason, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      'p-4 border-2 rounded-lg',
                      getImpactColor(reason.impact)
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {getImpactIcon(reason.impact)}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{reason.title}</h4>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          {reason.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-purple-900 mb-2">
                    Recomendação da IA
                  </h3>
                  <p className="text-sm text-purple-800 leading-relaxed">
                    {explanation.recommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Fechar
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  // Aqui poderia abrir o coach chat
                  onOpenChange(false);
                }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Conversar com Coach
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
