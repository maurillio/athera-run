
import { prisma } from '@/lib/db';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar,
  Target,
  MapPin,
  Clock,
  Activity,
  TrendingUp,
  Award
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const [phases, totalWeeks, currentPhase] = await Promise.all([
    prisma.phase.findMany({
      orderBy: { phaseNumber: 'asc' },
      include: {
        weeks: true,
        nutrition: true
      }
    }),
    prisma.week.count(),
    prisma.phase.findFirst({
      where: { phaseNumber: 1 },
      include: { weeks: { take: 4 } }
    })
  ]);

  return { phases, totalWeeks, currentPhase };
}

export default async function Dashboard() {
  const { phases, totalWeeks, currentPhase } = await getDashboardData();

  const stats = [
    {
      title: "Duração Total",
      value: "40 semanas",
      icon: Calendar,
      description: "10 meses de preparação estruturada"
    },
    {
      title: "Meta de Tempo",
      value: "4:00:00",
      icon: Target,
      description: "Pace médio de 5:41/km"
    },
    {
      title: "Data da Prova",
      value: "30/08/2026",
      icon: MapPin, 
      description: "Primeira maratona completa"
    },
    {
      title: "VDOT Atual",
      value: "37-38",
      icon: TrendingUp,
      description: "Base para cálculo de paces"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <Header />
      
      <main className="container mx-auto max-w-6xl px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-600 via-red-500 to-blue-600 bg-clip-text text-transparent">
              Rumo aos 42km
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Seu plano científico e personalizado de 40 semanas para completar a primeira maratona em 4 horas.
            Uma jornada estruturada com base em evidências e adaptada ao seu perfil de corredor intermediário.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="secondary" className="px-3 py-1">88kg • 1,80m</Badge>
            <Badge variant="secondary" className="px-3 py-1">10k: 5:40-5:50/km</Badge>
            <Badge variant="secondary" className="px-3 py-1">3x corrida + 2x natação</Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-gradient-to-r from-orange-100 to-blue-100 rounded-full">
                      <Icon className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{stat.title}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Progress */}
        <Card className="mb-8 bg-gradient-to-r from-orange-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Progresso da Preparação
            </CardTitle>
            <CardDescription>
              Acompanhe sua evolução através das 5 fases do treinamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Fase 1: Base Aeróbica</span>
                <span>0/10 semanas</span>
              </div>
              <Progress value={0} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Você está pronto para começar! A jornada inicia com a construção de uma base aeróbica sólida.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Phases Overview */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">As 5 Fases do Treinamento</h2>
            <p className="text-muted-foreground">
              Cada fase é cuidadosamente projetada para construir sobre a anterior
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {phases?.map((phase, index) => (
              <Link key={phase.id} href="/training">
                <Card className="h-full hover:shadow-lg transition-all cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        Fase {phase.phaseNumber}
                      </Badge>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg group-hover:text-orange-600 transition-colors">
                      {phase.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {phase.duration} • {phase.weeks?.length || 0} semanas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {phase.description}
                    </p>
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-orange-600">
                        Foco Principal:
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {phase.focus}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/calculator">
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Calculadora VDOT</h3>
                <p className="text-sm text-muted-foreground">
                  Calcule seus paces personalizados baseados no seu VDOT atual
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/nutrition">
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Nutrição por Fase</h3>
                <p className="text-sm text-muted-foreground">
                  Estratégias nutricionais adaptadas para cada fase do treinamento
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/prevention">
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-red-100 rounded-full group-hover:bg-red-200 transition-colors">
                    <Activity className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Prevenção de Lesões</h3>
                <p className="text-sm text-muted-foreground">
                  Exercícios específicos para prevenir canelite e fascite plantar
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
