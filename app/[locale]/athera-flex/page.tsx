/**
 * ATHERA FLEX v4.0.0 - Dashboard Principal
 * 
 * Dashboard unificado mostrando:
 * - Energy Dashboard (energia/fadiga)
 * - Weather Widget (clima)
 * - Recovery Score (recuperação)
 * - Proactive Suggestions (sugestões)
 * - Analytics & Insights
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  TrendingUp, 
  Zap, 
  Calendar,
  Brain,
  Settings,
  BarChart3,
  Sparkles
} from 'lucide-react';

// Importar componentes Athera Flex
import { EnergyDashboard } from '@/components/athera-flex/EnergyDashboard';
import { WeatherWidget } from '@/components/athera-flex/WeatherWidget';
import { RecoveryScore } from '@/components/athera-flex/RecoveryScore';
import { ProactiveSuggestions } from '@/components/athera-flex/ProactiveSuggestions';
import { FlexCoachChat } from '@/components/athera-flex/FlexCoachChat';
import { FlexSettingsPanel } from '@/components/athera-flex/FlexSettingsPanel';

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
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="context" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Contexto</span>
          </TabsTrigger>
          <TabsTrigger value="proactive" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Sugestões</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">AI Coach</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configurações</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB: Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnergyDashboard showDetails={true} />
            <WeatherWidget />
            <RecoveryScore workoutIntensity="moderate" showDetails={true} />

            {/* Quick Stats */}
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
        </TabsContent>

        {/* TAB: Contexto Awareness */}
        <TabsContent value="context" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <EnergyDashboard showDetails={true} compact={false} />
            <RecoveryScore workoutIntensity="moderate" showDetails={true} />
            <WeatherWidget />
          </div>

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
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    ✅ Condições Favoráveis
                  </h4>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    <li>• Energia: 85% (Excelente)</li>
                    <li>• Recuperação: 92% (Completa)</li>
                    <li>• Clima: Ideal para treino outdoor</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    💡 Recomendação IA
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Momento perfeito para treino forte. Considere aumentar intensidade em 10%.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Proactive Mode */}
        <TabsContent value="proactive" className="space-y-6">
          <ProactiveSuggestions />
        </TabsContent>

        {/* TAB: AI Coach Chat */}
        <TabsContent value="chat" className="space-y-6">
          <FlexCoachChat />
        </TabsContent>

        {/* TAB: Settings */}
        <TabsContent value="settings" className="space-y-6">
          <FlexSettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
