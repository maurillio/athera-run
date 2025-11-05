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
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const tPlano = useTranslations('plano');
  
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
    }
  }, [session]);

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
          const now = new Date();
          const upcoming = data.currentWeek.workouts
            .filter((w: Workout) => !w.isCompleted && new Date(w.date) >= now)
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const getDistanceLabel = (distance: string) => {
    return tPlano(`goalLabels.${distance}`, distance);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              {session.user?.name 
                ? t('welcome', { name: session.user.name })
                : t('welcomeDefault')
              }
            </h1>
            <p className="text-muted-foreground text-lg">
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
            <Card className="mb-8 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  {t('generatePlan.title')}
                </CardTitle>
                <CardDescription>
                  {t('generatePlan.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleGeneratePlan}
                  disabled={generatingPlan}
                  className="bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700"
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                <Card className="touch-manipulation">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('stats.nextWorkout')}</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="pt-2">
                    {nextWorkout ? (
                      <>
                        <div className="text-xl sm:text-2xl font-bold">
                          {new Date(nextWorkout.date).toLocaleDateString(locale, { weekday: 'short' })}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {nextWorkout.title}
                        </p>
                      </>
                    ) : (
                      <div className="text-sm">{t('stats.noWorkout')}</div>
                    )}
                  </CardContent>
                </Card>

                <Card className="touch-manipulation">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('stats.currentWeek')}</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="text-xl sm:text-2xl font-bold">
                      {currentWeek.weekNumber}/{plan.totalWeeks}
                    </div>
                    <p className="text-xs text-muted-foreground">{currentWeek.phase}</p>
                  </CardContent>
                </Card>

                <Card className="touch-manipulation">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('stats.goal')}</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="text-xl sm:text-2xl font-bold">
                      {getDistanceLabel(plan.goalDistance)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(plan.targetRaceDate).toLocaleDateString(locale)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="touch-manipulation">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('stats.progress')}</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="text-xl sm:text-2xl font-bold">
                      {Math.round(plan.completionRate)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {currentWeek.completedWorkouts}/{currentWeek.totalWorkouts} {t('stats.completed')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Workouts */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>{t('upcomingWorkouts.title')}</CardTitle>
                  <CardDescription>{t('upcomingWorkouts.description')}</CardDescription>
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
                          <div className="text-center py-8 text-muted-foreground">
                            <p>{t('upcomingWorkouts.noWorkouts')}</p>
                            <p className="text-sm mt-2">
                              <Link href={`/${locale}/plano`} className="text-orange-600 hover:underline">
                                {t('upcomingWorkouts.viewFullPlan')}
                              </Link>
                            </p>
                          </div>
                        );
                      }

                      return todayAndTomorrow.map((workout: Workout) => {
                        const workoutDate = dayjs(workout.date).tz(appTimezone).startOf('day');
                        const isToday = workoutDate.isSame(today, 'day');
                        
                        return (
                          <div
                            key={workout.id}
                            className={`flex flex-col p-4 rounded-lg border ${
                              workout.isCompleted
                                ? 'bg-green-50 border-green-200'
                                : (workoutDate.isBefore(today, 'day') && !workout.isCompleted)
                                  ? 'bg-red-50 border-red-200'
                                  : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant={isToday ? "default" : "secondary"}>
                                    {isToday ? t('upcomingWorkouts.today') : t('upcomingWorkouts.tomorrow')}
                                  </Badge>
                                  {workout.isCompleted ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  ) : (workoutDate.isBefore(today, 'day') && !workout.isCompleted) ? (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  ) : null}
                                </div>
                                <h4 className="font-medium text-lg">{workout.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(workout.date).toLocaleDateString(locale, {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                  })}
                                </p>
                              </div>
                            </div>
                            
                            <p className="text-sm mb-3 text-gray-700">{workout.description}</p>
                            
                            <div className="flex flex-wrap gap-3 mb-3 text-sm">
                              {workout.distance && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">📍 {t('upcomingWorkouts.distance')}</span>
                                  <span>{workout.distance} km</span>
                                </div>
                              )}
                              {workout.duration && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">⏱️ {t('upcomingWorkouts.duration')}</span>
                                  <span>{workout.duration} min</span>
                                </div>
                              )}
                              {workout.targetPace && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">🎯 {t('upcomingWorkouts.pace')}</span>
                                  <span>{workout.targetPace}</span>
                                </div>
                              )}
                            </div>

                            {!workout.isCompleted && isToday && workout.type !== 'rest' && (
                              <Button 
                                onClick={() => handleOpenWorkoutLog(workout)}
                                className="mt-2 bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700"
                              >
                                {t('upcomingWorkouts.confirmButton')}
                              </Button>
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
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{t('quickAccess.title')}</CardTitle>
                      <CardDescription>{t('quickAccess.description')}</CardDescription>
                    </div>
                    <TrainingLogDialog onSuccess={() => window.location.reload()} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                {hasCustomPlan && (
                  <Link href={`/${locale}/plano`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      {t('quickAccess.viewPlan')}
                    </Button>
                  </Link>
                )}
                <Link href="/tracking">
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="mr-2 h-4 w-4" />
                    {t('quickAccess.registerWorkout')}
                  </Button>
                </Link>
                <Link href="/calculator">
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="mr-2 h-4 w-4" />
                    {t('quickAccess.calculator')}
                  </Button>
                </Link>
                <Link href="/training">
                  <Button variant="outline" className="w-full justify-start">
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
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t('advancedFeatures.title')}</CardTitle>
              <CardDescription>{t('advancedFeatures.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium">{t('advancedFeatures.personalizedPlan')}</p>
                    <p className="text-sm text-muted-foreground">
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
                    <p className="font-medium">{t('advancedFeatures.aiAnalysis')}</p>
                    <p className="text-sm text-muted-foreground">{t('advancedFeatures.aiAnalysisDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">{t('advancedFeatures.stravaIntegration')}</p>
                    <p className="text-sm text-muted-foreground">{t('advancedFeatures.stravaIntegrationDesc')}</p>
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
