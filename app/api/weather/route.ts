import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

interface OpenWeatherResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'São Paulo';
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      console.log('[Weather API] OPENWEATHER_API_KEY not configured');
      return NextResponse.json(
        { error: 'Weather service not configured' },
        { status: 503 }
      );
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},BR&appid=${apiKey}&units=metric&lang=pt_br`;

    const response = await fetch(url, {
      next: { revalidate: 1800 } // Cache por 30 minutos
    });

    if (!response.ok) {
      throw new Error(`OpenWeather API error: ${response.status}`);
    }

    const data: OpenWeatherResponse = await response.json();

    const weatherData = {
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed * 3.6, // m/s para km/h
      description: data.weather[0]?.description || 'Sem informação',
      icon: data.weather[0]?.icon || '01d'
    };

    return NextResponse.json(weatherData);

  } catch (error) {
    console.error('[Weather API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
