/**
 * ATHERA FLEX v3.3.0 - Workout Matcher Hook
 * Hook React para detecção automática de matches entre treinos
 */

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { MatchScore } from '@/lib/athera-flex/smart-workout-matcher';

// ============================================================================
// TYPES
// ============================================================================

export interface MatchSuggestion {
  completedWorkoutId: number;
  completedWorkout: {
    date: Date;
    type: string;
    distance?: number;
    duration?: number;
  };
  matches: MatchScore[];
  bestMatch: MatchScore;
  shouldAutoApply: boolean;
}

export interface UseWorkoutMatcherOptions {
  enabled?: boolean;
  autoDetect?: boolean;
  minConfidence?: number;
}

export interface UseWorkoutMatcherReturn {
  suggestions: MatchSuggestion[];
  loading: boolean;
  error: string | null;
  checkForMatches: () => Promise<void>;
  applySuggestion: (suggestionIndex: number) => Promise<boolean>;
  rejectSuggestion: (suggestionIndex: number) => Promise<void>;
  clearSuggestions: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useWorkoutMatcher(
  options: UseWorkoutMatcherOptions = {}
): UseWorkoutMatcherReturn {
  const { enabled = true, autoDetect = true, minConfidence = 60 } = options;
  
  const { data: session, status } = useSession();
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<number>(0);

  /**
   * Busca matches para treinos completados recentemente
   */
  const checkForMatches = useCallback(async () => {
    if (!enabled || status !== 'authenticated' || !session?.user?.email) {
      return;
    }

    // Throttle DESABILITADO para debug
    console.log('[useWorkoutMatcher] Checking for matches... (no throttle)');
    setLoading(true);
    setError(null);

    try {
      // 1. Buscar treinos completados nos últimos 7 dias sem match
      const completedResponse = await fetch('/api/athera-flex/detect-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minConfidence }),
      });

      if (!completedResponse.ok) {
        throw new Error('Erro ao buscar matches');
      }

      const data = await completedResponse.json();

      if (data.success && data.suggestions?.length > 0) {
        setSuggestions(data.suggestions);
        
        // Auto-aplicar matches de alta confiança (se configurado)
        await autoApplyHighConfidenceMatches(data.suggestions);
      }

      // setLastCheck(now); // Removido: não precisamos de lastCheck sem throttle
    } catch (err: any) {
      console.error('[useWorkoutMatcher] Error:', err);
      setError(err.message || 'Erro ao detectar matches');
    } finally {
      setLoading(false);
    }
  }, [enabled, status, session, minConfidence]);

  /**
   * Aplica sugestão de match
   */
  const applySuggestion = useCallback(async (suggestionIndex: number): Promise<boolean> => {
    const suggestion = suggestions[suggestionIndex];
    if (!suggestion) return false;

    try {
      const response = await fetch('/api/athera-flex/apply-adjustment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedWorkoutId: suggestion.completedWorkoutId,
          plannedWorkoutId: suggestion.bestMatch.workoutId,
          confidence: suggestion.bestMatch.confidence,
          dateScore: suggestion.bestMatch.dateScore,
          typeScore: suggestion.bestMatch.typeScore,
          volumeScore: suggestion.bestMatch.volumeScore,
          intensityScore: suggestion.bestMatch.intensityScore,
          triggeredBy: 'athlete_manual',
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao aplicar ajuste');
      }

      const data = await response.json();

      if (data.success) {
        // Remove sugestão aplicada
        setSuggestions(prev => prev.filter((_, i) => i !== suggestionIndex));
        return true;
      }

      return false;
    } catch (err: any) {
      console.error('[useWorkoutMatcher] Error applying suggestion:', err);
      setError(err.message);
      return false;
    }
  }, [suggestions]);

  /**
   * Rejeita sugestão de match
   */
  const rejectSuggestion = useCallback(async (suggestionIndex: number): Promise<void> => {
    const suggestion = suggestions[suggestionIndex];
    if (!suggestion) return;

    try {
      await fetch('/api/athera-flex/reject-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedWorkoutId: suggestion.completedWorkoutId,
          plannedWorkoutId: suggestion.bestMatch.workoutId,
          confidence: suggestion.bestMatch.confidence,
        }),
      });

      // Remove sugestão rejeitada
      setSuggestions(prev => prev.filter((_, i) => i !== suggestionIndex));
    } catch (err: any) {
      console.error('[useWorkoutMatcher] Error rejecting suggestion:', err);
    }
  }, [suggestions]);

  /**
   * Limpa todas as sugestões
   */
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  /**
   * Auto-detecta matches quando novo treino é completado
   */
  useEffect(() => {
    if (!autoDetect || !enabled) return;

    // Check inicial
    checkForMatches();

    // Intervalo de 5 minutos
    const interval = setInterval(checkForMatches, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoDetect, enabled, checkForMatches]);

  /**
   * Event listener para novos treinos (via custom event)
   */
  useEffect(() => {
    const handleNewWorkout = () => {
      checkForMatches();
    };

    window.addEventListener('athera:workout:completed', handleNewWorkout);
    return () => window.removeEventListener('athera:workout:completed', handleNewWorkout);
  }, [checkForMatches]);

  return {
    suggestions,
    loading,
    error,
    checkForMatches,
    applySuggestion,
    rejectSuggestion,
    clearSuggestions,
  };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Auto-aplica matches de alta confiança
 */
async function autoApplyHighConfidenceMatches(suggestions: MatchSuggestion[]): Promise<void> {
  // Buscar settings do usuário
  const settingsResponse = await fetch('/api/athera-flex/settings');
  if (!settingsResponse.ok) return;

  const { settings } = await settingsResponse.json();

  // Se auto-apply desativado, não fazer nada
  if (!settings.autoAdjustEnabled) return;

  // Filtrar matches que devem ser auto-aplicados
  const toAutoApply = suggestions.filter(s => s.shouldAutoApply);

  for (const suggestion of toAutoApply) {
    try {
      await fetch('/api/athera-flex/apply-adjustment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedWorkoutId: suggestion.completedWorkoutId,
          plannedWorkoutId: suggestion.bestMatch.workoutId,
          confidence: suggestion.bestMatch.confidence,
          dateScore: suggestion.bestMatch.dateScore,
          typeScore: suggestion.bestMatch.typeScore,
          volumeScore: suggestion.bestMatch.volumeScore,
          intensityScore: suggestion.bestMatch.intensityScore,
          triggeredBy: 'ai_auto',
        }),
      });
    } catch (err) {
      console.error('[autoApply] Error:', err);
    }
  }
}

/**
 * Dispatch custom event quando treino é completado
 */
export function notifyWorkoutCompleted(): void {
  window.dispatchEvent(new CustomEvent('athera:workout:completed'));
}
