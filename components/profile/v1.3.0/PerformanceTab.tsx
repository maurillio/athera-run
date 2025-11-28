'use client';
import { useState } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';
import { calculateVDOTFromTime, interpretVDOT } from '@/lib/vdot-calculator';
import AIFieldIcon from '@/components/ai-transparency/AIFieldIcon';
import AIFieldStatus from '@/components/ai-transparency/AIFieldStatus';
import { useFieldAnalysis } from '@/hooks/useFieldAnalysis';

export default function PerformanceTab({ userData, onUpdate }: any) {
  const t = useTranslations('profile.performance');
  const { getFieldStatus } = useFieldAnalysis();
  
  // Estados de experiência de corrida
  const [runningLevel, setRunningLevel] = useState(userData.runningLevel || 'beginner');
  const [runningYears, setRunningYears] = useState(userData.runningYears || 0);
  const [currentWeeklyKm, setCurrentWeeklyKm] = useState(userData.currentWeeklyKm || 0);
  const [longestRun, setLongestRun] = useState(userData.longestRun || 0);
  const [otherSportsExperience, setOtherSportsExperience] = useState(userData.otherSportsExperience || '');
  const [otherSportsYears, setOtherSportsYears] = useState(userData.otherSportsYears || 0); // v3.1.0
  
  // v3.1.0 - Campos de experiência detalhados
  const [experienceDescription, setExperienceDescription] = useState(userData.experienceDescription || '');
  const [experienceAnalysis] = useState(userData.experienceAnalysis || ''); // read-only
  
  // Estados de performance (já existentes)
  const [bestTimes, setBestTimes] = useState(userData.bestTimes || {});
  const [hasChanges, setHasChanges] = useState(false);

  const distances = [
    { value: '5k', label: t('distances.5k'), meters: 5000 },
    { value: '10k', label: t('distances.10k'), meters: 10000 },
    { value: '21k', label: t('distances.21k'), meters: 21097 },
    { value: '42k', label: t('distances.42k'), meters: 42195 },
  ];
  
  const levels = [
    { value: 'beginner', label: t('levels.beginner') },
    { value: 'intermediate', label: t('levels.intermediate') },
    { value: 'advanced', label: t('levels.advanced') },
  ];

  const handleSave = () => {
    onUpdate({ 
      // Experiência de corrida
      runningLevel,
      runningYears: runningYears ? parseInt(runningYears.toString()) : null,
      currentWeeklyKm: currentWeeklyKm ? parseFloat(currentWeeklyKm.toString()) : null,
      longestRun: longestRun ? parseFloat(longestRun.toString()) : null,
      otherSportsExperience: otherSportsExperience || null,
      otherSportsYears: otherSportsYears ? parseInt(otherSportsYears.toString()) : null, // v3.1.0
      experienceDescription: experienceDescription || null, // v3.1.0
      // Melhores tempos
      bestTimes: Object.keys(bestTimes).length > 0 ? bestTimes : null 
    });
    setHasChanges(false);
  };

  const removeTime = (dist: string) => {
    const { [dist]: _, ...rest } = bestTimes;
    setBestTimes(rest);
    setHasChanges(true);
  };

  const bestVDOT = Object.values(bestTimes).reduce((max: number, t: any) => 
    t.vdot > max ? t.vdot : max, 0);

  return (
    <div className="space-y-8">
      {/* 🏃 RESUMO DE EXPERIÊNCIA - DESTAQUE VISUAL */}
      <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          🏃 Sua Experiência de Corrida
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Nível */}
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Nível Atual</div>
            <div className="text-xl font-bold">
              {runningLevel === 'beginner' && '🟢 Iniciante'}
              {runningLevel === 'intermediate' && '🟡 Intermediário'}
              {runningLevel === 'advanced' && '🔴 Avançado'}
            </div>
          </div>

          {/* Anos de corrida */}
          {runningYears > 0 && (
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Anos Correndo</div>
              <div className="text-xl font-bold">{runningYears} {runningYears === 1 ? 'ano' : 'anos'}</div>
            </div>
          )}

          {/* Volume semanal */}
          {currentWeeklyKm > 0 && (
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Volume Semanal Atual</div>
              <div className="text-xl font-bold">{currentWeeklyKm} km/semana</div>
            </div>
          )}

          {/* Longão mais longo */}
          {longestRun > 0 && (
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Longão Mais Longo</div>
              <div className="text-xl font-bold text-amber-600">{longestRun} km</div>
            </div>
          )}
        </div>

        {/* Outros Esportes */}
        {otherSportsExperience && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="text-sm text-gray-600 mb-1">🎾 Outros Esportes</div>
            <div className="text-base">{otherSportsExperience}</div>
          </div>
        )}
      </div>

      {/* RESUMO RÁPIDO DE PERFORMANCE */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700 font-medium">Nível Atual</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {levels.find(l => l.value === runningLevel)?.label || 'Não definido'}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 font-medium">Tempos Salvos</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {Object.keys(bestTimes).length}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-700 font-medium">Melhor VDOT</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            {bestVDOT > 0 ? bestVDOT : 'N/A'}
          </p>
        </div>
      </div>
      
      {/* SEÇÃO 1: EXPERIÊNCIA DE CORRIDA */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🏃 {t('experienceTitle')}
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* Nível */}
          <div>
            <label className="flex items-center gap-1 text-sm font-medium mb-2">
              {t('runningLevel')}
              <AIFieldIcon
                label="Nível de Experiência"
                importance="critical"
                impact="Estrutura base do plano e progressão"
                howUsed="Define complexidade dos treinos, volume inicial e taxa de progressão segura"
              />
              {getFieldStatus('runningLevel') && (
                <AIFieldStatus
                  status={getFieldStatus('runningLevel')!.status}
                  importance={getFieldStatus('runningLevel')!.importance}
                  label="Nível"
                  variant="compact"
                />
              )}
            </label>
            <select 
              value={runningLevel}
              onChange={(e) => { setRunningLevel(e.target.value); setHasChanges(true); }}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {levels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
          
          {/* Anos */}
          <div>
            <label className="flex items-center gap-1 text-sm font-medium mb-2">
              {t('yearsRunning')}
              <AIFieldIcon
                label="Anos de Experiência"
                importance="medium"
                impact="Adaptação neuromuscular e resiliência"
                howUsed="Influencia velocidade de progressão e complexidade de treinos. Mais anos = progressão mais rápida"
              />
              {getFieldStatus('runningYears') && (
                <AIFieldStatus
                  status={getFieldStatus('runningYears')!.status}
                  importance={getFieldStatus('runningYears')!.importance}
                  label="Anos"
                  variant="compact"
                />
              )}
            </label>
            <input
              type="number"
              value={runningYears}
              onChange={(e) => { setRunningYears(e.target.value); setHasChanges(true); }}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              min="0"
              max="50"
            />
            <p className="text-xs text-gray-600 mt-1">{t('yearsHelp')}</p>
          </div>
          
          {/* Volume Semanal */}
          <div>
            <label className="flex items-center gap-1 text-sm font-medium mb-2">
              {t('currentWeeklyKm')}
              <AIFieldIcon
                label="Quilometragem Semanal Atual"
                importance="critical"
                impact="Volume inicial do plano e progressão"
                howUsed="Ponto de partida para progressão segura (regra dos 10%). Evita sobrecarga e lesões"
              />
              {getFieldStatus('currentWeeklyKm') && (
                <AIFieldStatus
                  status={getFieldStatus('currentWeeklyKm')!.status}
                  importance={getFieldStatus('currentWeeklyKm')!.importance}
                  label="Volume"
                  variant="compact"
                />
              )}
            </label>
            <input
              type="number"
              value={currentWeeklyKm}
              onChange={(e) => { setCurrentWeeklyKm(e.target.value); setHasChanges(true); }}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.1"
            />
            <p className="text-xs text-gray-600 mt-1">{t('weeklyKmHelp')}</p>
          </div>
          
          {/* Longão */}
          <div>
            <label className="flex items-center gap-1 text-sm font-medium mb-2">
              {t('longestRun')}
              <AIFieldIcon
                label="Maior Corrida Recente"
                importance="high"
                impact="Distância do longão inicial no plano"
                howUsed="Define o ponto de partida dos longões e progressão de distância. Evita saltos muito grandes"
              />
              {getFieldStatus('longestRun') && (
                <AIFieldStatus
                  status={getFieldStatus('longestRun')!.status}
                  importance={getFieldStatus('longestRun')!.importance}
                  label="Longão"
                  variant="compact"
                />
              )}
            </label>
            <input
              type="number"
              value={longestRun}
              onChange={(e) => { setLongestRun(e.target.value); setHasChanges(true); }}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.1"
            />
            <p className="text-xs text-gray-600 mt-1">{t('longestRunHelp')}</p>
          </div>
        </div>
        
        {/* Outros Esportes */}
        <div className="mt-4">
          <label className="flex items-center gap-1 text-sm font-medium mb-2">
            {t('otherSports')}
            <AIFieldIcon
              label="Outros Esportes"
              importance="low"
              impact="Condicionamento geral e transferência de habilidades"
              howUsed="Considera experiência atlética geral. Ex: natação ajuda cardio, ciclismo ajuda resistência"
            />
            {getFieldStatus('otherSports') && (
              <AIFieldStatus
                status={getFieldStatus('otherSports')!.status}
                importance={getFieldStatus('otherSports')!.importance}
                label="Esportes"
                variant="compact"
              />
            )}
          </label>
          <textarea
            value={otherSportsExperience}
            onChange={(e) => { setOtherSportsExperience(e.target.value); setHasChanges(true); }}
            placeholder={t('otherSportsPlaceholder')}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <p className="text-xs text-gray-600 mt-1">{t('otherSportsHelp')}</p>
        </div>

        {/* v3.1.0 - Adicionar anos de outros esportes */}
        <div>
          <label className="flex items-center gap-1 text-sm font-medium mb-2">
            Anos praticando outros esportes
            <AIFieldIcon
              label="Anos Outros Esportes"
              importance="low"
              impact="Condicionamento geral"
              howUsed="Contexto sobre experiência atlética geral e transferência de habilidades"
            />
          </label>
          <input
            type="number"
            value={otherSportsYears}
            onChange={(e) => { setOtherSportsYears(e.target.value); setHasChanges(true); }}
            placeholder="Ex: 5 anos"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            min="0"
            max="50"
          />
          <p className="text-xs text-gray-600 mt-1">
            Experiência total com atividades físicas ajuda na adaptação ao treino
          </p>
        </div>
      </div>

      {/* v3.1.0 - SEÇÃO: SUA EXPERIÊNCIA DETALHADA */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          📝 Sua Experiência de Corrida Detalhada
        </h3>
        
        <div>
          <label className="flex items-center gap-1 text-sm font-medium mb-2">
            Conte sobre sua experiência com corrida
            <AIFieldIcon
              label="Descrição de Experiência"
              importance="medium"
              impact="Contexto personalizado"
              howUsed="IA analisa texto livre para entender melhor seu histórico e adaptar comunicação"
            />
          </label>
          <textarea
            value={experienceDescription}
            onChange={(e) => { setExperienceDescription(e.target.value); setHasChanges(true); }}
            placeholder="Ex: Comecei a correr há 2 anos, já fiz algumas provas de 5K e 10K. Gosto de correr pela manhã no parque. Meu objetivo é melhorar meu tempo e eventualmente fazer uma meia maratona..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={5}
          />
          <p className="text-xs text-gray-600 mt-1">
            Quanto mais detalhes você compartilhar, melhor a IA pode personalizar seu plano
          </p>
        </div>

        {experienceAnalysis && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
              🤖 Análise da IA sobre sua Experiência
            </h4>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{experienceAnalysis}</p>
          </div>
        )}
      </div>

      {/* v3.1.0 - SEÇÃO: ANÁLISE DE PERFORMANCE */}
      {(userData.currentVDOT || userData.usualPaces || userData.recentLongRunPace) && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📊 Análise de Performance
          </h3>

          {userData.currentVDOT && (
            <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
              <div className="text-center">
                <p className="text-sm text-gray-700 mb-2">Seu VDOT Atual</p>
                <p className="text-5xl font-bold text-blue-600 mb-2">{userData.currentVDOT}</p>
                <p className="text-sm text-gray-700">{interpretVDOT(userData.currentVDOT)}</p>
                {userData.lastVDOTUpdate && (
                  <p className="text-xs text-gray-600 mt-2">
                    Última atualização: {new Date(userData.lastVDOTUpdate).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
          )}

          {userData.usualPaces && Object.keys(userData.usualPaces).length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-3 flex items-center gap-1">
                🎯 Seus Ritmos de Treino Recomendados
                <AIFieldIcon
                  label="Ritmos de Treino"
                  importance="high"
                  impact="Zonas de treino personalizadas"
                  howUsed="IA calcula ritmos ideais baseado no VDOT para cada tipo de treino"
                />
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {userData.usualPaces.easy && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">🟢 Easy (Fácil)</p>
                    <p className="text-xl font-bold text-green-700">{userData.usualPaces.easy}</p>
                  </div>
                )}
                {userData.usualPaces.marathon && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">🔵 Marathon (Maratona)</p>
                    <p className="text-xl font-bold text-blue-700">{userData.usualPaces.marathon}</p>
                  </div>
                )}
                {userData.usualPaces.threshold && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">🟠 Threshold (Limiar)</p>
                    <p className="text-xl font-bold text-orange-700">{userData.usualPaces.threshold}</p>
                  </div>
                )}
                {userData.usualPaces.interval && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">🔴 Interval (Intervalado)</p>
                    <p className="text-xl font-bold text-red-700">{userData.usualPaces.interval}</p>
                  </div>
                )}
                {userData.usualPaces.repetition && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">🟣 Repetition (Tiros)</p>
                    <p className="text-xl font-bold text-purple-700">{userData.usualPaces.repetition}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {userData.recentLongRunPace && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">🏃 Pace do Último Longão</p>
              <p className="text-2xl font-bold text-amber-700">{userData.recentLongRunPace}</p>
            </div>
          )}
        </div>
      )}

      {/* SEÇÃO 2: MELHORES TEMPOS */}
      <div className="border-t pt-6">
        <h3 className="flex items-center gap-1 text-lg font-semibold mb-4">
          🏆 {t('title')}
          <AIFieldIcon
            label="Melhores Tempos"
            importance="critical"
            impact="Cálculo do VDOT e ritmos de treino"
            howUsed="Calcula VDOT atual e define todas as zonas de treino personalizadas (fácil, moderado, limiar, intervalado)"
          />
          {getFieldStatus('bestTimes') && (
            <AIFieldStatus
              status={getFieldStatus('bestTimes')!.status}
              importance={getFieldStatus('bestTimes')!.importance}
              label="Tempos"
              variant="compact"
            />
          )}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{t('description')}</p>
      </div>

      {Object.keys(bestTimes).length > 0 && (
        <>
          <div className="space-y-2">
            {Object.entries(bestTimes).map(([dist, data]: any) => (
              <div key={dist} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{distances.find(d => d.value === dist)?.label}</p>
                  <p className="text-sm text-gray-600">VDOT: {data.vdot}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-mono font-semibold">{data.time}</p>
                  <button onClick={() => removeTime(dist)} className="text-red-600 hover:text-red-800">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {bestVDOT > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-semibold text-lg">{t('bestVdot')}: {bestVDOT}</p>
              <p className="text-sm text-gray-700">{interpretVDOT(bestVDOT)}</p>
            </div>
          )}
        </>
      )}

      {Object.keys(bestTimes).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>{t('performance.noTimes')}</p>
          <p className="text-sm mt-2">{t('performance.addFirst')}</p>
        </div>
      )}

      {/* Botão Salvar */}
      {hasChanges && (
        <button onClick={handleSave}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          💾 {t('saveChanges')}
        </button>
      )}
    </div>
  );
}
