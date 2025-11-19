'use client';

import { useState, useEffect } from 'react';
import { Crown, X, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface UpgradeBannerProps {
  feature?: string;
  className?: string;
}

export default function UpgradeBanner({ feature, className = '' }: UpgradeBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    // Check if user dismissed banner
    const isDismissed = localStorage.getItem('upgrade-banner-dismissed');
    if (isDismissed) {
      setDismissed(true);
    }

    // Check subscription status
    fetch('/api/subscription/status')
      .then(res => res.json())
      .then(data => setSubscription(data))
      .catch(console.error);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('upgrade-banner-dismissed', 'true');
    // Auto-remove after 7 days
    setTimeout(() => {
      localStorage.removeItem('upgrade-banner-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  // Don't show if dismissed or if user is premium
  if (dismissed || !subscription || subscription.status !== 'FREE') {
    return null;
  }

  return (
    <Card className={`relative overflow-hidden border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 ${className}`}>
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-slate-900/5 transition-colors"
      >
        <X className="w-4 h-4 text-slate-600" />
      </button>

      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-elevation-2">
              <Crown className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
              Desbloqueie Todo o Potencial do Athera Run
              <Sparkles className="w-4 h-4 text-brand-primary" />
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              {feature 
                ? `Para acessar ${feature}, faça upgrade para Premium e tenha:`
                : 'Faça upgrade para Premium e tenha acesso a:'
              }
            </p>

            <ul className="space-y-2 mb-4 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                Integração completa com Strava
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                Auto-ajuste inteligente de treinos
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
                Chat ilimitado com IA especializada
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
                Analytics avançados e insights personalizados
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
                Múltiplas metas de corrida simultâneas
              </li>
            </ul>

            <Button 
              onClick={() => window.location.href = '/pricing'}
              className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white"
            >
              <Crown className="w-4 h-4 mr-2" />
              Ver Planos Premium
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
