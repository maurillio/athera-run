'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';

export default function Step5Goals({ data, onUpdate, onNext, onBack }: any) {
  const t = useTranslations('onboarding.step5');
  const tCommon = useTranslations('common');
  
  // Race goal fields (critical for plan generation) - NO TOPO
  const [raceName, setRaceName] = useState(data.raceName || '');
  const [goalDistance, setGoalDistance] = useState(data.goalDistance || '');
  const [targetRaceDate, setTargetRaceDate] = useState(data.targetRaceDate || '');
  const [targetTime, setTargetTime] = useState(data.targetTime || '');
  
  // Goal selection
  const [goal, setGoal] = useState(data.primaryGoal || '');
  
  // Motivation - POR ÚLTIMO
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

  // Auto-save crítico para goalDistance e targetRaceDate
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onUpdate({
        raceName: raceName || undefined,
        goalDistance: goalDistance || undefined,
        targetRaceDate: targetRaceDate || undefined,
        targetTime: targetTime || undefined,
        primaryGoal: goal || undefined,
        motivation: motivation || undefined,
        motivationFactors: {
          primary: primaryMotivation || goal,
          secondary: secondaryMotivations.length > 0 ? secondaryMotivations : undefined,
          goals: multipleGoals.length > 0 ? multipleGoals : undefined,
        }
      });
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [raceName, goal, motivation, goalDistance, targetRaceDate, targetTime, primaryMotivation, secondaryMotivations, multipleGoals, onUpdate]);

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
    // v1.5.4 - CRITICAL: goalDistance and targetRaceDate are required for plan generation
    if (!goalDistance) {
      alert(t('selectDistanceRequired') || 'Por favor, selecione a distância da sua corrida alvo. Essa informação é necessária para gerar seu plano de treino personalizado.');
      return;
    }
    
    if (!targetRaceDate) {
      alert(t('selectRaceDateRequired') || 'Por favor, informe a data aproximada da sua prova. Não precisa ser a data exata, mas precisamos saber quando você pretende correr para planejar seu treino adequadamente.');
      return;
    }
    
    if (!goal) {
      alert(t('selectGoalFirst') || 'Por favor, selecione um objetivo');
      return;
    }
    
    const updateData = { 
      // Race goal data - REQUIRED for plan generation (v1.5.4)
      raceName: raceName || undefined,
      goalDistance: goalDistance,
      targetRaceDate: targetRaceDate,
      targetTime: targetTime || undefined,
      primaryGoal: goal, 
      motivation: motivation || undefined,
      // v1.3.0 - Estruturado
      motivationFactors: {
        primary: primaryMotivation || goal,
        secondary: secondaryMotivations.length > 0 ? secondaryMotivations : undefined,
        goals: multipleGoals.length > 0 ? multipleGoals : undefined,
      }
    };
    
    console.log('📤 Step5Goals - Sending data:', updateData);
    onUpdate(updateData);
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* 1. RACE GOAL INFORMATION - NO TOPO */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border-2 border-orange-300">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl">🏁</span>
          <div className="flex-1">
            <h3 className="font-bold text-xl text-orange-900">
              Informações da Corrida Alvo
            </h3>
            <p className="text-sm text-orange-700 mt-1">
              A IA usa essas informações para criar seu plano de treino personalizado
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Nome da Corrida - OPCIONAL */}
          <div>
            <label className="block font-medium mb-2 text-gray-900">
              📝 Nome da Corrida <span className="text-gray-500 text-sm">(Opcional)</span>
            </label>
            <input
              type="text"
              value={raceName}
              onChange={(e) => setRaceName(e.target.value)}
              placeholder="Ex: Meia Maratona de São Paulo, Corrida do Parque..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
            <p className="text-xs text-gray-600 mt-1">
              💡 Opcional: Ajuda a organizar suas corridas no perfil
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Distância - OBRIGATÓRIO */}
            <div>
              <label className="block font-medium mb-2 text-gray-900">
                📏 Distância da Prova <span className="text-red-600">*</span>
              </label>
              <select
                value={goalDistance}
                onChange={(e) => setGoalDistance(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg bg-white text-lg ${
                  goalDistance ? 'border-green-400 focus:border-green-500' : 'border-gray-300 focus:border-orange-500'
                }`}
                required
              >
                <option value="">Selecione a distância...</option>
                <option value="5k">5km</option>
                <option value="10k">10km</option>
                <option value="21k">Meia Maratona (21km)</option>
                <option value="42k">Maratona (42km)</option>
              </select>
            </div>

            {/* Data - OBRIGATÓRIO */}
            <div>
              <label className="block font-medium mb-2 text-gray-900">
                📅 Data da Prova <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={targetRaceDate}
                onChange={(e) => setTargetRaceDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border-2 rounded-lg bg-white text-lg ${
                  targetRaceDate ? 'border-green-400 focus:border-green-500' : 'border-gray-300 focus:border-orange-500'
                }`}
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                💡 Pode ser uma data aproximada
              </p>
            </div>
          </div>

          {/* Tempo Alvo - OPCIONAL */}
          <div>
            <label className="block font-medium mb-2 text-gray-900">
              ⏱️ Tempo Alvo <span className="text-gray-500 text-sm">(Opcional)</span>
            </label>
            <input
              type="text"
              value={targetTime}
              onChange={(e) => setTargetTime(e.target.value)}
              placeholder="Ex: 45:00, 1:30:00, 3:45:00"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white focus:border-orange-500"
            />
            <p className="text-xs text-gray-600 mt-1">
              Formato: MM:SS ou H:MM:SS (Ex: 45:00 para 45 minutos)
            </p>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY GOAL SELECTION */}
      <div className="border-t pt-6">
        <label className="block font-semibold mb-3 text-blue-900 text-lg">
          🎯 Qual é seu objetivo principal? <span className="text-red-600">*</span>
        </label>
        <div className="grid gap-3">
          {goals.map(g => (
            <button 
              key={g.value}
              type="button"
              onClick={() => setGoal(g.value)}
              className={`text-left p-4 rounded-lg border-2 transition-all ${
                goal === g.value 
                  ? 'border-blue-600 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="font-semibold text-lg">{g.label}</div>
              <div className="text-sm text-gray-600 mt-1">{g.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. MOTIVAÇÃO ESTRUTURADA */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="font-semibold text-lg text-purple-900">💪 Suas Motivações</h3>
        
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
                type="button"
                onClick={() => toggleSecondary(value)}
                className={`px-3 py-2 text-sm rounded-lg transition-all ${
                  secondaryMotivations.includes(value)
                    ? 'bg-green-600 text-white shadow-md'
                    : 'border border-gray-300 hover:border-green-400 hover:bg-green-50'
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
                type="button"
                onClick={() => toggleGoal(value)}
                className={`px-3 py-2 text-sm rounded-lg transition-all ${
                  multipleGoals.includes(value)
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'border border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. MOTIVAÇÃO LIVRE - POR ÚLTIMO */}
      <div className="border-t pt-6">
        <label className="block font-medium mb-2 text-gray-900">
          ✍️ O que te motiva? <span className="text-gray-500 text-sm">(Opcional)</span>
        </label>
        <textarea 
          value={motivation} 
          onChange={(e) => setMotivation(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg h-32 resize-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          placeholder="Ex: Quero correr uma meia maratona com meu irmão, é um sonho antigo. Sempre admirei corredores e quero fazer parte desse mundo..."
        />
        <p className="text-xs text-gray-600 mt-1">
          💡 Quanto mais detalhes, mais personalizado será seu plano de treino!
        </p>
      </div>
    </div>
  );
}
