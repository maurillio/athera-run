'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';

export default function Step6Availability({ data, onUpdate, onNext, onBack }: any) {
  const t = useTranslations('onboarding.step6');
  const tCommon = useTranslations('common');
  const [runDays, setRunDays] = useState(data.availableDays?.running || []);
  const [otherActivities, setOtherActivities] = useState(data.availableDays?.other || {});
  
  // v1.6.0 - Dia do Longão
  const [longRunDay, setLongRunDay] = useState<number | null>(
    data.longRunDay !== undefined ? data.longRunDay : null
  );
  
  // v1.3.0 - Infraestrutura
  const [hasGymAccess, setHasGymAccess] = useState(data.hasGymAccess ?? false);
  const [hasPoolAccess, setHasPoolAccess] = useState(data.hasPoolAccess ?? false);
  const [hasTrackAccess, setHasTrackAccess] = useState(data.hasTrackAccess ?? false);
  
  // v1.3.0 - Preferências de Treino
  const [trainingLocations, setTrainingLocations] = useState<string[]>(
    data.trainingPreferences?.locations || []
  );
  const [preferredLocation, setPreferredLocation] = useState(
    data.trainingPreferences?.preferred || 'rua'
  );
  const [groupTraining, setGroupTraining] = useState(
    data.trainingPreferences?.groupTraining ?? false
  );
  const [indoorOutdoor, setIndoorOutdoor] = useState(
    data.trainingPreferences?.indoorOutdoor || 'outdoor'
  );
  
  const days = [
    t('daysOfWeek.sunday'),
    t('daysOfWeek.monday'),
    t('daysOfWeek.tuesday'),
    t('daysOfWeek.wednesday'),
    t('daysOfWeek.thursday'),
    t('daysOfWeek.friday'),
    t('daysOfWeek.saturday')
  ];
  const activities = [
    { key: 'gym', label: t('activities.gym') },
    { key: 'yoga', label: t('activities.yoga') },
    { key: 'cycling', label: t('activities.cycling') },
    { key: 'swimming', label: t('activities.swimming') },
  ];

  const toggleRunDay = (idx: number) => {
    setRunDays(runDays.includes(idx) ? runDays.filter((d: number) => d !== idx) : [...runDays, idx].sort());
  };

  const toggleActivity = (activity: string, day: number) => {
    const current = otherActivities[activity] || [];
    const updated = current.includes(day) 
      ? current.filter((d: number) => d !== day)
      : [...current, day].sort();
    
    setOtherActivities({
      ...otherActivities,
      [activity]: updated.length > 0 ? updated : undefined
    });
  };

  const toggleLocation = (location: string) => {
    setTrainingLocations(prev => 
      prev.includes(location) 
        ? prev.filter(l => l !== location) 
        : [...prev, location]
    );
  };

  // Auto-save com debounce quando os dados mudam
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const cleanOther = Object.fromEntries(
        Object.entries(otherActivities).filter(([_, days]: [string, any]) => days && days.length > 0)
      );

      onUpdate({
        // v1.6.0 - Padronização: usar apenas trainingActivities
        trainingActivities: runDays,
        availableDays: {
          other: Object.keys(cleanOther).length > 0 ? cleanOther : undefined
        },
        longRunDay: longRunDay, // v1.6.0
        hasGymAccess,
        hasPoolAccess,
        hasTrackAccess,
        trainingPreferences: {
          locations: trainingLocations.length > 0 ? trainingLocations : ['rua'],
          preferred: preferredLocation,
          groupTraining,
          indoorOutdoor,
        }
      });
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [
    runDays, otherActivities, longRunDay, hasGymAccess, hasPoolAccess, hasTrackAccess,
    trainingLocations, preferredLocation, groupTraining, indoorOutdoor, onUpdate
  ]);

  const handleNext = () => {
    if (runDays.length === 0) return;
    
    const cleanOther = Object.fromEntries(
      Object.entries(otherActivities).filter(([_, days]: [string, any]) => days && days.length > 0)
    );

    onUpdate({
      // v1.6.0 - Padronização: usar apenas trainingActivities
      trainingActivities: runDays,
      availableDays: {
        other: Object.keys(cleanOther).length > 0 ? cleanOther : undefined
      },
      // v1.6.0 - Dia do Longão
      longRunDay: longRunDay,
      // v1.3.0 - Infraestrutura
      hasGymAccess,
      hasPoolAccess,
      hasTrackAccess,
      // v1.3.0 - Preferências
      trainingPreferences: {
        locations: trainingLocations.length > 0 ? trainingLocations : ['rua'],
        preferred: preferredLocation,
        groupTraining,
        indoorOutdoor,
      }
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-semibold mb-3 text-blue-900">🏃 {t('trainingDaysTitle')} *</label>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
          {days.map((day, idx) => (
            <button key={idx}
              onClick={() => toggleRunDay(idx)}
              className={`px-3 py-3 text-sm font-medium rounded-lg transition-all ${
                runDays.includes(idx)
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:border-blue-400'
              }`}>
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
        {runDays.length > 0 && (
          <p className="text-sm text-gray-600 mt-2">✓ {runDays.length} dia(s) de corrida selecionado(s)</p>
        )}
      </div>

      {/* v1.6.0 - Dia do Longão */}
      {runDays.length > 0 && (
        <div className="border-t pt-6">
          <label className="block font-semibold mb-3 text-blue-900">
            🏃‍♂️ {t('longRunDayTitle')} *
          </label>
          <p className="text-sm text-gray-600 mb-3">
            {t('longRunDayDescription')}
          </p>
          
          <select
            value={longRunDay !== null && longRunDay !== undefined ? longRunDay : ''}
            onChange={(e) => {
              const day = e.target.value === '' ? null : parseInt(e.target.value);
              setLongRunDay(day);
            }}
            className="w-full px-4 py-2 border-2 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">{t('selectLongRunDay')}</option>
            {runDays.map((dayIdx: number) => (
              <option key={dayIdx} value={dayIdx}>
                {days[dayIdx]}
              </option>
            ))}
          </select>
          
          {longRunDay !== null && longRunDay !== undefined && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">
                ✅ Seu treino longo será sempre {days[longRunDay]}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="border-t pt-6">
        <label className="block font-semibold mb-3">Outras Atividades (Opcional)</label>
        <p className="text-sm text-gray-600 mb-4">
          Selecione os dias que você faz outras atividades. <strong>Elas NÃO serão adicionadas automaticamente ao seu plano.</strong>
        </p>
        
        {activities.map(({ key, label }) => (
          <div key={key} className="mb-4">
            <p className="text-sm font-medium mb-2">{label}</p>
            <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
              {days.map((day, idx) => (
                <button key={idx}
                  onClick={() => toggleActivity(key, idx)}
                  disabled={runDays.includes(idx)}
                  className={`px-2 py-2 text-xs rounded transition-all ${
                    runDays.includes(idx)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : (otherActivities[key]?.includes(idx))
                        ? 'bg-green-500 text-white'
                        : 'border border-gray-300 hover:border-green-400'
                  }`}>
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* v1.3.0 - Infraestrutura Disponível */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="font-semibold text-lg">🏗️ Infraestrutura Disponível</h3>
        <p className="text-sm text-gray-600 mb-4">
          Marque os recursos que você tem acesso. Isso ajuda a IA a personalizar seu treino.
        </p>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={hasGymAccess}
              onChange={(e) => setHasGymAccess(e.target.checked)}
              className="w-5 h-5"
            />
            <div>
              <p className="font-medium">Academia / Musculação</p>
              <p className="text-sm text-gray-600">Para treinos de força e fortalecimento</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={hasPoolAccess}
              onChange={(e) => setHasPoolAccess(e.target.checked)}
              className="w-5 h-5"
            />
            <div>
              <p className="font-medium">Piscina / Natação</p>
              <p className="text-sm text-gray-600">Para treinos complementares e recuperação</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={hasTrackAccess}
              onChange={(e) => setHasTrackAccess(e.target.checked)}
              className="w-5 h-5"
            />
            <div>
              <p className="font-medium">Pista de Atletismo</p>
              <p className="text-sm text-gray-600">Para treinos de velocidade e intervalados</p>
            </div>
          </label>
        </div>
      </div>

      {/* v1.3.0 - Preferências de Treino */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="font-semibold text-lg">⚙️ Preferências de Treino</h3>
        
        <div>
          <label className="block font-medium mb-2">Onde você prefere treinar?</label>
          <p className="text-sm text-gray-600 mb-3">Pode selecionar mais de uma opção</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'rua', label: '🛣️ Rua / Asfalto' },
              { value: 'pista', label: '🏃 Pista de Atletismo' },
              { value: 'esteira', label: '🏋️ Esteira' },
              { value: 'trilha', label: '🌲 Trilha / Terra' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => toggleLocation(value)}
                className={`px-4 py-3 text-sm rounded-lg transition-all ${
                  trainingLocations.includes(value)
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:border-blue-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {trainingLocations.length > 1 && (
          <div>
            <label className="block font-medium mb-2">Local preferido (principal)</label>
            <select
              value={preferredLocation}
              onChange={(e) => setPreferredLocation(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {trainingLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc === 'rua' ? 'Rua / Asfalto' : 
                   loc === 'pista' ? 'Pista de Atletismo' :
                   loc === 'esteira' ? 'Esteira' : 'Trilha / Terra'}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block font-medium mb-2">Preferência de treino</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setGroupTraining(false)}
              className={`px-4 py-3 text-sm rounded-lg transition-all ${
                !groupTraining
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:border-blue-400'
              }`}
            >
              🏃 Solo
            </button>
            <button
              onClick={() => setGroupTraining(true)}
              className={`px-4 py-3 text-sm rounded-lg transition-all ${
                groupTraining
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:border-blue-400'
              }`}
            >
              👥 Em Grupo
            </button>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-2">Ambiente preferido</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIndoorOutdoor('outdoor')}
              className={`px-4 py-3 text-sm rounded-lg transition-all ${
                indoorOutdoor === 'outdoor'
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:border-blue-400'
              }`}
            >
              ☀️ Outdoor
            </button>
            <button
              onClick={() => setIndoorOutdoor('indoor')}
              className={`px-4 py-3 text-sm rounded-lg transition-all ${
                indoorOutdoor === 'indoor'
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:border-blue-400'
              }`}
            >
              🏢 Indoor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
