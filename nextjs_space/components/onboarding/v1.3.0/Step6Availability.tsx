'use client';
import { useState } from 'react';

export default function Step6Availability({ data, onUpdate, onNext, onBack }: any) {
  const [runDays, setRunDays] = useState(data.availableDays?.running || []);
  const [otherActivities, setOtherActivities] = useState(data.availableDays?.other || {});
  
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const activities = [
    { key: 'gym', label: 'Musculação' },
    { key: 'yoga', label: 'Yoga/Pilates' },
    { key: 'cycling', label: 'Ciclismo' },
    { key: 'swimming', label: 'Natação' },
  ];

  const toggleRunDay = (idx: number) => {
    setRunDays(runDays.includes(idx) ? runDays.filter(d => d !== idx) : [...runDays, idx].sort());
  };

  const toggleActivity = (activity: string, day: number) => {
    const current = otherActivities[activity] || [];
    const updated = current.includes(day) 
      ? current.filter(d => d !== day)
      : [...current, day].sort();
    
    setOtherActivities({
      ...otherActivities,
      [activity]: updated.length > 0 ? updated : undefined
    });
  };

  const handleNext = () => {
    if (runDays.length === 0) return;
    
    const cleanOther = Object.fromEntries(
      Object.entries(otherActivities).filter(([_, days]) => days && days.length > 0)
    );

    onUpdate({
      availableDays: {
        running: runDays,
        other: Object.keys(cleanOther).length > 0 ? cleanOther : undefined
      }
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Disponibilidade Semanal</h2>
        <p className="text-gray-600">Quais dias você pode treinar?</p>
      </div>

      <div>
        <label className="block font-semibold mb-3 text-blue-900">🏃 Dias para CORRIDA *</label>
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

      <div className="flex justify-between pt-6">
        <button onClick={onBack} className="px-6 py-2 border rounded-lg">Voltar</button>
        <button onClick={handleNext} disabled={runDays.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
          Próximo
        </button>
      </div>
    </div>
  );
}
