'use client';
import { useTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft } from 'lucide-react';

export default function Step7Review({ data, onSubmit, onBack, loading }: any) {
  const t = useTranslations('onboarding.step7');
  const tCommon = useTranslations('common');
  
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
          sections.availability.push(`✨ ${day}: ${activities.join(', ')}`);
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
        <p className="text-sm text-gray-700">
          Nossa IA vai analisar todas essas informações e criar um plano 100% personalizado para você,
          respeitando suas limitações e maximizando seus resultados!
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="flex-1"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {tCommon('previous')}
        </Button>
        
        <Button
          type="button"
          onClick={onSubmit}
          disabled={loading || !hasRequiredData}
          className="flex-1 bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {tCommon('processing')}
            </>
          ) : (
            <>✨ {tCommon('finishAndCreatePlan')}</>
          )}
        </Button>
      </div>
    </div>
  );
}
