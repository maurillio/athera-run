'use client';
import { useState } from 'react';

export default function AvailabilityTab({ userData, onUpdate }: any) {
  const [runDays, setRunDays] = useState(userData.availableDays?.running || []);
  const [otherActivities, setOtherActivities] = useState(userData.availableDays?.other || {});
  const [hasChanges, setHasChanges] = useState(false);

  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const toggleRunDay = (idx: number) => {
    setRunDays(runDays.includes(idx) ? runDays.filter((d: number) => d !== idx) : [...runDays, idx].sort());
    setHasChanges(true);
  };

  const handleSave = () => {
    const cleanOther = Object.fromEntries(
      Object.entries(otherActivities).filter(([_, days]) => days && (days as any[]).length > 0)
    );

    onUpdate({
      availableDays: {
        running: runDays,
        other: Object.keys(cleanOther).length > 0 ? cleanOther : null
      }
    });
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-semibold mb-3">🏃 Dias de Corrida</label>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => (
            <button key={idx} onClick={() => toggleRunDay(idx)}
              className={`px-2 py-3 text-sm font-medium rounded-lg ${
                runDays.includes(idx) ? 'bg-blue-600 text-white' : 'border hover:border-blue-400'
              }`}>
              {day}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">{runDays.length} dia(s) selecionado(s)</p>
      </div>

      {hasChanges && (
        <button onClick={handleSave}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
          💾 Salvar e Atualizar Plano
        </button>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          ⚠️ Alterar disponibilidade irá <strong>atualizar seu plano automaticamente</strong> a partir de hoje
        </p>
      </div>
    </div>
  );
}
