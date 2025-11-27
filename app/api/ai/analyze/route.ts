
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { callLLM } from '@/lib/llm-client';
import { resilientAICall } from '@/lib/ai-resilience';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { athleteId, analysisType } = await request.json();

    // Buscar perfil do atleta
    const profile = await prisma.athleteProfile.findUnique({
      where: { id: athleteId }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    // Definir período de análise
    let startDate = new Date();
    let endDate = new Date();
    
    if (analysisType === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (analysisType === 'monthly') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate.setMonth(startDate.getMonth() - 3); // 3 meses para performance e injury risk
    }

    // Buscar treinos do período
    const workouts = await prisma.completedWorkout.findMany({
      where: {
        athleteId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'desc' }
    });

    if (workouts.length === 0) {
      return NextResponse.json({
        error: 'Nenhum treino encontrado no período. Registre pelo menos 3 treinos para análise.'
      }, { status: 400 });
    }

    // Preparar contexto para a IA
    const workoutsSummary = workouts.map(w => ({
      date: w.date,
      type: w.type,
      subtype: w.subtype,
      distance: w.distance,
      duration: w.duration,
      pace: w.pace,
      avgHeartRate: w.avgHeartRate,
      perceivedEffort: w.perceivedEffort,
      feeling: w.feeling,
      notes: w.notes
    }));

    // Calcular métricas básicas
    const runningWorkouts = workouts.filter(w => w.type === 'running');
    const totalDistance = runningWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0);
    const totalDuration = runningWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const avgPerceivedEffort = workouts.reduce((sum, w) => sum + (w.perceivedEffort || 0), 0) / workouts.length;

    // Chamada para LLM API com resilience
    const cacheKey = `ai-analyze-${athleteId}-${analysisType}-${startDate.toISOString().split('T')[0]}`;

    const aiResponse = await resilientAICall(
      () => callLLM({
        messages: [
        {
          role: 'system',
          content: `Você é um especialista em treinamento de corrida e análise de performance. Você está analisando os treinos de um atleta que está se preparando para uma maratona.

Perfil do atleta:
- Peso: ${profile.weight}kg
- Altura: ${profile.height}cm
- VDOT atual: ${profile.currentVDOT || 'não calculado'}
- Meta de tempo: ${profile.targetTime || 'não definido'}

Tipo de análise solicitada: ${analysisType}

Você deve fornecer uma análise profissional e baseada em ciência, considerando:
1. Progressão de carga e volume
2. Distribuição de intensidades
3. Sinais de fadiga ou overtraining
4. Risco de lesões (especialmente canelite e fascite plantar - histórico do atleta)
5. Consistência dos treinos
6. Percepção de esforço vs. métricas objetivas

Responda em formato JSON com a seguinte estrutura:
{
  "summary": "Resumo executivo de 2-3 frases",
  "insights": "Insights detalhados em markdown, use bullet points, seções claras",
  "recommendations": "Recomendações específicas e práticas em markdown",
  "hasAlerts": true/false,
  "alerts": "Alertas importantes se houver (markdown) ou null",
  "metrics": {
    "totalDistance": número,
    "totalWorkouts": número,
    "avgPerceivedEffort": número,
    "consistencyScore": número de 0-10
  }
}

Responda com JSON puro, sem markdown ou code blocks.`
        },
        {
          role: 'user',
          content: `Analise os seguintes treinos do período de ${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}:

${JSON.stringify(workoutsSummary, null, 2)}

Métricas do período:
- Total de treinos: ${workouts.length}
- Treinos de corrida: ${runningWorkouts.length}
- Distância total: ${totalDistance.toFixed(1)}km
- Tempo total: ${Math.floor(totalDuration / 60)}h ${totalDuration % 60}min
- Esforço percebido médio: ${avgPerceivedEffort.toFixed(1)}/10`
        }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000
      }),
      {
        cacheKey,
        cacheTTL: 1800000,
        validateResponse: (resp) => {
          try {
            const data = JSON.parse(resp);
            return data.summary && data.insights && data.recommendations;
          } catch {
            return false;
          }
        },
        timeout: 40000,
        retryConfig: { maxRetries: 3 }
      }
    );

    const analysisData = JSON.parse(aiResponse);

    // Salvar análise no banco
    const analysis = await prisma.aIAnalysis.create({
      data: {
        athleteId,
        analysisType,
        startDate,
        endDate,
        summary: analysisData.summary,
        insights: analysisData.insights,
        recommendations: analysisData.recommendations,
        hasAlerts: analysisData.hasAlerts || false,
        alerts: analysisData.alerts,
        metrics: analysisData.metrics
      }
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Erro ao gerar análise:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar análise' },
      { status: 500 }
    );
  }
}
