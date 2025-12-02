/**
 * ATHERA FLEX v3.3.0 - Calendar Integration Wrapper
 * Wrapper que adiciona funcionalidade Athera Flex ao calendário existente
 */

'use client';

import { useEffect, useState } from 'react';
import { useWorkoutMatcher } from '@/hooks/useWorkoutMatcher';
import { WorkoutAdjustmentModal, SuggestionBadge, flexNotifications } from '@/components/athera-flex';
import { useSession } from 'next-auth/react';

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
    minConfidence: 70,
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
      await applySuggestion(selectedSuggestionIndex);
      
      const suggestion = suggestions[selectedSuggestionIndex];
      flexNotifications.adjustmentApplied(
        suggestion.plannedWorkout?.title || 'Treino',
        suggestion.bestMatch.confidence
      );
      
      setSelectedSuggestionIndex(null);
      
      // Recarregar página após 2s para mostrar mudanças
      setTimeout(() => {
        window.location.reload();
      }, 2000);
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

  // Encontrar suggestion para um workout específico
  const getSuggestionForWorkout = (workoutId: number) => {
    return suggestions.find(
      s => s.plannedWorkout?.id === workoutId || s.completedWorkoutId === workoutId
    );
  };

  return (
    <>
      {/* Modal de Sugestões */}
      <WorkoutAdjustmentModal
        open={selectedSuggestionIndex !== null}
        onOpenChange={(open) => !open && setSelectedSuggestionIndex(null)}
        suggestion={selectedSuggestionIndex !== null ? suggestions[selectedSuggestionIndex] : null}
        onApply={handleApply}
        onReject={handleReject}
        isPremium={session?.user?.isPremium || false}
      />
    </>
  );
}

// ============================================================================
// BADGE COMPONENT (Para usar individualmente em cards)
// ============================================================================

interface WorkoutFlexBadgeProps {
  workoutId: number;
  onOpenModal?: () => void;
}

export function WorkoutFlexBadge({ workoutId, onOpenModal }: WorkoutFlexBadgeProps) {
  const { suggestions } = useWorkoutMatcher({
    enabled: true,
    autoDetect: false, // Não auto-detectar, só mostrar existentes
  });

  const suggestion = suggestions.find(
    s => s.plannedWorkout?.id === workoutId || s.completedWorkoutId === workoutId
  );

  if (!suggestion) return null;

  return (
    <div className="absolute -top-2 -left-2 z-10">
      <SuggestionBadge
        count={1}
        confidence={suggestion.bestMatch.confidence}
        onClick={() => {
          if (onOpenModal) {
            onOpenModal();
          }
        }}
        animated
      />
    </div>
  );
}
