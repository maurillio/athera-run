'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from '@/lib/i18n/hooks';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, ChevronLeft, ChevronRight, CheckCircle2, Target, Dumbbell, XCircle, Trophy, Activity, Heart, Droplets, Mountain, Clock } from 'lucide-react';
import { formatLocalizedDate, formatShortDate } from '@/lib/utils/date-formatter';
import { WorkoutDetails } from '@/components/workout-details';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import 'dayjs/locale/pt-br';
import 'dayjs/locale/en';
import 'dayjs/locale/es';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const appTimezone = 'America/Sao_Paulo';

// Helper function to normalize phase names for translation keys
function normalizePhaseKey(phase: string): string {
  const normalized = phase
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, ''); // Remove spaces
  
  return normalized;
}

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
  const locale = useLocale();
  const t = useTranslations('plano');
  const tCommon = useTranslations('common');
  
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<CustomPlan | null>(null);
  const [weeks, setWeeks] = useState<CustomWeek[]>([]);
  const [currentWeekNum, setCurrentWeekNum] = useState(1);
  const [viewingWeek, setViewingWeek] = useState(1);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/${locale}/login`);
    }
  }, [status, router, locale]);

  useEffect(() => {
    if (session?.user) {
      fetchPlan();
    }
  }, [session]);

  // Set dayjs locale based on user's selected locale
  useEffect(() => {
    const dayjsLocale = locale === 'pt-BR' ? 'pt-br' : locale === 'es' ? 'es' : 'en';
    dayjs.locale(dayjsLocale);
  }, [locale]);

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
                <CardTitle>{t('noPlan.title')}</CardTitle>
                <CardDescription>
                  {t('noPlan.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push(`/${locale}/dashboard`)}>
                  {t('noPlan.button')}
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
    return t(`plano.goalLabels.${distance}`, distance);
  };

  // Removed - using formatShortDate from date-formatter.ts instead

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

  const getWorkoutIcon = (type: string, title: string) => {
    const lowerTitle = title.toLowerCase();
    const lowerType = type?.toLowerCase() || '';
    
    if (lowerTitle.includes('corrida alvo') || lowerTitle.includes('race day') || lowerTitle.includes('prova')) {
      return <Trophy className="h-5 w-5 text-yellow-600" />;
    }
    if (lowerTitle.includes('longão') || lowerTitle.includes('long run')) {
      return <Mountain className="h-5 w-5 text-blue-600" />;
    }
    if (lowerTitle.includes('intervalo') || lowerTitle.includes('interval') || lowerTitle.includes('tiro')) {
      return <Activity className="h-5 w-5 text-red-600" />;
    }
    if (lowerTitle.includes('tempo') || lowerTitle.includes('threshold')) {
      return <Clock className="h-5 w-5 text-orange-600" />;
    }
    if (lowerTitle.includes('regenerativ') || lowerTitle.includes('easy') || lowerTitle.includes('leve')) {
      return <Heart className="h-5 w-5 text-green-600" />;
    }
    if (lowerTitle.includes('descanso') || lowerTitle.includes('rest')) {
      return <Droplets className="h-5 w-5 text-cyan-600" />;
    }
    if (lowerType.includes('gym') || lowerTitle.includes('muscula') || lowerTitle.includes('força')) {
      return <Dumbbell className="h-5 w-5 text-purple-600" />;
    }
    return <Activity className="h-5 w-5 text-gray-600" />;
  };

  const getDayName = (date: string) => {
    const d = dayjs(date).tz(appTimezone);
    return d.format('ddd').toUpperCase();
  };

  const getDayNumber = (date: string) => {
    const d = dayjs(date).tz(appTimezone);
    return d.format('DD');
  };

  // Group workouts by day
  const groupWorkoutsByDay = (workouts: any[]) => {
    const grouped = new Map<string, any[]>();
    
    workouts.forEach((workout) => {
      const dateKey = dayjs(workout.date).tz(appTimezone).format('YYYY-MM-DD');
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(workout);
    });
    
    return grouped;
  };

  const toggleDay = (dateKey: string) => {
    setExpandedDays(prev => {
      const newSet = new Set<string>();
      // Se o dia clicado já estava expandido, fecha ele (set vazio)
      // Se não estava expandido, abre apenas ele (fecha todos os outros)
      if (!prev.has(dateKey)) {
        newSet.add(dateKey);
      }
      return newSet;
    });
  };

  const isDayExpanded = (dateKey: string, isToday: boolean) => {
    // Dia de hoje sempre expandido
    if (isToday) return true;
    return expandedDays.has(dateKey);
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
              {t('title')}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t('subtitle', { goal: getDistanceLabel(plan.goalDistance) })}
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('summary.goal')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {getDistanceLabel(plan.goalDistance)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatLocalizedDate(plan.targetRaceDate, locale)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('summary.currentWeek')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {currentWeekNum}/{plan.totalWeeks}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentWeek && t(`plano.phases.${normalizePhaseKey(currentWeek.phase)}`, currentWeek.phase)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('summary.progress')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {Math.round(plan.completionRate)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('summary.completedWorkouts')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('summary.totalDuration')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {plan.totalWeeks}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('summary.weeks')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Week Navigation */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('weekNavigation.week')} {viewingWeek} {t('weekNavigation.of')} {plan.totalWeeks}</CardTitle>
                  {currentWeek && (
                    <CardDescription>
                      {formatShortDate(currentWeek.startDate, locale)} - {formatShortDate(currentWeek.endDate, locale)}
                      <Badge className={`${getPhaseColor(currentWeek.phase)} text-white ml-2`}>
                        {t(`plano.phases.${normalizePhaseKey(currentWeek.phase)}`, currentWeek.phase).toUpperCase()}
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
                    {t('weekNavigation.currentWeek')}
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
                <div className="space-y-6">
                  {/* Week Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Progresso da Semana</span>
                      <span className="text-muted-foreground">
                        {currentWeek.completedWorkouts}/{currentWeek.totalWorkouts} treinos
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(currentWeek.completedWorkouts / currentWeek.totalWorkouts) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>📊 Volume: {currentWeek.totalDistance.toFixed(1)} km</span>
                      <span className="font-medium">
                        {Math.round((currentWeek.completedWorkouts / currentWeek.totalWorkouts) * 100)}% concluído
                      </span>
                    </div>
                  </div>

                  {/* Week Focus */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                    <p className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      {t('weekNavigation.weekFocus')}
                    </p>
                    <p className="text-sm text-blue-700">{currentWeek.focus}</p>
                  </div>

                  {/* Weekly Calendar Grid */}
                  <div className="space-y-3">
                    {currentWeek.workouts.length > 0 ? (
                      (() => {
                        const groupedWorkouts = groupWorkoutsByDay(currentWeek.workouts);
                        const sortedDates = Array.from(groupedWorkouts.keys()).sort();

                        return sortedDates.map((dateKey) => {
                          const dayWorkouts = groupedWorkouts.get(dateKey)!;
                          const firstWorkout = dayWorkouts[0];
                          const workoutDate = dayjs(firstWorkout.date).tz(appTimezone).startOf('day');
                          const today = dayjs().tz(appTimezone).startOf('day');
                          const isToday = workoutDate.isSame(today, 'day');
                          const expanded = isDayExpanded(dateKey, isToday);
                          
                          const allCompleted = dayWorkouts.every(w => w.isCompleted);
                          const someCompleted = dayWorkouts.some(w => w.isCompleted);
                          const isRestDay = dayWorkouts.every(w => 
                            w.type === 'rest' || 
                            w.title.toLowerCase().includes('descanso') || 
                            w.title.toLowerCase().includes('rest')
                          );
                          const isPastUncompleted = workoutDate.isBefore(today, 'day') && !allCompleted && !isRestDay;
                          const hasRaceDay = dayWorkouts.some(w => 
                            w.title.toLowerCase().includes('corrida alvo') || 
                            w.title.toLowerCase().includes('race day') ||
                            w.title.toLowerCase().includes('prova')
                          );

                          return (
                            <div
                              key={dateKey}
                              onClick={() => !isToday && toggleDay(dateKey)}
                              className={`
                                relative rounded-lg border-2 transition-all cursor-pointer
                                ${allCompleted
                                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300 hover:border-green-400 hover:shadow-md'
                                  : isRestDay
                                    ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 hover:border-gray-400 hover:shadow-md'
                                    : isPastUncompleted
                                      ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-300 hover:border-red-400 hover:shadow-md'
                                      : isToday
                                        ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-400 ring-2 ring-orange-300'
                                      : 'bg-white border-gray-300 hover:border-gray-400 hover:shadow-md'
                                }
                              `}
                            >
                              {/* Day Header - Sempre visível */}
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="text-center">
                                      <div className="text-xs font-bold text-gray-600">
                                        {getDayName(firstWorkout.date)}
                                      </div>
                                      <div className={`text-xl font-bold ${isToday ? 'text-orange-600' : 'text-gray-900'}`}>
                                        {getDayNumber(firstWorkout.date)}
                                      </div>
                                    </div>
                                    
                                    {/* Contador de atividades quando mais de uma */}
                                    {dayWorkouts.length > 1 && (
                                      <Badge variant="secondary" className="text-xs">
                                        {dayWorkouts.length} atividades
                                      </Badge>
                                    )}
                                    
                                    {/* Mini preview quando NÃO expandido - Mostra ícones lado a lado */}
                                    {!expanded && dayWorkouts.length > 1 && (
                                      <div className="flex gap-2 ml-2">
                                        {dayWorkouts.map((workout, idx) => (
                                          <div key={idx}>
                                            {getWorkoutIcon(workout.type, workout.title)}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Status Icon */}
                                  <div>
                                    {allCompleted ? (
                                      <div className="bg-green-500 rounded-full p-1.5">
                                        <CheckCircle2 className="h-5 w-5 text-white" />
                                      </div>
                                    ) : isPastUncompleted ? (
                                      <div className="bg-red-500 rounded-full p-1.5">
                                        <XCircle className="h-5 w-5 text-white" />
                                      </div>
                                    ) : isToday ? (
                                      <div className="bg-orange-500 rounded-full p-1.5 animate-pulse">
                                        <Activity className="h-5 w-5 text-white" />
                                      </div>
                                    ) : null}
                                  </div>
                                </div>

                                {/* Conteúdo Expandido ou Compacto */}
                                {!expanded ? (
                                  // COMPACTO - Resumo em uma linha
                                  <div className="text-sm text-gray-700">
                                    {dayWorkouts.length === 1 ? (
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium">{firstWorkout.title}</span>
                                        {firstWorkout.distance && (
                                          <Badge variant="secondary" className="text-xs">
                                            {firstWorkout.distance} km
                                          </Badge>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="font-medium">
                                        {dayWorkouts.map((w, idx) => (
                                          <span key={idx}>
                                            {w.type === 'run' ? '🏃' : w.type === 'gym' ? '💪' : '🚴'} {w.title}
                                            {idx < dayWorkouts.length - 1 && ' • '}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  // EXPANDIDO - Mostrar todos os treinos com detalhes completos usando WorkoutDetails
                                  <div className="space-y-3 pt-3 border-t border-gray-200">
                                    {dayWorkouts.map((workout) => (
                                      <WorkoutDetails 
                                        key={workout.id}
                                        workout={workout}
                                        isExpanded={true}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Badges Especiais */}
                              {hasRaceDay && (
                                <div className="absolute -top-2 -right-2">
                                  <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-1 shadow-lg">
                                    <Trophy className="h-3 w-3 mr-1" />
                                    META
                                  </Badge>
                                </div>
                              )}

                              {isToday && (
                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                  <Badge className="bg-orange-500 text-white text-xs px-2">
                                    HOJE
                                  </Badge>
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>{t('weekNavigation.noWorkouts')}</p>
                      </div>
                    )}
                  </div>


                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" />
                  <p>{t('weekNavigation.loadingWeek')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('quickActions.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/tracking')}
              >
                <Target className="mr-2 h-4 w-4" />
                {t('quickActions.registerWorkout')}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push(`/${locale}/dashboard`)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {t('quickActions.viewDashboard')}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/perfil')}
              >
                <Target className="mr-2 h-4 w-4" />
                {t('quickActions.manageRaces')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
