'use client';
import { useState, useEffect } from 'react';
import { calculateVDOTFromTime, interpretVDOT } from '@/lib/vdot-calculator';
import { useTranslations } from '@/lib/i18n/hooks';

export default function Step3Performance({ data, onUpdate, onNext, onBack }: any) {
  const t = useTranslations('onboarding.step3');
  const tCommon = useTranslations('common');
  const [bestTimes, setBestTimes] = useState(data.bestTimes || {});
  const [dist, setDist] = useState('');
  const [time, setTime] = useState({ h: '', m: '', s: '' });

  const distances = [
    { value: '5k', label: t('distance5k'), meters: 5000 },
    { value: '10k', label: t('distance10k'), meters: 10000 },
    { value: '21k', label: t('distance21k'), meters: 21097 },
    { value: '42k', label: t('distance42k'), meters: 42195 },
  ];

  const addTime = () => {
    if (!dist || !time.m) return;
    const totalSec = (parseInt(time.h || '0') * 3600) + (parseInt(time.m) * 60) + parseInt(time.s || '0');
    const timeStr = `${time.h || '0'}:${time.m.padStart(2,'0')}:${(time.s || '0').padStart(2,'0')}`;
    const vdot = calculateVDOTFromTime(dist as '5k' | '10k' | '21k' | '42k', totalSec);
    
    setBestTimes({ ...bestTimes, [dist]: { time: timeStr, vdot } });
    setTime({ h: '', m: '', s: '' });
    setDist('');
  };

  const bestVDOT = Object.values(bestTimes).reduce((max: number, t: any) => 
    t.vdot > max ? t.vdot : max, 0);

  // Auto-save com debounce quando os dados mudam
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onUpdate({ 
        bestTimes: Object.keys(bestTimes).length > 0 ? bestTimes : undefined 
      });
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [bestTimes, onUpdate]);

  const handleNext = () => {
    onUpdate({ bestTimes: Object.keys(bestTimes).length > 0 ? bestTimes : undefined });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-3">{t('addTime')}</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <select value={dist} onChange={(e) => setDist(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="">{t('distancePlaceholder')}</option>
            {distances.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          
          <div className="flex gap-2">
            <input type="number" value={time.h} onChange={(e) => setTime({...time, h: e.target.value})}
              placeholder={t('hoursPlaceholder')} className="w-16 px-2 py-2 border rounded" min="0" max="9" />
            <input type="number" value={time.m} onChange={(e) => setTime({...time, m: e.target.value})}
              placeholder={t('minutesPlaceholder')} className="w-20 px-2 py-2 border rounded" min="0" max="59" />
            <input type="number" value={time.s} onChange={(e) => setTime({...time, s: e.target.value})}
              placeholder={t('secondsPlaceholder')} className="w-20 px-2 py-2 border rounded" min="0" max="59" />
            <button onClick={addTime} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+</button>
          </div>
        </div>
      </div>

      {Object.keys(bestTimes).length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">{t('yourTimes')}</h3>
          {Object.entries(bestTimes).map(([d, timeData]: any) => (
            <div key={d} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">{distances.find(x => x.value === d)?.label}</span>
              <span className="font-mono">{timeData.time}</span>
              <span className="text-sm text-gray-600">VDOT {timeData.vdot}</span>
              <button onClick={() => {const {[d]: _, ...rest} = bestTimes; setBestTimes(rest);}}
                className="text-red-600 hover:text-red-800 text-xl">×</button>
            </div>
          ))}
          
          {bestVDOT > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-semibold text-lg">{t('yourVdot')}: {bestVDOT}</p>
              <p className="text-sm text-gray-700 mt-1">{interpretVDOT(bestVDOT)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
