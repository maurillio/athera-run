'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, Heart, Target, Calendar, Settings, AlertTriangle, RefreshCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ProfileTabs from '@/components/profile/v1.3.0/ProfileTabs';
import MedicalInfoSection from '@/components/medical-info-section';
import RaceManagement from '@/components/race-management';
import SubscriptionStatusCard from '@/components/subscription/subscription-status-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function PerfilPage() {
  const t = useTranslations('perfil');
  const tCommon = useTranslations('common');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [races, setRaces] = useState<any[]>([]);
  const [deletingPlan, setDeletingPlan] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
      fetchRaces();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile/create', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        
        if (data.hasProfile === false && !data.profile) {
          router.push('/onboarding');
          return;
        }
        
        setProfile(data.profile);
      } else {
        console.error('Error fetching profile: HTTP', response.status);
        toast.error(t('toasts.errorLoadingProfile'));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(t('toasts.errorConnection'));
    } finally {
      setLoading(false);
    }
  };

  const fetchRaces = async () => {
    try {
      const response = await fetch('/api/race-goals');
      if (response.ok) {
        const data = await response.json();
        setRaces(data.raceGoals || []);
      }
    } catch (error) {
      console.error('Error fetching races:', error);
    }
  };

  const handleUpdateProfile = async (updateData: any) => {
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        toast.success(t('toasts.profileUpdated'));
        
        if ((updateData.trainingActivities || updateData.longRunDay !== undefined) && profile?.hasCustomPlan) {
          toast.info(t('toasts.adjustPlanQuestion'), {
            action: {
              label: t('toasts.adjustPlanButton'),
              onClick: () => handleAutoAdjust(updateData)
            }
          });
        }
      } else {
        toast.error(t('toasts.errorUpdatingProfile'));
      }
    } catch (error) {
      toast.error(t('toasts.errorUpdatingProfile'));
    }
  };

  const handleAutoAdjust = async (changes: any) => {
    try {
      const response = await fetch('/api/plan/auto-adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'profile_update',
          changes
        })
      });

      if (response.ok) {
        toast.success(t('toasts.planAdjusted'));
        router.refresh();
      }
    } catch (error) {
      console.error('Error auto-adjusting:', error);
    }
  };

  const handleDeletePlan = async () => {
    setDeletingPlan(true);
    try {
      const regenerateResponse = await fetch('/api/plan/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'manual_regeneration',
          description: 'Regeneração manual do plano pelo usuário'
        })
      });

      if (regenerateResponse.ok) {
        toast.success(t('actions.regeneratePlan.successDeleted'));

        const generateResponse = await fetch('/api/plan/generate', { method: 'POST' });

        if (generateResponse.ok) {
          toast.success(t('actions.regeneratePlan.successGenerated'));
          setTimeout(() => {
            router.push('/dashboard');
            router.refresh();
          }, 1000);
        } else {
          toast.error(t('actions.regeneratePlan.errorGenerate'));
          setDeletingPlan(false);
        }
      } else {
        toast.error(t('actions.regeneratePlan.errorDelete'));
        setDeletingPlan(false);
      }
    } catch (error) {
      toast.error(t('actions.regeneratePlan.errorRegenerate'));
      setDeletingPlan(false);
    }
  };

  const handleDeleteProfile = async () => {
    console.log('[FRONTEND] 🚀 Iniciando exclusão de perfil...');
    setDeletingProfile(true);
    
    try {
      console.log('[FRONTEND] 📡 Fazendo requisição DELETE para /api/profile/delete');
      
      const response = await fetch('/api/profile/delete', { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'no-store' // Forçar sem cache
      });
      
      console.log('[FRONTEND] 📥 Response status:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('[FRONTEND] 📊 Response data:', data);

      if (response.ok && data.success) {
        console.log('[FRONTEND] ✅ Exclusão bem-sucedida!');
        
        toast.success(t('actions.deleteProfile.success'), {
          description: data.message,
          duration: 3000
        });
        
        // Limpar TODOS os caches
        console.log('[FRONTEND] 🧹 Limpando caches...');
        if (typeof window !== 'undefined') {
          // Limpar storages
          sessionStorage.clear();
          localStorage.clear();
          
          // Limpar cookies relacionados ao atleta
          const cookiesToClear = ['athleteProfile', 'onboardingData', 'planData'];
          cookiesToClear.forEach(name => {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          });
        }
        
        console.log('[FRONTEND] 🔄 Redirecionando para:', data.redirectTo);
        
        // Redirecionar para onboarding (hard redirect)
        const redirectPath = data.redirectTo || '/onboarding';
        setTimeout(() => {
          console.log('[FRONTEND] 🎯 Executando redirect...');
          window.location.replace(redirectPath); // Use replace em vez de href
        }, 1500);
      } else {
        console.error('[FRONTEND] ❌ Erro na resposta:', data);
        
        toast.error(data.error || t('actions.deleteProfile.error'), {
          description: data.details || 'Detalhes não disponíveis'
        });
        setDeletingProfile(false);
      }
    } catch (error) {
      console.error('[FRONTEND] ❌ ERRO CRÍTICO:', error);
      console.error('[FRONTEND] Tipo:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('[FRONTEND] Mensagem:', error instanceof Error ? error.message : String(error));
      
      toast.error(t('actions.deleteProfile.error'), {
        description: error instanceof Error ? error.message : 'Erro desconhecido ao processar requisição'
      });
      setDeletingProfile(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="text-center">
          <p className="text-gray-600">{tCommon('loading')}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{t('error')}</p>
          <Button onClick={() => window.location.reload()}>
            {t('reloadPage')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
              <User className="h-8 w-8" />
              {t('title')}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t('subtitle')}
            </p>
          </div>

          <div className="mb-6">
            <SubscriptionStatusCard />
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full max-w-3xl grid-cols-4 mb-6">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                {t('tabs.profile')}
              </TabsTrigger>
              <TabsTrigger value="medical">
                <Heart className="h-4 w-4 mr-2" />
                {t('tabs.medical')}
              </TabsTrigger>
              <TabsTrigger value="races">
                <Target className="h-4 w-4 mr-2" />
                {t('tabs.races')}
              </TabsTrigger>
              <TabsTrigger value="actions">
                <Settings className="h-4 w-4 mr-2" />
                {t('tabs.actions')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('profileTab.title')}</CardTitle>
                  <CardDescription>
                    {t('profileTab.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileTabs userData={profile} onUpdate={handleUpdateProfile} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medical" className="space-y-6">
              <MedicalInfoSection />
            </TabsContent>

            <TabsContent value="races" className="space-y-6">
              <RaceManagement races={races} onRacesUpdated={fetchRaces} />
            </TabsContent>

            <TabsContent value="actions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {t('actions.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('actions.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile?.hasCustomPlan && (
                    <Alert>
                      <RefreshCcw className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <p className="font-medium">{t('actions.regeneratePlan.title')}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('actions.regeneratePlan.description')}
                          </p>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" disabled={deletingPlan}>
                                {deletingPlan ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('actions.regeneratePlan.buttonLoading')}
                                  </>
                                ) : (
                                  <>
                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                    {t('actions.regeneratePlan.button')}
                                  </>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('actions.regeneratePlan.dialogTitle')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('actions.regeneratePlan.dialogDescription')}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeletePlan}>
                                  {t('actions.regeneratePlan.button')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-medium">{t('actions.deleteProfile.title')}</p>
                        <p className="text-sm">
                          {t('actions.deleteProfile.description')}
                        </p>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={deletingProfile}>
                              {deletingProfile ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  {t('actions.deleteProfile.buttonLoading')}
                                </>
                              ) : (
                                <>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t('actions.deleteProfile.button')}
                                </>
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('actions.deleteProfile.dialogTitle')}</AlertDialogTitle>
                              <AlertDialogDescription className="space-y-2">
                                <p>{t('actions.deleteProfile.dialogIntro')}</p>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>{t('actions.deleteProfile.dialogItems.deleteProfile')}</li>
                                  <li>{t('actions.deleteProfile.dialogItems.deletePlan')}</li>
                                  <li>{t('actions.deleteProfile.dialogItems.deleteHistory')}</li>
                                  <li>{t('actions.deleteProfile.dialogItems.redirect')}</li>
                                </ul>
                                <p className="font-bold text-red-600 mt-4">
                                  {t('actions.deleteProfile.dialogWarning')}
                                </p>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteProfile}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {t('actions.deleteProfile.confirmButton')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
