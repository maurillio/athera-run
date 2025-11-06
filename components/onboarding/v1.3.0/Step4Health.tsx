'use client';
import { useState } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';

export default function Step4Health({ data, onUpdate, onNext, onBack }: any) {
  const t = useTranslations('onboarding.step4');
  const tCommon = useTranslations('common');
  
  const commonInjuries = [
    t('injuries.shinSplints'),
    t('injuries.plantarFasciitis'),
    t('injuries.achillesTendinitis'),
    t('injuries.runnersKnee'),
    t('injuries.itBand'),
    t('injuries.stressFracture'),
    t('injuries.muscleStrain'),
    t('injuries.other')
  ];
  const [hasInjuryHistory, setHasInjuryHistory] = useState(data.hasInjuryHistory ?? false);
  const [injuries, setInjuries] = useState(data.injuryHistory || []);
  const [currentInjury, setCurrentInjury] = useState('');
  const [doctorCleared, setDoctorCleared] = useState(data.medicalClearance ?? true);
  
  // v1.3.0 - Novos campos fisiológicos
  const [restingHeartRate, setRestingHeartRate] = useState(data.restingHeartRate || '');
  const [sleepQuality, setSleepQuality] = useState(data.sleepQuality || 3);
  const [stressLevel, setStressLevel] = useState(data.stressLevel || 3);
  
  // v1.3.0 - Lesões Detalhadas
  const [injuryDetails, setInjuryDetails] = useState<any[]>(data.injuryDetails || []);
  const [injuryRecoveryStatus, setInjuryRecoveryStatus] = useState(data.injuryRecoveryStatus || 'recovered');
  const [lastInjuryDate, setLastInjuryDate] = useState(data.lastInjuryDate || '');

  const addInjury = () => {
    if (!currentInjury.trim()) return;
    setInjuries([...injuries, currentInjury.trim()]);
    setCurrentInjury('');
  };

  const addDetailedInjury = (type: string) => {
    const newInjury = {
      type,
      date: lastInjuryDate || new Date().toISOString().split('T')[0],
      status: injuryRecoveryStatus,
      recurringRisk: 'médio',
    };
    setInjuryDetails([...injuryDetails, newInjury]);
  };

  const removeDetailedInjury = (index: number) => {
    setInjuryDetails(injuryDetails.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    onUpdate({
      hasInjuryHistory,
      injuryHistory: hasInjuryHistory && injuries.length > 0 ? injuries : undefined,
      medicalClearance: doctorCleared,
      // v1.3.0 - Dados fisiológicos
      restingHeartRate: restingHeartRate ? parseInt(restingHeartRate) : null,
      sleepQuality,
      stressLevel,
      // v1.3.0 - Lesões detalhadas
      injuryDetails: injuryDetails.length > 0 ? injuryDetails : undefined,
      injuryRecoveryStatus: hasInjuryHistory && injuries.length > 0 ? injuryRecoveryStatus : undefined,
      lastInjuryDate: lastInjuryDate || undefined,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
      </div>

      <div>
        <label className="block font-medium mb-2">{t('hasInjuries')}</label>
        <div className="flex gap-4">
          <button onClick={() => setHasInjuryHistory(false)}
            className={`px-6 py-2 rounded-lg ${!hasInjuryHistory ? 'bg-blue-600 text-white' : 'border'}`}>
            {tCommon('no')}
          </button>
          <button onClick={() => setHasInjuryHistory(true)}
            className={`px-6 py-2 rounded-lg ${hasInjuryHistory ? 'bg-blue-600 text-white' : 'border'}`}>
            {tCommon('yes')}
          </button>
        </div>
      </div>

      {hasInjuryHistory && (
        <div className="space-y-3">
          <label className="block font-medium">{t('whichInjuries')}</label>
          <div className="grid grid-cols-2 gap-2">
            {commonInjuries.map(inj => (
              <button key={inj}
                onClick={() => !injuries.includes(inj) && setInjuries([...injuries, inj])}
                className={`px-3 py-2 text-sm rounded-lg ${injuries.includes(inj) ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'}`}>
                {inj}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input type="text" value={currentInjury} onChange={(e) => setCurrentInjury(e.target.value)}
              placeholder={t('otherInjuryPlaceholder')} className="flex-1 px-4 py-2 border rounded-lg"
              onKeyPress={(e) => e.key === 'Enter' && addInjury()} />
            <button onClick={addInjury} className="px-4 py-2 bg-blue-600 text-white rounded-lg">+</button>
          </div>

          {injuries.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {injuries.map((inj: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center gap-2">
                  {inj}
                  <button onClick={() => setInjuries(injuries.filter((_: string, i: number) => i !== idx))}
                    className="hover:text-red-900">×</button>
                </span>
              ))}
            </div>
          )}

          {/* v1.3.0 - Detalhes das Lesões */}
          {injuries.length > 0 && (
            <div className="border-t mt-6 pt-4 space-y-3">
              <h4 className="font-semibold">{t('injuryDetailsTitle')}</h4>
              
              <div>
                <label className="block text-sm font-medium mb-2">{t('recoveryStatus')}</label>
                <select 
                  value={injuryRecoveryStatus} 
                  onChange={(e) => setInjuryRecoveryStatus(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="recovered">✅ {t('statusOptions.recovered')}</option>
                  <option value="recovering">🔄 {t('statusOptions.recovering')}</option>
                  <option value="active">⚠️ {t('statusOptions.active')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('lastInjuryDate')}</label>
                <input 
                  type="date" 
                  value={lastInjuryDate} 
                  onChange={(e) => setLastInjuryDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <button
                onClick={() => injuries.forEach((inj: string) => addDetailedInjury(inj))}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Salvar detalhes para análise da IA
              </button>

              {injuryDetails.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium">Lesões salvas com detalhes:</p>
                  {injuryDetails.map((detail, idx) => (
                    <div key={idx} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm flex justify-between items-center">
                      <span>
                        {detail.type} - {detail.status === 'recovered' ? '✅ Recuperado' : detail.status === 'recovering' ? '🔄 Recuperando' : '⚠️ Crônica'}
                        {detail.date && ` (${new Date(detail.date).toLocaleDateString('pt-BR')})`}
                      </span>
                      <button onClick={() => removeDetailedInjury(idx)} className="text-red-600 hover:text-red-800">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* v1.3.0 - Dados Fisiológicos */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="font-semibold text-lg">📊 Dados Fisiológicos</h3>
        
        <div>
          <label className="block font-medium mb-2">
            {t('restingHR')} ({tCommon('optional')})
            <span className="text-sm text-gray-500 ml-2">40-80 bpm</span>
          </label>
          <input type="number" value={restingHeartRate} onChange={(e) => setRestingHeartRate(e.target.value)}
            placeholder={t('restingHRPlaceholder')} min="40" max="100"
            className="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div>
          <label className="block font-medium mb-2">
            {t('sleepQuality')}
            <span className="text-sm text-gray-500 ml-2">
              {sleepQuality === 1 ? t('qualityLevels.veryPoor') : 
               sleepQuality === 2 ? t('qualityLevels.poor') : 
               sleepQuality === 3 ? t('qualityLevels.fair') : 
               sleepQuality === 4 ? t('qualityLevels.good') : 
               t('qualityLevels.excellent')}
            </span>
          </label>
          <input type="range" min="1" max="5" value={sleepQuality} onChange={(e) => setSleepQuality(parseInt(e.target.value))}
            className="w-full" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{t('qualityLevels.veryPoor')}</span>
            <span>{t('qualityLevels.excellent')}</span>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-2">
            {t('stressLevel')}
            <span className="text-sm text-gray-500 ml-2">
              {stressLevel === 1 ? t('qualityLevels.veryPoor') : 
               stressLevel === 2 ? t('qualityLevels.poor') : 
               stressLevel === 3 ? t('qualityLevels.fair') : 
               stressLevel === 4 ? t('qualityLevels.good') : 
               t('qualityLevels.veryGood')}
            </span>
          </label>
          <input type="range" min="1" max="5" value={stressLevel} onChange={(e) => setStressLevel(parseInt(e.target.value))}
            className="w-full" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{t('qualityLevels.veryPoor')}</span>
            <span>{t('qualityLevels.veryGood')}</span>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <label className="block font-medium mb-3">Liberação Médica</label>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
          <p className="text-sm text-yellow-800">
            ⚠️ Recomendamos check-up médico antes de iniciar treinos intensos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" checked={doctorCleared} onChange={(e) => setDoctorCleared(e.target.checked)}
            className="w-5 h-5" id="cleared" />
          <label htmlFor="cleared" className="text-sm">
            Estou liberado(a) para treinar / Sem restrições médicas
          </label>
        </div>
      </div>
    </div>
  );
}
