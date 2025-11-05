
import { prisma } from '@/lib/db';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLocale, useTranslations } from '@/lib/i18n/hooks';
import { 
  Activity,
  AlertTriangle,
  Brain,
  Heart,
  TrendingDown,
  Shield
} from 'lucide-react';

export const dynamic = "force-dynamic";

async function getOvertrainingData() {
  const signs = await prisma.overtrainingSign.findMany({
    orderBy: { category: 'asc' }
  });

  const groupedSigns = signs.reduce((acc, sign) => {
    if (!acc[sign.category]) {
      acc[sign.category] = [];
    }
    acc[sign.category].push(sign);
    return acc;
  }, {} as Record<string, typeof signs>);

  return groupedSigns;
}

const categoryInfo = {
  physical: {
    name: "Sinais Físicos",
    description: "Manifestações corporais do overtraining",
    color: "border-red-200 bg-red-50",
    icon: Heart
  },
  performance: {
    name: "Performance",
    description: "Impactos no desempenho durante os treinos",
    color: "border-orange-200 bg-orange-50", 
    icon: TrendingDown
  },
  psychological: {
    name: "Psicológicos",
    description: "Mudanças no estado mental e motivação",
    color: "border-blue-200 bg-blue-50",
    icon: Brain
  }
};

const severityColors = {
  mild: "bg-yellow-100 text-yellow-800",
  moderate: "bg-orange-100 text-orange-800", 
  severe: "bg-red-100 text-red-800"
};

const recoveryStrategies = [
  {
    title: "Reduza o Volume",
    description: "Diminua 20-30% da quilometragem semanal por 7-10 dias",
    icon: TrendingDown
  },
  {
    title: "Priorize o Sono",
    description: "8-9 horas por noite, cochilo se possível",
    icon: Shield
  },
  {
    title: "Nutrição Adequada",
    description: "Garanta ingestão calórica suficiente e hidratação",
    icon: Heart
  },
  {
    title: "Atividades Relaxantes",
    description: "Yoga, meditação, massagem ou hobbies prazerosos",
    icon: Brain
  }
];

export default async function OvertrainingPage() {
  const groupedSigns = await getOvertrainingData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <Header />
      
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Sinais de Overtraining
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Reconheça os sinais precoces de overtraining e aprenda estratégias de recuperação.
            A prevenção é sempre melhor que o tratamento.
          </p>
        </div>

        {/* Alert Box */}
        <Alert className="mb-8 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Importante</AlertTitle>
          <AlertDescription className="text-amber-700">
            Se você identificar múltiplos sinais, especialmente de severidade moderada a severa,
            considere uma pausa no treinamento e consulte um profissional de saúde esportiva.
          </AlertDescription>
        </Alert>

        {/* Recovery Strategies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Estratégias de Recuperação
            </CardTitle>
            <CardDescription>
              Ações imediatas para reverter sinais de overtraining
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recoveryStrategies.map((strategy, index) => {
                const Icon = strategy.icon;
                return (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <div className="flex justify-center mb-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Icon className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm mb-2">{strategy.title}</h3>
                    <p className="text-xs text-muted-foreground">{strategy.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Signs by Category */}
        <div className="space-y-8">
          {Object.entries(groupedSigns).map(([category, signs]) => {
            const categoryData = categoryInfo[category as keyof typeof categoryInfo];
            if (!categoryData) return null;

            const Icon = categoryData.icon;

            return (
              <div key={category}>
                <Card className={`mb-4 ${categoryData.color}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {categoryData.name}
                    </CardTitle>
                    <CardDescription>{categoryData.description}</CardDescription>
                  </CardHeader>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {signs?.map((sign) => (
                    <Card key={sign.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{sign.sign}</CardTitle>
                          <Badge className={severityColors[sign.severity as keyof typeof severityColors]}>
                            {sign.severity}
                          </Badge>
                        </div>
                        <CardDescription>{sign.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Ação Recomendada
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {sign.action}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Prevention Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Prevenção do Overtraining
            </CardTitle>
            <CardDescription>
              Estratégias para evitar o overtraining durante sua preparação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">Monitoramento Diário</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Frequência cardíaca de repouso (manhã)</li>
                  <li>• Qualidade do sono (1-10)</li>
                  <li>• Motivação para treinar (1-10)</li>
                  <li>• Fadiga geral (1-10)</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Princípios de Recuperação</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Seguir semanas de descarga (cada 3-4 semanas)</li>
                  <li>• Dormir 7-9 horas consistentemente</li>
                  <li>• Nutrição adequada às demandas de treino</li>
                  <li>• Atividades de recuperação ativa (natação)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
