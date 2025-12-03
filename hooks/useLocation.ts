'use client';

import { useState, useEffect } from 'react';

interface Location {
  city: string;
  latitude: number;
  longitude: number;
  source: 'browser' | 'ip' | 'profile' | 'default';
  error?: string;
}

interface UseLocationResult {
  location: Location | null;
  loading: boolean;
  error: string | null;
  requestPermission: () => void;
}

/**
 * Hook: useLocation
 * 
 * Detecta localização do usuário com 3 camadas de fallback:
 * 1. Geolocation API (browser) - mais preciso
 * 2. IP Geolocation - automático
 * 3. Perfil do atleta - salvo no banco
 */
export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Converte lat/lng para nome da cidade usando reverse geocoding
   */
  const getCityFromCoords = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: {
            'User-Agent': 'Athera Run App',
          },
        }
      );
      const data = await response.json();
      return data.address?.city || data.address?.town || data.address?.village || 'Unknown';
    } catch {
      return 'Unknown';
    }
  };

  /**
   * Tenta usar Geolocation API do browser (Opção 1)
   */
  const tryBrowserGeolocation = async (): Promise<Location | null> => {
    if (!navigator.geolocation) {
      console.log('[useLocation] Geolocation não suportado');
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const city = await getCityFromCoords(latitude, longitude);

          console.log('[useLocation] Browser geolocation:', { city, latitude, longitude });

          // Salvar no perfil
          await fetch('/api/profile/location', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ city, latitude, longitude }),
          }).catch((err) => console.error('[useLocation] Erro ao salvar:', err));

          resolve({ city, latitude, longitude, source: 'browser' });
        },
        (err) => {
          console.log('[useLocation] Browser geolocation negado:', err.message);
          resolve(null);
        },
        {
          timeout: 10000,
          maximumAge: 600000, // Cache 10min
        }
      );
    });
  };

  /**
   * Fallback: IP Geolocation (Opção 2)
   */
  const tryIPGeolocation = async (): Promise<Location | null> => {
    try {
      const response = await fetch('/api/location/ip');
      if (!response.ok) return null;

      const data = await response.json();
      console.log('[useLocation] IP geolocation:', data);

      // Salvar no perfil se não vier do fallback
      if (data.source !== 'fallback') {
        await fetch('/api/profile/location', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            city: data.city,
            latitude: data.latitude,
            longitude: data.longitude,
          }),
        }).catch((err) => console.error('[useLocation] Erro ao salvar:', err));
      }

      return {
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        source: 'ip',
      };
    } catch (err) {
      console.error('[useLocation] IP geolocation falhou:', err);
      return null;
    }
  };

  /**
   * Fallback: Perfil do atleta (Opção 3)
   */
  const tryProfileLocation = async (): Promise<Location | null> => {
    try {
      const response = await fetch('/api/profile');
      if (!response.ok) return null;

      const profile = await response.json();
      if (profile.city && profile.latitude && profile.longitude) {
        console.log('[useLocation] Usando localização do perfil:', profile.city);
        return {
          city: profile.city,
          latitude: profile.latitude,
          longitude: profile.longitude,
          source: 'profile',
        };
      }

      return null;
    } catch (err) {
      console.error('[useLocation] Erro ao buscar perfil:', err);
      return null;
    }
  };

  /**
   * Fallback final: São Paulo
   */
  const getDefaultLocation = (): Location => {
    console.log('[useLocation] Usando localização padrão: São Paulo');
    return {
      city: 'São Paulo',
      latitude: -23.5505,
      longitude: -46.6333,
      source: 'default',
    };
  };

  /**
   * Cascata de detecção (1 → 2 → 3 → default)
   */
  const detectLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Tenta browser geolocation
      let loc = await tryBrowserGeolocation();
      if (loc) {
        setLocation(loc);
        setLoading(false);
        return;
      }

      // 2. Tenta IP geolocation
      loc = await tryIPGeolocation();
      if (loc) {
        setLocation(loc);
        setLoading(false);
        return;
      }

      // 3. Tenta perfil salvo
      loc = await tryProfileLocation();
      if (loc) {
        setLocation(loc);
        setLoading(false);
        return;
      }

      // 4. Usa padrão
      setLocation(getDefaultLocation());
    } catch (err) {
      console.error('[useLocation] Erro geral:', err);
      setError('Não foi possível detectar sua localização');
      setLocation(getDefaultLocation());
    } finally {
      setLoading(false);
    }
  };

  /**
   * Solicita permissão explícita (chamado pelo usuário)
   */
  const requestPermission = () => {
    detectLocation();
  };

  useEffect(() => {
    detectLocation();
  }, []);

  return { location, loading, error, requestPermission };
}
