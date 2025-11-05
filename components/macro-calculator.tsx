
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, Target, Apple, Droplets } from 'lucide-react';

export default function MacroCalculator() {
  const [weight, setWeight] = useState('88');
  const [phase, setPhase] = useState('base');
  const [showResults, setShowResults] = useState(false);

  const phases = {
    base: { name: 'Base Aeróbica', carbs: [5, 7], protein: [1.6, 1.8], calories: [2800, 3200] },
    build: { name: 'Desenvolvimento', carbs: [6, 8], protein: [1.8, 2.0], calories: [3000, 3400] },
    intensify: { name: 'Intensificação', carbs: [7, 9], protein: [2.0, 2.0], calories: [3200, 3600] },
    peak: { name: 'Pico', carbs: [8, 10], protein: [2.0, 2.0], calories: [3400, 4000] },
    taper: { name: 'Taper/Polimento', carbs: [7, 9], protein: [1.8, 1.8], calories: [3000, 3400] }
  };

  const calculateMacros = () => {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return null;

    const phaseData = phases[phase as keyof typeof phases];
    
    return {
      carbs: {
        min: Math.round(phaseData.carbs[0] * w),
        max: Math.round(phaseData.carbs[1] * w)
      },
      protein: {
        min: Math.round(phaseData.protein[0] * w),
        max: Math.round(phaseData.protein[1] * w)
      },
      fats: {
        min: Math.round((phaseData.calories[0] * 0.20) / 9),
        max: Math.round((phaseData.calories[1] * 0.25) / 9)
      },
      calories: {
        min: phaseData.calories[0],
        max: phaseData.calories[1]
      }
    };
  };

  const macros = calculateMacros();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calculadora de Macros
        </CardTitle>
        <CardDescription>
          Calcule suas necessidades de macronutrientes baseado no seu peso e fase de treinamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Seu Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="88"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phase">Fase do Treinamento</Label>
            <Select value={phase} onValueChange={setPhase}>
              <SelectTrigger id="phase">
                <SelectValue placeholder="Selecione a fase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="base">Base Aeróbica (Semanas 1-9)</SelectItem>
                <SelectItem value="build">Desenvolvimento (Semanas 10-18)</SelectItem>
                <SelectItem value="intensify">Intensificação (Semanas 19-26)</SelectItem>
                <SelectItem value="peak">Pico (Semanas 27-38)</SelectItem>
                <SelectItem value="taper">Taper/Polimento (Semanas 39-45)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={() => setShowResults(true)} 
          className="w-full bg-gradient-to-r from-green-600 to-orange-600"
        >
          <Target className="mr-2 h-4 w-4" />
          Calcular Necessidades
        </Button>

        {/* Results */}
        {showResults && macros && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg">Suas Necessidades Diárias:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Carboidratos */}
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Apple className="h-5 w-5 text-orange-600" />
                    <span className="font-semibold">Carboidratos</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {macros.carbs.min}-{macros.carbs.max}g
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Principal fonte de energia
                  </p>
                </CardContent>
              </Card>

              {/* Proteína */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">Proteína</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {macros.protein.min}-{macros.protein.max}g
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Recuperação muscular
                  </p>
                </CardContent>
              </Card>

              {/* Gorduras */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">Gorduras</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {macros.fats.min}-{macros.fats.max}g
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Saúde hormonal
                  </p>
                </CardContent>
              </Card>

              {/* Calorias */}
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold">Calorias Totais</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {macros.calories.min}-{macros.calories.max}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Energia total diária
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Distribuição */}
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Distribuição Sugerida (6 refeições):</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Café da manhã:</span>
                    <Badge variant="outline">{Math.round(macros.carbs.min * 0.20)}g CHO</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Lanche manhã:</span>
                    <Badge variant="outline">{Math.round(macros.carbs.min * 0.15)}g CHO</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Almoço:</span>
                    <Badge variant="outline">{Math.round(macros.carbs.min * 0.25)}g CHO</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Lanche tarde:</span>
                    <Badge variant="outline">{Math.round(macros.carbs.min * 0.15)}g CHO</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Jantar:</span>
                    <Badge variant="outline">{Math.round(macros.carbs.min * 0.20)}g CHO</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Ceia:</span>
                    <Badge variant="outline">{Math.round(macros.carbs.min * 0.05)}g CHO</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
