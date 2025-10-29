
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
  const baseUrl = getBaseUrl(request);
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Se houver erro na autorização
  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${error}`, baseUrl));
  }

  // Se não houver código, redirecionar para login
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', baseUrl));
  }

  try {
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('Credenciais do Strava não configuradas');
      throw new Error('Credenciais do Strava não configuradas');
    }

    // Trocar código por tokens com Strava
    console.log('[STRAVA] Trocando código por tokens...');
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
      console.error('[STRAVA] Erro ao obter tokens:', errorData);
      throw new Error(`Erro ao obter tokens do Strava: ${errorData.message}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('[STRAVA] Tokens obtidos com sucesso. Athlete ID:', tokenData.athlete?.id);

    // Importar banco de dados
    const { prisma } = await import('@/lib/db');

    // Gerar email se não houver (Strava pode não retornar email)
    const athleteEmail = tokenData.athlete.email || `${tokenData.athlete.id}@strava.user`;
    console.log('[STRAVA] Email do atleta:', athleteEmail);

    // Buscar ou criar usuário
    let user = await prisma.user.findUnique({
      where: { email: athleteEmail }
    });

    if (!user) {
      console.log('[STRAVA] Criando novo usuário:', athleteEmail);
      user = await prisma.user.create({
        data: {
          email: athleteEmail,
          name: `${tokenData.athlete.firstname} ${tokenData.athlete.lastname}`,
          image: tokenData.athlete.profile_medium
        }
      });
    }

    // Buscar ou criar perfil de atleta
    const stravaAthleteId = tokenData.athlete.id.toString();

    // Primeiro tentar encontrar por userId
    let profile = await prisma.athleteProfile.findUnique({
      where: { userId: user.id }
    });

    // Se não encontrou, procurar pelo stravaAthleteId (caso de tentativa de login anterior)
    if (!profile) {
      try {
        profile = await prisma.athleteProfile.findFirst({
          where: { stravaAthleteId }
        });

        if (profile) {
          console.log('[STRAVA] Encontrou perfil existente com este stravaAthleteId, linkando ao novo usuário');
          // Atualizar o userId do perfil existente para o novo usuário
          profile = await prisma.athleteProfile.update({
            where: { id: profile.id },
            data: {
              userId: user.id,
              stravaConnected: true,
              stravaAccessToken: tokenData.access_token,
              stravaRefreshToken: tokenData.refresh_token,
              stravaTokenExpiry: new Date(tokenData.expires_at * 1000)
            }
          });
        }
      } catch (error) {
        console.log('[STRAVA] Perfil não encontrado pelo stravaAthleteId');
      }
    }

    // Se ainda não tem perfil, criar novo
    if (!profile) {
      console.log('[STRAVA] Criando novo perfil de atleta');
      profile = await prisma.athleteProfile.create({
        data: {
          userId: user.id,
          weight: 70,
          height: 170,
          currentVDOT: 35,
          targetTime: "4:00:00",
          goalDistance: "marathon",
          runningLevel: "intermediate",
          stravaConnected: true,
          stravaAthleteId: stravaAthleteId,
          stravaAccessToken: tokenData.access_token,
          stravaRefreshToken: tokenData.refresh_token,
          stravaTokenExpiry: new Date(tokenData.expires_at * 1000)
        }
      });
    } else {
      console.log('[STRAVA] Atualizando perfil de atleta existente');
      profile = await prisma.athleteProfile.update({
        where: { id: profile.id },
        data: {
          stravaConnected: true,
          stravaAccessToken: tokenData.access_token,
          stravaRefreshToken: tokenData.refresh_token,
          stravaTokenExpiry: new Date(tokenData.expires_at * 1000)
        }
      });
    }

    // Iniciar importação de histórico em background
    console.log('[STRAVA] Disparando importação de histórico...');
    const importUrl = new URL('/api/strava/import', baseUrl);
    fetch(importUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId: profile.id, daysBack: 90 })
    }).catch(err => console.error('[STRAVA] Erro ao iniciar importação:', err));

    // Configurar webhook em background
    console.log('[STRAVA] Disparando configuração de webhook...');
    const webhookUrl = new URL('/api/strava/webhook/subscribe', baseUrl);
    fetch(webhookUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).catch(err => console.error('[STRAVA] Erro ao configurar webhook:', err));

    // Redirecionar para onboarding se novo, ou dashboard se existente
    // O usuário está criado e pode fazer login normalmente agora
    const redirectUrl = profile ? '/onboarding' : '/dashboard';
    const redirect = new URL(`${redirectUrl}?strava_success=true`, baseUrl);

    console.log('[STRAVA] Redirecionando para:', redirect.toString());

    // Redirecionar para a página de login com redirecionamento automático
    return NextResponse.redirect(
      new URL(
        `/api/auth/signin?callbackUrl=${encodeURIComponent(redirect.toString())}&email=${encodeURIComponent(athleteEmail)}`,
        baseUrl
      )
    );
  } catch (error) {
    console.error('[STRAVA] Erro na autenticação Strava:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.redirect(new URL(`/login?error=strava_auth_failed&details=${encodeURIComponent(errorMessage)}`, baseUrl));
  }
}
