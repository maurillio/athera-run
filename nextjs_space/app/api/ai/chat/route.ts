
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { callLLM } from '@/lib/llm-client';

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
        content: `Você é um treinador de corrida especializado. Você responde APENAS a perguntas sobre:
1. Corrida e treinamento (técnica, ritmos, treinos específicos, etc)
2. Dados pessoais do atleta (seu histórico, plano, lesões, condições médicas, objetivos)

CONTEXTO DO ATLETA:
${JSON.stringify(contextData, null, 2)}

ESCOPO PERMITIDO:
✓ Técnica de corrida
✓ Interpretação de treinos (fartlek, intervalado, longo, etc)
✓ Nutrição e hidratação para CORRIDA
✓ Recuperação e descanso
✓ Prevenção e manejo de lesões em corredores
✓ Estratégia de prova
✓ Equipamentos de corrida
✓ Motivação e aspectos mentais do treinamento
✓ Perguntas sobre o histórico e dados pessoais do atleta
✓ Interpretação do plano de treinamento do atleta

TÓPICOS NÃO PERMITIDOS:
✗ Política, religião, história geral
✗ Medicina geral (não relacionada a corrida)
✗ Assuntos pessoais ou financeiros
✗ Qualquer tópico que não seja corrida ou dados pessoais do atleta

INSTRUÇÕES:
1. Se a pergunta for sobre corrida ou dados pessoais, responda com entusiasmo e personalização
2. Se a pergunta for fora do escopo, responda educadamente: "Desculpe, sou especialista apenas em corrida e seu treinamento pessoal. Como posso ajudar com sua preparação para ${profile?.customPlan?.goalDistance}km?"
3. Use o contexto do atleta para personalizar respostas sempre que possível
4. Seja amigável, encorajador e empático
5. Dê respostas práticas e acionáveis
6. Mencione condições médicas quando relevante
7. Seja conciso (máximo 200 palavras)
8. Use emojis apropriados para tornar mais amigável
9. Responda em português brasileiro`
      },
      ...(conversationHistory || []),
      {
        role: 'user',
        content: message
      }
    ];

    // Chamar IA
    const response = await callLLM({
      messages,
      max_tokens: 500,
      temperature: 0.8
    });

    return NextResponse.json({ 
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json({ error: 'Erro ao processar mensagem' }, { status: 500 });
  }
}
