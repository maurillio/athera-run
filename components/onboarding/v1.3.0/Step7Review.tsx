'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, Calendar } from 'lucide-react';

export default function Step7Review({ data, onSubmit, onBack, loading }: any) {
  const t = useTranslations('onboarding.step7');
  const tCommon = useTranslations('common');
  const router = useRouter();
  
  // Estado para data de início do plano
  const [planStartDate, setPlanStartDate] = useState<string>('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  // Mensagens de loading com humor (via i18n)
  const loadingMessagesRaw = t('loadingMessages');
  const loadingMessages = Array.isArray(loadingMessagesRaw) 
    ? loadingMessagesRaw 
    : [
        '🕶️ Colocando os óculos baixa pace...',
        '⚡ Tomando o gel de carboidrato...',
        '👟 Colocando o tênis de placa de carbono...',
        '💧 Hidratando...',
        '📊 Analisando seu perfil...',
        '🎯 Calculando distâncias ideais...',
        '📅 Organizando suas semanas de treino...',
        '🏃 Definindo seus ritmos personalizados...',
        '✨ Finalizando seu plano perfeito...'
      ];
  
  // Calcular data mínima (hoje) e sugerida (próxima segunda)
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 1 ? 0 : dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysToMonday);
    
    // Sugerir próxima segunda como padrão
    setPlanStartDate(nextMonday.toISOString().split('T')[0]);
  }, []);
  
  // Animação das mensagens de loading
  useEffect(() => {
    if (isGeneratingPlan) {
      const interval = setInterval(() => {
        setGenerationStep(prev => (prev + 1) % loadingMessages.length);
      }, 2000); // Muda a cada 2 segundos
      
      return () => clearInterval(interval);
    }
  }, [isGeneratingPlan]);
  
  // Função para criar perfil E gerar plano automaticamente
  const handleFinishAndGeneratePlan = async () => {
    try {
      setIsGeneratingPlan(true);
      setGenerationError(null);
      setGenerationStep(0);
      
      console.log('🔍 [ONBOARDING] formData completo:', data);
      console.log('🔍 [ONBOARDING] goalDistance:', data.goalDistance);
      console.log('🔍 [ONBOARDING] targetRaceDate:', data.targetRaceDate);
      console.log('🔍 [ONBOARDING] planStartDate:', planStartDate);
      
      // Transformar trainingSchedule para trainingActivities
      const trainingActivities: number[] = [];
      if (data.trainingSchedule) {
        Object.keys(data.trainingSchedule).forEach(dayIndex => {
          const schedule = data.trainingSchedule[parseInt(dayIndex)];
          if (schedule.running || schedule.activities?.length > 0) {
            trainingActivities.push(parseInt(dayIndex));
          }
        });
      }
      
      // Preparar payload com data de início do plano E trainingActivities
      const profilePayload = {
        ...data,
        planStartDate: planStartDate || undefined,
        trainingActivities, // ✅ CRÍTICO: Incluir trainingActivities no payload
      };
      
      console.log('📊 Dados do onboarding:', {
        formData: data,
        profilePayload,
        trainingActivities,
        goalDistance: data.goalDistance,
        targetRaceDate: data.targetRaceDate
      });
      
      // 1. CRIAR PERFIL
      const profileResponse = await fetch('/api/profile/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilePayload),
      });
      
      console.log('📡 Resposta da API:', {
        status: profileResponse.status,
        ok: profileResponse.ok,
        data: await profileResponse.clone().json()
      });
      
      if (!profileResponse.ok) {
        const error = await profileResponse.json();
        console.error('❌ Erro ao criar perfil:', error.error, error);
        throw new Error(error.error || 'Erro ao criar perfil');
      }
      
      const profileData = await profileResponse.json();
      console.log('✅ Perfil criado com sucesso!');
      
      // 2. GERAR PLANO AUTOMATICAMENTE
      console.log('🚀 Iniciando geração do plano...');
      const planResponse = await fetch('/api/plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: planStartDate
        }),
      });
      
      if (!planResponse.ok) {
        const planError = await planResponse.json();
        console.error('⚠️ Erro ao gerar plano (não crítico):', planError);
        // Não bloqueia - usuário pode gerar depois
      } else {
        console.log('✅ Plano gerado com sucesso!');
      }
      
      // 3. REDIRECIONAR PARA DASHBOARD
      console.log('✅ Redirecionando para dashboard...');
      setTimeout(() => {
        router.push('/pt-BR/dashboard');
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Erro no processo de onboarding:', error);
      setGenerationError(error.message || 'Erro ao finalizar onboarding');
      setIsGeneratingPlan(false);
    }
  };
  
  // Helper para obter label da atividade com acentos corretos
  const defaultActivities = [
    { key: 'Musculação', label: 'Musculação' },
    { key: 'Yoga', label: 'Yoga' },
    { key: 'Pilates', label: 'Pilates' },
    { key: 'Natação', label: 'Natação' },
    { key: 'Ciclismo', label: 'Ciclismo' },
    { key: 'Luta', label: 'Luta' },
  ];
  
  const getActivityLabel = (key: string) => {
    const defaultActivity = defaultActivities.find(a => a.key === key);
    if (defaultActivity) return defaultActivity.label;
    
    // Customizado - formata o nome preservando acentos
    return key.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };
  
  const getSummary = () => {
    const sections: any = {
      basic: [],
      experience: [],
      goals: [],
      availability: [],
      health: []
    };
    
    console.log('📊 Step7Review - data received:', {
      goalDistance: data.goalDistance,
      targetRaceDate: data.targetRaceDate,
      primaryGoal: data.primaryGoal,
      age: data.age,
      weight: data.weight,
      allData: data
    });
    
    // ===== DADOS BÁSICOS =====
    if (data.age) sections.basic.push(`${data.age} anos`);
    if (data.gender) sections.basic.push(data.gender === 'male' ? '👨 Masculino' : '👩 Feminino');
    if (data.weight) sections.basic.push(`⚖️ ${data.weight}kg`);
    if (data.height) sections.basic.push(`📏 ${data.height}cm`);
    if (data.restingHeartRate) sections.basic.push(`❤️ FC Repouso: ${data.restingHeartRate} bpm`);
    
    // ===== EXPERIÊNCIA =====
    if (data.runningLevel) {
      const levels: any = {
        beginner: 'Iniciante',
        intermediate: 'Intermediário',
        advanced: 'Avançado'
      };
      sections.experience.push(`🏃 Nível: ${levels[data.runningLevel] || data.runningLevel}`);
    }
    
    if (data.yearsRunning) sections.experience.push(`📅 ${data.yearsRunning} anos correndo`);
    if (data.weeklyVolume) sections.experience.push(`📊 ${data.weeklyVolume}km/semana atualmente`);
    if (data.longestRun) sections.experience.push(`🏃‍♂️ Longão de ${data.longestRun}km`);
    if (data.preferredPace) sections.experience.push(`⏱️ Pace preferido: ${data.preferredPace}`);
    
    // Outros esportes
    if (data.otherSports && data.otherSports.length > 0) {
      sections.experience.push(`🎾 Outros esportes: ${data.otherSports.join(', ')}`);
    }
    if (data.otherSportsExperience) {
      sections.experience.push(`🎾 Outros esportes: ${data.otherSportsExperience}`);
    }
    
    // Best times - corrigido para objeto ao invés de array
    if (data.bestTimes && typeof data.bestTimes === 'object' && Object.keys(data.bestTimes).length > 0) {
      sections.experience.push(`🏆 Melhores tempos registrados`);
      Object.entries(data.bestTimes).forEach(([distance, timeData]: any) => {
        sections.experience.push(`   • ${distance}: ${timeData.time} (VDOT ${timeData.vdot})`);
      });
    }
    
    // ===== OBJETIVOS =====
    if (data.primaryGoal) {
      const goalLabels: any = {
        finish_first_race: 'Completar primeira corrida',
        improve_time: 'Melhorar tempo',
        health_fitness: 'Saúde e fitness',
        weight_loss: 'Emagrecimento',
        challenge: 'Desafio pessoal',
        consistency: 'Criar consistência'
      };
      sections.goals.push(`🎯 ${goalLabels[data.primaryGoal] || data.primaryGoal}`);
    }
    
    // Race Goal - CRITICAL
    // Mostrar tipo de objetivo
    const goalTypeLabels: any = {
      race: '🏁 Tenho corrida alvo',
      start: '🏃 Quero começar a correr',
      fitness: '💪 Ganhar condicionamento'
    };
    
    if (data.goalType) {
      sections.goals.push(`Tipo: ${goalTypeLabels[data.goalType] || data.goalType}`);
    }
    
    if (data.isOpenGoal) {
      sections.goals.push(`✓ Objetivo aberto - Sem corrida específica`);
    }
    
    if (data.raceName) {
      sections.goals.push(`📝 Corrida: ${data.raceName}`);
    }
    
    if (data.goalDistance) {
      const distances: any = {
        '5k': '5km',
        '10k': '10km',
        '21k': 'Meia Maratona (21km)',
        '42k': 'Maratona (42km)'
      };
      sections.goals.push(`🏁 Distância: ${distances[data.goalDistance] || data.goalDistance}`);
    }
    
    if (data.targetRaceDate) {
      const date = new Date(data.targetRaceDate);
      const label = data.isOpenGoal ? 'Prazo estimado' : 'Data da prova';
      sections.goals.push(`📅 ${label}: ${date.toLocaleDateString('pt-BR')}`);
    }
    
    if (data.targetTime && !data.isOpenGoal) {
      sections.goals.push(`⏱️ Tempo alvo: ${data.targetTime}`);
    }
    
    // ===== DISPONIBILIDADE =====
    // Nova estrutura: trainingSchedule
    if (data.trainingSchedule && Object.keys(data.trainingSchedule).length > 0) {
      const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const daysShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      
      const schedule = data.trainingSchedule;
      const trainingDays = Object.keys(schedule).filter(day => {
        const daySchedule = schedule[parseInt(day)];
        return daySchedule.running || daySchedule.activities?.length > 0;
      });
      
      sections.availability.push(`📅 ${trainingDays.length} dias de treino por semana`);
      
      // Dias de corrida
      const runningDays = Object.keys(schedule)
        .filter(day => schedule[parseInt(day)].running)
        .map(day => daysShort[parseInt(day)])
        .join(', ');
      
      if (runningDays) {
        sections.availability.push(`🏃 Dias de corrida: ${runningDays}`);
      }
      
      // Outras atividades por dia
      const activitiesByDay: Record<string, string[]> = {};
      Object.keys(schedule).forEach(day => {
        const daySchedule = schedule[parseInt(day)];
        if (daySchedule.activities?.length > 0) {
          activitiesByDay[days[parseInt(day)]] = daySchedule.activities;
        }
      });
      
      if (Object.keys(activitiesByDay).length > 0) {
        Object.entries(activitiesByDay).forEach(([day, activities]) => {
          const formattedActivities = activities.map(act => getActivityLabel(act)).join(', ');
          sections.availability.push(`✨ ${day}: ${formattedActivities}`);
        });
      }
    }
    
    // Dia do longão
    if (data.longRunDay !== null && data.longRunDay !== undefined) {
      const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      sections.availability.push(`🏃‍♂️ Longão: ${days[data.longRunDay]}`);
    }
    
    // Infraestrutura
    const infrastructure = [];
    if (data.hasGymAccess) infrastructure.push('Academia');
    if (data.hasPoolAccess) infrastructure.push('Piscina');
    if (data.hasTrackAccess) infrastructure.push('Pista');
    if (infrastructure.length > 0) {
      sections.availability.push(`🏗️ Recursos: ${infrastructure.join(', ')}`);
    }
    
    // Preferências de treino
    if (data.trainingPreferences) {
      const prefs = [];
      if (data.trainingPreferences.solo) prefs.push('Solo');
      if (data.trainingPreferences.group) prefs.push('Grupo');
      if (prefs.length > 0) {
        sections.availability.push(`👤 Preferência: ${prefs.join(' e ')}`);
      }
      
      const env = [];
      if (data.trainingPreferences.indoor) env.push('Indoor');
      if (data.trainingPreferences.outdoor) env.push('Outdoor');
      if (env.length > 0) {
        sections.availability.push(`🌍 Ambiente: ${env.join(' e ')}`);
      }
    }
    
    // ===== SAÚDE =====
    if (data.sleepQuality) {
      sections.health.push(`😴 Qualidade do sono: ${data.sleepQuality}/5`);
    }
    if (data.stressLevel) {
      sections.health.push(`😰 Nível de estresse: ${data.stressLevel}/5`);
    }
    if (data.injuries && data.injuries.length > 0) {
      sections.health.push(`⚠️ ${data.injuries.length} lesão(ões) relatada(s)`);
    }
    if (data.medicalConditions && data.medicalConditions.length > 0) {
      sections.health.push(`🏥 ${data.medicalConditions.length} condição(ões) médica(s)`);
    }
    if (data.sleepQuality) {
      sections.health.push(`😴 Qualidade do sono: ${data.sleepQuality}/5`);
    }
    if (data.stressLevel) {
      sections.health.push(`😰 Nível de estresse: ${data.stressLevel}/5`);
    }
    
    return sections;
  };

  const hasRequiredData = data.goalDistance && data.targetRaceDate;
  const summary = getSummary();
  const hasSummaryData = Object.values(summary).some((section: any) => section.length > 0);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-4 text-blue-900">📊 Seu Perfil</h3>
        
        {hasSummaryData ? (
          <div className="space-y-6">
            {/* Dados Básicos */}
            {summary.basic.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">👤 Dados Pessoais</h4>
                <div className="space-y-1">
                  {summary.basic.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-blue-600">✓</span>
                      <span className="text-gray-700 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experiência */}
            {summary.experience.length > 0 && (
              <div className="pt-3 border-t border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">🏃 Experiência de Corrida</h4>
                <div className="space-y-1">
                  {summary.experience.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-blue-600">✓</span>
                      <span className="text-gray-700 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Objetivos */}
            {summary.goals.length > 0 && (
              <div className="pt-3 border-t border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">🎯 Objetivos e Metas</h4>
                <div className="space-y-1">
                  {summary.goals.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-blue-600">✓</span>
                      <span className="text-gray-700 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disponibilidade */}
            {summary.availability.length > 0 && (
              <div className="pt-3 border-t border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">📅 Disponibilidade</h4>
                <div className="space-y-2">
                  {summary.availability.map((item: string, idx: number) => {
                    // Destaque especial para o dia do longão
                    if (item.includes('🏃‍♂️ Longão:')) {
                      return (
                        <div key={idx} className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border-2 border-amber-300">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🏃‍♂️</span>
                            <span className="font-bold text-amber-900">{item.replace('🏃‍♂️ ', '')}</span>
                          </div>
                          <p className="text-xs text-amber-700 mt-1 ml-8">
                            Seu treino mais longo da semana será sempre neste dia
                          </p>
                        </div>
                      );
                    }
                    // Outros itens normais
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-blue-600">✓</span>
                        <span className="text-gray-700 text-sm">{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Saúde */}
            {summary.health.length > 0 && (
              <div className="pt-3 border-t border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">🏥 Saúde e Bem-estar</h4>
                <div className="space-y-1">
                  {summary.health.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-blue-600">✓</span>
                      <span className="text-gray-700 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Nenhuma informação coletada ainda.</p>
            <p className="text-sm text-gray-500 mt-2">Volte e preencha os steps anteriores.</p>
          </div>
        )}

        {/* Performance Data - corrigido para bestTimes como objeto */}
        {data.bestTimes && typeof data.bestTimes === 'object' && Object.keys(data.bestTimes).length > 0 && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="font-semibold text-blue-900 mb-2">🏃 Melhores Tempos</p>
            {Object.entries(data.bestTimes).map(([distance, timeData]: any, idx: number) => (
              <p key={idx} className="text-sm text-gray-700">
                {distance}: {timeData.time} <span className="text-gray-500">(VDOT {timeData.vdot})</span>
              </p>
            ))}
          </div>
        )}

        {/* Health/Injuries */}
        {data.injuries && data.injuries.length > 0 && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="font-semibold text-orange-700 mb-2">⚠️ Histórico de Lesões</p>
            <ul className="text-sm text-gray-700 space-y-1">
              {data.injuries.map((injury: string, idx: number) => (
                <li key={idx}>• {injury}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Infraestrutura */}
        {(data.hasGymAccess || data.hasPoolAccess || data.hasTrackAccess) && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="font-semibold text-blue-900 mb-2">🏗️ Recursos Disponíveis</p>
            <div className="space-y-1 text-sm text-gray-700">
              {data.hasGymAccess && <p>• Academia / Musculação</p>}
              {data.hasPoolAccess && <p>• Piscina / Natação</p>}
              {data.hasTrackAccess && <p>• Pista de Atletismo</p>}
            </div>
          </div>
        )}
      </div>

      {/* Validation Warning */}
      {!hasRequiredData && (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
          <p className="font-semibold text-orange-900 mb-2">⚠️ Atenção</p>
          <p className="text-sm text-orange-700">
            Para gerar um plano personalizado, você precisa definir:
          </p>
          <ul className="text-sm text-orange-700 mt-2 space-y-1">
            {!data.goalDistance && <li>• Distância da corrida alvo (Step 5)</li>}
            {!data.targetRaceDate && <li>• Data aproximada da prova (Step 5)</li>}
          </ul>
          <p className="text-xs text-orange-600 mt-2">
            Volte ao Step 5 para preencher essas informações.
          </p>
        </div>
      )}

      {/* Next Step Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="font-semibold text-green-900 mb-2">✨ Próximo Passo</p>
        <p className="text-sm text-gray-700 mb-4">
          Nossa IA vai analisar todas essas informações e criar um plano 100% personalizado para você,
          respeitando suas limitações e maximizando seus resultados!
        </p>
        
        {/* Seleção da data de início do plano */}
        <div className="bg-white rounded-lg p-4 border-2 border-green-300 mt-4">
          <label className="flex items-center gap-2 font-semibold text-gray-900 mb-2">
            <Calendar className="w-5 h-5 text-green-600" />
            {t('startDateQuestion')}
          </label>
          <input
            type="date"
            value={planStartDate}
            onChange={(e) => setPlanStartDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 text-lg"
          />
          <p className="text-xs text-gray-600 mt-2">
            {t('startDateHelp')}
          </p>
        </div>
      </div>

      {/* Loading Screen durante geração */}
      {isGeneratingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <Loader2 className="w-16 h-16 mx-auto text-blue-600 animate-spin" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t('creatingPerfectPlan')}
            </h3>
            <p className="text-lg text-gray-700 mb-6 animate-pulse">
              {loadingMessages[generationStep]}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((generationStep + 1) / loadingMessages.length) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-4">
              {t('pleaseWait')}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {generationError && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <p className="font-semibold text-red-900 mb-2">❌ {t('profileCreationError')}</p>
          <p className="text-sm text-red-700">{generationError}</p>
          <Button
            onClick={() => setGenerationError(null)}
            className="mt-3"
            variant="outline"
          >
            {t('tryAgain')}
          </Button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading || isGeneratingPlan}
          className="flex-1"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {tCommon('previous')}
        </Button>
        
        <Button
          type="button"
          onClick={handleFinishAndGeneratePlan}
          disabled={loading || !hasRequiredData || isGeneratingPlan || !planStartDate}
          className="flex-1 bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700 text-white"
        >
          {isGeneratingPlan ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('generatingPlan')}
            </>
          ) : (
            <>{t('submitButton')}</>
          )}
        </Button>
      </div>
    </div>
  );
}
