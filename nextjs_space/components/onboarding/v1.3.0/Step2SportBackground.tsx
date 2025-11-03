'use client';
import { useState } from 'react';

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
            className={`px-6 py-2 rounded-lg ${formData.hasRunBefore ? 'bg-blue-600 text-white' : 'border'}`}>Sim</button>
          <button onClick={() => setFormData({...formData, hasRunBefore: false})}
            className={`px-6 py-2 rounded-lg ${!formData.hasRunBefore ? 'bg-blue-600 text-white' : 'border'}`}>Não</button>
        </div>
      </div>

      {formData.hasRunBefore && (
        <>
          <div><label className="block font-medium mb-2">Há quantos anos corre?</label>
            <input type="number" value={formData.runningYears}
              onChange={(e) => setFormData({...formData, runningYears: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg" placeholder="Ex: 2" /></div>

          <div><label className="block font-medium mb-2">Volume semanal atual (km)</label>
            <input type="number" value={formData.currentWeeklyKm}
              onChange={(e) => setFormData({...formData, currentWeeklyKm: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg" placeholder="Ex: 30" /></div>

          <div><label className="block font-medium mb-2">Maior corrida recente (km)</label>
            <input type="number" value={formData.longestRun}
              onChange={(e) => setFormData({...formData, longestRun: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg" placeholder="Ex: 15" /></div>
        </>
      )}

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Outros Esportes (Opcional)</h3>
        <div><label className="block font-medium mb-2">Quais esportes pratica/praticou?</label>
          <input type="text" value={formData.otherSportsExperience}
            onChange={(e) => setFormData({...formData, otherSportsExperience: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg" placeholder="Ex: Natação, Ciclismo" /></div>
        {formData.otherSportsExperience && (
          <div className="mt-4"><label className="block font-medium mb-2">Por quantos anos?</label>
            <input type="number" value={formData.otherSportsYears}
              onChange={(e) => setFormData({...formData, otherSportsYears: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg" placeholder="Ex: 5" /></div>
        )}
      </div>

      <div className="flex justify-between pt-6">
        <button onClick={onBack} className="px-6 py-2 border rounded-lg">Voltar</button>
        <button onClick={handleNext} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Próximo</button>
      </div>
    </div>
  );
}
