'use client';
import { useState } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';
import AIFieldIcon from '@/components/ai-transparency/AIFieldIcon';
import AIFieldStatus from '@/components/ai-transparency/AIFieldStatus';
import { useFieldAnalysis } from '@/hooks/useFieldAnalysis';

export default function HealthTab({ userData, onUpdate }: any) {
  const t = useTranslations('profile.health');
  const { getFieldStatus } = useFieldAnalysis();
  const [hasInjuryHistory, setHasInjuryHistory] = useState(userData.hasInjuryHistory ?? false);
  const [injuries, setInjuries] = useState(userData.injuryHistory || []);
  const [medicalClearance, setMedicalClearance] = useState(userData.medicalClearance ?? true);
  
  // v3.1.0 - Novos campos médicos detalhados
  const [medicalConditions, setMedicalConditions] = useState(userData.medicalConditions || '');
  const [medications, setMedications] = useState(userData.medications || '');
  const [physicalRestrictions, setPhysicalRestrictions] = useState(userData.physicalRestrictions || '');
  
  // v3.1.0 - Campos v3.0.0 não exibidos anteriormente
  const [hasRunBefore, setHasRunBefore] = useState(userData.hasRunBefore ?? true);
  const [currentlyInjured, setCurrentlyInjured] = useState(userData.currentlyInjured ?? false);
  const [avgSleepHours, setAvgSleepHours] = useState(userData.avgSleepHours || '');
  const [tracksMenstrualCycle, setTracksMenstrualCycle] = useState(userData.tracksMenstrualCycle ?? false);
  const [avgCycleLength, setAvgCycleLength] = useState(userData.avgCycleLength || '');
  const [lastPeriodDate, setLastPeriodDate] = useState(
    userData.lastPeriodDate ? new Date(userData.lastPeriodDate).toISOString().split('T')[0] : ''
  );
  const [workDemand, setWorkDemand] = useState(userData.workDemand || 'moderate');
  const [familyDemand, setFamilyDemand] = useState(userData.familyDemand || 'moderate');
  
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    onUpdate({
      hasInjuryHistory,
      injuryHistory: hasInjuryHistory && injuries.length > 0 ? injuries : null,
      medicalClearance,
      // v3.1.0 - Dados médicos detalhados
      medicalConditions: medicalConditions || null,
      medications: medications || null,
      physicalRestrictions: physicalRestrictions || null,
      // v3.1.0 - Campos v3.0.0
      hasRunBefore,
      currentlyInjured,
      avgSleepHours: avgSleepHours ? parseFloat(avgSleepHours) : null,
      tracksMenstrualCycle: userData.gender === 'female' ? tracksMenstrualCycle : null,
      avgCycleLength: tracksMenstrualCycle && avgCycleLength ? parseInt(avgCycleLength) : null,
      lastPeriodDate: tracksMenstrualCycle && lastPeriodDate ? new Date(lastPeriodDate) : null,
      workDemand,
      familyDemand,
    });
    setHasChanges(false);
  };

  const addInjury = (injury: string) => {
    setInjuries([...injuries, injury]);
    setHasChanges(true);
  };

  const removeInjury = (idx: number) => {
    setInjuries(injuries.filter((_: any, i: number) => i !== idx));
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="flex items-center gap-1 font-medium mb-2">
          {t('injuryHistory.label')}
          <AIFieldIcon
            label="Histórico de Lesões"
            importance="high"
            impact="Prevenção e ajuste de volume"
            howUsed="Reduz ritmo de progressão e inclui treinos preventivos baseados no histórico"
          />
          {getFieldStatus('injuries') && (
            <AIFieldStatus
              status={getFieldStatus('injuries')!.status}
              importance={getFieldStatus('injuries')!.importance}
              label="Lesões"
              variant="compact"
            />
          )}
        </label>
        <div className="flex gap-4">
          <button onClick={() => { setHasInjuryHistory(false); setHasChanges(true); }}
            className={`px-6 py-2 rounded-lg ${!hasInjuryHistory ? 'bg-green-600 text-white' : 'border'}`}>
            {t('injuryHistory.noInjuries')}
          </button>
          <button onClick={() => { setHasInjuryHistory(true); setHasChanges(true); }}
            className={`px-6 py-2 rounded-lg ${hasInjuryHistory ? 'bg-orange-600 text-white' : 'border'}`}>
            {t('injuryHistory.withInjuries')}
          </button>
        </div>
      </div>

      {hasInjuryHistory && injuries.length > 0 && (
        <div className="space-y-2">
          {injuries.map((inj: string, idx: number) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <span>{inj}</span>
              <button 
                onClick={() => removeInjury(idx)} 
                className="text-red-600 hover:text-red-800"
                title={t('injuryHistory.remove')}
              >×</button>
            </div>
          ))}
        </div>
      )}

      {/* v3.1.0 - Link para dados fisiológicos (agora em BasicDataTab) */}
      <div className="border-t pt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            ℹ️ <strong>Dados Fisiológicos (FC, Sono, Estresse)</strong> foram movidos para a aba <strong>"Dados Básicos"</strong> para melhor organização.
          </p>
        </div>
      </div>

      {/* v3.1.0 - Informações Médicas Detalhadas */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          🏥 Informações Médicas Detalhadas
        </h3>
        
        <div>
          <label className="flex items-center gap-1 text-sm font-medium mb-2">
            Condições Médicas
            <AIFieldIcon
              label="Condições Médicas"
              importance="high"
              impact="Segurança e ajustes de treino"
              howUsed="IA considera condições para ajustar intensidade e evitar riscos"
            />
          </label>
          <textarea
            value={medicalConditions}
            onChange={(e) => { setMedicalConditions(e.target.value); setHasChanges(true); }}
            placeholder="Ex: Asma, diabetes, hipertensão, problemas cardíacos..."
            className="w-full px-4 py-2 border rounded-lg"
            rows={3}
          />
          <p className="text-xs text-gray-600 mt-1">
            Informe qualquer condição médica que possa afetar seu treino
          </p>
        </div>

        <div>
          <label className="flex items-center gap-1 text-sm font-medium mb-2">
            Medicamentos em Uso
            <AIFieldIcon
              label="Medicamentos"
              importance="medium"
              impact="Efeitos colaterais e performance"
              howUsed="IA considera efeitos dos medicamentos (ex: beta-bloqueadores reduzem FC)"
            />
          </label>
          <textarea
            value={medications}
            onChange={(e) => { setMedications(e.target.value); setHasChanges(true); }}
            placeholder="Ex: Remédio para pressão, asma, antiinflamatórios..."
            className="w-full px-4 py-2 border rounded-lg"
            rows={2}
          />
        </div>

        <div>
          <label className="flex items-center gap-1 text-sm font-medium mb-2">
            Restrições Físicas
            <AIFieldIcon
              label="Restrições Físicas"
              importance="high"
              impact="Adaptação de exercícios"
              howUsed="IA evita movimentos/intensidades que possam agravar restrições"
            />
          </label>
          <textarea
            value={physicalRestrictions}
            onChange={(e) => { setPhysicalRestrictions(e.target.value); setHasChanges(true); }}
            placeholder="Ex: Não pode correr em descida, evitar saltos, problema no joelho..."
            className="w-full px-4 py-2 border rounded-lg"
            rows={2}
          />
        </div>
      </div>

      {/* v3.1.0 - Perfil de Corredor v3.0.0 */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          🏃 Perfil de Corredor
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={hasRunBefore}
                onChange={(e) => { setHasRunBefore(e.target.checked); setHasChanges(true); }}
                className="w-5 h-5"
              />
              <span className="text-sm font-medium">Já correu antes?</span>
              <AIFieldIcon
                label="Experiência Prévia"
                importance="critical"
                impact="Protocolo de iniciante absoluto"
                howUsed="Se 'não', IA usa walk/run protocol progressivo e mais cuidadoso"
              />
            </label>
            <p className="text-xs text-gray-600 mt-1 ml-7">
              {hasRunBefore ? '✅ Já tem experiência com corrida' : '⚠️ Iniciante absoluto - IA usará walk/run protocol'}
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={currentlyInjured}
                onChange={(e) => { setCurrentlyInjured(e.target.checked); setHasChanges(true); }}
                className="w-5 h-5"
              />
              <span className="text-sm font-medium">Lesionado atualmente?</span>
              <AIFieldIcon
                label="Lesão Ativa"
                importance="critical"
                impact="Volume e intensidade reduzidos"
                howUsed="IA reduz drasticamente carga e inclui reabilitação"
              />
            </label>
            <p className="text-xs text-gray-600 mt-1 ml-7">
              {currentlyInjured ? '🔴 Lesão ativa - treino adaptado' : '✅ Sem lesão ativa'}
            </p>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1 text-sm font-medium mb-2">
            Horas Médias de Sono por Noite
            <AIFieldIcon
              label="Sono Médio"
              importance="high"
              impact="Capacidade de recuperação"
              howUsed="Menos de 7h = redução de volume. 8h+ = recuperação ótima"
            />
          </label>
          <input
            type="number"
            value={avgSleepHours}
            onChange={(e) => { setAvgSleepHours(e.target.value); setHasChanges(true); }}
            placeholder="Ex: 7.5"
            min="4"
            max="12"
            step="0.5"
            className="w-full px-4 py-2 border rounded-lg"
          />
          {avgSleepHours && (
            <p className="text-xs text-gray-600 mt-1">
              {parseFloat(avgSleepHours) < 7 && '⚠️ Sono insuficiente - IA vai reduzir intensidade'}
              {parseFloat(avgSleepHours) >= 7 && parseFloat(avgSleepHours) < 9 && '✅ Sono adequado para treino'}
              {parseFloat(avgSleepHours) >= 9 && '✅ Sono excelente - recuperação otimizada'}
            </p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-1 text-sm font-medium mb-2">
            Demanda de Trabalho
            <AIFieldIcon
              label="Trabalho"
              importance="medium"
              impact="Carga física/mental diária"
              howUsed="Trabalho físico = mais recovery. Sedentário = pode treinar mais"
            />
          </label>
          <select
            value={workDemand}
            onChange={(e) => { setWorkDemand(e.target.value); setHasChanges(true); }}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="sedentary">💼 Sedentário (escritório, home office)</option>
            <option value="moderate">🚶 Moderado (algum movimento, em pé às vezes)</option>
            <option value="physical">🏗️ Físico (trabalho braçal, muito em pé)</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-1 text-sm font-medium mb-2">
            Demanda Familiar
            <AIFieldIcon
              label="Família"
              importance="medium"
              impact="Tempo e energia disponíveis"
              howUsed="Alta demanda = treinos mais curtos e flexíveis"
            />
          </label>
          <select
            value={familyDemand}
            onChange={(e) => { setFamilyDemand(e.target.value); setHasChanges(true); }}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="low">🟢 Baixa (tempo livre, poucos compromissos)</option>
            <option value="moderate">🟡 Moderada (algumas responsabilidades)</option>
            <option value="high">🔴 Alta (filhos pequenos, muitas responsabilidades)</option>
          </select>
        </div>

        {/* v3.1.0 - Ciclo Menstrual (apenas para mulheres) */}
        {userData.gender === 'female' && (
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-semibold">👩 Ciclo Menstrual (Opcional)</h4>
            
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={tracksMenstrualCycle}
                  onChange={(e) => { setTracksMenstrualCycle(e.target.checked); setHasChanges(true); }}
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium">Fazer tracking do ciclo menstrual</span>
                <AIFieldIcon
                  label="Ciclo Menstrual"
                  importance="high"
                  impact="Otimização hormonal de treinos"
                  howUsed="IA ajusta intensidade por fase: folicular (mais intenso), lútea (recovery)"
                />
              </label>
              <p className="text-xs text-gray-600 mt-1 ml-7">
                A IA pode otimizar seus treinos baseado nas fases do seu ciclo
              </p>
            </div>

            {tracksMenstrualCycle && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Duração média do ciclo (dias)
                  </label>
                  <input
                    type="number"
                    value={avgCycleLength}
                    onChange={(e) => { setAvgCycleLength(e.target.value); setHasChanges(true); }}
                    placeholder="Ex: 28"
                    min="21"
                    max="35"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Data da última menstruação
                  </label>
                  <input
                    type="date"
                    value={lastPeriodDate}
                    onChange={(e) => { setLastPeriodDate(e.target.value); setHasChanges(true); }}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="border-t pt-6">
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={medicalClearance} 
            onChange={(e) => { setMedicalClearance(e.target.checked); setHasChanges(true); }}
            className="w-5 h-5" />
          <span className="flex items-center gap-1 text-sm">
            {medicalClearance ? t('medicalClearance.yes') : t('medicalClearance.no')}
            <AIFieldIcon
              label="Liberação Médica"
              importance="critical"
              impact="Segurança e responsabilidade legal"
              howUsed="Garante que o atleta está apto para treinar e previne problemas de saúde"
            />
            {getFieldStatus('medicalClearance') && (
              <AIFieldStatus
                status={getFieldStatus('medicalClearance')!.status}
                importance={getFieldStatus('medicalClearance')!.importance}
                label="Liberação"
                variant="compact"
              />
            )}
          </span>
        </label>
        {!medicalClearance && (
          <p className="text-sm text-orange-600 mt-2">{t('medicalClearance.warning')}</p>
        )}
      </div>

      {hasChanges && (
        <button onClick={handleSave}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
          {t('save', 'profile.saveChanges')}
        </button>
      )}
    </div>
  );
}
