'use client';
import { useState } from 'react';

export default function HealthTab({ userData, onUpdate }: any) {
  const [hasInjuryHistory, setHasInjuryHistory] = useState(userData.hasInjuryHistory ?? false);
  const [injuries, setInjuries] = useState(userData.injuryHistory || []);
  const [medicalClearance, setMedicalClearance] = useState(userData.medicalClearance ?? true);
  
  // v1.3.0 - Dados fisiológicos
  const [restingHeartRate, setRestingHeartRate] = useState(userData.restingHeartRate || '');
  const [sleepQuality, setSleepQuality] = useState(userData.sleepQuality || 3);
  const [stressLevel, setStressLevel] = useState(userData.stressLevel || 3);
  
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    onUpdate({
      hasInjuryHistory,
      injuryHistory: hasInjuryHistory && injuries.length > 0 ? injuries : null,
      medicalClearance,
      // v1.3.0 - Dados fisiológicos
      restingHeartRate: restingHeartRate ? parseInt(restingHeartRate) : null,
      sleepQuality,
      stressLevel,
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

      {/* v1.3.0 - Dados Fisiológicos */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="font-semibold">📊 Dados Fisiológicos</h3>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            FC em Repouso (bpm)
            <span className="text-gray-500 ml-2">40-80 normal para atletas</span>
          </label>
          <input type="number" value={restingHeartRate} 
            onChange={(e) => { setRestingHeartRate(e.target.value); setHasChanges(true); }}
            placeholder="Ex: 60" min="40" max="100"
            className="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Qualidade do Sono: {sleepQuality === 1 ? '1-4h (Péssima)' : sleepQuality === 2 ? '4-6h (Ruim)' : sleepQuality === 3 ? '6-7h (Regular)' : sleepQuality === 4 ? '7-8h (Boa)' : '8h+ (Excelente)'}
          </label>
          <input type="range" min="1" max="5" value={sleepQuality} 
            onChange={(e) => { setSleepQuality(parseInt(e.target.value)); setHasChanges(true); }}
            className="w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Nível de Estresse: {stressLevel === 1 ? 'Muito Baixo' : stressLevel === 2 ? 'Baixo' : stressLevel === 3 ? 'Moderado' : stressLevel === 4 ? 'Alto' : 'Muito Alto'}
          </label>
          <input type="range" min="1" max="5" value={stressLevel} 
            onChange={(e) => { setStressLevel(parseInt(e.target.value)); setHasChanges(true); }}
            className="w-full" />
        </div>
      </div>

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
