
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CalendarDays, Clock, Dumbbell, Waves, Activity, ChevronLeft, ChevronRight, Plus, X, Bike, Heart, Zap } from 'lucide-react';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Segunda', short: 'Seg' },
  { value: 2, label: 'Terça', short: 'Ter' },
  { value: 3, label: 'Quarta', short: 'Qua' },
  { value: 4, label: 'Quinta', short: 'Qui' },
  { value: 5, label: 'Sexta', short: 'Sex' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
];

const TIME_SLOTS = [
  { value: 'early_morning', label: 'Manhã Cedo (5-7h)' },
  { value: 'morning', label: 'Manhã (7-10h)' },
  { value: 'afternoon', label: 'Tarde (12-15h)' },
  { value: 'evening', label: 'Noite (17-20h)' },
  { value: 'night', label: 'Noite Tarde (20-22h)' },
  { value: 'flexible', label: 'Flexível' },
];

const ICON_OPTIONS = [
  { value: 'Activity', label: '🏃 Atividade', icon: Activity },
  { value: 'Dumbbell', label: '🏋️ Força', icon: Dumbbell },
  { value: 'Waves', label: '🏊 Água', icon: Waves },
  { value: 'Bike', label: '🚴 Ciclismo', icon: Bike },
  { value: 'Heart', label: '❤️ Cardio', icon: Heart },
  { value: 'Zap', label: '⚡ Energia', icon: Zap },
];

const COLOR_OPTIONS = [
  { value: 'orange', label: 'Laranja', class: 'bg-orange-600' },
  { value: 'blue', label: 'Azul', class: 'bg-blue-600' },
  { value: 'green', label: 'Verde', class: 'bg-green-600' },
  { value: 'purple', label: 'Roxo', class: 'bg-purple-600' },
  { value: 'cyan', label: 'Ciano', class: 'bg-cyan-600' },
  { value: 'red', label: 'Vermelho', class: 'bg-red-600' },
  { value: 'yellow', label: 'Amarelo', class: 'bg-yellow-600' },
  { value: 'pink', label: 'Rosa', class: 'bg-pink-600' },
];

// Atividades sugeridas para começar
const SUGGESTED_ACTIVITIES = [
  { id: 'running', name: 'Corrida', icon: 'Activity', color: 'orange' },
  { id: 'strength', name: 'Musculação', icon: 'Dumbbell', color: 'blue' },
  { id: 'swimming', name: 'Natação', icon: 'Waves', color: 'cyan' },
  { id: 'cycling', name: 'Ciclismo', icon: 'Bike', color: 'green' },
  { id: 'yoga', name: 'Yoga', icon: 'Heart', color: 'purple' },
  { id: 'pilates', name: 'Pilates', icon: 'Activity', color: 'purple' },
  { id: 'crossfit', name: 'CrossFit', icon: 'Zap', color: 'red' },
];

interface TrainingActivity {
  id: string;
  name: string;
  availableDays: number[];
  preferredTime: string;
  icon: string;
  color: string;
}

