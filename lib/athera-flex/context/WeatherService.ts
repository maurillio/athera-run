// lib/athera-flex/context/WeatherService.ts
import { WeatherContext } from './ContextAwarenessEngine';

interface OpenWeatherResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
  }>;
  wind: {
    speed: number;
  };
  rain?: {
    '1h'?: number;
  };
  snow?: {
    '1h'?: number;
  };
}

interface WeatherCache {
  location: string;
  data: OpenWeatherResponse;
  cachedAt: Date;
}

export class WeatherService {
  private static instance: WeatherService;
  private cache: Map<string, WeatherCache> = new Map();
  private readonly CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 horas
  private readonly API_KEY = process.env.OPENWEATHER_API_KEY;
  private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

  private constructor() {}

  public static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  /**
   * Obtém contexto de clima para um treino outdoor
   */
  async getWeatherContext(
    location: string,
    workoutDate: Date,
    isOutdoor: boolean
  ): Promise<WeatherContext | null> {
    // Se não é outdoor, clima não importa
    if (!isOutdoor) {
      return null;
    }

    // Se não tem API key, retorna null (feature desabilitada)
    if (!this.API_KEY) {
      console.log('[WeatherService] API key not configured, skipping weather check');
      return null;
    }

    try {
      const weatherData = await this.fetchWeatherData(location);
      return this.analyzeWeather(weatherData);
    } catch (error) {
      console.error('[WeatherService] Error fetching weather:', error);
      return null;
    }
  }

  /**
   * Busca dados de clima (com cache)
   */
  private async fetchWeatherData(location: string): Promise<OpenWeatherResponse> {
    // Verificar cache
    const cached = this.cache.get(location);
    if (cached && Date.now() - cached.cachedAt.getTime() < this.CACHE_DURATION_MS) {
      console.log('[WeatherService] Using cached weather data');
      return cached.data;
    }

    // Fazer chamada à API
    const url = `${this.BASE_URL}?q=${encodeURIComponent(location)}&appid=${this.API_KEY}&units=metric&lang=pt_br`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OpenWeather API error: ${response.status}`);
    }

    const data: OpenWeatherResponse = await response.json();

    // Atualizar cache
    this.cache.set(location, {
      location,
      data,
      cachedAt: new Date(),
    });

    return data;
  }

  /**
   * Analisa dados de clima e retorna contexto
   */
  private analyzeWeather(data: OpenWeatherResponse): WeatherContext {
    const temp = data.main.temp;
    const condition = data.weather[0].main;
    const precipitation = (data.rain?.['1h'] || data.snow?.['1h'] || 0);
    const windSpeed = data.wind.speed * 3.6; // m/s para km/h

    const isOutdoorSafe = this.isWeatherSafe(temp, condition, precipitation, windSpeed);
    const reason = this.getWeatherReason(temp, condition, precipitation, windSpeed, isOutdoorSafe);

    return {
      temperature: Math.round(temp),
      condition,
      precipitation,
      windSpeed: Math.round(windSpeed),
      isOutdoorSafe,
      reason,
    };
  }

  /**
   * Determina se clima é seguro para treino outdoor
   */
  private isWeatherSafe(
    temp: number,
    condition: string,
    precipitation: number,
    windSpeed: number
  ): boolean {
    // Temperatura extrema
    if (temp < 5 || temp > 35) return false;

    // Chuva forte (>5mm/h)
    if (precipitation > 5) return false;

    // Vento forte (>40 km/h)
    if (windSpeed > 40) return false;

    // Condições perigosas
    const dangerousConditions = ['Thunderstorm', 'Tornado', 'Hurricane'];
    if (dangerousConditions.includes(condition)) return false;

    return true;
  }

  /**
   * Gera razão legível em português
   */
  private getWeatherReason(
    temp: number,
    condition: string,
    precipitation: number,
    windSpeed: number,
    isSafe: boolean
  ): string {
    if (!isSafe) {
      if (temp < 5) return 'Temperatura muito baixa para treino outdoor';
      if (temp > 35) return 'Temperatura muito alta, risco de desidratação';
      if (precipitation > 5) return 'Chuva forte, piso escorregadio';
      if (windSpeed > 40) return 'Vento forte, risco de queda';
      if (condition === 'Thunderstorm') return 'Tempestade, risco de raio';
      return 'Condições climáticas perigosas';
    }

    // Condições boas
    if (temp >= 18 && temp <= 25 && condition === 'Clear') {
      return 'Condições ideais para treino outdoor';
    }

    if (precipitation > 0 && precipitation <= 2) {
      return 'Chuva fraca, considere treino indoor';
    }

    if (temp < 15) {
      return 'Clima fresco, use roupa adequada';
    }

    if (temp > 28) {
      return 'Clima quente, hidrate-se bem';
    }

    return 'Condições aceitáveis para treino outdoor';
  }

  /**
   * Limpa cache de clima (chamado por cron job)
   */
  clearCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.cachedAt.getTime() >= this.CACHE_DURATION_MS) {
        this.cache.delete(key);
      }
    }
    console.log('[WeatherService] Cache cleared');
  }
}

export const weatherService = WeatherService.getInstance();
