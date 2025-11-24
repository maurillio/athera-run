/**
 * STRAVA ACTIVITIES DASHBOARD - v3.2.0
 * FASE 3: Dashboard de atividades do Strava
 * 
 * Componente para exibir histórico completo de atividades
 * com análises e métricas avançadas
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Activity, 
  Heart, 
  MapPin, 
  Clock,
  Calendar,
  Trophy,
  Zap,
  Mountain
} from 'lucide-react';

interface StravaActivity {
  id: number;
  activityId: string;
  name: string;
  type: string;
  distance: number;
  movingTime: number;
  averagePace: string | null;
  totalElevationGain: number;
  averageHeartRate: number | null;
  maxHeartRate: number | null;
  kudosCount: number;
  locationCity: string | null;
  startDate: string;
  isRace?: boolean;
  manual: boolean;
}

interface Stats {
  totalActivities: number;
  totalDistance: number;
  totalTime: number;
  avgPace: string;
  lastSync: string;
}

export function StravaActivitiesDashboard() {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'runs' | 'races'>('all');

  useEffect(() => {
    loadActivities();
  }, [filter]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/strava/activities?filter=${filter}`);
      const data = await response.json();
      
      setActivities(data.activities || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(2) + ' km';
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600">Total de Atividades</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalActivities}</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">Distância Total</span>
            </div>
            <div className="text-2xl font-bold">
              {(stats.totalDistance / 1000).toFixed(0)} km
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-gray-600">Tempo Total</span>
            </div>
            <div className="text-2xl font-bold">
              {Math.floor(stats.totalTime / 3600)}h
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-gray-600">Pace Médio</span>
            </div>
            <div className="text-2xl font-bold">{stats.avgPace}</div>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          Todas
        </Button>
        <Button
          variant={filter === 'runs' ? 'default' : 'outline'}
          onClick={() => setFilter('runs')}
          size="sm"
        >
          Corridas
        </Button>
        <Button
          variant={filter === 'races' ? 'default' : 'outline'}
          onClick={() => setFilter('races')}
          size="sm"
        >
          Provas
        </Button>
      </div>

      {/* Lista de atividades */}
      <div className="space-y-4">
        {activities.length === 0 ? (
          <Card className="p-8 text-center">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Nenhuma atividade encontrada</p>
          </Card>
        ) : (
          activities.map((activity) => (
            <Card key={activity.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Título e badges */}
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{activity.name}</h3>
                    {activity.isRace && (
                      <Badge variant="default" className="bg-yellow-500">
                        <Trophy className="h-3 w-3 mr-1" />
                        Prova
                      </Badge>
                    )}
                    {activity.manual && (
                      <Badge variant="outline">Manual</Badge>
                    )}
                  </div>

                  {/* Métricas principais */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium">
                          {formatDistance(activity.distance)}
                        </div>
                        <div className="text-xs text-gray-500">Distância</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium">
                          {formatDuration(activity.movingTime)}
                        </div>
                        <div className="text-xs text-gray-500">Tempo</div>
                      </div>
                    </div>

                    {activity.averagePace && (
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium">
                            {activity.averagePace}
                          </div>
                          <div className="text-xs text-gray-500">Pace</div>
                        </div>
                      </div>
                    )}

                    {activity.totalElevationGain > 0 && (
                      <div className="flex items-center gap-2">
                        <Mountain className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium">
                            {activity.totalElevationGain.toFixed(0)}m
                          </div>
                          <div className="text-xs text-gray-500">Elevação</div>
                        </div>
                      </div>
                    )}

                    {activity.averageHeartRate && (
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-400" />
                        <div>
                          <div className="text-sm font-medium">
                            {Math.round(activity.averageHeartRate)} bpm
                          </div>
                          <div className="text-xs text-gray-500">FC Média</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(activity.startDate)}
                    </div>
                    {activity.locationCity && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {activity.locationCity}
                      </div>
                    )}
                    {activity.kudosCount > 0 && (
                      <div className="flex items-center gap-1">
                        ❤️ {activity.kudosCount}
                      </div>
                    )}
                  </div>
                </div>

                {/* Link para Strava */}
                <a
                  href={`https://www.strava.com/activities/${activity.activityId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Ver no Strava →
                </a>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Botão carregar mais */}
      {activities.length >= 20 && (
        <div className="text-center">
          <Button variant="outline" onClick={loadActivities}>
            Carregar mais
          </Button>
        </div>
      )}
    </div>
  );
}
