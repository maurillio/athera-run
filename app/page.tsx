
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Logo from '@/components/ui/logo';
import {
  Target,
  TrendingUp,
  Clock,
  Users,
  CheckCircle2,
  Zap,
  Heart,
  Award,
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex h-24 items-center justify-between">
            <Logo size="lg" showText />
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700">
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
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 text-sm px-4 py-1">
            Para todos os níveis de corredores
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-orange-600 via-red-500 to-blue-600 bg-clip-text text-transparent">
              Seu Treinador
            </span>
            <br />
            <span className="text-gray-900">de Corrida Personalizado</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Planos de treinamento científicos e personalizados para 10km, meia-maratona e maratona. 
            Alcance seus objetivos com a orientação de um treinador virtual inteligente.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700 text-lg px-8 py-6">
                Criar Meu Plano Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              Não precisa cartão de crédito • Comece hoje
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto max-w-6xl px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tudo que você precisa para atingir seu objetivo
          </h2>
          <p className="text-xl text-muted-foreground">
            Recursos profissionais para corredores de todos os níveis
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-orange-300 transition-colors">
            <CardHeader>
              <Target className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>Plano Personalizado</CardTitle>
              <CardDescription>
                Plano de treinamento adaptado ao seu nível, objetivo e data da prova
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-300 transition-colors">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Análise com IA</CardTitle>
              <CardDescription>
                Análises inteligentes do seu progresso e recomendações personalizadas
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-green-300 transition-colors">
            <CardHeader>
              <Zap className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Integração Strava</CardTitle>
              <CardDescription>
                Sincronização automática dos seus treinos do Strava
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-purple-300 transition-colors">
            <CardHeader>
              <Clock className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Calculadora VDOT</CardTitle>
              <CardDescription>
                Calcule seus paces ideais baseado no método científico de Jack Daniels
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-red-300 transition-colors">
            <CardHeader>
              <Heart className="h-12 w-12 text-red-600 mb-4" />
              <CardTitle>Prevenção de Lesões</CardTitle>
              <CardDescription>
                Exercícios e orientações para treinar com segurança
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-yellow-300 transition-colors">
            <CardHeader>
              <Award className="h-12 w-12 text-yellow-600 mb-4" />
              <CardTitle>Guia Nutricional</CardTitle>
              <CardDescription>
                Orientações nutricionais para cada fase do seu treinamento
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-r from-orange-50 to-blue-50 py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-muted-foreground">
              Em 3 passos simples, comece seu treinamento
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-600 to-orange-500 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                1
              </div>
              <h3 className="text-xl font-bold">Crie sua Conta</h3>
              <p className="text-muted-foreground">
                Cadastre-se gratuitamente e conte-nos sobre seus objetivos
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                2
              </div>
              <h3 className="text-xl font-bold">Receba seu Plano</h3>
              <p className="text-muted-foreground">
                Geramos um plano de treinamento personalizado baseado no seu perfil
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-600 to-green-500 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                3
              </div>
              <h3 className="text-xl font-bold">Alcance seu Objetivo</h3>
              <p className="text-muted-foreground">
                Siga seu plano, registre seus treinos e acompanhe seu progresso
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto max-w-6xl px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Planos Simples e Transparentes
          </h2>
          <p className="text-xl text-muted-foreground">
            Comece grátis e faça upgrade quando quiser
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Plano Gratuito</CardTitle>
              <CardDescription>Perfeito para começar</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">R$ 0</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <p>Plano de treinamento básico</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <p>Calculadora VDOT</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <p>Registro manual de treinos</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <p>Guias de nutrição e prevenção</p>
              </div>
              <Link href="/signup" className="block">
                <Button className="w-full" variant="outline">
                  Começar Grátis
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-4 border-orange-600 relative">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-600 to-red-600">
              Mais Popular
            </Badge>
            <CardHeader>
              <CardTitle className="text-2xl">Plano Premium</CardTitle>
              <CardDescription>Para corredores sérios</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">R$ 34,90</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <p><strong>Tudo do plano gratuito</strong></p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <p>Plano 100% personalizado</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <p>Integração com Strava</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <p>Análises com IA ilimitadas</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <p>Ajuste automático do plano</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <p>Suporte prioritário</p>
              </div>
              <Link href="/signup" className="block">
                <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                  Começar Teste Grátis
                </Button>
              </Link>
              <p className="text-xs text-center text-muted-foreground">
                7 dias grátis • Cancele quando quiser
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-gradient-to-r from-orange-600 to-blue-600 py-20">
        <div className="container mx-auto max-w-4xl px-4 text-center text-white space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Pronto para Alcançar seus Objetivos?
          </h2>
          <p className="text-xl opacity-90">
            Junte-se a milhares de corredores que já estão treinando de forma inteligente
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-6">
              Criar Minha Conta Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-4 text-center text-muted-foreground">
            <Logo size="sm" showText />
            <p>&copy; 2025 Athera Run. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
