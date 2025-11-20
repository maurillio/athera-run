'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Trophy, Activity, Zap, Heart, Shirt, RefreshCcw, Lock, Crown, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface StravaData {
  stats: any;
  prs: any[];
  gear: any[];
  zones: any;
  lastSync: Date | null;
}

export default function StravaDataSection() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [stravaConnected, setStravaConnected] = useState(false);
  const [data, setData] = useState<StravaData | null>(null);

  useEffect(() => {
    checkSubscription();
    checkStravaConnection();
    loadData();
  }, []);

  const checkSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      if (response.ok) {
        const result = await response.json();
        setIsPremium(result.isPremium || false);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const checkStravaConnection = async () => {
    try {
      const response = await fetch('/api/profile/create', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        setStravaConnected(result.profile?.stravaConnected || false);
      }
    } catch (error) {
      console.error('Error checking Strava connection:', error);
    }
  };

  const loadData = async () => {
    try {
      const [statsRes, prsRes, gearRes] = await Promise.all([
        fetch('/api/strava/stats').then(r => r.ok ? r.json() : null),
        fetch('/api/strava/prs').then(r => r.ok ? r.json() : null),
        fetch('/api/strava/gear').then(r => r.ok ? r.json() : null),
      ]);

      setData({
        stats: statsRes,
        prs: prsRes?.prs || [],
        gear: gearRes?.gear || [],
        zones: null, // Não implementado ainda
        lastSync: statsRes?.lastSync || null,
      });
    } catch (error) {
      console.error('Error loading Strava data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAll = async () => {
    if (!isPremium) {
      toast.error('Recurso Premium', {
        description: 'Faça upgrade para sincronizar com o Strava',
      });
      return;
    }

    if (!stravaConnected) {
      toast.error('Strava não conectado', {
        description: 'Conecte sua conta Strava primeiro',
      });
      return;
    }

    setSyncing(true);
    const syncToast = toast.loading('Sincronizando dados do Strava...');
    
    try {
      const response = await fetch('/api/strava/sync-all', { method: 'POST' });
      
      if (response.ok) {
        const result = await response.json();
        toast.success('Dados sincronizados com sucesso!', { id: syncToast });
        await loadData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao sincronizar', { id: syncToast });
      }
    } catch (error) {
      toast.error('Erro ao conectar com Strava', { id: syncToast });
      console.error('Sync error:', error);
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

  const formatDistance = (meters: number) => {
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

  if (!stravaConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-brand-primary" />
            Dados do Strava
          </CardTitle>
          <CardDescription>
            Conecte sua conta Strava para importar seus dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">Strava não conectado</p>
            <Button>
              Conectar Strava
            </Button>
          </div>
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
              <Activity className="h-5 w-5 text-brand-primary" />
              Dados do Strava
            </CardTitle>
            <CardDescription>
              Estatísticas, recordes, equipamentos e zonas de treino
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Activity className="h-3 w-3" />
              Conectado
            </Badge>
            <Button
              onClick={handleSyncAll}
              disabled={syncing || !isPremium}
              size="sm"
              className="gap-2"
            >
              {!isPremium ? (
                <>
                  <Lock className="h-4 w-4" />
                  Premium
                </>
              ) : syncing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4" />
                  Sincronizar
                </>
              )}
            </Button>
          </div>
        </div>
        {data?.lastSync && (
          <p className="text-xs text-muted-foreground mt-2">
            <Calendar className="h-3 w-3 inline mr-1" />
            Última sincronização: {new Date(data.lastSync).toLocaleString('pt-BR')}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {!isPremium && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Crown className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-amber-900 mb-1">Recurso Premium</p>
                <p className="text-sm text-amber-700">
                  Faça upgrade para Premium para sincronizar automaticamente seus dados do Strava e aproveitar recursos avançados.
                </p>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stats">
              <TrendingUp className="h-4 w-4 mr-2" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="prs">
              <Trophy className="h-4 w-4 mr-2" />
              Records
            </TabsTrigger>
            <TabsTrigger value="gear">
              <Shirt className="h-4 w-4 mr-2" />
              Equipamentos
            </TabsTrigger>
            <TabsTrigger value="zones">
              <Heart className="h-4 w-4 mr-2" />
              Zonas
            </TabsTrigger>
          </TabsList>

          {/* ESTATÍSTICAS */}
          <TabsContent value="stats" className="space-y-6 mt-6">
            {data?.stats ? (
              <>
                <StatsSection title="Estatísticas de Corrida - Total" data={data.stats.allRunsTotals} />
                <StatsSection title="Estatísticas Recentes (4 semanas)" data={data.stats.recentRunsTotals} />
                <StatsSection title="Estatísticas do Ano" data={data.stats.ytdRunsTotals} />
              </>
            ) : (
              <EmptyState message="Nenhuma estatística disponível" />
            )}
          </TabsContent>

          {/* RECORDS PESSOAIS */}
          <TabsContent value="prs" className="mt-6">
            {data?.prs && data.prs.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {data.prs.map((pr: any) => (
                  <PRCard key={pr.type} pr={pr} />
                ))}
              </div>
            ) : (
              <EmptyState message="Nenhum record pessoal registrado" icon={Trophy} />
            )}
          </TabsContent>

          {/* EQUIPAMENTOS */}
          <TabsContent value="gear" className="mt-6">
            {data?.gear && data.gear.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {data.gear.map((item: any) => (
                  <GearCard key={item.gearId} gear={item} />
                ))}
              </div>
            ) : (
              <EmptyState message="Nenhum equipamento registrado" icon={Shirt} />
            )}
          </TabsContent>

          {/* ZONAS DE TREINO */}
          <TabsContent value="zones" className="mt-6">
            {data?.zones ? (
              <ZonesSection zones={data.zones} />
            ) : (
              <EmptyState message="Nenhuma zona de treino configurada" icon={Heart} />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Componente de Estatísticas
function StatsSection({ title, data }: { title: string; data: any }) {
  if (!data) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Corridas" value={data.count?.toString() || '0'} />
        <StatCard label="Distância" value={data.distance ? `${(data.distance / 1000).toFixed(0)} km` : '0 km'} />
        <StatCard label="Tempo" value={data.moving_time ? formatDuration(data.moving_time) : '0h'} />
        <StatCard label="Elevação" value={data.elevation_gain ? `${Math.round(data.elevation_gain)}m` : '0m'} />
      </div>
    </div>
  );
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  return `${hours}h`;
}

// Componente de Record Pessoal
function PRCard({ pr }: { pr: any }) {
  const distanceLabels: Record<string, string> = {
    '400m': '400m',
    '1k': '1km',
    '5k': '5km',
    '10k': '10km',
    'half_marathon': 'Meia Maratona',
    'marathon': 'Maratona',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-slate-900">{distanceLabels[pr.type] || pr.type}</h4>
            <p className="text-xs text-slate-600">
              {pr.activityDate ? new Date(pr.activityDate).toLocaleDateString('pt-BR') : 'Data não disponível'}
            </p>
          </div>
          <Trophy className="h-5 w-5 text-yellow-500" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Tempo</span>
            <span className="font-mono font-semibold">{formatTime(pr.time)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Pace</span>
            <span className="font-mono">{pr.pace}/km</span>
          </div>
          {pr.heartRate && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">FC Média</span>
              <span>{pr.heartRate} bpm</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Componente de Equipamento
function GearCard({ gear }: { gear: any }) {
  const maxDistance = 800; // km antes de trocar
  const percentage = Math.min((gear.distance / maxDistance) * 100, 100);
  const isWornOut = percentage >= 80;

  return (
    <Card className={isWornOut ? 'border-amber-300' : ''}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900">{gear.name}</h4>
            {(gear.brand || gear.model) && (
              <p className="text-sm text-slate-600">
                {[gear.brand, gear.model].filter(Boolean).join(' ')}
              </p>
            )}
            <Badge variant={gear.primary ? 'default' : 'outline'} className="mt-2">
              {gear.type === 'shoe' ? '👟 Tênis' : '🚴 Bike'}
              {gear.primary && ' - Principal'}
            </Badge>
          </div>
          <Shirt className="h-5 w-5 text-slate-400" />
        </div>
        
        <div className="space-y-3 mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Quilometragem</span>
            <span className="font-semibold">{gear.distance.toFixed(0)} km</span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Desgaste</span>
              <span>{percentage.toFixed(0)}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>

          {isWornOut && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded">
              <Zap className="h-3 w-3" />
              <span>Considere trocar o equipamento</span>
            </div>
          )}

          {gear.isRetired && (
            <Badge variant="secondary">Aposentado</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de Zonas
function ZonesSection({ zones }: { zones: any }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          label="FC Máxima" 
          value={zones.maxHeartRate ? `${zones.maxHeartRate} bpm` : '-'} 
          icon={<Heart className="h-4 w-4 text-red-500" />}
        />
        <StatCard 
          label="FC Repouso" 
          value={zones.restingHeartRate ? `${zones.restingHeartRate} bpm` : '-'} 
          icon={<Heart className="h-4 w-4 text-blue-500" />}
        />
        <StatCard 
          label="Origem" 
          value={zones.stravaCalculated ? 'Strava' : 'Manual'} 
          icon={<Zap className="h-4 w-4 text-brand-primary" />}
        />
      </div>

      {zones.heartRateZones && Object.keys(zones.heartRateZones).length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-900 mb-3">Zonas de Frequência Cardíaca</h4>
          <div className="space-y-2">
            {Object.entries(zones.heartRateZones).map(([zone, data]: [string, any]) => (
              <div key={zone} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-24 text-sm font-medium text-slate-700">Zona {zone}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{data.min} - {data.max} bpm</span>
                    <span className="text-slate-600">{data.time || 0}min</span>
                  </div>
                  <Progress value={((data.time || 0) / 60) * 100} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de Card de Estatística
function StatCard({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-slate-600">{label}</p>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

// Componente de Estado Vazio
function EmptyState({ message, icon: Icon = Activity }: { message: string; icon?: any }) {
  return (
    <div className="text-center py-12">
      <Icon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
      <p className="text-slate-600">{message}</p>
    </div>
  );
}
