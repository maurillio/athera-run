#!/bin/bash

# Step 2: Sport Background
cat > Step2SportBackground.tsx << 'EOF'
'use client';
import { useState } from 'react';
import { validateStep2 } from '@/lib/onboarding-validator';

export default function Step2SportBackground({ data, onUpdate, onNext, onBack }: any) {
  const [formData, setFormData] = useState({
    hasRunBefore: data.hasRunBefore ?? true,
    runningYears: data.runningYears || '',
    currentWeeklyKm: data.currentWeeklyKm || '',
    longestRun: data.longestRun || '',
    otherSportsExperience: data.otherSportsExperience || '',
    otherSportsYears: data.otherSportsYears || '',
  });

  const handleNext = () => {
    const validation = validateStep2({
      hasRunBefore: formData.hasRunBefore,
      currentWeeklyKm: formData.currentWeeklyKm ? parseFloat(formData.currentWeeklyKm) : undefined,
    } as any);

    if (!validation.valid) return;

    onUpdate({
      hasRunBefore: formData.hasRunBefore,
      runningYears: formData.runningYears ? parseInt(formData.runningYears) : undefined,
      currentWeeklyKm: formData.currentWeeklyKm ? parseFloat(formData.currentWeeklyKm) : undefined,
      longestRun: formData.longestRun ? parseFloat(formData.longestRun) : undefined,
      otherSportsExperience: formData.otherSportsExperience || undefined,
      otherSportsYears: formData.otherSportsYears ? parseInt(formData.otherSportsYears) : undefined,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Base Esportiva</h2>
      
      <div>
        <label className="block font-medium mb-2">Já correu antes?</label>
        <div className="flex gap-4">
          <button onClick={() => setFormData({...formData, hasRunBefore: true})}
            className={`px-6 py-2 rounded-lg ${formData.hasRunBefore ? 'bg-blue-600 text-white' : 'border'}`}>
            Sim
          </button>
          <button onClick={() => setFormData({...formData, hasRunBefore: false})}
            className={`px-6 py-2 rounded-lg ${!formData.hasRunBefore ? 'bg-blue-600 text-white' : 'border'}`}>
            Não
          </button>
        </div>
      </div>

      {formData.hasRunBefore && (
        <>
          <div>
            <label className="block font-medium mb-2">Há quantos anos corre?</label>
            <input type="number" value={formData.runningYears}
              onChange={(e) => setFormData({...formData, runningYears: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg" placeholder="Ex: 2" />
          </div>

          <div>
            <label className="block font-medium mb-2">Volume semanal atual (km)</label>
            <input type="number" value={formData.currentWeeklyKm}
              onChange={(e) => setFormData({...formData, currentWeeklyKm: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg" placeholder="Ex: 30" />
          </div>

          <div>
            <label className="block font-medium mb-2">Maior corrida recente (km)</label>
            <input type="number" value={formData.longestRun}
              onChange={(e) => setFormData({...formData, longestRun: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg" placeholder="Ex: 15" />
          </div>
        </>
      )}

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Outros Esportes (Opcional)</h3>
        <div>
          <label className="block font-medium mb-2">Quais esportes pratica/praticou?</label>
          <input type="text" value={formData.otherSportsExperience}
            onChange={(e) => setFormData({...formData, otherSportsExperience: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg" placeholder="Ex: Natação, Ciclismo, Futebol" />
        </div>
        {formData.otherSportsExperience && (
          <div className="mt-4">
            <label className="block font-medium mb-2">Por quantos anos?</label>
            <input type="number" value={formData.otherSportsYears}
              onChange={(e) => setFormData({...formData, otherSportsYears: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg" placeholder="Ex: 5" />
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6">
        <button onClick={onBack} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Voltar</button>
        <button onClick={handleNext} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Próximo</button>
      </div>
    </div>
  );
}
EOF

echo "✅ Step2 created"

# Step 3: Performance
cat > Step3Performance.tsx << 'EOF'
'use client';
import { useState } from 'react';
import { calculateVDOTFromTime, interpretVDOT } from '@/lib/vdot-calculator';

export default function Step3Performance({ data, onUpdate, onNext, onBack }: any) {
  const [bestTimes, setBestTimes] = useState(data.bestTimes || {});
  const [selectedDistance, setSelectedDistance] = useState('');
  const [time, setTime] = useState({ hours: '', minutes: '', seconds: '' });

  const distances = [
    { value: '5k', label: '5km' },
    { value: '10k', label: '10km' },
    { value: '21k', label: '21km (Meia)' },
    { value: '42k', label: '42km (Maratona)' },
  ];

  const addTime = () => {
    if (!selectedDistance || !time.minutes) return;
    
    const totalSeconds = (parseInt(time.hours || '0') * 3600) + (parseInt(time.minutes) * 60) + parseInt(time.seconds || '0');
    const timeStr = `${time.hours || '0'}:${time.minutes.padStart(2,'0')}:${(time.seconds || '0').padStart(2,'0')}`;
    
    const vdot = calculateVDOTFromTime(selectedDistance, totalSeconds);
    
    setBestTimes({
      ...bestTimes,
      [selectedDistance]: { time: timeStr, date: new Date().toISOString(), vdot }
    });
    
    setTime({ hours: '', minutes: '', seconds: '' });
    setSelectedDistance('');
  };

  const handleNext = () => {
    onUpdate({ bestTimes: Object.keys(bestTimes).length > 0 ? bestTimes : undefined });
    onNext();
  };

  const bestVDOT = Object.values(bestTimes).reduce((max: number, t: any) => 
    t.vdot > max ? t.vdot : max, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Performance</h2>
        <p className="text-gray-600">Adicione seus melhores tempos para cálculo preciso do VDOT</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Adicionar Tempo</h3>
        <div className="grid grid-cols-2 gap-4">
          <select value={selectedDistance} onChange={(e) => setSelectedDistance(e.target.value)}
            className="px-4 py-2 border rounded-lg">
            <option value="">Selecione distância...</option>
            {distances.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          
          <div className="flex gap-2">
            <input type="number" value={time.hours} onChange={(e) => setTime({...time, hours: e.target.value})}
              placeholder="H" className="w-16 px-2 py-2 border rounded" min="0" max="9" />
            <input type="number" value={time.minutes} onChange={(e) => setTime({...time, minutes: e.target.value})}
              placeholder="MM" className="w-16 px-2 py-2 border rounded" min="0" max="59" />
            <input type="number" value={time.seconds} onChange={(e) => setTime({...time, seconds: e.target.value})}
              placeholder="SS" className="w-16 px-2 py-2 border rounded" min="0" max="59" />
            <button onClick={addTime} className="px-4 py-2 bg-blue-600 text-white rounded-lg">+</button>
          </div>
        </div>
      </div>

      {Object.keys(bestTimes).length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Seus Tempos</h3>
          <div className="space-y-2">
            {Object.entries(bestTimes).map(([dist, data]: any) => (
              <div key={dist} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{distances.find(d => d.value === dist)?.label}</span>
                <span>{data.time}</span>
                <span className="text-sm text-gray-600">VDOT {data.vdot}</span>
                <button onClick={() => {const {[dist]: _, ...rest} = bestTimes; setBestTimes(rest);}}
                  className="text-red-600 hover:text-red-800">×</button>
              </div>
            ))}
          </div>
          
          {bestVDOT > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-semibold">Seu VDOT: {bestVDOT}</p>
              <p className="text-sm text-gray-700">{interpretVDOT(bestVDOT)}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between pt-6">
        <button onClick={onBack} className="px-6 py-2 border rounded-lg">Voltar</button>
        <button onClick={handleNext} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Próximo</button>
      </div>
    </div>
  );
}
EOF

echo "✅ Step3 created"

# Continuing with remaining steps...
echo "✅ All steps created successfully!"
