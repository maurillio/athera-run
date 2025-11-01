'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Calendar, CreditCard, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SubscriptionData {
  isPremium: boolean;
  subscription?: {
    status: string;
    plan: string;
    stripeCurrentPeriodEnd: string | null;
    trialEndsAt: string | null;
    cancelAtPeriodEnd: boolean;
  };
}

export default function SubscriptionStatusCard() {
  const [loading, setLoading] = useState(true);
  const [managingSubscription, setManagingSubscription] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setManagingSubscription(true);
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        toast.error('Erro ao abrir portal de gerenciamento');
      }
    } catch (error) {
      toast.error('Erro ao processar solicitação');
    } finally {
      setManagingSubscription(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) return null;

  const isFree = !subscription.isPremium;
  const isActive = subscription.subscription?.status === 'ACTIVE';
  const isTrial = subscription.subscription?.status === 'TRIAL';
  const isCanceled = subscription.subscription?.cancelAtPeriodEnd || false;

  const getStatusBadge = () => {
    if (isFree) return <Badge variant="secondary">Gratuito</Badge>;
    if (isCanceled) return <Badge variant="destructive">Cancelado</Badge>;
    if (isTrial) return <Badge className="bg-blue-500">Trial</Badge>;
    if (isActive) return <Badge className="bg-green-500">Ativo</Badge>;
    return <Badge variant="secondary">{subscription.subscription?.status || 'FREE'}</Badge>;
  };

  const getPlanName = () => {
    if (subscription.subscription?.plan === 'PREMIUM_MONTHLY') return 'Premium Mensal';
    if (subscription.subscription?.plan === 'PREMIUM_ANNUAL') return 'Premium Anual';
    return 'Gratuito';
  };

  const getNextBillingDate = () => {
    if (isTrial && subscription.subscription?.trialEndsAt) {
      return new Date(subscription.subscription.trialEndsAt);
    }
    if (subscription.subscription?.stripeCurrentPeriodEnd) {
      return new Date(subscription.subscription.stripeCurrentPeriodEnd);
    }
    return null;
  };

  const nextBilling = getNextBillingDate();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Assinatura
            </CardTitle>
            <CardDescription className="mt-2">
              {getPlanName()}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCanceled && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sua assinatura será cancelada em{' '}
              {nextBilling && format(nextBilling, "dd 'de' MMMM", { locale: ptBR })}
            </AlertDescription>
          </Alert>
        )}

        {isTrial && subscription.subscription?.trialEndsAt && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Seu período de teste termina em{' '}
              {format(new Date(subscription.subscription.trialEndsAt), "dd 'de' MMMM", { locale: ptBR })}
            </AlertDescription>
          </Alert>
        )}

        {!isFree && nextBilling && !isCanceled && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {isTrial ? 'Fim do trial: ' : 'Próxima cobrança: '}
              {format(nextBilling, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
        )}

        {isFree ? (
          <Button 
            className="w-full" 
            onClick={() => window.location.href = '/pricing'}
          >
            <Crown className="w-4 h-4 mr-2" />
            Assinar Premium
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleManageSubscription}
            disabled={managingSubscription}
          >
            {managingSubscription ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Abrindo...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Gerenciar Assinatura
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
