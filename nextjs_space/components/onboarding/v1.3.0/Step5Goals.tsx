'use client';
import { useState } from 'react';

export default function Step5Goals({ data, onUpdate, onNext, onBack }: any) {
  const [goal, setGoal] = useState(data.primaryGoal || '');
  const [motivation, setMotivation] = useState(data.motivation || '');

  const goals = [
    { value: 'finish_first_race', label: '🎯 Completar minha primeira corrida', desc: 'Foco em terminar com segurança' },
    { value: 'improve_time', label: '⚡ Melhorar meu tempo', desc: 'Buscar novo PR' },
    { value: 'health_fitness', label: '💪 Saúde e bem-estar', desc: 'Manter forma física' },
    { value: 'weight_loss', label: '🏃 Perder peso', desc: 'Emagrecimento saudável' },
    { value: 'challenge', label: '🏆 Completar desafio específico', desc: 'Meta pessoal importante' },
    { value: 'consistency', label: '📅 Criar rotina consistente', desc: 'Hábito de treino regular' },
  ];

  const handleNext = () => {
    if (!goal) return;
    onUpdate({ primaryGoal: goal, motivation: motivation || undefined });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Seu Objetivo Principal</h2>
        <p className="text-gray-600">O que você quer alcançar?</p>
      </div>

      <div className="grid gap-3">
        {goals.map(g => (
          <button key={g.value}
            onClick={() => setGoal(g.value)}
            className={`text-left p-4 rounded-lg border-2 transition-all ${
              goal === g.value 
                ? 'border-blue-600 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}>
            <div className="font-semibold text-lg">{g.label}</div>
            <div className="text-sm text-gray-600 mt-1">{g.desc}</div>
          </button>
        ))}
      </div>

      <div className="border-t pt-6">
        <label className="block font-medium mb-2">O que te motiva? (Opcional)</label>
        <textarea value={motivation} onChange={(e) => setMotivation(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg h-24 resize-none"
          placeholder="Ex: Quero correr uma meia maratona com meu irmão, é um sonho antigo..."/>
        <p className="text-xs text-gray-500 mt-1">Quanto mais detalhes, mais personalizado será seu plano!</p>
      </div>

      <div className="flex justify-between pt-6">
        <button onClick={onBack} className="px-6 py-2 border rounded-lg">Voltar</button>
        <button onClick={handleNext} disabled={!goal}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
          Próximo
        </button>
      </div>
    </div>
  );
}
