import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/db';

// Stripe webhook handler for subscription events
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  if (!signature) {
    console.error('[STRIPE WEBHOOK] No signature found');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('[STRIPE WEBHOOK] Signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log('[STRIPE WEBHOOK] Event received:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('[STRIPE WEBHOOK] Checkout completed:', session.id);

        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription as string;
          const customerId = session.customer as string;

          // Get subscription details
          const subscriptionData = await stripe.subscriptions.retrieve(subscriptionId) as any;
          
          // Find user by customer ID
          const existingSubscription = await prisma.subscription.findUnique({
            where: { stripeCustomerId: customerId },
          });

          if (existingSubscription && subscriptionData) {
            // Update subscription
            await prisma.subscription.update({
              where: { id: existingSubscription.id },
              data: {
                stripeSubscriptionId: subscriptionId,
                stripePriceId: subscriptionData.items.data[0]?.price?.id || '',
                status: subscriptionData.status === 'trialing' ? 'TRIAL' : 'ACTIVE',
                plan: subscriptionData.items.data[0]?.price?.id === process.env.STRIPE_PRICE_ANNUAL 
                  ? 'PREMIUM_ANNUAL' 
                  : 'PREMIUM_MONTHLY',
                stripeCurrentPeriodEnd: subscriptionData.current_period_end ? new Date(subscriptionData.current_period_end * 1000) : null,
                trialEndsAt: subscriptionData.trial_end ? new Date(subscriptionData.trial_end * 1000) : null,
                cancelAtPeriodEnd: subscriptionData.cancel_at_period_end || false,
              },
            });

            // Update user premium status
            await prisma.user.update({
              where: { id: existingSubscription.userId },
              data: { isPremium: true },
            });

            console.log('[STRIPE WEBHOOK] Subscription updated for user:', existingSubscription.userId);
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        console.log('[STRIPE WEBHOOK] Subscription updated:', subscription.id);

        const existingSubscription = await prisma.subscription.findUnique({
          where: { stripeCustomerId: subscription.customer as string },
        });

        if (existingSubscription && subscription.current_period_end) {
          const status = subscription.status === 'trialing' ? 'TRIAL' 
            : subscription.status === 'active' ? 'ACTIVE'
            : subscription.status === 'past_due' ? 'PAST_DUE'
            : subscription.status === 'canceled' ? 'CANCELED'
            : subscription.status === 'unpaid' ? 'UNPAID'
            : 'FREE';

          await prisma.subscription.update({
            where: { id: existingSubscription.id },
            data: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items?.data?.[0]?.price?.id || '',
              status,
              plan: subscription.items?.data?.[0]?.price?.id === process.env.STRIPE_PRICE_ANNUAL 
                ? 'PREMIUM_ANNUAL' 
                : 'PREMIUM_MONTHLY',
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
              trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
              cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
            },
          });

          // Update user premium status
          const isPremium = ['TRIAL', 'ACTIVE'].includes(status);
          await prisma.user.update({
            where: { id: existingSubscription.userId },
            data: { isPremium },
          });

          console.log('[STRIPE WEBHOOK] Subscription status updated to:', status);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        console.log('[STRIPE WEBHOOK] Subscription deleted:', subscription.id);

        const existingSubscription = await prisma.subscription.findUnique({
          where: { stripeCustomerId: subscription.customer as string },
        });

        if (existingSubscription) {
          await prisma.subscription.update({
            where: { id: existingSubscription.id },
            data: {
              status: 'CANCELED',
              cancelAtPeriodEnd: false,
            },
          });

          // Update user premium status
          await prisma.user.update({
            where: { id: existingSubscription.userId },
            data: { isPremium: false },
          });

          console.log('[STRIPE WEBHOOK] Subscription canceled for user:', existingSubscription.userId);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        console.log('[STRIPE WEBHOOK] Payment succeeded:', invoice.id);

        if (invoice.subscription) {
          const subscriptionData = await stripe.subscriptions.retrieve(invoice.subscription as string) as any;
          
          const existingSubscription = await prisma.subscription.findUnique({
            where: { stripeCustomerId: invoice.customer as string },
          });

          if (existingSubscription && subscriptionData.current_period_end) {
            await prisma.subscription.update({
              where: { id: existingSubscription.id },
              data: {
                status: 'ACTIVE',
                stripeCurrentPeriodEnd: new Date(subscriptionData.current_period_end * 1000),
              },
            });

            console.log('[STRIPE WEBHOOK] Payment processed successfully');
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        console.log('[STRIPE WEBHOOK] Payment failed:', invoice.id);

        const existingSubscription = await prisma.subscription.findUnique({
          where: { stripeCustomerId: invoice.customer as string },
        });

        if (existingSubscription) {
          await prisma.subscription.update({
            where: { id: existingSubscription.id },
            data: { status: 'PAST_DUE' },
          });

          // Update user premium status
          await prisma.user.update({
            where: { id: existingSubscription.userId },
            data: { isPremium: false },
          });

          console.log('[STRIPE WEBHOOK] Payment failed, subscription marked as past due');
        }
        break;
      }

      default:
        console.log('[STRIPE WEBHOOK] Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[STRIPE WEBHOOK] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', message: error.message },
      { status: 500 }
    );
  }
}
