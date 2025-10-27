
import { prisma } from '@/lib/db';
import Header from '@/components/header';
import VdotCalculator from '@/components/vdot-calculator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Target, Activity } from 'lucide-react';

export const dynamic = "force-dynamic";

async function getVdotData() {
  const vdotTable = await prisma.vdotTable.findMany({
    orderBy: { vdot: 'asc' }
  });
  
  return vdotTable;
}

export default async function CalculatorPage() {
  const vdotData = await getVdotData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <Header />
      
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
              Calculadora VDOT
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Calcule seus paces personalizados baseados no sistema Jack Daniels. 
            Use seu tempo recente de 10km para determinar suas zonas de treinamento ideais.
          </p>
        </div>

        {/* VDOT Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calculator className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">VDOT 37-38</h3>
              <p className="text-sm text-muted-foreground">
                Seu nível atual baseado no pace de 10km (5:40-5:50/km)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">Meta: 4h</h3>
              <p className="text-sm text-muted-foreground">
                Pace alvo de maratona: 5:41/km - perfeitamente alcançável
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">5 Zonas</h3>
              <p className="text-sm text-muted-foreground">
                Easy, Marathon, Threshold, Interval, Repetition
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Calculator */}
        <VdotCalculator vdotData={vdotData} />

        {/* Pace Zones Explanation */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Entendendo as Zonas de Treinamento</CardTitle>
            <CardDescription>
              Cada zona tem um propósito específico no desenvolvimento da capacidade aeróbica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-800">E-Pace (Easy)</h4>
                  <p className="text-sm text-blue-700">
                    Ritmo conversacional, usado em 80% do treinamento. Desenvolve base aeróbica 
                    e promove recuperação ativa.
                  </p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-orange-800">M-Pace (Marathon)</h4>
                  <p className="text-sm text-orange-700">
                    Seu ritmo alvo de maratona. Usado em longões específicos para 
                    adaptar corpo e mente ao esforço da prova.
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-green-800">T-Pace (Threshold)</h4>
                  <p className="text-sm text-green-700">
                    Ritmo "confortavelmente difícil". Melhora o limiar de lactato 
                    e a capacidade de sustentar esforços moderados.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-red-800">I-Pace (Interval)</h4>
                  <p className="text-sm text-red-700">
                    Intervalos para desenvolver VO2max. Usado em sessões de 
                    qualidade para melhorar potência aeróbica.
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-purple-800">R-Pace (Repetition)</h4>
                  <p className="text-sm text-purple-700">
                    Repetições rápidas para melhorar forma de corrida, economia 
                    e velocidade neuromuscular. Uso limitado na maratona.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Distribuição 80/20</h4>
                  <p className="text-sm text-muted-foreground">
                    80% do volume em E-Pace, 20% em intensidades moderadas/altas. 
                    Princípio fundamental para desenvolvimento aeróbico.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
