/**
 * ATHERA FLEX v3.3.0 - ML LIBRARY INDEX
 * 
 * Exporta todas as funções ML para uso no sistema
 */

// Decision Collector
export {
  recordDecision,
  getUserDecisionPatterns,
  getUserDecisionStats,
  markOldMatchesAsIgnored,
  analyzeAcceptanceByConfidenceRange,
  type DecisionContext
} from './decision-collector';

// Threshold Calibration
export {
  calculateOptimalThreshold,
  saveThresholdRecommendation,
  applyThresholdRecommendation,
  getLatestThresholdRecommendation,
  runThresholdCalibration,
  type ThresholdRecommendation
} from './threshold-calibration';

// Weights Personalization
export {
  calculatePersonalizedWeights,
  savePersonalizedWeights,
  getUserWeights,
  recalculateConfidenceWithWeights,
  runWeightsOptimization,
  type PersonalizedWeights
} from './weights-personalization';

// Predictive Insights
export {
  generateUserInsights,
  predictMatchSuccess,
  getMLDashboard,
  type MLInsights
} from './predictive-insights';
