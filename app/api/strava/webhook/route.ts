
import { NextRequest, NextResponse } from 'next/server';
import { processStravaWebhook } from '@/lib/strava-webhook-handler';

export const dynamic = "force-dynamic";

// GET - Validação do webhook (Strava envia isso para verificar o endpoint)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log('Webhook validation request:', { mode, token, challenge });

  // Verificar se é uma requisição de validação válida
  if (mode === 'subscribe' && token === process.env.STRAVA_VERIFY_TOKEN) {
    console.log('Webhook validation successful');
    return NextResponse.json({ 'hub.challenge': challenge });
  }

  console.log('Webhook validation failed');
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// POST - Receber eventos do Strava (v3.2.0 - Sistema Completo)
export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    
    console.log('🎣 Webhook event received:', event);
    
    // Processar evento usando o handler completo
    const result = await processStravaWebhook(event);
    
    console.log('✅ Webhook processed:', result);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    return NextResponse.json({ success: true }); // Sempre retornar 200 para o Strava
  }
}
