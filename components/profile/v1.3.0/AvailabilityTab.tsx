'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Check, AlertCircle } from 'lucide-react';

export default function AvailabilityTab({ userData, onUpdate }: any) {
  const [runDays, setRunDays] = useState(userData.availableDays?.running || []);
  const [strengthDays, setStrengthDays] = useState(userData.availableDays?.strength || []);
  const [swimmingDays, setSwimmingDays] = useState(userData.availableDays?.swimming || []);
  const [crossTrainingDays, setCrossTrainingDays] = useState(userData.availableDays?.crossTraining || []);
  const [yogaDays, setYogaDays] = useState(userData.availableDays?.yoga || []);
  
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [adjustmentStatus, setAdjustmentStatus] = useState<any>(null);

  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const toggleDay = (dayIdx: number, currentDays: number[], setter: Function) => {
    const newDays = currentDays.includes(dayIdx) 
      ? currentDays.filter((d: number) => d !== dayIdx) 
      : [...currentDays, dayIdx].sort();
    setter(newDays);
    setHasChanges(true);
    setAdjustmentStatus(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setAdjustmentStatus(null);
    
    try {
      // Atualizar disponibilidade
      await onUpdate({
        availableDays: {
          running: runDays,
          strength: strengthDays.length > 0 ? strengthDays : null,
          swimming: swimmingDays.length > 0 ? swimmingDays : null,
          crossTraining: crossTrainingDays.length > 0 ? crossTrainingDays : null,
          yoga: yogaDays.length > 0 ? yogaDays : null
        }
      });

      // Aplicar auto-ajuste no plano
      const adjustResponse = await fetch('/api/plan/auto-adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reason: 'Alteração de disponibilidade pelo usuário',
          preserveHistory: true 
        })
      });

      const adjustData = await adjustResponse.json();
      
      setAdjustmentStatus(adjustData);
      setHasChanges(false);

      if (adjustData.success) {
        toast.success('✅ Disponibilidade atualizada!');
        if (adjustData.action === 'REGENERATE_REQUIRED') {
          toast.info('🔄 Clique em "Regenerar Plano" na página do perfil para aplicar as mudanças.', { duration: 8000 });
        }
      } else {
        toast.error('Erro ao ajustar plano: ' + adjustData.error);
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerta Importante */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-blue-900 mb-1">Como funciona a disponibilidade</p>
            <p className="text-sm text-blue-800">
              ✨ <strong>Você tem 100% do controle!</strong> Apenas as atividades que você marcar serão incluídas no seu plano.
              <br />
              🏃 Dias de corrida são <strong>obrigatórios</strong>. As outras atividades são <strong>opcionais</strong>.
              <br />
              💾 Ao salvar, seu plano será ajustado automaticamente do dia atual em diante, <strong>preservando todo o histórico</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Dias de Corrida (Obrigatório) */}
      <div>
        <label className="block font-semibold mb-2 text-lg">🏃 Dias de Corrida *</label>
        <p className="text-sm text-gray-600 mb-3">Selecione os dias da semana em que você pode correr</p>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => (
            <button key={idx} onClick={() => toggleDay(idx, runDays, setRunDays)}
              className={`px-2 py-3 text-sm font-medium rounded-lg transition-colors ${
                runDays.includes(idx) 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' 
                  : 'border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50'
              }`}>
              {day}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          ✅ {runDays.length} dia(s) selecionado(s) {runDays.length < 3 && <span className="text-orange-600">(mínimo recomendado: 3)</span>}
        </p>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4 text-lg">Atividades Complementares (Opcional)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Marque apenas as atividades que você <strong>realmente faz</strong>. Se não marcar, não serão incluídas no plano.
        </p>

        {/* Musculação */}
        <div className="mb-4">
          <label className="block font-medium mb-2">💪 Musculação</label>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => (
              <button key={idx} onClick={() => toggleDay(idx, strengthDays, setStrengthDays)}
                className={`px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                  strengthDays.includes(idx) 
                    ? 'bg-purple-600 text-white' 
                    : 'border border-gray-300 hover:border-purple-400'
                }`}>
                {day}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {strengthDays.length > 0 ? `${strengthDays.length} dia(s)` : 'Nenhum dia selecionado'}
          </p>
        </div>

        {/* Natação */}
        <div className="mb-4">
          <label className="block font-medium mb-2">🏊 Natação</label>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => (
              <button key={idx} onClick={() => toggleDay(idx, swimmingDays, setSwimmingDays)}
                className={`px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                  swimmingDays.includes(idx) 
                    ? 'bg-blue-600 text-white' 
                    : 'border border-gray-300 hover:border-blue-400'
                }`}>
                {day}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {swimmingDays.length > 0 ? `${swimmingDays.length} dia(s)` : 'Nenhum dia selecionado'}
          </p>
        </div>

        {/* Cross Training */}
        <div className="mb-4">
          <label className="block font-medium mb-2">🚴 Cross Training (bike, elíptico, etc.)</label>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => (
              <button key={idx} onClick={() => toggleDay(idx, crossTrainingDays, setCrossTrainingDays)}
                className={`px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                  crossTrainingDays.includes(idx) 
                    ? 'bg-green-600 text-white' 
                    : 'border border-gray-300 hover:border-green-400'
                }`}>
                {day}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {crossTrainingDays.length > 0 ? `${crossTrainingDays.length} dia(s)` : 'Nenhum dia selecionado'}
          </p>
        </div>

        {/* Yoga */}
        <div>
          <label className="block font-medium mb-2">🧘 Yoga / Pilates</label>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => (
              <button key={idx} onClick={() => toggleDay(idx, yogaDays, setYogaDays)}
                className={`px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                  yogaDays.includes(idx) 
                    ? 'bg-pink-600 text-white' 
                    : 'border border-gray-300 hover:border-pink-400'
                }`}>
                {day}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {yogaDays.length > 0 ? `${yogaDays.length} dia(s)` : 'Nenhum dia selecionado'}
          </p>
        </div>
      </div>

      {/* Botão Salvar */}
      {hasChanges && (
        <button 
          onClick={handleSave}
          disabled={saving || runDays.length === 0}
          className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg">
          {saving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Salvando e ajustando plano...
            </>
          ) : (
            <>
              <Check className="h-5 w-5" />
              Salvar e Aplicar Ajuste Automático
            </>
          )}
        </button>
      )}

      {/* Status do Ajuste */}
      {adjustmentStatus && adjustmentStatus.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="font-medium text-green-900 mb-2">✅ Ajuste Aplicado!</p>
          <p className="text-sm text-green-800 mb-2">{adjustmentStatus.message}</p>
          {adjustmentStatus.deletedWorkouts > 0 && (
            <p className="text-xs text-green-700">
              • {adjustmentStatus.deletedWorkouts} treinos futuros foram removidos
            </p>
          )}
          {adjustmentStatus.action === 'REGENERATE_REQUIRED' && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
              <p className="text-sm text-orange-900">
                🔄 <strong>Próximo passo:</strong> Vá para a página "Plano" e clique em "Regenerar Plano" para criar novos treinos.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Aviso sobre Preservação */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-800">
          🛡️ <strong>Histórico Preservado:</strong> Todos os treinos que você já completou serão mantidos.
          Apenas os treinos futuros serão ajustados.
        </p>
      </div>
    </div>
  );
}
