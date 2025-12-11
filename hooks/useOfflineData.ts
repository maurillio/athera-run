import { useEffect, useState } from 'react';
import { getPlan, getProfile, getWorkouts } from '@/lib/pwa/indexeddb';

interface UseOfflineDataOptions {
  userId?: string;
  weekId?: string;
}

export function useOfflineData<T = any>(
  endpoint: 'plan/current' | 'profile' | 'workouts/weekly',
  options: UseOfflineDataOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      fetchData();
    };

    const handleOffline = () => {
      setIsOffline(true);
      loadFromIndexedDB();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOffline(!navigator.onLine);
    fetchData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [endpoint, options.userId, options.weekId]);

  async function fetchData() {
    if (!navigator.onLine) {
      await loadFromIndexedDB();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      setIsLoading(false);
    } catch (err) {
      console.error('[useOfflineData] Fetch failed, falling back to IndexedDB:', err);
      await loadFromIndexedDB();
      setError(err as Error);
      setIsLoading(false);
    }
  }

  async function loadFromIndexedDB() {
    if (!options.userId) {
      setIsLoading(false);
      return;
    }

    try {
      let cachedData: any = null;

      switch (endpoint) {
        case 'plan/current':
          const plan = await getPlan(options.userId);
          cachedData = plan?.data;
          break;

        case 'profile':
          const profile = await getProfile(options.userId);
          cachedData = profile?.data;
          break;

        case 'workouts/weekly':
          const workouts = await getWorkouts(options.userId, options.weekId);
          cachedData = workouts.map(w => w.data);
          break;
      }

      if (cachedData) {
        console.log('[useOfflineData] Loaded from IndexedDB:', endpoint);
        setData(cachedData);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('[useOfflineData] IndexedDB error:', err);
      setError(err as Error);
      setIsLoading(false);
    }
  }

  return {
    data,
    isOffline,
    isLoading,
    error,
    refetch: fetchData,
  };
}
