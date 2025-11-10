'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';

interface DaySchedule {
  running: boolean;
  activities: string[];
}

export default function Step6Availability({ data, onUpdate, onNext, onBack }: any) {
  const t = useTranslations('onboarding.step6');
  const tCommon = useTranslations('common');
  
  const [trainingSchedule, setTrainingSchedule] = useState<Record<number, DaySchedule>>(
    data.trainingSchedule || {}
  );
  
  const [customActivities, setCustomActivities] = useState<string[]>(
    data.customActivities || []
  );
  
  const [showAddSportModal, setShowAddSportModal] = useState(false);
  const [newSportName, setNewSportName] = useState('');
  
  const [longRunDay, setLongRunDay] = useState<number | null>(
    data.longRunDay !== undefined ? data.longRunDay : null
  );
  
  const runningLevel = data.runningLevel || '';
  const isBeginnerOrNever = ['beginner', 'iniciante', 'never_ran', 'nunca_correu'].includes(runningLevel.toLowerCase());
  
  const [hasGymAccess, setHasGymAccess] = useState(data.hasGymAccess ?? false);
  const [hasPoolAccess, setHasPoolAccess] = useState(data.hasPoolAccess ?? false);
  const [hasTrackAccess, setHasTrackAccess] = useState(data.hasTrackAccess ?? false);
  
  const [soloTraining, setSoloTraining] = useState(data.trainingPreferences?.solo ?? false);
  const [groupTraining, setGroupTraining] = useState(data.trainingPreferences?.group ?? false);
  const [indoorPreference, setIndoorPreference] = useState(data.trainingPreferences?.indoor ?? false);
  const [outdoorPreference, setOutdoorPreference] = useState(data.trainingPreferences?.outdoor ?? false);
  
  const daysShort = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  
  const defaultActivities = [
    { key: 'Musculação', label: 'Musculação', icon: '💪' },
    { key: 'Natação', label: 'Natação', icon: '🏊' },
    { key: 'Ciclismo', label: 'Ciclismo', icon: '🚴' },
    { key: 'Yoga', label: 'Yoga', icon: '🧘' },
    { key: 'Pilates', label: 'Pilates', icon: '🤸' },
    { key: 'Luta', label: 'Luta', icon: '🥋' },
  ];

  const toggleRunning = (dayIndex: number) => {
    setTrainingSchedule(prev => ({
      ...prev,
      [dayIndex]: {
        running: !(prev[dayIndex]?.running || false),
        activities: prev[dayIndex]?.activities || []
      }
    }));
  };

  const toggleActivity = (dayIndex: number, activity: string) => {
    setTrainingSchedule(prev => {
      const currentDay = prev[dayIndex] || { running: false, activities: [] };
      const activities = currentDay.activities.includes(activity)
        ? currentDay.activities.filter(a => a !== activity)
        : [...currentDay.activities, activity];
      
      return {
        ...prev,
        [dayIndex]: {
          ...currentDay,
          activities
        }
      };
    });
  };

  const handleAddCustomSport = () => {
    if (newSportName.trim()) {
      const sportKey = newSportName.toLowerCase().replace(/\s+/g, '_');
      if (!customActivities.includes(sportKey)) {
        setCustomActivities(prev => [...prev, sportKey]);
      }
      setNewSportName('');
      setShowAddSportModal(false);
    }
  };

  const removeCustomActivity = (activity: string) => {
    setCustomActivities(prev => prev.filter(a => a !== activity));
    setTrainingSchedule(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(day => {
        updated[parseInt(day)].activities = updated[parseInt(day)].activities.filter(a => a !== activity);
      });
      return updated;
    });
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onUpdate({
        trainingSchedule,
        customActivities,
        longRunDay,
        hasGymAccess,
        hasPoolAccess,
        hasTrackAccess,
        trainingPreferences: {
          solo: soloTraining,
          group: groupTraining,
          indoor: indoorPreference,
          outdoor: outdoorPreference,
        }
      });
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [
    trainingSchedule, customActivities, longRunDay,
    hasGymAccess, hasPoolAccess, hasTrackAccess,
    soloTraining, groupTraining, indoorPreference, outdoorPreference,
    onUpdate
  ]);

  const handleNext = () => {
    const hasAnyActivity = Object.values(trainingSchedule).some(
      day => day.running || day.activities.length > 0
    );
    
    if (!hasAnyActivity) {
      alert('Por favor, selecione pelo menos um dia para treinar.');
      return;
    }
    
    if (!soloTraining && !groupTraining) {
      alert('Por favor, selecione se prefere treinar sozinho, em grupo ou ambos.');
      return;
    }
    
    if (!indoorPreference && !outdoorPreference) {
      alert('Por favor, selecione se prefere treinar indoor, outdoor ou ambos.');
      return;
    }
    
    const runningDays = Object.keys(trainingSchedule)
      .filter(day => trainingSchedule[parseInt(day)]?.running);
    
    if (runningDays.length > 0 && !isBeginnerOrNever) {
      if (longRunDay === null) {
        alert('Por favor, escolha o dia da sua corrida longa (longão).');
        return;
      }
    }

    onNext();
  };

  const getActivityLabel = (key: string) => {
    const defaultActivity = defaultActivities.find(a => a.key === key);
    if (defaultActivity) return `${defaultActivity.icon} ${defaultActivity.label}`;
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Obter dias com corrida para mostrar seleção de longão
  const runningDays = Object.keys(trainingSchedule)
    .filter(day => trainingSchedule[parseInt(day)]?.running)
    .map(day => parseInt(day));

  return (
    <div className="space-y-6">
      {/* DISPONIBILIDADE SEMANAL - FORMATO COMPACTO */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-blue-900">
          📅 Disponibilidade Semanal
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Selecione os dias de cada atividade
        </p>
        
        {/* CORRIDA */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏃</span>
              <h4 className="font-bold text-gray-900">Corrida</h4>
            </div>
            <span className="text-xs text-gray-500">
              {runningDays.length} {runningDays.length === 1 ? 'dia' : 'dias'}
            </span>
          </div>
          
          <div className="flex gap-2 justify-between">
            {daysShort.map((dayShort, idx) => {
              const isSelected = trainingSchedule[idx]?.running || false;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleRunning(idx)}
                  className={`w-12 h-12 rounded-lg font-bold text-sm transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white border-2 border-blue-600'
                      : 'bg-gray-100 text-gray-400 border-2 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {dayShort}
                </button>
              );
            })}
          </div>
          
          {/* Seleção do Longão - APARECE LOGO ABAIXO QUANDO TEM DIAS */}
          {runningDays.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-start gap-2 mb-3">
                <span className="text-lg">💡</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Qual dia será seu <strong>longão</strong>?
                  </p>
                  <p className="text-xs text-gray-600">
                    {isBeginnerOrNever 
                      ? 'Iniciantes: pode deixar em branco por enquanto'
                      : 'O longão é sua corrida mais longa da semana (recomendado: fim de semana)'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {isBeginnerOrNever && (
                  <button
                    type="button"
                    onClick={() => setLongRunDay(null)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      longRunDay === null
                        ? 'bg-gray-600 text-white'
                        : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    Sem longão ainda
                  </button>
                )}
                
                {runningDays.map(dayIdx => {
                  const isWeekend = dayIdx === 0 || dayIdx === 6;
                  const isSelected = longRunDay === dayIdx;
                  return (
                    <button
                      key={dayIdx}
                      type="button"
                      onClick={() => setLongRunDay(dayIdx)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all relative ${
                        isSelected
                          ? 'bg-purple-600 text-white border-2 border-purple-600'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-400'
                      }`}
                    >
                      {days[dayIdx]}
                      {isWeekend && !isSelected && (
                        <span className="absolute -top-1 -right-1 text-xs">⭐</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* MUSCULAÇÃO */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💪</span>
              <h4 className="font-bold text-gray-900">Musculação</h4>
            </div>
            <span className="text-xs text-gray-500">
              {Object.values(trainingSchedule).filter(d => d.activities?.includes('Musculação')).length} dias
            </span>
          </div>
          
          <div className="flex gap-2 justify-between">
            {daysShort.map((dayShort, idx) => {
              const isSelected = trainingSchedule[idx]?.activities?.includes('Musculação') || false;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleActivity(idx, 'Musculação')}
                  className={`w-12 h-12 rounded-lg font-bold text-sm transition-all ${
                    isSelected
                      ? 'bg-green-600 text-white border-2 border-green-600'
                      : 'bg-gray-100 text-gray-400 border-2 border-gray-200 hover:border-green-300'
                  }`}
                >
                  {dayShort}
                </button>
              );
            })}
          </div>
        </div>

        {/* OUTRAS ATIVIDADES - COLAPSADAS */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
          <h4 className="font-bold text-gray-900 mb-3">🎯 Outras Atividades (opcional)</h4>
          <div className="space-y-2">
            {defaultActivities.filter(a => a.key !== 'Musculação').map(activity => (
              <details key={activity.key} className="group">
                <summary className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <span className="font-medium">{activity.icon} {activity.label}</span>
                  <span className="text-xs text-gray-500">
                    {Object.values(trainingSchedule).filter(d => d.activities?.includes(activity.key)).length} dias
                  </span>
                </summary>
                <div className="flex gap-2 justify-between mt-2 p-2">
                  {daysShort.map((dayShort, idx) => {
                    const isSelected = trainingSchedule[idx]?.activities?.includes(activity.key) || false;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleActivity(idx, activity.key)}
                        className={`w-12 h-12 rounded-lg font-bold text-sm transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-2 border-blue-600'
                            : 'bg-gray-100 text-gray-400 border-2 border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        {dayShort}
                      </button>
                    );
                  })}
                </div>
              </details>
            ))}
            
            <button
              type="button"
              onClick={() => setShowAddSportModal(true)}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600"
            >
              + Adicionar outro esporte
            </button>
          </div>
        </div>
      </div>

      {/* INFRAESTRUTURA */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4 text-blue-900">
          🏢 Infraestrutura Disponível
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={hasGymAccess}
              onChange={(e) => setHasGymAccess(e.target.checked)}
              className="w-5 h-5"
            />
            <span>🏋️ Academia</span>
          </label>
          <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={hasPoolAccess}
              onChange={(e) => setHasPoolAccess(e.target.checked)}
              className="w-5 h-5"
            />
            <span>🏊 Piscina</span>
          </label>
          <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={hasTrackAccess}
              onChange={(e) => setHasTrackAccess(e.target.checked)}
              className="w-5 h-5"
            />
            <span>🏃 Pista de Atletismo</span>
          </label>
        </div>
      </div>

      {/* PREFERÊNCIAS DE TREINO */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4 text-blue-900">
          ⚙️ Preferências de Treino <span className="text-red-600">*</span>
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-2">Como você prefere treinar?</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                soloTraining ? 'bg-blue-50 border-blue-500' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input
                  type="checkbox"
                  checked={soloTraining}
                  onChange={(e) => setSoloTraining(e.target.checked)}
                  className="w-5 h-5"
                />
                <span>🧍 Sozinho(a)</span>
              </label>
              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                groupTraining ? 'bg-blue-50 border-blue-500' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input
                  type="checkbox"
                  checked={groupTraining}
                  onChange={(e) => setGroupTraining(e.target.checked)}
                  className="w-5 h-5"
                />
                <span>👥 Em grupo</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block font-medium mb-2">Onde você prefere treinar?</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                indoorPreference ? 'bg-green-50 border-green-500' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input
                  type="checkbox"
                  checked={indoorPreference}
                  onChange={(e) => setIndoorPreference(e.target.checked)}
                  className="w-5 h-5"
                />
                <span>🏢 Indoor</span>
              </label>
              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                outdoorPreference ? 'bg-green-50 border-green-500' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input
                  type="checkbox"
                  checked={outdoorPreference}
                  onChange={(e) => setOutdoorPreference(e.target.checked)}
                  className="w-5 h-5"
                />
                <span>🌳 Outdoor</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL ADICIONAR ESPORTE */}
      {showAddSportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Adicionar Esporte Personalizado</h3>
            <input
              type="text"
              value={newSportName}
              onChange={(e) => setNewSportName(e.target.value)}
              placeholder="Ex: Crossfit, Dança, Escalada..."
              className="w-full px-4 py-2 border-2 rounded-lg mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomSport()}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddSportModal(false);
                  setNewSportName('');
                }}
                className="flex-1 px-4 py-2 border-2 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddCustomSport}
                disabled={!newSportName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
