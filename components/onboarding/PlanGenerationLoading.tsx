'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';
import { Progress } from '@/components/ui/progress';

interface PlanGenerationLoadingProps {
  onComplete?: () => void;
}

export default function PlanGenerationLoading({ onComplete }: PlanGenerationLoadingProps) {
  const t = useTranslations('loading.planGeneration');
  const [currentMessage, setCurrentMessage] = useState(0);
  const [progress, setProgress] = useState(0);

  // Mensagens de loading
  const messages = [
    "🏃 Colocando o óculos baixa pace...",
    "⚡ Tomando o gel de carboidrato...",
    "👟 Calçando o tênis de placa de carbono...",
    "💧 Hidratando para os 42km...",
    "📊 Calculando seu VDOT...",
    "🎯 Ajustando o ritmo dos treinos...",
    "📅 Planejando seus longões...",
    "💪 Preparando os treinos de força...",
    "🧘 Organizando os dias de descanso...",
    "🔥 Aquecendo para o primeiro treino...",
    "⏱️ Programando os intervalados...",
    "🏔️ Planejando as subidas...",
    "🎵 Montando a playlist perfeita...",
    "🌅 Marcando os treinos matinais...",
    "🏁 Visualizando sua chegada triunfante..."
  ];

  useEffect(() => {
    // Atualizar mensagem a cada 2 segundos
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => {
        if (prev < messages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2000);

    // Atualizar progresso suavemente
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 95) {
          return prev + 1;
        }
        return prev;
      });
    }, 300);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  // Completar quando chegar na última mensagem
  useEffect(() => {
    if (currentMessage === messages.length - 1 && progress >= 95) {
      setProgress(100);
      if (onComplete) {
        setTimeout(() => onComplete(), 1000);
      }
    }
  }, [currentMessage, progress, onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center z-50">
      <div className="max-w-md w-full px-6">
        {/* Animação */}
        <div className="text-center mb-8">
          <div className="inline-block animate-bounce mb-4">
            <div className="text-8xl">🏃‍♂️</div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Criando seu plano...
          </h2>
          <p className="text-gray-600 text-lg">
            Nossa IA está trabalhando para você!
          </p>
        </div>

        {/* Mensagem atual */}
        <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg mb-6">
          <div className="text-center">
            <p className="text-2xl mb-2">
              {messages[currentMessage].split(' ')[0]}
            </p>
            <p className="text-gray-700 text-lg font-medium">
              {messages[currentMessage].split(' ').slice(1).join(' ')}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-3" />
          <p className="text-center text-sm text-gray-600">
            {progress}% completo
          </p>
        </div>

        {/* Timeline de mensagens */}
        <div className="mt-6 max-h-32 overflow-y-auto">
          <div className="space-y-1">
            {messages.slice(0, currentMessage + 1).map((msg, idx) => (
              <div
                key={idx}
                className={`text-sm transition-opacity ${
                  idx === currentMessage
                    ? 'text-blue-600 font-semibold opacity-100'
                    : 'text-gray-400 opacity-60'
                }`}
              >
                {idx === currentMessage ? '▶' : '✓'} {msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
