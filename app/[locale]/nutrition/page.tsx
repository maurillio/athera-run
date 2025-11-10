
'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Header from '@/components/header';
import MacroCalculator from '@/components/macro-calculator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocale, useTranslations } from '@/lib/i18n/hooks';
import { 
  Apple,
  Droplets,
  Clock,
  Target,
  AlertTriangle,
  Zap
} from 'lucide-react';

type Phase = {
  id: string;
  name: string;
  phaseNumber: number;
  duration: string;
  description: string;
  nutrition: {
    id: string;
    carbohydrates: string;
    protein: string;
    fats: string;
    calories: string;
    hydration: string;
    timing?: string | null;
    supplements?: string | null;
    special_notes?: string | null;
  } | null;
};

// Dados fallback caso a API não responda
const fallbackPhases: Phase[] = [
  {
    id: '1',
    name: 'BASE AERÓBICA',
    phaseNumber: 1,
    duration: 'Semanas 1-9',
    description: 'Construção de base aeróbica',
    nutrition: {
      id: '1',
      carbohydrates: '5-7g/kg/dia',
      protein: '1.6-1.8g/kg/dia',
      fats: '20-25% das calorias',
      calories: '2800-3200 kcal/dia',
      hydration: '2-3L/dia + reposição nos treinos',
      timing: 'Carboidratos distribuídos ao longo do dia',
      supplements: 'Multivitamínico, Whey Protein',
      special_notes: 'Foco em alimentos integrais e naturais'
    }
  },
  {
    id: '2',
    name: 'DESENVOLVIMENTO',
    phaseNumber: 2,
    duration: 'Semanas 10-18',
    description: 'Aumento de volume e intensidade',
    nutrition: {
      id: '2',
      carbohydrates: '6-8g/kg/dia',
      protein: '1.8-2.0g/kg/dia',
      fats: '20-25% das calorias',
      calories: '3000-3400 kcal/dia',
      hydration: '2.5-3.5L/dia + eletrólitos',
      timing: 'Carboidratos pré e pós-treino',
      supplements: 'Whey, Creatina, Eletrólitos',
      special_notes: 'Aumentar carboidratos em dias de treinos longos'
    }
  },
  {
    id: '3',
    name: 'INTENSIFICAÇÃO',
    phaseNumber: 3,
    duration: 'Semanas 19-26',
    description: 'Treinos de alta intensidade',
    nutrition: {
      id: '3',
      carbohydrates: '7-9g/kg/dia',
      protein: '2.0g/kg/dia',
      fats: '20% das calorias',
      calories: '3200-3600 kcal/dia',
      hydration: '3-4L/dia + eletrólitos',
      timing: 'Janela anabólica respeitada',
      supplements: 'Whey, Creatina, Cafeína, Eletrólitos',
      special_notes: 'Manter energia alta para treinos intensos'
    }
  },
  {
    id: '4',
    name: 'PICO',
    phaseNumber: 4,
    duration: 'Semanas 27-38',
    description: 'Volume máximo de treinamento',
    nutrition: {
      id: '4',
      carbohydrates: '8-10g/kg/dia',
      protein: '2.0g/kg/dia',
      fats: '15-20% das calorias',
      calories: '3400-4000 kcal/dia',
      hydration: '3.5-4.5L/dia',
      timing: 'Refeições frequentes, carboidratos constantes',
      supplements: 'Completo: Whey, Creatina, Cafeína, Eletrólitos, Géis',
      special_notes: 'Fase crítica - nutrição deve ser impecável'
    }
  },
  {
    id: '5',
    name: 'TAPER/POLIMENTO',
    phaseNumber: 5,
    duration: 'Semanas 39-45',
    description: 'Redução de volume, manutenção de intensidade',
    nutrition: {
      id: '5',
      carbohydrates: '7-9g/kg/dia (aumentar última semana)',
      protein: '1.8g/kg/dia',
      fats: '20-25% das calorias',
      calories: '3000-3400 kcal/dia',
      hydration: '3-4L/dia',
      timing: 'Carb loading 3-4 dias antes da prova',
      supplements: 'Manter rotina, adicionar cafeína na prova',
      special_notes: 'Última semana: carb loading de 8-12g/kg/dia'
    }
  }
];

async function getNutritionData(): Promise<Phase[]> {
  try {
    const response = await fetch('/api/nutrition/phases', { cache: 'no-store' });
    if (!response.ok) return fallbackPhases;
    const data = await response.json();
    return data.length > 0 ? data : fallbackPhases;
  } catch (error) {
    console.error('Failed to fetch nutrition data, using fallback:', error);
    return fallbackPhases;
  }
}

