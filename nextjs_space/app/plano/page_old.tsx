
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ChevronLeft, ChevronRight, Target, Timer, Dumbbell, Waves } from 'lucide-react';

// Dados do plano de treinamento (usando strings para evitar problemas de timezone)
const PLANO_INICIO_STR = '2025-10-20'; // 20 de outubro de 2025 (primeira segunda-feira)
const MARATONA_DATA_STR = '2026-08-30'; // 30 de agosto de 2026

function getDateFromString(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Estrutura das fases
const fases = [
  { nome: 'BASE AERÓBICA', inicio_semana: 1, fim_semana: 9, cor: 'bg-blue-500' },
  { nome: 'DESENVOLVIMENTO', inicio_semana: 10, fim_semana: 18, cor: 'bg-green-500' },
  { nome: 'INTENSIFICAÇÃO', inicio_semana: 19, fim_semana: 26, cor: 'bg-yellow-500' },
  { nome: 'PICO', inicio_semana: 27, fim_semana: 38, cor: 'bg-orange-500' },
  { nome: 'TAPER/POLIMENTO', inicio_semana: 39, fim_semana: 45, cor: 'bg-purple-500' },
];

// Plano detalhado de treinos (resumido para as primeiras semanas)
const treinos: Record<number, any> = {
  1: {
    terca: '6 km em ritmo fácil (Z2) + Força parte superior',
    quinta: '8 km em ritmo fácil (Z2) + Força core e pernas',
    domingo: '10 km em ritmo fácil (Z2) + Força parte superior',
    natacao: '30 minutos técnica'
  },
  2: {
    terca: '7 km em ritmo fácil (Z2) + Força parte superior',
    quinta: '8 km em ritmo fácil (Z2) + Força core e pernas',
    domingo: '12 km em ritmo fácil (Z2) + Força parte superior',
    natacao: '30 minutos'
  },
  3: {
    terca: '7 km em ritmo fácil (Z2) + Força parte superior',
    quinta: '9 km em ritmo fácil (Z2) + Força core e pernas',
    domingo: '14 km em ritmo fácil (Z2) + Força parte superior',
    natacao: '35 minutos'
  },
  4: {
    terca: '5 km em ritmo fácil (Z2) + Força leve',
    quinta: '6 km em ritmo fácil (Z2) + Força leve',
    domingo: '10 km em ritmo fácil (Z2)',
    natacao: '25 minutos técnica',
    recuperacao: true
  },
  // Adicione mais semanas conforme necessário
};

function getWeekDates(weekNum: number, startDate: Date) {
  const weekStart = new Date(startDate);
  weekStart.setDate(startDate.getDate() + (weekNum - 1) * 7);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  return { start: weekStart, end: weekEnd };
}

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

function formatDateLong(date: Date) {
  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
                 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
}

function getCurrentWeek() {
  const hoje = new Date();
  const planoInicio = getDateFromString(PLANO_INICIO_STR);
  const diff = hoje.getTime() - planoInicio.getTime();
  const diasDecorridos = Math.floor(diff / (1000 * 60 * 60 * 24));
  const semanaAtual = Math.floor(diasDecorridos / 7) + 1;
  
  if (semanaAtual < 1) return 1;
  if (semanaAtual > 45) return 45;
  return semanaAtual;
}

function getFaseAtual(semana: number) {
  return fases.find(f => semana >= f.inicio_semana && semana <= f.fim_semana);
}

export default function PlanoPage() {
  const [semanaAtual, setSemanaAtual] = useState(1);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    setSemanaAtual(getCurrentWeek());
  }, []);
  
  const PLANO_INICIO = getDateFromString(PLANO_INICIO_STR);
  const MARATONA_DATA = getDateFromString(MARATONA_DATA_STR);
  
  const { start: semanaInicio, end: semanaFim } = getWeekDates(semanaAtual, PLANO_INICIO);
  const faseAtual = getFaseAtual(semanaAtual);
  const treinoSemana = treinos[semanaAtual];

  const avançarSemana = () => {
    if (semanaAtual < 45) setSemanaAtual(semanaAtual + 1);
  };

  const voltarSemana = () => {
    if (semanaAtual > 1) setSemanaAtual(semanaAtual - 1);
  };

  const irParaSemanaAtual = () => {
    if (mounted) {
      setSemanaAtual(getCurrentWeek());
    }
  };
  
  const semanaAtualCalculada = mounted ? getCurrentWeek() : 1;

  // Prevenir erro de hidratação renderizando apenas após montagem
  if (!mounted) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando plano de treinamento...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          Plano de Treinamento para Maratona
        </h1>
        <p className="text-muted-foreground">
          Seu caminho para completar a maratona em 4 horas - De 20 de outubro de 2025 até 30 de agosto de 2026
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data de Início</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">20/10/2025</div>
            <p className="text-xs text-muted-foreground">Segunda-feira</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data da Maratona</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">30/08/2026</div>
            <p className="text-xs text-muted-foreground">Domingo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meta de Tempo</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">~4 horas</div>
            <p className="text-xs text-muted-foreground">5:41 min/km</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Semana Atual</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Semana {semanaAtualCalculada}/45
            </div>
            {getFaseAtual(semanaAtualCalculada) && (
              <Badge className={`${getFaseAtual(semanaAtualCalculada)!.cor} text-white mt-2`}>
                {getFaseAtual(semanaAtualCalculada)!.nome}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navegação de Semanas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Semana {semanaAtual} de 45</CardTitle>
              <CardDescription>
                {formatDate(semanaInicio)} - {formatDate(semanaFim)}
                {faseAtual && (
                  <Badge className={`${faseAtual.cor} text-white ml-2`}>
                    {faseAtual.nome}
                  </Badge>
                )}
                {treinoSemana?.recuperacao && (
                  <Badge variant="outline" className="ml-2 border-green-500 text-green-500">
                    Semana de Recuperação
                  </Badge>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={irParaSemanaAtual}
                disabled={!mounted || semanaAtual === semanaAtualCalculada}
              >
                Semana Atual
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={voltarSemana}
                disabled={semanaAtual === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={avançarSemana}
                disabled={semanaAtual === 45}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {treinoSemana ? (
            <div className="space-y-4">
              {/* Terça */}
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <Dumbbell className="h-4 w-4" />
                  <h4 className="font-semibold">
                    Terça-feira, {formatDate(new Date(semanaInicio.getTime() + 1 * 24 * 60 * 60 * 1000))}
                  </h4>
                </div>
                <p className="text-muted-foreground">{treinoSemana.terca}</p>
              </div>

              {/* Quinta */}
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <Dumbbell className="h-4 w-4" />
                  <h4 className="font-semibold">
                    Quinta-feira, {formatDate(new Date(semanaInicio.getTime() + 3 * 24 * 60 * 60 * 1000))}
                  </h4>
                </div>
                <p className="text-muted-foreground">{treinoSemana.quinta}</p>
              </div>

              {/* Domingo */}
              <div className="border-l-4 border-orange-500 pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <Dumbbell className="h-4 w-4" />
                  <h4 className="font-semibold">
                    Domingo, {formatDate(new Date(semanaInicio.getTime() + 6 * 24 * 60 * 60 * 1000))}
                  </h4>
                </div>
                <p className="text-muted-foreground">{treinoSemana.domingo}</p>
              </div>

              {/* Natação */}
              <div className="border-l-4 border-cyan-500 pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <Waves className="h-4 w-4" />
                  <h4 className="font-semibold">Natação (Segunda e Sexta)</h4>
                </div>
                <p className="text-muted-foreground">
                  Segunda ({formatDate(semanaInicio)}) e Sexta ({formatDate(new Date(semanaInicio.getTime() + 4 * 24 * 60 * 60 * 1000))}) - {treinoSemana.natacao}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Dados detalhados para esta semana serão carregados em breve.</p>
              <p className="mt-2">Consulte o documento completo do plano para mais informações.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline das Fases */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline das Fases de Treinamento</CardTitle>
          <CardDescription>Progressão ao longo das 45 semanas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fases.map((fase, idx) => {
              const { start, end } = getWeekDates(fase.inicio_semana, PLANO_INICIO);
              const { end: fimFase } = getWeekDates(fase.fim_semana, PLANO_INICIO);
              const numSemanas = fase.fim_semana - fase.inicio_semana + 1;
              const estaAtivo = semanaAtual >= fase.inicio_semana && semanaAtual <= fase.fim_semana;
              
              return (
                <div key={idx} className={`border-l-4 ${fase.cor} pl-4 py-2 ${estaAtivo ? 'bg-accent/50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">
                        Fase {idx + 1}: {fase.nome}
                        {estaAtivo && (
                          <Badge className="ml-2" variant="default">Fase Atual</Badge>
                        )}
                      </h4>
                      <p className="text-sm font-medium text-foreground">
                        Semanas {fase.inicio_semana}-{fase.fim_semana} ({numSemanas} semanas)
                      </p>
                      <p className="text-xs font-medium text-foreground/80">
                        {formatDate(start)} - {formatDate(fimFase)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSemanaAtual(fase.inicio_semana)}
                    >
                      Ver Início
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Tabs defaultValue="zonas" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="zonas" aria-label="Visualizar Zonas de Frequência Cardíaca">Zonas de FC</TabsTrigger>
          <TabsTrigger value="ritmo" aria-label="Visualizar Ritmo Alvo">Ritmo Alvo</TabsTrigger>
          <TabsTrigger value="dicas" aria-label="Visualizar Dicas de Treinamento">Dicas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="zonas">
          <Card>
            <CardHeader>
              <CardTitle>Zonas de Frequência Cardíaca</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">Z2</Badge>
                <div>
                  <p className="font-medium">Aeróbico Leve (60-70% FCMax)</p>
                  <p className="text-sm text-muted-foreground">Conversa confortável - a maior parte dos treinos</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">Z3</Badge>
                <div>
                  <p className="font-medium">Aeróbico Moderado (70-80% FCMax)</p>
                  <p className="text-sm text-muted-foreground">Conversa com esforço - treinos de desenvolvimento</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">Z4</Badge>
                <div>
                  <p className="font-medium">Limiar (80-90% FCMax)</p>
                  <p className="text-sm text-muted-foreground">Frases curtas apenas - treinos de intensificação</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">Z5</Badge>
                <div>
                  <p className="font-medium">VO2Max (90-100% FCMax)</p>
                  <p className="text-sm text-muted-foreground">Sem conversa - treinos de pico</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ritmo">
          <Card>
            <CardHeader>
              <CardTitle>Ritmo de Maratona</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Meta de Tempo</p>
                  <p className="text-2xl font-bold">4 horas</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ritmo Médio</p>
                  <p className="text-2xl font-bold">5:41 min/km</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Faixas de treino:</p>
                <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                  <li>Ritmo de maratona: 5:35-5:50 min/km</li>
                  <li>Longões leves (Z2): 6:00-6:30 min/km</li>
                  <li>Treinos intervalados (Z4-Z5): 5:00-5:30 min/km</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dicas">
          <Card>
            <CardHeader>
              <CardTitle>Observações Importantes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-primary">💧</span>
                  <div>
                    <p className="font-medium">Hidratação</p>
                    <p className="text-sm text-muted-foreground">Beba água durante corridas longas (&gt;15km)</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">🍫</span>
                  <div>
                    <p className="font-medium">Nutrição</p>
                    <p className="text-sm text-muted-foreground">Teste géis/carboidratos nos longões a partir da semana 10</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">😴</span>
                  <div>
                    <p className="font-medium">Descanso</p>
                    <p className="text-sm text-muted-foreground">Respeite os dias de recuperação - são essenciais!</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">🩺</span>
                  <div>
                    <p className="font-medium">Escuta Corporal</p>
                    <p className="text-sm text-muted-foreground">Se sentir dor, reduza a intensidade e consulte um profissional</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">👟</span>
                  <div>
                    <p className="font-medium">Equipamento</p>
                    <p className="text-sm text-muted-foreground">Troque tênis a cada 600-800km e teste tudo nos treinos (nada de novidades na prova!)</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botão de Download */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Plano Completo em PDF</p>
              <p className="text-sm text-muted-foreground">
                Baixe o documento completo com todas as 45 semanas detalhadas
              </p>
            </div>
            <Button onClick={() => window.open('/plano_treinamento_com_datas.md', '_blank')}>
              Download do Plano Completo
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
