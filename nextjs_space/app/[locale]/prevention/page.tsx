
'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocale, useTranslations } from '@/lib/i18n/hooks';
import { 
  Shield,
  Activity,
  Clock,
  Repeat,
  AlertTriangle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

type Exercise = {
  id: string;
  name: string;
  category: string;
  description: string;
  duration: string;
  frequency: string;
  instructions: string;
  benefits: string;
};

// Dados fallback caso a API não responda
const fallbackData: Record<string, Exercise[]> = {
  canelite: [
    {
      id: '1',
      name: 'Elevação dos Dedos',
      category: 'canelite',
      description: 'Fortalecimento do tibial anterior',
      duration: '3x15 repetições',
      frequency: 'Diariamente',
      instructions: 'Sentado, pés apoiados no chão, eleve apenas os dedos dos pés mantendo o calcanhar no chão.',
      benefits: 'Fortalece o tibial anterior, músculo que sofre com canelite.'
    }
  ],
  fascite_plantar: [
    {
      id: '2',
      name: 'Automassagem com Bola',
      category: 'fascite_plantar',
      description: 'Liberação miofascial da planta do pé',
      duration: '2 minutos por pé',
      frequency: 'Diariamente (manhã e noite)',
      instructions: 'Com uma bola de tênis ou específica, role sob o pé aplicando pressão moderada.',
      benefits: 'Libera tensões na fáscia plantar e previne inflamações.'
    }
  ],
  core: [
    {
      id: '3',
      name: 'Prancha',
      category: 'core',
      description: 'Fortalecimento do core',
      duration: '3x 30-60 segundos',
      frequency: '3x por semana',
      instructions: 'Posição de prancha com cotovelos apoiados, corpo reto da cabeça aos pés.',
      benefits: 'Fortalece toda a musculatura do core, melhorando estabilidade na corrida.'
    }
  ],
  mobilidade: [
    {
      id: '4',
      name: 'Alongamento de Panturrilha',
      category: 'mobilidade',
      description: 'Aumento da flexibilidade',
      duration: '3x 30 segundos por perna',
      frequency: 'Após cada treino',
      instructions: 'Contra uma parede, estenda uma perna para trás mantendo o calcanhar no chão.',
      benefits: 'Aumenta flexibilidade da panturrilha, prevenindo canelite e fascite.'
    }
  ]
};

async function getPreventionData() {
  try {
    const response = await fetch('/api/prevention/exercises', { cache: 'no-store' });
    if (!response.ok) return fallbackData;
    const data = await response.json();
    return Object.keys(data).length > 0 ? data : fallbackData;
  } catch (error) {
    console.error('Failed to fetch prevention data, using fallback:', error);
    return fallbackData;
  }
}

const categoryInfo = {
  canelite: {
    name: "Prevenção de Canelite",
    description: "Síndrome do Estresse Tibial Medial - fortalecimento específico",
    color: "border-red-200 bg-red-50",
    icon: Shield
  },
  fascite_plantar: {
    name: "Prevenção de Fascite Plantar", 
    description: "Fortalecimento do pé e liberação da fáscia plantar",
    color: "border-blue-200 bg-blue-50",
    icon: Activity
  },
  core: {
    name: "Fortalecimento do Core",
    description: "Estabilidade central para melhor mecânica de corrida", 
    color: "border-green-200 bg-green-50",
    icon: CheckCircle
  },
  mobilidade: {
    name: "Mobilidade e Flexibilidade",
    description: "Manutenção da amplitude de movimento articular",
    color: "border-purple-200 bg-purple-50", 
    icon: Repeat
  }
};

const preventionTips = [
  {
    title: "Regra dos 10%",
    description: "Não aumente o volume semanal em mais de 10% por semana",
    icon: TrendingUp
  },
  {
    title: "Semanas de Recuperação", 
    description: "A cada 3-4 semanas, reduza o volume em 20-30%",
    icon: Clock
  },
  {
    title: "Ouça Seu Corpo",
    description: "Dor que altera sua forma de correr é sinal para parar",
    icon: AlertTriangle
  },
  {
    title: "Calçados Adequados",
    description: "Substitua tênis a cada 500-800km de uso",
    icon: CheckCircle
  }
];

export default function PreventionPage() {
  const [groupedExercises, setGroupedExercises] = useState<Record<string, Exercise[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('canelite');

  useEffect(() => {
    getPreventionData()
      .then(data => {
        setGroupedExercises(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading prevention data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando exercícios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <Header />
      
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
              Prevenção de Lesões
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Protocolo específico para prevenir recidiva de canelite e fascite plantar.
            Exercícios baseados em evidências para corredores de maratona.
          </p>
        </div>

        {/* Prevention Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {preventionTips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <Card key={index} className="text-center">
                <CardContent className="p-4">
                  <div className="flex justify-center mb-3">
                    <div className="p-2 bg-red-100 rounded-full">
                      <Icon className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{tip.title}</h3>
                  <p className="text-xs text-muted-foreground">{tip.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Exercise Categories */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            {Object.entries(categoryInfo).map(([key, info]) => {
              // Extract meaningful short names from full names
              const shortNames: Record<string, string> = {
                canelite: "Canelite",
                fascite_plantar: "Fascite",
                core: "Core",
                mobilidade: "Mobilidade"
              };
              return (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className="text-xs sm:text-sm"
                  aria-label={`Visualizar exercícios de ${info.name}`}
                >
                  {shortNames[key] || info.name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(groupedExercises).map(([category, exercises]) => {
            const categoryData = categoryInfo[category as keyof typeof categoryInfo];
            if (!categoryData) return null;

            const Icon = categoryData.icon;

            return (
              <TabsContent key={category} value={category}>
                <Card className={`mb-6 ${categoryData.color}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {categoryData.name}
                    </CardTitle>
                    <CardDescription>{categoryData.description}</CardDescription>
                  </CardHeader>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {exercises?.map((exercise) => (
                    <Card key={exercise.id} className="h-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{exercise.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {exercise.frequency}
                          </Badge>
                        </div>
                        <CardDescription>{exercise.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Duração/Repetições
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {exercise.duration}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Como Fazer
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {exercise.instructions}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Benefícios
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {exercise.benefits}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Daily Routine */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5" />
              Rotina Diária (5-10 minutos)
            </CardTitle>
            <CardDescription>
              Protocolo mínimo diário para manutenção e prevenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Manhã (3 min)</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Círculos com tornozelo (1 min)</li>
                  <li>• Automassagem com bola (2 min)</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Pré-Treino (2 min)</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Ativação de glúteos</li>
                  <li>• Elevação dos dedos</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Pós-Treino (5 min)</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Alongamento panturrilha (2 min)</li>
                  <li>• Alongamento fáscia (2 min)</li>
                  <li>• Core básico (1 min)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
