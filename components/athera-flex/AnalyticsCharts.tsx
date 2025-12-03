/**
 * ATHERA FLEX v4.0.7 - Analytics Charts
 * Gráficos detalhados de analytics
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  Legend
} from 'recharts';
import { TrendingUp, Target, Zap, Brain } from 'lucide-react';

interface AnalyticsChartsProps {
  period?: '7d' | '30d' | '90d';
  className?: string;
}

export function AnalyticsCharts({ period = '7d', className }: AnalyticsChartsProps) {
  // Dados mock para gráficos
  const adjustmentsData = generateAdjustmentsData(period);
  const acceptanceData = generateAcceptanceData(period);
  const patternsData = generatePatternsData(period);
  const confidenceData = generateConfidenceData(period);

  return (
    <div className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Ajustes ao Longo do Tempo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Ajustes ao Longo do Tempo
            </CardTitle>
            <CardDescription>
              Total de ajustes aplicados por dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={adjustmentsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorAdjustments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    stroke="#9ca3af"
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    stroke="#9ca3af"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAdjustments)"
                    name="Ajustes"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico 2: Taxa de Aceitação */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              Taxa de Aceitação
            </CardTitle>
            <CardDescription>
              Percentual de sugestões aceitas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={acceptanceData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    stroke="#9ca3af"
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    stroke="#9ca3af"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="acceptance" 
                    stroke="#22c55e" 
                    strokeWidth={3}
                    dot={{ fill: '#22c55e', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Taxa (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico 3: Padrões Detectados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-600" />
              Padrões Detectados
            </CardTitle>
            <CardDescription>
              Quantidade de padrões identificados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patternsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    stroke="#9ca3af"
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    stroke="#9ca3af"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar 
                    dataKey="patterns" 
                    fill="#f97316" 
                    radius={[8, 8, 0, 0]}
                    name="Padrões"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico 4: Confiança ML */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-600" />
              Confiança ML ao Longo do Tempo
            </CardTitle>
            <CardDescription>
              Score médio de confiança das decisões
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={confidenceData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#9333ea" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    stroke="#9ca3af"
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    stroke="#9ca3af"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="confidence" 
                    stroke="#9333ea" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorConfidence)"
                    name="Confiança (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Insights Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Média de Ajustes/Dia</p>
                <p className="text-2xl font-bold text-blue-600">
                  {calculateAverage(adjustmentsData, 'total')}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Taxa Aceitação Média</p>
                <p className="text-2xl font-bold text-green-600">
                  {calculateAverage(acceptanceData, 'acceptance')}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900">Confiança ML Média</p>
                <p className="text-2xl font-bold text-purple-600">
                  {calculateAverage(confidenceData, 'confidence')}%
                </p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// HELPERS - Geração de dados mock
// ============================================================================

function generateAdjustmentsData(period: string) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const data = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      total: Math.round(Math.random() * 5 + 2),
      auto: Math.round(Math.random() * 3 + 1),
      manual: Math.round(Math.random() * 2),
    });
  }

  return data;
}

function generateAcceptanceData(period: string) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const data = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      acceptance: Math.round(Math.random() * 20 + 75), // 75-95%
    });
  }

  return data;
}

function generatePatternsData(period: string) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const data = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      patterns: Math.round(Math.random() * 4 + 1), // 1-5 padrões
    });
  }

  return data;
}

function generateConfidenceData(period: string) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const data = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      confidence: Math.round(Math.random() * 15 + 80), // 80-95%
    });
  }

  return data;
}

function calculateAverage(data: any[], key: string): number {
  if (data.length === 0) return 0;
  const sum = data.reduce((acc, item) => acc + item[key], 0);
  return Math.round(sum / data.length);
}
