/**
 * useAtheraFlexPremium Hook
 * Gerencia estado premium e verificações de features do Athera Flex
 * v4.0.10 - Premium Integration
 */

'use client';

import { useState, useEffect } from 'react';

export type AtheraFlexFeature = 
  | 'auto-match' 
  | 'analytics' 
  | 'proactive' 
  | 'notifications' 
  | 'coach-chat' 
  | 'export';

interface PremiumStatus {
  isPremium: boolean;
  status: 'FREE' | 'TRIAL' | 'ACTIVE' | 'CANCELLED' | 'PAST_DUE';
  plan: 'FREE' | 'MONTHLY' | 'YEARLY';
  trialEndsAt?: string;
  subscriptionEndDate?: string;
  loading: boolean;
}

interface UseAtheraFlexPremiumReturn extends PremiumStatus {
  canUseFeature: (feature: AtheraFlexFeature) => boolean;
  showPaywall: (feature: AtheraFlexFeature) => void;
  hidePaywall: () => void;
  paywallFeature: AtheraFlexFeature | null;
  isPaywallOpen: boolean;
  refresh: () => Promise<void>;
}

// Features que são premium-only
const PREMIUM_FEATURES: AtheraFlexFeature[] = [
  'auto-match',
  'analytics',
  'proactive',
  'notifications',
  'coach-chat',
  'export',
];

export function useAtheraFlexPremium(): UseAtheraFlexPremiumReturn {
  const [status, setStatus] = useState<PremiumStatus>({
    isPremium: false,
    status: 'FREE',
    plan: 'FREE',
    loading: true,
  });

  const [paywallFeature, setPaywallFeature] = useState<AtheraFlexFeature | null>(null);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  const fetchPremiumStatus = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      if (!response.ok) {
        throw new Error('Failed to fetch premium status');
      }

      const data = await response.json();
      
      setStatus({
        isPremium: data.status === 'ACTIVE' || data.status === 'TRIAL',
        status: data.status || 'FREE',
        plan: data.plan || 'FREE',
        trialEndsAt: data.trialEndsAt,
        subscriptionEndDate: data.subscriptionEndDate,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching premium status:', error);
      setStatus({
        isPremium: false,
        status: 'FREE',
        plan: 'FREE',
        loading: false,
      });
    }
  };

  useEffect(() => {
    fetchPremiumStatus();
  }, []);

  const canUseFeature = (feature: AtheraFlexFeature): boolean => {
    // Se não é feature premium, todos podem usar
    if (!PREMIUM_FEATURES.includes(feature)) {
      return true;
    }

    // Se é premium ou trial, pode usar
    return status.isPremium;
  };

  const showPaywall = (feature: AtheraFlexFeature) => {
    setPaywallFeature(feature);
    setIsPaywallOpen(true);
  };

  const hidePaywall = () => {
    setIsPaywallOpen(false);
    setTimeout(() => setPaywallFeature(null), 300); // Delay para animação
  };

  const refresh = async () => {
    await fetchPremiumStatus();
  };

  return {
    ...status,
    canUseFeature,
    showPaywall,
    hidePaywall,
    paywallFeature,
    isPaywallOpen,
    refresh,
  };
}
