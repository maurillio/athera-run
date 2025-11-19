
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Zap,
  Activity,
  BrainCircuit
} from 'lucide-react';
import { toast } from 'sonner';

interface Analysis {
  id: number;
  needsAdjustment: boolean;
  adjustmentType: string | null;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  summary: string;
}

export default function AutoAdjustCard() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [autoAdjustEnabled, setAutoAdjustEnabled] = useState(false);
  const [adjustmentApplied, setAdjustmentApplied] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Carregar configuração ao montar
  useEffect(() => {
    fetchAutoAdjustSettings();
  }, []);

  const fetchAutoAdjustSettings = async () => {
    try {
      const response = await fetch('/api/profile/auto-adjust-settings');
      if (response.ok) {
        const data = await response.json();
        setAutoAdjustEnabled(data.autoAdjustEnabled || false);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const toggleAutoAdjust = async (enabled: boolean) => {
    setSavingSettings(true);
    try {
      const response = await fetch('/api/profile/auto-adjust-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoAdjustEnabled: enabled })
      });

      if (!response.ok) throw new Error('Erro ao salvar configuração');

      setAutoAdjustEnabled(enabled);
      
      if (enabled) {
        toast.success('✅ Ajuste automático ativado! Seu plano será ajustado conforme sua evolução.');
      } else {
        toast.info('Ajuste automático desativado.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configuração');
    } finally {
      setSavingSettings(false);
    }
  };

  const analyzeAndAdjust = async () => {
    setLoading(true);
    setAnalysis(null);
    setAdjustmentApplied(false);

    try {
      const response = await fetch('/api/ai/analyze-and-adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoApply: autoAdjustEnabled
        })
      });

      if (!response.ok) throw new Error('Erro ao analisar');

      const data = await response.json();
      
      setAnalysis(data.analysis);
      setAdjustmentApplied(data.adjustmentApplied);

      if (data.adjustmentApplied) {
        toast.success('Plano ajustado automaticamente! ✅');
      } else if (data.analysis.needsAdjustment) {
        toast.info('Ajuste recomendado. Ative o modo automático para aplicar.');
      } else {
        toast.success('Seu plano está adequado! Continue assim! 💪');
      }
    } catch (error) {
      console.error('Error analyzing:', error);
      toast.error('Erro ao analisar dados');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getAdjustmentLabel = (type: string | null) => {
    const labels: Record<string, string> = {
      reduce_volume: 'Reduzir Volume',
      increase_rest: 'Aumentar Descanso',
      skip_intensity: 'Pular Intensos',
      full_rest: 'Descanso Total'
    };
    return type ? labels[type] : 'Nenhum';
  };

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-elevation-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-brand-primary" />
            <CardTitle className="text-xl text-slate-900">Ajuste Inteligente</CardTitle>
          </div>
          <Sparkles className="h-6 w-6 text-brand-primary" />
        </div>
        <CardDescription className="text-slate-600">
          Análise completa do seu histórico para ajustes progressivos e científicos
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Toggle de Aplicação Automática */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
          <div className="space-y-0.5">
            <Label htmlFor="auto-adjust" className="text-base font-medium flex items-center gap-2 text-slate-900">
              Ajuste Automático
              {autoAdjustEnabled && (
                <Badge variant="default" className="bg-emerald-500">
                  Ativo
                </Badge>
              )}
            </Label>
            <p className="text-sm text-slate-600">
              Ajusta o plano automaticamente baseado em toda sua evolução
            </p>
          </div>
          <Switch
            id="auto-adjust"
            checked={autoAdjustEnabled}
            onCheckedChange={toggleAutoAdjust}
            disabled={savingSettings}
          />
        </div>

        {autoAdjustEnabled && (
          <Alert className="border-emerald-300 bg-emerald-50">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-slate-700">
              <strong className="text-emerald-900">Modo Automático Ativo</strong>
              <br />
              Seu plano será ajustado automaticamente toda vez que você adicionar uma nova atividade (Strava ou manual) ou relato.
              <br />
              <span className="text-xs text-slate-600">A análise considera TODO seu histórico completo de treinos e relatos.</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Botão de Análise Manual */}
        <Button
          onClick={analyzeAndAdjust}
          disabled={loading}
          variant={autoAdjustEnabled ? "outline" : "default"}
          className={autoAdjustEnabled ? "border-slate-300" : "w-full bg-gradient-to-r from-brand-primary to-red-600 hover:from-brand-secondary hover:to-red-700"}
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-5 w-5" />
              {autoAdjustEnabled ? 'Ver Última Análise' : 'Analisar e Recomendar'}
            </>
          )}
        </Button>

        {/* Resultado da Análise */}
        {analysis && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
            <Alert className={analysis.needsAdjustment ? 'border-orange-300 bg-orange-50' : 'border-emerald-300 bg-emerald-50'}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {analysis.needsAdjustment ? (
                    getSeverityIcon(analysis.severity)
                  ) : (
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <AlertDescription className="text-slate-700">
                    <p className="font-medium mb-2 text-slate-900">{analysis.summary}</p>
                    
                    {analysis.needsAdjustment && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(analysis.severity)}>
                            Prioridade: {analysis.severity === 'high' ? 'Alta' : analysis.severity === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                          <Badge variant="outline" className="border-slate-300">
                            {getAdjustmentLabel(analysis.adjustmentType)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-slate-700">
                          <strong>Motivo:</strong> {analysis.reason}
                        </p>

                        {adjustmentApplied && (
                          <Alert className="border-emerald-300 bg-emerald-50 mt-3">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            <AlertDescription className="text-slate-700">
                              <strong className="text-emerald-900">Ajuste aplicado com sucesso!</strong>
                              <br />
                              Seu plano foi modificado automaticamente. Confira na página do plano.
                            </AlertDescription>
                          </Alert>
                        )}

                        {!adjustmentApplied && !autoAdjustEnabled && (
                          <Alert className="border-blue-300 bg-blue-50 mt-3">
                            <Info className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-slate-700">
                              <strong className="text-blue-900">Dica:</strong> Ative o "Ajuste Automático" para aplicar recomendações instantaneamente.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          </div>
        )}

        {/* Informação sobre a funcionalidade */}
        <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-200">
          <p className="flex items-start gap-2">
            <BrainCircuit className="h-3.5 w-3.5 text-brand-primary flex-shrink-0 mt-0.5" />
            <span>Analisa TODO seu histórico: atividades Strava, treinos manuais e relatos</span>
          </p>
          <p className="flex items-start gap-2">
            <Activity className="h-3.5 w-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>Detecta tendências de progressão, fadiga, overtraining e lesões</span>
          </p>
          <p className="flex items-start gap-2">
            <Zap className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>Ajustes automáticos baseados em ciência e princípios de periodização</span>
          </p>
          <p className="flex items-start gap-2">
            <Sparkles className="h-3.5 w-3.5 text-brand-primary flex-shrink-0 mt-0.5" />
            <span>Individualizado: considera sua idade, experiência e restrições</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
