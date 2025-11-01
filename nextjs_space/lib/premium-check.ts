import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function isPremiumUser(userId?: string): Promise<boolean> {
  try {
    if (!userId) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) return false;
      userId = session.user.id;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true },
    });

    return user?.isPremium || false;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
}

export async function getSubscriptionStatus(userId?: string) {
  try {
    if (!userId) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) return null;
      userId = session.user.id;
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    return subscription;
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
}

export async function requirePremium(userId?: string): Promise<boolean> {
  const isPremium = await isPremiumUser(userId);
  if (!isPremium) {
    throw new Error('PREMIUM_REQUIRED');
  }
  return true;
}

export const PREMIUM_FEATURES = {
  STRAVA_INTEGRATION: 'Integração com Strava',
  AUTO_ADJUST: 'Auto-ajuste de treinos',
  UNLIMITED_CHAT: 'Chat ilimitado com IA',
  ADVANCED_ANALYTICS: 'Analytics avançados',
  MULTI_RACE: 'Múltiplas metas de corrida',
  PRIORITY_SUPPORT: 'Suporte prioritário',
} as const;

export type PremiumFeature = typeof PREMIUM_FEATURES[keyof typeof PREMIUM_FEATURES];
