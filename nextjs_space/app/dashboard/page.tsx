
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Header from '@/components/header';
import TrainingChat from '@/components/training-chat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
} from 'lucide-react';
import Link from 'next/link';
import TrainingLogDialog from '@/components/training-log-dialog';
import AIAnalysisSection from '@/components/ai-analysis-section';
import AutoAdjustCard from '@/components/auto-adjust-card';

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
      router.replace('/login');
    }
  }, [status, router]);

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
        
        // Verificar se tem plano customizado
        if (data.hasCustomPlan === false) {
          setHasCustomPlan(false);
          return;
        }
        
        setPlan(data.plan);
        setCurrentWeek(data.currentWeek);
        setHasCustomPlan(true);

        // Encontrar próximo treino não completado
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
            // Se não há próximo treino, pegar o primeiro da semana
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
        
        // Log detalhado do erro
        console.error('[DASHBOARD] Error generating plan:', errorData);
        
        // Se o erro indica que o perfil não existe, redirecionar para onboarding
        if (errorData.redirectTo === '/onboarding') {
          alert(errorData.message || 'Por favor, complete seu perfil antes de gerar o plano.');
          router.push('/onboarding');
        } else {
          // Mostrar erro mais detalhado
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
    const labels: { [key: string]: string } = {
      '10k': '10km',
      'half_marathon': 'Meia-Maratona',
      'marathon': 'Maratona',
    };
    return labels[distance] || distance;
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Olá, {session.user?.name || 'Corredor'}! 👋
            </h1>
            <p className="text-muted-foreground text-lg">
              {hasCustomPlan 
                ? 'Bem-vindo ao seu painel de treinamento personalizado' 
                : 'Vamos criar seu plano de treinamento personalizado'}
            </p>
          </div>

          {!hasCustomPlan && (
            <Card className="mb-8 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Gere seu Plano Personalizado
                </CardTitle>
                <CardDescription>
                  Baseado no seu perfil, vamos criar um plano de treinamento totalmente adaptado aos seus objetivos
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
                      Gerando Plano...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Gerar Meu Plano Agora
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {hasCustomPlan && plan && currentWeek && (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Próximo Treino</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {nextWorkout ? (
                      <>
                        <div className="text-2xl font-bold">
                          {new Date(nextWorkout.date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {nextWorkout.title}
                        </p>
                      </>
                    ) : (
                      <div className="text-sm">Nenhum treino pendente</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Semana Atual</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {currentWeek.weekNumber}/{plan.totalWeeks}
                    </div>
                    <p className="text-xs text-muted-foreground">{currentWeek.phase}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Objetivo</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getDistanceLabel(plan.goalDistance)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(plan.targetRaceDate).toLocaleDateString('pt-BR')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Progresso</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(plan.completionRate)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {currentWeek.completedWorkouts}/{currentWeek.totalWorkouts} treinos
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Treinos de Hoje e Amanhã */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Seus Próximos Treinos</CardTitle>
                  <CardDescription>Treino de hoje e de amanhã</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(() => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const tomorrow = new Date(today);
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      const dayAfterTomorrow = new Date(today);
                      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
                      
                      const todayAndTomorrow = currentWeek.workouts.filter((w: Workout) => {
                        const workoutDate = new Date(w.date);
                        workoutDate.setHours(0, 0, 0, 0);
                        return workoutDate >= today && workoutDate < dayAfterTomorrow;
                      }).sort((a: Workout, b: Workout) => 
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                      );

                      if (todayAndTomorrow.length === 0) {
                        return (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>Nenhum treino programado para hoje ou amanhã.</p>
                            <p className="text-sm mt-2">
                              <Link href="/plano" className="text-orange-600 hover:underline">
                                Ver plano completo
                              </Link>
                            </p>
                          </div>
                        );
                      }

                      return todayAndTomorrow.map((workout: Workout) => {
                        const workoutDate = new Date(workout.date);
                        workoutDate.setHours(0, 0, 0, 0);
                        const isToday = workoutDate.getTime() === today.getTime();

                        // Só mostrar botão de confirmação para treinos de hoje e não-rest
                        const canConfirm = isToday && workout.type !== 'rest';

                        return (
                          <div
                            key={workout.id}
                            className={`flex flex-col p-4 rounded-lg border ${
                              workout.isCompleted
                                ? 'bg-green-50 border-green-200'
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant={isToday ? "default" : "secondary"}>
                                    {isToday ? 'Hoje' : 'Amanhã'}
                                  </Badge>
                                  {workout.isCompleted && (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  )}
                                </div>
                                <h4 className="font-medium text-lg">{workout.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(workout.date).toLocaleDateString('pt-BR', {
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
                                  <span className="font-medium">📍 Distância:</span>
                                  <span>{workout.distance} km</span>
                                </div>
                              )}
                              {workout.duration && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">⏱️ Duração:</span>
                                  <span>{workout.duration} min</span>
                                </div>
                              )}
                              {workout.targetPace && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">🎯 Pace:</span>
                                  <span>{workout.targetPace}</span>
                                </div>
                              )}
                            </div>

                            {!workout.isCompleted && canConfirm && (
                              <Button
                                onClick={() => handleOpenWorkoutLog(workout)}
                                className="mt-2 bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700"
                              >
                                Confirmar Treino Concluído
                              </Button>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Link href="/plano">
                      <Button variant="outline" className="w-full">
                        <Calendar className="mr-2 h-4 w-4" />
                        Ver Plano Completo da Semana
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Ajuste Inteligente de Plano */}
              <AutoAdjustCard />
            </>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Acesso Rápido</CardTitle>
                      <CardDescription>Navegue pelas principais funcionalidades</CardDescription>
                    </div>
                    <TrainingLogDialog onSuccess={() => window.location.reload()} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                {hasCustomPlan && (
                  <Link href="/plano">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      Ver Plano Completo
                    </Button>
                  </Link>
                )}
                <Link href="/tracking">
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="mr-2 h-4 w-4" />
                    Registrar Treino
                  </Button>
                </Link>
                {/* Calculadora VDOT - Desabilitada */}
                {/* <Link href="/calculator">
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="mr-2 h-4 w-4" />
                    Calculadora VDOT
                  </Button>
                </Link> */}
                <Link href="/training">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Análises com IA
                  </Button>
                </Link>
              </CardContent>
              </Card>
            </div>

            <AIAnalysisSection />
          </div>

          {/* Recursos da Plataforma */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recursos Avançados</CardTitle>
              <CardDescription>Aproveite ao máximo seu treinamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Plano 100% Personalizado</p>
                    <p className="text-sm text-muted-foreground">
                      {hasCustomPlan 
                        ? 'Seu plano foi gerado baseado no seu perfil único' 
                        : 'Será gerado baseado no seu perfil único'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Análises com IA</p>
                    <p className="text-sm text-muted-foreground">Insights profundos sobre seu progresso</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Integração Strava</p>
                    <p className="text-sm text-muted-foreground">Sincronização automática de treinos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
      
      {/* Chat com IA flutuante */}
      <TrainingChat />
      
      {/* Modal de Confirmação de Treino */}
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

// Componente do Dialog de Log de Treino
interface WorkoutLogDialogProps {
  workout: Workout | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function WorkoutLogDialog({ workout, open, onClose, onSuccess }: WorkoutLogDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [feeling, setFeeling] = useState<string>('good');
  const [perceivedEffort, setPerceivedEffort] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [completed, setCompleted] = useState(true);

  const handleSubmit = async () => {
    if (!workout) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/workouts/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutId: workout.id,
          completed,
          feeling,
          perceivedEffort,
          notes,
        }),
      });

      if (response.ok) {
        toast.success(completed ? '✅ Treino confirmado com sucesso!' : '📝 Relato salvo com sucesso!');
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erro ao salvar relato do treino.');
      }
    } catch (error) {
      console.error('Error submitting workout log:', error);
      toast.error('Erro ao salvar relato do treino.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!workout) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirmar Treino Concluído</DialogTitle>
          <DialogDescription>
            Registre como foi seu treino e compartilhe suas percepções
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do treino */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">{workout.title}</h4>
            <p className="text-sm text-gray-600">{workout.description}</p>
            <div className="flex gap-4 mt-2 text-sm">
              {workout.distance && <span>📍 {workout.distance} km</span>}
              {workout.duration && <span>⏱️ {workout.duration} min</span>}
              {workout.targetPace && <span>🎯 {workout.targetPace}</span>}
            </div>
          </div>

          {/* Conseguiu completar? */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Você conseguiu completar este treino?
            </Label>
            <RadioGroup value={completed ? 'yes' : 'no'} onValueChange={(val) => setCompleted(val === 'yes')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="completed-yes" />
                <Label htmlFor="completed-yes" className="cursor-pointer">Sim, completei o treino</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="completed-no" />
                <Label htmlFor="completed-no" className="cursor-pointer">Não, não consegui fazer</Label>
              </div>
            </RadioGroup>
          </div>

          {completed && (
            <>
              {/* Como se sentiu */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Como você se sentiu durante o treino?
                </Label>
                <RadioGroup value={feeling} onValueChange={setFeeling}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excellent" id="feeling-excellent" />
                    <Label htmlFor="feeling-excellent" className="cursor-pointer">😄 Excelente - Me senti ótimo!</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="good" id="feeling-good" />
                    <Label htmlFor="feeling-good" className="cursor-pointer">😊 Bom - Foi um treino positivo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ok" id="feeling-ok" />
                    <Label htmlFor="feeling-ok" className="cursor-pointer">😐 Ok - Normal, sem destaque</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tired" id="feeling-tired" />
                    <Label htmlFor="feeling-tired" className="cursor-pointer">😓 Cansado - Foi difícil</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bad" id="feeling-bad" />
                    <Label htmlFor="feeling-bad" className="cursor-pointer">😣 Ruim - Muito desafiador</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Esforço percebido */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Nível de esforço percebido (1-10)
                </Label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={perceivedEffort}
                    onChange={(e) => setPerceivedEffort(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>1 - Muito fácil</span>
                    <span className="font-semibold text-lg text-orange-600">{perceivedEffort}</span>
                    <span>10 - Máximo esforço</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Observações */}
          <div>
            <Label htmlFor="notes" className="text-base font-semibold mb-3 block">
              Observações e comentários (opcional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Como foi o treino? Alguma dificuldade? Sentiu alguma dor? Compartilhe seus pensamentos..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-sm text-gray-500 mt-2">
              Suas observações ajudam a IA a personalizar melhor seu plano de treinamento.
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Relato'
              )}
            </Button>
            <Button onClick={onClose} variant="outline" disabled={submitting}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
