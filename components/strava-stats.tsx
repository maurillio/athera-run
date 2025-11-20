'use client';

/**
 * Strava Stats Component
 * Exibe estatísticas detalhadas do atleta
 * PREMIUM ONLY
 */

import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Calendar, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface StravaStats {
  allRunsTotals: {
    count: number;
    distance: number;
    moving_time: number;
    elevation_gain: number;
  };
  recentRunsTotals: {
    count: number;
    distance: number;
    moving_time: number;
    elevation_gain: number;
  };
  ytdRunsTotals: {
    count: number;
    distance: number;
    moving_time: number;
    elevation_gain: number;
  };
  avgDistance: number;
  avgPace: string;
  weeklyFrequency: number;
  monthlyFrequency: number;
  lastSyncAt: string;
}

export function StravaStatsCard() {
  const [stats, setStats] = useState<StravaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/strava/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncStats = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/strava/stats', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erro ao sincronizar stats:', error);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-6 bg-neutral-800 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-neutral-800 rounded w-full"></div>
          <div className="h-4 bg-neutral-800 rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="p-6 border-neutral-800 bg-neutral-900">
        <div className="text-center py-8">
          <Activity className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
          <h3 className="text-lg font-semibold mb-2">Estatísticas não disponíveis</h3>
          <p className="text-sm text-neutral-400 mb-4">
            Sincronize seus dados do Strava para ver estatísticas detalhadas
          </p>
          <Button
            onClick={syncStats}
            disabled={syncing}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {syncing ? 'Sincronizando...' : 'Sincronizar Agora'}
          </Button>
        </div>
      </Card>
    );
  }

  const formatDistance = (meters: number) => (meters / 1000).toFixed(1);
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-4">
      {/* Header com botão de sync */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-orange-500" />
          Estatísticas do Atleta
        </h2>
        <Button
          onClick={syncStats}
          disabled={syncing}
          size="sm"
          variant="outline"
          className="border-neutral-700"
        >
          {syncing ? 'Sincronizando...' : 'Atualizar'}
        </Button>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Totais Históricos */}
        <Card className="p-6 border-neutral-800 bg-neutral-900">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold">Total Histórico</h3>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-2xl font-bold text-orange-500">
                {formatDistance(stats.allRunsTotals.distance)} km
              </div>
              <div className="text-sm text-neutral-400">
                {stats.allRunsTotals.count} corridas
              </div>
            </div>
            <div className="pt-2 border-t border-neutral-800">
              <div className="text-sm text-neutral-400">Tempo Total</div>
              <div className="font-semibold">
                {formatTime(stats.allRunsTotals.moving_time)}
              </div>
            </div>
            <div>
              <div className="text-sm text-neutral-400">Elevação</div>
              <div className="font-semibold">
                {Math.round(stats.allRunsTotals.elevation_gain)}m
              </div>
            </div>
          </div>
        </Card>

        {/* Últimas 4 Semanas */}
        <Card className="p-6 border-neutral-800 bg-neutral-900">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold">Últimas 4 Semanas</h3>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {formatDistance(stats.recentRunsTotals.distance)} km
              </div>
              <div className="text-sm text-neutral-400">
                {stats.recentRunsTotals.count} corridas
              </div>
            </div>
            <div className="pt-2 border-t border-neutral-800">
              <div className="text-sm text-neutral-400">Frequência Semanal</div>
              <div className="font-semibold">{stats.weeklyFrequency}x/semana</div>
            </div>
            <div>
              <div className="text-sm text-neutral-400">Frequência Mensal</div>
              <div className="font-semibold">{stats.monthlyFrequency}x/mês</div>
            </div>
          </div>
        </Card>

        {/* Ano Atual */}
        <Card className="p-6 border-neutral-800 bg-neutral-900">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold">Ano Atual</h3>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-2xl font-bold text-green-500">
                {formatDistance(stats.ytdRunsTotals.distance)} km
              </div>
              <div className="text-sm text-neutral-400">
                {stats.ytdRunsTotals.count} corridas
              </div>
            </div>
            <div className="pt-2 border-t border-neutral-800">
              <div className="text-sm text-neutral-400">Distância Média</div>
              <div className="font-semibold">{stats.avgDistance.toFixed(1)} km</div>
            </div>
            <div>
              <div className="text-sm text-neutral-400">Pace Médio</div>
              <div className="font-semibold">{stats.avgPace}/km</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Última sincronização */}
      <div className="text-xs text-neutral-500 text-center">
        Última sincronização: {new Date(stats.lastSyncAt).toLocaleString('pt-BR')}
      </div>
    </div>
  );
}
