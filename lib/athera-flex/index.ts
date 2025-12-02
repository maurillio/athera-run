/**
 * ATHERA FLEX v3.3.0 - Index
 * Exportações centralizadas do sistema de flexibilidade
 */

// Core Engine
export {
  SmartWorkoutMatcher,
  createMatcherFromUserSettings,
  type MatchScore,
  type MatchCriteria,
} from './smart-workout-matcher';

export {
  AdjustmentEngine,
  adjustmentEngine,
  type AdjustmentResult,
  type ApplyAdjustmentParams,
  type UndoAdjustmentParams,
} from './adjustment-engine';

// Re-export para conveniência
export const flexEngine = {
  matcher: SmartWorkoutMatcher,
  adjustment: adjustmentEngine,
};
