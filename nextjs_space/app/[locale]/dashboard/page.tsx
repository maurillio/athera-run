'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import LanguageSwitcher from '../../../components/LanguageSwitcher';

interface CustomPlan {
  id: number;
  goalDistance: string;
  targetRaceDate: string;
  weeklyTrainingDays: number;
  planWeeks: number;
}

interface AthleteProfile {
  hasCompletedOnboarding: boolean;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [plan, setPlan] = useState<CustomPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(locale === 'pt-BR' ? '/login' : `/${locale}/login`);
    }
  }, [status, router, locale]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      const [profileRes, planRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/plan')
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
        
        // Redirect to onboarding if not completed
        if (!profileData.hasCompletedOnboarding) {
          router.push(locale === 'pt-BR' ? '/onboarding' : `/${locale}/onboarding`);
          return;
        }
      }

      if (planRes.ok) {
        const planData = await planRes.json();
        setPlan(planData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {locale === 'pt-BR' ? 'Carregando...' : locale === 'en-US' ? 'Loading...' : 'Cargando...'}
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const userName = session.user?.name || session.user?.email?.split('@')[0] || 'Atleta';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href={locale === 'pt-BR' ? '/' : `/${locale}`} className="text-2xl font-bold text-blue-600">
            Athera Run
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={() => signOut({ callbackUrl: locale === 'pt-BR' ? '/login' : `/${locale}/login` })}
              className="text-gray-600 hover:text-gray-900"
            >
              {locale === 'pt-BR' ? 'Sair' : locale === 'en-US' ? 'Logout' : 'Salir'}
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {locale === 'pt-BR' ? `Olá, ${userName}!` : locale === 'en-US' ? `Hello, ${userName}!` : `¡Hola, ${userName}!`}
          </h1>
          <p className="text-gray-600">
            {locale === 'pt-BR' 
              ? 'Bem-vindo ao seu painel de treino' 
              : locale === 'en-US' 
              ? 'Welcome to your training dashboard' 
              : 'Bienvenido a tu panel de entrenamiento'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {locale === 'pt-BR' ? 'Seu Plano' : locale === 'en-US' ? 'Your Plan' : 'Tu Plan'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {plan ? plan.goalDistance : '-'}
                </p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {locale === 'pt-BR' ? 'Dias/Semana' : locale === 'en-US' ? 'Days/Week' : 'Días/Semana'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {plan ? plan.weeklyTrainingDays : '-'}
                </p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {locale === 'pt-BR' ? 'Semanas' : locale === 'en-US' ? 'Weeks' : 'Semanas'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {plan ? plan.planWeeks : '-'}
                </p>
              </div>
              <div className="text-4xl">⏱️</div>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Your Plan Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">
              {locale === 'pt-BR' ? 'Seu Plano de Treino' : locale === 'en-US' ? 'Your Training Plan' : 'Tu Plan de Entrenamiento'}
            </h2>
            {plan ? (
              <div>
                <p className="text-gray-600 mb-4">
                  {locale === 'pt-BR' 
                    ? `Plano para ${plan.goalDistance} - ${plan.planWeeks} semanas`
                    : locale === 'en-US'
                    ? `${plan.goalDistance} plan - ${plan.planWeeks} weeks`
                    : `Plan ${plan.goalDistance} - ${plan.planWeeks} semanas`}
                </p>
                <Link
                  href={locale === 'pt-BR' ? '/plano' : `/${locale}/plano`}
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  {locale === 'pt-BR' ? 'Ver Plano' : locale === 'en-US' ? 'View Plan' : 'Ver Plan'}
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">
                  {locale === 'pt-BR' 
                    ? 'Você ainda não tem um plano de treino'
                    : locale === 'en-US'
                    ? "You don't have a training plan yet"
                    : 'Aún no tienes un plan de entrenamiento'}
                </p>
                <Link
                  href={locale === 'pt-BR' ? '/onboarding' : `/${locale}/onboarding`}
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  {locale === 'pt-BR' ? 'Criar Plano' : locale === 'en-US' ? 'Create Plan' : 'Crear Plan'}
                </Link>
              </div>
            )}
          </div>

          {/* Profile Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">
              {locale === 'pt-BR' ? 'Seu Perfil' : locale === 'en-US' ? 'Your Profile' : 'Tu Perfil'}
            </h2>
            <p className="text-gray-600 mb-4">
              {locale === 'pt-BR' 
                ? 'Gerencie suas informações e preferências'
                : locale === 'en-US'
                ? 'Manage your information and preferences'
                : 'Gestiona tu información y preferencias'}
            </p>
            <Link
              href={locale === 'pt-BR' ? '/perfil' : `/${locale}/perfil`}
              className="inline-block border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50"
            >
              {locale === 'pt-BR' ? 'Editar Perfil' : locale === 'en-US' ? 'Edit Profile' : 'Editar Perfil'}
            </Link>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            {locale === 'pt-BR' ? '🚀 Em Breve' : locale === 'en-US' ? '🚀 Coming Soon' : '🚀 Próximamente'}
          </h3>
          <p className="text-blue-700">
            {locale === 'pt-BR'
              ? 'Registro de treinos, análises de IA, ajustes automáticos e muito mais!'
              : locale === 'en-US'
              ? 'Training logs, AI analysis, automatic adjustments and much more!'
              : '¡Registro de entrenamientos, análisis de IA, ajustes automáticos y mucho más!'}
          </p>
        </div>
      </main>
    </div>
  );
}
