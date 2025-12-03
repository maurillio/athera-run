/**
 * ATHERA FLEX v3.3.0 - Adjustment History Panel
 * Painel que mostra histórico de ajustes aplicados
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CheckCircle2, TrendingUp, Undo2, Filter, Download } from 'lucide-react';
import { formatLocalizedDate } from '@/lib/utils/date-formatter';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface AdjustmentHistoryItem {
  id: number;
  workoutId: number;
  adjustmentType: string;
  originalDate: Date;
  newDate: Date | null;
  originalDistance: number | null;
  newDistance: number | null;
  triggeredBy: string;
  reason: string | null;
  confidence: number | null;
  autoApplied: boolean;
  approved: boolean;
  approvedAt: Date | null;
  undoneAt: Date | null;
  createdAt: Date;
  workout: {
    id: number;
    title: string;
    type: string;
    date: Date;
    distance: number | null;
  };
}

interface AdjustmentHistoryPanelProps {
  limit?: number;
  showFilters?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AdjustmentHistoryPanel({
  limit = 30,
  showFilters = true,
}: AdjustmentHistoryPanelProps) {
  const { data: session } = useSession();
  const [adjustments, setAdjustments] = useState<AdjustmentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'manual' | 'auto'>('all');
  const [undoingId, setUndoingId] = useState<number | null>(null);

  // Buscar histórico
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/athera-flex/history');
      if (!response.ok) throw new Error('Erro ao buscar histórico');
      
      const data = await response.json();
      setAdjustments(data.adjustments || []);
    } catch (error: any) {
      console.error('[History] Error:', error);
      toast.error('Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  // Desfazer ajuste
  const handleUndo = async (adjustmentId: number) => {
    if (!confirm('Tem certeza que deseja desfazer este ajuste?')) return;

    setUndoingId(adjustmentId);
    try {
      const response = await fetch(`/api/athera-flex/undo/${adjustmentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Desfazer via painel' }),
      });

      if (!response.ok) throw new Error('Erro ao desfazer ajuste');

      toast.success('Ajuste desfeito com sucesso');
      fetchHistory(); // Recarregar
    } catch (error: any) {
      console.error('[Undo] Error:', error);
      toast.error(error.message || 'Erro ao desfazer ajuste');
    } finally {
      setUndoingId(null);
    }
  };

  // Filtrar ajustes
  const filteredAdjustments = adjustments.filter(adj => {
    if (filter === 'all') return true;
    if (filter === 'manual') return !adj.autoApplied;
    if (filter === 'auto') return adj.autoApplied;
    return true;
  }).filter(adj => !adj.undoneAt); // Não mostrar desfeitos

  // Calcular dias desde o ajuste
  const getDaysSince = (date: Date) => {
    const now = Date.now();
    const diff = now - new Date(date).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  // Pode desfazer? (até 7 dias)
  const canUndo = (adjustment: AdjustmentHistoryItem) => {
    if (adjustment.undoneAt) return false;
    const days = getDaysSince(adjustment.approvedAt || adjustment.createdAt);
    return days <= 7;
  };

  // Trigger badge color
  const getTriggerBadge = (triggeredBy: string) => {
    switch (triggeredBy) {
      case 'ai_auto':
        return <Badge className="bg-purple-500">Auto</Badge>;
      case 'ai_suggestion':
        return <Badge className="bg-blue-500">IA</Badge>;
      case 'athlete_manual':
        return <Badge variant="outline">Manual</Badge>;
      case 'coach':
        return <Badge className="bg-green-500">Coach</Badge>;
      default:
        return <Badge variant="secondary">{triggeredBy}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico de Ajustes
          </span>
          
          {showFilters && (
            <div className="flex gap-2">
              <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="manual">Manuais</SelectItem>
                  <SelectItem value="auto">Automáticos</SelectItem>
                </SelectContent>
              </Select>

              <Button size="sm" variant="outline" onClick={fetchHistory}>
                Atualizar
              </Button>
            </div>
          )}
        </CardTitle>
        <CardDescription>
          Últimos {limit} ajustes aplicados (você pode desfazer em até 7 dias)
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando histórico...</p>
          </div>
        )}

        {!loading && filteredAdjustments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum ajuste encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Ajustes aplicados aparecerão aqui
            </p>
          </div>
        )}

        {!loading && filteredAdjustments.length > 0 && (
          <div className="space-y-3">
            {filteredAdjustments.map((adjustment) => (
              <Card key={adjustment.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Info Principal */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <h4 className="font-semibold">{adjustment.workout.title}</h4>
                        {getTriggerBadge(adjustment.triggeredBy)}
                        
                        {adjustment.confidence && (
                          <Badge variant="secondary">
                            {adjustment.confidence}% confiança
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Planejado: {formatLocalizedDate(adjustment.originalDate, 'pt-BR')}
                        </div>
                        {adjustment.newDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Executado: {formatLocalizedDate(adjustment.newDate, 'pt-BR')}
                          </div>
                        )}
                      </div>

                      {(adjustment.originalDistance || adjustment.newDistance) && (
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <TrendingUp className="h-3 w-3" />
                          {adjustment.originalDistance && (
                            <span>Planejado: {adjustment.originalDistance.toFixed(2)}km</span>
                          )}
                          {adjustment.newDistance && (
                            <>
                              <span>→</span>
                              <span>Executado: {adjustment.newDistance.toFixed(2)}km</span>
                              {adjustment.originalDistance && (
                                <span className="text-muted-foreground">
                                  ({((adjustment.newDistance - adjustment.originalDistance) / adjustment.originalDistance * 100).toFixed(0)}%)
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {adjustment.reason && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          "{adjustment.reason}"
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground mt-2">
                        Aplicado há {getDaysSince(adjustment.approvedAt || adjustment.createdAt)} dias
                      </p>
                    </div>

                    {/* Undo Button */}
                    {canUndo(adjustment) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUndo(adjustment.id)}
                        disabled={undoingId === adjustment.id}
                        className="shrink-0"
                      >
                        <Undo2 className="h-4 w-4 mr-2" />
                        {undoingId === adjustment.id ? 'Desfazendo...' : 'Desfazer'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Export Button (futuro) */}
        {filteredAdjustments.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="flex justify-end">
              <Button size="sm" variant="outline" disabled>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV (Em breve)
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
