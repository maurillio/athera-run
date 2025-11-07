'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Check, AlertCircle, Calendar } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/hooks';

export default function AvailabilityTab({ userData, onUpdate }: any) {
  const t = useTranslations('profile');
  
  // v1.6.0 - Padronização: ler apenas de trainingActivities
  const [runDays, setRunDays] = useState(
    userData.trainingActivities || []
  );
  const [strengthDays, setStrengthDays] = useState(userData.availableDays?.strength || []);
  const [swimmingDays, setSwimmingDays] = useState(userData.availableDays?.swimming || []);
  const [crossTrainingDays, setCrossTrainingDays] = useState(userData.availableDays?.crossTraining || []);
  const [yogaDays, setYogaDays] = useState(userData.availableDays?.yoga || []);
  
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
      // Atualizar disponibilidade (v1.6.0 - Apenas trainingActivities)
      await onUpdate({
        trainingActivities: runDays,
        availableDays: {
          strength: strengthDays.length > 0 ? strengthDays : null,
          swimming: swimmingDays.length > 0 ? swimmingDays : null,
          crossTraining: crossTrainingDays.length > 0 ? crossTrainingDays : null,
          yoga: yogaDays.length > 0 ? yogaDays : null
        },
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
        <label className="block font-semibold mb-2 text-lg">{t('availability.runningDaysLabel')}</label>
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
            <div>
              <h3 className="font-semibold text-lg">{t('availability.longRunDay')}</h3>
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

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4 text-lg">{t('availability.complementaryTitle')}</h3>
        <p className="text-sm text-gray-600 mb-4">
          {t('availability.complementaryDesc')}
        </p>

        {/* Musculação */}
        <div className="mb-4">
          <label className="block font-medium mb-2">{t('availability.strength')}</label>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => (
              <button key={idx} onClick={() => toggleDay(idx, strengthDays, setStrengthDays)}
                className={`px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                  strengthDays.includes(idx)
                    ? 'bg-purple-600 text-white'
                    : 'border border-gray-300 hover:border-purple-400'
                }`}>
                {day}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {strengthDays.length > 0 ? t('availability.daysSelected', { count: strengthDays.length }) : t('availability.noDaysSelected')}
          </p>
        </div>

        {/* Natação */}
        <div className="mb-4">
          <label className="block font-medium mb-2">{t('availability.swimming')}</label>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => (
              <button key={idx} onClick={() => toggleDay(idx, swimmingDays, setSwimmingDays)}
                className={`px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                  swimmingDays.includes(idx)
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:border-blue-400'
                }`}>
                {day}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {swimmingDays.length > 0 ? t('availability.daysSelected', { count: swimmingDays.length }) : t('availability.noDaysSelected')}
          </p>
        </div>

        {/* Cross Training */}
        <div className="mb-4">
          <label className="block font-medium mb-2">{t('availability.crossTraining')}</label>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => (
              <button key={idx} onClick={() => toggleDay(idx, crossTrainingDays, setCrossTrainingDays)}
                className={`px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                  crossTrainingDays.includes(idx)
                    ? 'bg-green-600 text-white'
                    : 'border border-gray-300 hover:border-green-400'
                }`}>
                {day}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {crossTrainingDays.length > 0 ? t('availability.daysSelected', { count: crossTrainingDays.length }) : t('availability.noDaysSelected')}
          </p>
        </div>

        {/* Yoga */}
        <div>
          <label className="block font-medium mb-2">{t('availability.yoga')}</label>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => (
              <button key={idx} onClick={() => toggleDay(idx, yogaDays, setYogaDays)}
                className={`px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                  yogaDays.includes(idx)
                    ? 'bg-pink-600 text-white'
                    : 'border border-gray-300 hover:border-pink-400'
                }`}>
                {day}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {yogaDays.length > 0 ? t('availability.daysSelected', { count: yogaDays.length }) : t('availability.noDaysSelected')}
          </p>
        </div>
      </div>

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
