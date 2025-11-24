/**
 * AI Transparency System - Field Usage Tracking
 * v2.8.0
 * 
 * Tracks which profile fields are used by the AI during plan generation
 */

import prisma from '@/lib/db';
import { AI_FIELD_CONFIGS, type AIFieldConfig } from '@/types/ai-transparency';

export interface FieldTrackingData {
  fieldName: string;
  fieldValue: any;
  wasUsed: boolean;
  importance: string;
  howUsed: string;
  impact: string;
}

/**
 * Maps profile data to trackable fields with their configurations
 */
export function mapProfileToTrackableFields(profile: any): FieldTrackingData[] {
  const trackableFields: FieldTrackingData[] = [];

  // Find field config and check if field has value
  const processField = (fieldName: string, fieldValue: any) => {
    const config = AI_FIELD_CONFIGS.find(c => c.field === fieldName);
    if (!config) return;

    const hasValue = fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
    
    trackableFields.push({
      fieldName: config.field,
      fieldValue: hasValue ? String(fieldValue) : null,
      wasUsed: hasValue, // Used if has value
      importance: config.importance,
      howUsed: config.howUsed,
      impact: config.impact,
    });
  };

  // Basic Data
  processField('age', profile.age);
  processField('gender', profile.gender);
  processField('weight', profile.weight);
  processField('height', profile.height);

  // Performance
  processField('runningLevel', profile.runningLevel);
  processField('currentWeeklyKm', profile.currentWeeklyKm);
  processField('longestRun', profile.longestRun);
  processField('runningYears', profile.runningYears);
  
  // Best times (check if any exist)
  if (profile.bestTimes && typeof profile.bestTimes === 'object') {
    const hasBestTimes = Object.keys(profile.bestTimes).length > 0;
    processField('bestTimes', hasBestTimes ? JSON.stringify(profile.bestTimes) : null);
  } else {
    processField('bestTimes', null);
  }

  // Health
  processField('restingHeartRate', profile.restingHeartRate);
  processField('injuries', profile.injuries ? JSON.stringify(profile.injuries) : null);
  processField('sleepQuality', profile.sleepQuality);
  processField('stressLevel', profile.stressLevel);

  // Goals
  processField('goalDistance', profile.goalDistance);
  processField('targetRaceDate', profile.targetRaceDate);
  processField('targetTime', profile.targetTime);

  // Availability
  processField('trainingSchedule', profile.trainingSchedule ? JSON.stringify(profile.trainingSchedule) : null);
  processField('longRunDay', profile.longRunDay);
  processField('hasGymAccess', profile.hasGymAccess);
  processField('hasTrackAccess', profile.hasTrackAccess);

  // Advanced
  if (profile.stravaStats) {
    processField('stravaStats', JSON.stringify(profile.stravaStats));
  }

  return trackableFields;
}

/**
 * Saves field usage tracking to database
 */
export async function trackFieldUsage(
  userId: string,
  planId: number | null,
  fields: FieldTrackingData[]
): Promise<void> {
  try {
    // Delete old tracking for this user/plan combination to avoid duplicates
    if (planId) {
      await prisma.aIFieldUsage.deleteMany({
        where: {
          userId,
          planId,
        },
      });
    }

    // Create new tracking records
    const records = fields.map(field => ({
      userId,
      planId,
      fieldName: field.fieldName,
      fieldValue: field.fieldValue,
      wasUsed: field.wasUsed,
      importance: field.importance,
      howUsed: field.howUsed,
      impact: field.impact,
    }));

    await prisma.aIFieldUsage.createMany({
      data: records,
    });

    console.log(`[AI TRACKING] ✅ Tracked ${records.length} fields for user ${userId}`);
    console.log(`[AI TRACKING] 📊 Used: ${records.filter(r => r.wasUsed).length}/${records.length}`);
  } catch (error) {
    console.error('[AI TRACKING] ❌ Error tracking field usage:', error);
    // Don't throw - tracking failure shouldn't break plan generation
  }
}

/**
 * Retrieves field usage for a specific plan or user's latest plan
 */
export async function getFieldUsageForPlan(
  userId: string,
  planId?: number
): Promise<FieldTrackingData[]> {
  try {
    const records = await prisma.aIFieldUsage.findMany({
      where: {
        userId,
        ...(planId && { planId }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return records.map(r => ({
      fieldName: r.fieldName,
      fieldValue: r.fieldValue,
      wasUsed: r.wasUsed,
      importance: r.importance || 'medium',
      howUsed: r.howUsed || '',
      impact: r.impact || '',
    }));
  } catch (error) {
    console.error('[AI TRACKING] ❌ Error retrieving field usage:', error);
    return [];
  }
}

/**
 * Calculates completeness score (0-100) based on field usage
 */
export function calculateCompletenessScore(fields: FieldTrackingData[]): number {
  if (fields.length === 0) return 0;

  // Weight by importance
  const weights = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  let totalWeight = 0;
  let usedWeight = 0;

  fields.forEach(field => {
    const weight = weights[field.importance as keyof typeof weights] || 2;
    totalWeight += weight;
    if (field.wasUsed) {
      usedWeight += weight;
    }
  });

  return totalWeight > 0 ? Math.round((usedWeight / totalWeight) * 100) : 0;
}
