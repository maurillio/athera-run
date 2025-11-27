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
import AIFieldIcon from '@/components/ai-transparency/AIFieldIcon';
import AIFieldStatus from '@/components/ai-transparency/AIFieldStatus';
import { useFieldAnalysis } from '@/hooks/useFieldAnalysis';
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
  if (!phase) return 'base';
  
  // Mapa de fases para chaves de tradução
  const phaseMap: Record<string, string> = {
    'base': 'base',
    'baseaerobica': 'base',
    'base aerobica': 'base',
    'base aeróbica': 'base',
    'build': 'build',
    'desenvolvimento': 'build',
    'construcao': 'build',
    'construção': 'build',
    'peak': 'peak',
    'pico': 'peak',
    'intensidade': 'peak',
    'taper': 'taper',
    'polimento': 'taper',
    'recuperacao': 'recovery',
    'recuperação': 'recovery',
    'recovery': 'recovery',
    'race': 'race',
    'corrida': 'race'
  };
  
  const normalized = phase
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, ''); // Remove spaces
  
  return phaseMap[normalized] || phaseMap[phase.toLowerCase()] || 'base';
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
  const { getFieldStatus } = useFieldAnalysis();
  
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<CustomPlan | null>(null);
  const [weeks, setWeeks] = useState<CustomWeek[]>([]);
  const [currentWeekNum, setCurrentWeekNum] = useState(1);
  const [viewingWeek, setViewingWeek] = useState(1);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [hasInitializedWeek, setHasInitializedWeek] = useState(false);

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
        
        // ✅ Só reseta viewingWeek na primeira carga, não em re-fetches
        if (!hasInitializedWeek) {
          setViewingWeek(data.plan.currentWeek);
          setHasInitializedWeek(true);
        }

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
      <div className="min-h-screen bg-slate-50 p-6 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <div className="h-8 w-56 bg-slate-200 rounded skeleton" />
              <div className="h-4 w-72 bg-slate-200 rounded skeleton" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-10 bg-slate-200 rounded-lg skeleton" />
              <div className="h-10 w-10 bg-slate-200 rounded-lg skeleton" />
            </div>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-4 shadow-elevation-1">
            <div className="h-8 w-8 bg-slate-200 rounded skeleton" />
            <div className="h-6 w-32 bg-slate-200 rounded skeleton" />
            <div className="h-8 w-8 bg-slate-200 rounded skeleton" />
          </div>

          {/* Training Plan Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-4 bg-white shadow-elevation-2">
                <div className="h-5 w-20 bg-slate-200 rounded skeleton mb-3" />
                <div className="space-y-2">
                  <div className="h-16 bg-slate-200 rounded skeleton" />
                  <div className="h-3 w-full bg-slate-200 rounded skeleton" />
                  <div className="h-3 w-3/4 bg-slate-200 rounded skeleton" />
                </div>
              </div>
            ))}
          </div>
        </div>
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
    // Normalizar distância para mapear corretamente
    const normalizeDistance = (dist: string) => {
      const map: Record<string, string> = {
        '5k': '5k',
        '5km': '5k',
        '10k': '10k',
        '10km': '10k',
        '15k': '15k',
        '15km': '15k',
        '21k': '21k',
        '21km': '21k',
        '42k': '42k',
        '42km': '42k',
        'half_marathon': 'half_marathon',
        'half marathon': 'half_marathon',
        'halfmarathon': 'half_marathon',
        'meia maratona': 'half_marathon',
        'meia-maratona': 'half_marathon',
        'marathon': 'marathon',
        'maratona': 'marathon'
      };
      return map[dist?.toLowerCase()] || dist?.toLowerCase();
    };

    const normalized = normalizeDistance(distance);
    // t já está usando namespace 'plano', então não precisa do prefixo
    try {
      return t(`goalLabels.${normalized}`, { defaultValue: normalized });
    } catch {
      return normalized;
    }
  };

  // Removed - using formatShortDate from date-formatter.ts instead

  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      'base': 'bg-blue-600',
      'build': 'bg-emerald-600',
      'peak': 'bg-brand-primary',
      'taper': 'bg-purple-600',
      'race': 'bg-red-600'
    };
    return colors[phase] || 'bg-slate-600';
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-slate-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-brand-primary" />
              {t('title')}
            </h1>
            <p className="text-slate-600 text-lg">
              {t('subtitle', { goal: getDistanceLabel(plan.goalDistance) })}
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-slate-200 shadow-elevation-2 hover:shadow-elevation-3 transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-brand-primary" />
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-1">
                    {t('summary.goal')}
                    <AIFieldIcon
                      label="Meta e Data"
                      importance="critical"
                      impact="Define todo o plano"
                      howUsed="IA calcula semanas disponíveis e progressão necessária baseado na distância e data alvo"
                      className="ml-1"
                    />
                    {getFieldStatus('goalDistance') && (
                      <AIFieldStatus
                        status={getFieldStatus('goalDistance')!.status}
                        importance={getFieldStatus('goalDistance')!.importance}
                        label="Meta"
                        variant="compact"
                      />
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-slate-900">
                  {getDistanceLabel(plan.goalDistance)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {formatLocalizedDate(plan.targetRaceDate, locale)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-elevation-2 hover:shadow-elevation-3 transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-1">
                    {t('summary.currentWeek')}
                    <AIFieldIcon
                      label="Semana e Fase Atual"
                      importance="high"
                      impact="Periodização e objetivos específicos"
                      howUsed="IA divide plano em fases (Base/Build/Peak/Taper). Cada fase tem volume e intensidade específicos"
                      className="ml-1"
                    />
                    {getFieldStatus('currentWeek') && (
                      <AIFieldStatus
                        status={getFieldStatus('currentWeek')!.status}
                        importance={getFieldStatus('currentWeek')!.importance}
                        label="Semana"
                        variant="compact"
                      />
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-slate-900">
                  {currentWeekNum}/{plan.totalWeeks}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {currentWeek && t(`plano.phases.${normalizePhaseKey(currentWeek.phase)}`, currentWeek.phase)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-elevation-2 hover:shadow-elevation-3 transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-1">
                    {t('summary.progress')}
                    <AIFieldIcon
                      label="Taxa de Conclusão"
                      importance="high"
                      impact="Aderência e necessidade de ajustes"
                      howUsed="IA monitora conclusão. Baixa taxa (<70%) pode sugerir ajuste de volume ou intensidade"
                      className="ml-1"
                    />
                    {getFieldStatus('completionRate') && (
                      <AIFieldStatus
                        status={getFieldStatus('completionRate')!.status}
                        importance={getFieldStatus('completionRate')!.importance}
                        label="Taxa"
                        variant="compact"
                      />
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-brand-primary">
                  {Math.round(plan.completionRate)}%
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {t('summary.completedWorkouts')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-elevation-2 hover:shadow-elevation-3 transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-slate-600" />
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-1">
                    {t('summary.totalDuration')}
                    <AIFieldIcon
                      label="Duração Total"
                      importance="high"
                      impact="Tempo de adaptação e progressão"
                      howUsed="IA calcula semanas baseado na data da prova. Mínimo recomendado: 8 semanas para meia, 12 para maratona"
                      className="ml-1"
                    />
                    {getFieldStatus('totalWeeks') && (
                      <AIFieldStatus
                        status={getFieldStatus('totalWeeks')!.status}
                        importance={getFieldStatus('totalWeeks')!.importance}
                        label="Duração"
                        variant="compact"
                      />
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-slate-900">
                  {plan.totalWeeks}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {t('summary.weeks')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Week Navigation */}
          <Card className="mb-8 border-slate-200 shadow-elevation-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900">
                    {t('weekNavigation.week')} {viewingWeek} {t('weekNavigation.of')} {plan.totalWeeks}
                  </CardTitle>
                  {currentWeek && (
                    <CardDescription className="text-slate-600">
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
                    <div className="flex justify-between items-center text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Activity className="h-4 w-4 text-brand-primary" />
                        {t('weekNavigation.volume')}: {currentWeek.totalDistance.toFixed(1)} km
                      </span>
                      <span className="font-semibold">
                        {Math.round((currentWeek.completedWorkouts / currentWeek.totalWorkouts) * 100)}% {t('weekNavigation.completed')}
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
                                      <div className="font-medium text-slate-700">
                                        {dayWorkouts.map((w, idx) => {
                                          const icon = getWorkoutIcon(w.type, w.title);
                                          return (
                                            <span key={idx} className="inline-flex items-center gap-1">
                                              {icon} {w.title}
                                              {idx < dayWorkouts.length - 1 && ' • '}
                                            </span>
                                          );
                                        })}
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
