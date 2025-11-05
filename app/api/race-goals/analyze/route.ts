
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { callLLM } from '@/lib/llm-client';
import { resilientAICall } from '@/lib/ai-resilience';

/**
 * API para análise pós-corrida com IA
 * POST /api/race-goals/analyze
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { raceId } = await req.json();

    if (!raceId) {
      return NextResponse.json({ error: 'ID da corrida não fornecido' }, { status: 400 });
    }

    const race = await prisma.raceGoal.findUnique({
      where: { id: raceId },
      include: {
        athlete: {
          include: {
            completedWorkouts: {
              where: {
                date: {
                  // Treinos das últimas 4 semanas antes da corrida
                  gte: new Date(new Date().getTime() - 4 * 7 * 24 * 60 * 60 * 1000)
                }
              },
              orderBy: { date: 'desc' }
            }
          }
        }
      }
    });

    if (!race) {
      return NextResponse.json({ error: 'Corrida não encontrada' }, { status: 404 });
    }

    // Preparar contexto para análise
    const context = `
# ANÁLISE PÓS-CORRIDA

## Corrida
- Nome: ${race.raceName}
- Distância: ${race.distance}
- Data: ${race.raceDate.toLocaleDateString('pt-BR')}
- Tempo Planejado: ${race.targetTime || 'Não definido'}
- Tempo Real: ${race.actualTime || 'Não registrado'}
- Classificação: ${race.priority} (${race.priority === 'A' ? 'Objetivo Principal' : race.priority === 'B' ? 'Preparatória' : 'Volume'})

## Contexto do Treinamento
- Semanas antes da corrida A: ${race.weeksBeforeA || 'N/A'}
- Fase da periodização: ${race.periodPhase || 'N/A'}

## Treinos Recentes (últimas 4 semanas)
${race.athlete.completedWorkouts.slice(0, 10).map(w => 
  `- ${new Date(w.date).toLocaleDateString('pt-BR')}: ${w.type} - ${w.distance}km (Feeling: ${w.feeling}, RPE: ${w.perceivedEffort})`
).join('\n')}
`;

    // Gerar análise com IA
    const systemPrompt = `Você é um treinador expert analisando o desempenho em corridas.

Analise o resultado da corrida considerando:
1. Se atingiu o objetivo (comparar tempo real vs planejado)
2. Como se encaixa na periodização (corrida A, B ou C)
3. O que funcionou bem
4. O que pode melhorar
5. Impacto no plano de treinamento futuro
6. Ajustes recomendados

Seja específico, construtivo e motivador.`;

    const analysis = await resilientAICall(
      () => callLLM({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: context }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
      {
        cacheKey: `race-analysis-${raceId}`,
        cacheTTL: 3600000,
        timeout: 30000,
        retryConfig: { maxRetries: 3 }
      }
    );

    // Salvar análise no banco
    await prisma.raceGoal.update({
      where: { id: raceId },
      data: {
        postRaceAnalysis: analysis,
        status: 'completed'
      }
    });

    return NextResponse.json({
      success: true,
      analysis,
      race: {
        id: race.id,
        raceName: race.raceName,
        priority: race.priority
      }
    });
  } catch (error) {
    console.error('Error analyzing race:', error);
    return NextResponse.json({ 
      error: 'Erro ao analisar corrida',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
