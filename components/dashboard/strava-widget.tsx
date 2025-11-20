'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Trophy, TrendingUp, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface DashboardStravaProps {
  compact?: boolean;
}

export default function DashboardStravaWidget({ compact = false }: DashboardStravaProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    loadQuickStats();
  }, []);

  const loadQuickStats = async () => {
    try {
      setLoading(true);
      
      const [profileRes, statsRes, prsRes] = await Promise.all([
        fetch('/api/profile/create', { method: 'POST' }),
        fetch('/api/strava/stats').catch(() => null),
        fetch('/api/strava/prs').catch(() => null),
      ]);

      if (profileRes.ok) {
        const profile = await profileRes.json();
        setIsConnected(profile.profile?.stravaConnected || false);
      }

      if (statsRes && statsRes.ok) {
        const stats = await statsRes.json();
        setData((prev: any) => ({ ...prev, stats }));
      }

      if (prsRes && prsRes.ok) {
        const prs = await prsRes.json();
        setData((prev: any) => ({ ...prev, prs: prs.prs }));
      }
    } catch (error) {
      console.error('Error loading Strava data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-brand-primary/20">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return null; // Não mostra nada se não está conectado
  }

  if (compact) {
    return <CompactWidget data={data} />;
  }

  return <FullWidget data={data} />;
}

// Widget Compacto - Para usar no topo do dashboard
function CompactWidget({ data }: { data: any }) {
  const weekStats = data?.stats?.recentRunsTotals;
  const latestPR = data?.prs?.length > 0 ? data.prs[0] : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Atividade Semanal */}
      <Card className="border-brand-primary/20 bg-gradient-to-br from-orange-50 to-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Esta Semana</p>
              <p className="text-3xl font-bold text-slate-900">
                {weekStats?.distance ? `${(weekStats.distance / 1000).toFixed(0)}km` : '0km'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {weekStats?.count || 0} corridas
              </p>
            </div>
            <Activity className="h-10 w-10 text-brand-primary opacity-60" />
          </div>
        </CardContent>
      </Card>

      {/* Último PR */}
      <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-50 to-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Último PR</p>
              {latestPR ? (
                <>
                  <p className="text-2xl font-bold text-slate-900">{latestPR.type}</p>
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    {latestPR.pace}/km
                  </p>
                </>
              ) : (
                <p className="text-2xl font-bold text-slate-400">-</p>
              )}
            </div>
            <Trophy className="h-10 w-10 text-yellow-500 opacity-60" />
          </div>
        </CardContent>
      </Card>

      {/* Progresso */}
      <Card className="border-blue-500/20 bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Progresso</p>
              <p className="text-3xl font-bold text-slate-900">
                {data?.stats?.ytdRunsTotals?.count || 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                corridas este ano
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-500 opacity-60" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Widget Completo - Card único com mais detalhes
function FullWidget({ data }: { data: any }) {
  const weekStats = data?.stats?.recentRunsTotals;
  const yearStats = data?.stats?.ytdRunsTotals;
  const topPRs = data?.prs?.slice(0, 3) || [];

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-brand-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-brand-primary" />
            <CardTitle className="text-lg">Dados do Strava</CardTitle>
            <Badge variant="outline" className="text-xs">
              Conectado
            </Badge>
          </div>
          <Link href="/perfil?tab=stats">
            <Button variant="ghost" size="sm" className="gap-1">
              Ver todos
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estatísticas Semanais */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Últimas 4 Semanas</h4>
          <div className="grid grid-cols-3 gap-3">
            <StatMini 
              label="Distância" 
              value={weekStats?.distance ? `${(weekStats.distance / 1000).toFixed(0)}km` : '0km'} 
            />
            <StatMini 
              label="Corridas" 
              value={weekStats?.count?.toString() || '0'} 
            />
            <StatMini 
              label="Elevação" 
              value={weekStats?.elevation_gain ? `${Math.round(weekStats.elevation_gain)}m` : '0m'} 
            />
          </div>
        </div>

        {/* Records Pessoais */}
        {topPRs.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Melhores Records
            </h4>
            <div className="space-y-2">
              {topPRs.map((pr: any) => (
                <div key={pr.type} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-slate-900">{pr.type}</span>
                    <span className="text-xs text-slate-500 ml-2">
                      {pr.activityDate ? new Date(pr.activityDate).toLocaleDateString('pt-BR') : ''}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 font-mono">
                      {formatTime(pr.time)}
                    </div>
                    <div className="text-xs text-slate-600 font-mono">
                      {pr.pace}/km
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total Anual */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Total no Ano</span>
            <div className="text-right">
              <div className="font-bold text-slate-900">
                {yearStats?.count || 0} corridas
              </div>
              <div className="text-xs text-slate-600">
                {yearStats?.distance ? `${(yearStats.distance / 1000).toFixed(0)}km` : '0km'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
      <p className="text-xs font-medium text-slate-600 mb-1">{label}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}
