'use client';
import { useState } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';
import AIFieldIcon from '@/components/ai-transparency/AIFieldIcon';
import AIFieldStatus from '@/components/ai-transparency/AIFieldStatus';
import { useFieldAnalysis } from '@/hooks/useFieldAnalysis';

export default function GoalsTab({ userData, onUpdate }: any) {
  const t = useTranslations('profile');
  const { getFieldStatus } = useFieldAnalysis();
  
  const [primaryGoal, setPrimaryGoal] = useState(userData.primaryGoal || '');
  const [motivation, setMotivation] = useState(userData.motivation || '');
  
  // v3.1.0 - motivationFactors completo
  const motivationData = userData.motivationFactors || {};
  const [motivationPrimary, setMotivationPrimary] = useState(motivationData.primary || 'health');
  const [motivationSecondary, setMotivationSecondary] = useState(motivationData.secondary || []);
  const [motivationGoals, setMotivationGoals] = useState(motivationData.goals || []);
  
  const [hasChanges, setHasChanges] = useState(false);

  const goals = [
    { value: 'finish_first_race', label: t('goals.options.finish_first_race') },
    { value: 'improve_time', label: t('goals.options.improve_time') },
    { value: 'health_fitness', label: t('goals.options.health_fitness') },
    { value: 'weight_loss', label: t('goals.options.weight_loss') },
    { value: 'challenge', label: t('goals.options.challenge') },
    { value: 'consistency', label: t('goals.options.consistency') },
  ];

  const motivationOptions = [
    { value: 'health', label: '🏥 Saúde e Bem-estar', description: 'Melhorar saúde física e mental' },
    { value: 'challenge', label: '🎯 Desafio Pessoal', description: 'Superar limites e vencer desafios' },
    { value: 'competition', label: '🏆 Competição', description: 'Competir e buscar resultados' },
    { value: 'social', label: '👥 Social', description: 'Correr com amigos e comunidade' },
    { value: 'aesthetics', label: '💪 Estética', description: 'Melhorar forma física e aparência' },
    { value: 'stress', label: '🧘 Alívio de Estresse', description: 'Relaxar e desestressar' },
  ];

  const multiGoals = [
    { value: 'lose_weight', label: '⚖️ Emagrecer' },
    { value: 'compete', label: '🏅 Competir' },
    { value: 'improve_time', label: '⏱️ Melhorar Tempo' },
    { value: 'increase_distance', label: '📏 Aumentar Distância' },
    { value: 'prevent_injuries', label: '🛡️ Prevenir Lesões' },
    { value: 'increase_endurance', label: '💨 Aumentar Resistência' },
    { value: 'have_fun', label: '😊 Se Divertir' },
    { value: 'make_friends', label: '👫 Fazer Amigos' },
  ];

  const toggleSecondary = (value: string) => {
    if (motivationSecondary.includes(value)) {
      setMotivationSecondary(motivationSecondary.filter((v: string) => v !== value));
    } else {
      setMotivationSecondary([...motivationSecondary, value]);
    }
    setHasChanges(true);
  };

  const toggleGoal = (value: string) => {
    if (motivationGoals.includes(value)) {
      setMotivationGoals(motivationGoals.filter((v: string) => v !== value));
    } else {
      setMotivationGoals([...motivationGoals, value]);
    }
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate({ 
      primaryGoal, 
      motivation: motivation || null,
      // v3.1.0 - motivationFactors completo
      motivationFactors: {
        primary: motivationPrimary,
        secondary: motivationSecondary,
        goals: motivationGoals,
      }
    });
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Objetivo Principal (já existe) */}
      <div>
        <label className="flex items-center gap-1 font-medium mb-3">
          {t('goals.primaryGoal')}
          <AIFieldIcon
            label="Objetivo Principal"
            importance="high"
            impact="Foco e priorização do plano"
            howUsed="Define tipo de treinos enfatizados. Ex: melhorar tempo = mais intervalados, saúde = mais fácil"
          />
          {getFieldStatus('primaryGoal') && (
            <AIFieldStatus
              status={getFieldStatus('primaryGoal')!.status}
              importance={getFieldStatus('primaryGoal')!.importance}
              label="Objetivo"
              variant="compact"
            />
          )}
        </label>
        <div className="grid gap-2">
          {goals.map(g => (
            <button key={g.value}
              onClick={() => { setPrimaryGoal(g.value); setHasChanges(true); }}
              className={`text-left p-3 rounded-lg border transition-all ${
                primaryGoal === g.value ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
              }`}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* v3.1.0 - MOTIVAÇÃO COMPLETA */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-lg font-semibold">💪 Sua Motivação Completa</h3>

        {/* Motivação Primária */}
        <div>
          <label className="flex items-center gap-1 text-sm font-medium mb-3">
            Motivação Principal
            <AIFieldIcon
              label="Motivação Principal"
              importance="high"
              impact="Foco do plano"
              howUsed="Define abordagem geral: saúde = sustentável, competição = agressivo, social = flexível"
            />
          </label>
          <div className="grid gap-2">
            {motivationOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setMotivationPrimary(opt.value); setHasChanges(true); }}
                className={`text-left p-4 rounded-lg border transition-all ${
                  motivationPrimary === opt.value 
                    ? 'border-green-600 bg-green-50 ring-2 ring-green-200' 
                    : 'border-gray-300 hover:border-green-400'
                }`}
              >
                <p className="font-medium">{opt.label}</p>
                <p className="text-xs text-gray-600 mt-1">{opt.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Motivações Secundárias */}
        <div>
          <label className="flex items-center gap-1 text-sm font-medium mb-3">
            Motivações Secundárias (opcional - selecione várias)
            <AIFieldIcon
              label="Motivações Secundárias"
              importance="medium"
              impact="Contexto adicional"
              howUsed="Enriquece personalização com múltiplos aspectos motivacionais"
            />
          </label>
          <div className="grid md:grid-cols-2 gap-2">
            {motivationOptions.filter(opt => opt.value !== motivationPrimary).map(opt => (
              <button
                key={opt.value}
                onClick={() => toggleSecondary(opt.value)}
                className={`text-left p-3 rounded-lg border transition-all ${
                  motivationSecondary.includes(opt.value)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <p className="text-sm font-medium">{opt.label}</p>
              </button>
            ))}
          </div>
          {motivationSecondary.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {motivationSecondary.map((val: string) => {
                const opt = motivationOptions.find(o => o.value === val);
                return opt ? (
                  <span key={val} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {opt.label}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Objetivos Múltiplos */}
        <div>
          <label className="flex items-center gap-1 text-sm font-medium mb-3">
            Objetivos Específicos (selecione todos que se aplicam)
            <AIFieldIcon
              label="Objetivos Múltiplos"
              importance="medium"
              impact="Prioridades do plano"
              howUsed="IA balanceia treinos para atender múltiplos objetivos simultaneamente"
            />
          </label>
          <div className="grid md:grid-cols-2 gap-2">
            {multiGoals.map(goal => (
              <button
                key={goal.value}
                onClick={() => toggleGoal(goal.value)}
                className={`text-left p-3 rounded-lg border transition-all ${
                  motivationGoals.includes(goal.value)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-400'
                }`}
              >
                <p className="text-sm font-medium">{goal.label}</p>
              </button>
            ))}
          </div>
          {motivationGoals.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {motivationGoals.map((val: string) => {
                const goal = multiGoals.find(g => g.value === val);
                return goal ? (
                  <span key={val} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {goal.label}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>

      {/* Notas Pessoais de Motivação (texto livre) */}
      <div className="border-t pt-6">
        <label className="flex items-center gap-1 font-medium mb-2">
          📝 Notas Pessoais de Motivação (opcional)
          <AIFieldIcon
            label="Notas Motivacionais"
            importance="low"
            impact="Mensagens personalizadas"
            howUsed="IA usa para criar mensagens motivacionais específicas para você"
          />
        </label>
        <textarea 
          value={motivation} 
          onChange={(e) => { setMotivation(e.target.value); setHasChanges(true); }}
          className="w-full px-4 py-3 border rounded-lg h-24 resize-none"
          placeholder="Ex: Quero provar para mim mesmo que consigo. Corrida me ajuda a limpar a mente depois do trabalho..."
        />
        <p className="text-xs text-gray-600 mt-1">
          Compartilhe o que realmente te motiva a correr. A IA vai usar isso para te encorajar nos momentos difíceis!
        </p>
      </div>

      {hasChanges && (
        <button onClick={handleSave}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
          {t('saveChanges')}
        </button>
      )}
    </div>
  );
}
