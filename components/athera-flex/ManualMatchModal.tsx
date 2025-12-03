/**
 * Manual Match Modal - Associação manual de treinos
 * Permite ao usuário escolher qual treino completado usar para marcar um planejado como concluído
 */

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, Calendar, Activity, ArrowRight } from 'lucide-react';
import { formatLocalizedDate } from '@/lib/utils/date-formatter';

interface ManualMatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plannedWorkout: {
    id: number;
    date: Date;
    title: string;
    type: string;
    distance?: number;
  } | null;
  onMatch: (completedWorkoutId: number) => Promise<void>;
}

export function ManualMatchModal({ 
  open, 
  onOpenChange, 
  plannedWorkout,
  onMatch 
}: ManualMatchModalProps) {
  const [completedWorkouts, setCompletedWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Buscar treinos completados quando abrir modal
  useEffect(() => {
    if (open && plannedWorkout) {
      fetchCompletedWorkouts();
    }
  }, [open, plannedWorkout]);

  const fetchCompletedWorkouts = async () => {
    setLoading(true);
    try {
      // Buscar APENAS corridas dos últimos 7 dias
      const response = await fetch('/api/workouts/completed-runs?days=7');
      if (response.ok) {
        const data = await response.json();
        setCompletedWorkouts(data.workouts || []);
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedId || !plannedWorkout) return;

    setApplying(true);
    try {
      await onMatch(selectedId);
      onOpenChange(false);
      setSelectedId(null);
    } catch (error) {
      console.error('Error applying match:', error);
      alert('Erro ao aplicar ajuste. Tente novamente.');
    } finally {
      setApplying(false);
    }
  };

  if (!plannedWorkout) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            Marcar Treino como Concluído
          </DialogTitle>
          <DialogDescription>
            Selecione qual corrida você fez nos últimos 7 dias
          </DialogDescription>
        </DialogHeader>

        {/* Treino Planejado */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-600 font-semibold mb-2">TREINO PLANEJADO</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">{plannedWorkout.title}</p>
              <p className="text-sm text-gray-600">
                {formatLocalizedDate(new Date(plannedWorkout.date))} • {plannedWorkout.type}
                {plannedWorkout.distance && ` • ${plannedWorkout.distance}km`}
              </p>
            </div>
            <Badge variant="outline">Planejado</Badge>
          </div>
        </div>

        <ArrowRight className="h-6 w-6 text-gray-400 mx-auto" />

        {/* Lista de Treinos Completados */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Selecione o treino que você FEZ:
          </p>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : completedWorkouts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma corrida encontrada nos últimos 7 dias</p>
              <p className="text-xs mt-2">Apenas corridas são listadas aqui</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {completedWorkouts.map((workout) => (
                <button
                  key={workout.id}
                  onClick={() => setSelectedId(workout.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedId === workout.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatLocalizedDate(new Date(workout.date))}
                      </span>
                    </div>
                    {selectedId === workout.id && (
                      <CheckCircle2 className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                  <p className="font-semibold text-gray-900">{workout.title || workout.type}</p>
                  <div className="flex gap-3 mt-2 text-sm text-gray-600">
                    <span>{workout.type}</span>
                    {workout.distance && <span>• {workout.distance}km</span>}
                    {workout.duration && <span>• {Math.round(workout.duration / 60)}min</span>}
                  </div>
                  {workout.source && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {workout.source === 'strava' ? 'Strava' : 'Manual'}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={applying}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleApply}
            disabled={!selectedId || applying}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            {applying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Aplicando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marcar como Concluído
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
