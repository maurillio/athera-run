'use client';
import { useState } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';
import AIFieldIcon from '@/components/ai-transparency/AIFieldIcon';

export default function HealthTab({ userData, onUpdate }: any) {
  const t = useTranslations('profile.health');
  const [hasInjuryHistory, setHasInjuryHistory] = useState(userData.hasInjuryHistory ?? false);
  const [injuries, setInjuries] = useState(userData.injuryHistory || []);
  const [medicalClearance, setMedicalClearance] = useState(userData.medicalClearance ?? true);
  
  // v1.3.0 - Dados fisiológicos
  const [restingHeartRate, setRestingHeartRate] = useState(userData.restingHeartRate || '');
  const [sleepQuality, setSleepQuality] = useState(userData.sleepQuality || 3);
  const [stressLevel, setStressLevel] = useState(userData.stressLevel || 3);
  
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    onUpdate({
      hasInjuryHistory,
      injuryHistory: hasInjuryHistory && injuries.length > 0 ? injuries : null,
      medicalClearance,
      // v1.3.0 - Dados fisiológicos
      restingHeartRate: restingHeartRate ? parseInt(restingHeartRate) : null,
      sleepQuality,
      stressLevel,
    });
    setHasChanges(false);
  };

  const addInjury = (injury: string) => {
    setInjuries([...injuries, injury]);
    setHasChanges(true);
  };

  const removeInjury = (idx: number) => {
    setInjuries(injuries.filter((_: any, i: number) => i !== idx));
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="flex items-center font-medium mb-2">
          {t('injuryHistory.label')}
          <AIFieldIcon
            label="Histórico de Lesões"
            importance="high"
            impact="Prevenção e ajuste de volume"
            howUsed="Reduz ritmo de progressão e inclui treinos preventivos baseados no histórico"
          />
        </label>
        <div className="flex gap-4">
          <button onClick={() => { setHasInjuryHistory(false); setHasChanges(true); }}
            className={`px-6 py-2 rounded-lg ${!hasInjuryHistory ? 'bg-green-600 text-white' : 'border'}`}>
            {t('injuryHistory.noInjuries')}
          </button>
          <button onClick={() => { setHasInjuryHistory(true); setHasChanges(true); }}
            className={`px-6 py-2 rounded-lg ${hasInjuryHistory ? 'bg-orange-600 text-white' : 'border'}`}>
            {t('injuryHistory.withInjuries')}
          </button>
        </div>
      </div>

      {hasInjuryHistory && injuries.length > 0 && (
        <div className="space-y-2">
          {injuries.map((inj: string, idx: number) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <span>{inj}</span>
              <button 
                onClick={() => removeInjury(idx)} 
                className="text-red-600 hover:text-red-800"
                title={t('injuryHistory.remove')}
              >×</button>
            </div>
          ))}
        </div>
      )}

      {/* v1.3.0 - Dados Fisiológicos */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="font-semibold">{t('physiological.title')}</h3>
        
        <div>
          <label className="flex items-center text-sm font-medium mb-2">
            {t('physiological.restingHR.label')}
            <AIFieldIcon
              label="FC em Repouso"
              importance="high"
              impact="Zonas de FC e condicionamento cardiovascular"
              howUsed="Calcula zonas de FC usando fórmula de Karvonen para personalizar intensidade dos treinos"
            />
            <span className="text-gray-500 ml-2">{t('physiological.restingHR.help')}</span>
          </label>
          <input type="number" value={restingHeartRate} 
            onChange={(e) => { setRestingHeartRate(e.target.value); setHasChanges(true); }}
            placeholder={t('physiological.restingHR.placeholder')} min="40" max="100"
            className="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium mb-2">
            {t('physiological.sleepQuality.label')}: {
              sleepQuality === 1 ? t('physiological.sleepQuality.level1') :
              sleepQuality === 2 ? t('physiological.sleepQuality.level2') :
              sleepQuality === 3 ? t('physiological.sleepQuality.level3') :
              sleepQuality === 4 ? t('physiological.sleepQuality.level4') :
              t('physiological.sleepQuality.level5')
            }
            <AIFieldIcon
              label="Qualidade do Sono"
              importance="medium"
              impact="Capacidade de recuperação e adaptação"
              howUsed="Ajusta volume e intensidade baseado na recuperação. Sono ruim = treino mais leve"
            />
          </label>
          <input type="range" min="1" max="5" value={sleepQuality} 
            onChange={(e) => { setSleepQuality(parseInt(e.target.value)); setHasChanges(true); }}
            className="w-full" />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium mb-2">
            {t('physiological.stressLevel.label')}: {
              stressLevel === 1 ? t('physiological.stressLevel.level1') :
              stressLevel === 2 ? t('physiological.stressLevel.level2') :
              stressLevel === 3 ? t('physiological.stressLevel.level3') :
              stressLevel === 4 ? t('physiological.stressLevel.level4') :
              t('physiological.stressLevel.level5')
            }
            <AIFieldIcon
              label="Nível de Estresse"
              importance="medium"
              impact="Carga de treino total e risco de overtraining"
              howUsed="Alto estresse = redução de volume e intensidade para evitar sobrecarga"
            />
          </label>
          <input type="range" min="1" max="5" value={stressLevel} 
            onChange={(e) => { setStressLevel(parseInt(e.target.value)); setHasChanges(true); }}
            className="w-full" />
        </div>
      </div>

      <div className="border-t pt-6">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={medicalClearance} 
            onChange={(e) => { setMedicalClearance(e.target.checked); setHasChanges(true); }}
            className="w-5 h-5" />
          <span className="text-sm">{medicalClearance ? t('medicalClearance.yes') : t('medicalClearance.no')}</span>
          <AIFieldIcon
            label="Liberação Médica"
            importance="critical"
            impact="Segurança e responsabilidade legal"
            howUsed="Garante que o atleta está apto para treinar e previne problemas de saúde"
          />
        </label>
        {!medicalClearance && (
          <p className="text-sm text-orange-600 mt-2">{t('medicalClearance.warning')}</p>
        )}
      </div>

      {hasChanges && (
        <button onClick={handleSave}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
          {t('save', 'profile.saveChanges')}
        </button>
      )}
    </div>
  );
}
