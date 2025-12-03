import { NextResponse } from 'next/server';

/**
 * API: GET /api/location/ip
 * 
 * Retorna localização baseada no IP do usuário (fallback).
 * Usa ipapi.co (gratuito, 1000 req/dia).
 */
export async function GET(request: Request) {
  try {
    // Pegar IP do request (Vercel fornece via headers)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip');

    if (!ip || ip === '::1' || ip === '127.0.0.1') {
      // IP local - retornar São Paulo como padrão
      return NextResponse.json({
        city: 'São Paulo',
        region: 'SP',
        country: 'BR',
        latitude: -23.5505,
        longitude: -46.6333,
        source: 'default',
      });
    }

    // Consultar API de geolocalização por IP (gratuita)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'Athera Run App',
      },
    });

    if (!response.ok) {
      throw new Error('IP geolocation API falhou');
    }

    const data = await response.json();

    return NextResponse.json({
      city: data.city || 'São Paulo',
      region: data.region_code || 'SP',
      country: data.country_code || 'BR',
      latitude: data.latitude || -23.5505,
      longitude: data.longitude || -46.6333,
      source: 'ip',
    });
  } catch (error) {
    console.error('[IP Location] Error:', error);

    // Fallback: São Paulo
    return NextResponse.json({
      city: 'São Paulo',
      region: 'SP',
      country: 'BR',
      latitude: -23.5505,
      longitude: -46.6333,
      source: 'fallback',
      error: 'Não foi possível detectar localização via IP',
    });
  }
}
