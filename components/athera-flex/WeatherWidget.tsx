/**
 * ATHERA FLEX v3.4.0 - Weather Widget
 * Widget que mostra condições climáticas e segurança para treino outdoor
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  Sun, 
  Wind, 
  Droplets,
  Thermometer,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  precipitation: number;
  wind: number;
  humidity: number;
  isOutdoorSafe: boolean;
  reasons: string[];
}

interface WeatherWidgetProps {
  location?: string;
  workoutDate?: Date;
  isOutdoor?: boolean;
  compact?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function WeatherWidget({
  location = 'São Paulo',
  workoutDate,
  isOutdoor = true,
  compact = false,
  className,
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(workoutDate || new Date());

  useEffect(() => {
    if (workoutDate) {
      setDate(workoutDate);
    } else {
      setDate(new Date());
    }
  }, [workoutDate]);

  const fetchWeather = async () => {
    if (!isOutdoor) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/context/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location,
          workoutDate: date.toISOString(),
          isOutdoor,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar clima');
      }

      const data = await response.json();
      setWeather(data);
    } catch (err) {
      console.error('Erro ao buscar clima:', err);
      setError('Não foi possível carregar o clima');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [location, workoutDate, isOutdoor]);

  // Se não é outdoor, não mostrar
  if (!isOutdoor) return null;

  // Loading state
  if (loading) {
    return (
      <Card className={cn('border-blue-200', className)}>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2 text-sm text-gray-600">Carregando clima...</span>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn('border-red-200', className)}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchWeather}
              className="text-red-600 hover:text-red-700"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data
  if (!weather) return null;

  // Ícone de condição
  const getWeatherIcon = () => {
    const condition = weather.condition.toLowerCase();
    if (condition.includes('rain')) return <CloudRain className="h-8 w-8" />;
    if (condition.includes('snow')) return <CloudSnow className="h-8 w-8" />;
    if (condition.includes('cloud')) return <Cloud className="h-8 w-8" />;
    return <Sun className="h-8 w-8" />;
  };

  // Compact version (para calendário)
  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
          weather.isOutdoorSafe 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        )}>
          {weather.isOutdoorSafe ? (
            <CheckCircle className="h-3 w-3" />
          ) : (
            <AlertTriangle className="h-3 w-3" />
          )}
          <span>{weather.temperature.toFixed(0)}°C</span>
        </div>
        {weather.precipitation > 0 && (
          <Badge variant="outline" className="text-xs">
            <CloudRain className="h-3 w-3 mr-1" />
            {weather.precipitation.toFixed(0)}mm
          </Badge>
        )}
      </div>
    );
  }

  // Full version
  return (
    <Card className={cn(
      'border-2',
      weather.isOutdoorSafe ? 'border-green-200' : 'border-red-200',
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Condições do Clima</CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchWeather}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status principal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              'p-3 rounded-full',
              weather.isOutdoorSafe ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            )}>
              {getWeatherIcon()}
            </div>
            <div>
              <p className="text-2xl font-bold">{weather.temperature.toFixed(0)}°C</p>
              <p className="text-sm text-gray-600 capitalize">{weather.description}</p>
            </div>
          </div>

          <Badge 
            variant={weather.isOutdoorSafe ? 'default' : 'destructive'}
            className="h-8 px-3"
          >
            {weather.isOutdoorSafe ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Seguro
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-1" />
                Cuidado
              </>
            )}
          </Badge>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Chuva</p>
              <p className="text-sm font-medium">{weather.precipitation.toFixed(1)}mm</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Vento</p>
              <p className="text-sm font-medium">{weather.wind.toFixed(0)}km/h</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-xs text-gray-500">Umidade</p>
              <p className="text-sm font-medium">{weather.humidity}%</p>
            </div>
          </div>
        </div>

        {/* Avisos */}
        {weather.reasons.length > 0 && (
          <div className={cn(
            'rounded-lg p-3 text-sm',
            weather.isOutdoorSafe 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          )}>
            <p className="font-medium mb-1">
              {weather.isOutdoorSafe ? '✓ Condições favoráveis' : '⚠ Atenção'}
            </p>
            <ul className="space-y-1 text-xs">
              {weather.reasons.map((reason, idx) => (
                <li key={idx}>• {reason}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Localização */}
        <p className="text-xs text-gray-500 text-center pt-2 border-t">
          📍 {location} • Atualizado agora
        </p>
      </CardContent>
    </Card>
  );
}
