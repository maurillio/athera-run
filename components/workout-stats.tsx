
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, Clock, Zap } from 'lucide-react';

interface WorkoutStatsProps {
  athleteId: number;
}

interface Stats {
  thisMonth: {
    totalWorkouts: number;
    totalDistance: number;
    totalTime: number;
    avgPace: string | null;
  };
  lastMonth: {
    totalWorkouts: number;
    totalDistance: number;
  };
}

export default function WorkoutStats({ athleteId }: WorkoutStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [athleteId]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/workouts/stats?athleteId=${athleteId}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse border-slate-200">
            <CardContent className="p-6">
              <div className="h-4 bg-slate-200 rounded mb-2"></div>
              <div className="h-8 bg-slate-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const thisMonth = stats?.thisMonth || { totalWorkouts: 0, totalDistance: 0, totalTime: 0, avgPace: null };
  const lastMonth = stats?.lastMonth || { totalWorkouts: 0, totalDistance: 0 };
  
  const workoutChange = lastMonth.totalWorkouts > 0 
    ? ((thisMonth.totalWorkouts - lastMonth.totalWorkouts) / lastMonth.totalWorkouts) * 100 
    : 0;
  
  const distanceChange = lastMonth.totalDistance > 0 
    ? ((thisMonth.totalDistance - lastMonth.totalDistance) / lastMonth.totalDistance) * 100 
    : 0;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}min`;
  };

  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      <Card className="border-slate-200 shadow-elevation-2 hover:shadow-elevation-3 transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Corridas no Mês</CardTitle>
          <Activity className="h-4 w-4 text-brand-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{thisMonth.totalWorkouts}</div>
          <p className="text-xs text-slate-500">
            {workoutChange > 0 ? '+' : ''}{workoutChange.toFixed(0)}% vs mês anterior
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-elevation-2 hover:shadow-elevation-3 transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Distância Total</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{thisMonth.totalDistance.toFixed(1)} km</div>
          <p className="text-xs text-slate-500">
            {distanceChange > 0 ? '+' : ''}{distanceChange.toFixed(0)}% vs mês anterior
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-elevation-2 hover:shadow-elevation-3 transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Tempo Total</CardTitle>
          <Clock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{formatTime(thisMonth.totalTime)}</div>
          <p className="text-xs text-slate-500">de treinamento</p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-elevation-2 hover:shadow-elevation-3 transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Pace Médio</CardTitle>
          <Zap className="h-4 w-4 text-brand-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">
            {thisMonth.avgPace || '--:--'}
          </div>
          <p className="text-xs text-slate-500">por quilômetro</p>
        </CardContent>
      </Card>
    </div>
  );
}
