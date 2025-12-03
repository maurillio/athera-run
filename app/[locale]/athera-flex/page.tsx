/**
 * ATHERA FLEX v4.0.1 - Dashboard Principal
 * Versão simplificada sem componentes problemáticos
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  TrendingUp, 
  Zap, 
  Calendar,
  Brain,
  Settings,
  BarChart3,
  Sparkles,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';

export default function AtheraFlexDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-purple-600" />
              Athera Flex
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Inteligência artificial adaptando seu treino em tempo real
            </p>
          </div>
          <Badge variant="outline" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-4 py-2">
            💎 PREMIUM
          </Badge>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status do Sistema</p>
                  <p className="text-2xl font-bold text-green-600">Ativo</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ajustes Hoje</p>
                  <p className="text-2xl font-bold text-blue-600">3</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Confiança ML</p>
                  <p className="text-2xl font-bold text-purple-600">87%</p>
                </div>
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sugestões Ativas</p>
                  <p className="text-2xl font-bold text-orange-600">5</p>
                </div>
                <Sparkles className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content - Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Target className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* TAB: Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Energy Mock */}
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Nível de Energia
                </CardTitle>
                <CardDescription>Análise de fadiga e recuperação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-5xl font-bold text-purple-600 mb-2">75%</div>
                  <Badge className="bg-green-100 text-green-800">Fresco</Badge>
                  <p className="text-sm text-gray-600 mt-4">
                    Energia boa, pode fazer treino conforme planejado
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Weather Mock */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ☀️ Clima Atual
                </CardTitle>
                <CardDescription>Goiânia, GO</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-5xl font-bold text-blue-600 mb-2">28°</div>
                  <p className="text-sm text-gray-600">Sensação térmica: 30°</p>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Umidade</p>
                      <p className="font-semibold">65%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Vento</p>
                      <p className="font-semibold">12 km/h</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 mt-4">
                    Condições ideais para treinar
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recovery Mock */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💪 Recuperação
                </CardTitle>
                <CardDescription>Status de recuperação muscular</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-5xl font-bold text-green-600 mb-2">92%</div>
                  <Badge className="bg-green-100 text-green-800">Recuperado</Badge>
                  <p className="text-sm text-gray-600 mt-4">
                    Recuperação completa, pronto para treino intenso
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Quick */}
            <Card className="border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  Analytics Rápido
                </CardTitle>
                <CardDescription>Últimos 7 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ajustes Automáticos</span>
                    <span className="text-lg font-bold text-indigo-600">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Taxa de Aceitação</span>
                    <span className="text-lg font-bold text-green-600">92%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tempo Economizado</span>
                    <span className="text-lg font-bold text-purple-600">45 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Padrões Detectados</span>
                    <span className="text-lg font-bold text-orange-600">7</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contexto Card */}
          <Card>
            <CardHeader>
              <CardTitle>Análise Contextual Completa</CardTitle>
              <CardDescription>
                Sistema analisa múltiplos fatores para otimizar seus treinos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Condições Favoráveis
                  </h4>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    <li>• Energia: 75% (Boa)</li>
                    <li>• Recuperação: 92% (Completa)</li>
                    <li>• Clima: 28°C (Ideal para outdoor)</li>
                    <li>• Umidade: 65% (Confortável)</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Recomendação IA
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Momento perfeito para treino forte. Todas condições estão favoráveis.
                    Considere fazer o treino planejado na intensidade ideal.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Detalhado</CardTitle>
              <CardDescription>Análise completa dos últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Gráficos em desenvolvimento</p>
                <p className="text-sm mt-2">
                  Visualizações de tendências, padrões e insights serão adicionadas em breve
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Settings */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Athera Flex</CardTitle>
              <CardDescription>Personalize o comportamento do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Auto-Ajustes</h4>
                    <p className="text-sm text-gray-600">Aplicar ajustes automaticamente</p>
                  </div>
                  <Badge className="bg-green-500 text-white">Ativo</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Notificações</h4>
                    <p className="text-sm text-gray-600">Receber alertas de sugestões</p>
                  </div>
                  <Badge className="bg-green-500 text-white">Ativo</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Threshold ML</h4>
                    <p className="text-sm text-gray-600">Confiança mínima para auto-aplicar</p>
                  </div>
                  <Badge variant="outline">85%</Badge>
                </div>

                <Button className="w-full">
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
