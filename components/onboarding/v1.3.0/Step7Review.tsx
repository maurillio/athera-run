'use client';
import { useTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft } from 'lucide-react';

export default function Step7Review({ data, onSubmit, onBack, loading }: any) {
  const t = useTranslations('onboarding.step7');
  const tCommon = useTranslations('common');
  
  const getSummary = () => {
    const items = [];
    
    console.log('📊 Step7Review - data received:', {
      goalDistance: data.goalDistance,
      targetRaceDate: data.targetRaceDate,
      primaryGoal: data.primaryGoal,
      age: data.age,
      weight: data.weight,
      allData: data
    });
    
    // Dados básicos
    if (data.age) items.push(`${data.age} anos`);
    if (data.gender) items.push(data.gender === 'male' ? 'Masculino' : 'Feminino');
    if (data.weight) items.push(`${data.weight}kg`);
    if (data.height) items.push(`${data.height}cm`);
    
    // Experiência
    if (data.runningLevel) {
      const levels: any = {
        beginner: 'Iniciante',
        intermediate: 'Intermediário',
        advanced: 'Avançado'
      };
      items.push(levels[data.runningLevel] || data.runningLevel);
    }
    
    if (data.weeklyVolume) items.push(`${data.weeklyVolume}km/semana atualmente`);
    if (data.longestRun) items.push(`Longão de ${data.longestRun}km`);
    
    // Objetivo principal
    if (data.primaryGoal) {
      const goalLabels: any = {
        finish_first_race: 'Completar primeira corrida',
        improve_time: 'Melhorar tempo',
        health_fitness: 'Saúde e fitness',
        weight_loss: 'Emagrecimento',
        challenge: 'Desafio pessoal',
        consistency: 'Criar consistência'
      };
      items.push(`🎯 ${goalLabels[data.primaryGoal] || data.primaryGoal}`);
    }
    
    // Race Goal - CRITICAL
    if (data.goalDistance) {
      const distances: any = {
        '5k': '5km',
        '10k': '10km',
        '21k': 'Meia Maratona (21km)',
        '42k': 'Maratona (42km)'
      };
      items.push(`🏁 Meta: ${distances[data.goalDistance] || data.goalDistance}`);
    }
    
    if (data.targetRaceDate) {
      const date = new Date(data.targetRaceDate);
      items.push(`📅 Data da prova: ${date.toLocaleDateString('pt-BR')}`);
    }
    
    if (data.targetTime) {
      items.push(`⏱️ Tempo alvo: ${data.targetTime}`);
    }
    
    // Disponibilidade - verificar múltiplos formatos
    const trainingDaysCount = 
      data.availableDays?.running?.length || 
      data.trainingDays?.length || 
      (data.trainingActivities?.length > 0 ? data.trainingActivities.length : 0);
      
    if (trainingDaysCount > 0) {
      items.push(`${trainingDaysCount} dias de treino por semana`);
    }
    
    // Dia do longão
    if (data.longRunDay !== null && data.longRunDay !== undefined) {
      const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      items.push(`Longão: ${days[data.longRunDay]}`);
    }
    
    return items;
  };

  const hasRequiredData = data.goalDistance && data.targetRaceDate;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-4 text-blue-900">📊 Seu Perfil</h3>
        
        {getSummary().length > 0 ? (
          <div className="space-y-2">
            {getSummary().map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Nenhuma informação coletada ainda.</p>
            <p className="text-sm text-gray-500 mt-2">Volte e preencha os steps anteriores.</p>
          </div>
        )}

        {/* Performance Data */}
        {data.personalBests && data.personalBests.length > 0 && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="font-semibold text-blue-900 mb-2">🏃 Melhores Tempos</p>
            {data.personalBests.map((pb: any, idx: number) => (
              <p key={idx} className="text-sm text-gray-700">
                {pb.distance}: {pb.time}
              </p>
            ))}
          </div>
        )}

        {/* Health/Injuries */}
        {data.injuries && data.injuries.length > 0 && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="font-semibold text-orange-700 mb-2">⚠️ Histórico de Lesões</p>
            <ul className="text-sm text-gray-700 space-y-1">
              {data.injuries.map((injury: string, idx: number) => (
                <li key={idx}>• {injury}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Infraestrutura */}
        {(data.hasGymAccess || data.hasPoolAccess || data.hasTrackAccess) && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="font-semibold text-blue-900 mb-2">🏗️ Recursos Disponíveis</p>
            <div className="space-y-1 text-sm text-gray-700">
              {data.hasGymAccess && <p>• Academia / Musculação</p>}
              {data.hasPoolAccess && <p>• Piscina / Natação</p>}
              {data.hasTrackAccess && <p>• Pista de Atletismo</p>}
            </div>
          </div>
        )}
      </div>

      {/* Validation Warning */}
      {!hasRequiredData && (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
          <p className="font-semibold text-orange-900 mb-2">⚠️ Atenção</p>
          <p className="text-sm text-orange-700">
            Para gerar um plano personalizado, você precisa definir:
          </p>
          <ul className="text-sm text-orange-700 mt-2 space-y-1">
            {!data.goalDistance && <li>• Distância da corrida alvo (Step 5)</li>}
            {!data.targetRaceDate && <li>• Data aproximada da prova (Step 5)</li>}
          </ul>
          <p className="text-xs text-orange-600 mt-2">
            Volte ao Step 5 para preencher essas informações.
          </p>
        </div>
      )}

      {/* Next Step Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="font-semibold text-green-900 mb-2">✨ Próximo Passo</p>
        <p className="text-sm text-gray-700">
          Nossa IA vai analisar todas essas informações e criar um plano 100% personalizado para você,
          respeitando suas limitações e maximizando seus resultados!
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="flex-1"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {tCommon('previous')}
        </Button>
        
        <Button
          type="button"
          onClick={onSubmit}
          disabled={loading || !hasRequiredData}
          className="flex-1 bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {tCommon('processing')}
            </>
          ) : (
            <>✨ {tCommon('finishAndCreatePlan')}</>
          )}
        </Button>
      </div>
    </div>
  );
}
