import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET() {
  // Lista TODAS as variáveis de ambiente relacionadas ao Strava
  const allEnvKeys = Object.keys(process.env).filter(key => 
    key.toLowerCase().includes('strava') || 
    key.includes('STRAVA')
  );

  const stravaVars = {
    'STRAVA_CLIENT_ID': {
      exists: !!process.env.STRAVA_CLIENT_ID,
      length: process.env.STRAVA_CLIENT_ID?.length || 0,
      preview: process.env.STRAVA_CLIENT_ID?.slice(0, 8) + '...'
    },
    'STRAVA_CLIENT_SECRET': {
      exists: !!process.env.STRAVA_CLIENT_SECRET,
      length: process.env.STRAVA_CLIENT_SECRET?.length || 0,
      preview: process.env.STRAVA_CLIENT_SECRET ? '***HIDDEN***' : undefined
    },
    'STRAVA_REDIRECT_URI': {
      exists: !!process.env.STRAVA_REDIRECT_URI,
      value: process.env.STRAVA_REDIRECT_URI || 'NOT SET'
    }
  };

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'unknown',
    allStravaKeys: allEnvKeys,
    variables: stravaVars,
    recommendation: !process.env.STRAVA_REDIRECT_URI 
      ? '⚠️ ADICIONE STRAVA_REDIRECT_URI no Vercel com valor: https://atherarun.com/api/strava/callback'
      : '✅ Todas as variáveis configuradas corretamente'
  });
}
