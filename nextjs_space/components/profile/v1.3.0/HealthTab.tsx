'use client';
import { useState } from 'react';

export default function HealthTab({ userData, onUpdate }: any) {
  const [hasInjuryHistory, setHasInjuryHistory] = useState(userData.hasInjuryHistory ?? false);
  const [injuries, setInjuries] = useState(userData.injuryHistory || []);
  const [medicalClearance, setMedicalClearance] = useState(userData.medicalClearance ?? true);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    onUpdate({
      hasInjuryHistory,
      injuryHistory: hasInjuryHistory && injuries.length > 0 ? injuries : null,
      medicalClearance,
    });
    setHasChanges(false);
  };

  const addInjury = (injury: string) => {
    setInjuries([...injuries, injury]);
    setHasChanges(true);
  };

  const removeInjury = (idx: number) => {
    setInjuries(injuries.filter((_: any, i: number) => i !== idx));
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium mb-2">Histórico de Lesões</label>
        <div className="flex gap-4">
          <button onClick={() => { setHasInjuryHistory(false); setHasChanges(true); }}
            className={`px-6 py-2 rounded-lg ${!hasInjuryHistory ? 'bg-green-600 text-white' : 'border'}`}>
            Sem lesões
          </button>
          <button onClick={() => { setHasInjuryHistory(true); setHasChanges(true); }}
            className={`px-6 py-2 rounded-lg ${hasInjuryHistory ? 'bg-orange-600 text-white' : 'border'}`}>
            Com lesões
          </button>
        </div>
      </div>

      {hasInjuryHistory && injuries.length > 0 && (
        <div className="space-y-2">
          {injuries.map((inj: string, idx: number) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <span>{inj}</span>
              <button onClick={() => removeInjury(idx)} className="text-red-600 hover:text-red-800">×</button>
            </div>
          ))}
        </div>
      )}

      <div className="border-t pt-6">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={medicalClearance} 
            onChange={(e) => { setMedicalClearance(e.target.checked); setHasChanges(true); }}
            className="w-5 h-5" />
          <span className="text-sm">Estou liberado(a) para treinar / Sem restrições médicas</span>
        </label>
      </div>

      {hasChanges && (
        <button onClick={handleSave}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
          💾 Salvar Alterações
        </button>
      )}
    </div>
  );
}
