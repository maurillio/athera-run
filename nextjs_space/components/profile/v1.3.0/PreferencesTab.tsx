'use client';
import { useState } from 'react';

export default function PreferencesTab({ userData, onUpdate }: any) {
  const [preferences, setPreferences] = useState({
    preferredTime: userData.preferredTrainingTime || 'morning',
    notifyWorkouts: userData.notifyWorkouts ?? true,
    notifyAdjustments: userData.notifyAdjustments ?? true,
  });
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    onUpdate(preferences);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium mb-2">Horário Preferido</label>
        <select value={preferences.preferredTime}
          onChange={(e) => { setPreferences({...preferences, preferredTime: e.target.value}); setHasChanges(true); }}
          className="w-full px-4 py-2 border rounded-lg">
          <option value="morning">Manhã (5h-12h)</option>
          <option value="afternoon">Tarde (12h-18h)</option>
          <option value="evening">Noite (18h-22h)</option>
          <option value="flexible">Flexível</option>
        </select>
      </div>

      <div className="border-t pt-6 space-y-3">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={preferences.notifyWorkouts}
            onChange={(e) => { setPreferences({...preferences, notifyWorkouts: e.target.checked}); setHasChanges(true); }}
            className="w-5 h-5" />
          <span className="text-sm">Notificar lembretes de treino</span>
        </label>

        <label className="flex items-center gap-3">
          <input type="checkbox" checked={preferences.notifyAdjustments}
            onChange={(e) => { setPreferences({...preferences, notifyAdjustments: e.target.checked}); setHasChanges(true); }}
            className="w-5 h-5" />
          <span className="text-sm">Notificar sugestões de ajustes (Premium)</span>
        </label>
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