// Faixas de pace habitual por distância (em min/km)
const PACE_OPTIONS = {
  '5k': [
    { value: 'never', label: 'Nunca corri essa distância' },
    { value: '3:00-3:30', label: '3:00 - 3:30 min/km (elite)' },
    { value: '3:30-4:00', label: '3:30 - 4:00 min/km (avançado)' },
    { value: '4:00-4:30', label: '4:00 - 4:30 min/km (muito bom)' },
    { value: '4:30-5:00', label: '4:30 - 5:00 min/km (bom)' },
    { value: '5:00-5:30', label: '5:00 - 5:30 min/km (intermediário)' },
    { value: '5:30-6:00', label: '5:30 - 6:00 min/km' },
    { value: '6:00-6:30', label: '6:00 - 6:30 min/km' },
    { value: '6:30-7:00', label: '6:30 - 7:00 min/km (iniciante)' },
    { value: '7:00+', label: 'Acima de 7:00 min/km' },
  ],
  '10k': [
    { value: 'never', label: 'Nunca corri essa distância' },
    { value: '3:00-3:30', label: '3:00 - 3:30 min/km (elite)' },
    { value: '3:30-4:00', label: '3:30 - 4:00 min/km (avançado)' },
    { value: '4:00-4:30', label: '4:00 - 4:30 min/km (muito bom)' },
    { value: '4:30-5:00', label: '4:30 - 5:00 min/km (bom)' },
    { value: '5:00-5:30', label: '5:00 - 5:30 min/km (intermediário)' },
    { value: '5:30-6:00', label: '5:30 - 6:00 min/km' },
    { value: '6:00-6:30', label: '6:00 - 6:30 min/km' },
    { value: '6:30-7:00', label: '6:30 - 7:00 min/km (iniciante)' },
    { value: '7:00+', label: 'Acima de 7:00 min/km' },
  ],
  '21k': [
    { value: 'never', label: 'Nunca corri essa distância' },
    { value: '3:30-4:00', label: '3:30 - 4:00 min/km (elite)' },
    { value: '4:00-4:30', label: '4:00 - 4:30 min/km (avançado)' },
    { value: '4:30-5:00', label: '4:30 - 5:00 min/km (muito bom)' },
    { value: '5:00-5:30', label: '5:00 - 5:30 min/km (bom)' },
    { value: '5:30-6:00', label: '5:30 - 6:00 min/km (intermediário)' },
    { value: '6:00-6:30', label: '6:00 - 6:30 min/km' },
    { value: '6:30-7:00', label: '6:30 - 7:00 min/km' },
    { value: '7:00-7:30', label: '7:00 - 7:30 min/km (iniciante)' },
    { value: '7:30+', label: 'Acima de 7:30 min/km' },
  ],
  '42k': [
    { value: 'never', label: 'Nunca corri essa distância' },
    { value: '3:30-4:00', label: '3:30 - 4:00 min/km (elite)' },
    { value: '4:00-4:30', label: '4:00 - 4:30 min/km (avançado)' },
    { value: '4:30-5:00', label: '4:30 - 5:00 min/km (muito bom)' },
    { value: '5:00-5:30', label: '5:00 - 5:30 min/km (bom)' },
    { value: '5:30-6:00', label: '5:30 - 6:00 min/km (intermediário)' },
    { value: '6:00-6:30', label: '6:00 - 6:30 min/km' },
    { value: '6:30-7:00', label: '6:30 - 7:00 min/km' },
    { value: '7:00-7:30', label: '7:00 - 7:30 min/km (iniciante)' },
    { value: '7:30+', label: 'Acima de 7:30 min/km' },
  ],
};

// Opções de tempo alvo por distância
const TIME_OPTIONS = {
  '5k': [
    { value: '15:00', label: '15 minutos (elite)' },
    { value: '18:00', label: '18 minutos (excelente)' },
    { value: '20:00', label: '20 minutos (muito bom)' },
    { value: '22:00', label: '22 minutos (bom)' },
    { value: '25:00', label: '25 minutos (intermediário)' },
    { value: '28:00', label: '28 minutos' },
    { value: '30:00', label: '30 minutos' },
    { value: '35:00', label: '35 minutos (iniciante)' },
    { value: '40:00', label: '40 minutos (iniciante)' },
  ],
  '10k': [
    { value: '30:00', label: '30 minutos (elite)' },
    { value: '35:00', label: '35 minutos (excelente)' },
    { value: '40:00', label: '40 minutos (muito bom)' },
    { value: '45:00', label: '45 minutos (bom)' },
    { value: '50:00', label: '50 minutos (intermediário)' },
    { value: '55:00', label: '55 minutos' },
    { value: '1:00:00', label: '1 hora' },
    { value: '1:10:00', label: '1h10min (iniciante)' },
    { value: '1:20:00', label: '1h20min (iniciante)' },
  ],
  'half_marathon': [
    { value: '1:05:00', label: '1h05min (elite)' },
    { value: '1:15:00', label: '1h15min (excelente)' },
    { value: '1:30:00', label: '1h30min (muito bom)' },
    { value: '1:40:00', label: '1h40min (bom)' },
    { value: '1:50:00', label: '1h50min (intermediário)' },
    { value: '2:00:00', label: '2 horas' },
    { value: '2:15:00', label: '2h15min (iniciante)' },
    { value: '2:30:00', label: '2h30min (iniciante)' },
    { value: '3:00:00', label: '3 horas (iniciante)' },
  ],
  'marathon': [
    { value: '2:10:00', label: '2h10min (elite)' },
    { value: '2:30:00', label: '2h30min (excelente)' },
    { value: '3:00:00', label: '3 horas (muito bom)' },
    { value: '3:30:00', label: '3h30min (bom)' },
    { value: '4:00:00', label: '4 horas (intermediário)' },
    { value: '4:30:00', label: '4h30min' },
    { value: '5:00:00', label: '5 horas (iniciante)' },
    { value: '5:30:00', label: '5h30min (iniciante)' },
    { value: '6:00:00', label: '6 horas (iniciante)' },
  ],
};

