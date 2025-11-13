'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';

export default function Step4Health({ data, onUpdate, onNext, onBack }: any) {
  const t = useTranslations('onboarding.step4');
  const tCommon = useTranslations('common');
  
  // Detectar se o usuário nunca correu para ajustar as perguntas
  const isAbsoluteBeginner = data.hasRunBefore === false;
  
  // Lesões específicas de corrida
  const runningInjuries = [
    t('injuries.shinSplints'),
    t('injuries.plantarFasciitis'),
    t('injuries.achillesTendinitis'),
    t('injuries.runnersKnee'),
    t('injuries.itBand'),
    t('injuries.stressFracture'),
  ];
  
  // Lesões gerais (para quem nunca correu)
  const generalInjuries = [
    t('injuries.muscleStrain'),
    t('injuries.sprainAnkle'),
    t('injuries.sprainKnee'),
    t('injuries.backPain'),
    t('injuries.shoulderPain'),
    t('injuries.hipPain'),
  ];
  
  // Combinar ou usar apenas gerais
  const commonInjuries = isAbsoluteBeginner 
    ? [...generalInjuries, t('injuries.other')]
    : [...runningInjuries, ...generalInjuries, t('injuries.other')];
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
  
  // v2.5.0 - Novos campos para personalização avançada
  const [currentlyInjured, setCurrentlyInjured] = useState(data.currentlyInjured ?? false);
  const [avgSleepHours, setAvgSleepHours] = useState(data.avgSleepHours || '7');
  const [tracksMenstrualCycle, setTracksMenstrualCycle] = useState(data.tracksMenstrualCycle ?? false);
  const [lastPeriodDate, setLastPeriodDate] = useState(data.lastPeriodDate || '');
  const [avgCycleLength, setAvgCycleLength] = useState(data.avgCycleLength || '28');

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

  // Auto-save com debounce quando os dados mudam
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onUpdate({
        hasInjuryHistory,
        injuryHistory: hasInjuryHistory && injuries.length > 0 ? injuries : undefined,
        medicalClearance: doctorCleared,
        restingHeartRate: restingHeartRate ? parseInt(restingHeartRate) : null,
        sleepQuality,
        stressLevel,
        injuryDetails: injuryDetails.length > 0 ? injuryDetails : undefined,
        injuryRecoveryStatus: hasInjuryHistory && injuries.length > 0 ? injuryRecoveryStatus : undefined,
        lastInjuryDate: lastInjuryDate || undefined,
        // v2.5.0 - Novos campos
        currentlyInjured,
        avgSleepHours: avgSleepHours ? parseFloat(avgSleepHours) : undefined,
        tracksMenstrualCycle: data.gender === 'female' ? tracksMenstrualCycle : undefined,
        lastPeriodDate: (data.gender === 'female' && tracksMenstrualCycle && lastPeriodDate) ? lastPeriodDate : undefined,
        avgCycleLength: (data.gender === 'female' && tracksMenstrualCycle && avgCycleLength) ? parseInt(avgCycleLength) : undefined,
      });
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [
    hasInjuryHistory, injuries, doctorCleared, restingHeartRate, 
    sleepQuality, stressLevel, injuryDetails, injuryRecoveryStatus, 
    lastInjuryDate, onUpdate,
    // v2.5.0
    currentlyInjured, avgSleepHours, tracksMenstrualCycle, 
    lastPeriodDate, avgCycleLength, data.gender
  ]);

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
      // v2.5.0 - Novos campos
      currentlyInjured,
      avgSleepHours: avgSleepHours ? parseFloat(avgSleepHours) : undefined,
      tracksMenstrualCycle: data.gender === 'female' ? tracksMenstrualCycle : undefined,
      lastPeriodDate: (data.gender === 'female' && tracksMenstrualCycle && lastPeriodDate) ? lastPeriodDate : undefined,
      avgCycleLength: (data.gender === 'female' && tracksMenstrualCycle && avgCycleLength) ? parseInt(avgCycleLength) : undefined,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium mb-2">
          {isAbsoluteBeginner ? t('hasInjuriesBeginners') : t('hasInjuries')}
        </label>
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
              {stressLevel === 1 ? t('stressLevels.veryLow') : 
               stressLevel === 2 ? t('stressLevels.low') : 
               stressLevel === 3 ? t('stressLevels.moderate') : 
               stressLevel === 4 ? t('stressLevels.high') : 
               t('stressLevels.veryHigh')}
            </span>
          </label>
          <input type="range" min="1" max="5" value={stressLevel} onChange={(e) => setStressLevel(parseInt(e.target.value))}
            className="w-full" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{t('stressLevels.veryLow')}</span>
            <span>{t('stressLevels.veryHigh')}</span>
          </div>
        </div>
        
        {/* v2.5.0 - NOVOS CAMPOS PERSONALIZAÇÃO AVANÇADA */}
        <div className="border-t mt-6 pt-4 space-y-4">
          <h4 className="font-semibold text-sm text-gray-700">🎯 Personalização Avançada (v2.5.0)</h4>
          
          {/* Currently Injured */}
          <div>
            <label className="block font-medium mb-2">
              Você está com alguma lesão ATIVA no momento?
            </label>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setCurrentlyInjured(false)}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  !currentlyInjured 
                    ? 'bg-blue-600 text-white' 
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Não
              </button>
              <button 
                type="button"
                onClick={() => setCurrentlyInjured(true)}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  currentlyInjured 
                    ? 'bg-red-600 text-white' 
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Sim, estou lesionado(a)
              </button>
            </div>
            {currentlyInjured && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  ⚠️ Vamos criar um plano de recuperação gradual e seguro para você.
                  Recomendamos consultar um médico antes de iniciar.
                </p>
              </div>
            )}
          </div>
          
          {/* Average Sleep Hours */}
          <div>
            <label className="block font-medium mb-2">
              💤 Quantas horas você dorme por noite (em média)?
              <span className="text-sm text-gray-500 ml-2">Importante para recuperação</span>
            </label>
            <div className="relative">
              <input 
                type="number" 
                step="0.5"
                min="3" 
                max="12"
                value={avgSleepHours} 
                onChange={(e) => setAvgSleepHours(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="7"
              />
              <span className="absolute right-4 top-2.5 text-gray-500">horas</span>
            </div>
            <div className="mt-2 text-sm">
              {parseFloat(avgSleepHours) < 6 && (
                <p className="text-red-600">
                  🚨 Sono insuficiente! Ajustaremos o volume de treino para compensar.
                </p>
              )}
              {parseFloat(avgSleepHours) >= 6 && parseFloat(avgSleepHours) < 7 && (
                <p className="text-amber-600">
                  ⚠️ Sono no limite. Ideal seria 7-9 horas para melhor recuperação.
                </p>
              )}
              {parseFloat(avgSleepHours) >= 7 && parseFloat(avgSleepHours) <= 9 && (
                <p className="text-green-600">
                  ✅ Excelente! Sono adequado para recuperação otimizada.
                </p>
              )}
              {parseFloat(avgSleepHours) > 9 && (
                <p className="text-blue-600">
                  💯 Muito bom! Você tem capacidade de recuperação excelente.
                </p>
              )}
            </div>
          </div>
          
          {/* Menstrual Cycle Tracking (apenas mulheres) */}
          {data.gender === 'female' && (
            <div className="border-t pt-4 space-y-3">
              <div>
                <label className="block font-medium mb-2">
                  🌙 Deseja otimizar treinos baseado no ciclo menstrual?
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Podemos agendar treinos intensos nas fases mais favoráveis e ajustar 
                  durante outras fases para melhor performance e bem-estar.
                </p>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setTracksMenstrualCycle(false)}
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      !tracksMenstrualCycle 
                        ? 'bg-blue-600 text-white' 
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Não, obrigada
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTracksMenstrualCycle(true)}
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      tracksMenstrualCycle 
                        ? 'bg-purple-600 text-white' 
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Sim, quero otimizar
                  </button>
                </div>
              </div>
              
              {tracksMenstrualCycle && (
                <div className="space-y-3 mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Data da última menstruação
                    </label>
                    <input 
                      type="date" 
                      value={lastPeriodDate} 
                      onChange={(e) => setLastPeriodDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Duração média do ciclo (dias)
                    </label>
                    <input 
                      type="number" 
                      min="21" 
                      max="35"
                      value={avgCycleLength} 
                      onChange={(e) => setAvgCycleLength(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="28"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Geralmente entre 21-35 dias. Padrão: 28 dias.
                    </p>
                  </div>
                  
                  <div className="text-xs text-purple-700 space-y-1 mt-2">
                    <p>✨ <strong>Como funciona:</strong></p>
                    <p>• Fase Folicular (dias 6-14): Treinos intensos</p>
                    <p>• Fase Lútea (dias 15-28): Foco em volume</p>
                    <p>• Menstruação (dias 1-5): Ajuste por sensação</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button onClick={onBack} className="px-6 py-2 border rounded-lg hover:bg-gray-50">
          {tCommon('back')}
        </button>
        <button onClick={handleNext} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          {tCommon('next')}
        </button>
      </div>
    </div>
  );
}
