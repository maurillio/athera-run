'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
        toast.error('Erro ao carregar perfil. Recarregue a página.');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Erro ao carregar perfil. Verifique sua conexão.');
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
        toast.success('Perfil atualizado com sucesso!');
        
        // Se mudou disponibilidade e tem plano, oferecer ajuste
        if ((updateData.trainingActivities || updateData.longRunDay !== undefined) && profile?.hasCustomPlan) {
          toast.info('Deseja ajustar seu plano de treino?', {
            action: {
              label: 'Ajustar',
              onClick: () => handleAutoAdjust(updateData)
            }
          });
        }
      } else {
        toast.error('Erro ao atualizar perfil');
      }
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
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
        toast.success('Plano ajustado automaticamente!');
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
        toast.success('Plano deletado! Gerando novo plano...');

        const generateResponse = await fetch('/api/plan/generate', { method: 'POST' });

        if (generateResponse.ok) {
          toast.success('Novo plano gerado com sucesso!');
          setTimeout(() => {
            router.push('/dashboard');
            router.refresh();
          }, 1000);
        } else {
          toast.error('Erro ao gerar novo plano');
          setDeletingPlan(false);
        }
      } else {
        toast.error('Erro ao deletar plano');
        setDeletingPlan(false);
      }
    } catch (error) {
      toast.error('Erro ao regenerar plano');
      setDeletingPlan(false);
    }
  };

  const handleDeleteProfile = async () => {
    setDeletingProfile(true);
    try {
      const response = await fetch('/api/profile/delete', { method: 'DELETE' });
      const data = await response.json();

      if (response.ok) {
        toast.success('Perfil excluído! Redirecionando...');
        setTimeout(() => {
          router.push('/onboarding');
          router.refresh();
        }, 1500);
      } else {
        toast.error(data.error || 'Erro ao excluir perfil');
        setDeletingProfile(false);
      }
    } catch (error) {
      toast.error('Erro ao excluir perfil');
      setDeletingProfile(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Erro ao carregar perfil</p>
          <Button onClick={() => window.location.reload()}>
            Recarregar Página
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
              <User className="h-8 w-8" />
              Meu Perfil
            </h1>
            <p className="text-muted-foreground text-lg">
              Gerencie suas informações e objetivos de treinamento
            </p>
          </div>

          {/* Subscription Status */}
          <div className="mb-6">
            <SubscriptionStatusCard />
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full max-w-3xl grid-cols-4 mb-6">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="medical">
                <Heart className="h-4 w-4 mr-2" />
                Médico
              </TabsTrigger>
              <TabsTrigger value="races">
                <Target className="h-4 w-4 mr-2" />
                Corridas
              </TabsTrigger>
              <TabsTrigger value="actions">
                <Settings className="h-4 w-4 mr-2" />
                Ações
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab - v1.3.0 ProfileTabs */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Atleta</CardTitle>
                  <CardDescription>
                    Gerencie todos os aspectos do seu perfil de corredor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileTabs userData={profile} onUpdate={handleUpdateProfile} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Medical Tab */}
            <TabsContent value="medical" className="space-y-6">
              <MedicalInfoSection />
            </TabsContent>

            {/* Races Tab */}
            <TabsContent value="races" className="space-y-6">
              <RaceManagement races={races} onRacesUpdated={fetchRaces} />
            </TabsContent>

            {/* Actions Tab */}
            <TabsContent value="actions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Ações do Sistema
                  </CardTitle>
                  <CardDescription>
                    Operações avançadas para gerenciar seu plano e perfil
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Regenerate Plan */}
                  {profile?.hasCustomPlan && (
                    <Alert>
                      <RefreshCcw className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <p className="font-medium">Regenerar Plano de Treino</p>
                          <p className="text-sm text-muted-foreground">
                            Gera um novo plano baseado nas suas informações atuais. 
                            O histórico de treinos será preservado.
                          </p>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" disabled={deletingPlan}>
                                {deletingPlan ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Regenerando...
                                  </>
                                ) : (
                                  <>
                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                    Regenerar Plano
                                  </>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Regenerar Plano de Treino?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação irá deletar seu plano atual e gerar um novo baseado 
                                  nas suas informações atualizadas. Treinos passados serão preservados.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeletePlan}>
                                  Regenerar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Delete Profile */}
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-medium">Excluir Perfil de Atleta</p>
                        <p className="text-sm">
                          Remove permanentemente todas as suas informações de atleta e plano de treino.
                          Esta ação NÃO pode ser desfeita!
                        </p>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={deletingProfile}>
                              {deletingProfile ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Excluindo...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir Perfil
                                </>
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                              <AlertDialogDescription className="space-y-2">
                                <p>Esta ação irá:</p>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>Deletar seu perfil de atleta</li>
                                  <li>Deletar seu plano de treino</li>
                                  <li>Deletar todo o histórico de treinos</li>
                                  <li>Redirecioná-lo para o onboarding</li>
                                </ul>
                                <p className="font-bold text-red-600 mt-4">
                                  Esta ação NÃO pode ser desfeita!
                                </p>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteProfile}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Sim, excluir tudo
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
