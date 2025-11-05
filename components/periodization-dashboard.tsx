
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Target, Award } from 'lucide-react';

interface Race {
  id: number;
  raceName: string;
  distance: string;
  raceDate: string;
  priority: 'A' | 'B' | 'C';
  weeksBeforeA: number | null;
  periodPhase: string | null;
}

interface Phase {
  name: string;
  weeks: number;
  weekStart: number;
  weekEnd: number;
  focus: string;
  description: string;
  raceWeeks: number[];
  races: Array<{
    raceId: number;
    raceName: string;
    weekNumber: number;
    priority: 'A' | 'B' | 'C';
  }>;
}

interface PeriodizationDashboardProps {
  races: Race[];
  phases: Phase[];
  currentWeek: number;
  totalWeeks: number;
}

export default function PeriodizationDashboard({
  races,
  phases,
  currentWeek,
  totalWeeks
}: PeriodizationDashboardProps) {
  const raceA = races.find(r => r.priority === 'A');
  const racesB = races.filter(r => r.priority === 'B');
  const racesC = races.filter(r => r.priority === 'C');

  const getPhaseColor = (phaseName: string) => {
    const colors: Record<string, string> = {
      'base': 'bg-blue-500',
      'build': 'bg-green-500',
      'peak': 'bg-orange-500',
      'taper': 'bg-purple-500',
      'race': 'bg-red-500'
    };
    const key = phaseName.toLowerCase();
    return colors[key] || 'bg-gray-500';
  };

  const getPriorityColor = (priority: 'A' | 'B' | 'C') => {
    const colors = {
      'A': 'bg-red-500 text-white',
      'B': 'bg-yellow-500 text-black',
      'C': 'bg-blue-500 text-white'
    };
    return colors[priority];
  };

  const getPriorityLabel = (priority: 'A' | 'B' | 'C') => {
    const labels = {
      'A': 'Objetivo Principal',
      'B': 'Preparatória',
      'C': 'Volume/Experiência'
    };
    return labels[priority];
  };

  return (
    <div className="space-y-6">
      {/* Resumo de Corridas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Sistema de Múltiplas Corridas
          </CardTitle>
          <CardDescription>
            Visão geral das suas corridas classificadas por prioridade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Corrida A */}
          {raceA && (
            <div className="p-4 border-2 border-red-500 rounded-lg bg-red-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-red-600" />
                  <Badge className={getPriorityColor('A')}>A</Badge>
                  <span className="font-semibold text-red-900">{raceA.raceName}</span>
                </div>
                <span className="text-sm text-red-700">
                  {new Date(raceA.raceDate).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <p className="text-sm text-red-800">
                🎯 {getPriorityLabel('A')} - Todo o plano culmina aqui!
              </p>
              <p className="text-xs text-red-600 mt-1">
                Distância: {raceA.distance} • Fase: {raceA.periodPhase || 'N/A'}
              </p>
            </div>
          )}

          {/* Corridas B */}
          {racesB.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">
                Corridas Preparatórias (B) - {racesB.length}
              </h4>
              {racesB.map(race => (
                <div key={race.id} className="p-3 border border-yellow-500 rounded-lg bg-yellow-50">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor('B')}>B</Badge>
                      <span className="font-medium text-yellow-900">{race.raceName}</span>
                    </div>
                    <span className="text-xs text-yellow-700">
                      {new Date(race.raceDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-xs text-yellow-800">
                    {race.weeksBeforeA} semanas antes da corrida A • {race.distance} • {race.periodPhase}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Corridas C */}
          {racesC.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">
                Corridas de Volume (C) - {racesC.length}
              </h4>
              {racesC.slice(0, 3).map(race => (
                <div key={race.id} className="p-3 border border-blue-300 rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor('C')}>C</Badge>
                      <span className="font-medium text-blue-900">{race.raceName}</span>
                    </div>
                    <span className="text-xs text-blue-700">
                      {new Date(race.raceDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-xs text-blue-800">
                    {race.distance} • Treino longo com chip
                  </p>
                </div>
              ))}
              {racesC.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  + {racesC.length - 3} outras corridas C
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline de Periodização */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Periodização do Treinamento
          </CardTitle>
          <CardDescription>
            Visualização das fases do seu plano
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {phases.map((phase, index) => {
              const isCurrentPhase = currentWeek >= phase.weekStart && currentWeek <= phase.weekEnd;
              const progressInPhase = isCurrentPhase 
                ? ((currentWeek - phase.weekStart + 1) / phase.weeks) * 100 
                : currentWeek > phase.weekEnd ? 100 : 0;

              return (
                <div key={index} className={`p-4 rounded-lg border ${isCurrentPhase ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getPhaseColor(phase.name)}`} />
                      <span className="font-semibold">{phase.name}</span>
                      <Badge variant="outline">
                        Semanas {phase.weekStart}-{phase.weekEnd}
                      </Badge>
                    </div>
                    {isCurrentPhase && (
                      <Badge className="bg-orange-600 text-white">
                        Fase Atual
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{phase.description}</p>
                  <p className="text-xs font-medium mb-2">Foco: {phase.focus}</p>
                  
                  {/* Barra de progresso */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className={`${getPhaseColor(phase.name)} h-2 rounded-full transition-all`}
                      style={{ width: `${progressInPhase}%` }}
                    />
                  </div>

                  {/* Corridas nesta fase */}
                  {phase.races && phase.races.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Corridas nesta fase:</p>
                      {phase.races.map(race => (
                        <div key={race.raceId} className="flex items-center gap-2 text-xs">
                          <Badge className={getPriorityColor(race.priority)} variant="outline">
                            {race.priority}
                          </Badge>
                          <span>{race.raceName}</span>
                          <span className="text-muted-foreground">• Semana {race.weekNumber}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
