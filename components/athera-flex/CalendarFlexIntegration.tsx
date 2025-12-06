/**
 * ATHERA FLEX v3.3.0 - Calendar Integration Wrapper
 * Wrapper que adiciona funcionalidade Athera Flex ao calendário existente
 */

'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { useWorkoutMatcher } from '@/hooks/useWorkoutMatcher';
import { WorkoutAdjustmentModal, SuggestionBadge, flexNotifications } from '@/components/athera-flex';
import { useSession } from 'next-auth/react';

// ============================================================================
// CONTEXT para compartilhar estado entre componentes
// ============================================================================

interface FlexContextType {
  suggestions: any[];
  loading: boolean;
  openSuggestionModal: (workoutId: number) => void;
}

const FlexContext = createContext<FlexContextType>({
  suggestions: [],
  loading: false,
  openSuggestionModal: () => {},
});

export const useFlexContext = () => useContext(FlexContext);

// ============================================================================
// TYPES
// ============================================================================

interface CalendarFlexIntegrationProps {
  workouts: any[]; // Array de workouts do calendário
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CalendarFlexIntegration({ workouts }: CalendarFlexIntegrationProps) {
  const { data: session } = useSession();
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number | null>(null);

  const {
    suggestions,
    loading,
    applySuggestion,
    rejectSuggestion,
  } = useWorkoutMatcher({
    enabled: true,
    autoDetect: true,
    minConfidence: 60, // Reduzido de 70 para 60 para aceitar matches com maior diferença de volume
  });

  // Notificar quando houver múltiplos matches
  useEffect(() => {
    if (suggestions.length > 1) {
      flexNotifications.multipleMatches(suggestions.length, () => {
        setSelectedSuggestionIndex(0);
      });
    } else if (suggestions.length === 1) {
      flexNotifications.matchDetected(
        suggestions[0].bestMatch.confidence,
        suggestions[0].plannedWorkout?.title || 'Treino',
        () => setSelectedSuggestionIndex(0)
      );
    }
  }, [suggestions.length]);

  // Handle aplicar ajuste
  const handleApply = async () => {
    if (selectedSuggestionIndex === null) return;

    try {
      const success = await applySuggestion(selectedSuggestionIndex);
      
      if (success) {
        const suggestion = suggestions[selectedSuggestionIndex];
        flexNotifications.adjustmentApplied(
          suggestion.plannedWorkout?.title || 'Treino',
          suggestion.bestMatch.confidence
        );
        
        setSelectedSuggestionIndex(null);
        
        // Disparar evento para recarregar dados (sem refresh da página)
        window.dispatchEvent(new CustomEvent('athera:plan:updated'));
      }
    } catch (error) {
      console.error('[FlexIntegration] Apply error:', error);
    }
  };

  // Handle rejeitar sugestão
  const handleReject = async () => {
    if (selectedSuggestionIndex === null) return;

    try {
      await rejectSuggestion(selectedSuggestionIndex);
      
      const suggestion = suggestions[selectedSuggestionIndex];
      flexNotifications.suggestionRejected(
        suggestion.plannedWorkout?.title || 'Treino'
      );
      
      setSelectedSuggestionIndex(null);
    } catch (error) {
      console.error('[FlexIntegration] Reject error:', error);
    }
  };

  // Função para abrir modal de um workout específico
  const openSuggestionModal = (workoutId: number) => {
    const index = suggestions.findIndex(
      s => s.plannedWorkout?.id === workoutId || s.completedWorkoutId === workoutId
    );
    if (index >= 0) {
      setSelectedSuggestionIndex(index);
    }
  };

  // Context value
  const contextValue: FlexContextType = {
    suggestions,
    loading,
    openSuggestionModal,
  };

  return (
    <FlexContext.Provider value={contextValue}>
      {/* Modal de Sugestões */}
      <WorkoutAdjustmentModal
        open={selectedSuggestionIndex !== null}
        onOpenChange={(open) => !open && setSelectedSuggestionIndex(null)}
        suggestion={selectedSuggestionIndex !== null ? suggestions[selectedSuggestionIndex] : null}
        onApply={handleApply}
        onReject={handleReject}
        isPremium={session?.user?.isPremium || false}
      />
    </FlexContext.Provider>
  );
}

// ============================================================================
// BADGE COMPONENT (Para usar individualmente em cards)
// ============================================================================

interface WorkoutFlexBadgeProps {
  workoutId: number;
}

export function WorkoutFlexBadge({ workoutId }: WorkoutFlexBadgeProps) {
  const { suggestions, openSuggestionModal } = useFlexContext();

  const suggestion = suggestions.find(
    s => s.plannedWorkout?.id === workoutId || s.completedWorkoutId === workoutId
  );

  if (!suggestion) return null;

  return (
    <div className="absolute -top-2 -right-2 z-10">
      <SuggestionBadge
        count={1}
        confidence={suggestion.bestMatch.confidence}
        onClick={() => openSuggestionModal(workoutId)}
        animated
      />
    </div>
  );
}
