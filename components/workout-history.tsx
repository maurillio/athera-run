
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'; // New import
import { History, Activity, Clock, Heart, TrendingUp, MoreVertical } from 'lucide-react';
import WorkoutLogForm from './workout-log-form'; // New import
import { useTranslations } from '@/lib/i18n/hooks';

interface Workout {
  id: number;
  date: string;
  type: string;
  subtype: string | null;
  distance: number | null;
  duration: number | null;
  pace: string | null;
  avgHeartRate: number | null;
  perceivedEffort: number | null;
  feeling: string | null;
  notes: string | null;
  source: string; // Added source property
}

interface WorkoutHistoryProps {
  athleteId: number;
}

export default function WorkoutHistory({ athleteId }: WorkoutHistoryProps) {
  const t = useTranslations('workoutHistory');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // New state
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null); // New state

  useEffect(() => {
    fetchWorkouts();
  }, [athleteId]);

  const fetchWorkouts = async () => {
    try {
      const response = await fetch(`/api/workouts/recent?athleteId=${athleteId}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setWorkouts(data);
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (workoutId: number) => { // Changed type to number
    if (!confirm(t('confirmDelete'))) return;
    try {
      const response = await fetch(`/api/workouts/${workoutId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchWorkouts(); // Refresh the list
      } else {
        console.error('Erro ao excluir treino:', await response.json());
        alert(t('deleteError'));
      }
    } catch (error) {
      console.error('Erro de rede ao excluir treino:', error);
      alert(t('networkError'));
    }
  };

    const handleEdit = (workout: Workout) => {
      setEditingWorkout(workout);
      setIsEditModalOpen(true);
    };
  
    const handleWorkoutSaved = () => {
      setIsEditModalOpen(false);
      setEditingWorkout(null);
      fetchWorkouts(); // Refresh the list
    };
  
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
      });
    };
  const getTypeLabel = (type: string) => {
    return t(`types.${type}` as any) || type;
  };

  const getSubtypeLabel = (subtype: string | null) => {
    if (!subtype) return '';
    return t(`subtypes.${subtype}` as any) || subtype;
  };

  const getFeelingEmoji = (feeling: string | null) => {
    const emojis: { [key: string]: string } = {
      great: '🔥',
      good: '👍',
      ok: '😐',
      tired: '😴',
      bad: '😰'
    };
    return feeling ? emojis[feeling] || '' : '';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (workouts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {t('title')}
          </CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>{t('noWorkouts')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          {t('title')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-600" />
                  <div>
                    <h4 className="font-semibold">
                      {getTypeLabel(workout.type)}
                      {workout.subtype && ` - ${getSubtypeLabel(workout.subtype)}`}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(workout.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {workout.feeling && (
                    <span className="text-2xl">{getFeelingEmoji(workout.feeling)}</span>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">{t('openMenu')}</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(workout)}>
                        {t('edit')}
                      </DropdownMenuItem>
                      {workout.source === 'manual' && (
                        <DropdownMenuItem onClick={() => handleDelete(workout.id)}>
                          {t('delete')}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {workout.type === 'running' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                  {workout.distance && (
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span>{workout.distance.toFixed(1)} km</span>
                    </div>
                  )}
                  {workout.duration && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{workout.duration} min</span>
                    </div>
                  )}
                  {workout.pace && (
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span>{workout.pace}</span>
                    </div>
                  )}
                  {workout.avgHeartRate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span>{workout.avgHeartRate} bpm</span>
                    </div>
                  )}
                </div>
              )}

              {workout.perceivedEffort && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-muted-foreground">{t('effort')}</span>
                  <div className="flex gap-1">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-4 rounded ${
                          i < (workout.perceivedEffort || 0)
                            ? 'bg-orange-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{workout.perceivedEffort}/10</span>
                </div>
              )}

              {workout.notes && (
                <p className="text-sm text-muted-foreground italic mt-2">
                  "{workout.notes}"
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('editTitle')}</DialogTitle>
          </DialogHeader>
          {editingWorkout && (
            <WorkoutLogForm
              athleteId={athleteId}
              initialWorkout={editingWorkout}
              onWorkoutSaved={handleWorkoutSaved}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
