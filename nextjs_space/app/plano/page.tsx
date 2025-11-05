'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, ChevronLeft, ChevronRight, CheckCircle2, Target, Dumbbell, XCircle } from 'lucide-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const appTimezone = 'America/Sao_Paulo';

interface CustomPlan {
  id: number;
  goalDistance: string;
  targetRaceDate: string;
  totalWeeks: number;
  currentWeek: number;
  completionRate: number;
}

interface CustomWeek {
  id: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
  totalDistance: number;
  totalWorkouts: number;
  completedWorkouts: number;
  phase: string;
  focus: string;
  workouts: any[];
}

export default function PlanoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<CustomPlan | null>(null);
  const [weeks, setWeeks] = useState<CustomWeek[]>([]);
  const [currentWeekNum, setCurrentWeekNum] = useState(1);
  const [viewingWeek, setViewingWeek] = useState(1);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchPlan();
    }
  }, [session]);

  const fetchPlan = async () => {
    try {
      const response = await fetch('/api/plan/current');
      if (response.ok) {
        const data = await response.json();
        
        if (data.hasCustomPlan === false) {
          setLoading(false);
          return;
        }
        
        setPlan(data.plan);
        setCurrentWeekNum(data.plan.currentWeek);
        setViewingWeek(data.plan.currentWeek);

        // Fetch all weeks
        const weeksResponse = await fetch(`/api/plan/${data.plan.id}/weeks`);
        if (weeksResponse.ok) {
          const weeksData = await weeksResponse.json();
          setWeeks(weeksData.weeks || []);
        }
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!session) return null;

  if (!plan) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle>Nenhum Plano Encontrado</CardTitle>
                <CardDescription>
                  Você ainda não tem um plano de treinamento personalizado.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push('/dashboard')}>
                  Gerar Meu Plano
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  const currentWeek = weeks.find(w => w.weekNumber === viewingWeek);
  const getDistanceLabel = (distance: string) => {
    const labels: Record<string, string> = {
      '10k': '10km',
      'half_marathon': 'Meia-Maratona',
      'marathon': 'Maratona'
    };
    return labels[distance] || distance;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      'base': 'bg-blue-500',
      'build': 'bg-green-500',
      'peak': 'bg-orange-500',
      'taper': 'bg-purple-500',
      'race': 'bg-red-500'
    };
    return colors[phase] || 'bg-gray-500';
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              Meu Plano de Treinamento
            </h1>
            <p className="text-muted-foreground text-lg">
              Plano personalizado para {getDistanceLabel(plan.goalDistance)}
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Objetivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {getDistanceLabel(plan.goalDistance)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(plan.targetRaceDate).toLocaleDateString('pt-BR')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Semana Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {currentWeekNum}/{plan.totalWeeks}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentWeek && currentWeek.phase}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Progresso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {Math.round(plan.completionRate)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Treinos concluídos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Duração Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {plan.totalWeeks}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  semanas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Week Navigation */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Semana {viewingWeek} de {plan.totalWeeks}</CardTitle>
                  {currentWeek && (
                    <CardDescription>
                      {formatDate(currentWeek.startDate)} - {formatDate(currentWeek.endDate)}
                      <Badge className={`${getPhaseColor(currentWeek.phase)} text-white ml-2`}>
                        {currentWeek.phase.toUpperCase()}
                      </Badge>
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingWeek(currentWeekNum)}
                    disabled={viewingWeek === currentWeekNum}
                  >
                    Semana Atual
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setViewingWeek(Math.max(1, viewingWeek - 1))}
                    disabled={viewingWeek === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setViewingWeek(Math.min(plan.totalWeeks, viewingWeek + 1))}
                    disabled={viewingWeek === plan.totalWeeks}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {currentWeek ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-medium text-blue-900">Foco da Semana</p>
                    <p className="text-sm text-blue-700">{currentWeek.focus}</p>
                  </div>

                  <div className="space-y-3">
                    {currentWeek.workouts.length > 0 ? (
                      currentWeek.workouts.map((workout: any) => {
                        const workoutDate = dayjs(workout.date).tz(appTimezone).startOf('day');
                        const today = dayjs().tz(appTimezone).startOf('day');
                        const isPastUncompleted = workoutDate.isBefore(today, 'day') && !workout.isCompleted;

                        return (
                          <div
                            key={workout.id}
                            className={`flex items-center justify-between p-4 rounded-lg border ${
                              workout.isCompleted
                                ? 'bg-green-50 border-green-200' // Completed
                                : isPastUncompleted
                                  ? 'bg-red-50 border-red-200' // Past and not completed
                                  : 'bg-white border-gray-200' // Not completed yet, or future
                            }`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {workout.type === 'running' ? (
                                  <Dumbbell className="h-4 w-4" />
                                ) : (
                                  <Dumbbell className="h-4 w-4" /> // Default icon, consider more specific icons
                                )}
                                <span className="font-medium">{workout.title}</span>
                                {workout.isCompleted ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : isPastUncompleted ? (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                ) : null}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {dayjs(workout.date).tz(appTimezone).format('dddd, D [de] MMMM')}
                              </p>
                              <p className="text-sm">{workout.description}</p>
                              {workout.distance && (
                                <p className="text-sm mt-1">
                                  📍 {workout.distance} km
                                  {workout.targetPace && ` • Pace: ${workout.targetPace}`}
                                </p>
                              )}
                              {workout.duration && !workout.distance && (
                                <p className="text-sm mt-1">⏱️ {workout.duration} min</p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum treino disponível para esta semana</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" />
                  <p>Carregando dados da semana...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/tracking')}
              >
                <Target className="mr-2 h-4 w-4" />
                Registrar Treino
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/dashboard')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Ver Dashboard
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/perfil')}
              >
                <Target className="mr-2 h-4 w-4" />
                Gerenciar Corridas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}