
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  TrendingUp,
  AlertCircle,
  Calendar,
  BarChart3,
  Sparkles,
} from 'lucide-react';

interface Analysis {
  id: number;
  analysisType: string;
  startDate: string;
  endDate: string;
  summary: string;
  insights: string;
  recommendations: string;
  hasAlerts: boolean;
  alerts: string | null;
  metrics: any;
  createdAt: string;
}

export default function TrainingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchAnalyses();
    }
  }, [session]);

  const fetchAnalyses = async () => {
    try {
      const response = await fetch('/api/analysis/recent');
      if (response.ok) {
        const data = await response.json();
        setAnalyses(data.analyses);
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAnalysis = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/analysis/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          period: selectedPeriod,
        }),
      });

      if (response.ok) {
        await fetchAnalyses();
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao gerar análise');
      }
    } catch (error) {
      console.error('Error generating analysis:', error);
      alert('Erro ao gerar análise. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Análises com IA 🤖</h1>
            <p className="text-muted-foreground text-lg">
              Insights profundos sobre seu progresso e performance
            </p>
          </div>

          {/* Generate New Analysis */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-600" />
                Gerar Nova Análise
              </CardTitle>
              <CardDescription>
                Selecione o período e deixe a IA analisar seu progresso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex gap-2">
                  <Button
                    variant={selectedPeriod === 'weekly' ? 'default' : 'outline'}
                    onClick={() => setSelectedPeriod('weekly')}
                    disabled={generating}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Última Semana
                  </Button>
                  <Button
                    variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
                    onClick={() => setSelectedPeriod('monthly')}
                    disabled={generating}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Último Mês
                  </Button>
                </div>
                <Button
                  onClick={handleGenerateAnalysis}
                  disabled={generating}
                  className="bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Gerar Análise
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analyses List */}
          {analyses.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Nenhuma análise ainda</p>
                <p className="text-muted-foreground mb-4">
                  Registre alguns treinos e gere sua primeira análise com IA
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {analyses.map((analysis) => (
                <Card key={analysis.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-blue-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="mb-2">
                          {analysis.analysisType === 'weekly' ? 'Análise Semanal' : 'Análise Mensal'}
                        </CardTitle>
                        <CardDescription>
                          {new Date(analysis.startDate).toLocaleDateString('pt-BR')} até{' '}
                          {new Date(analysis.endDate).toLocaleDateString('pt-BR')}
                        </CardDescription>
                      </div>
                      <Badge variant={analysis.hasAlerts ? 'destructive' : 'default'}>
                        {analysis.hasAlerts ? 'Com Alertas' : 'Normal'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {/* Summary */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        Resumo
                      </h4>
                      <p className="text-muted-foreground">{analysis.summary}</p>
                    </div>

                    {/* Metrics */}
                    {analysis.metrics && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Treinos</p>
                          <p className="text-2xl font-bold">{analysis.metrics.totalWorkouts}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Distância</p>
                          <p className="text-2xl font-bold">
                            {Math.round(analysis.metrics.totalDistance * 10) / 10} km
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Performance</p>
                          <p className="text-2xl font-bold">{analysis.metrics.performanceScore}/10</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Recuperação</p>
                          <p className="text-2xl font-bold">{analysis.metrics.recoveryScore}/10</p>
                        </div>
                      </div>
                    )}

                    {/* Insights */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Insights
                      </h4>
                      <div className="space-y-2">
                        {analysis.insights.split('\n\n').map((insight, idx) => (
                          <div key={idx} className="flex gap-2">
                            <span className="text-green-600 mt-1">•</span>
                            <p className="text-muted-foreground">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-orange-600" />
                        Recomendações
                      </h4>
                      <div className="space-y-2">
                        {analysis.recommendations.split('\n\n').map((rec, idx) => (
                          <div key={idx} className="flex gap-2">
                            <span className="text-orange-600 mt-1">→</span>
                            <p className="text-muted-foreground">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Alerts */}
                    {analysis.hasAlerts && analysis.alerts && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            {analysis.alerts.split('\n\n').map((alert, idx) => (
                              <p key={idx}>{alert}</p>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Gerado em {new Date(analysis.createdAt).toLocaleString('pt-BR')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
