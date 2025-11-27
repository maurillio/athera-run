'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLocale } from '@/lib/i18n/hooks';
import Link from 'next/link';
import { Activity, Target, TrendingUp, Award, Calendar, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Logo from '@/components/ui/logo';

export default function LocaleHome() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const locale = useLocale();

  useEffect(() => {
    if (status === 'loading') return;
    if (session) {
      router.push(`/${locale}/dashboard`);
    }
  }, [router, locale, session, status]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (session) return null;

  const features = [
    {
      icon: Target,
      title: 'Planos Personalizados',
      description: 'Treinos adaptados ao seu nível, objetivo e disponibilidade.',
    },
    {
      icon: TrendingUp,
      title: 'Progressão Científica',
      description: 'Periodização baseada em ciência esportiva e fisiologia.',
    },
    {
      icon: Calendar,
      title: 'Flexibilidade Total',
      description: 'Ajuste seu calendário e o plano se adapta automaticamente.',
    },
    {
      icon: Award,
      title: 'Conquiste Seus Objetivos',
      description: 'Da sua primeira corrida até a maratona dos sonhos.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-elevation-1">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex h-24 items-center justify-between">
            <Logo size="xl" variant="complete" />
            <div className="flex gap-3">
              <Link href={`/${locale}/login`}>
                <Button variant="ghost" size="default">
                  Entrar
                </Button>
              </Link>
              <Link href={`/${locale}/signup`}>
                <Button size="default" className="shadow-md">
                  Começar Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto max-w-6xl px-4 py-20 md:py-32">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-brand-primary text-sm font-semibold px-4 py-2 rounded-full">
            <Zap className="h-4 w-4" />
            Para todos os níveis de corredores
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-brand-primary via-orange-600 to-blue-600 bg-clip-text text-transparent">
              Seu Treinador
            </span>
            <br />
            <span className="text-slate-900">de Corrida Personalizado</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Planos de treinamento científicos e personalizados para 10km, meia-maratona e maratona.
            Alcance seus objetivos com segurança e eficiência.
          </p>
          
          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href={`/${locale}/signup`}>
              <Button size="lg" className="text-lg px-8 h-14 shadow-lg hover:shadow-xl">
                <Activity className="mr-2 h-5 w-5" />
                Criar Meu Plano Grátis
              </Button>
            </Link>
            <Link href={`/${locale}/login`}>
              <Button variant="outline" size="lg" className="text-lg px-8 h-14">
                Já tenho conta
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-6 pt-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600" />
              <span>Baseado em ciência</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-brand-primary" />
              <span>100% personalizado</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <span>Resultados comprovados</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto max-w-6xl px-4 py-20 bg-white/50">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Por que escolher o Athera Run?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A plataforma completa para transformar seus treinos e alcançar resultados extraordinários.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="group hover:shadow-elevation-3 hover:-translate-y-1 transition-all duration-200 border-slate-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-brand-primary/10 to-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6 text-brand-primary" strokeWidth={2} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-slate-900">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto max-w-4xl px-4 py-20">
        <Card className="bg-gradient-to-br from-brand-primary to-orange-600 border-0 shadow-elevation-4">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Pronto para começar sua jornada?
            </h2>
            <p className="text-xl text-orange-50 max-w-2xl mx-auto">
              Crie seu primeiro plano de treino personalizado em menos de 5 minutos.
            </p>
            <Link href={`/${locale}/signup`}>
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 h-14 bg-white text-brand-primary hover:bg-slate-50 shadow-lg"
              >
                Começar Agora - É Grátis
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Logo size="sm" variant="icon" />
            <p className="text-sm text-slate-500">
              &copy; 2025 Athera Run. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm text-slate-600">
              <Link href={`/${locale}/privacy-policy`} className="hover:text-brand-primary">
                Privacidade
              </Link>
              <Link href={`/${locale}/terms-of-service`} className="hover:text-brand-primary">
                Termos
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
