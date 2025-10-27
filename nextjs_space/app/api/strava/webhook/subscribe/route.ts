
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;
    const verifyToken = process.env.STRAVA_VERIFY_TOKEN;

    if (!clientId || !clientSecret || !verifyToken) {
      return NextResponse.json(
        { error: 'Credenciais do Strava não configuradas' },
        { status: 500 }
      );
    }

    // Verificar se já existe uma subscrição ativa
    const existing = await prisma.stravaWebhook.findFirst({
      where: { isActive: true }
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Webhook já está configurado',
        subscriptionId: existing.subscriptionId
      });
    }

    const callbackUrl = `${request.nextUrl.origin}/api/strava/webhook`;

    // Criar subscrição no Strava
    const response = await fetch('https://www.strava.com/api/v3/push_subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        callback_url: callbackUrl,
        verify_token: verifyToken
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro ao criar webhook:', errorData);
      
      // Se já existe, apenas retornar sucesso
      if (response.status === 400 || response.status === 409) {
        return NextResponse.json({
          success: true,
          message: 'Webhook já configurado no Strava',
          note: 'Uma subscrição já existe no Strava'
        });
      }
      
      throw new Error('Erro ao criar webhook no Strava');
    }

    const data = await response.json();

    // Salvar no banco
    await prisma.stravaWebhook.create({
      data: {
        subscriptionId: data.id,
        callbackUrl,
        verifyToken,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      subscriptionId: data.id,
      message: 'Webhook configurado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao configurar webhook:', error);
    return NextResponse.json(
      { error: 'Erro ao configurar webhook' },
      { status: 500 }
    );
  }
}

// Listar subscrições ativas
export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;

    const response = await fetch(
      `https://www.strava.com/api/v3/push_subscriptions?client_id=${clientId}&client_secret=${clientSecret}`
    );

    if (!response.ok) {
      throw new Error('Erro ao listar webhooks');
    }

    const subscriptions = await response.json();

    return NextResponse.json({
      success: true,
      subscriptions
    });

  } catch (error) {
    console.error('Erro ao listar webhooks:', error);
    return NextResponse.json(
      { error: 'Erro ao listar webhooks' },
      { status: 500 }
    );
  }
}
