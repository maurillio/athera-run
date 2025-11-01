import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-10-28.acacia',
  typescript: true,
});

// Stripe Price IDs (set these after creating products in Stripe Dashboard)
export const STRIPE_PRICES = {
  PREMIUM_MONTHLY: process.env.STRIPE_PRICE_MONTHLY || '',
  PREMIUM_ANNUAL: process.env.STRIPE_PRICE_ANNUAL || '',
} as const;

export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    interval: null,
    features: [
      'Geração de plano personalizado com IA',
      'Visualização do plano completo',
      'Lançamento manual de treinos',
      'Dashboard básico',
      'Calculadora VDOT',
    ],
  },
  PREMIUM_MONTHLY: {
    name: 'Premium Mensal',
    price: 2990, // R$ 29,90 in cents
    interval: 'month',
    features: [
      'Tudo do plano Free',
      'Integração completa com Strava',
      'Ajustes automáticos inteligentes com IA',
      'Chat ilimitado com treinador virtual',
      'Análise avançada de performance',
      'Sincronização automática de treinos',
      'Notificações e lembretes',
      'Planejamento de múltiplas provas',
      'Relatórios semanais personalizados',
    ],
  },
  PREMIUM_ANNUAL: {
    name: 'Premium Anual',
    price: 15990, // R$ 159,90 in cents (55% discount)
    interval: 'year',
    features: [
      'Tudo do plano Free',
      'Integração completa com Strava',
      'Ajustes automáticos inteligentes com IA',
      'Chat ilimitado com treinador virtual',
      'Análise avançada de performance',
      'Sincronização automática de treinos',
      'Notificações e lembretes',
      'Planejamento de múltiplas provas',
      'Relatórios semanais personalizados',
      '55% de desconto',
    ],
  },
} as const;
