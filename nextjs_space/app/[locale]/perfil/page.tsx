'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import LanguageSwitcher from '../../../components/LanguageSwitcher';

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(locale === 'pt-BR' ? '/login' : `/${locale}/login`);
    }
  }, [status, router, locale]);

  useEffect(() => {
    if (session?.user) fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile/create', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        if (data.hasProfile === false && !data.profile) {
          router.push(locale === 'pt-BR' ? '/onboarding' : `/${locale}/onboarding`);
          return;
        }
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Error:', error);
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

  if (!session || !profile) return null;

  const t = (key: string) => {
    const translations: any = {
      'pt-BR': {
        myProfile: 'Meu Perfil',
        manage: 'Gerencie suas informações e preferências',
        personal: 'Pessoal',
        running: 'Corrida',
        health: 'Saúde',
        goals: 'Objetivos',
        availability: 'Disponibilidade',
        settings: 'Configurações',
        personalInfo: 'Informações Pessoais',
        name: 'Nome',
        birthDate: 'Data de Nascimento',
        gender: 'Gênero',
        editProfile: 'Editar Perfil',
        runningProfile: 'Perfil de Corrida',
        currentLevel: 'Nível Atual',
        weeklyKm: 'Km Semanais',
        underDev: 'Em Desenvolvimento',
        comingSoon: 'Esta seção estará disponível em breve',
        dashboard: 'Dashboard',
        plan: 'Plano',
        logout: 'Sair',
      },
      'en-US': {
        myProfile: 'My Profile',
        manage: 'Manage your information and preferences',
        personal: 'Personal',
        running: 'Running',
        health: 'Health',
        goals: 'Goals',
        availability: 'Availability',
        settings: 'Settings',
        personalInfo: 'Personal Information',
        name: 'Name',
        birthDate: 'Birth Date',
        gender: 'Gender',
        editProfile: 'Edit Profile',
        runningProfile: 'Running Profile',
        currentLevel: 'Current Level',
        weeklyKm: 'Weekly Km',
        underDev: 'Under Development',
        comingSoon: 'This section will be available soon',
        dashboard: 'Dashboard',
        plan: 'Plan',
        logout: 'Logout',
      },
      'es-ES': {
        myProfile: 'Mi Perfil',
        manage: 'Gestiona tu información y preferencias',
        personal: 'Personal',
        running: 'Running',
        health: 'Salud',
        goals: 'Objetivos',
        availability: 'Disponibilidad',
        settings: 'Configuración',
        personalInfo: 'Información Personal',
        name: 'Nombre',
        birthDate: 'Fecha de Nacimiento',
        gender: 'Género',
        editProfile: 'Editar Perfil',
        runningProfile: 'Perfil de Running',
        currentLevel: 'Nivel Actual',
        weeklyKm: 'Km Semanales',
        underDev: 'En Desarrollo',
        comingSoon: 'Esta sección estará disponible pronto',
        dashboard: 'Dashboard',
        plan: 'Plan',
        logout: 'Salir',
      },
    };
    return translations[locale]?.[key] || key;
  };

  const tabs = [
    { id: 'personal', icon: '👤', label: t('personal') },
    { id: 'running', icon: '🏃', label: t('running') },
    { id: 'health', icon: '❤️', label: t('health') },
    { id: 'goals', icon: '🎯', label: t('goals') },
    { id: 'availability', icon: '📅', label: t('availability') },
    { id: 'settings', icon: '⚙️', label: t('settings') },
  ];

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
            <Link href={locale === 'pt-BR' ? '/plano' : `/${locale}/plano`} className="text-gray-600 hover:text-gray-900">
              {t('plan')}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('myProfile')}</h1>
          <p className="text-gray-600">{t('manage')}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b overflow-x-auto">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-medium whitespace-nowrap ${
                    activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">{t('personalInfo')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('name')}</label>
                    <div className="p-3 bg-gray-50 rounded-lg">{profile.name || session.user?.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="p-3 bg-gray-50 rounded-lg">{profile.email || session.user?.email}</div>
                  </div>
                  {profile.birthDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('birthDate')}</label>
                      <div className="p-3 bg-gray-50 rounded-lg">{new Date(profile.birthDate).toLocaleDateString(locale)}</div>
                    </div>
                  )}
                  {profile.gender && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('gender')}</label>
                      <div className="p-3 bg-gray-50 rounded-lg">{profile.gender}</div>
                    </div>
                  )}
                </div>
                <Link href={locale === 'pt-BR' ? '/onboarding' : `/${locale}/onboarding`} className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  {t('editProfile')}
                </Link>
              </div>
            )}

            {activeTab === 'running' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">{t('runningProfile')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profile.currentLevel && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('currentLevel')}</label>
                      <div className="p-3 bg-gray-50 rounded-lg">{profile.currentLevel}</div>
                    </div>
                  )}
                  {profile.weeklyKm && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('weeklyKm')}</label>
                      <div className="p-3 bg-gray-50 rounded-lg">{profile.weeklyKm} km</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(activeTab === 'health' || activeTab === 'goals' || activeTab === 'availability' || activeTab === 'settings') && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('underDev')}</h3>
                <p className="text-gray-600">{t('comingSoon')}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
