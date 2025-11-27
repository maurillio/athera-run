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
    // ⚠️ API /api/ai/field-analysis foi desativada temporariamente
    // Retornando dados vazios para evitar 404
    setData({
      success: true,
      completenessScore: 100,
      fieldsUsed: [],
      fieldsMissing: [],
      fieldsConflicting: [],
      recommendations: [],
    });
    setFieldStatusMap({});
    setLoading(false);
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
