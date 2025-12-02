/**
 * Strava Token Manager
 * 
 * Gerencia automaticamente os tokens do Strava:
 * - Verifica se token está expirado
 * - Renova automaticamente se necessário
 * - Retorna token válido sempre
 * 
 * USO: Sempre use getValidStravaToken() ao invés de acessar stravaAccessToken diretamente
 */

import { prisma } from './prisma';

interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export async function getValidStravaToken(userId: string): Promise<string | null> {
  try {
    // Buscar perfil com tokens
    const profile = await prisma.athleteProfile.findUnique({
      where: { userId },
      select: {
        stravaAccessToken: true,
        stravaRefreshToken: true,
        stravaTokenExpiry: true,
        stravaConnected: true
      }
    });

    // Verificar se Strava está conectado
    if (!profile?.stravaConnected || !profile.stravaAccessToken) {
      console.log('[STRAVA_TOKEN] Strava not connected for user:', userId);
      return null;
    }

    // Verificar se token ainda está válido (com margem de 5 minutos)
    const now = Date.now();
    const expiresAt = profile.stravaTokenExpiry ? new Date(profile.stravaTokenExpiry).getTime() : 0;
    const fiveMinutes = 5 * 60 * 1000;

    if (expiresAt > now + fiveMinutes) {
      // Token ainda válido
      console.log('[STRAVA_TOKEN] Token valid, expires in:', Math.floor((expiresAt - now) / 60000), 'minutes');
      return profile.stravaAccessToken;
    }

    // Token expirado ou vai expirar em breve, renovar
    console.log('[STRAVA_TOKEN] Token expired or expiring soon, refreshing...');

    if (!profile.stravaRefreshToken) {
      console.error('[STRAVA_TOKEN] No refresh token available');
      return null;
    }

    // Fazer refresh
    const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: profile.stravaRefreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!refreshResponse.ok) {
      console.error('[STRAVA_TOKEN] Failed to refresh token:', refreshResponse.status);
      return null;
    }

    const tokens: StravaTokens = await refreshResponse.json();
    console.log('[STRAVA_TOKEN] Token refreshed successfully');

    // Atualizar tokens no banco
    await prisma.athleteProfile.update({
      where: { userId },
      data: {
        stravaAccessToken: tokens.access_token,
        stravaRefreshToken: tokens.refresh_token,
        stravaTokenExpiry: new Date(tokens.expires_at * 1000)
      }
    });

    console.log('[STRAVA_TOKEN] Tokens updated in database');

    return tokens.access_token;
  } catch (error) {
    console.error('[STRAVA_TOKEN] Error getting valid token:', error);
    return null;
  }
}

/**
 * Wrapper para fazer requisições ao Strava com token válido
 */
export async function fetchFromStrava(
  userId: string,
  url: string,
  options: RequestInit = {}
): Promise<Response | null> {
  const token = await getValidStravaToken(userId);
  
  if (!token) {
    console.error('[STRAVA_TOKEN] No valid token available');
    return null;
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
}
