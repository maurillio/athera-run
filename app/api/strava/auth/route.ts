
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = process.env.STRAVA_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    return NextResponse.json({
      error: 'Credenciais do Strava não configuradas. Configure STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET e STRAVA_REDIRECT_URI nas variáveis de ambiente.'
    }, { status: 500 });
  }

  const scope = 'read,activity:read_all,activity:write';
  
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=force&scope=${scope}`;
  
  return NextResponse.redirect(authUrl);
}
