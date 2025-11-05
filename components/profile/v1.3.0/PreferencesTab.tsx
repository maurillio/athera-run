'use client';
import { useState } from 'react';

export default function PreferencesTab({ userData, onUpdate }: any) {
  // v1.3.0 - Preferências de treino
  const trainingPrefs = userData.trainingPreferences || {};
  const motivationData = userData.motivationFactors || {};
  
  const [location, setLocation] = useState(trainingPrefs.location || ['rua']);
  const [groupTraining, setGroupTraining] = useState(trainingPrefs.groupTraining ?? false);
  const [indoorOutdoor, setIndoorOutdoor] = useState(trainingPrefs.indoorOutdoor || 'outdoor');
  
  const [primaryMotivation, setPrimaryMotivation] = useState(motivationData.primary || 'saude');
  const [goals, setGoals] = useState<string[]>(motivationData.goals || []);
  
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    onUpdate({
      trainingPreferences: {
        location,
        preference: location[0] || 'rua',
        groupTraining,
        indoorOutdoor
      },
      motivationFactors: {
        primary: primaryMotivation,
        goals
      }
    });
    setHasChanges(false);
  };

  const toggleLocation = (loc: string) => {
    if (location.includes(loc)) {
      setLocation(location.filter((l: string) => l !== loc));
    } else {
      setLocation([...location, loc]);
    }
    setHasChanges(true);
  };

  const toggleGoal = (goal: string) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter(g => g !== goal));
    } else {
      setGoals([...goals, goal]);
    }
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Preferências de Local */}
      <div>
        <label className="block font-medium mb-2">🏃 Onde Prefere Treinar?</label>
        <div className="grid grid-cols-2 gap-2">
          {['rua', 'pista', 'esteira', 'trilha'].map(loc => (
            <button key={loc} onClick={() => toggleLocation(loc)}
              className={`px-4 py-2 rounded-lg capitalize ${location.includes(loc) ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'}`}>
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Indoor/Outdoor */}
      <div>
        <label className="block font-medium mb-2">☀️ Preferência Geral</label>
        <div className="flex gap-4">
          <button onClick={() => { setIndoorOutdoor('outdoor'); setHasChanges(true); }}
            className={`px-6 py-2 rounded-lg ${indoorOutdoor === 'outdoor' ? 'bg-blue-600 text-white' : 'border'}`}>
            Ar Livre
          </button>
          <button onClick={() => { setIndoorOutdoor('indoor'); setHasChanges(true); }}
            className={`px-6 py-2 rounded-lg ${indoorOutdoor === 'indoor' ? 'bg-blue-600 text-white' : 'border'}`}>
            Indoor
          </button>
        </div>
      </div>

      {/* Treino em Grupo */}
      <div>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={groupTraining} 
            onChange={(e) => { setGroupTraining(e.target.checked); setHasChanges(true); }}
            className="w-5 h-5" />
          <span className="text-sm font-medium">👥 Gosto de treinar em grupo</span>
        </label>
      </div>

      {/* Motivação Principal */}
      <div className="border-t pt-6">
        <label className="block font-medium mb-2">💪 Motivação Principal</label>
        <select value={primaryMotivation} 
          onChange={(e) => { setPrimaryMotivation(e.target.value); setHasChanges(true); }}
          className="w-full px-4 py-2 border rounded-lg">
          <option value="saude">Saúde e Bem-estar</option>
          <option value="desafio">Desafio Pessoal</option>
          <option value="competicao">Competição</option>
          <option value="social">Socialização</option>
          <option value="estetica">Estética</option>
        </select>
      </div>

      {/* Objetivos Múltiplos */}
      <div>
        <label className="block font-medium mb-2">🎯 Objetivos (múltipla escolha)</label>
        <div className="grid grid-cols-2 gap-2">
          {['emagrecer', 'competir', 'melhorar_tempo', 'aumentar_distancia', 'prevenir_lesoes', 'aumentar_resistencia'].map(goal => (
            <button key={goal} onClick={() => toggleGoal(goal)}
              className={`px-3 py-2 text-sm rounded-lg capitalize ${goals.includes(goal) ? 'bg-green-600 text-white' : 'border hover:bg-gray-50'}`}>
              {goal.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {hasChanges && (
        <button onClick={handleSave}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
          💾 Salvar Preferências
        </button>
      )}
    </div>
  );
}
