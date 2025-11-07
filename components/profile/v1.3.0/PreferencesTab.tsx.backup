'use client';
import { useState } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';

export default function PreferencesTab({ userData, onUpdate }: any) {
  const t = useTranslations('profile.preferences');
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
        <label className="block font-medium mb-2">{t('location.label')}</label>
        <div className="grid grid-cols-2 gap-2">
          {['street', 'track', 'treadmill', 'trail'].map(loc => (
            <button key={loc} onClick={() => toggleLocation(loc === 'street' ? 'rua' : loc === 'track' ? 'pista' : loc === 'treadmill' ? 'esteira' : 'trilha')}
              className={`px-4 py-2 rounded-lg capitalize ${location.includes(loc === 'street' ? 'rua' : loc === 'track' ? 'pista' : loc === 'treadmill' ? 'esteira' : 'trilha') ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'}`}>
              {t(`location.${loc}` as any)}
            </button>
          ))}
        </div>
      </div>

      {/* Indoor/Outdoor */}
      <div>
        <label className="block font-medium mb-2">{t('environment.label')}</label>
        <div className="flex gap-4">
          <button onClick={() => { setIndoorOutdoor('outdoor'); setHasChanges(true); }}
            className={`px-6 py-2 rounded-lg ${indoorOutdoor === 'outdoor' ? 'bg-blue-600 text-white' : 'border'}`}>
            {t('environment.outdoor')}
          </button>
          <button onClick={() => { setIndoorOutdoor('indoor'); setHasChanges(true); }}
            className={`px-6 py-2 rounded-lg ${indoorOutdoor === 'indoor' ? 'bg-blue-600 text-white' : 'border'}`}>
            {t('environment.indoor')}
          </button>
        </div>
      </div>

      {/* Treino em Grupo */}
      <div>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={groupTraining} 
            onChange={(e) => { setGroupTraining(e.target.checked); setHasChanges(true); }}
            className="w-5 h-5" />
          <span className="text-sm font-medium">{t('groupTraining.label')}</span>
        </label>
      </div>

      {/* Motivação Principal */}
      <div className="border-t pt-6">
        <label className="block font-medium mb-2">{t('motivation.primaryLabel')}</label>
        <select value={primaryMotivation} 
          onChange={(e) => { setPrimaryMotivation(e.target.value); setHasChanges(true); }}
          className="w-full px-4 py-2 border rounded-lg">
          <option value="saude">{t('motivation.options.health')}</option>
          <option value="desafio">{t('motivation.options.challenge')}</option>
          <option value="competicao">{t('motivation.options.competition')}</option>
          <option value="social">{t('motivation.options.social')}</option>
          <option value="estetica">{t('motivation.options.aesthetics')}</option>
        </select>
      </div>

      {/* Objetivos Múltiplos */}
      <div>
        <label className="block font-medium mb-2">{t('goals.label')}</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'emagrecer', translation: 'loseWeight' },
            { key: 'competir', translation: 'compete' },
            { key: 'melhorar_tempo', translation: 'improveTime' },
            { key: 'aumentar_distancia', translation: 'increaseDistance' },
            { key: 'prevenir_lesoes', translation: 'preventInjuries' },
            { key: 'aumentar_resistencia', translation: 'increaseEndurance' }
          ].map(goal => (
            <button key={goal.key} onClick={() => toggleGoal(goal.key)}
              className={`px-3 py-2 text-sm rounded-lg ${goals.includes(goal.key) ? 'bg-green-600 text-white' : 'border hover:bg-gray-50'}`}>
              {t(`goals.options.${goal.translation}` as any)}
            </button>
          ))}
        </div>
      </div>

      {hasChanges && (
        <button onClick={handleSave}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
          {t('save')}
        </button>
      )}
    </div>
  );
}
