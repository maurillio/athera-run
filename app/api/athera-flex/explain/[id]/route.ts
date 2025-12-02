/**
 * API: Explain Adjustment
 * Gera explicação em linguagem natural sobre um ajuste específico
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import OpenAI from 'openai';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize OpenAI inside the request handler
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const adjustmentId = params.id;

    // Buscar ajuste no banco
    const adjustment = await prisma.workoutAdjustment.findUnique({
      where: { id: adjustmentId },
      include: {
        plannedWorkout: true,
        completedWorkout: true,
      },
    });

    if (!adjustment) {
      return NextResponse.json({ error: 'Adjustment not found' }, { status: 404 });
    }

    // Buscar match decision se existir
    const matchDecision = await prisma.workoutMatchDecision.findFirst({
      where: {
        completedWorkoutId: adjustment.completedWorkoutId,
        plannedWorkoutId: adjustment.plannedWorkoutId,
      },
    });

    // Gerar explicação com IA
    const prompt = `
Você é um coach de corrida especializado. Explique em português (pt-BR) por que um treino planejado foi substituído por um treino realizado.

TREINO PLANEJADO:
- Data: ${adjustment.plannedWorkout?.date}
- Tipo: ${adjustment.plannedWorkout?.type}
- Distância: ${adjustment.plannedWorkout?.distance}km
- Intensidade: ${adjustment.plannedWorkout?.intensity}

TREINO REALIZADO:
- Data: ${adjustment.completedWorkout?.date}
- Tipo: ${adjustment.completedWorkout?.type}
- Distância: ${adjustment.completedWorkout?.distance}km
- Pace: ${adjustment.completedWorkout?.avgPace}

SCORES ML:
- Match de Data: ${matchDecision?.dateScore || 0}%
- Match de Tipo: ${matchDecision?.typeScore || 0}%
- Match de Volume: ${matchDecision?.volumeScore || 0}%
- Match de Intensidade: ${matchDecision?.intensityScore || 0}%
- Confidence: ${matchDecision?.confidence || 0}%

Responda em JSON com esta estrutura:
{
  "summary": "Resumo em 2-3 frases do porquê deste ajuste",
  "reasons": [
    {
      "title": "Título curto",
      "description": "Explicação detalhada",
      "impact": "positive" | "neutral" | "negative"
    }
  ],
  "recommendation": "Recomendação final para o usuário"
}

Seja específico, educativo e motivador. Máximo 3 razões.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um coach de corrida especializado em treinos personalizados.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content || '{}');

    // Montar resposta completa
    const explanation = {
      summary: aiResponse.summary,
      reasons: aiResponse.reasons || [],
      mlFactors: {
        dateMatch: matchDecision?.dateScore || 0,
        typeMatch: matchDecision?.typeScore || 0,
        volumeMatch: matchDecision?.volumeScore || 0,
        intensityMatch: matchDecision?.intensityScore || 0,
      },
      recommendation: aiResponse.recommendation,
      confidence: matchDecision?.confidence || 0,
    };

    return NextResponse.json(explanation);
  } catch (error) {
    console.error('[API] /api/athera-flex/explain error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
