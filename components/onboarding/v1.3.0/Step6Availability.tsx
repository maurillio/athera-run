'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';
import AIFieldIcon from '@/components/ai-transparency/AIFieldIcon';
import AIFieldStatus from '@/components/ai-transparency/AIFieldStatus';
import { useFieldAnalysis } from '@/hooks/useFieldAnalysis';

interface DaySchedule {
  running: boolean;
  activities: string[];
}

export default function Step6Availability({ data, onUpdate, onNext, onBack }: any) {
  const t = useTranslations('onboarding.step6');
  const { getFieldStatus } = useFieldAnalysis();
  const tCommon = useTranslations('common');
  
  // Nova estrutura: schedule por dia com múltiplas atividades
  const [trainingSchedule, setTrainingSchedule] = useState<Record<number, DaySchedule>>(
    data.trainingSchedule || {}
  );
  
  // Lista de esportes customizados pelo usuário
  const [customActivities, setCustomActivities] = useState<string[]>(
    data.customActivities || []
  );
  
  // Modal para adicionar esporte
  const [showAddSportModal, setShowAddSportModal] = useState(false);
  const [newSportName, setNewSportName] = useState('');
  
  // v1.6.0 - Dia do Longão (lógica melhorada)
  const [longRunDay, setLongRunDay] = useState<number | null>(
    data.longRunDay !== undefined ? data.longRunDay : null
  );
  
  // Detecta se é iniciante (vem do Step 2)
  const runningLevel = data.runningLevel || '';
  const isBeginnerOrNever = ['beginner', 'iniciante', 'never_ran', 'nunca_correu'].includes(runningLevel.toLowerCase());
  
  // v1.3.0 - Infraestrutura
  const [hasGymAccess, setHasGymAccess] = useState(data.hasGymAccess ?? false);
  const [hasPoolAccess, setHasPoolAccess] = useState(data.hasPoolAccess ?? false);
  const [hasTrackAccess, setHasTrackAccess] = useState(data.hasTrackAccess ?? false);
  
  // v1.3.0 - Preferências de Treino (DESMARCADAS por padrão)
  const [soloTraining, setSoloTraining] = useState(
    data.trainingPreferences?.solo ?? false
  );
  const [groupTraining, setGroupTraining] = useState(
    data.trainingPreferences?.group ?? false
  );
  const [indoorPreference, setIndoorPreference] = useState(
    data.trainingPreferences?.indoor ?? false
  );
  const [outdoorPreference, setOutdoorPreference] = useState(
    data.trainingPreferences?.outdoor ?? false
  );
  
  const daysShort = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  const days = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado'
  ];
  
  // Atividades padrão + customizadas
  const defaultActivities = [
    { key: 'Musculação', label: 'Musculação', icon: '💪' },
    { key: 'Natação', label: 'Natação', icon: '🏊' },
    { key: 'Ciclismo', label: 'Ciclismo', icon: '🚴' },
    { key: 'Yoga', label: 'Yoga', icon: '🧘' },
    { key: 'Pilates', label: 'Pilates', icon: '🤸' },
    { key: 'Luta', label: 'Luta', icon: '🥋' },
  ];

  // Toggle corrida em um dia
  const toggleRunning = (dayIndex: number) => {
    setTrainingSchedule(prev => {
      const newSchedule = {
        ...prev,
        [dayIndex]: {
          running: !(prev[dayIndex]?.running || false),
          activities: prev[dayIndex]?.activities || []
        }
      };
      
      // Se desmarcar dia de corrida e era o dia do longão, limpa o longão
      if (!newSchedule[dayIndex].running && longRunDay === dayIndex) {
        setLongRunDay(null);
      }
      
      return newSchedule;
    });
  };

  // Toggle atividade em um dia
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

  // Adicionar esporte customizado
  const handleAddCustomSport = () => {
    if (newSportName.trim()) {
      const sportKey = newSportName.toLowerCase().replace(/\s+/g, '_');
      
      // Adiciona à lista de customizados se não existir
      if (!customActivities.includes(sportKey)) {
        setCustomActivities(prev => [...prev, sportKey]);
      }
      
      // Limpa e fecha
      setNewSportName('');
      setShowAddSportModal(false);
    }
  };

  // Remover esporte customizado
  const removeCustomActivity = (activity: string) => {
    setCustomActivities(prev => prev.filter(a => a !== activity));
    
    // Remove de todos os dias
    setTrainingSchedule(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(day => {
        updated[parseInt(day)].activities = updated[parseInt(day)].activities.filter(a => a !== activity);
      });
      return updated;
    });
  };

  // Auto-save com debounce
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
    // Validação: pelo menos 1 dia com alguma atividade
    const hasAnyActivity = Object.values(trainingSchedule).some(
      day => day.running || day.activities.length > 0
    );
    
    if (!hasAnyActivity) {
      alert('Por favor, selecione pelo menos um dia para treinar.');
      return;
    }
    
    // Validação: pelo menos uma preferência de treino (solo ou grupo)
    if (!soloTraining && !groupTraining) {
      alert('Por favor, selecione se prefere treinar sozinho, em grupo ou ambos.');
      return;
    }
    
    // Validação: pelo menos uma preferência de ambiente (indoor ou outdoor)
    if (!indoorPreference && !outdoorPreference) {
      alert('Por favor, selecione se prefere treinar indoor, outdoor ou ambos.');
      return;
    }
    
    // Validação do longão - APENAS para não-iniciantes
    const runningDays = Object.keys(trainingSchedule)
      .filter(day => trainingSchedule[parseInt(day)]?.running);
    
    if (runningDays.length > 0 && !isBeginnerOrNever) {
      // Corredores intermediários/avançados DEVEM escolher longão
      if (longRunDay === null) {
        alert('Por favor, escolha o dia da sua corrida longa (longão).');
        return;
      }
    }

    onNext();
  };

  // Obter label do esporte (default ou custom)
  const getActivityLabel = (key: string) => {
    const defaultActivity = defaultActivities.find(a => a.key === key);
    if (defaultActivity) return `${defaultActivity.icon} ${defaultActivity.label}`;
    
    // Customizado - formata o nome
    return key.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  // Obter dias com corrida para mostrar seleção de longão
  const runningDays = Object.keys(trainingSchedule)
    .filter(day => trainingSchedule[parseInt(day)]?.running)
    .map(day => parseInt(day));
  
  // Contador de dias para cada atividade
  const getActivityCount = (activityKey: string) => {
    return Object.values(trainingSchedule).filter(
      day => day.activities?.includes(activityKey)
    ).length;
  };

  return (
    <div className="space-y-6">
      {/* DISPONIBILIDADE SEMANAL - FORMATO COMPACTO HORIZONTAL */}
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
                  <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mb-1">
                    Qual dia será seu <strong>longão</strong>?
                    <AIFieldIcon
                      label="Dia do Longão"
                      importance="high"
                      impact="Distribuição de volume semanal"
                      howUsed="Organiza treinos para maximizar recuperação antes/depois"
                    />
                    {getFieldStatus('longRunDay') && (
                      <AIFieldStatus
                        status={getFieldStatus('longRunDay')!.status}
                        importance={getFieldStatus('longRunDay')!.importance}
                        label="Longão"
                        variant="compact"
                      />
                    )}
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

        {/* OUTRAS ATIVIDADES - COLAPSADAS */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
          <h4 className="font-bold text-gray-900 mb-3">🎯 Outras Atividades (opcional)</h4>
          <div className="space-y-2">
            {defaultActivities.map(activity => (
              <details key={activity.key} className="group">
                <summary className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 list-none">
                  <span className="font-medium">{activity.icon} {activity.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {getActivityCount(activity.key)} dias
                    </span>
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </div>
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
            
            {/* Esportes Customizados */}
            {customActivities.map(activity => (
              <details key={activity} className="group">
                <summary className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 list-none">
                  <span className="font-medium">{getActivityLabel(activity)}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      {getActivityCount(activity)} dias
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remover "${getActivityLabel(activity)}" da lista?`)) {
                          removeCustomActivity(activity);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </div>
                </summary>
                <div className="flex gap-2 justify-between mt-2 p-2">
                  {daysShort.map((dayShort, idx) => {
                    const isSelected = trainingSchedule[idx]?.activities?.includes(activity) || false;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleActivity(idx, activity)}
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
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all"
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
                <span>🏢 Indoor (Academia, pista coberta)</span>
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
                <span>🌳 Outdoor (Rua, parque, trilha)</span>
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
                  setAddingSportForDay(null);
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
