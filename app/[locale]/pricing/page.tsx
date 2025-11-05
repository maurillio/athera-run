'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Zap, Crown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useLocale, useTranslations } from '@/lib/i18n/hooks';

function PricingContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('pricing');
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('🎉 Assinatura ativada com sucesso! Bem-vindo ao Premium!', {
        duration: 5000,
      });
      // Limpar URL
      window.history.replaceState({}, '', '/pricing');
    }
    if (searchParams.get('canceled') === 'true') {
      toast.info('Checkout cancelado. Você pode tentar novamente quando quiser!');
      window.history.replaceState({}, '', '/pricing');
    }
  }, [searchParams]);

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!session) {
      toast.error('Você precisa fazer login primeiro');
      router.push('/login?callbackUrl=/pricing');
      return;
    }

    setLoading(planName);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar sessão');
      }

      window.location.href = data.url;
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Escolha o plano ideal
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comece grátis e faça upgrade quando quiser
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* FREE */}
          <Card className="p-6">
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <p className="text-muted-foreground mb-4">Comece sua jornada</p>
            <div className="text-4xl font-bold mb-6">R$ 0</div>
            <Button variant="outline" className="w-full mb-6" onClick={() => router.push('/signup')}>
              Começar Grátis
            </Button>
            <div className="space-y-3">
              {['Plano personalizado com IA', 'Visualização completa', 'Lançamento manual', 'Dashboard básico', 'Calculadora VDOT'].map((f, i) => (
                <div key={i} className="flex gap-2"><Check className="h-5 w-5 text-green-600" /><span className="text-sm">{f}</span></div>
              ))}
            </div>
          </Card>

          {/* PREMIUM MENSAL */}
          <Card className="p-6 border-2 border-primary shadow-lg relative">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2"><Zap className="h-3 w-3 mr-1" />Recomendado</Badge>
            <h3 className="text-2xl font-bold mb-2 flex gap-2"><Crown className="h-6 w-6 text-primary" />Premium Mensal</h3>
            <p className="text-muted-foreground mb-4">Máximo desempenho</p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold">R$ 29,90</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
            <p className="text-sm text-primary font-semibold mb-6">🎁 7 dias grátis</p>
            <Button className="w-full mb-6" onClick={() => handleSubscribe('price_1SOfU1Rpe0rXdwl5Ds0rnnfo', 'MONTHLY')} disabled={loading === 'MONTHLY'}>
              {loading === 'MONTHLY' ? 'Processando...' : 'Começar Trial'}
            </Button>
            <div className="space-y-3">
              <p className="font-semibold text-sm">Tudo do Free, mais:</p>
              {['Integração Strava', 'Ajustes automáticos IA', 'Chat ilimitado', 'Análise avançada', 'Notificações', 'Múltiplas provas', 'Relatórios semanais'].map((f, i) => (
                <div key={i} className="flex gap-2"><Check className="h-5 w-5 text-primary" /><span className="text-sm">{f}</span></div>
              ))}
            </div>
          </Card>

          {/* PREMIUM ANUAL */}
          <Card className="p-6 border-2 border-yellow-500 relative">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black">55% OFF</Badge>
            <h3 className="text-2xl font-bold mb-2 flex gap-2"><Crown className="h-6 w-6 text-yellow-500" />Premium Anual</h3>
            <p className="text-muted-foreground mb-4">Melhor custo-benefício</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-bold">R$ 159,90</span>
              <span className="text-muted-foreground">/ano</span>
            </div>
            <p className="text-sm text-yellow-600 font-semibold mb-2">Economize R$ 198,90/ano</p>
            <p className="text-sm text-primary font-semibold mb-6">🎁 7 dias grátis</p>
            <Button className="w-full mb-6 bg-yellow-500 hover:bg-yellow-600 text-black" onClick={() => handleSubscribe('price_1SOfUVRpe0rXdwl5uOnZa3Wc', 'ANNUAL')} disabled={loading === 'ANNUAL'}>
              {loading === 'ANNUAL' ? 'Processando...' : 'Começar Trial'}
            </Button>
            <div className="space-y-3">
              <p className="font-semibold text-sm">Tudo do Free, mais:</p>
              {['Integração Strava', 'Ajustes automáticos IA', 'Chat ilimitado', 'Análise avançada', 'Notificações', 'Múltiplas provas', 'Relatórios semanais', 'R$ 13,32/mês'].map((f, i) => (
                <div key={i} className="flex gap-2"><Check className="h-5 w-5 text-yellow-600" /><span className="text-sm">{f}</span></div>
              ))}
            </div>
          </Card>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Perguntas Frequentes</h2>
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold mb-2">Como funciona o trial?</h3>
              <p className="text-muted-foreground">7 dias grátis com acesso completo. Cancele antes e não pague nada.</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold mb-2">Posso cancelar quando quiser?</h3>
              <p className="text-muted-foreground">Sim! Seu acesso continua até o fim do período pago.</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold mb-2">Qual a diferença mensal vs anual?</h3>
              <p className="text-muted-foreground">55% de desconto no anual (R$ 159,90/ano vs R$ 358,80/ano).</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}
