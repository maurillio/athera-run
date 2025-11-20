'use client';

/**
 * Strava Personal Records Component
 * Exibe melhores marcas do atleta
 * PREMIUM ONLY
 */

import { useState, useEffect } from 'react';
import { Award, Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PersonalRecord {
  type: string;
  distance: number;
  time: number;
  pace: string;
  activityDate: string;
  activityId?: string;
}

const PR_LABELS: Record<string, string> = {
  '400m': '400m',
  '1k': '1 km',
  '1mile': '1 Milha',
  '5k': '5 km',
  '10k': '10 km',
  'half_marathon': 'Meia Maratona',
  'marathon': 'Maratona'
};

export function StravaPersonalRecords() {
  const [prs, setPRs] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadPRs();
  }, []);

  const loadPRs = async () => {
    try {
      const res = await fetch('/api/strava/prs');
      if (res.ok) {
        const data = await res.json();
        setPRs(data.prs || []);
      }
    } catch (error) {
      console.error('Erro ao carregar PRs:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncPRs = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/strava/prs', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setPRs(data.prs || []);
      }
    } catch (error) {
      console.error('Erro ao sincronizar PRs:', error);
    } finally {
      setSyncing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-6 bg-neutral-800 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-neutral-800 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (prs.length === 0) {
    return (
      <Card className="p-6 border-neutral-800 bg-neutral-900">
        <div className="text-center py-8">
          <Award className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
          <h3 className="text-lg font-semibold mb-2">Nenhum recorde encontrado</h3>
          <p className="text-sm text-neutral-400 mb-4">
            Sincronize seus dados para ver seus melhores tempos
          </p>
          <Button
            onClick={syncPRs}
            disabled={syncing}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {syncing ? 'Sincronizando...' : 'Sincronizar PRs'}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Award className="w-5 h-5 text-orange-500" />
          Melhores Marcas (PRs)
        </h2>
        <Button
          onClick={syncPRs}
          disabled={syncing}
          size="sm"
          variant="outline"
          className="border-neutral-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>

      {/* Grid de PRs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prs.map((pr) => (
          <Card
            key={pr.type}
            className="p-6 border-neutral-800 bg-neutral-900 hover:border-orange-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm text-neutral-400 uppercase tracking-wide">
                  {PR_LABELS[pr.type] || pr.type}
                </div>
                <div className="text-2xl font-bold text-orange-500 mt-1">
                  {formatTime(pr.time)}
                </div>
              </div>
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Pace</span>
                <span className="font-semibold">{pr.pace}/km</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Data</span>
                <span className="font-semibold">
                  {new Date(pr.activityDate).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            {pr.activityId && (
              <a
                href={`https://www.strava.com/activities/${pr.activityId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block text-center text-xs text-orange-500 hover:text-orange-400 transition-colors"
              >
                Ver no Strava →
              </a>
            )}
          </Card>
        ))}
      </div>

      {/* Dica */}
      <div className="text-xs text-neutral-500 text-center">
        💡 Os PRs são atualizados automaticamente com base nas suas atividades no Strava
      </div>
    </div>
  );
}
