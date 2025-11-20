import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { getSubscriptionStatus, isPremiumUser, getSubscriptionDaysRemaining } from '@/lib/subscription-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = await requireAuth();
    
    const subscription = await getSubscriptionStatus(userId);
    const isPremium = await isPremiumUser(userId);
    const daysRemaining = await getSubscriptionDaysRemaining(userId);

    return NextResponse.json({
      subscription,
      isPremium,
      daysRemaining,
    });
  } catch (error: any) {
    console.error('Error getting subscription status:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
