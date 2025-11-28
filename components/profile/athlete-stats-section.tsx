'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, TrendingUp, Activity, Link2, Crown, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from '@/lib/i18n/hooks';

interface AthleteStats {
  // Personal Records
  pr5k?: string;
  pr10k?: string;
  prHalfMarathon?: string;
  prMarathon?: string;
  
  // Running Stats
  totalRuns?: number;
  totalDistance?: number;
  totalElevationGain?: number;
  longestRun?: number;
  
  // Achievements
  totalAchievements?: number;
  
  // Strava Connection
  stravaConnected: boolean;
  stravaLastSync?: Date;
}

export default function AthleteStatsSection() {
  const t = useTranslations('perfil');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<AthleteStats | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [editForm, setEditForm] = useState({
    pr5k: '',
    pr10k: '',
    prHalfMarathon: '',
    prMarathon: '',
  });

  useEffect(() => {
    fetchStats();
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      if (response.ok) {
        const data = await response.json();
        setIsPremium(data.isPremium || false);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/athlete-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setEditForm({
          pr5k: data.stats.pr5k || '',
          pr10k: data.stats.pr10k || '',
          prHalfMarathon: data.stats.prHalfMarathon || '',
          prMarathon: data.stats.prMarathon || '',
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/athlete-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setIsEditing(false);
        toast.success('Estatísticas atualizadas com sucesso!');
      } else {
        toast.error('Erro ao atualizar estatísticas');
      }
    } catch (error) {
      toast.error('Erro ao salvar estatísticas');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '-';
    return timeStr;
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return '-';
    return `${(meters / 1000).toFixed(2)} km`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-brand-primary" />
              Estatísticas do Atleta
            </CardTitle>
            <CardDescription>
              Seus recordes pessoais e estatísticas de treino
            </CardDescription>
          </div>
          {stats?.stravaConnected && (
            <Badge variant="outline" className="gap-1">
              <Link2 className="h-3 w-3" />
              Strava Conectado
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personal Records */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Recordes Pessoais
            </h3>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Editar
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>5K</Label>
                  <Input
                    placeholder="ex: 00:22:30"
                    value={editForm.pr5k}
                    onChange={(e) => setEditForm({ ...editForm, pr5k: e.target.value })}
                  />
                </div>
                <div>
                  <Label>10K</Label>
                  <Input
                    placeholder="ex: 00:47:15"
                    value={editForm.pr10k}
                    onChange={(e) => setEditForm({ ...editForm, pr10k: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Meia Maratona</Label>
                  <Input
                    placeholder="ex: 01:45:30"
                    value={editForm.prHalfMarathon}
                    onChange={(e) => setEditForm({ ...editForm, prHalfMarathon: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Maratona</Label>
                  <Input
                    placeholder="ex: 03:42:20"
                    value={editForm.prMarathon}
                    onChange={(e) => setEditForm({ ...editForm, prMarathon: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({
                      pr5k: stats?.pr5k || '',
                      pr10k: stats?.pr10k || '',
                      prHalfMarathon: stats?.prHalfMarathon || '',
                      prMarathon: stats?.prMarathon || '',
                    });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="5K" value={formatTime(stats?.pr5k || '')} />
              <StatCard label="10K" value={formatTime(stats?.pr10k || '')} />
              <StatCard label="Meia" value={formatTime(stats?.prHalfMarathon || '')} />
              <StatCard label="Maratona" value={formatTime(stats?.prMarathon || '')} />
            </div>
          )}
        </div>

        {/* Running Stats */}
        {(stats?.totalRuns || stats?.totalDistance) && (
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-brand-primary" />
              Estatísticas Gerais
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total de Corridas" value={stats.totalRuns?.toString() || '-'} />
              <StatCard label="Distância Total" value={formatDistance(stats.totalDistance)} />
              <StatCard label="Elevação Total" value={stats.totalElevationGain ? `${stats.totalElevationGain}m` : '-'} />
              <StatCard label="Corrida Mais Longa" value={formatDistance(stats.longestRun)} />
            </div>
          </div>
        )}

        {/* Strava Sync Status */}
        <div className="border-t pt-6">
          {stats?.stravaConnected ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <h3 className="text-sm font-medium">Sincronização Automática Ativa</h3>
                </div>
                <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
                  <Link2 className="h-3 w-3" />
                  Conectado
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Seus dados do Strava são sincronizados automaticamente ao conectar e mantidos atualizados.
              </p>
              {stats?.stravaLastSync && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Última sincronização: {new Date(stats.stravaLastSync).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Conectar ao Strava</h3>
              <p className="text-sm text-muted-foreground">
                Conecte sua conta Strava para sincronizar automaticamente suas estatísticas e PRs.
              </p>
              <Button
                onClick={() => window.location.href = '/api/auth/strava/connect'}
                variant="outline"
                className="gap-2"
              >
                <Link2 className="h-4 w-4" />
                Conectar Strava
              </Button>
            </div>
          )}
          
          {!isPremium && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Crown className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-900">Recurso Premium</p>
                  <p className="text-amber-700">
                    Faça upgrade para Premium e sincronize automaticamente suas estatísticas do Strava.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
      <p className="text-xs font-medium text-slate-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
