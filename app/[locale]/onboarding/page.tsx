'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

// V1.3.0 Step Components with i18n
import Step1BasicData from '@/components/onboarding/v1.3.0/Step1BasicData';
import Step2SportBackground from '@/components/onboarding/v1.3.0/Step2SportBackground';
import Step3Performance from '@/components/onboarding/v1.3.0/Step3Performance';
import Step4Health from '@/components/onboarding/v1.3.0/Step4Health';
import Step5Goals from '@/components/onboarding/v1.3.0/Step5Goals';
import Step6Availability from '@/components/onboarding/v1.3.0/Step6Availability';
import Step7Review from '@/components/onboarding/v1.3.0/Step7Review';
import PlanGenerationLoading from '@/components/onboarding/PlanGenerationLoading';

const TOTAL_STEPS = 7;

export default function OnboardingPage() {
  const t = useTranslations('onboarding');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');
  const locale = useLocale();
  const { data: session } = useSession();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false); // NOVO: estado para geração do plano
  const [error, setError] = useState('');
  
  // Form data aggregated from all steps
  const [formData, setFormData] = useState<any>({
    // Step 1: Basic Data
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    gender: '',
    age: '',
    weight: '',
    height: '',
    
    // Step 2: Sport Background
    runningLevel: '',
    yearsRunning: '',
    weeklyVolume: '',
    weeklyFrequency: '',
    longestRun: '',
    preferredPace: '',
    otherSports: [],
    
    // Step 3: Performance
    bestTimes: {},
    
    // Step 4: Health (incluindo dados fisiológicos)
    injuries: [],
    medicalConditions: [],
    medicalClearance: true,
    medicalNotes: '',
    restingHeartRate: '',
    sleepQuality: 3,
    stressLevel: 3,
    
    // Step 5: Goals (CRITICAL for API)
    goalType: '', // Tipo: 'race' | 'start' | 'fitness' (vazio inicialmente)
    isOpenGoal: false, // Se é objetivo aberto (sem corrida específica)
    primaryGoal: '',
    raceName: '', // Nome da corrida (opcional)
    targetRaceDate: '',
    goalDistance: '', // REQUIRED
    targetTime: '',
    secondaryGoals: [],
    motivationFactors: {},
    
    // Step 6: Availability (NOVA ESTRUTURA)
    trainingSchedule: {}, // { 0: { running: true, activities: ['gym'] } }
    customActivities: [], // ['pilates', 'crossfit']
    longRunDay: null,
    hasGymAccess: false,
    hasPoolAccess: false,
    hasTrackAccess: false,
    trainingPreferences: {
      solo: false,
      group: false,
      indoor: false,
      outdoor: false,
    },
    
    // Step 7: Review
    reviewComplete: false,
  });

  // Update form data from step components
  const updateStepData = (stepData: any) => {
    setFormData((prev: any) => ({ ...prev, ...stepData }));
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    setError('');
    
    // Todos os steps fazem validação internamente
    // Não precisa validar aqui para evitar race conditions
    // Apenas steps 5 e 6 precisam de validação aqui pois não têm validação própria
    
    switch (step) {
      case 1:
      case 2:
      case 3:
      case 4:
        // Steps 1-4 validam internamente
        break;
      case 5:
        // Step5 - Goals
        // Step5 valida internamente, apenas 'goal' é obrigatório
        // targetDistance foi movido para outro step
        break;
      case 6:
        // Step6 - Availability
        // Step6 valida internamente com: if (runDays.length === 0) return;
        break;
      case 7:
        // Final review
        break;
      default:
        return true;
    }
    
    return true;
  };

  // Handle next step
  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }
    
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      // Debug: Log formData completo
      console.log('🔍 [ONBOARDING] formData completo:', formData);
      console.log('🔍 [ONBOARDING] goalDistance:', formData.goalDistance);
      console.log('🔍 [ONBOARDING] targetRaceDate:', formData.targetRaceDate);
      
      // Validar dados críticos antes de submeter
      if (!formData.goalDistance || !formData.targetRaceDate) {
        const missingFields = [];
        if (!formData.goalDistance) missingFields.push('Distância da corrida');
        if (!formData.targetRaceDate) missingFields.push('Data da prova');
        
        const errorMsg = `Dados incompletos no Step 5. Faltam: ${missingFields.join(', ')}. Por favor, volte e preencha esses campos obrigatórios.`;
        console.error('❌ [ONBOARDING] Validação falhou:', errorMsg);
        setError(errorMsg);
        setLoading(false);
        return;
      }
      
      // Transformar trainingSchedule em trainingActivities (array de dias com corrida)
      const trainingActivities: any[] = [];
      if (formData.trainingSchedule && typeof formData.trainingSchedule === 'object') {
        Object.entries(formData.trainingSchedule).forEach(([day, schedule]: [string, any]) => {
          if (schedule.running || (schedule.activities && schedule.activities.length > 0)) {
            trainingActivities.push({
              day: parseInt(day),
              running: schedule.running || false,
              activities: schedule.activities || []
            });
          }
        });
      }
      
      // Preparar dados completos para o perfil
      const profilePayload = {
        // Campos básicos (Step 1)
        age: formData.age,
        gender: formData.gender,
        weight: formData.weight,
        height: formData.height,
        restingHeartRate: formData.restingHeartRate,
        sleepQuality: formData.sleepQuality,
        stressLevel: formData.stressLevel,
        
        // Experiência (Step 2)
        runningLevel: formData.runningLevel,
        yearsRunning: formData.yearsRunning,
        currentWeeklyKm: formData.weeklyVolume, // Mapear weeklyVolume → currentWeeklyKm
        longestRun: formData.longestRun,
        preferredPace: formData.preferredPace,
        otherSportsExperience: formData.otherSportsExperience || null, // Sempre string ou null
        
        // Performance (Step 3)
        bestTimes: (formData.bestTimes && Object.keys(formData.bestTimes).length > 0) 
          ? formData.bestTimes 
          : null, // Converter objeto vazio em null
        
        // Saúde (Step 4)
        injuryDetails: [...(formData.injuries || []), ...(formData.medicalConditions || [])].filter(x => x).join('; ') || null,
        medicalNotes: formData.medicalNotes,
        
        // Objetivos (Step 5) - CRITICAL
        goalType: formData.goalType || null, // Tipo de objetivo
        isOpenGoal: formData.isOpenGoal || false, // Se é objetivo aberto
        raceName: formData.raceName || null, // Nome da corrida (opcional)
        goalDistance: formData.goalDistance, // REQUIRED
        targetRaceDate: formData.targetRaceDate, // REQUIRED
        targetTime: formData.targetTime,
        primaryGoal: formData.primaryGoal,
        secondaryGoals: formData.secondaryGoals,
        motivationFactors: formData.motivationFactors,
        
        // Disponibilidade (Step 6) - NOVA E ANTIGA ESTRUTURA (compatibilidade)
        trainingActivities: trainingActivities, // Array de dias (formato antigo para API)
        trainingSchedule: formData.trainingSchedule || {}, // Novo formato completo
        customActivities: formData.customActivities || [],
        longRunDay: formData.longRunDay,
        hasGymAccess: formData.hasGymAccess || false,
        hasPoolAccess: formData.hasPoolAccess || false,
        hasTrackAccess: formData.hasTrackAccess || false,
        trainingPreferences: formData.trainingPreferences || {},
        
        // Outros
        onboardingComplete: true,
        locale: session?.user?.locale || locale || 'pt-BR',
      };
      
      console.log('📊 Dados do onboarding:', {
        formData,
        profilePayload,
        trainingActivities,
        goalDistance: profilePayload.goalDistance,
        targetRaceDate: profilePayload.targetRaceDate,
      });
      
      // STEP 1: Criar perfil
      const response = await fetch('/api/profile/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilePayload),
      });

      const data = await response.json();
      
      console.log('📡 Resposta da API:', {
        status: response.status,
        ok: response.ok,
        data
      });

      if (!response.ok) {
        const errorMsg = data.error || data.message || tErrors('generic');
        console.error('❌ Erro ao criar perfil:', errorMsg, data);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      console.log('✅ Perfil criado com sucesso!');
      setLoading(false);
      
      // STEP 2: Mostrar loading divertido e gerar plano
      setGeneratingPlan(true);
      
      try {
        console.log('🚀 Iniciando geração do plano...');
        
        const planResponse = await fetch('/api/plan/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        const planData = await planResponse.json();
        
        if (!planResponse.ok) {
          console.error('⚠️ Erro ao gerar plano (não crítico):', planData);
          // Não bloquear o fluxo, apenas logar o erro
        } else {
          console.log('✅ Plano gerado com sucesso!');
        }
      } catch (planErr) {
        console.error('⚠️ Erro ao gerar plano (não crítico):', planErr);
        // Não bloquear o fluxo
      }
      
      // Aguardar loading animado completar (mínimo 30 segundos para mostrar todas as mensagens)
      setTimeout(() => {
        console.log('✅ Redirecionando para dashboard...');
        router.push(`/${locale}/dashboard`);
      }, 30000); // 30 segundos
      
    } catch (err) {
      console.error('❌ Erro na requisição:', err);
      setError(tErrors('network'));
      setLoading(false);
    }
  };

  // Render current step component
  const renderStep = () => {
    const stepProps = {
      data: formData,
      onUpdate: updateStepData,
      onNext: handleNext,
      onPrevious: handlePrevious,
    };

    switch (currentStep) {
      case 1:
        return <Step1BasicData {...stepProps} />;
      case 2:
        return <Step2SportBackground {...stepProps} />;
      case 3:
        return <Step3Performance {...stepProps} />;
      case 4:
        return <Step4Health {...stepProps} />;
      case 5:
        return <Step5Goals {...stepProps} />;
      case 6:
        return <Step6Availability {...stepProps} />;
      case 7:
        return <Step7Review {...stepProps} onSubmit={handleSubmit} onBack={handlePrevious} loading={loading} />;
      default:
        return null;
    }
  };

  // Calculate progress percentage
  const progress = (currentStep / TOTAL_STEPS) * 100;

  // Se está gerando o plano, mostrar loading
  if (generatingPlan) {
    return <PlanGenerationLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{t('progress', { current: currentStep, total: TOTAL_STEPS })}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl">
              {t(`step${currentStep}.title`)}
            </CardTitle>
            <CardDescription>
              {t(`step${currentStep}.subtitle`)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStep()}

            {/* Navigation Buttons - Only for Steps 1-6 */}
            {currentStep < 7 && (
              <div className="flex gap-4 mt-8 pt-6 border-t">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex-1"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {tCommon('previous')}
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700"
                >
                  {tCommon('next')}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
            {/* Step 7 buttons are handled in Step7Review component */}
          </CardContent>
        </Card>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index + 1 === currentStep
                  ? 'w-8 bg-gradient-to-r from-orange-600 to-blue-600'
                  : index + 1 < currentStep
                  ? 'w-2 bg-green-500'
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
