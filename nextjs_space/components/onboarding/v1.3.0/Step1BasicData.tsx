'use client';

import { useState } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';
import { validateStep1, OnboardingData } from '@/lib/onboarding-validator';
import { interpretRestingHR, calculateIMC, interpretIMC } from '@/lib/vdot-calculator';

interface Step1Props {
  data: Partial<OnboardingData>;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack?: () => void;
  onPrevious?: () => void;
}

export default function Step1BasicData({ data, onUpdate, onNext, onBack, onPrevious }: Step1Props) {
  const t = useTranslations('onboarding.step1');
  const tCommon = useTranslations('common');
  
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
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <ul className="list-disc list-inside space-y-1 text-red-700 text-sm">
            {errors.map((error, idx) => <li key={idx}>{error}</li>)}
          </ul>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t('age')} *</label>
          <input type="number" value={formData.age} onChange={(e) => handleChange('age', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg" placeholder={t('agePlaceholder')} min="15" max="100" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('gender')} *</label>
          <select value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg">
            <option value="">{tCommon('select')}...</option>
            <option value="male">{t('genderOptions.male')}</option>
            <option value="female">{t('genderOptions.female')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('weight')} *</label>
          <input type="number" value={formData.weight} onChange={(e) => handleChange('weight', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg" placeholder={t('weightPlaceholder')} step="0.1" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('height')} *</label>
          <input type="number" value={formData.height} onChange={(e) => handleChange('height', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg" placeholder={t('heightPlaceholder')} />
        </div>
      </div>

      {imc && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium">{t('bmi')}: <span className="text-2xl font-bold">{imc}</span> ({interpretIMC(imc)})</p>
        </div>
      )}

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">{t('physiological.title')} ({tCommon('optional')})</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('physiological.restingHR')} <span className="text-xs text-gray-500">{t('physiological.restingHRNote')}</span>
            </label>
            <input type="number" value={formData.restingHeartRate} onChange={(e) => handleChange('restingHeartRate', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg" placeholder={t('physiological.restingHRPlaceholder')} min="30" max="120" />
            {formData.restingHeartRate && (
              <p className="text-sm text-gray-600 mt-1">{interpretRestingHR(parseInt(formData.restingHeartRate as string))}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('physiological.sleepQuality')}: {formData.sleepQuality}/5</label>
            <input type="range" min="1" max="5" value={formData.sleepQuality}
              onChange={(e) => handleChange('sleepQuality', parseInt(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{t('physiological.sleepLevels.poor')}</span>
              <span>{t('physiological.sleepLevels.fair')}</span>
              <span>{t('physiological.sleepLevels.good')}</span>
              <span>{t('physiological.sleepLevels.veryGood')}</span>
              <span>{t('physiological.sleepLevels.excellent')}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('physiological.stressLevel')}: {formData.stressLevel}/5</label>
            <input type="range" min="1" max="5" value={formData.stressLevel}
              onChange={(e) => handleChange('stressLevel', parseInt(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{t('physiological.stressLevels.low')}</span>
              <span>{t('physiological.stressLevels.mild')}</span>
              <span>{t('physiological.stressLevels.moderate')}</span>
              <span>{t('physiological.stressLevels.high')}</span>
              <span>{t('physiological.stressLevels.veryHigh')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
