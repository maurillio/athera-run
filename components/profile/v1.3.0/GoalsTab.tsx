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
  const [hasChanges, setHasChanges] = useState(false);

  const goals = [
    { value: 'finish_first_race', label: t('goals.options.finish_first_race') },
    { value: 'improve_time', label: t('goals.options.improve_time') },
    { value: 'health_fitness', label: t('goals.options.health_fitness') },
    { value: 'weight_loss', label: t('goals.options.weight_loss') },
    { value: 'challenge', label: t('goals.options.challenge') },
    { value: 'consistency', label: t('goals.options.consistency') },
  ];

  const handleSave = () => {
    onUpdate({ primaryGoal, motivation: motivation || null });
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
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

      <div>
        <label className="flex items-center gap-1 font-medium mb-2">
          {t('goals.motivation')}
          <AIFieldIcon
            label="Motivação"
            importance="medium"
            impact="Personalização e engajamento"
            howUsed="Usa para contextualizar mensagens e mantém você motivado durante treinos difíceis"
          />
          {getFieldStatus('motivation') && (
            <AIFieldStatus
              status={getFieldStatus('motivation')!.status}
              importance={getFieldStatus('motivation')!.importance}
              label="Motivação"
              variant="compact"
            />
          )}
        </label>
        <textarea value={motivation} onChange={(e) => { setMotivation(e.target.value); setHasChanges(true); }}
          className="w-full px-4 py-3 border rounded-lg h-24 resize-none"
          placeholder={t('goals.motivationPlaceholder')}/>
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
