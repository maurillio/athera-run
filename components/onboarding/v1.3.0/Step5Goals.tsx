'use client';
import { useState } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';

export default function Step5Goals({ data, onUpdate, onNext, onBack }: any) {
  const t = useTranslations('onboarding.step5');
  const tCommon = useTranslations('common');
  const [goal, setGoal] = useState(data.primaryGoal || '');
  const [motivation, setMotivation] = useState(data.motivation || '');
  
  // v1.3.0 - Motivação estruturada
  const [primaryMotivation, setPrimaryMotivation] = useState(
    data.motivationFactors?.primary || ''
  );
  const [secondaryMotivations, setSecondaryMotivations] = useState<string[]>(
    data.motivationFactors?.secondary || []
  );
  const [multipleGoals, setMultipleGoals] = useState<string[]>(
    data.motivationFactors?.goals || []
  );

  const goals = [
    { value: 'finish_first_race', label: t('goals.finish_first_race'), desc: t('goalDescriptions.finish_first_race') },
    { value: 'improve_time', label: t('goals.improve_time'), desc: t('goalDescriptions.improve_time') },
    { value: 'health_fitness', label: t('goals.health_fitness'), desc: t('goalDescriptions.health_fitness') },
    { value: 'weight_loss', label: t('goals.weight_loss'), desc: t('goalDescriptions.weight_loss') },
    { value: 'challenge', label: t('goals.challenge'), desc: t('goalDescriptions.challenge') },
    { value: 'consistency', label: t('goals.consistency'), desc: t('goalDescriptions.consistency') },
  ];

  const toggleSecondary = (value: string) => {
    setSecondaryMotivations(prev => 
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const toggleGoal = (value: string) => {
    setMultipleGoals(prev => 
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleNext = () => {
    if (!goal) return;
    onUpdate({ 
      primaryGoal: goal, 
      motivation: motivation || undefined,
      // v1.3.0 - Estruturado
      motivationFactors: {
        primary: primaryMotivation || goal,
        secondary: secondaryMotivations.length > 0 ? secondaryMotivations : undefined,
        goals: multipleGoals.length > 0 ? multipleGoals : undefined,
      }
    });
    onNext();
  };

  return (
    <div className="space-y-6">
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

      {/* v1.3.0 - Motivação Estruturada */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="font-semibold text-lg">🎯 Suas Motivações</h3>
        
        <div>
          <label className="block font-medium mb-2">Motivação Principal</label>
          <select
            value={primaryMotivation}
            onChange={(e) => setPrimaryMotivation(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Selecione...</option>
            <option value="saude">💪 Saúde e qualidade de vida</option>
            <option value="competicao">🏆 Competição e desempenho</option>
            <option value="emagrecimento">⚖️ Emagrecimento</option>
            <option value="desafio">🎯 Desafio pessoal</option>
            <option value="social">👥 Social e comunidade</option>
            <option value="mental">🧠 Saúde mental</option>
            <option value="diversao">😊 Diversão e prazer</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-2">Outras Motivações (selecione várias)</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'desafio', label: '🎯 Desafio' },
              { value: 'social', label: '👥 Social' },
              { value: 'mental', label: '🧠 Mental' },
              { value: 'diversao', label: '😊 Diversão' },
            ].filter(m => m.value !== primaryMotivation).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => toggleSecondary(value)}
                className={`px-3 py-2 text-sm rounded-lg transition-all ${
                  secondaryMotivations.includes(value)
                    ? 'bg-green-600 text-white'
                    : 'border border-gray-300 hover:border-green-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-medium mb-2">Objetivos Específicos</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'emagrecer', label: '⚖️ Emagrecer' },
              { value: 'competir', label: '🏆 Competir' },
              { value: 'rotina', label: '📅 Criar rotina' },
              { value: 'superar', label: '💪 Superar limites' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => toggleGoal(value)}
                className={`px-3 py-2 text-sm rounded-lg transition-all ${
                  multipleGoals.includes(value)
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:border-blue-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
