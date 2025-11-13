'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';

export default function Step5Lifestyle({ data, onUpdate, onNext, onBack }: any) {
  const t = useTranslations('onboarding.step5lifestyle');
  const tCommon = useTranslations('common');
  
  const [workDemand, setWorkDemand] = useState(data.workDemand || 'moderate');
  const [familyDemand, setFamilyDemand] = useState(data.familyDemand || 'moderate');

  // Auto-save com debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onUpdate({
        workDemand,
        familyDemand,
      });
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [workDemand, familyDemand, onUpdate]);

  const handleNext = () => {
    onUpdate({
      workDemand,
      familyDemand,
    });
    onNext();
  };

  const workOptions = [
    {
      value: 'sedentary',
      icon: '💼',
      title: 'Sedentário',
      description: 'Trabalho em escritório, sentado a maior parte do dia',
    },
    {
      value: 'moderate',
      icon: '🚶',
      title: 'Moderado',
      description: 'Alterno entre sentado e em movimento',
    },
    {
      value: 'physical',
      icon: '🏗️',
      title: 'Físico',
      description: 'Trabalho em pé ou com esforço físico constante',
    },
  ];

  const familyOptions = [
    {
      value: 'low',
      icon: '😌',
      title: 'Baixa',
      description: 'Moro sozinho(a) ou tenho bastante tempo livre',
    },
    {
      value: 'moderate',
      icon: '⚖️',
      title: 'Moderada',
      description: 'Tenho responsabilidades mas consigo organizar tempo',
    },
    {
      value: 'high',
      icon: '👨‍👩‍👧‍👦',
      title: 'Alta',
      description: 'Filhos pequenos ou muitas responsabilidades familiares',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🏡 Seu Contexto de Vida
        </h2>
        <p className="text-gray-600">
          Ajuda-nos a criar um plano realista e sustentável para sua rotina
        </p>
      </div>

      {/* Work Demand */}
      <div className="space-y-3">
        <label className="block font-semibold text-gray-900">
          Como é sua rotina de trabalho?
        </label>
        <p className="text-sm text-gray-600">
          Trabalho físico afeta recuperação e capacidade de treino
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setWorkDemand(option.value)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                workDemand === option.value
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{option.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">
                    {option.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {option.description}
                  </div>
                </div>
                {workDemand === option.value && (
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
        
        {workDemand === 'physical' && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              💡 <strong>Dica:</strong> Vamos ajustar o volume de treino para considerar 
              o desgaste físico do seu trabalho. Qualidade > Quantidade!
            </p>
          </div>
        )}
      </div>

      {/* Family Demand */}
      <div className="space-y-3">
        <label className="block font-semibold text-gray-900">
          Como é sua rotina familiar?
        </label>
        <p className="text-sm text-gray-600">
          Entender suas responsabilidades nos ajuda a criar treinos flexíveis
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {familyOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFamilyDemand(option.value)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                familyDemand === option.value
                  ? 'border-purple-600 bg-purple-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{option.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">
                    {option.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {option.description}
                  </div>
                </div>
                {familyDemand === option.value && (
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
        
        {familyDemand === 'high' && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              💡 <strong>Dica:</strong> Vamos priorizar treinos mais curtos e eficientes, 
              com flexibilidade para ajustes no dia a dia. Consistência > Perfeição!
            </p>
          </div>
        )}
      </div>

      {/* Summary / Context */}
      {(workDemand === 'physical' || familyDemand === 'high') && (
        <div className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Como isso afeta seu plano
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            {workDemand === 'physical' && (
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Volume de treino reduzido em ~10% para compensar desgaste do trabalho</span>
              </li>
            )}
            {familyDemand === 'high' && (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Treinos mais curtos e flexíveis (30-45min ao invés de 60min)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Foco em consistência realista ao invés de volume alto</span>
                </li>
              </>
            )}
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span className="font-medium">Plano adaptado para SUA realidade = maior chance de sucesso!</span>
            </li>
          </ul>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 pt-6 border-t">
        <button 
          onClick={onBack} 
          className="px-8 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
        >
          {tCommon('back')}
        </button>
        <button 
          onClick={handleNext} 
          className="flex-1 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-all shadow-md hover:shadow-lg"
        >
          {tCommon('next')}
        </button>
      </div>
    </div>
  );
}
