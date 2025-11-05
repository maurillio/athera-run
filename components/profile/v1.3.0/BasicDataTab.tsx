'use client';
import { useState } from 'react';
import { calculateIMC, interpretIMC, interpretRestingHR } from '@/lib/vdot-calculator';

export default function BasicDataTab({ userData, onUpdate }: any) {
  const [formData, setFormData] = useState({
    age: userData.age || '',
    gender: userData.gender || '',
    weight: userData.weight || '',
    height: userData.height || '',
    restingHeartRate: userData.restingHeartRate || '',
    sleepQuality: userData.sleepQuality || 3,
    stressLevel: userData.stressLevel || 3,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate({
      age: parseInt(formData.age as string),
      gender: formData.gender,
      weight: parseFloat(formData.weight as string),
      height: parseFloat(formData.height as string),
      restingHeartRate: formData.restingHeartRate ? parseInt(formData.restingHeartRate as string) : null,
      sleepQuality: formData.sleepQuality,
      stressLevel: formData.stressLevel,
    });
    setHasChanges(false);
  };

  const imc = formData.weight && formData.height 
    ? calculateIMC(parseFloat(formData.weight as string), parseFloat(formData.height as string))
    : null;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Idade</label>
          <input type="number" value={formData.age} onChange={(e) => handleChange('age', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Gênero</label>
          <select value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg">
            <option value="male">Masculino</option>
            <option value="female">Feminino</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Peso (kg)</label>
          <input type="number" value={formData.weight} onChange={(e) => handleChange('weight', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg" step="0.1" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Altura (cm)</label>
          <input type="number" value={formData.height} onChange={(e) => handleChange('height', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg" />
        </div>
      </div>

      {imc && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm">IMC: <span className="text-xl font-bold">{imc}</span> ({interpretIMC(imc)})</p>
        </div>
      )}

      <div className="border-t pt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">FC Repouso (bpm)</label>
          <input type="number" value={formData.restingHeartRate} 
            onChange={(e) => handleChange('restingHeartRate', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg" />
          {formData.restingHeartRate && (
            <p className="text-sm text-gray-600 mt-1">{interpretRestingHR(parseInt(formData.restingHeartRate as string))}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Qualidade do Sono: {formData.sleepQuality}/5</label>
          <input type="range" min="1" max="5" value={formData.sleepQuality}
            onChange={(e) => handleChange('sleepQuality', parseInt(e.target.value))} className="w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Nível de Estresse: {formData.stressLevel}/5</label>
          <input type="range" min="1" max="5" value={formData.stressLevel}
            onChange={(e) => handleChange('stressLevel', parseInt(e.target.value))} className="w-full" />
        </div>
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
