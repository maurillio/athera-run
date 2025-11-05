import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { getSubscriptionStatus } from '@/lib/subscription-service';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const userId = session.user.id;
    const subscription = await getSubscriptionStatus(userId);

    const test1 = {
      name: 'Subscription exists',
      passed: !!subscription,
      data: subscription?.stripeCustomerId,
    };

    const test2 = {
      name: 'Stripe configured',
      passed: !!stripe && !!process.env.STRIPE_SECRET_KEY,
    };

    let test3: { name: string; passed: boolean; data: string | null; error: string | null } = { 
      name: 'Create portal', 
      passed: false, 
      data: null, 
      error: null 
    };

    if (subscription?.stripeCustomerId && stripe) {
      try {
        const portal = await stripe.billingPortal.sessions.create({
          customer: subscription.stripeCustomerId,
          return_url: `${process.env.NEXTAUTH_URL}/perfil`,
        });
        test3 = { name: 'Create portal', passed: true, data: portal.url, error: null };
      } catch (error: any) {
        test3 = { name: 'Create portal', passed: false, data: null, error: error.message };
      }
    }

    return NextResponse.json({
      success: [test1, test2, test3].every(t => t.passed),
      tests: [test1, test2, test3],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
