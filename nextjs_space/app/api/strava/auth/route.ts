
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  console.log('[STRAVA-AUTH] Iniciando fluxo de autenticação do Strava');

  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = process.env.STRAVA_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    console.error('[STRAVA-AUTH] Credenciais não configuradas');
    return NextResponse.json({
      error: 'Credenciais do Strava não configuradas. Configure STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET e STRAVA_REDIRECT_URI nas variáveis de ambiente.'
    }, { status: 500 });
  }

  // Tentar obter session para passar userId como fallback
  const session = await getServerSession(authOptions);
  console.log('[STRAVA-AUTH] Session obtida:', {
    exists: !!session,
    userId: session?.user?.id
  });

  const scope = 'read,activity:read_all,activity:write';

  // Construir URL com state parameter contendo userId para segurança
  const state = session?.user?.id ? Buffer.from(session.user.id).toString('base64') : '';

  let authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=force&scope=${scope}`;

  if (state) {
    authUrl += `&state=${encodeURIComponent(state)}`;
  }

  console.log('[STRAVA-AUTH] Redirecionando para Strava com state:', state ? 'Sim' : 'Não');
  return NextResponse.redirect(authUrl);
}
