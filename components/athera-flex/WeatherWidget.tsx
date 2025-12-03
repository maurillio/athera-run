'use client';

import { useEffect, useState } from 'react';
import { useLocation } from '@/hooks/useLocation';
import { Wind, Droplets, MapPin, Loader2, AlertCircle } from 'lucide-react';

interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
}

export function WeatherWidget() {
  const { location, loading: locationLoading } = useLocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!location) return;

    const fetchWeather = async () => {
      setWeatherLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          lat: location.latitude.toString(),
          lon: location.longitude.toString(),
        });

        const response = await fetch(`/api/weather?${params}`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar clima');
        }

        const data = await response.json();
        setWeather(data);
      } catch (err) {
        console.error('[WeatherWidget] Error:', err);
        setError('Não foi possível carregar o clima');
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  if (locationLoading || weatherLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-center h-32">
        <div className="text-center text-gray-500">
          <AlertCircle className="h-6 w-6 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const getWeatherAdvice = () => {
    const temp = weather.temp;
    const wind = weather.wind_speed;

    if (temp > 30) {
      return {
        text: 'Calor intenso - hidrate-se bem',
        color: 'text-red-600',
      };
    } else if (temp < 10) {
      return {
        text: 'Frio - use roupas adequadas',
        color: 'text-blue-600',
      };
    } else if (wind > 30) {
      return {
        text: 'Vento forte - cuidado em trilhas',
        color: 'text-orange-600',
      };
    } else {
      return {
        text: 'Condições ideais para treinar',
        color: 'text-green-600',
      };
    }
  };

  const advice = getWeatherAdvice();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {location?.city || 'Carregando...'}
          </span>
          <span className="text-xs text-gray-500">
            ({location?.source === 'browser' ? '📍 GPS' : 
              location?.source === 'ip' ? '🌐 IP' : 
              location?.source === 'profile' ? '👤 Perfil' : '⚙️ Padrão'})
          </span>
        </div>
        <img
          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
          alt={weather.description}
          className="w-12 h-12"
        />
      </div>

      {/* Temperature */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-4xl font-bold text-gray-900 dark:text-white">
          {Math.round(weather.temp)}°
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Sensação {Math.round(weather.feels_like)}°
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 capitalize">
        {weather.description}
      </p>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Vento</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {Math.round(weather.wind_speed)} km/h
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Umidade</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {weather.humidity}%
            </p>
          </div>
        </div>
      </div>

      {/* Advice */}
      <div className={`text-sm font-medium ${advice.color} bg-white dark:bg-gray-800 rounded-md px-3 py-2 text-center`}>
        {advice.text}
      </div>
    </div>
  );
}
