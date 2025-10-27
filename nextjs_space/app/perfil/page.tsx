
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, Target, Plus, Calendar, MapPin, Trash2, Star, CheckCircle2, Sparkles, Heart, RefreshCcw, AlertTriangle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import MedicalInfoSection from '@/components/medical-info-section';
import RaceManagement from '@/components/race-management';
import PeriodizationDashboard from '@/components/periodization-dashboard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface RaceGoal {
  id: number;
  raceName: string;
  distance: string;
  raceDate: string;
  targetTime: string | null;
  location: string | null;
  status: string;
  isPrimary: boolean;
}

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [raceGoals, setRaceGoals] = useState<RaceGoal[]>([]);
  const [showAddRace, setShowAddRace] = useState(false);
  const [newRace, setNewRace] = useState({
    raceName: '',
    distance: '10k',
    raceDate: '',
    targetTime: '',
    location: '',
    isPrimary: false
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
      fetchRaceGoals();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile/create', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        
        // Se não tem perfil, redirecionar para onboarding
        if (data.hasProfile === false && !data.profile) {
          router.push('/onboarding');
          return;
        }
        
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRaceGoals = async () => {
    try {
      const response = await fetch('/api/race-goals');
      if (response.ok) {
        const data = await response.json();
        setRaceGoals(data.raceGoals);
      }
    } catch (error) {
      console.error('Error fetching race goals:', error);
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        toast.success('Perfil atualizado com sucesso!');
      } else {
        toast.error('Erro ao atualizar perfil');
      }
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyzeExperience = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/profile/analyze-experience', { method: 'POST' });
      
      if (response.ok) {
        const data = await response.json();
        setProfile((prev: any) => ({ ...prev, experienceAnalysis: data.analysis }));
        toast.success('Experiência analisada com sucesso!', {
          icon: <Sparkles className="h-5 w-5 text-yellow-500" />
        });
      } else {
        toast.error('Erro ao analisar experiência');
      }
    } catch (error) {
      toast.error('Erro ao analisar experiência');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddRace = async () => {
    try {
      const response = await fetch('/api/race-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRace)
      });

      if (response.ok) {
        toast.success('Corrida adicionada com sucesso!');
        setShowAddRace(false);
        setNewRace({
          raceName: '',
          distance: '10k',
          raceDate: '',
          targetTime: '',
          location: '',
          isPrimary: false
        });
        fetchRaceGoals();
      } else {
        toast.error('Erro ao adicionar corrida');
      }
    } catch (error) {
      toast.error('Erro ao adicionar corrida');
    }
  };

  const handleDeleteRace = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta corrida?')) return;

    try {
      const response = await fetch(`/api/race-goals/${id}`, { method: 'DELETE' });
      
      if (response.ok) {
        toast.success('Corrida excluída!');
        fetchRaceGoals();
      } else {
        toast.error('Erro ao excluir corrida');
      }
    } catch (error) {
      toast.error('Erro ao excluir corrida');
    }
  };

  const handleSetPrimary = async (id: number) => {
    try {
      const response = await fetch(`/api/race-goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrimary: true })
      });

      if (response.ok) {
        toast.success('Corrida principal atualizada!');
        fetchRaceGoals();
      } else {
        toast.error('Erro ao atualizar corrida');
      }
    } catch (error) {
      toast.error('Erro ao atualizar corrida');
    }
  };

  const handleDeletePlan = async () => {
    setDeletingPlan(true);
    try {
      const response = await fetch('/api/plan/delete', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Plano deletado com sucesso! Redirecionando para criar um novo plano...', {
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
        });
        
        // Aguardar um pouco antes de redirecionar
        setTimeout(() => {
          router.push('/onboarding');
        }, 1500);
      } else {
        toast.error(data.error || 'Erro ao deletar plano');
        setDeletingPlan(false);
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Erro ao deletar plano');
      setDeletingPlan(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!session || !profile) return null;

  const getDistanceLabel = (distance: string) => {
    const labels: Record<string, string> = {
      '5k': '5km',
      '10k': '10km',
      'half_marathon': 'Meia-Maratona',
      'marathon': 'Maratona',
      'conditioning': 'Condicionamento'
    };
    return labels[distance] || distance;
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
              <User className="h-8 w-8" />
              Meu Perfil
            </h1>
            <p className="text-muted-foreground text-lg">
              Gerencie suas informações e objetivos
            </p>
          </div>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="personal">
                <User className="h-4 w-4 mr-2" />
                Pessoal
              </TabsTrigger>
              <TabsTrigger value="availability">
                <Calendar className="h-4 w-4 mr-2" />
                Disponibilidade
              </TabsTrigger>
              <TabsTrigger value="medical">
                <Heart className="h-4 w-4 mr-2" />
                Médico
              </TabsTrigger>
              <TabsTrigger value="races">
                <Target className="h-4 w-4 mr-2" />
                Corridas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <div className="space-y-6">
                {/* Gerenciar Plano de Treinamento */}
                {profile.hasCustomPlan && (
                  <Card className="border-orange-200 bg-orange-50/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <RefreshCcw className="h-5 w-5 text-orange-600" />
                        Gerenciar Plano de Treinamento
                      </CardTitle>
                      <CardDescription>
                        Delete seu plano atual e crie um novo do zero
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium mb-1">Atenção!</p>
                          <p>Ao deletar o plano atual, todos os seus treinos registrados, análises e progresso serão perdidos permanentemente. Esta ação não pode ser desfeita.</p>
                        </div>
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            className="w-full"
                            disabled={deletingPlan}
                          >
                            {deletingPlan ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deletando plano...
                              </>
                            ) : (
                              <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Deletar e Recriar Plano
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação irá deletar permanentemente seu plano de treinamento atual, incluindo:
                              <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Todas as {profile.totalWeeks || 20} semanas de treino</li>
                                <li>Histórico de treinos registrados</li>
                                <li>Análises de desempenho da IA</li>
                                <li>Progresso e estatísticas</li>
                              </ul>
                              <p className="mt-3 font-semibold">
                                Após a exclusão, você será redirecionado para criar um novo plano do zero.
                              </p>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={deletingPlan}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeletePlan}
                              disabled={deletingPlan}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {deletingPlan ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Deletando...
                                </>
                              ) : (
                                'Sim, deletar plano'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardContent>
                  </Card>
                )}

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Dados Pessoais */}
                  <Card>
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
                <CardDescription>Informações físicas e de experiência</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={profile.weight || ''}
                      onChange={(e) => setProfile((prev: any) => ({ ...prev, weight: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={profile.height || ''}
                      onChange={(e) => setProfile((prev: any) => ({ ...prev, height: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="runningLevel">Nível de Experiência</Label>
                  <Select
                    value={profile.runningLevel || 'beginner'}
                    onValueChange={(value) => setProfile((prev: any) => ({ ...prev, runningLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Iniciante</SelectItem>
                      <SelectItem value="intermediate">Intermediário</SelectItem>
                      <SelectItem value="advanced">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentWeeklyKm">Volume Semanal Atual (km)</Label>
                  <Input
                    id="currentWeeklyKm"
                    type="number"
                    step="0.1"
                    value={profile.currentWeeklyKm || ''}
                    onChange={(e) => setProfile((prev: any) => ({ ...prev, currentWeeklyKm: e.target.value }))}
                  />
                </div>

                <Button onClick={handleUpdateProfile} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>

            {/* Experiências */}
            <Card>
              <CardHeader>
                <CardTitle>Suas Experiências</CardTitle>
                <CardDescription>
                  Conte sobre seu histórico com corrida
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Descreva suas experiências</Label>
                  <Textarea
                    id="experience"
                    rows={6}
                    placeholder="Ex: Comecei a correr há 2 anos, já completei 3 provas de 10km, melhor tempo foi 50min. Tive uma lesão no joelho ano passado mas já recuperei..."
                    value={profile.experienceDescription || ''}
                    onChange={(e) => setProfile((prev: any) => ({ ...prev, experienceDescription: e.target.value }))}
                  />
                </div>

                <Button 
                  onClick={handleAnalyzeExperience}
                  disabled={analyzing || !profile.experienceDescription}
                  variant="outline"
                  className="w-full"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analisar com IA
                    </>
                  )}
                </Button>

                {profile.experienceAnalysis && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-600" />
                      Análise da IA
                    </p>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {profile.experienceAnalysis}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="availability">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Disponibilidade de Treino
                  </CardTitle>
                  <CardDescription>
                    Visualize e edite sua disponibilidade por modalidade de treino
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {profile.trainingActivities && Array.isArray(profile.trainingActivities) && profile.trainingActivities.length > 0 ? (
                    <div className="space-y-4">
                      {profile.trainingActivities.map((activity: any, index: number) => (
                        <Card key={index} className="border-2">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-10 h-10 rounded-lg bg-${activity.color || 'blue'}-600 flex items-center justify-center`}>
                                  <span className="text-white text-lg">
                                    {activity.icon === 'Dumbbell' && '🏋️'}
                                    {activity.icon === 'Waves' && '🏊'}
                                    {activity.icon === 'Bike' && '🚴'}
                                    {activity.icon === 'Heart' && '❤️'}
                                    {activity.icon === 'Zap' && '⚡'}
                                    {activity.icon === 'Activity' && '🏃'}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-semibold">{activity.name || 'Atividade'}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {activity.preferredTime === 'early_morning' && 'Manhã Cedo (5-7h)'}
                                    {activity.preferredTime === 'morning' && 'Manhã (7-10h)'}
                                    {activity.preferredTime === 'afternoon' && 'Tarde (12-15h)'}
                                    {activity.preferredTime === 'evening' && 'Noite (17-20h)'}
                                    {activity.preferredTime === 'night' && 'Noite Tarde (20-22h)'}
                                    {activity.preferredTime === 'flexible' && 'Horário Flexível'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Dias Disponíveis</Label>
                              <div className="flex flex-wrap gap-2">
                                {activity.availableDays && activity.availableDays.length > 0 ? (
                                  <>
                                    {activity.availableDays.includes(0) && <Badge variant="outline">Dom</Badge>}
                                    {activity.availableDays.includes(1) && <Badge variant="outline">Seg</Badge>}
                                    {activity.availableDays.includes(2) && <Badge variant="outline">Ter</Badge>}
                                    {activity.availableDays.includes(3) && <Badge variant="outline">Qua</Badge>}
                                    {activity.availableDays.includes(4) && <Badge variant="outline">Qui</Badge>}
                                    {activity.availableDays.includes(5) && <Badge variant="outline">Sex</Badge>}
                                    {activity.availableDays.includes(6) && <Badge variant="outline">Sáb</Badge>}
                                  </>
                                ) : (
                                  <span className="text-sm text-muted-foreground">Nenhum dia selecionado</span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma disponibilidade cadastrada</p>
                      <p className="text-sm mt-2">Complete o onboarding para adicionar sua disponibilidade de treino</p>
                    </div>
                  )}
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Para editar sua disponibilidade de treino, você precisará deletar e recriar seu plano através da aba "Pessoal"
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medical">
              <MedicalInfoSection />
            </TabsContent>

            <TabsContent value="races">
              <RaceManagement 
                races={raceGoals as any} 
                onRacesUpdated={fetchRaceGoals} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
