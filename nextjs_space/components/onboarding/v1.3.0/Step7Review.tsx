'use client';

export default function Step7Review({ data, onNext, onBack }: any) {
  const getSummary = () => {
    const items = [];
    
    if (data.age) items.push(`${data.age} anos`);
    if (data.gender) items.push(data.gender === 'male' ? 'Masculino' : 'Feminino');
    if (data.hasRunBefore !== undefined) {
      items.push(data.hasRunBefore ? `${data.runningYears || '?'} anos correndo` : 'Iniciante');
    }
    if (data.currentWeeklyKm) items.push(`${data.currentWeeklyKm}km/semana atual`);
    if (data.primaryGoal) {
      const goals: any = {
        finish_first_race: 'Completar primeira corrida',
        improve_time: 'Melhorar tempo',
        health_fitness: 'Saúde',
        weight_loss: 'Perder peso',
        challenge: 'Desafio específico',
        consistency: 'Criar rotina'
      };
      items.push(goals[data.primaryGoal] || data.primaryGoal);
    }
    if (data.availableDays?.running) {
      items.push(`${data.availableDays.running.length} dias/semana`);
    }
    
    return items;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Revisão Final</h2>
        <p className="text-gray-600">Confirme suas informações antes de gerar o plano</p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-4 text-blue-900">📊 Seu Perfil</h3>
        <div className="space-y-2">
          {getSummary().map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-blue-600">✓</span>
              <span className="text-gray-700">{item}</span>
            </div>
          ))}
        </div>

        {data.bestTimes && Object.keys(data.bestTimes).length > 0 && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="font-semibold text-blue-900 mb-2">🏃 Melhores Tempos</p>
            {Object.entries(data.bestTimes).map(([dist, t]: any) => (
              <p key={dist} className="text-sm text-gray-700">
                {dist.toUpperCase()}: {t.time} (VDOT {t.vdot})
              </p>
            ))}
          </div>
        )}

        {data.injuryHistory && data.injuryHistory.length > 0 && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="font-semibold text-orange-700 mb-2">⚠️ Histórico de Lesões</p>
            <p className="text-sm text-gray-700">{data.injuryHistory.join(', ')}</p>
          </div>
        )}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="font-semibold text-green-900 mb-2">✨ Próximo Passo</p>
        <p className="text-sm text-gray-700">
          Nossa IA vai analisar todas essas informações e criar um plano 100% personalizado para você,
          respeitando suas limitações e maximizando seus resultados!
        </p>
      </div>

      <div className="flex justify-between pt-6">
        <button onClick={onBack} className="px-6 py-2 border rounded-lg">Voltar</button>
        <button onClick={onNext}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700">
          🚀 Gerar Meu Plano!
        </button>
      </div>
    </div>
  );
}
