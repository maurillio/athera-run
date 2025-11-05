'use client';

import { useState, useEffect } from 'react';

interface SubscriptionStatus {
  isPremium: boolean;
  status: string;
  plan: string;
  loading: boolean;
}

export function usePremium() {
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    isPremium: false,
    status: 'FREE',
    plan: 'FREE',
    loading: true,
  });

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      if (response.ok) {
        const data = await response.json();
        setSubscription({
          isPremium: data.isPremium || false,
          status: data.subscription?.status || 'FREE',
          plan: data.subscription?.plan || 'FREE',
          loading: false,
        });
      } else {
        setSubscription(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription(prev => ({ ...prev, loading: false }));
    }
  };

  const checkFeature = (feature: string): boolean => {
    return subscription.isPremium;
  };

  const requirePremium = (feature: string): boolean => {
    if (!subscription.isPremium) {
      return false;
    }
    return true;
  };

  return {
    ...subscription,
    checkFeature,
    requirePremium,
    refetch: fetchSubscriptionStatus,
  };
}
