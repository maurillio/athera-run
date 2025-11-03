'use client';
import { useState } from 'react';
import { calculateVDOTFromTime, interpretVDOT } from '@/lib/vdot-calculator';

export default function Step3Performance({ data, onUpdate, onNext, onBack }: any) {
  const [bestTimes, setBestTimes] = useState(data.bestTimes || {});
  const [dist, setDist] = useState('');
  const [time, setTime] = useState({ h: '', m: '', s: '' });

  const distances = [
    { value: '5k', label: '5km', meters: 5000 },
    { value: '10k', label: '10km', meters: 10000 },
    { value: '21k', label: '21km (Meia)', meters: 21097 },
    { value: '42k', label: '42km (Maratona)', meters: 42195 },
  ];

  const addTime = () => {
    if (!dist || !time.m) return;
    const totalSec = (parseInt(time.h || '0') * 3600) + (parseInt(time.m) * 60) + parseInt(time.s || '0');
    const timeStr = `${time.h || '0'}:${time.m.padStart(2,'0')}:${(time.s || '0').padStart(2,'0')}`;
    const distMeters = distances.find(d => d.value === dist)?.meters || 0;
    const vdot = calculateVDOTFromTime(distMeters, totalSec);
    
    setBestTimes({ ...bestTimes, [dist]: { time: timeStr, vdot } });
    setTime({ h: '', m: '', s: '' });
    setDist('');
  };

  const bestVDOT = Object.values(bestTimes).reduce((max: number, t: any) => 
    t.vdot > max ? t.vdot : max, 0);

  const handleNext = () => {
    onUpdate({ bestTimes: Object.keys(bestTimes).length > 0 ? bestTimes : undefined });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Performance</h2>
        <p className="text-gray-600">Seus melhores tempos (opcional, mas recomendado)</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Adicionar Tempo</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <select value={dist} onChange={(e) => setDist(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="">Distância...</option>
            {distances.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          
          <div className="flex gap-2">
            <input type="number" value={time.h} onChange={(e) => setTime({...time, h: e.target.value})}
              placeholder="H" className="w-16 px-2 py-2 border rounded" min="0" max="9" />
            <input type="number" value={time.m} onChange={(e) => setTime({...time, m: e.target.value})}
              placeholder="MM" className="w-20 px-2 py-2 border rounded" min="0" max="59" />
            <input type="number" value={time.s} onChange={(e) => setTime({...time, s: e.target.value})}
              placeholder="SS" className="w-20 px-2 py-2 border rounded" min="0" max="59" />
            <button onClick={addTime} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+</button>
          </div>
        </div>
      </div>

      {Object.keys(bestTimes).length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Seus Tempos</h3>
          {Object.entries(bestTimes).map(([d, t]: any) => (
            <div key={d} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">{distances.find(x => x.value === d)?.label}</span>
              <span className="font-mono">{t.time}</span>
              <span className="text-sm text-gray-600">VDOT {t.vdot}</span>
              <button onClick={() => {const {[d]: _, ...rest} = bestTimes; setBestTimes(rest);}}
                className="text-red-600 hover:text-red-800 text-xl">×</button>
            </div>
          ))}
          
          {bestVDOT > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-semibold text-lg">Seu VDOT: {bestVDOT}</p>
              <p className="text-sm text-gray-700 mt-1">{interpretVDOT(bestVDOT)}</p>
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