export default function OnboardingPage() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: '',
    runningLevel: '',
    currentWeeklyKm: '',
    longestRun: '',
    experienceDescription: '',
    goalDistance: '',
    targetRaceDate: '',
    targetTime: '',
    hasRunBefore: 'yes', // 'yes' ou 'no'
  });

  // Paces habituais por distância
  const [usualPaces, setUsualPaces] = useState({
    '5k': '',
    '10k': '',
    '21k': '',
    '42k': '',
  });

  // Estado para o dia do treino longo
  const [longRunDay, setLongRunDay] = useState<number | null>(null);

  // Atividades de treino (sistema flexível)
  const [trainingActivities, setTrainingActivities] = useState<TrainingActivity[]>([
    { id: 'running', name: 'Corrida', availableDays: [], preferredTime: 'flexible', icon: 'Activity', color: 'orange' },
  ]);

  // Estado para adicionar nova atividade
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [newActivity, setNewActivity] = useState<Partial<TrainingActivity>>({
    name: '',
    icon: 'Activity',
    color: 'blue',
    availableDays: [],
    preferredTime: 'flexible',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDay = (activityId: string, day: number) => {
    setTrainingActivities(prev => 
      prev.map(activity => {
        if (activity.id === activityId) {
          const days = activity.availableDays.includes(day)
            ? activity.availableDays.filter(d => d !== day)
            : [...activity.availableDays, day];
          return { ...activity, availableDays: days };
        }
        return activity;
      })
    );
  };

  const updateActivityTime = (activityId: string, time: string) => {
    setTrainingActivities(prev =>
      prev.map(activity =>
        activity.id === activityId ? { ...activity, preferredTime: time } : activity
      )
    );
  };

  const addSuggestedActivity = (suggested: typeof SUGGESTED_ACTIVITIES[0]) => {
    if (trainingActivities.some(a => a.id === suggested.id)) {
      return; // Já existe
    }
    setTrainingActivities(prev => [
      ...prev,
      { ...suggested, availableDays: [], preferredTime: 'flexible' },
    ]);
  };

  const addCustomActivity = () => {
    if (!newActivity.name?.trim()) {
      setError('Digite um nome para a atividade');
      return;
    }

    const id = newActivity.name.toLowerCase().replace(/\s+/g, '_');
    
    if (trainingActivities.some(a => a.id === id)) {
      setError('Você já adicionou esta atividade');
      return;
    }

    setTrainingActivities(prev => [
      ...prev,
      {
        id,
        name: newActivity.name!,
        icon: newActivity.icon || 'Activity',
        color: newActivity.color || 'blue',
        availableDays: [],
        preferredTime: 'flexible',
      },
    ]);

    setNewActivity({
      name: '',
      icon: 'Activity',
      color: 'blue',
      availableDays: [],
      preferredTime: 'flexible',
    });
    setIsAddingActivity(false);
    setError('');
  };

  const removeActivity = (activityId: string) => {
    if (activityId === 'running') {
      // Não permite remover a corrida (atividade principal)
      return;
    }
    setTrainingActivities(prev => prev.filter(a => a.id !== activityId));
  };

  const handleGoBack = () => {
    // Lógica de navegação para voltar respeitando os steps condicionais
    if (step === 3 && formData.hasRunBefore === 'no') {
      // Se está no step 3 (objetivos) e nunca correu, volta para step 1
      setStep(1);
    } else if (step === 2) {
      // Se está no step 2 (paces), volta para step 1
      setStep(1);
    } else {
      // Caso padrão: volta um step
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar step atual antes de prosseguir
    if (step === 1) {
      // Validar dados básicos
      if (!formData.weight || !formData.height || !formData.age || !formData.gender || !formData.runningLevel) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      // Se nunca correu, pula direto para step 3 (objetivos)
      // Se já correu, vai para step 2 (paces habituais)
      if (formData.hasRunBefore === 'no') {
        setStep(3);
      } else {
        setStep(2);
      }
      return;
    }
    
    if (step === 2) {
      // Step de paces habituais - não é obrigatório preencher todos
      // Pode avançar mesmo sem preencher
      setStep(3);
      return;
    }
    
    if (step === 3) {
      // Validar objetivo
      if (!formData.goalDistance) {
        setError('Por favor, selecione seu objetivo de distância.');
        return;
      }
      setStep(4);
      return;
    }
    
    // Step 4 - Submeter formulário
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/profile/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          trainingActivities,
          longRunDay,
          usualPaces: formData.hasRunBefore === 'yes' ? usualPaces : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao criar perfil');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('Ocorreu um erro. Tente novamente.');
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      Activity,
      Dumbbell,
      Waves,
      Bike,
      Heart,
      Zap,
    };
    return iconMap[iconName] || Activity;
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      orange: 'bg-orange-600',
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      purple: 'bg-purple-600',
      cyan: 'bg-cyan-600',
      red: 'bg-red-600',
      yellow: 'bg-yellow-600',
      pink: 'bg-pink-600',
    };
    return colorMap[color] || 'bg-gray-600';
  };

  const renderActivityCard = (activity: TrainingActivity) => {
    const IconComponent = getIconComponent(activity.icon);
    const colorClass = getColorClass(activity.color);

    return (
      <div key={activity.id} className="space-y-4 p-4 border rounded-lg bg-gradient-to-br from-gray-50 to-white relative">
        {/* Botão de remover (exceto para corrida) */}
        {activity.id !== 'running' && (
          <button
            type="button"
            onClick={() => removeActivity(activity.id)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-100 text-red-600 transition-colors"
            title="Remover atividade"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colorClass} text-white`}>
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold">{activity.name}</h4>
            <p className="text-xs text-muted-foreground">
              Configure os dias e horários disponíveis
            </p>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Dias Disponíveis</Label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = activity.availableDays.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(activity.id, day.value)}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-all
                    ${isSelected 
                      ? `${colorClass} text-white shadow-md` 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {day.short}
                </button>
              );
            })}
          </div>
          {activity.availableDays.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {activity.availableDays.length} dia{activity.availableDays.length !== 1 ? 's' : ''} selecionado{activity.availableDays.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Horário Preferencial</Label>
          <Select 
            value={activity.preferredTime} 
            onValueChange={(value) => updateActivityTime(activity.id, value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((slot) => (
                <SelectItem key={slot.value} value={slot.value}>
                  {slot.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="text-sm">
                Passo {step > 1 && formData.hasRunBefore === 'no' ? step - 1 : step} de {formData.hasRunBefore === 'no' ? '3' : '4'}
              </Badge>
            </div>
            <CardTitle className="text-3xl">
              {step === 1 && 'Vamos criar seu plano personalizado!'}
              {step === 2 && 'Seus Paces Habituais'}
              {step === 3 && 'Seus Objetivos'}
              {step === 4 && 'Configure sua Disponibilidade'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Conte-nos sobre você e sua experiência com corrida'}
              {step === 2 && 'Selecione seus ritmos habituais em diferentes distâncias'}
              {step === 3 && 'Qual é seu objetivo principal?'}
              {step === 4 && 'Quando você pode treinar? Vamos adaptar o plano à sua rotina!'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* STEP 1: Dados Básicos e Experiência */}
              {step === 1 && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Dados Físicos</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight">Peso (kg) *</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          value={formData.weight}
                          onChange={(e) => handleChange('weight', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="height">Altura (cm) *</Label>
                        <Input
                          id="height"
                          type="number"
                          value={formData.height}
                          onChange={(e) => handleChange('height', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="age">Idade *</Label>
                        <Input
                          id="age"
                          type="number"
                          value={formData.age}
                          onChange={(e) => handleChange('age', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gênero *</Label>
                        <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)} required>
                          <SelectTrigger id="gender">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Masculino</SelectItem>
                            <SelectItem value="female">Feminino</SelectItem>
                            <SelectItem value="other">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Sua Experiência com Corrida</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="hasRunBefore">Você já praticou corrida antes? *</Label>
                      <Select value={formData.hasRunBefore} onValueChange={(value) => handleChange('hasRunBefore', value)} required>
                        <SelectTrigger id="hasRunBefore">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Sim, já corri antes</SelectItem>
                          <SelectItem value="no">Não, é minha primeira vez</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="runningLevel">Nível de Experiência *</Label>
                      <Select value={formData.runningLevel} onValueChange={(value) => handleChange('runningLevel', value)} required>
                        <SelectTrigger id="runningLevel">
                          <SelectValue placeholder="Selecione seu nível" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Iniciante (menos de 6 meses correndo)</SelectItem>
                          <SelectItem value="intermediate">Intermediário (6 meses a 2 anos)</SelectItem>
                          <SelectItem value="advanced">Avançado (mais de 2 anos)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentWeeklyKm">Volume Semanal Atual (km)</Label>
                        <Input
                          id="currentWeeklyKm"
                          type="number"
                          step="0.1"
                          value={formData.currentWeeklyKm}
                          onChange={(e) => handleChange('currentWeeklyKm', e.target.value)}
                          placeholder="Ex: 25"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="longestRun">Maior Distância já Corrida (km)</Label>
                        <Input
                          id="longestRun"
                          type="number"
                          step="0.1"
                          value={formData.longestRun}
                          onChange={(e) => handleChange('longestRun', e.target.value)}
                          placeholder="Ex: 18"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experienceDescription">
                        Conte sobre sua experiência com corrida (opcional)
                      </Label>
                      <Textarea
                        id="experienceDescription"
                        rows={4}
                        value={formData.experienceDescription}
                        onChange={(e) => handleChange('experienceDescription', e.target.value)}
                        placeholder="Ex: Comecei a correr há 2 anos, já completei 3 provas de 10km, melhor tempo foi 50min..."
                      />
                      <p className="text-xs text-muted-foreground">
                        A IA analisará sua experiência para personalizar melhor seu plano
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* STEP 2: Paces Habituais (apenas se já correu antes) */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Seus Paces Habituais</h3>
                    <p className="text-sm text-muted-foreground">
                      Selecione a faixa de pace (ritmo por km) que você normalmente corre em cada distância. 
                      Isso nos ajudará a personalizar melhor seu plano de treinamento.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pace-5k" className="text-base font-medium">5 km</Label>
                      <Select 
                        value={usualPaces['5k']} 
                        onValueChange={(value) => setUsualPaces(prev => ({ ...prev, '5k': value }))}
                      >
                        <SelectTrigger id="pace-5k">
                          <SelectValue placeholder="Selecione seu pace habitual" />
                        </SelectTrigger>
                        <SelectContent>
                          {PACE_OPTIONS['5k'].map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pace-10k" className="text-base font-medium">10 km</Label>
                      <Select 
                        value={usualPaces['10k']} 
                        onValueChange={(value) => setUsualPaces(prev => ({ ...prev, '10k': value }))}
                      >
                        <SelectTrigger id="pace-10k">
                          <SelectValue placeholder="Selecione seu pace habitual" />
                        </SelectTrigger>
                        <SelectContent>
                          {PACE_OPTIONS['10k'].map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pace-21k" className="text-base font-medium">Meia Maratona (21 km)</Label>
                      <Select 
                        value={usualPaces['21k']} 
                        onValueChange={(value) => setUsualPaces(prev => ({ ...prev, '21k': value }))}
                      >
                        <SelectTrigger id="pace-21k">
                          <SelectValue placeholder="Selecione seu pace habitual" />
                        </SelectTrigger>
                        <SelectContent>
                          {PACE_OPTIONS['21k'].map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pace-42k" className="text-base font-medium">Maratona (42 km)</Label>
                      <Select 
                        value={usualPaces['42k']} 
                        onValueChange={(value) => setUsualPaces(prev => ({ ...prev, '42k': value }))}
                      >
                        <SelectTrigger id="pace-42k">
                          <SelectValue placeholder="Selecione seu pace habitual" />
                        </SelectTrigger>
                        <SelectContent>
                          {PACE_OPTIONS['42k'].map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Não se preocupe se não preencheu todas as distâncias. Você pode selecionar "Nunca corri essa distância" 
                      ou deixar em branco. Usaremos as informações que você fornecer para ajustar seu plano.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* STEP 3: Objetivos */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="goalDistance">Distância Objetivo *</Label>
                    <Select 
                      value={formData.goalDistance} 
                      onValueChange={(value) => {
                        handleChange('goalDistance', value);
                        // Limpar o tempo alvo quando mudar a distância
                        handleChange('targetTime', '');
                      }} 
                      required
                    >
                      <SelectTrigger id="goalDistance">
                        <SelectValue placeholder="Selecione a distância" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5k">5km</SelectItem>
                        <SelectItem value="10k">10km</SelectItem>
                        <SelectItem value="half_marathon">Meia-Maratona (21km)</SelectItem>
                        <SelectItem value="marathon">Maratona (42km)</SelectItem>
                        <SelectItem value="conditioning">Apenas Ganhar Condicionamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetRaceDate">Data da Prova (opcional)</Label>
                    <Input
                      id="targetRaceDate"
                      type="date"
                      value={formData.targetRaceDate}
                      onChange={(e) => handleChange('targetRaceDate', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Se deixar em branco, calcularemos a melhor data
                    </p>
                  </div>

                  {/* Seletor de tempo alvo - Apenas para distâncias específicas */}
                  {formData.goalDistance && formData.goalDistance !== 'conditioning' && (
                    <div className="space-y-2">
                      <Label htmlFor="targetTime">
                        Tempo Objetivo (opcional)
                      </Label>
                      <Select 
                        value={formData.targetTime} 
                        onValueChange={(value) => handleChange('targetTime', value)}
                      >
                        <SelectTrigger id="targetTime">
                          <SelectValue placeholder="Selecione um tempo ou deixe em branco" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no_target">Sem meta de tempo específica</SelectItem>
                          {formData.goalDistance && 
                            TIME_OPTIONS[formData.goalDistance as keyof typeof TIME_OPTIONS]?.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Escolha um tempo alvo ou deixe em branco para focar apenas em completar a prova
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: Disponibilidade */}
              {step === 4 && (
                <div className="space-y-6">
                  <Alert>
                    <CalendarDays className="h-4 w-4" />
                    <AlertDescription>
                      Configure sua disponibilidade para cada atividade que você pratica. 
                      Adicione quantas modalidades quiser - o plano será adaptado à sua rotina!
                    </AlertDescription>
                  </Alert>

                  {/* Seletor do dia do treino longo */}
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-white space-y-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-orange-600" />
                      <h4 className="font-semibold">Treino Longo Semanal</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Qual dia da semana você prefere fazer seu treino longo? 
                      Este é o treino mais importante, geralmente feito no fim de semana.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map((day) => {
                        const isSelected = longRunDay === day.value;
                        return (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => {
                              setLongRunDay(day.value);
                              // Automaticamente adicionar este dia aos dias de corrida
                              setTrainingActivities(prev => {
                                return prev.map(activity => {
                                  if (activity.id === 'running') {
                                    // Adicionar o dia se ainda não estiver na lista
                                    const updatedDays = activity.availableDays.includes(day.value)
                                      ? activity.availableDays
                                      : [...activity.availableDays, day.value].sort((a, b) => a - b);
                                    return { ...activity, availableDays: updatedDays };
                                  }
                                  return activity;
                                });
                              });
                            }}
                            className={`
                              px-4 py-3 rounded-md text-sm font-medium transition-all
                              ${isSelected
                                ? 'bg-orange-600 text-white shadow-md scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }
                            `}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                    {longRunDay !== null && (
                      <p className="text-xs text-orange-600 font-medium">
                        ✓ {DAYS_OF_WEEK.find(d => d.value === longRunDay)?.label} selecionado para o treino longo
                        <span className="block mt-1 text-gray-600">
                          (Este dia foi automaticamente adicionado aos seus dias de corrida)
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Atividades adicionadas */}
                  <div className="space-y-4">
                    {trainingActivities.map((activity) => renderActivityCard(activity))}
                  </div>

                  {/* Atividades sugeridas */}
                  {SUGGESTED_ACTIVITIES.some(s => !trainingActivities.find(a => a.id === s.id)) && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Atividades Sugeridas</Label>
                      <div className="flex flex-wrap gap-2">
                        {SUGGESTED_ACTIVITIES.filter(suggested => 
                          !trainingActivities.find(a => a.id === suggested.id)
                        ).map((suggested) => {
                          const IconComponent = getIconComponent(suggested.icon);
                          return (
                            <button
                              key={suggested.id}
                              type="button"
                              onClick={() => addSuggestedActivity(suggested)}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors text-sm"
                            >
                              <IconComponent className="h-4 w-4" />
                              {suggested.name}
                              <Plus className="h-3 w-3" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Adicionar atividade personalizada */}
                  {!isAddingActivity ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsAddingActivity(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Outra Modalidade/Esporte
                    </Button>
                  ) : (
                    <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-white space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Nova Atividade</h4>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingActivity(false);
                            setNewActivity({
                              name: '',
                              icon: 'Activity',
                              color: 'blue',
                              availableDays: [],
                              preferredTime: 'flexible',
                            });
                            setError('');
                          }}
                          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm">Nome da Atividade *</Label>
                          <Input
                            value={newActivity.name || ''}
                            onChange={(e) => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Ex: Yoga, Funcional, Crossfit, etc."
                            className="mt-1"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm">Ícone</Label>
                            <Select
                              value={newActivity.icon}
                              onValueChange={(value) => setNewActivity(prev => ({ ...prev, icon: value }))}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ICON_OPTIONS.map((icon) => (
                                  <SelectItem key={icon.value} value={icon.value}>
                                    {icon.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-sm">Cor</Label>
                            <Select
                              value={newActivity.color}
                              onValueChange={(value) => setNewActivity(prev => ({ ...prev, color: value }))}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {COLOR_OPTIONS.map((color) => (
                                  <SelectItem key={color.value} value={color.value}>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-4 h-4 rounded ${color.class}`}></div>
                                      {color.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={addCustomActivity}
                          className="w-full"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                {step > 1 && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleGoBack}
                    className="flex-1"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                )}
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando seu plano...
                    </>
                  ) : step < 3 ? (
                    <>
                      Próximo
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    'Criar Meu Plano Personalizado'
                  )}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
