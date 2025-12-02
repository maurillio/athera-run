/**
 * ATHERA FLEX v3.3.0 - Example Integration
 * Exemplo de como integrar o sistema completo
 */

'use client';

import { useState } from 'react';
import { useWorkoutMatcher } from '@/hooks/useWorkoutMatcher';
import { WorkoutAdjustmentModal } from './WorkoutAdjustmentModal';
import { SuggestionBadge } from './SuggestionBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Settings } from 'lucide-react';
import { useSession } from 'next-auth/react';

// ============================================================================
// EXAMPLE COMPONENT (Para demonstração)
// ============================================================================

export function FlexSystemDemo() {
  const { data: session } = useSession();
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number | null>(null);

  const {
    suggestions,
    loading,
    error,
    checkForMatches,
    applySuggestion,
    rejectSuggestion,
    clearSuggestions,
  } = useWorkoutMatcher({
    enabled: true,
    autoDetect: true,
    minConfidence: 70,
  });

  const handleApply = async () => {
    if (selectedSuggestionIndex === null) return;
    await applySuggestion(selectedSuggestionIndex);
    setSelectedSuggestionIndex(null);
  };

  const handleReject = async () => {
    if (selectedSuggestionIndex === null) return;
    await rejectSuggestion(selectedSuggestionIndex);
    setSelectedSuggestionIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Athera Flex System</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => checkForMatches()}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Detectar Matches
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Status */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{suggestions.length}</p>
              <p className="text-sm text-muted-foreground">Matches Encontrados</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {loading ? '...' : (suggestions[0]?.bestMatch.confidence || 0)}%
              </p>
              <p className="text-sm text-muted-foreground">Melhor Confiança</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{session?.user?.isPremium ? 'Premium' : 'Free'}</p>
              <p className="text-sm text-muted-foreground">Plano Atual</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Suggestions List */}
          {suggestions.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium">Sugestões Disponíveis:</p>
              {suggestions.map((suggestion, index) => (
                <Card key={index} className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardContent 
                    className="p-4 flex items-center justify-between"
                    onClick={() => setSelectedSuggestionIndex(index)}
                  >
                    <div className="flex items-center gap-4">
                      <SuggestionBadge
                        count={1}
                        confidence={suggestion.bestMatch.confidence}
                        onClick={() => setSelectedSuggestionIndex(index)}
                        variant="compact"
                      />
                      <div>
                        <p className="font-medium">
                          {suggestion.completedWorkout.type} → {suggestion.plannedWorkout?.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.bestMatch.confidence}% confiança • {suggestion.bestMatch.reasons[0]}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Ver Detalhes
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && suggestions.length === 0 && (
            <div className="mt-4 text-center py-8">
              <p className="text-muted-foreground">Nenhum match encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Complete um treino para ver sugestões inteligentes
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <WorkoutAdjustmentModal
        open={selectedSuggestionIndex !== null}
        onOpenChange={(open) => !open && setSelectedSuggestionIndex(null)}
        suggestion={selectedSuggestionIndex !== null ? suggestions[selectedSuggestionIndex] : null}
        onApply={handleApply}
        onReject={handleReject}
        isPremium={session?.user?.isPremium || false}
      />
    </div>
  );
}

// ============================================================================
// CALENDAR INTEGRATION EXAMPLE
// ============================================================================

/**
 * Exemplo de como adicionar o badge no calendário existente
 * 
 * No arquivo /app/[locale]/plano/page.tsx:
 */

/*
export function CalendarWorkoutCard({ workout, completed }) {
  const { suggestions } = useWorkoutMatcher();
  const [showModal, setShowModal] = useState(false);

  // Encontrar suggestion para este workout
  const suggestion = suggestions.find(
    s => s.completedWorkoutId === completed?.id
  );

  return (
    <Card>
      <CardContent>
        {workout.title}
        
        {completed && suggestion && (
          <SuggestionBadge
            count={1}
            confidence={suggestion.bestMatch.confidence}
            onClick={() => setShowModal(true)}
          />
        )}
      </CardContent>

      <WorkoutAdjustmentModal
        open={showModal}
        onOpenChange={setShowModal}
        suggestion={suggestion}
        onApply={() => applySuggestion(0)}
        onReject={() => rejectSuggestion(0)}
      />
    </Card>
  );
}
*/
