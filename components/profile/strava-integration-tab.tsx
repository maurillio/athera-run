/**
 * STRAVA INTEGRATION TAB - v3.2.0
 * Tab completa com todas as funcionalidades do Strava
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StravaDataSection } from './strava-data-section';
import { StravaActivitiesDashboard } from '@/components/strava-activities-dashboard';
import { StravaPersonalRecords } from '@/components/strava-personal-records';
import { StravaGear } from '@/components/strava-gear';
import { StravaStats } from '@/components/strava-stats';
import { Activity, TrendingUp, Trophy, Settings } from 'lucide-react';

export function StravaIntegrationTab() {
  return (
    <div className="space-y-6">
      {/* Seção de Conexão e Status */}
      <StravaDataSection />

      {/* Tabs de Funcionalidades */}
      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Atividades</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Estatísticas</span>
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Recordes</span>
          </TabsTrigger>
          <TabsTrigger value="gear" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Equipamentos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="mt-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Histórico de Atividades</h3>
            <StravaActivitiesDashboard />
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Estatísticas Avançadas</h3>
            <StravaStats />
          </Card>
        </TabsContent>

        <TabsContent value="records" className="mt-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Recordes Pessoais</h3>
            <StravaPersonalRecords />
          </Card>
        </TabsContent>

        <TabsContent value="gear" className="mt-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Equipamentos</h3>
            <StravaGear />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
