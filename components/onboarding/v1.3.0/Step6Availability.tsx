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
  const [addingSportForDay, setAddingSportForDay] = useState<number | null>(null);
  
  // v1.6.0 - Dia do Longão (lógica melhorada)
  const [longRunDay, setLongRunDay] = useState<number | null>(
    data.longRunDay !== undefined ? data.longRunDay : null
  );
  const [noLongRunYet, setNoLongRunYet] = useState(false); // "Ainda não faço longões"
  
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
    { key: 'musculacao', label: '💪 Musculação', icon: '💪' },
    { key: 'yoga', label: '🧘 Yoga', icon: '🧘' },
    { key: 'pilates', label: '🤸 Pilates', icon: '🤸' },
    { key: 'natacao', label: '🏊 Natação', icon: '🏊' },
    { key: 'ciclismo', label: '🚴 Ciclismo', icon: '🚴' },
    { key: 'luta', label: '🥋 Luta', icon: '🥋' },
  ];

  // Toggle corrida em um dia
  const toggleRunning = (dayIndex: number) => {
    setTrainingSchedule(prev => ({
      ...prev,
      [dayIndex]: {
        running: !(prev[dayIndex]?.running || false),
        activities: prev[dayIndex]?.activities || []
      }
    }));
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
    if (newSportName.trim() && addingSportForDay !== null) {
      const sportKey = newSportName.toLowerCase().replace(/\s+/g, '_');
      
      // Adiciona à lista de customizados se não existir
      if (!customActivities.includes(sportKey)) {
        setCustomActivities(prev => [...prev, sportKey]);
      }
      
      // Adiciona ao dia
      toggleActivity(addingSportForDay, sportKey);
      
      // Limpa e fecha
      setNewSportName('');
      setShowAddSportModal(false);
      setAddingSportForDay(null);
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
        alert('Por favor, escolha o dia da sua corrida longa (longão) ou marque que ainda não faz corridas longas.');
        return;
      }
    }

    onNext();
  };

  // Obter label do esporte (default ou custom)
  const getActivityLabel = (key: string) => {
    const defaultActivity = defaultActivities.find(a => a.key === key);
    if (defaultActivity) return defaultActivity.label;
    
    // Customizado - formata o nome
    return key.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* DISPONIBILIDADE SEMANAL */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-blue-900">
          📅 Disponibilidade Semanal
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Selecione os dias e atividades que você pode fazer. Você pode escolher múltiplas atividades no mesmo dia.
        </p>
        
        <div className="space-y-3">
          {days.map((day, dayIndex) => {
            const daySchedule = trainingSchedule[dayIndex] || { running: false, activities: [] };
            const allActivities = [...defaultActivities.map(a => a.key), ...customActivities];
            
            return (
              <div key={dayIndex} className="border-2 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{day}</h4>
                  {longRunDay === dayIndex && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      🏃 Dia do Longão
                    </span>
                  )}
                </div>
                
                {/* Corrida */}
                <div className="mb-2">
                  <button
                    type="button"
                    onClick={() => toggleRunning(dayIndex)}
                    className={`w-full text-left px-4 py-2 rounded-lg border-2 transition-all ${
                      daySchedule.running
                        ? 'bg-blue-50 border-blue-500 text-blue-900'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-lg">🏃</span> Corrida
                  </button>
                </div>
                
                {/* Outras Atividades */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {allActivities.map(activity => (
                    <button
                      key={activity}
                      type="button"
                      onClick={() => toggleActivity(dayIndex, activity)}
                      className={`text-left px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                        daySchedule.activities.includes(activity)
                          ? 'bg-green-50 border-green-500 text-green-900'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      {getActivityLabel(activity)}
                      {customActivities.includes(activity) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Remover "${getActivityLabel(activity)}" da lista?`)) {
                              removeCustomActivity(activity);
                            }
                          }}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Adicionar Esporte */}
                <button
                  type="button"
                  onClick={() => {
                    setAddingSportForDay(dayIndex);
                    setShowAddSportModal(true);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  + Adicionar outro esporte
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SEÇÃO DO LONGÃO - SEPARADA E INTELIGENTE */}
      {(() => {
        // Obter dias com corrida
        const runningDays = Object.keys(trainingSchedule)
          .filter(day => trainingSchedule[parseInt(day)]?.running)
          .map(day => parseInt(day));
        
        // Só mostra se tem pelo menos 1 dia de corrida
        if (runningDays.length === 0) return null;
        
        return (
          <div className="border-t pt-6">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-purple-300">
              <h3 className="text-lg font-semibold mb-3 text-purple-900">
                📅 Dia do Longão (Corrida Longa Semanal)
              </h3>
              
              {/* Texto educacional baseado no nível */}
              <div className="bg-white/70 p-4 rounded-lg mb-4 text-sm">
                <p className="flex items-start gap-2">
                  <span className="text-xl">💡</span>
                  <span>
                    {isBeginnerOrNever ? (
                      <>
                        <strong>Para iniciantes:</strong> O longão virá naturalmente com sua evolução. 
                        Por enquanto, foque em criar o hábito de correr regularmente. 
                        Você pode pular esta etapa por enquanto.
                      </>
                    ) : runningLevel.toLowerCase().includes('intermediario') || runningLevel.toLowerCase().includes('intermediate') ? (
                      <>
                        <strong>Para intermediários:</strong> O longão é sua corrida mais longa da semana, 
                        geralmente 30-40% do seu volume semanal total. É essencial para construir 
                        resistência aeróbica.
                      </>
                    ) : (
                      <>
                        <strong>Para corredores experientes:</strong> Seu longão é fundamental para 
                        desenvolver resistência e preparar o corpo para distâncias maiores. 
                        Recomendamos fim de semana quando você tem mais tempo.
                      </>
                    )}
                  </span>
                </p>
              </div>
              
              <label className="block font-medium mb-3">
                Escolha o dia da sua corrida longa:
                {!isBeginnerOrNever && <span className="text-red-600 ml-1">*</span>}
              </label>
              
              <div className="space-y-2">
                {days.map((day, dayIndex) => {
                  // Só mostra dias com corrida
                  if (!runningDays.includes(dayIndex)) return null;
                  
                  const isWeekend = dayIndex === 0 || dayIndex === 6; // Dom ou Sáb
                  
                  return (
                    <label
                      key={dayIndex}
                      className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all ${
                        longRunDay === dayIndex
                          ? 'bg-purple-100 border-2 border-purple-500'
                          : 'bg-white border-2 border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="longRunDay"
                        checked={longRunDay === dayIndex}
                        onChange={() => {
                          setLongRunDay(dayIndex);
                          setNoLongRunYet(false);
                        }}
                        className="w-5 h-5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{day}</span>
                          {isWeekend && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              Recomendado
                            </span>
                          )}
                        </div>
                        {isWeekend && (
                          <p className="text-xs text-gray-600 mt-1">
                            Ideal: você terá mais tempo e poderá correr com calma
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
                
                {/* Opção "Ainda não faço longões" - APENAS para iniciantes */}
                {isBeginnerOrNever && (
                  <label
                    className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all ${
                      noLongRunYet
                        ? 'bg-gray-100 border-2 border-gray-400'
                        : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={noLongRunYet}
                      onChange={(e) => {
                        setNoLongRunYet(e.target.checked);
                        if (e.target.checked) {
                          setLongRunDay(null);
                        }
                      }}
                      className="w-5 h-5"
                    />
                    <span className="text-sm">
                      Ainda não faço corridas longas (vou construir isso gradualmente)
                    </span>
                  </label>
                )}
              </div>
            </div>
          </div>
        );
      })()}

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
