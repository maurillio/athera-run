'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Crown, CreditCard, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useLocale, useTranslations } from '@/lib/i18n/hooks';

export default function SubscriptionPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('subscription');
  const [loading, setLoading] = useState(true);
  const [managingSubscription, setManagingSubscription] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push(`/${locale}/login`);
      return;
    }
    if (sessionStatus === 'authenticated') {
      fetchSubscriptionStatus();
    }
  }, [sessionStatus, router]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error(t('loadingError'));
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setManagingSubscription(true);
    try {
      console.log('Tentando abrir portal do Stripe...');
      const response = await fetch('/api/stripe/create-portal-session', { method: 'POST' });
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Portal URL:', data.url);
        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error(t('portalUrlError'));
        }
      } else {
        const error = await response.json();
        console.error('Erro da API:', error);
        toast.error(t('portalOpenError', { error: error.error || 'Desconhecido' }));
      }
    } catch (error) {
      console.error('Erro ao processar:', error);
      toast.error(t('requestError'));
    } finally {
      setManagingSubscription(false);
    }
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20">
          <div className="container max-w-4xl py-8">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!subscription) return null;

  const isFree = !subscription.isPremium;
  const isPremium = subscription.isPremium;
  const planName = subscription.subscription?.plan === 'PREMIUM_MONTHLY'
    ? t('planMonthly')
    : subscription.subscription?.plan === 'PREMIUM_ANNUAL'
    ? t('planAnnual')
    : t('planFree');
  const statusBadge = subscription.subscription?.status === 'ACTIVE'
    ? t('statusActive')
    : subscription.subscription?.status === 'TRIAL'
    ? t('statusTrial')
    : t('statusFree');

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20">
        <div className="container max-w-4xl py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      {t('currentPlan')}
                    </CardTitle>
                    <CardDescription className="mt-2">{planName}</CardDescription>
                  </div>
                  <Badge className={isPremium ? "bg-green-500" : ""}>{statusBadge}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {isFree ? (
                  <Button
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-600"
                    onClick={() => router.push(`/${locale}/pricing`)}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {t('subscribePremium')}
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleManageSubscription}
                    disabled={managingSubscription}
                  >
                    {managingSubscription ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('opening')}
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        {t('manageSubscription')}
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
