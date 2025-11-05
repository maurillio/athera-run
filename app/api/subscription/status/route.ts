import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSubscriptionStatus, isPremiumUser, getSubscriptionDaysRemaining } from '@/lib/subscription-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
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
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
