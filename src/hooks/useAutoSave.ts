/**
 * useAutoSave Hook
 * 
 * Automatically saves data after a debounce delay
 * Shows visual indicators of save status
 * 
 * @example
 * const { isSaving, lastSaved } = useAutoSave(
 *   formData,
 *   async (data) => { await api.save(data); },
 *   { delay: 2000, enabled: true }
 * );
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { debounce } from 'lodash';

interface AutoSaveOptions {
  delay?: number;
  enabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface AutoSaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
  saveNow: () => Promise<void>;
}

export function useAutoSave<T>(
  data: T,
  onSave: (data: T) => Promise<void>,
  options: AutoSaveOptions = {}
): AutoSaveReturn {
  const {
    delay = 2000,
    enabled = true,
    onSuccess,
    onError
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const previousDataRef = useRef<T>();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);

  const performSave = useCallback(async (dataToSave: T) => {
    if (!isMountedRef.current || !enabled) return;

    setIsSaving(true);
    setError(null);

    try {
      await onSave(dataToSave);
      
      if (isMountedRef.current) {
        setLastSaved(new Date());
        onSuccess?.();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Save failed');
      if (isMountedRef.current) {
        setError(error);
        onError?.(error);
      }
      console.error('[AutoSave] Error:', error);
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  }, [enabled, onSave, onSuccess, onError]);

  const debouncedSave = useRef(
    debounce((dataToSave: T) => {
      performSave(dataToSave);
    }, delay)
  ).current;

  const saveNow = useCallback(async () => {
    debouncedSave.cancel();
    await performSave(data);
  }, [data, performSave, debouncedSave]);

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      debouncedSave.cancel();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [debouncedSave]);

  useEffect(() => {
    if (!enabled || !data) return;

    // Only save if data has actually changed
    const dataString = JSON.stringify(data);
    const previousDataString = JSON.stringify(previousDataRef.current);

    if (dataString !== previousDataString) {
      previousDataRef.current = data;
      debouncedSave(data);
    }
  }, [data, enabled, debouncedSave]);

  return { isSaving, lastSaved, error, saveNow };
}
