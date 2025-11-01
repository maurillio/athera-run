
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
import SubscriptionStatusCard from '@/components/subscription/subscription-status-card';
import PremiumBadge from '@/components/subscription/premium-badge';

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

  // Estados para edição de disponibilidade
  const [editingAvailability, setEditingAvailability] = useState(false);
  const [editTrainingActivities, setEditTrainingActivities] = useState<any[]>([]);
  const [editLongRunDay, setEditLongRunDay] = useState<number | null>(null);

  const DAYS_OF_WEEK = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Seg' },
    { value: 2, label: 'Ter' },
    { value: 3, label: 'Qua' },
    { value: 4, label: 'Qui' },
    { value: 5, label: 'Sex' },
    { value: 6, label: 'Sáb' },
  ];

  const AVAILABLE_ACTIVITIES = [
    { id: 'running', name: 'Corrida', icon: '🏃', color: 'orange' },
    { id: 'strength', name: 'Musculação', icon: '🏋️', color: 'blue' },
    { id: 'swimming', name: 'Natação', icon: '🏊', color: 'cyan' },
    { id: 'cycling', name: 'Ciclismo', icon: '🚴', color: 'green' },
    { id: 'yoga', name: 'Yoga', icon: '🧘', color: 'purple' },
    { id: 'pilates', name: 'Pilates', icon: '🤸', color: 'pink' },
    { id: 'muay-thai', name: 'Muay-Thai', icon: '🥊', color: 'red' },
    { id: 'functional', name: 'Funcional', icon: '⚡', color: 'yellow' },
    { id: 'crossfit', name: 'CrossFit', icon: '💪', color: 'indigo' },
  ];

  const getActivityIcon = (activityId: string) => {
    const activity = AVAILABLE_ACTIVITIES.find(a =>
      a.id === activityId ||
      a.name.toLowerCase() === activityId?.toLowerCase() ||
      activityId?.toLowerCase().includes(a.id)
    );
    return activity?.icon || '🏃';
  };

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
      // Usar regenerate ao invés de delete (mantém histórico)
      const regenerateResponse = await fetch('/api/plan/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'manual_regeneration',
          description: 'Regeneração manual do plano pelo usuário'
        })
      });

      const regenerateData = await regenerateResponse.json();

      if (regenerateResponse.ok) {
        toast.success('Plano deletado! Gerando novo plano automaticamente...', {
          icon: <RefreshCcw className="h-5 w-5 text-blue-500" />
        });

        // Gerar novo plano automaticamente
        const generateResponse = await fetch('/api/plan/generate', {
          method: 'POST'
        });

        if (generateResponse.ok) {
          toast.success('Novo plano gerado com sucesso!', {
            icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
          });

          setTimeout(() => {
            router.push('/dashboard');
            router.refresh();
          }, 1000);
        } else {
          const generateData = await generateResponse.json();
          toast.error(generateData.error || 'Erro ao gerar novo plano');
          setDeletingPlan(false);
        }
      } else {
        toast.error(regenerateData.error || 'Erro ao deletar plano');
        setDeletingPlan(false);
      }
    } catch (error) {
      console.error('Error regenerating plan:', error);
      toast.error('Erro ao regenerar plano');
      setDeletingPlan(false);
    }
  };

  // Funções de edição de disponibilidade
  const startEditingAvailability = () => {
    setEditTrainingActivities(profile?.trainingActivities || []);
    setEditLongRunDay(profile?.longRunDay !== undefined ? profile.longRunDay : null);
    setEditingAvailability(true);
  };

  const handleSaveAvailability = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainingActivities: editTrainingActivities,
          longRunDay: editLongRunDay
        })
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setEditingAvailability(false);
        toast.success('Disponibilidade atualizada!');

        // Ajustar plano automaticamente se houver um plano ativo
        if (profile?.hasCustomPlan) {
          toast.loading('Ajustando plano automaticamente...', { id: 'adjusting' });
          try {
            const adjustResponse = await fetch('/api/plan/auto-adjust', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                reason: 'Atualização de disponibilidade',
                changes: {
                  trainingActivities: editTrainingActivities,
                  longRunDay: editLongRunDay
                }
              })
            });

            if (adjustResponse.ok) {
              toast.success('Plano ajustado automaticamente!', { id: 'adjusting' });
            } else {
              toast.dismiss('adjusting');
              toast.info('Disponibilidade salva. Considere regenerar o plano para aplicar as mudanças.');
            }
          } catch {
            toast.dismiss('adjusting');
          }
        }
      } else {
        toast.error('Erro ao atualizar disponibilidade');
      }
    } catch (error) {
      toast.error('Erro ao atualizar disponibilidade');
    } finally {
      setSaving(false);
    }
  };

  const removeActivity = (activityId: string) => {
    setEditTrainingActivities(prev => prev.filter(a => a.id !== activityId));
  };

  const addNewActivity = (activity: typeof AVAILABLE_ACTIVITIES[0]) => {
    const newActivity = {
      id: activity.id,
      name: activity.name,
      icon: activity.icon,
      color: activity.color,
      availableDays: [],
      preferredTime: 'flexible'
    };
    setEditTrainingActivities(prev => [...prev, newActivity]);
  };

  const toggleActivityDay = (activityId: string, dayValue: number) => {
    setEditTrainingActivities(prev =>
      prev.map(activity => {
        if (activity.id === activityId) {
          const hasDay = activity.availableDays.includes(dayValue);
          const newDays = hasDay
            ? activity.availableDays.filter((d: number) => d !== dayValue)
            : [...activity.availableDays, dayValue].sort((a, b) => a - b);
          return { ...activity, availableDays: newDays };
        }
        return activity;
      })
    );
  };

  const updateActivityTime = (activityId: string, time: string) => {
    setEditTrainingActivities(prev =>
      prev.map(activity =>
        activity.id === activityId ? { ...activity, preferredTime: time } : activity
      )
    );
  };

  const handleSetEditLongRunDay = (dayValue: number) => {
    setEditLongRunDay(dayValue);
    // Automaticamente adicionar aos dias de corrida
    setEditTrainingActivities(prev =>
      prev.map(activity => {
        if (activity.id === 'running') {
          const updatedDays = activity.availableDays.includes(dayValue)
            ? activity.availableDays
            : [...activity.availableDays, dayValue].sort((a, b) => a - b);
          return { ...activity, availableDays: updatedDays };
        }
        return activity;
      })
    );
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
                {/* Subscription Status Card */}
                <SubscriptionStatusCard />

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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                    {getActivityIcon(activity.id || activity.name)}
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

                      {/* Dia do Treino Longo */}
                      {profile.longRunDay !== null && profile.longRunDay !== undefined && (
                        <Card className="border-2 border-orange-200 bg-orange-50">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center">
                                <span className="text-white text-lg">🏃‍♂️</span>
                              </div>
                              <div>
                                <h4 className="font-semibold">Dia do Treino Longo</h4>
                                <p className="text-sm text-muted-foreground">
                                  {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][profile.longRunDay]}
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">
                              Este é o dia mais importante da semana, onde você fará seus treinos longos de resistência.
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma disponibilidade cadastrada</p>
                      <p className="text-sm mt-2">Complete o onboarding para adicionar sua disponibilidade de treino</p>
                    </div>
                  )}

                  <Dialog open={editingAvailability} onOpenChange={setEditingAvailability}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full" onClick={startEditingAvailability}>
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Editar Disponibilidade
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Editar Disponibilidade de Treino</DialogTitle>
                        <DialogDescription>
                          Atualize seus dias e horários disponíveis para treinar. Após salvar, considere regenerar seu plano para aplicar as mudanças.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6 py-4">
                        {/* Dia do Treino Longo */}
                        <div className="space-y-3">
                          <Label className="text-base font-semibold">Dia do Treino Longo</Label>
                          <p className="text-sm text-muted-foreground">
                            Escolha o dia mais importante da semana para o longão
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {DAYS_OF_WEEK.map((day) => (
                              <button
                                key={day.value}
                                type="button"
                                onClick={() => handleSetEditLongRunDay(day.value)}
                                className={`
                                  px-4 py-2 rounded-md text-sm font-medium transition-all
                                  ${editLongRunDay === day.value
                                    ? 'bg-orange-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }
                                `}
                              >
                                {day.label}
                              </button>
                            ))}
                          </div>
                          {editLongRunDay !== null && (
                            <p className="text-xs text-orange-600">
                              ✓ {DAYS_OF_WEEK.find(d => d.value === editLongRunDay)?.label} será automaticamente adicionado aos dias de corrida
                            </p>
                          )}
                        </div>

                        {/* Atividades */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Atividades de Treino</Label>
                          </div>
                          {editTrainingActivities.map((activity) => (
                            <Card key={activity.id} className="border-2">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold flex items-center gap-2">
                                    <span className="text-lg">
                                      {getActivityIcon(activity.id)}
                                    </span>
                                    {activity.name}
                                  </h4>
                                  {activity.id !== 'running' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeActivity(activity.id)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {/* Horário Preferido */}
                                <div className="space-y-2">
                                  <Label className="text-sm">Horário Preferido</Label>
                                  <Select
                                    value={activity.preferredTime}
                                    onValueChange={(value) => updateActivityTime(activity.id, value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="flexible">Horário Flexível</SelectItem>
                                      <SelectItem value="early_morning">Manhã Cedo (5-7h)</SelectItem>
                                      <SelectItem value="morning">Manhã (7-10h)</SelectItem>
                                      <SelectItem value="afternoon">Tarde (12-15h)</SelectItem>
                                      <SelectItem value="evening">Noite (17-20h)</SelectItem>
                                      <SelectItem value="night">Noite Tarde (20-22h)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Dias Disponíveis */}
                                <div className="space-y-2">
                                  <Label className="text-sm">Dias Disponíveis</Label>
                                  <div className="flex flex-wrap gap-2">
                                    {DAYS_OF_WEEK.map((day) => {
                                      const isSelected = activity.availableDays.includes(day.value);
                                      return (
                                        <button
                                          key={day.value}
                                          type="button"
                                          onClick={() => toggleActivityDay(activity.id, day.value)}
                                          className={`
                                            px-3 py-2 rounded-md text-sm font-medium transition-all
                                            ${isSelected
                                              ? 'bg-blue-600 text-white'
                                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }
                                          `}
                                        >
                                          {day.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}

                          {/* Adicionar Nova Atividade */}
                          <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
                            <CardContent className="pt-6">
                              <Label className="text-sm font-medium mb-3 block">Adicionar Nova Atividade</Label>
                              <div className="flex flex-wrap gap-2">
                                {AVAILABLE_ACTIVITIES.filter(a => !editTrainingActivities.some(e => e.id === a.id)).map((activity) => (
                                  <button
                                    key={activity.id}
                                    type="button"
                                    onClick={() => addNewActivity(activity)}
                                    className="px-3 py-2 rounded-md text-sm font-medium bg-white border-2 border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center gap-2"
                                  >
                                    <span>{activity.icon}</span>
                                    <span>{activity.name}</span>
                                    <Plus className="h-3 w-3" />
                                  </button>
                                ))}
                              </div>
                              {editTrainingActivities.length >= AVAILABLE_ACTIVITIES.length && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Todas as atividades disponíveis já foram adicionadas
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        {/* Aviso sobre ajuste automático */}
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {profile?.hasCustomPlan
                              ? 'Seu plano será ajustado automaticamente após salvar as alterações.'
                              : 'Após salvar, você poderá gerar um plano de treino personalizado.'
                            }
                          </AlertDescription>
                        </Alert>
                      </div>

                      <DialogFooter className="gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setEditingAvailability(false)}
                          disabled={saving}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleSaveAvailability}
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Salvando...
                            </>
                          ) : (
                            'Salvar Alterações'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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
