'use client';

import { Crown, X, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslations } from '@/lib/i18n/hooks';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  description?: string;
}

export default function PaywallModal({ isOpen, onClose, feature, description }: PaywallModalProps) {
  const t = useTranslations('paywall');
  
  const benefits = [
    t('benefits.strava'),
    t('benefits.autoAdjust'),
    t('benefits.aiChat'),
    t('benefits.analytics'),
    t('benefits.multipleGoals'),
    t('benefits.priority'),
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center mb-4">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-center text-2xl">
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{feature}</strong> {t('description')}
            </p>
            {description && (
              <p className="text-sm text-muted-foreground mt-2">
                {description}
              </p>
            )}
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-semibold mb-3">{t('withPremium')}</p>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <Button 
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700"
              onClick={() => window.location.href = '/pricing'}
            >
              <Crown className="w-4 h-4 mr-2" />
              {t('viewPlans')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={onClose}
            >
              {t('maybeLater')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