// Dados adicionais de nutrição baseados na pesquisa
const nutritionExtras = {
  carbLoading: {
    title: "Protocolo de Carb Loading",
    description: "Estratégia para maximizar estoques de glicogênio antes da prova",
    content: [
      "Iniciar 2-4 dias antes da maratona",
      "Consumir 8-12 g/kg/dia de carboidratos (704-1056g para 88kg)",
      "Reduzir gorduras e fibras para facilitar digestão", 
      "Fracionar em 4-6 refeições menores ao longo do dia",
      "Ganho de 1-2kg na balança é normal e esperado",
      "Focar em: arroz branco, batata, macarrão, pães brancos"
    ]
  },
  raceDay: {
    title: "Nutrição Durante a Maratona",
    description: "Protocolo para evitar o 'muro' e manter energia",
    content: [
      "Meta: 60-75g de CHO por hora (240-300g total)",
      "Começar alimentação entre 30-45min do início",
      "1 gel a cada 45min + bebida esportiva nos postos",
      "Cafeína: 3-6mg/kg (264-528mg) 60min antes da largada",
      "Cafeína adicional: 1-2mg/kg na segunda metade",
      "Hidratação: 300-600ml/h + 250-500mg sódio/h"
    ]
  },
  supplements: {
    title: "Suplementação Baseada em Evidências",
    description: "Suplementos com comprovação científica para performance",
    content: [
      "Cafeína: O mais eficaz para performance em endurance",
      "Whey Protein: 25-30g pós-treino para recuperação",
      "Eletrólitos: Essenciais em treinos longos e clima quente",
      "Creatina: 3-5g/dia pode auxiliar na recuperação",
      "Multivitamínico: Apenas se deficiências identificadas",
      "Evitar novos suplementos na semana da prova"
    ]
  }
};

export default function NutritionPage() {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState('1');

  useEffect(() => {
    getNutritionData()
      .then(data => {
        setPhases(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading nutrition data:', err);
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
            <p className="text-muted-foreground">Carregando informações nutricionais...</p>
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
            <span className="bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">
              Nutrição para Maratona
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Estratégias nutricionais periodizadas para cada fase do treinamento.
            Maximize seu desempenho e recuperação com a alimentação adequada.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 text-center">
            <CardContent className="p-4">
              <div className="flex justify-center mb-2">
                <Apple className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-lg font-bold">7-10g</div>
              <div className="text-sm text-muted-foreground">CHO/kg/dia no pico</div>
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 text-center">
            <CardContent className="p-4">
              <div className="flex justify-center mb-2">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-lg font-bold">1.6-2.0g</div>
              <div className="text-sm text-muted-foreground">Proteína/kg/dia</div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 text-center">
            <CardContent className="p-4">
              <div className="flex justify-center mb-2">
                <Droplets className="h-6 w-6 text-cyan-600" />
              </div>
              <div className="text-lg font-bold">2-4L</div>
              <div className="text-sm text-muted-foreground">Hidratação diária</div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 text-center">
            <CardContent className="p-4">
              <div className="flex justify-center mb-2">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-lg font-bold">60-75g</div>
              <div className="text-sm text-muted-foreground">CHO/hora na prova</div>
            </CardContent>
          </Card>
        </div>

        {/* Nutrition by Phase */}
        <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="h-5 w-5" />
              Nutrição Periodizada por Fase
            </CardTitle>
            <CardDescription>
              Cada fase do treinamento tem demandas nutricionais específicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activePhase} onValueChange={setActivePhase} className="space-y-4">
              <TabsList className="grid grid-cols-5 w-full">
                {phases?.map((phase) => (
                  <TabsTrigger 
                    key={phase.id} 
                    value={phase.phaseNumber.toString()}
                    className="text-xs sm:text-sm"
                    aria-label={`Visualizar nutrição da Fase ${phase.phaseNumber}: ${phase.name}`}
                  >
                    Fase {phase.phaseNumber}
                  </TabsTrigger>
                ))}
              </TabsList>

              {phases?.map((phase) => (
                <TabsContent key={phase.id} value={phase.phaseNumber.toString()}>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        Fase {phase.phaseNumber}: {phase.name}
                      </h3>
                      <p className="text-muted-foreground">
                        {phase.duration} • {phase.description}
                      </p>
                    </div>

                    {phase.nutrition && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Macronutrientes</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Carboidratos:</span>
                              <Badge variant="secondary">{phase.nutrition.carbohydrates}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Proteína:</span>
                              <Badge variant="secondary">{phase.nutrition.protein}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Gorduras:</span>
                              <Badge variant="secondary">{phase.nutrition.fats}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Calorias:</span>
                              <Badge variant="outline">{phase.nutrition.calories}</Badge>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Hidratação & Timing</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <span className="font-medium">Hidratação:</span>
                              <p className="text-sm text-muted-foreground mt-1">
                                {phase.nutrition.hydration}
                              </p>
                            </div>
                            {phase.nutrition.timing && (
                              <div>
                                <span className="font-medium">Timing:</span>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {phase.nutrition.timing}
                                </p>
                              </div>
                            )}
                            {phase.nutrition.supplements && (
                              <div>
                                <span className="font-medium">Suplementos:</span>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {phase.nutrition.supplements}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {phase.nutrition?.special_notes && (
                      <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 bg-amber-50 border-amber-200">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-amber-800 mb-1">Notas Especiais</h4>
                              <p className="text-sm text-amber-700">
                                {phase.nutrition.special_notes}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Calculadora de Macros */}
        <div className="mb-8">
          <MacroCalculator />
        </div>

        {/* Special Protocols */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(nutritionExtras).map(([key, section]) => (
            <Card key={key} className="h-full">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {key === 'carbLoading' && <Clock className="h-5 w-5 text-orange-600" />}
                  {key === 'raceDay' && <Zap className="h-5 w-5 text-red-600" />}
                  {key === 'supplements' && <Target className="h-5 w-5 text-blue-600" />}
                  {section.title}
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {section.content.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
