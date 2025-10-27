
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// POST - Chat com IA sobre treinamento
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { message, conversationHistory } = await request.json();

    // Buscar perfil do atleta e contexto
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: user.id },
      include: {
        customPlan: {
          include: {
            weeks: {
              where: {
                startDate: {
                  lte: new Date()
                },
                endDate: {
                  gte: new Date()
                }
              },
              include: {
                workouts: true
              }
            }
          }
        },
        trainingLogs: {
          orderBy: { date: 'desc' },
          take: 7
        },
        raceGoals: {
          orderBy: { raceDate: 'asc' },
          take: 5
        }
      }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }
    
    // Preparar contexto completo para a IA
    const contextData = {
      athlete: {
        name: user.name,
        level: profile.runningLevel,
        age: profile.age,
        weight: profile.weight,
        height: profile.height,
        injuries: profile.injuries,
        medicalConditions: profile.medicalConditions,
        medications: profile.medications,
        restrictions: profile.physicalRestrictions,
        weeklyAvailability: profile.weeklyAvailability
      },
      currentPlan: profile.customPlan ? {
        goalDistance: profile.customPlan.goalDistance,
        targetDate: profile.customPlan.targetRaceDate,
        currentWeek: profile.customPlan.currentWeek,
        totalWeeks: profile.customPlan.totalWeeks,
        thisWeekWorkouts: profile.customPlan.weeks[0]?.workouts.map((w: any) => ({
          date: w.date,
          type: w.type,
          title: w.title,
          distance: w.distance,
          completed: w.isCompleted
        }))
      } : null,
      recentPerformance: profile.trainingLogs.map((log: any) => ({
        date: log.date,
        feeling: log.overallFeeling,
        energy: log.energyLevel,
        completed: log.workoutCompleted,
        hasPain: log.hasPain,
        hasInjury: log.hasInjury
      })),
      raceGoals: profile.raceGoals.map((goal: any) => ({
        event: goal.eventName,
        distance: goal.distance,
        date: goal.raceDate,
        targetTime: goal.targetTime
      }))
    };

    // Preparar mensagens para a IA
    const messages = [
      {
        role: 'system',
        content: `Você é um treinador de corrida experiente e amigável. Ajude o atleta com suas dúvidas sobre treinamento, nutrição, recuperação e preparação para provas.

CONTEXTO DO ATLETA:
${JSON.stringify(contextData, null, 2)}

DIRETRIZES:
1. Seja amigável, encorajador e empático
2. Use o contexto do atleta para personalizar suas respostas
3. Dê respostas práticas e acionáveis
4. Se a pergunta for sobre ajuste de treino, sugira falar com análise automática
5. Mencione condições médicas quando relevante
6. Seja conciso (máximo 200 palavras)
7. Use emojis apropriados para tornar mais amigável
8. Responda em português brasileiro

TIPOS DE PERGUNTAS COMUNS:
- Dúvidas sobre técnica de corrida
- Como lidar com dores e desconfortos
- Dicas de nutrição e hidratação
- Estratégias para dia de prova
- Recuperação e descanso
- Motivação e aspectos mentais
- Equipamentos e calçados
- Como interpretar ritmos de treino`
      },
      ...(conversationHistory || []),
      {
        role: 'user',
        content: message
      }
    ];

    // Chamar IA
    const aiResponse = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages,
        max_tokens: 500,
        temperature: 0.8
      })
    });

    if (!aiResponse.ok) {
      throw new Error('Erro ao chamar API de IA');
    }

    const aiData = await aiResponse.json();
    const response = aiData.choices[0].message.content;

    return NextResponse.json({ 
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json({ error: 'Erro ao processar mensagem' }, { status: 500 });
  }
}
