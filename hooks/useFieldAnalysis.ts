/**
 * Hook to fetch and manage field analysis
 * v2.8.0
 * 
 * Fetches AI field usage data once and provides status for each field
 */

'use client';

import { useState, useEffect } from 'react';
import { FieldStatus, FieldImportance } from '@/components/ai-transparency/AIFieldStatus';

interface FieldInfo {
  fieldName: string;
  label: string;
  value?: string;
  importance: string;
  impact: string;
  howUsed: string;
}

interface FieldAnalysisData {
  success: boolean;
  completenessScore: number;
  fieldsUsed: FieldInfo[];
  fieldsMissing: FieldInfo[];
  fieldsConflicting: FieldInfo[];
  recommendations: string[];
}

interface FieldStatusMap {
  [fieldName: string]: {
    status: FieldStatus;
    importance: FieldImportance;
    value?: string;
    reason?: string;
  };
}

export function useFieldAnalysis() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FieldAnalysisData | null>(null);
  const [fieldStatusMap, setFieldStatusMap] = useState<FieldStatusMap>({});

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const response = await fetch('/api/ai/field-analysis');
        
        if (!response.ok) {
          throw new Error('Failed to fetch field analysis');
        }

        const result = await response.json();
        setData(result);

        // Build status map for quick lookup
        const statusMap: FieldStatusMap = {};

        // Add used fields
        result.fieldsUsed.forEach((field: FieldInfo) => {
          statusMap[field.fieldName] = {
            status: 'used',
            importance: field.importance as FieldImportance,
            value: field.value,
          };
        });

        // Add missing fields
        result.fieldsMissing.forEach((field: FieldInfo) => {
          statusMap[field.fieldName] = {
            status: 'missing',
            importance: field.importance as FieldImportance,
            reason: 'Campo não preenchido',
          };
        });

        // Add conflicting fields
        result.fieldsConflicting.forEach((field: FieldInfo) => {
          statusMap[field.fieldName] = {
            status: 'conflicting',
            importance: field.importance as FieldImportance,
            value: field.value,
            reason: field.howUsed,
          };
        });

        setFieldStatusMap(statusMap);
        setLoading(false);
      } catch (err) {
        console.error('[useFieldAnalysis] Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, []);

  const getFieldStatus = (fieldName: string): FieldStatusMap[string] | null => {
    return fieldStatusMap[fieldName] || null;
  };

  return {
    loading,
    error,
    data,
    completenessScore: data?.completenessScore || 0,
    fieldsUsed: data?.fieldsUsed || [],
    fieldsMissing: data?.fieldsMissing || [],
    fieldsConflicting: data?.fieldsConflicting || [],
    recommendations: data?.recommendations || [],
    getFieldStatus,
  };
}
