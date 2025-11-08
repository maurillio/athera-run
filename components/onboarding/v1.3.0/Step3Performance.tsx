'use client';
import { useState, useEffect } from 'react';
import { calculateVDOTFromTime, interpretVDOT } from '@/lib/vdot-calculator';
import { useTranslations } from '@/lib/i18n/hooks';

export default function Step3Performance({ data, onUpdate, onNext, onBack }: any) {
  const t = useTranslations('onboarding.step3');
  const tCommon = useTranslations('common');
  
  // Inicializar bestTimes (não personalBests!)
  const [bestTimes, setBestTimes] = useState(data.bestTimes || {});
  const [selectedDistance, setSelectedDistance] = useState('');
  
  // Separar inputs para melhor UX
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');

  const distances = [
    { value: '5k', label: '5km', meters: 5000 },
    { value: '10k', label: '10km', meters: 10000 },
    { value: '21k', label: '21km (Meia Maratona)', meters: 21097 },
    { value: '42k', label: '42km (Maratona)', meters: 42195 },
  ];

  const addTime = () => {
    // Validação
    if (!selectedDistance) {
      alert('Selecione uma distância');
      return;
    }
    if (!minutes || parseInt(minutes) < 0) {
      alert('Digite os minutos');
      return;
    }
    
    const h = parseInt(hours || '0');
    const m = parseInt(minutes || '0');
    const s = parseInt(seconds || '0');
    
    // Validação de valores
    if (m > 59 || s > 59) {
      alert('Minutos e segundos devem ser menores que 60');
      return;
    }
    
    const totalSec = (h * 3600) + (m * 60) + s;
    
    if (totalSec === 0) {
      alert('Digite um tempo válido');
      return;
    }
    
    const timeStr = `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    const vdot = calculateVDOTFromTime(selectedDistance as '5k' | '10k' | '21k' | '42k', totalSec);
    
    setBestTimes({ 
      ...bestTimes, 
      [selectedDistance]: { 
        time: timeStr, 
        vdot,
        totalSeconds: totalSec,
        date: new Date().toISOString().split('T')[0]
      } 
    });
    
    // Limpar formulário
    setHours('0');
    setMinutes('');
    setSeconds('');
    setSelectedDistance('');
  };

  const removeTime = (distanceKey: string) => {
    const { [distanceKey]: _, ...rest } = bestTimes;
    setBestTimes(rest);
  };

  const bestVDOT = Object.values(bestTimes).reduce((max: number, t: any) => 
    t.vdot > max ? t.vdot : max, 0);

  // Auto-save com debounce
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
      {/* Explicação com ênfase */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🎯</div>
          <div>
            <h3 className="font-bold text-lg mb-2 text-purple-900">
              Por que seus melhores tempos são importantes?
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              <strong>A IA usa seus tempos</strong> para calcular seu <strong>VDOT</strong> (nível de condicionamento) 
              e criar um plano <strong>100% personalizado</strong> para você.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              💡 <strong>Não se preocupe se não tiver tempos oficiais!</strong> Você pode pular esta etapa e 
              adicionar depois. O sistema também aprende com seus treinos do Strava.
            </p>
          </div>
        </div>
      </div>

      {/* Formulário melhorado */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          ⏱️ Adicionar Melhor Tempo
        </h3>
        
        {/* Seleção de distância */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Distância</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {distances.map(d => (
              <button
                key={d.value}
                type="button"
                onClick={() => setSelectedDistance(d.value)}
                disabled={bestTimes[d.value]}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  selectedDistance === d.value
                    ? 'bg-purple-600 text-white shadow-lg'
                    : bestTimes[d.value]
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                }`}
              >
                {d.label}
                {bestTimes[d.value] && <div className="text-xs mt-1">✓ Adicionado</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Input de tempo melhorado */}
        {selectedDistance && (
          <div className="mb-4 p-4 bg-purple-50 rounded-lg">
            <label className="block text-sm font-medium mb-3">
              Tempo para {distances.find(d => d.value === selectedDistance)?.label}
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Horas</label>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full px-4 py-3 text-2xl text-center border-2 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  min="0"
                  max="9"
                  placeholder="0"
                />
              </div>
              <div className="text-2xl font-bold text-gray-400 pt-6">:</div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Minutos *</label>
                <input
                  type="number"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-full px-4 py-3 text-2xl text-center border-2 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  min="0"
                  max="59"
                  placeholder="00"
                  required
                />
              </div>
              <div className="text-2xl font-bold text-gray-400 pt-6">:</div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Segundos</label>
                <input
                  type="number"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  className="w-full px-4 py-3 text-2xl text-center border-2 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  min="0"
                  max="59"
                  placeholder="00"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={addTime}
              className="w-full mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors"
            >
              ✓ Adicionar Tempo
            </button>
          </div>
        )}
      </div>

      {/* Lista de tempos adicionados */}
      {Object.keys(bestTimes).length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            🏃 Seus Melhores Tempos
          </h3>
          
          <div className="space-y-2">
            {Object.entries(bestTimes).map(([distKey, timeData]: any) => (
              <div key={distKey} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold text-lg">
                    {distances.find(x => x.value === distKey)?.label}
                  </div>
                  <div className="text-sm text-gray-600">VDOT: {timeData.vdot}</div>
                </div>
                <div className="text-2xl font-mono font-bold text-purple-700">
                  {timeData.time}
                </div>
                <button
                  type="button"
                  onClick={() => removeTime(distKey)}
                  className="ml-4 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remover"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
          
          {bestVDOT > 0 && (
            <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-4xl">⚡</div>
                <div>
                  <p className="font-bold text-xl text-orange-900">
                    Seu VDOT: {bestVDOT}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {interpretVDOT(bestVDOT)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {Object.keys(bestTimes).length === 0 && (
        <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-gray-600">
            Nenhum tempo adicionado ainda
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Adicione pelo menos um tempo ou clique em "Próximo" para pular
          </p>
        </div>
      )}
    </div>
  );
}
