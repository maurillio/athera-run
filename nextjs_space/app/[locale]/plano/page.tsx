'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import LanguageSwitcher from '../../../components/LanguageSwitcher';
import dayjs from 'dayjs';

interface CustomPlan {
  id: number;
  goalDistance: string;
  targetRaceDate: string;
  totalWeeks: number;
  currentWeek: number;
  weeklyTrainingDays: number;
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
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<CustomPlan | null>(null);
  const [weeks, setWeeks] = useState<CustomWeek[]>([]);
  const [viewingWeek, setViewingWeek] = useState(1);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(locale === 'pt-BR' ? '/login' : `/${locale}/login`);
    }
  }, [status, router, locale]);

  useEffect(() => {
    if (session?.user) {
      fetchPlan();
    }
  }, [session]);

  const fetchPlan = async () => {
    try {
      const [planRes, weeksRes] = await Promise.all([
        fetch('/api/plan'),
        fetch('/api/plan/weeks')
      ]);

      if (planRes.ok) {
        const planData = await planRes.json();
        setPlan(planData);
        setViewingWeek(planData.currentWeek || 1);
      }

      if (weeksRes.ok) {
        const weeksData = await weeksRes.json();
        setWeeks(weeksData.weeks || []);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) return null;

  const t = (key: string) => {
    const translations: any = {
      'pt-BR': {
        myPlan: 'Meu Plano de Treino',
        noPlan: 'Você ainda não tem um plano de treino',
        createPlan: 'Criar Plano',
        overview: 'Visão Geral',
        goal: 'Objetivo',
        raceDate: 'Data da Prova',
        totalWeeks: 'Semanas Totais',
        currentWeek: 'Semana Atual',
        daysPerWeek: 'Dias/Semana',
        weekDetails: 'Detalhes da Semana',
        week: 'Semana',
        phase: 'Fase',
        focus: 'Foco',
        totalDistance: 'Distância Total',
        workouts: 'Treinos',
        completedWorkouts: 'Treinos Concluídos',
        previous: 'Anterior',
        next: 'Próxima',
        comingSoon: 'Visualização detalhada dos treinos em breve',
        dashboard: 'Dashboard',
        profile: 'Perfil',
        logout: 'Sair',
      },
      'en-US': {
        myPlan: 'My Training Plan',
        noPlan: "You don't have a training plan yet",
        createPlan: 'Create Plan',
        overview: 'Overview',
        goal: 'Goal',
        raceDate: 'Race Date',
        totalWeeks: 'Total Weeks',
        currentWeek: 'Current Week',
        daysPerWeek: 'Days/Week',
        weekDetails: 'Week Details',
        week: 'Week',
        phase: 'Phase',
        focus: 'Focus',
        totalDistance: 'Total Distance',
        workouts: 'Workouts',
        completedWorkouts: 'Completed Workouts',
        previous: 'Previous',
        next: 'Next',
        comingSoon: 'Detailed workout view coming soon',
        dashboard: 'Dashboard',
        profile: 'Profile',
        logout: 'Logout',
      },
      'es-ES': {
        myPlan: 'Mi Plan de Entrenamiento',
        noPlan: 'Aún no tienes un plan de entrenamiento',
        createPlan: 'Crear Plan',
        overview: 'Resumen',
        goal: 'Objetivo',
        raceDate: 'Fecha de Carrera',
        totalWeeks: 'Semanas Totales',
        currentWeek: 'Semana Actual',
        daysPerWeek: 'Días/Semana',
        weekDetails: 'Detalles de la Semana',
        week: 'Semana',
        phase: 'Fase',
        focus: 'Enfoque',
        totalDistance: 'Distancia Total',
        workouts: 'Entrenamientos',
        completedWorkouts: 'Entrenamientos Completados',
        previous: 'Anterior',
        next: 'Siguiente',
        comingSoon: 'Vista detallada de entrenamientos próximamente',
        dashboard: 'Dashboard',
        profile: 'Perfil',
        logout: 'Salir',
      },
    };
    return translations[locale]?.[key] || key;
  };

  const currentWeekData = weeks.find(w => w.weekNumber === viewingWeek);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href={locale === 'pt-BR' ? '/dashboard' : `/${locale}/dashboard`} className="text-2xl font-bold text-blue-600">
            Athera Run
          </Link>
          <div className="flex items-center gap-4">
            <Link href={locale === 'pt-BR' ? '/dashboard' : `/${locale}/dashboard`} className="text-gray-600 hover:text-gray-900">
              {t('dashboard')}
            </Link>
            <Link href={locale === 'pt-BR' ? '/perfil' : `/${locale}/perfil`} className="text-gray-600 hover:text-gray-900">
              {t('profile')}
            </Link>
            <LanguageSwitcher />
            <button onClick={() => signOut({ callbackUrl: locale === 'pt-BR' ? '/login' : `/${locale}/login` })} className="text-gray-600 hover:text-gray-900">
              {t('logout')}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('myPlan')}</h1>
        </div>

        {!plan ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🏃</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('noPlan')}</h2>
            <Link
              href={locale === 'pt-BR' ? '/onboarding' : `/${locale}/onboarding`}
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700"
            >
              {t('createPlan')}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">{t('overview')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{t('goal')}</label>
                  <div className="text-2xl font-bold text-blue-600">{plan.goalDistance}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{t('raceDate')}</label>
                  <div className="text-lg font-semibold">{dayjs(plan.targetRaceDate).format('DD/MM/YYYY')}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{t('daysPerWeek')}</label>
                  <div className="text-lg font-semibold">{plan.weeklyTrainingDays}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{t('totalWeeks')}</label>
                  <div className="text-lg font-semibold">{plan.totalWeeks}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{t('currentWeek')}</label>
                  <div className="text-lg font-semibold">{plan.currentWeek}</div>
                </div>
              </div>
            </div>

            {/* Week Navigation */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{t('weekDetails')}</h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setViewingWeek(Math.max(1, viewingWeek - 1))}
                    disabled={viewingWeek === 1}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← {t('previous')}
                  </button>
                  <span className="font-semibold">
                    {t('week')} {viewingWeek}
                  </span>
                  <button
                    onClick={() => setViewingWeek(Math.min(plan.totalWeeks, viewingWeek + 1))}
                    disabled={viewingWeek === plan.totalWeeks}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('next')} →
                  </button>
                </div>
              </div>

              {currentWeekData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <label className="block text-sm font-medium text-blue-900 mb-1">{t('phase')}</label>
                      <div className="font-semibold">{currentWeekData.phase}</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <label className="block text-sm font-medium text-green-900 mb-1">{t('focus')}</label>
                      <div className="font-semibold">{currentWeekData.focus}</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <label className="block text-sm font-medium text-purple-900 mb-1">{t('totalDistance')}</label>
                      <div className="font-semibold">{currentWeekData.totalDistance} km</div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{t('workouts')}</span>
                      <span className="text-2xl font-bold">{currentWeekData.totalWorkouts}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-medium">{t('completedWorkouts')}</span>
                      <span className="text-2xl font-bold text-green-600">{currentWeekData.completedWorkouts}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-blue-700">{t('comingSoon')}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  {locale === 'pt-BR' ? 'Nenhum dado disponível para esta semana' : locale === 'en-US' ? 'No data available for this week' : 'No hay datos disponibles para esta semana'}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
