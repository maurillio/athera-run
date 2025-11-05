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

export default function SubscriptionPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [managingSubscription, setManagingSubscription] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login');
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
      toast.error('Erro ao carregar dados');
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
          toast.error('URL do portal não recebida');
        }
      } else {
        const error = await response.json();
        console.error('Erro da API:', error);
        toast.error(`Erro ao abrir portal: ${error.error || 'Desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao processar:', error);
      toast.error('Erro ao processar solicitação');
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
    ? 'Premium Mensal' 
    : subscription.subscription?.plan === 'PREMIUM_ANNUAL' 
    ? 'Premium Anual' 
    : 'Gratuito';
  const statusBadge = subscription.subscription?.status === 'ACTIVE' 
    ? 'Ativo' 
    : subscription.subscription?.status === 'TRIAL' 
    ? 'Trial' 
    : 'Gratuito';

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20">
        <div className="container max-w-4xl py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Gerenciar Assinatura</h1>
            <p className="text-muted-foreground">Visualize e gerencie sua assinatura</p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      Plano Atual
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
                    onClick={() => router.push('/pricing')}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Assinar Premium
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
          </div>
        </div>
      </main>
    </>
  );
}
