import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { getSubscriptionStatus } from '@/lib/subscription-service';

export async function POST(req: NextRequest) {
  try {
    console.log('[Portal] Iniciando criação de portal session...');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('[Portal] Usuário não autenticado');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Portal] Usuário:', session.user.email);
    const userId = session.user.id;
    const subscription = await getSubscriptionStatus(userId);

    console.log('[Portal] Subscription:', {
      stripeCustomerId: subscription?.stripeCustomerId,
      status: subscription?.status,
      plan: subscription?.plan
    });

    if (!subscription?.stripeCustomerId) {
      console.log('[Portal] Stripe Customer ID não encontrado para usuário:', userId);
      return NextResponse.json(
        { error: 'Você precisa ter uma assinatura ativa para acessar o portal de gerenciamento.' },
        { status: 400 }
      );
    }

    // Verificar se stripe está inicializado
    if (!stripe) {
      console.log('[Portal] Stripe não inicializado');
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    console.log('[Portal] Criando portal session para customer:', subscription.stripeCustomerId);
    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/perfil`,
    });

    console.log('[Portal] Portal session criado com sucesso:', portalSession.url);
    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('[Portal] Erro ao criar portal session:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
