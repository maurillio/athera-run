'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';
import { validateStep1, OnboardingData } from '@/lib/onboarding-validator';
import { calculateIMC, interpretIMC } from '@/lib/vdot-calculator';
import AIFieldIcon from '@/components/ai-transparency/AIFieldIcon';
import AIFieldStatus from '@/components/ai-transparency/AIFieldStatus';
import { useFieldAnalysis } from '@/hooks/useFieldAnalysis';
import { AI_FIELD_CONFIGS } from '@/types/ai-transparency';

interface Step1Props {
  data: Partial<OnboardingData>;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack?: () => void;
  onPrevious?: () => void;
}

export default function Step1BasicData({ data, onUpdate, onNext, onBack, onPrevious }: Step1Props) {
  const t = useTranslations('onboarding.step1');
  const { getFieldStatus } = useFieldAnalysis();
  const tCommon = useTranslations('common');
  
  const [formData, setFormData] = useState({
    age: data.age || '',
    gender: data.gender || '',
    weight: data.weight || '',
    height: data.height || '',
  });

  const [errors, setErrors] = useState<string[]>([]);

  // Auto-save com debounce quando os dados mudam
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onUpdate({
        age: formData.age ? parseInt(formData.age as string) : undefined,
        gender: formData.gender || undefined,
        weight: formData.weight ? parseFloat(formData.weight as string) : undefined,
        height: formData.height ? parseFloat(formData.height as string) : undefined,
      });
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [formData, onUpdate]);

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
    });

    onNext();
  };

  const imc = formData.weight && formData.height 
    ? calculateIMC(parseFloat(formData.weight as string), parseFloat(formData.height as string))
    : null;

  return (
    <div className="space-y-6">
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <ul className="list-disc list-inside space-y-1 text-red-700 text-sm">
            {errors.map((error, idx) => <li key={idx}>{error}</li>)}
          </ul>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center text-sm font-medium mb-2">
            {t('age')} *
            <AIFieldIcon
              label="Idade"
              importance="critical"
              impact="FC máxima teórica e capacidade de recuperação"
              howUsed="Calcula FC máxima (220 - idade) e ajusta volume/intensidade por faixa etária"
            />
          </label>
          <input type="number" value={formData.age} onChange={(e) => handleChange('age', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg" placeholder={t('agePlaceholder')} min="15" max="100" />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium mb-2">
            {t('gender')} *
            <AIFieldIcon
              label="Gênero"
              importance="high"
              impact="Ajustes hormonais e biomecânicos"
              howUsed="Considera diferenças fisiológicas e pode ajustar treino por ciclo menstrual"
            />
          </label>
          <select value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg">
            <option value="">{tCommon('select')}...</option>
            <option value="male">{t('genderOptions.male')}</option>
            <option value="female">{t('genderOptions.female')}</option>
          </select>
        </div>

        <div>
          <label className="flex items-center text-sm font-medium mb-2">
            {t('weight')} *
            <AIFieldIcon
              label="Peso"
              importance="high"
              impact="Cálculo de zonas de FC e ritmo recomendado"
              howUsed="Usado no cálculo do VDOT e ajuste de intensidade baseado em peso corporal"
            />
          </label>
          <input type="number" value={formData.weight} onChange={(e) => handleChange('weight', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg" placeholder={t('weightPlaceholder')} step="0.1" />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium mb-2">
            {t('height')} *
            <AIFieldIcon
              label="Altura"
              importance="medium"
              impact="Análise biomecânica e estimativa de passada"
              howUsed="Usado para estimar comprimento de passada ideal e postura"
            />
          </label>
          <input type="number" value={formData.height} onChange={(e) => handleChange('height', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg" placeholder={t('heightPlaceholder')} />
        </div>
      </div>

      {imc && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium">{t('bmi')}: <span className="text-2xl font-bold">{imc}</span> ({interpretIMC(imc)})</p>
        </div>
      )}
    </div>
  );
}
