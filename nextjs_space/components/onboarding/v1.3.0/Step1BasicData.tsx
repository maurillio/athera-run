'use client';

import { useState } from 'react';
import { validateStep1, OnboardingData } from '@/lib/onboarding-validator';
import { interpretRestingHR, calculateIMC, interpretIMC } from '@/lib/vdot-calculator';

interface Step1Props {
  data: Partial<OnboardingData>;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack?: () => void;
}

export default function Step1BasicData({ data, onUpdate, onNext, onBack }: Step1Props) {
  const [formData, setFormData] = useState({
    age: data.age || '',
    gender: data.gender || '',
    weight: data.weight || '',
    height: data.height || '',
    restingHeartRate: data.restingHeartRate || '',
    sleepQuality: data.sleepQuality || 3,
    stressLevel: data.stressLevel || 3,
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors.length > 0) setErrors([]);
  };

  const handleNext = () => {
    const validation = validateStep1({
      age: parseInt(formData.age as string),
      gender: formData.gender,
      weight: parseFloat(formData.weight as string),
      height: parseFloat(formData.height as string),
      restingHeartRate: formData.restingHeartRate ? parseInt(formData.restingHeartRate as string) : undefined,
      sleepQuality: formData.sleepQuality,
      stressLevel: formData.stressLevel,
    });

    if (!validation.valid && validation.errors) {
      setErrors(validation.errors);
      return;
    }

    onUpdate({
      age: parseInt(formData.age as string),
      gender: formData.gender,
      weight: parseFloat(formData.weight as string),
      height: parseFloat(formData.height as string),
      restingHeartRate: formData.restingHeartRate ? parseInt(formData.restingHeartRate as string) : undefined,
      sleepQuality: formData.sleepQuality,
      stressLevel: formData.stressLevel,
    });

    onNext();
  };

  const imc = formData.weight && formData.height 
    ? calculateIMC(parseFloat(formData.weight as string), parseFloat(formData.height as string))
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dados Básicos</h2>
        <p className="text-gray-600 mt-1">Informações essenciais para personalizar seu treino</p>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <ul className="list-disc list-inside space-y-1 text-red-700 text-sm">
            {errors.map((error, idx) => <li key={idx}>{error}</li>)}
          </ul>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Idade *</label>
          <input type="number" value={formData.age} onChange={(e) => handleChange('age', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg" placeholder="Ex: 32" min="15" max="100" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Gênero *</label>
          <select value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg">
            <option value="">Selecione...</option>
            <option value="male">Masculino</option>
            <option value="female">Feminino</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Peso (kg) *</label>
          <input type="number" value={formData.weight} onChange={(e) => handleChange('weight', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg" placeholder="Ex: 70" step="0.1" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Altura (cm) *</label>
          <input type="number" value={formData.height} onChange={(e) => handleChange('height', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg" placeholder="Ex: 175" />
        </div>
      </div>

      {imc && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium">Seu IMC: <span className="text-2xl font-bold">{imc}</span> ({interpretIMC(imc)})</p>
        </div>
      )}

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Dados Fisiológicos (Opcional)</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">FC Repouso (bpm) <span className="text-xs text-gray-500">ao acordar</span></label>
            <input type="number" value={formData.restingHeartRate} onChange={(e) => handleChange('restingHeartRate', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg" placeholder="Ex: 60" min="30" max="120" />
            {formData.restingHeartRate && (
              <p className="text-sm text-gray-600 mt-1">{interpretRestingHR(parseInt(formData.restingHeartRate as string))}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Qualidade do Sono: {formData.sleepQuality}/5</label>
            <input type="range" min="1" max="5" value={formData.sleepQuality}
              onChange={(e) => handleChange('sleepQuality', parseInt(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Ruim</span><span>Regular</span><span>Bom</span><span>Muito Bom</span><span>Ótimo</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Nível de Estresse: {formData.stressLevel}/5</label>
            <input type="range" min="1" max="5" value={formData.stressLevel}
              onChange={(e) => handleChange('stressLevel', parseInt(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Baixo</span><span>Leve</span><span>Moderado</span><span>Alto</span><span>Muito Alto</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        {onBack && <button onClick={onBack} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Voltar</button>}
        <button onClick={handleNext} className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Próximo</button>
      </div>
    </div>
  );
}
