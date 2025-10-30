
import { NextRequest, NextResponse } from 'next/server';
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
  console.log('\n========================================');
  console.log('[STRAVA-CALLBACK] Iniciando callback...');
  console.log('[STRAVA-CALLBACK] URL completa:', request.url);
  console.log('[STRAVA-CALLBACK] Headers:', {
    cookie: request.headers.get('cookie') ? 'Tem cookie' : 'Sem cookie',
    'user-agent': request.headers.get('user-agent')?.substring(0, 50)
  });
  console.log('========================================\n');

  const { getServerSession } = await import('next-auth');
  const session = await getServerSession(authOptions);
  const baseUrl = getBaseUrl(request);
  const searchParams = request.nextUrl.searchParams;
  const stateParam = searchParams.get('state'); // State contém userId em base64

  // Tentar decodificar userId do state parameter
  let userIdFromState = '';
  if (stateParam) {
    try {
      userIdFromState = Buffer.from(stateParam, 'base64').toString('utf-8');
      console.log('[STRAVA-CALLBACK] UserID decodificado do state:', userIdFromState);
    } catch (e: any) {
      console.log('[STRAVA-CALLBACK] Erro ao decodificar state:', e.message);
    }
  }

  console.log('[STRAVA-CALLBACK] Session:', {
    exists: !!session,
    userId: session?.user?.id,
    email: session?.user?.email,
  });
  console.log('[STRAVA-CALLBACK] UserID do state:', userIdFromState);

  let userId = session?.user?.id || userIdFromState;

  if (!userId) {
    console.log('[STRAVA-CALLBACK] ❌ Nenhum userId encontrado - nem na session nem nos params');
    console.log('[STRAVA-CALLBACK] Redirecionando para login');
    return NextResponse.redirect(new URL('/login', baseUrl));
  }

  console.log('[STRAVA-CALLBACK] ✅ UserID confirmado:', userId);

  const code = searchParams.get('code');
  const error = searchParams.get('error');

  console.log('[STRAVA-CALLBACK] Code recebido:', code ? 'Sim' : 'Não');
  console.log('[STRAVA-CALLBACK] Error recebido:', error);

  // Se houver erro na autorização
  if (error) {
    console.log('[STRAVA-CALLBACK] Erro na autorização:', error);
    return NextResponse.redirect(new URL('/tracking?strava_error=' + error, baseUrl));
  }

  // Se não houver código, redirecionar para login
  if (!code) {
    console.log('[STRAVA-CALLBACK] Nenhum código recebido');
    return NextResponse.redirect(new URL('/tracking?strava_error=no_code', baseUrl));
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

    const data = await tokenResponse.json();
    console.log('[STRAVA-CALLBACK] Tokens obtidos com sucesso. Athlete ID:', data.athlete?.id);

    // Importar banco de dados
    const { prisma } = await import('@/lib/db');

    let profile = await prisma.athleteProfile.findUnique({
      where: { userId }
    });

    console.log('[STRAVA-CALLBACK] Perfil encontrado:', profile?.id);

    if (!profile) {
      console.log('[STRAVA-CALLBACK] Criando novo perfil de atleta');
      profile = await prisma.athleteProfile.create({
        data: {
          userId,
          weight: 88,
          height: 180,
          currentVDOT: 37.5,
          targetTime: "4:00:00",
          goalDistance: "marathon",
          runningLevel: "intermediate",
          stravaConnected: false
        }
      });
      console.log('[STRAVA-CALLBACK] Novo perfil criado:', profile.id);
    }

<<<<<<< HEAD
    console.log('[STRAVA-CALLBACK] Atualizando tokens do Strava para perfil', profile.id);
    console.log('[STRAVA-CALLBACK] Dados a salvar:');
    console.log('  - stravaAthleteId:', data.athlete.id.toString());
    console.log('  - stravaAccessToken:', data.access_token ? 'Tem' : 'Sem');
    console.log('  - stravaRefreshToken:', data.refresh_token ? 'Tem' : 'Sem');
    console.log('  - stravaTokenExpiry:', new Date(data.expires_at * 1000));

    let updatedProfile;
    try {
      updatedProfile = await prisma.athleteProfile.update({
        where: { id: profile.id },
        data: {
          stravaConnected: true,
          stravaAthleteId: data.athlete.id.toString(),
          stravaAccessToken: data.access_token,
          stravaRefreshToken: data.refresh_token,
          stravaTokenExpiry: new Date(data.expires_at * 1000)
        }
      });

      console.log('[STRAVA-CALLBACK] ✅ Tokens salvos com sucesso!');
      console.log('[STRAVA-CALLBACK] stravaConnected:', updatedProfile.stravaConnected);
      console.log('[STRAVA-CALLBACK] stravaAthleteId:', updatedProfile.stravaAthleteId);
    } catch (updateError: any) {
      console.error('[STRAVA-CALLBACK] ❌ ERRO ao atualizar perfil:');
      console.error('  Mensagem:', updateError.message);
      console.error('  Código:', updateError.code);
      if (updateError.meta) {
        console.error('  Meta:', updateError.meta);
      }
      throw updateError;
    }

    // Iniciar importação de histórico em background
    console.log('[STRAVA-CALLBACK] Disparando importação de treinos...');
    const importUrl = new URL('/api/strava/import', baseUrl);
    fetch(importUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId: profile.id, daysBack: 90 })
    }).catch(err => console.error('[STRAVA-CALLBACK] Erro ao iniciar importação:', err));

    // Configurar webhook em background
    console.log('[STRAVA-CALLBACK] Configurando webhook...');
    const webhookUrl = new URL('/api/strava/webhook/subscribe', baseUrl);
    fetch(webhookUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).catch(err => console.error('[STRAVA-CALLBACK] Erro ao configurar webhook:', err));

    console.log('[STRAVA-CALLBACK] Redirecionando para tracking...');
    return NextResponse.redirect(new URL('/tracking?strava_success=true', baseUrl));
  } catch (error) {
    console.error('[STRAVA] Erro na autenticação Strava:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.redirect(new URL(`/login?error=strava_auth_failed&details=${encodeURIComponent(errorMessage)}`, baseUrl));
  }
}
