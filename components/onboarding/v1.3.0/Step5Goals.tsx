'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';

type GoalType = 'race' | 'start' | 'fitness';

const GOAL_CONFIGS = {
  race: {
    type: 'race',
    requiresDetails: true,
    label: 'Tenho uma corrida/prova em mente',
    icon: '🏁',
    description: 'Você já sabe qual prova quer fazer e quando',
  },
  start: {
    type: 'start',
    requiresDetails: false,
    label: 'Quero começar a correr',
    icon: '🏃',
    description: 'Iniciante que quer começar do zero',
    defaults: {
      goalDistance: '5k',
      weeksAhead: 12,
      message: 'Perfeito! Vamos te ajudar a completar seus primeiros 5km de forma confortável e segura.',
      aiContext: 'beginner_base'
    }
  },
  fitness: {
    type: 'fitness',
    requiresDetails: false,
    label: 'Ganhar condicionamento geral',
    icon: '💪',
    description: 'Quer melhorar fitness e resistência',
    defaults: {
      goalDistance: '10k',
      weeksAhead: 16,
      message: 'Excelente! Vamos construir uma base sólida de condicionamento para você.',
      aiContext: 'fitness_build'
    }
  }
};

export default function Step5Goals({ data, onUpdate, onNext, onBack }: any) {
  const t = useTranslations('onboarding.step5');
  const tCommon = useTranslations('common');
  
  // Tipo de objetivo - NOVA LÓGICA (não vem nada pré-selecionado)
  const [goalType, setGoalType] = useState<GoalType | ''>(
    data.goalType || ''
  );
  
  // Race goal fields
  const [raceName, setRaceName] = useState(data.raceName || '');
  const [goalDistance, setGoalDistance] = useState(data.goalDistance || '');
  const [targetRaceDate, setTargetRaceDate] = useState(data.targetRaceDate || '');
  
  // Tempo alvo - separado em H:M:S para melhor UX
  const [timeHours, setTimeHours] = useState('');
  const [timeMinutes, setTimeMinutes] = useState('');
  const [timeSeconds, setTimeSeconds] = useState('');
  
  // Inicializa tempo se já existir
  useEffect(() => {
    if (data.targetTime) {
      const parts = data.targetTime.split(':');
      if (parts.length >= 2) {
        setTimeHours(parts[0] || '0');
        setTimeMinutes(parts[1] || '0');
        setTimeSeconds(parts[2] || '0');
      }
    }
  }, []);
  
  // Calcula targetTime formatado
  const targetTime = (timeHours || timeMinutes || timeSeconds) 
    ? `${timeHours || '0'}:${(timeMinutes || '0').padStart(2, '0')}:${(timeSeconds || '0').padStart(2, '0')}`
    : '';
  
  // Goal selection
  const [goal, setGoal] = useState(data.primaryGoal || '');
  
  // Motivation
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

  // Função para calcular data futura
  const calculateFutureDate = (weeks: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + (weeks * 7));
    return date.toISOString().split('T')[0];
  };

  // Auto-aplicar defaults quando muda goalType
  useEffect(() => {
    if (goalType && goalType !== 'race') {
      // Aplica defaults para objetivos abertos
      const config = GOAL_CONFIGS[goalType];
      setGoalDistance(config.defaults.goalDistance);
      setTargetRaceDate(calculateFutureDate(config.defaults.weeksAhead));
      setRaceName(''); // Limpa nome da corrida para objetivos abertos
    } else if (goalType === 'race') {
      // Limpa campos quando escolhe corrida alvo
      // Só limpa se não tiver dados anteriores salvos
      if (!data.goalDistance) {
        setGoalDistance('');
        setTargetRaceDate('');
        setRaceName('');
      }
    }
  }, [goalType]);

  // Auto-save
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const isOpenGoal = goalType !== 'race';
      
      onUpdate({
        goalType: goalType,
        isOpenGoal: isOpenGoal,
        raceName: goalType === 'race' ? (raceName || undefined) : undefined,
        goalDistance: goalDistance || undefined,
        targetRaceDate: targetRaceDate || undefined,
        targetTime: goalType === 'race' ? (targetTime || undefined) : undefined,
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
  }, [goalType, raceName, goal, motivation, goalDistance, targetRaceDate, targetTime, timeHours, timeMinutes, timeSeconds, primaryMotivation, secondaryMotivations, multipleGoals, onUpdate]);

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
    // Validação do tipo de objetivo PRIMEIRO
    if (!goalType) {
      alert('Por favor, selecione sua situação atual (corrida alvo, começar a correr ou condicionamento).');
      return;
    }
    
    // Validação baseada no tipo de objetivo
    if (goalType === 'race') {
      if (!goalDistance) {
        alert('Por favor, selecione a distância da sua corrida alvo.');
        return;
      }
      
      if (!targetRaceDate) {
        alert('Por favor, informe a data aproximada da sua prova.');
        return;
      }
    }
    // Para start/fitness, os defaults já foram aplicados
    
    if (!goal) {
      alert('Por favor, selecione um objetivo principal');
      return;
    }
    
    const isOpenGoal = goalType !== 'race';
    
    const updateData = { 
      goalType: goalType,
      isOpenGoal: isOpenGoal,
      raceName: goalType === 'race' ? (raceName || undefined) : undefined,
      goalDistance: goalDistance,
      targetRaceDate: targetRaceDate,
      targetTime: goalType === 'race' ? (targetTime || undefined) : undefined,
      primaryGoal: goal, 
      motivation: motivation || undefined,
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
      {/* 1. SELEÇÃO DO TIPO DE OBJETIVO - PRIMEIRO E DESTACADO */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-purple-300">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl">🎯</span>
          <div>
            <h3 className="font-bold text-xl text-purple-900 mb-2">
              Qual é sua situação atual?
            </h3>
            <p className="text-sm text-purple-700">
              Escolha a opção que melhor descreve seu objetivo
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {(Object.keys(GOAL_CONFIGS) as GoalType[]).map((type) => {
            const config = GOAL_CONFIGS[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => setGoalType(type)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  goalType === type
                    ? 'border-purple-600 bg-purple-100 shadow-lg'
                    : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{config.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-gray-900">
                      {config.label}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {config.description}
                    </div>
                  </div>
                  {goalType === type && (
                    <span className="text-purple-600 font-bold text-xl">✓</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CAMPOS CONDICIONAIS BASEADOS NO TIPO */}
      
      {/* SE TEM CORRIDA ALVO */}
      {goalType === 'race' && (
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
            <div>
              <label className="block font-medium mb-2 text-gray-900">
                📝 Nome da Corrida <span className="text-gray-500 text-sm">(Opcional)</span>
              </label>
              <input
                type="text"
                value={raceName}
                onChange={(e) => setRaceName(e.target.value)}
                placeholder="Ex: Meia Maratona de São Paulo"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2 text-gray-900">
                  📏 Distância da Prova <span className="text-red-600">*</span>
                </label>
                <select
                  value={goalDistance}
                  onChange={(e) => setGoalDistance(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg bg-white text-lg ${
                    goalDistance ? 'border-green-400' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="5k">5km</option>
                  <option value="10k">10km</option>
                  <option value="21k">Meia Maratona (21km)</option>
                  <option value="42k">Maratona (42km)</option>
                </select>
              </div>

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
                    targetRaceDate ? 'border-green-400' : 'border-gray-300'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-2 text-gray-900">
                ⏱️ Tempo Alvo <span className="text-gray-500 text-sm">(Opcional)</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">Horas</label>
                  <input
                    type="number"
                    value={timeHours}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 9)) {
                        setTimeHours(val);
                      }
                    }}
                    className="w-full px-4 py-3 text-2xl text-center border-2 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    min="0"
                    max="9"
                    placeholder="0"
                  />
                </div>
                <div className="text-2xl font-bold text-gray-400 pt-6">:</div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">Minutos</label>
                  <input
                    type="number"
                    value={timeMinutes}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 59)) {
                        setTimeMinutes(val);
                      }
                    }}
                    className="w-full px-4 py-3 text-2xl text-center border-2 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    min="0"
                    max="59"
                    placeholder="00"
                  />
                </div>
                <div className="text-2xl font-bold text-gray-400 pt-6">:</div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">Segundos</label>
                  <input
                    type="number"
                    value={timeSeconds}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 59)) {
                        setTimeSeconds(val);
                      }
                    }}
                    className="w-full px-4 py-3 text-2xl text-center border-2 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    min="0"
                    max="59"
                    placeholder="00"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                💡 Exemplo: 1h 30min 00seg para uma meia maratona
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SE COMEÇAR A CORRER OU CONDICIONAMENTO */}
      {goalType && goalType !== 'race' && goalType in GOAL_CONFIGS && (
        <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg border-2 border-green-300">
          <div className="flex items-start gap-3">
            <span className="text-4xl">{GOAL_CONFIGS[goalType as GoalType].icon}</span>
            <div>
              <h3 className="font-bold text-xl text-green-900 mb-2">
                {GOAL_CONFIGS[goalType as GoalType].defaults.message}
              </h3>
              <div className="space-y-2 text-sm text-green-800">
                <p>
                  <strong>Meta inicial:</strong> Completar <strong>{GOAL_CONFIGS[goalType as GoalType].defaults.goalDistance}</strong> confortavelmente
                </p>
                <p>
                  <strong>Prazo estimado:</strong> {GOAL_CONFIGS[goalType as GoalType].defaults.weeksAhead} semanas
                </p>
                <p className="mt-3 text-green-700">
                  💡 A IA vai criar um plano progressivo focado em:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Criar hábito de corrida</li>
                  <li>Evitar lesões</li>
                  <li>Progressão gradual e sustentável</li>
                  <li>Ritmo confortável (você consegue conversar)</li>
                </ul>
                <p className="mt-3 text-xs text-green-600 bg-green-100 p-2 rounded">
                  ✓ Você pode ajustar ou adicionar uma corrida específica depois no seu perfil!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. PRIMARY GOAL SELECTION */}
      <div className="border-t pt-6">
        <label className="block font-semibold mb-3 text-blue-900 text-lg">
          🎯 Qual é seu objetivo principal com a corrida? <span className="text-red-600">*</span>
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

      {/* 4. MOTIVAÇÃO ESTRUTURADA */}
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

      {/* 5. MOTIVAÇÃO LIVRE */}
      <div className="border-t pt-6">
        <label className="block font-medium mb-2 text-gray-900">
          ✍️ O que te motiva? <span className="text-gray-500 text-sm">(Opcional)</span>
        </label>
        <textarea 
          value={motivation} 
          onChange={(e) => setMotivation(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg h-32 resize-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          placeholder="Ex: Quero correr uma meia maratona com meu irmão, é um sonho antigo..."
        />
        <p className="text-xs text-gray-600 mt-1">
          💡 Quanto mais detalhes, mais personalizado será seu plano!
        </p>
      </div>
    </div>
  );
}
