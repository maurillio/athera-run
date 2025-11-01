import { prisma } from './prisma';
import { SubscriptionStatus, SubscriptionPlan } from '@prisma/client';

export async function getSubscriptionStatus(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    // Create a free subscription if none exists
    return await prisma.subscription.create({
      data: {
        userId,
        status: SubscriptionStatus.FREE,
        plan: SubscriptionPlan.FREE,
      },
    });
  }

  return subscription;
}

export async function isPremiumUser(userId: string): Promise<boolean> {
  const subscription = await getSubscriptionStatus(userId);
  
  // User is premium if:
  // 1. Status is ACTIVE or TRIAL
  // 2. Plan is not FREE
  // 3. If TRIAL, trial hasn't expired
  
  if (subscription.status === SubscriptionStatus.ACTIVE) {
    return subscription.plan !== SubscriptionPlan.FREE;
  }
  
  if (subscription.status === SubscriptionStatus.TRIAL) {
    if (!subscription.trialEndsAt) return false;
    return new Date() < subscription.trialEndsAt;
  }
  
  return false;
}

export async function canAccessFeature(
  userId: string,
  feature: 'strava' | 'auto_adjust' | 'unlimited_chat' | 'advanced_analytics' | 'multi_race'
): Promise<boolean> {
  const isPremium = await isPremiumUser(userId);
  
  // All premium features require premium subscription
  return isPremium;
}

export async function startTrial(userId: string) {
  const trialDays = 7;
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

  return await prisma.subscription.upsert({
    where: { userId },
    update: {
      status: SubscriptionStatus.TRIAL,
      plan: SubscriptionPlan.PREMIUM_MONTHLY,
      trialEndsAt,
    },
    create: {
      userId,
      status: SubscriptionStatus.TRIAL,
      plan: SubscriptionPlan.PREMIUM_MONTHLY,
      trialEndsAt,
    },
  });
}

export async function updateSubscriptionFromStripe(
  userId: string,
  data: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    stripePriceId?: string;
    stripeCurrentPeriodEnd?: Date;
    status: SubscriptionStatus;
    plan: SubscriptionPlan;
    cancelAtPeriodEnd?: boolean;
  }
) {
  return await prisma.subscription.upsert({
    where: { userId },
    update: {
      ...data,
      updatedAt: new Date(),
    },
    create: {
      userId,
      ...data,
    },
  });
}

export async function cancelSubscription(userId: string, immediately = false) {
  const subscription = await getSubscriptionStatus(userId);
  
  if (!subscription.stripeSubscriptionId) {
    throw new Error('No active Stripe subscription found');
  }

  if (immediately) {
    // Cancel immediately
    return await prisma.subscription.update({
      where: { userId },
      data: {
        status: SubscriptionStatus.CANCELED,
        plan: SubscriptionPlan.FREE,
        cancelAtPeriodEnd: false,
      },
    });
  } else {
    // Cancel at period end
    return await prisma.subscription.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: true,
      },
    });
  }
}

export async function reactivateSubscription(userId: string) {
  return await prisma.subscription.update({
    where: { userId },
    data: {
      cancelAtPeriodEnd: false,
      status: SubscriptionStatus.ACTIVE,
    },
  });
}

export async function getSubscriptionDaysRemaining(userId: string): Promise<number | null> {
  const subscription = await getSubscriptionStatus(userId);
  
  if (subscription.status === SubscriptionStatus.TRIAL && subscription.trialEndsAt) {
    const now = new Date();
    const diff = subscription.trialEndsAt.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  
  if (subscription.stripeCurrentPeriodEnd) {
    const now = new Date();
    const diff = subscription.stripeCurrentPeriodEnd.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  
  return null;
}
