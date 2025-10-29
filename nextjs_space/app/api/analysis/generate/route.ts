
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { callLLM } from '@/lib/llm-client';
import { resilientLLMCall } from '@/lib/ai-resilience';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { athleteProfile: true },
    });

    if (!user?.athleteProfile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    const { period } = await request.json();
    const days = period === 'weekly' ? 7 : 30;

    // Buscar treinos do período
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const workouts = await prisma.completedWorkout.findMany({
      where: {
        athleteId: user.athleteProfile.id,
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    if (workouts.length === 0) {
      return NextResponse.json({ 
        error: 'Sem treinos no período', 
        message: 'Registre alguns treinos para gerar análises' 
      }, { status: 404 });
    }

    // Preparar dados para análise
    const runningWorkouts = workouts.filter((w) => w.type === 'running');
    const totalDistance = runningWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0);
    const totalDuration = runningWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const avgEffort = workouts.reduce((sum, w) => sum + (w.perceivedEffort || 0), 0) / workouts.length;

    // Preparar prompt para a IA
    const prompt = `Você é um treinador especialista em corrida. Analise os dados de treino abaixo e forneça uma análise detalhada.

**Período:** ${period === 'weekly' ? 'Última Semana' : 'Último Mês'}
**Número de treinos:** ${workouts.length}
**Treinos de corrida:** ${runningWorkouts.length}
**Distância total:** ${totalDistance.toFixed(1)} km
**Tempo total:** ${Math.round(totalDuration / 60)} horas
**Esforço médio percebido:** ${avgEffort.toFixed(1)}/10

**Detalhes dos treinos:**
${workouts.map((w, i) => `
${i + 1}. ${w.date.toLocaleDateString('pt-BR')} - ${w.type} ${w.subtype ? `(${w.subtype})` : ''}
   - Distância: ${w.distance || 'N/A'} km
   - Duração: ${w.duration || 'N/A'} min
   - Esforço: ${w.perceivedEffort || 'N/A'}/10
   - Sensação: ${w.feeling || 'N/A'}
   ${w.notes ? `- Notas: ${w.notes}` : ''}
`).join('\n')}

Forneça uma análise em formato JSON com a seguinte estrutura:
{
  "summary": "Resumo executivo em 2-3 frases",
  "insights": [
    "Insight 1 sobre progresso e performance",
    "Insight 2 sobre volume e intensidade",
    "Insight 3 sobre recuperação e consistência"
  ],
  "recommendations": [
    "Recomendação 1 específica",
    "Recomendação 2 específica",
    "Recomendação 3 específica"
  ],
  "alerts": [
    "Alerta 1 (se houver sinais de overtraining, desbalanceamento, etc)",
    "Alerta 2 (se aplicável)"
  ],
  "performance_score": <número de 1-10>,
  "recovery_score": <número de 1-10>
}

Responda apenas com o JSON, sem formatação markdown.`;

    // Chamar LLM para análise com resilience
    const cacheKey = `analysis-${user.athleteProfile.id}-${period}-${startDate.toISOString().split('T')[0]}`;

    const aiResponse = await resilientAICall(
      () => callLLM({
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 2000,
      }),
      {
        cacheKey,
        cacheTTL: 1800000,
        validateResponse: (resp) => {
          try {
            const data = JSON.parse(resp);
            return data.summary && data.insights;
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
        athleteId: user.athleteProfile.id,
        analysisType: period,
        startDate: startDate,
        endDate: new Date(),
        summary: analysisData.summary,
        insights: analysisData.insights.join('\n\n'),
        recommendations: analysisData.recommendations.join('\n\n'),
        hasAlerts: analysisData.alerts && analysisData.alerts.length > 0,
        alerts: analysisData.alerts ? analysisData.alerts.join('\n\n') : null,
        metrics: {
          totalWorkouts: workouts.length,
          totalDistance: totalDistance,
          totalDuration: totalDuration,
          performanceScore: analysisData.performance_score,
          recoveryScore: analysisData.recovery_score,
        },
      },
    });

    return NextResponse.json({
      success: true,
      analysis: analysis,
      data: analysisData,
    });
  } catch (error) {
    console.error('Error generating analysis:', error);
    return NextResponse.json({ error: 'Erro ao gerar análise' }, { status: 500 });
  }
}
