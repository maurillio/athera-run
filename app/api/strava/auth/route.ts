
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET(request: NextRequest) {
  // Log para debug em produção
  console.log('[STRAVA AUTH] Verificando variáveis de ambiente:', {
    hasClientId: !!process.env.STRAVA_CLIENT_ID,
    hasClientSecret: !!process.env.STRAVA_CLIENT_SECRET,
    hasRedirectUri: !!process.env.STRAVA_REDIRECT_URI
  });

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const redirectUri = process.env.STRAVA_REDIRECT_URI;
  
  // Validação melhorada
  if (!clientId || !clientSecret || !redirectUri) {
    console.error('[STRAVA AUTH] Credenciais faltando:', {
      clientId: !!clientId,
      clientSecret: !!clientSecret,
      redirectUri: !!redirectUri
    });

    return NextResponse.json({
      error: 'Credenciais do Strava não configuradas.',
      details: 'Verifique se as seguintes variáveis estão configuradas no Vercel: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REDIRECT_URI',
      debug: {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        hasRedirectUri: !!redirectUri,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }

  const scope = 'read,activity:read_all,activity:write';
  
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=force&scope=${scope}`;
  
  console.log('[STRAVA AUTH] Redirecionando para Strava OAuth');
  
  return NextResponse.redirect(authUrl);
}
