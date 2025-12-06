'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Heart, Clock, Target, Zap, Wind, TrendingUp, AlertCircle, CheckCircle2, Flame, Brain, Award, XCircle } from 'lucide-react';
import type { EnhancedWorkout, WorkoutPhase, IntervalStructure } from '@/lib/types/workout-structure';
import { isIntervalWorkout } from '@/lib/types/workout-structure';
import { ManualMatchModal } from '@/components/athera-flex';

interface WorkoutDetailsProps {
  workout: EnhancedWorkout;
  isExpanded?: boolean;
  onToggle?: () => void;
  onManualMatch?: (completedWorkoutId: number, workoutId: number) => Promise<void>;
  onUpdate?: () => Promise<void>;
}

const intensityColors = {
  1: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', label: 'Muito Leve' },
  2: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', label: 'Leve' },
  3: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', label: 'Moderado' },
  4: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', label: 'Intenso' },
  5: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', label: 'Muito Intenso' },
};

const intensityIcons = {
  'very-easy': Heart,
  'easy': Wind,
  'moderate': Activity,
  'hard': Zap,
  'very-hard': Flame,
};

export function WorkoutDetails({ workout, isExpanded = false, onToggle, onManualMatch, onUpdate }: WorkoutDetailsProps) {
  const [showManualMatch, setShowManualMatch] = useState(false);
  const [undoingMatch, setUndoingMatch] = useState(false);
  const hasStructuredData = !!(workout.warmUpStructure || workout.mainWorkoutStruct || workout.coolDownStructure);
  
  // Se não tem estrutura detalhada, mostrar visualização simples
  if (!hasStructuredData) {
    return <SimpleWorkoutView workout={workout} onManualMatch={onManualMatch} onUpdate={onUpdate} />;
  }

  const intensityStyle = workout.intensityLevel 
    ? intensityColors[workout.intensityLevel] 
    : { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', label: 'Normal' };

  const handleManualMatch = async (completedWorkoutId: number) => {
    if (onManualMatch) {
      await onManualMatch(completedWorkoutId, workout.id);
    }
  };

  const handleUndoMatch = async () => {
    if (!workout.id) return;
    
    setUndoingMatch(true);
    try {
      const response = await fetch('/api/workouts/undo-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plannedWorkoutId: workout.id })
      });
      
      if (response.ok) {
        if (onUpdate) { await onUpdate(); } else { window.location.reload(); };
      } else {
        const error = await response.json();
        console.error('Erro ao desfazer match:', error);
        alert('Erro ao desfazer match. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao desfazer match:', error);
      alert('Erro ao desfazer match. Tente novamente.');
    } finally {
      setUndoingMatch(false);
    }
  };

  // Determinar qual workout mostrar (planejado ou executado)
  // Se isCompleted E tem executedWorkout, mostrar executado (independente de wasSubstitution)
  const displayWorkout = workout.isCompleted && workout.executedWorkout 
    ? workout.executedWorkout 
    : workout;

  return (
    <>
      <div className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 shadow-sm space-y-4">
        {/* Header do Treino */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-base font-semibold text-gray-900">
                {workout.isCompleted && workout.executedWorkout 
                  ? `${workout.title.replace(/\s*-\s*[\d.]+km.*$/, '')} - ${displayWorkout.distance}km executados`
                  : workout.title
                }
              </h3>
              {workout.isCompleted ? (
                <>
                  <Badge className="bg-green-500 text-white text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Concluído
                  </Badge>
                  {workout.wasSubstitution && (
                    <Badge className="bg-purple-500 text-white text-xs">
                      🔄 Substituição
                    </Badge>
                  )}
                </>
              ) : (
                <>
                  {/* Badge Não Concluído se passou a data */}
                  {new Date(workout.date) < new Date(new Date().setHours(0,0,0,0)) && (
                    <Badge className="bg-red-500 text-white text-xs">
                      <XCircle className="h-3 w-3 mr-1" />
                      Não Concluído
                    </Badge>
                  )}
                  {/* Ocultar botão "Concluir" para descansos (rest days) */}
                  {workout.type !== 'rest' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowManualMatch(true);
                      }}
                      className="text-xs h-7 border-purple-200 hover:border-purple-400 hover:bg-purple-50"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Marcar como Concluído
                    </Button>
                  )}
                </>
              )}
            </div>
            
            {/* Linha mostrando planejado (se foi executado diferente) */}
            {workout.isCompleted && workout.executedWorkout && workout.distance && (
              <div className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                📋 Planejado: {workout.distance}km
                {workout.targetPace && `, ${workout.targetPace.includes('min/km') ? workout.targetPace : `${workout.targetPace} min/km`}`}
              </div>
            )}
          
          {/* Mensagem de Substituição + Botão Desfazer */}
          {workout.isCompleted && workout.wasSubstitution && (
            <div className="flex items-start gap-2 mt-2 p-2 bg-purple-50 rounded border border-purple-200">
              <Activity className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-purple-900 mb-2">
                  <span className="font-medium">Treino executado em dia diferente.</span> Este treino foi marcado como concluído usando uma atividade realizada em outra data.
                  {workout.executedWorkout?.date && (
                    <span className="block mt-1 text-xs">
                      Executado em: {new Date(workout.executedWorkout.date).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </p>
                {workout.executedWorkoutId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleUndoMatch();
                    }}
                    disabled={undoingMatch}
                    className="text-xs h-7 border-red-200 hover:border-red-400 hover:bg-red-50"
                  >
                    {undoingMatch ? (
                      <>
                        <Activity className="h-3 w-3 mr-1 animate-spin" />
                        Desfazendo...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Desfazer Match
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Mensagem para Órfãos: Treino executado fora do planejado */}
          {workout.isOrphan && !workout.hasMatch && workout.suggestedMatch && (
            <div className="flex items-start gap-2 mt-2 p-2 bg-blue-50 rounded border border-blue-200">
              <Activity className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-900 mb-2">
                  <span className="font-medium">Treino executado fora do planejamento.</span> Este treino foi importado automaticamente do Strava, mas foi realizado em um dia não planejado.
                </p>
                <p className="text-xs text-blue-800 mb-2">
                  📅 Treino planejado próximo: <span className="font-medium">{workout.suggestedMatch.title}</span> em {new Date(workout.suggestedMatch.date).toLocaleDateString('pt-BR')}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (onManualMatch) {
                      onManualMatch(workout.completedWorkoutId!, workout.suggestedMatch!.id);
                    }
                  }}
                  className="text-xs h-7 border-blue-300 hover:border-blue-500 hover:bg-blue-100"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Marcar como Substituição
                </Button>
              </div>
            </div>
          )}
          
          {workout.objective && (
            <div className="flex items-start gap-2 mt-2 p-2 bg-blue-50 rounded border border-blue-200">
              <Target className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900">
                <span className="font-medium">Objetivo:</span> {workout.objective}
              </p>
            </div>
          )}
        </div>
        
        {workout.intensityLevel && (
          <Badge className={`${intensityStyle.bg} ${intensityStyle.text} ${intensityStyle.border} border`}>
            {intensityStyle.label}
          </Badge>
        )}
      </div>

      {/* Resumo Geral - Mostrar dados do executado se for substituição */}
      <div className="flex flex-wrap gap-2 pb-3 border-b border-gray-200">
        {displayWorkout.distance && (
          <Badge variant="secondary" className="text-xs">
            <Target className="h-3 w-3 mr-1" />
            {displayWorkout.distance} km
          </Badge>
        )}
        {displayWorkout.duration && (
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {displayWorkout.duration} min
          </Badge>
        )}
        {displayWorkout.pace && (
          <Badge variant="secondary" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            {displayWorkout.pace.includes('min/km') ? displayWorkout.pace : `${displayWorkout.pace} min/km`}
          </Badge>
        )}
        {workout.expectedDuration && !displayWorkout.duration && (
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            ~{workout.expectedDuration} min
          </Badge>
        )}
        {workout.targetPace && !displayWorkout.pace && (
          <Badge variant="secondary" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            {workout.targetPace.includes('min/km') ? workout.targetPace : `${workout.targetPace} min/km`}
          </Badge>
        )}
        {workout.expectedRPE && (
          <Badge variant="secondary" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            RPE {workout.expectedRPE}/10
          </Badge>
        )}
      </div>

      {/* Fases do Treino */}
      {(workout.warmUpStructure || workout.mainWorkoutStruct || workout.coolDownStructure) && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Estrutura do Treino
          </h4>
          
          {/* Aquecimento */}
          {workout.warmUpStructure && (
            <PhaseCard 
              phase={workout.warmUpStructure} 
              icon={Wind}
              title="Aquecimento"
              color="blue"
            />
          )}

          {/* Parte Principal */}
          {workout.mainWorkoutStruct && (
            <>
              {isIntervalWorkout(workout.mainWorkoutStruct) ? (
                <IntervalCard interval={workout.mainWorkoutStruct} />
              ) : (
                <PhaseCard 
                  phase={workout.mainWorkoutStruct} 
                  icon={Zap}
                  title="Parte Principal"
                  color="orange"
                />
              )}
            </>
          )}

          {/* Desaquecimento */}
          {workout.coolDownStructure && (
            <PhaseCard 
              phase={workout.coolDownStructure} 
              icon={Heart}
              title="Volta à Calma"
              color="green"
            />
          )}
        </div>
      )}

      {/* Dicas Práticas */}
      {workout.tips && workout.tips.length > 0 && (
        <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-md border border-purple-200">
          <h4 className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Dicas de Execução
          </h4>
          <ul className="space-y-1 text-sm text-purple-800">
            {workout.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-purple-500 flex-shrink-0">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Erros Comuns */}
      {workout.commonMistakes && workout.commonMistakes.length > 0 && (
        <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
          <h4 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Evite Estes Erros
          </h4>
          <ul className="space-y-1 text-sm text-yellow-800">
            {workout.commonMistakes.map((mistake, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-yellow-600 flex-shrink-0">⚠️</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Critérios de Sucesso */}
      {workout.successCriteria && workout.successCriteria.length > 0 && (
        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-md border border-green-200">
          <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Como Saber que Executou Bem
          </h4>
          <ul className="space-y-1 text-sm text-green-800">
            {workout.successCriteria.map((criterion, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-green-600 flex-shrink-0">✓</span>
                <span>{criterion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Base Científica (colapsável) */}
      {workout.scientificBasis && (
        <details className="group">
          <summary className="cursor-pointer p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-md border border-indigo-200 flex items-center justify-between">
            <span className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Fundamento Científico
            </span>
            <span className="text-xs text-indigo-600 group-open:hidden">Clique para expandir</span>
          </summary>
          <div className="mt-2 p-3 bg-indigo-50 rounded-md text-sm text-indigo-900 leading-relaxed">
            {workout.scientificBasis}
          </div>
        </details>
      )}
    </div>

    {/* Manual Match Modal */}
    <ManualMatchModal
      open={showManualMatch}
      onOpenChange={setShowManualMatch}
      plannedWorkout={{
        id: workout.id,
        date: workout.date,
        title: workout.title,
        type: workout.type,
        distance: workout.distance,
      }}
      onMatch={handleManualMatch}
    />
  </>
  );
}

function SimpleWorkoutView({ workout, onManualMatch, onUpdate }: { workout: EnhancedWorkout; onManualMatch?: (completedId: number, workoutId: number) => Promise<void>; onUpdate?: () => Promise<void> }) {
  const [showManualMatch, setShowManualMatch] = useState(false);
  const [undoingMatch, setUndoingMatch] = useState(false);

  const handleManualMatch = async (completedWorkoutId: number) => {
    console.log('[SimpleWorkoutView] handleManualMatch called with:', { completedWorkoutId, workoutId: workout.id });
    if (onManualMatch) {
      console.log('[SimpleWorkoutView] Calling parent onManualMatch...');
      await onManualMatch(completedWorkoutId, workout.id);
      console.log('[SimpleWorkoutView] Parent onManualMatch completed');
    } else {
      console.warn('[SimpleWorkoutView] No onManualMatch callback provided!');
    }
    setShowManualMatch(false);
  };

  const handleUndoMatch = async () => {
    if (!workout.id) return;
    
    setUndoingMatch(true);
    try {
      const response = await fetch('/api/workouts/undo-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plannedWorkoutId: workout.id })
      });
      
      if (response.ok) {
        if (onUpdate) { await onUpdate(); } else { window.location.reload(); };
      } else {
        const error = await response.json();
        console.error('Erro ao desfazer match:', error);
        alert('Erro ao desfazer match. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao desfazer match:', error);
      alert('Erro ao desfazer match. Tente novamente.');
    } finally {
      setUndoingMatch(false);
    }
  };

  // Determinar qual workout mostrar (planejado ou executado)
  // Se isCompleted E tem executedWorkout, mostrar executado (independente de wasSubstitution)
  const displayWorkout = workout.isCompleted && workout.executedWorkout 
    ? workout.executedWorkout 
    : workout;

  return (
    <>
      <div className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900">
              {workout.isCompleted && workout.executedWorkout 
                ? `${workout.title.replace(/\s*-\s*[\d.]+km.*$/, '')} - ${displayWorkout.distance}km executados`
                : workout.title
              }
            </h3>
            {workout.isCompleted ? (
              <>
                <Badge className="bg-green-500 text-white text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Concluído
                </Badge>
                {workout.wasSubstitution && (
                  <Badge className="bg-purple-500 text-white text-xs">
                    🔄 Substituição
                  </Badge>
                )}
              </>
            ) : (
              // Ocultar botão "Concluir" para descansos (rest days)
              // Rest days não precisam ser marcados como concluídos
              workout.type !== 'rest' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowManualMatch(true);
                  }}
                  className="text-xs h-7 border-purple-200 hover:border-purple-400 hover:bg-purple-50"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Marcar como Concluído
                </Button>
              )
            )}
          </div>
          
          {/* Linha mostrando planejado (se foi executado diferente) */}
          {workout.isCompleted && workout.executedWorkout && workout.distance && (
            <div className="text-xs text-slate-600 mt-1 flex items-center gap-1">
              📋 Planejado: {workout.distance}km
              {workout.targetPace && `, ${workout.targetPace.includes('min/km') ? workout.targetPace : `${workout.targetPace} min/km`}`}
            </div>
          )}
          
          {/* Mensagem de Substituição + Botão Desfazer */}
          {workout.isCompleted && workout.wasSubstitution && (
            <div className="flex items-start gap-2 p-2 bg-purple-50 rounded border border-purple-200 mb-2">
              <Activity className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-purple-900 mb-2">
                  <span className="font-medium">Executado em dia diferente.</span> Marcado usando atividade de outra data.
                  {workout.executedWorkout?.date && (
                    <span className="block mt-1">
                      Executado em: {new Date(workout.executedWorkout.date).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </p>
                {workout.executedWorkoutId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleUndoMatch();
                    }}
                    disabled={undoingMatch}
                    className="text-xs h-6 border-red-200 hover:border-red-400 hover:bg-red-50"
                  >
                    {undoingMatch ? (
                      <>
                        <Activity className="h-3 w-3 mr-1 animate-spin" />
                        Desfazendo...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Desfazer
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Mensagem para Órfãos: Treino executado fora do planejado */}
          {workout.isOrphan && !workout.hasMatch && workout.suggestedMatch && (
            <div className="flex items-start gap-2 p-2 bg-blue-50 rounded border border-blue-200 mb-2">
              <Activity className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-blue-900 mb-2">
                  <span className="font-medium">Executado fora do planejamento.</span> Importado automaticamente, mas realizado em dia não planejado.
                </p>
                <p className="text-xs text-blue-800 mb-2">
                  📅 Planejado próximo: <span className="font-medium">{workout.suggestedMatch.title}</span> ({new Date(workout.suggestedMatch.date).toLocaleDateString('pt-BR')})
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (onManualMatch) {
                      onManualMatch(workout.completedWorkoutId!, workout.suggestedMatch!.id);
                    }
                  }}
                  className="text-xs h-6 border-blue-300 hover:border-blue-500 hover:bg-blue-100"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Marcar Substituição
                </Button>
              </div>
            </div>
          )}
          
          {workout.description && (
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              {workout.description}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {displayWorkout.distance && (
          <Badge variant="secondary" className="text-xs">
            📏 {displayWorkout.distance} km
          </Badge>
        )}
        {displayWorkout.pace && (
          <Badge variant="secondary" className="text-xs">
            ⚡ {displayWorkout.pace.includes('min/km') ? displayWorkout.pace : `${displayWorkout.pace} min/km`}
          </Badge>
        )}
        {displayWorkout.duration && (
          <Badge variant="secondary" className="text-xs">
            ⏱️ {displayWorkout.duration} min
          </Badge>
        )}
        {workout.targetPace && !displayWorkout.pace && (
          <Badge variant="secondary" className="text-xs">
            ⚡ {workout.targetPace.includes('min/km') ? workout.targetPace : `${workout.targetPace} min/km`}
          </Badge>
        )}
      </div>
    </div>

    {/* Manual Match Modal */}
    <ManualMatchModal
      open={showManualMatch}
      onOpenChange={setShowManualMatch}
      plannedWorkout={{
        id: workout.id,
        date: workout.date,
        title: workout.title,
        type: workout.type,
        distance: workout.distance,
      }}
      onMatch={handleManualMatch}
    />
  </>
);
}

// Componente para mostrar uma fase do treino
function PhaseCard({ 
  phase, 
  icon: Icon, 
  title, 
  color 
}: { 
  phase: WorkoutPhase; 
  icon: any; 
  title: string;
  color: 'blue' | 'orange' | 'green';
}) {
  const colors = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', icon: 'text-blue-600' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', icon: 'text-orange-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', icon: 'text-green-600' },
  };
  
  const style = colors[color];
  
  return (
    <div className={`p-3 ${style.bg} rounded-md border ${style.border} space-y-2`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${style.icon}`} />
          <span className={`font-medium text-sm ${style.text}`}>{title}</span>
        </div>
        <Badge variant="outline" className="text-xs">
          {phase.duration} min
        </Badge>
      </div>

      <p className={`text-sm ${style.text} ml-6`}>{phase.description}</p>

      {phase.steps && phase.steps.length > 0 && (
        <ol className={`text-sm ${style.text} ml-6 space-y-1 list-decimal list-inside`}>
          {phase.steps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      )}

      <div className="flex flex-wrap gap-2 ml-6">
        {phase.pace && (
          <Badge variant="secondary" className="text-xs">
            ⚡ {(() => {
              // Remove duplicações de /km
              const cleanPace = phase.pace.replace(/(min\/km)\/km/gi, 'min/km');
              // Se não tem unidade, adiciona
              return cleanPace.includes('min/km') ? cleanPace : `${cleanPace} min/km`;
            })()}
          </Badge>
        )}
        {phase.heartRateZone && (
          <Badge variant="secondary" className="text-xs">
            ❤️ FC: {phase.heartRateZone.min}-{phase.heartRateZone.max}% FCmáx
          </Badge>
        )}
      </div>

      {phase.notes && phase.notes.length > 0 && (
        <div className="ml-6 text-xs italic text-gray-600 mt-2">
          {phase.notes.map((note, idx) => (
            <p key={idx}>💡 {note}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente para mostrar treino intervalado
function IntervalCard({ interval }: { interval: IntervalStructure }) {
  return (
    <div className="p-3 bg-gradient-to-br from-red-50 to-orange-50 rounded-md border border-red-200 space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-red-600" />
        <span className="font-medium text-sm text-red-900">Treino Intervalado</span>
        <Badge className="bg-red-500 text-white text-xs ml-auto">
          {interval.repetitions}x
        </Badge>
      </div>

      {interval.setStructure && (
        <p className="text-xs text-red-700 italic">{interval.setStructure}</p>
      )}

      <div className="space-y-2">
        {/* Intervalo de Trabalho */}
        <div className="p-2 bg-white rounded border border-red-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-red-900">💪 Trabalho</span>
            <Badge variant="outline" className="text-xs">{interval.workInterval.duration}</Badge>
          </div>
          <p className="text-sm text-red-800">
            Pace: <span className="font-mono font-medium">{(() => {
              const pace = interval.workInterval.pace;
              const cleanPace = pace.replace(/(min\/km)\/km/gi, 'min/km');
              return cleanPace.includes('min/km') ? cleanPace : `${cleanPace} min/km`;
            })()}</span>
          </p>
          <p className="text-xs text-red-700 mt-1">{interval.workInterval.intensity}</p>
          {interval.workInterval.description && (
            <p className="text-xs text-gray-600 mt-1 italic">{interval.workInterval.description}</p>
          )}
        </div>

        {/* Intervalo de Recuperação */}
        <div className="p-2 bg-white rounded border border-blue-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-blue-900">😌 Recuperação</span>
            <Badge variant="outline" className="text-xs">{interval.recoveryInterval.duration}</Badge>
          </div>
          <p className="text-sm text-blue-800">
            Tipo: <span className="font-medium capitalize">
              {interval.recoveryInterval.type === 'jog' ? 'Trote' : 
               interval.recoveryInterval.type === 'walk' ? 'Caminhada' : 'Parado'}
            </span>
          </p>
          {interval.recoveryInterval.pace && (
            <p className="text-sm text-blue-800">
              Pace: <span className="font-mono font-medium">{(() => {
                const pace = interval.recoveryInterval.pace;
                const cleanPace = pace.replace(/(min\/km)\/km/gi, 'min/km');
                return cleanPace.includes('min/km') ? cleanPace : `${cleanPace} min/km`;
              })()}</span>
            </p>
          )}
          {interval.recoveryInterval.description && (
            <p className="text-xs text-gray-600 mt-1 italic">{interval.recoveryInterval.description}</p>
          )}
        </div>
      </div>

      {interval.notes && interval.notes.length > 0 && (
        <div className="pt-2 border-t border-red-200">
          {interval.notes.map((note, idx) => (
            <p key={idx} className="text-xs text-red-700">💡 {note}</p>
          ))}
        </div>
      )}
    </div>
  );
}
