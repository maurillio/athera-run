
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface WeeklyData {
  weekNumber: number;
  totalDistance: number;
  totalWorkouts: number;
}

interface WeeklyProgressChartProps {
  athleteId: number;
}

export default function WeeklyProgressChart({ athleteId }: WeeklyProgressChartProps) {
  const [data, setData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [athleteId]);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/workouts/weekly?athleteId=${athleteId}`);
      if (response.ok) {
        const weeklyData = await response.json();
        setData(weeklyData);
      }
    } catch (error) {
      console.error('Error fetching weekly data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progresso Semanal
          </CardTitle>
          <CardDescription>Suas últimas 8 semanas de treinamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <p>Nenhum dado disponível ainda. Comece a registrar seus treinos!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxDistance = Math.max(...data.map(d => d.totalDistance), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Progresso Semanal
        </CardTitle>
        <CardDescription>Volume de km nas últimas semanas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((week) => (
            <div key={week.weekNumber} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Semana {week.weekNumber}</span>
                <span className="text-muted-foreground">
                  {week.totalDistance.toFixed(1)} km • {week.totalWorkouts} treinos
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${(week.totalDistance / maxDistance) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
