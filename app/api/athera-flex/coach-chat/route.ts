/**
 * API: Flex Coach Chat
 * Chat conversacional com IA coach personalizado
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, messages } = await request.json();

    // Buscar contexto do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        raceGoals: {
          where: { isActive: true },
          take: 1,
        },
        completedWorkouts: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Buscar ajustes recentes
    const recentAdjustments = await prisma.workoutAdjustment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        plannedWorkout: true,
        completedWorkout: true,
      },
    });

    // Montar contexto para a IA
    const userContext = `
CONTEXTO DO ATLETA:
Nome: ${user.name}
Nível: ${user.profile?.experienceLevel || 'Iniciante'}
Objetivo: ${user.raceGoals[0]?.distance || 'Não definido'}km em ${user.raceGoals[0]?.raceDate ? new Date(user.raceGoals[0].raceDate).toLocaleDateString('pt-BR') : 'data não definida'}

TREINOS RECENTES (últimos 10):
${user.completedWorkouts.map(w => `- ${new Date(w.date).toLocaleDateString('pt-BR')}: ${w.type}, ${w.distance}km, pace ${w.avgPace || 'N/A'}`).join('\n')}

AJUSTES RECENTES (últimos 5):
${recentAdjustments.map((adj, idx) => `${idx + 1}. ${adj.status} - Confiança: ${adj.confidence}% - Tipo: ${adj.type}`).join('\n')}

SISTEMA ATHERA FLEX:
- Auto-matching inteligente de treinos Strava
- ML com 4 modelos (UserPatternLearner, WorkoutMatcher, ReschedulePredictor, VolumeAdjuster)
- Confidence threshold: ≥85% auto-aplica, 60-84% revisão manual
- Context awareness: clima, energia, recovery
- Notificações multicanal (email, push, in-app)
`;

    const systemPrompt = `Você é um coach de corrida virtual do Athera Run, especializado em treinos personalizados e sistema Athera Flex.

PERSONALIDADE:
- Amigável, motivador e educativo
- Use linguagem descontraída mas profissional
- Seja específico e técnico quando necessário
- Use emojis ocasionalmente 🏃‍♂️💪
- Sempre em português do Brasil

DIRETRIZES:
1. Responda de forma concisa (máx 4-5 linhas)
2. Seja específico aos dados do atleta
3. Explique conceitos de forma simples
4. Dê dicas práticas e acionáveis
5. Se não tiver certeza, seja honesto

${userContext}

Ajude o atleta a entender seus treinos, ajustes e melhorar sua performance!`;

    // Chamar OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.8,
      max_tokens: 300,
    });

    const assistantMessage = completion.choices[0].message.content;

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error('[API] /api/athera-flex/coach-chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
