
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CheckCircle, Info, Sparkles, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface TrainingLog {
  id: number;
  date: string;
  overallFeeling: string | null;
  workoutCompleted: boolean;
  hasPain: boolean;
  hasInjury: boolean;
  hasIllness: boolean;
  aiAnalysis: string | null;
  aiAlerts: any;
  requiresAttention: boolean;
  notes: string | null;
  energyLevel: number | null;
}

export default function AIAnalysisSection() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchRecentLogs();
  }, []);

  const fetchRecentLogs = async () => {
    try {
      const response = await fetch('/api/training-log?limit=7');
      if (response.ok) {
        const { logs: fetchedLogs } = await response.json();
        setLogs(fetchedLogs);
        
        // Extrair alertas
        const allAlerts = fetchedLogs
          .filter((log: TrainingLog) => log.requiresAttention && log.aiAlerts)
          .flatMap((log: TrainingLog) => 
            Array.isArray(log.aiAlerts) ? log.aiAlerts.map((alert: any) => ({ ...alert, logDate: log.date })) : []
          );
        
        setAlerts(allAlerts);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'medium': return <Info className="h-5 w-5 text-amber-600" />;
      default: return <CheckCircle className="h-5 w-5 text-blue-600" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-amber-200 bg-amber-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getFeelingIcon = (feeling: string | null) => {
    if (!feeling) return null;
    
    const icons: { [key: string]: { icon: any; color: string } } = {
      excellent: { icon: Sparkles, color: 'text-emerald-600' },
      good: { icon: CheckCircle, color: 'text-green-600' },
      ok: { icon: Info, color: 'text-slate-600' },
      tired: { icon: AlertTriangle, color: 'text-amber-600' },
      bad: { icon: AlertTriangle, color: 'text-orange-600' },
      exhausted: { icon: AlertTriangle, color: 'text-red-600' }
    };
    
    const config = icons[feeling] || { icon: Info, color: 'text-slate-600' };
    const Icon = config.icon;
    return <Icon className={`h-4 w-4 ${config.color}`} />;
  };

  if (loading) {
    return (
      <Card className="border-slate-200 shadow-elevation-2">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {alerts.length > 0 && (
        <Card className="border-slate-200 shadow-elevation-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Alertas e Recomendações
            </CardTitle>
            <CardDescription className="text-slate-600">
              Pontos de atenção identificados pela IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert, index) => (
              <Alert key={index} className={getAlertColor(alert.severity)}>
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.severity)}
                  <div className="flex-1">
                    <AlertDescription>
                      <div className="font-semibold mb-1">{alert.type.replace(/_/g, ' ').toUpperCase()}</div>
                      <div className="text-sm">{alert.message}</div>
                      <div className="text-xs text-muted-foreground mt-2">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {new Date(alert.logDate).toLocaleDateString('pt-BR')}
                      </div>
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Últimos Relatos */}
      <Card className="border-slate-200 shadow-elevation-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Sparkles className="h-5 w-5 text-brand-primary" />
            Últimos Relatos
          </CardTitle>
          <CardDescription className="text-slate-600">
            Seu histórico recente de treinos e sensações
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>Nenhum relato ainda.</p>
              <p className="text-sm mt-2">Comece a registrar seus treinos!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-elevation-2 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-md">
                          {getFeelingIcon(log.overallFeeling)}
                          <span className="text-xs font-medium text-slate-600 capitalize">
                            {log.overallFeeling || 'N/A'}
                          </span>
                        </div>
                        <span className="font-semibold text-slate-900">
                          {new Date(log.date).toLocaleDateString('pt-BR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {log.workoutCompleted ? (
                          <Badge variant="outline" className="bg-emerald-50 border-emerald-300 text-emerald-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Treino Completado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-slate-50 border-slate-300 text-slate-800">
                            Treino Não Completado
                          </Badge>
                        )}
                        {log.hasPain && (
                          <Badge variant="outline" className="bg-orange-50 border-orange-300 text-orange-800">
                            Dor Reportada
                          </Badge>
                        )}
                        {log.hasInjury && (
                          <Badge variant="outline" className="bg-red-50 border-red-300 text-red-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Lesão
                          </Badge>
                        )}
                        {log.hasIllness && (
                          <Badge variant="outline" className="bg-blue-50 border-blue-300 text-blue-800">
                            Doença
                          </Badge>
                        )}
                        {log.energyLevel && (
                          <Badge variant="outline" className="bg-slate-50 border-slate-300 text-slate-800">
                            Energia: {log.energyLevel}/10
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {log.notes && (
                    <p className="text-sm text-muted-foreground mt-2 mb-2">
                      <strong>Notas:</strong> {log.notes}
                    </p>
                  )}

                  {log.aiAnalysis && (
                    <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded">
                      <p className="text-xs font-semibold mb-1 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-purple-600" />
                        Análise IA
                      </p>
                      <div className="text-xs text-muted-foreground whitespace-pre-wrap">
                        {log.aiAnalysis.split('\n').slice(0, 3).join('\n')}...
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
