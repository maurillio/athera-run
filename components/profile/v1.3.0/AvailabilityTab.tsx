'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Check, AlertCircle, Calendar } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/hooks';
import AIFieldIcon from '@/components/ai-transparency/AIFieldIcon';

export default function AvailabilityTab({ userData, onUpdate }: any) {
  const t = useTranslations('profile');
  
  // v1.6.7 - Usar trainingSchedule como fonte única da verdade
  const initializeFromSchedule = () => {
    const schedule = userData.trainingSchedule || {};
    const runDays: number[] = [];
    const allActivitiesByDay: {[key: number]: string[]} = {};
    
    Object.keys(schedule).forEach(dayKey => {
      const dayIdx = parseInt(dayKey);
      const dayData = schedule[dayIdx];
      
      if (dayData) {
        if (dayData.running) {
          runDays.push(dayIdx);
        }
        if (dayData.activities && Array.isArray(dayData.activities)) {
          allActivitiesByDay[dayIdx] = dayData.activities;
        }
      }
    });
    
    return { runDays: runDays.sort(), allActivitiesByDay };
  };
  
  const { runDays: initialRunDays, allActivitiesByDay } = initializeFromSchedule();
  
  const [runDays, setRunDays] = useState(initialRunDays);
  const [activitiesByDay, setActivitiesByDay] = useState<{[key: number]: string[]}>(allActivitiesByDay);
  
  // v1.6.0 - Dia do Longão
  const [longRunDay, setLongRunDay] = useState<number | null>(
    userData.longRunDay !== undefined && userData.longRunDay !== null 
      ? userData.longRunDay 
      : null
  );

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [adjustmentStatus, setAdjustmentStatus] = useState<any>(null);

  const days = [
    t('availability.days.0'),
    t('availability.days.1'),
    t('availability.days.2'),
    t('availability.days.3'),
    t('availability.days.4'),
    t('availability.days.5'),
    t('availability.days.6')
  ];

  const toggleDay = (dayIdx: number, currentDays: number[], setter: Function) => {
    const newDays = currentDays.includes(dayIdx)
      ? currentDays.filter((d: number) => d !== dayIdx)
      : [...currentDays, dayIdx].sort();
    setter(newDays);
    
    // Se removeu o dia do longão, resetar
    if (longRunDay === dayIdx && !newDays.includes(dayIdx)) {
      setLongRunDay(null);
    }
    
    setHasChanges(true);
    setAdjustmentStatus(null);
  };
  
  const toggleLongRunDay = (dayIdx: number) => {
    setLongRunDay(dayIdx);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setAdjustmentStatus(null);

    try {
      // Reconstruir trainingSchedule a partir dos dados atuais
      const newTrainingSchedule: any = {};
      
      // Adicionar corridas
      runDays.forEach(dayIdx => {
        if (!newTrainingSchedule[dayIdx]) {
          newTrainingSchedule[dayIdx] = { running: false, activities: [] };
        }
        newTrainingSchedule[dayIdx].running = true;
      });
      
      // Adicionar outras atividades
      Object.keys(activitiesByDay).forEach(dayKey => {
        const dayIdx = parseInt(dayKey);
        if (!newTrainingSchedule[dayIdx]) {
          newTrainingSchedule[dayIdx] = { running: false, activities: [] };
        }
        newTrainingSchedule[dayIdx].activities = activitiesByDay[dayIdx];
      });
      
      // Calcular trainingActivities (dias com qualquer atividade)
      const trainingActivities = Object.keys(newTrainingSchedule)
        .map(d => parseInt(d))
        .filter(dayIdx => {
          const schedule = newTrainingSchedule[dayIdx];
          return schedule && (schedule.running || (schedule.activities && schedule.activities.length > 0));
        })
        .sort();
      
      // Atualizar disponibilidade (v1.6.7 - trainingSchedule completo)
      await onUpdate({
        trainingActivities,
        trainingSchedule: newTrainingSchedule,
        customActivities: userData.customActivities || [],
        longRunDay: longRunDay, // v1.6.0
      });

      // Aplicar auto-ajuste no plano
      const adjustResponse = await fetch('/api/plan/auto-adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Alteração de disponibilidade pelo usuário',
          preserveHistory: true
        })
      });

      const adjustData = await adjustResponse.json();

      setAdjustmentStatus(adjustData);
      setHasChanges(false);

      if (adjustData.success) {
        toast.success(t('availability.toast.updateSuccess'));
        if (adjustData.action === 'REGENERATE_REQUIRED') {
          toast.info(t('availability.toast.regenerateInfo'), { duration: 8000 });
        }
      } else {
        toast.error(t('availability.toast.adjustError', { error: adjustData.error }));
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast.error(t('availability.toast.saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 📅 RESUMO VISUAL - SEMPRE VISÍVEL */}
      <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          📅 Resumo da Disponibilidade
        </h3>
        
        {/* Dias de Corrida */}
        <div className="mb-4 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🏃</span>
            <span className="font-semibold">Dias de Corrida:</span>
          </div>
          <div className="flex flex-wrap gap-2 ml-10">
            {runDays.length > 0 ? (
              runDays.map((dayIdx: number) => (
                <span key={dayIdx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                  {days[dayIdx]}
                </span>
              ))
            ) : (
              <span className="text-gray-500 italic">Nenhum dia selecionado</span>
            )}
          </div>
        </div>

        {/* DIA DO LONGÃO - DESTAQUE ESPECIAL */}
        {longRunDay !== null && longRunDay !== undefined && (
          <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border-2 border-amber-300 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏃‍♂️</span>
              <div>
                <div className="font-bold text-lg text-amber-900">
                  Dia do Longão: {days[longRunDay]}
                </div>
                <div className="text-sm text-amber-700">
                  Seu treino mais longo da semana será sempre neste dia
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Outras Atividades - TODAS DO TRAINING SCHEDULE */}
        {Object.keys(activitiesByDay).length > 0 && (
          <div className="mb-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="font-semibold mb-3">✨ Outras Atividades:</div>
            <div className="space-y-3">
              {days.map((dayName, dayIdx) => {
                const activities = activitiesByDay[dayIdx];
                if (!activities || activities.length === 0) return null;
                
                return (
                  <div key={dayIdx} className="flex items-start gap-2 ml-2">
                    <span className="text-sm font-medium text-gray-700 min-w-[100px]">{dayName}:</span>
                    <div className="flex flex-wrap gap-2">
                      {activities.map((activity, idx) => {
                        // Mapear ícones por atividade
                        const activityIcons: {[key: string]: string} = {
                          'Musculação': '💪',
                          'musculacao': '💪',
                          'Yoga': '🧘',
                          'yoga': '🧘',
                          'Pilates': '🤸',
                          'pilates': '🤸',
                          'Natação': '🏊',
                          'natacao': '🏊',
                          'Ciclismo': '🚴',
                          'ciclismo': '🚴',
                          'bicicleta': '🚴',
                          'Luta': '🥋',
                          'luta': '🥋',
                        };
                        
                        const activityLower = activity.toLowerCase();
                        const icon = activityIcons[activity] || activityIcons[activityLower] || '⚡';
                        const displayName = activity.charAt(0).toUpperCase() + activity.slice(1);
                        
                        return (
                          <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium text-sm flex items-center gap-1">
                            <span>{icon}</span>
                            <span>{displayName}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Nota sobre edição de atividades */}
        {Object.keys(activitiesByDay).length > 0 && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              ℹ️ Para editar as outras atividades, você pode criar um novo plano a partir do Dashboard.
            </p>
          </div>
        )}

        {/* Infraestrutura Disponível */}
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center font-semibold mb-3">
            Infraestrutura Disponível:
            <AIFieldIcon
              label="Infraestrutura de Treino"
              importance="low"
              impact="Variedade e qualidade dos treinos"
              howUsed="Academia = treinos de força, Piscina = cross-training, Pista = intervalados precisos"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {/* Academia */}
            <div className={`p-4 rounded-lg text-center border-2 transition-all ${
              userData.hasGymAccess 
                ? 'bg-green-50 border-green-400 shadow-md' 
                : 'bg-gray-50 border-gray-300'
            }`}>
              <div className="text-3xl mb-2">💪</div>
              <div className="font-medium text-sm">Academia</div>
              <div className="text-xs mt-1 font-semibold">
                {userData.hasGymAccess ? '✅ Disponível' : '❌ Não disponível'}
              </div>
            </div>

            {/* Piscina */}
            <div className={`p-4 rounded-lg text-center border-2 transition-all ${
              userData.hasPoolAccess 
                ? 'bg-blue-50 border-blue-400 shadow-md' 
                : 'bg-gray-50 border-gray-300'
            }`}>
              <div className="text-3xl mb-2">🏊</div>
              <div className="font-medium text-sm">Piscina</div>
              <div className="text-xs mt-1 font-semibold">
                {userData.hasPoolAccess ? '✅ Disponível' : '❌ Não disponível'}
              </div>
            </div>

            {/* Pista */}
            <div className={`p-4 rounded-lg text-center border-2 transition-all ${
              userData.hasTrackAccess 
                ? 'bg-purple-50 border-purple-400 shadow-md' 
                : 'bg-gray-50 border-gray-300'
            }`}>
              <div className="text-3xl mb-2">🏃</div>
              <div className="font-medium text-sm">Pista</div>
              <div className="text-xs mt-1 font-semibold">
                {userData.hasTrackAccess ? '✅ Disponível' : '❌ Não disponível'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta Importante */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-blue-900 mb-1">{t('availability.howItWorks')}</p>
            <p className="text-sm text-blue-800">
              {t('availability.fullControl')}
              <br />
              {t('availability.runningRequired')}
              <br />
              {t('availability.autoAdjust')}
            </p>
          </div>
        </div>
      </div>

      {/* Dias de Corrida (Obrigatório) */}
      <div>
        <label className="flex items-center font-semibold mb-2 text-lg">
          {t('availability.runningDaysLabel')}
          <AIFieldIcon
            label="Dias Disponíveis para Corrida"
            importance="critical"
            impact="Distribuição semanal de treinos"
            howUsed="Aloca treinos nos dias disponíveis e define estrutura semanal. Mínimo 3 dias para progressão efetiva"
          />
        </label>
        <p className="text-sm text-gray-600 mb-3">{t('availability.runningDaysDesc')}</p>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => (
            <button key={idx} onClick={() => toggleDay(idx, runDays, setRunDays)}
              className={`px-2 py-3 text-sm font-medium rounded-lg transition-colors ${
                runDays.includes(idx)
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                  : 'border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50'
              }`}>
              {day}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {t('availability.daysSelected', { count: runDays.length })} {runDays.length < 3 && <span className="text-orange-600">{t('availability.minRecommended')}</span>}
        </p>
      </div>

      {/* v1.6.0 - Dia do Longão */}
      {runDays.length > 0 && (
        <div className="border-t pt-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-6 w-6 text-orange-600" />
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="font-semibold text-lg">{t('availability.longRunDay')}</h3>
                <AIFieldIcon
                  label="Dia do Longão"
                  importance="high"
                  impact="Distribuição de carga semanal e recuperação"
                  howUsed="Fixa o longão no dia escolhido e organiza outros treinos para maximizar recuperação"
                />
              </div>
              <p className="text-sm text-gray-600">{t('availability.longRunDayDesc')}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {runDays.map((dayIdx: number) => (
              <button 
                key={dayIdx} 
                onClick={() => toggleLongRunDay(dayIdx)}
                className={`px-2 py-3 text-sm font-medium rounded-lg transition-all ${
                  longRunDay === dayIdx
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg ring-2 ring-orange-300'
                    : 'border-2 border-gray-300 hover:border-orange-400 hover:bg-orange-50'
                }`}
              >
                {days[dayIdx]}
                {longRunDay === dayIdx && <div className="text-xs mt-1">🏃‍♂️ Longão</div>}
              </button>
            ))}
          </div>
          
          {longRunDay !== null && longRunDay !== undefined && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-900 font-medium">
                ✅ Seu treino longo será sempre {days[longRunDay]}
              </p>
            </div>
          )}
          
          {!longRunDay && longRunDay !== 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-900">
                ⚠️ Selecione o dia preferido para o seu treino longo (longão)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Botão Salvar */}
      {hasChanges && (
        <button
          onClick={handleSave}
          disabled={saving || runDays.length === 0}
          className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg">
          {saving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t('availability.savingAndAdjusting')}
            </>
          ) : (
            <>
              <Check className="h-5 w-5" />
              {t('availability.saveAndApply')}
            </>
          )}
        </button>
      )}

      {/* Status do Ajuste */}
      {adjustmentStatus && adjustmentStatus.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="font-medium text-green-900 mb-2">{t('availability.adjustmentApplied')}</p>
          <p className="text-sm text-green-800 mb-2">{adjustmentStatus.message}</p>
          {adjustmentStatus.deletedWorkouts > 0 && (
            <p className="text-xs text-green-700">
              {t('availability.workoutsDeleted', { count: adjustmentStatus.deletedWorkouts })}
            </p>
          )}
          {adjustmentStatus.action === 'REGENERATE_REQUIRED' && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
              <p className="text-sm text-orange-900">
                {t('availability.nextStep')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Aviso sobre Preservação */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-800">
          {t('availability.historyPreserved')}
        </p>
      </div>
    </div>
  );
}
