'use client';
import { useState } from 'react';
import Step1BasicData from './Step1BasicData';
import Step2SportBackground from './Step2SportBackground';
import Step3Performance from './Step3Performance';
import Step4Health from './Step4Health';
import Step5Lifestyle from './Step5Lifestyle';
import Step5Goals from './Step5Goals';
import Step6Availability from './Step6Availability';
import Step7Review from './Step7Review';

interface OnboardingV130Props {
  onComplete: (data: any) => void;
  initialData?: any;
}

export default function OnboardingV130({ onComplete, initialData = {} }: OnboardingV130Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState(initialData);

  const updateData = (newData: any) => {
    setData({ ...data, ...newData });
  };

  const handleNext = () => {
    if (currentStep < 8) { // v2.5.0: Agora são 8 steps
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const steps = [
    { num: 1, title: 'Dados Básicos', component: Step1BasicData },
    { num: 2, title: 'Base Esportiva', component: Step2SportBackground },
    { num: 3, title: 'Performance', component: Step3Performance },
    { num: 4, title: 'Saúde', component: Step4Health },
    { num: 5, title: 'Estilo de Vida', component: Step5Lifestyle }, // v2.5.0: Novo step
    { num: 6, title: 'Objetivos', component: Step5Goals },
    { num: 7, title: 'Disponibilidade', component: Step6Availability },
    { num: 8, title: 'Revisão', component: Step7Review },
  ];

  const CurrentStepComponent = steps[currentStep - 1].component;
  const progress = (currentStep / 8) * 100; // v2.5.0: Atualizado para 8 steps

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Etapa {currentStep} de 8
            </span>
            <span className="text-sm font-medium text-blue-600">
              {Math.round(progress)}% completo
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Steps indicator */}
          <div className="flex justify-between mt-4">
            {steps.map((step) => (
              <div key={step.num} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    step.num < currentStep
                      ? 'bg-green-500 text-white'
                      : step.num === currentStep
                      ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.num < currentStep ? '✓' : step.num}
                </div>
                <span className="text-xs text-gray-600 mt-1 hidden md:block">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <CurrentStepComponent
            data={data}
            onUpdate={updateData}
            onNext={handleNext}
            onBack={currentStep > 1 ? handleBack : undefined}
          />
        </div>

        {/* Help text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            💡 Todas as informações são confidenciais e usadas apenas para personalizar seu treino
          </p>
        </div>
      </div>
    </div>
  );
}
