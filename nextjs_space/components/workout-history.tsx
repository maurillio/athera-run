
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, Activity, Clock, Heart, TrendingUp } from 'lucide-react';

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
}

interface WorkoutHistoryProps {
  athleteId: number;
}

export default function WorkoutHistory({ athleteId }: WorkoutHistoryProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short' 
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      running: 'Corrida',
      strength: 'Musculação',
      swimming: 'Natação',
      cross_training: 'Treino Cruzado',
      rest: 'Descanso'
    };
    return labels[type] || type;
  };

  const getSubtypeLabel = (subtype: string | null) => {
    if (!subtype) return '';
    const labels: { [key: string]: string } = {
      easy: 'Fácil',
      tempo: 'Tempo',
      intervals: 'Intervalado',
      long: 'Longão',
      recovery: 'Recuperação'
    };
    return labels[subtype] || subtype;
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
            Histórico de Treinos
          </CardTitle>
          <CardDescription>Seus últimos 10 treinos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>Nenhum treino registrado ainda. Comece a registrar seus treinos acima!</p>
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
          Histórico de Treinos
        </CardTitle>
        <CardDescription>Seus últimos 10 treinos registrados</CardDescription>
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
                {workout.feeling && (
                  <span className="text-2xl">{getFeelingEmoji(workout.feeling)}</span>
                )}
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
                  <span className="text-sm text-muted-foreground">Esforço:</span>
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
    </Card>
  );
}
