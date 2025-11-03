'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface AnalysisData {
  hasSuggestion: boolean;
  isPremiumFeature?: boolean;
  completionRate?: number;
  message?: string;
  teaser?: string;
  suggestion?: string;
  confidence?: string;
  reasons?: string[];
  adjustmentType?: string;
}

export default function ProgressAnalysisBanner() {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      const response = await fetch('/api/plan/analyze-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      }
    } catch (error) {
      console.error('Erro ao buscar análise:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAdjustment = async () => {
    setApplying(true);
    
    // Toast informativo sobre o processo
    toast.loading('Gerando novo plano... Isso pode levar até 60 segundos.', { 
      id: 'applying',
      duration: 65000 // Manter por 65s
    });

    try {
      // Timeout aumentado para 90 segundos (geração IA pode demorar)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      const response = await fetch('/api/plan/auto-adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'ai_analysis',
          analysis: analysis
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const preservedWeeks = data.changes?.preservedWeeks || 0;
        
        const message = preservedWeeks > 0 
          ? `Plano ajustado! ${preservedWeeks} semanas anteriores preservadas.`
          : 'Plano ajustado com sucesso!';
        
        toast.success(message, { id: 'applying', duration: 4000 });
        
        // Aguardar 2s antes de recarregar para usuário ver sucesso
        setTimeout(() => {
          window.location.reload();
        }, 2500);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erro ao aplicar ajuste', { id: 'applying' });
        console.error('Erro no ajuste:', errorData);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.error('Tempo esgotado. Tente novamente.', { id: 'applying' });
      } else {
        toast.error('Erro ao aplicar ajuste. Verifique sua conexão.', { id: 'applying' });
      }
      console.error('Erro ao aplicar ajuste:', error);
    } finally {
      setApplying(false);
    }
  };

  if (loading) return null;
  if (!analysis || !analysis.hasSuggestion) return null;

  // Usuário FREE com sugestão disponível
  if (analysis.isPremiumFeature) {
    return (
      <Alert className="mb-6 border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50">
        <Sparkles className="h-5 w-5 text-amber-600" />
        <AlertDescription>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1">
              <p className="font-semibold text-amber-900 mb-1">
                🎯 Análise Inteligente Disponível
              </p>
              <p className="text-sm text-amber-800">
                {analysis.message}
              </p>
              {analysis.teaser && (
                <p className="text-xs text-amber-700 mt-2 italic">
                  💡 {analysis.teaser}
                </p>
              )}
              {analysis.completionRate !== undefined && (
                <p className="text-xs text-amber-700 mt-1">
                  Taxa de conclusão: {analysis.completionRate}%
                </p>
              )}
            </div>
            <Link href="/assinatura">
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white whitespace-nowrap"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade Premium
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Usuário PREMIUM com sugestão
  return (
    <Alert className="mb-6 border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50">
      <TrendingUp className="h-5 w-5 text-blue-600" />
      <AlertDescription>
        <div className="space-y-3">
          <div>
            <p className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4" />
              Sugestão Inteligente de Ajuste
            </p>
            <p className="text-sm text-blue-800 mb-2">
              {analysis.suggestion}
            </p>
            {analysis.reasons && analysis.reasons.length > 0 && (
              <div className="text-xs text-blue-700 space-y-1">
                <p className="font-medium">Motivos:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {analysis.reasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={handleApplyAdjustment}
              disabled={applying}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
            >
              {applying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aplicando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Aplicar Ajuste
                </>
              )}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setAnalysis(null)}
            >
              Dispensar
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
