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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatLocalizedDate, formatShortDate } from '@/lib/utils/date-formatter';
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

import {
  Calendar,
  Target,
  Activity,
  TrendingUp,
  Award,
  Zap,
  Loader2,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import TrainingLogDialog from '@/components/training-log-dialog';
import AIAnalysisSection from '@/components/ai-analysis-section';
import AutoAdjustCard from '@/components/auto-adjust-card';
import TrainingChat from '@/components/training-chat';
import UpgradeBanner from '@/components/subscription/upgrade-banner';
import ProgressAnalysisBanner from '@/components/progress-analysis-banner';
import WorkoutLogDialog from '@/components/dashboard/workout-log-dialog';
import { WorkoutDetails } from '@/components/workout-details';
import DashboardStravaWidget from '@/components/dashboard/strava-widget';
import AIFieldIcon from '@/components/ai-transparency/AIFieldIcon';
import AIFieldStatus from '@/components/ai-transparency/AIFieldStatus';
import { useFieldAnalysis } from '@/hooks/useFieldAnalysis';

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

interface Workout {
  id: number;
  date: string;
  type: string;
  subtype: string | null;
  title: string;
  description: string;
  distance: number | null;
  duration: number | null;
  targetPace: string | null;
  isCompleted: boolean;
  
  // v2.0.0 - Estrutura detalhada e enriquecimento educacional
  warmUpStructure?: any;
  mainWorkoutStruct?: any;
  coolDownStructure?: any;
  objective?: string;
  scientificBasis?: string;
  tips?: string[];
  commonMistakes?: string[];
  successCriteria?: string[];
  intensityLevel?: number;
  expectedRPE?: number;
  heartRateZones?: any;
  intervals?: any;
  expectedDuration?: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const tPlano = useTranslations('plano');
  const { getFieldStatus } = useFieldAnalysis();
  
  const [plan, setPlan] = useState<CustomPlan | null>(null);
  const [currentWeek, setCurrentWeek] = useState<CustomWeek | null>(null);
  const [nextWorkout, setNextWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [hasCustomPlan, setHasCustomPlan] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showWorkoutLogDialog, setShowWorkoutLogDialog] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/${locale}/login`);
    }
  }, [status, router, locale]);

  // Set dayjs locale based on user's selected locale
  useEffect(() => {
    const dayjsLocale = locale === 'pt-BR' ? 'pt-br' : locale === 'es' ? 'es' : 'en';
    dayjs.locale(dayjsLocale);
  }, [locale]);

  useEffect(() => {
    if (session?.user) {
      fetchPlan();
      // Sincronizar treinos do Strava automaticamente
      syncStravaWorkouts();
    }
  }, [session]);

  // Função para sincronizar treinos do Strava
  const syncStravaWorkouts = async () => {
    try {
      const response = await fetch('/api/workouts/sync-strava', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.synced > 0) {
          console.log(`[SYNC] ✅ ${data.synced} treino(s) sincronizado(s) do Strava`);
          // Recarregar plano para atualizar status
          await fetchPlan();
        }
      }
    } catch (error) {
      console.error('[SYNC] Erro ao sincronizar treinos:', error);
      // Não mostra erro para o usuário, é um processo silencioso
    }
  };

  const fetchPlan = async () => {
    try {
      const response = await fetch('/api/plan/current');
      if (response.ok) {
        const data = await response.json();
        
        if (data.hasCustomPlan === false) {
          setHasCustomPlan(false);
          return;
        }
        
        setPlan(data.plan);
        setCurrentWeek(data.currentWeek);
        setHasCustomPlan(true);

        if (data.currentWeek?.workouts) {
          const now = Date.now();
          const upcoming = data.currentWeek.workouts
            .filter((w: Workout) => !w.isCompleted && new Date(w.date).getTime() >= now)
            .sort((a: Workout, b: Workout) => 
              new Date(a.date).getTime() - new Date(b.date).getTime()
            )[0];
          
          if (upcoming) {
            setNextWorkout(upcoming);
          } else {
            setNextWorkout(data.currentWeek.workouts[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    try {
      const response = await fetch('/api/plan/generate', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        await fetchPlan();
      } else {
        const errorData = await response.json();
        
        console.error('[DASHBOARD] Error generating plan:', errorData);
        
        if (errorData.redirectTo === '/onboarding') {
          alert(errorData.message || 'Por favor, complete seu perfil antes de gerar o plano.');
          router.push(`/${locale}/onboarding`);
        } else {
          const errorMessage = errorData.details 
            ? `Erro: ${errorData.error}\n\nDetalhes: ${errorData.details}`
            : errorData.error || 'Erro ao gerar plano. Tente novamente.';
          alert(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('Erro ao gerar plano. Tente novamente.');
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleOpenWorkoutLog = (workout: Workout) => {
    setSelectedWorkout(workout);
    setShowWorkoutLogDialog(true);
  };

  const handleCloseWorkoutLog = () => {
    setShowWorkoutLogDialog(false);
    setSelectedWorkout(null);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-slate-200 rounded skeleton" />
              <div className="h-4 w-64 bg-slate-200 rounded skeleton" />
            </div>
            <div className="h-10 w-32 bg-slate-200 rounded-lg skeleton" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-6 bg-white shadow-elevation-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 bg-slate-200 rounded-full skeleton" />
                  <div className="flex-1">
                    <div className="h-6 w-16 bg-slate-200 rounded skeleton mb-2" />
                    <div className="h-3 w-24 bg-slate-200 rounded skeleton" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-elevation-2">
                <div className="h-6 w-32 bg-slate-200 rounded skeleton mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-slate-200 rounded skeleton" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-full bg-slate-200 rounded skeleton" />
                        <div className="h-3 w-3/4 bg-slate-200 rounded skeleton" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-elevation-2">
                <div className="h-6 w-24 bg-slate-200 rounded skeleton mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-slate-200 rounded skeleton" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const getDistanceLabel = (distance: string) => {
    // Normalize distance to match translation keys
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
        'half marathon': 'half_marathon',
        'halfmarathon': 'half_marathon',
        'meia maratona': 'half_marathon',
        'meia-maratona': 'half_marathon',
        '42k': '42k',
        '42km': '42k',
        'marathon': 'marathon',
        'maratona': 'marathon'
      };
      return map[dist?.toLowerCase()] || dist?.toLowerCase();
    };

    const normalized = normalizeDistance(distance);
    try {
      return tPlano(`goalLabels.${normalized}`, { defaultValue: normalized });
    } catch {
      return normalized;
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-slate-50">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              {session.user?.name 
                ? t('welcome', { name: session.user.name })
                : t('welcomeDefault')
              }
            </h1>
            <p className="text-slate-600 text-lg">
              {hasCustomPlan 
                ? t('subtitle')
                : t('createPlanSubtitle')
              }
            </p>
          </div>

          {/* Upgrade Banner */}
          <UpgradeBanner className="mb-6" />

          {/* Progress Analysis Banner (Premium Feature) */}
          {hasCustomPlan && <ProgressAnalysisBanner />}

          {!hasCustomPlan && (
            <Card className="mb-8 border-2 border-orange-200 bg-orange-50 shadow-elevation-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Zap className="h-5 w-5 text-brand-primary" />
                  {t('generatePlan.title')}
                </CardTitle>
                <CardDescription className="text-slate-600">
                  {t('generatePlan.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleGeneratePlan}
                  disabled={generatingPlan}
                  className="shadow-md"
                >
                  {generatingPlan ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('generatePlan.generating')}
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      {t('generatePlan.button')}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {hasCustomPlan && plan && currentWeek && (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="border-slate-200 shadow-elevation-2 hover:shadow-elevation-3 transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-brand-primary" />
                      <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-1">
                        {t('stats.nextWorkout')}
                        <AIFieldIcon
                          label="Próximo Treino"
                          importance="high"
                          impact="Organização e preparação mental"
                          howUsed="IA planeja sequência de treinos otimizada. Próximo treino baseado em recuperação e progressão"
                          className="ml-1"
                        />
                        {getFieldStatus('nextWorkout') && (
                          <AIFieldStatus
                            status={getFieldStatus('nextWorkout')!.status}
                            importance={getFieldStatus('nextWorkout')!.importance}
                            label="Próximo"
                            variant="compact"
                          />
                        )}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {nextWorkout ? (
                      <>
                        <div className="text-2xl font-bold text-slate-900">
                          {formatShortDate(nextWorkout.date, locale)}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {nextWorkout.title}
                        </p>
                      </>
                    ) : (
                      <div className="text-sm text-slate-600">{t('stats.noWorkout')}</div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-elevation-2 hover:shadow-elevation-3 transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-1">
                        {t('stats.currentWeek')}
                        <AIFieldIcon
                          label="Semana Atual"
                          importance="high"
                          impact="Fase de treinamento e periodização"
                          howUsed="IA divide plano em fases (Base/Build/Peak/Taper). Cada fase tem objetivos específicos"
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
                    <div className="text-2xl font-bold text-slate-900">
                      {currentWeek.weekNumber}/{plan.totalWeeks}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{currentWeek.phase}</p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-elevation-2 hover:shadow-elevation-3 transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-brand-primary" />
                      <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-1">
                        {t('stats.goal')}
                        <AIFieldIcon
                          label="Meta da Prova"
                          importance="critical"
                          impact="Estrutura completa do plano"
                          howUsed="IA usa distância e data para calcular semanas disponíveis e progressão necessária"
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
                    <div className="text-2xl font-bold text-slate-900">
                      {getDistanceLabel(plan.goalDistance)}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatShortDate(plan.targetRaceDate, locale)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-elevation-2 hover:shadow-elevation-3 transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-emerald-600" />
                      <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-1">
                        {t('stats.progress')}
                        <AIFieldIcon
                          label="Progresso do Plano"
                          importance="high"
                          impact="Motivação e ajustes necessários"
                          howUsed="IA monitora aderência. Baixa taxa de conclusão pode sugerir ajustes de volume ou intensidade"
                          className="ml-1"
                        />
                        {getFieldStatus('completionRate') && (
                          <AIFieldStatus
                            status={getFieldStatus('completionRate')!.status}
                            importance={getFieldStatus('completionRate')!.importance}
                            label="Progresso"
                            variant="compact"
                          />
                        )}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-brand-primary">
                      {Math.round(plan.completionRate)}%
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {currentWeek.completedWorkouts}/{currentWeek.totalWorkouts} {t('stats.completed')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Strava Widget - Compact */}
              <div className="mb-8">
                <DashboardStravaWidget compact={true} />
              </div>

              {/* Próximo Treino */}
              <Card className="mb-8 border-2 border-brand-primary bg-gradient-to-br from-orange-50 to-white shadow-elevation-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Zap className="h-5 w-5 text-brand-primary" />
                    {t('upcomingWorkouts.title')}
                    <AIFieldIcon
                      label="Treinos Próximos"
                      importance="high"
                      impact="Preparação e execução"
                      howUsed="IA sequencia treinos para otimizar adaptação. Hoje e amanhã mostram foco imediato"
                      className="ml-auto"
                    />
                    {getFieldStatus('upcomingWorkouts') && (
                      <AIFieldStatus
                        status={getFieldStatus('upcomingWorkouts')!.status}
                        importance={getFieldStatus('upcomingWorkouts')!.importance}
                        label="Próximos"
                        variant="compact"
                      />
                    )}
                  </CardTitle>
                  <CardDescription className="text-slate-600">{t('upcomingWorkouts.description')}</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-3">
                    {(() => {
                      const appTimezone = 'America/Sao_Paulo';
                      const today = dayjs().tz(appTimezone).startOf('day');
                      const tomorrow = today.add(1, 'day');
                      const dayAfterTomorrow = today.add(2, 'day');
                      
                      const todayAndTomorrow = currentWeek.workouts.filter((w: Workout) => {
                        const workoutDate = dayjs(w.date).tz(appTimezone).startOf('day');
                        return workoutDate.isSameOrAfter(today) && workoutDate.isBefore(dayAfterTomorrow);
                      }).sort((a: Workout, b: Workout) => 
                        dayjs(a.date).tz(appTimezone).startOf('day').valueOf() - dayjs(b.date).tz(appTimezone).startOf('day').valueOf()
                      );

                      if (todayAndTomorrow.length === 0) {
                        return (
                          <div className="text-center py-8 text-slate-600">
                            <p>{t('upcomingWorkouts.noWorkouts')}</p>
                            <p className="text-sm mt-2">
                              <Link href={`/${locale}/plano`} className="text-brand-primary hover:text-brand-primary-dark font-semibold">
                                {t('upcomingWorkouts.viewFullPlan')}
                              </Link>
                            </p>
                          </div>
                        );
                      }

                      return todayAndTomorrow.map((workout: Workout) => {
                        const workoutDate = dayjs(workout.date).tz(appTimezone).startOf('day');
                        const isToday = workoutDate.isSame(today, 'day');
                        const isMissed = workoutDate.isBefore(today, 'day') && !workout.isCompleted;
                        
                        return (
                          <div
                            key={workout.id}
                            className={`rounded-lg border-2 transition-all ${
                              workout.isCompleted
                                ? 'bg-gradient-to-br from-green-100 to-green-50 border-green-500'
                                : isMissed
                                  ? 'bg-gradient-to-br from-red-100 to-red-50 border-red-500'
                                  : 'bg-white border-gray-300'
                            }`}
                          >
                            {/* Header com badges */}
                            <div className="p-4 border-b border-slate-200">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant={isToday ? "default" : "secondary"} className="gap-1">
                                    {isToday && <Zap className="h-3 w-3" />}
                                    {isToday ? t('upcomingWorkouts.today') : t('upcomingWorkouts.tomorrow')}
                                  </Badge>
                                  {workout.isCompleted ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                  ) : isMissed ? (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                  ) : null}
                                </div>
                              </div>
                            </div>

                            {/* Detalhes do treino usando componente v2.0.0 */}
                            <div className="p-4">
                              <WorkoutDetails 
                                workout={workout as any} 
                                isExpanded={true}
                              />
                            </div>

                            {/* Botão de confirmação */}
                            {!workout.isCompleted && isToday && workout.type !== 'rest' && (
                              <div className="px-4 pb-4">
                                <Button 
                                  onClick={() => handleOpenWorkoutLog(workout)}
                                  className="w-full shadow-md"
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  {t('upcomingWorkouts.confirmButton')}
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Link href={`/${locale}/plano`}>
                      <Button variant="outline" className="w-full">
                        <Calendar className="mr-2 h-4 w-4" />
                        {t('quickAccess.viewPlan')}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Auto Adjust Card */}
              <AutoAdjustCard />
            </>
          )}

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card className="border-slate-200 shadow-elevation-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-slate-900">{t('quickAccess.title')}</CardTitle>
                      <CardDescription className="text-slate-600">{t('quickAccess.description')}</CardDescription>
                    </div>
                    <TrainingLogDialog onSuccess={() => window.location.reload()} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                {hasCustomPlan && (
                  <Link href={`/${locale}/plano`}>
                    <Button variant="outline" className="w-full justify-start border-2">
                      <Calendar className="mr-2 h-4 w-4" />
                      {t('quickAccess.viewPlan')}
                    </Button>
                  </Link>
                )}
                <Link href={`/${locale}/tracking`}>
                  <Button variant="outline" className="w-full justify-start border-2">
                    <Activity className="mr-2 h-4 w-4" />
                    {t('quickAccess.registerWorkout')}
                  </Button>
                </Link>
                <Link href={`/${locale}/calculator`}>
                  <Button variant="outline" className="w-full justify-start border-2">
                    <Target className="mr-2 h-4 w-4" />
                    {t('quickAccess.calculator')}
                  </Button>
                </Link>
                <Link href={`/${locale}/training`}>
                  <Button variant="outline" className="w-full justify-start border-2">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    {t('quickAccess.aiAnalysis')}
                  </Button>
                </Link>
              </CardContent>
              </Card>
            </div>

            <AIAnalysisSection />
          </div>

          {/* Advanced Features */}
          <Card className="mt-6 border-slate-200 shadow-elevation-2">
            <CardHeader>
              <CardTitle className="text-slate-900">{t('advancedFeatures.title')}</CardTitle>
              <CardDescription className="text-slate-600">{t('advancedFeatures.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-brand-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">{t('advancedFeatures.personalizedPlan')}</p>
                    <p className="text-sm text-slate-600">
                      {hasCustomPlan 
                        ? t('advancedFeatures.personalizedPlanDesc')
                        : t('advancedFeatures.personalizedPlanDescFuture')
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">{t('advancedFeatures.aiAnalysis')}</p>
                    <p className="text-sm text-slate-600">{t('advancedFeatures.aiAnalysisDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">{t('advancedFeatures.stravaIntegration')}</p>
                    <p className="text-sm text-slate-600">{t('advancedFeatures.stravaIntegrationDesc')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
      
      <TrainingChat />
      
      <WorkoutLogDialog 
        workout={selectedWorkout}
        open={showWorkoutLogDialog}
        onClose={handleCloseWorkoutLog}
        onSuccess={() => {
          handleCloseWorkoutLog();
          fetchPlan();
        }}
      />
    </>
  );
}
