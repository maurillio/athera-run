'use client';
import { useState } from 'react';
import { calculateVDOTFromTime, interpretVDOT } from '@/lib/vdot-calculator';

export default function PerformanceTab({ userData, onUpdate }: any) {
  const [bestTimes, setBestTimes] = useState(userData.bestTimes || {});
  const [hasChanges, setHasChanges] = useState(false);

  const distances = [
    { value: '5k', label: '5km', meters: 5000 },
    { value: '10k', label: '10km', meters: 10000 },
    { value: '21k', label: '21km', meters: 21097 },
    { value: '42k', label: '42km', meters: 42195 },
  ];

  const handleSave = () => {
    onUpdate({ bestTimes: Object.keys(bestTimes).length > 0 ? bestTimes : null });
    setHasChanges(false);
  };

  const removeTime = (dist: string) => {
    const { [dist]: _, ...rest } = bestTimes;
    setBestTimes(rest);
    setHasChanges(true);
  };

  const bestVDOT = Object.values(bestTimes).reduce((max: number, t: any) => 
    t.vdot > max ? t.vdot : max, 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Melhores Tempos</h3>
        <p className="text-sm text-gray-600">Seus recordes pessoais em diferentes distâncias</p>
      </div>

      {Object.keys(bestTimes).length > 0 && (
        <>
          <div className="space-y-2">
            {Object.entries(bestTimes).map(([dist, data]: any) => (
              <div key={dist} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{distances.find(d => d.value === dist)?.label}</p>
                  <p className="text-sm text-gray-600">VDOT: {data.vdot}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-mono font-semibold">{data.time}</p>
                  <button onClick={() => removeTime(dist)} className="text-red-600 hover:text-red-800">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {bestVDOT > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-semibold text-lg">Seu VDOT: {bestVDOT}</p>
              <p className="text-sm text-gray-700">{interpretVDOT(bestVDOT)}</p>
            </div>
          )}
        </>
      )}

      {Object.keys(bestTimes).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum tempo registrado ainda</p>
          <p className="text-sm mt-2">Adicione seus melhores tempos para melhorar a precisão do plano!</p>
        </div>
      )}

      {hasChanges && (
        <button onClick={handleSave}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
          💾 Salvar Alterações
        </button>
      )}
    </div>
  );
}
