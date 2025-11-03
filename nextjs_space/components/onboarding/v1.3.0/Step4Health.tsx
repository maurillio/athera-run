'use client';
import { useState } from 'react';

const commonInjuries = [
  'Canelite', 'Fascite Plantar', 'Tendinite Aquiles', 'Joelho Corredor',
  'Lesão IT Band', 'Fratura Estresse', 'Distensão Muscular', 'Outro'
];

export default function Step4Health({ data, onUpdate, onNext, onBack }: any) {
  const [hasInjuryHistory, setHasInjuryHistory] = useState(data.hasInjuryHistory ?? false);
  const [injuries, setInjuries] = useState(data.injuryHistory || []);
  const [currentInjury, setCurrentInjury] = useState('');
  const [doctorCleared, setDoctorCleared] = useState(data.medicalClearance ?? true);

  const addInjury = () => {
    if (!currentInjury.trim()) return;
    setInjuries([...injuries, currentInjury.trim()]);
    setCurrentInjury('');
  };

  const handleNext = () => {
    onUpdate({
      hasInjuryHistory,
      injuryHistory: hasInjuryHistory && injuries.length > 0 ? injuries : undefined,
      medicalClearance: doctorCleared,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Saúde e Histórico</h2>
        <p className="text-gray-600">Informações importantes para prevenir lesões</p>
      </div>

      <div>
        <label className="block font-medium mb-2">Teve lesões de corrida recentemente?</label>
        <div className="flex gap-4">
          <button onClick={() => setHasInjuryHistory(false)}
            className={`px-6 py-2 rounded-lg ${!hasInjuryHistory ? 'bg-blue-600 text-white' : 'border'}`}>
            Não
          </button>
          <button onClick={() => setHasInjuryHistory(true)}
            className={`px-6 py-2 rounded-lg ${hasInjuryHistory ? 'bg-blue-600 text-white' : 'border'}`}>
            Sim
          </button>
        </div>
      </div>

      {hasInjuryHistory && (
        <div className="space-y-3">
          <label className="block font-medium">Quais lesões?</label>
          <div className="grid grid-cols-2 gap-2">
            {commonInjuries.map(inj => (
              <button key={inj}
                onClick={() => !injuries.includes(inj) && setInjuries([...injuries, inj])}
                className={`px-3 py-2 text-sm rounded-lg ${injuries.includes(inj) ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'}`}>
                {inj}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input type="text" value={currentInjury} onChange={(e) => setCurrentInjury(e.target.value)}
              placeholder="Outra lesão..." className="flex-1 px-4 py-2 border rounded-lg"
              onKeyPress={(e) => e.key === 'Enter' && addInjury()} />
            <button onClick={addInjury} className="px-4 py-2 bg-blue-600 text-white rounded-lg">+</button>
          </div>

          {injuries.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {injuries.map((inj: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center gap-2">
                  {inj}
                  <button onClick={() => setInjuries(injuries.filter((_: string, i: number) => i !== idx))}
                    className="hover:text-red-900">×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="border-t pt-6">
        <label className="block font-medium mb-3">Liberação Médica</label>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
          <p className="text-sm text-yellow-800">
            ⚠️ Recomendamos check-up médico antes de iniciar treinos intensos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" checked={doctorCleared} onChange={(e) => setDoctorCleared(e.target.checked)}
            className="w-5 h-5" id="cleared" />
          <label htmlFor="cleared" className="text-sm">
            Estou liberado(a) para treinar / Sem restrições médicas
          </label>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button onClick={onBack} className="px-6 py-2 border rounded-lg">Voltar</button>
        <button onClick={handleNext} disabled={!doctorCleared}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
          Próximo
        </button>
      </div>
    </div>
  );
}
