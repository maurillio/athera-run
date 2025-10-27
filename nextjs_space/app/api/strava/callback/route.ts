
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = "force-dynamic";

// Função helper para obter a URL base correta
function getBaseUrl(request: NextRequest): string {
  // Primeiro, tentar usar a variável de ambiente
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  // Tentar usar o header x-forwarded-host (usado por proxies)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  
  // Fallback para a URL da requisição
  return new URL(request.url).origin;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const baseUrl = getBaseUrl(request);
  
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/login', baseUrl));
  }
  
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Se houver erro na autorização
  if (error) {
    return NextResponse.redirect(new URL('/tracking?strava_error=' + error, baseUrl));
  }

  // Se não houver código, redirecionar para página de tracking
  if (!code) {
    return NextResponse.redirect(new URL('/tracking?strava_error=no_code', baseUrl));
  }

  // Trocar código por tokens
  try {
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Credenciais do Strava não configuradas');
    }

    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Erro ao obter tokens do Strava:', errorData);
      throw new Error('Erro ao obter tokens do Strava');
    }

    const data = await tokenResponse.json();

    // Salvar tokens no perfil do atleta
    const { prisma } = await import('@/lib/db');
    
    let profile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id }
    });
    
    if (!profile) {
      profile = await prisma.athleteProfile.create({
        data: {
          userId: session.user.id,
          weight: 88,
          height: 180,
          currentVDOT: 37.5,
          targetTime: "4:00:00",
          goalDistance: "marathon",
          runningLevel: "intermediate",
          stravaConnected: false
        }
      });
    }

    await prisma.athleteProfile.update({
      where: { id: profile.id },
      data: {
        stravaConnected: true,
        stravaAthleteId: data.athlete.id.toString(),
        stravaAccessToken: data.access_token,
        stravaRefreshToken: data.refresh_token,
        stravaTokenExpiry: new Date(data.expires_at * 1000)
      }
    });

    // Iniciar importação de histórico em background
    const importUrl = new URL('/api/strava/import', baseUrl);
    fetch(importUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId: profile.id, daysBack: 90 })
    }).catch(err => console.error('Erro ao iniciar importação:', err));

    // Configurar webhook em background
    const webhookUrl = new URL('/api/strava/webhook/subscribe', baseUrl);
    fetch(webhookUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).catch(err => console.error('Erro ao configurar webhook:', err));

    return NextResponse.redirect(new URL('/tracking?strava_success=true', baseUrl));
  } catch (error) {
    console.error('Erro na autenticação Strava:', error);
    return NextResponse.redirect(new URL('/tracking?strava_error=auth_failed', baseUrl));
  }
}
