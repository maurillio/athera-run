import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { isPremiumUser } from '@/lib/premium-check';
import { callLLM } from '@/lib/llm-client';

export const dynamic = 'force-dynamic';

/**
 * API Premium: Análise Inteligente de Progresso
 * Analisa treinos completados, feedbacks e dados Strava para sugerir ajustes no plano
 * 
 * Retorna:
 * - FREE: Informa que existe análise disponível (upgrade prompt)
 * - PREMIUM: Análise completa + sugestões de ajuste
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        athleteProfile: {
          include: {
            customPlan: {
              include: {
                weeks: {
                  include: {
                    workouts: true
                  },
                  orderBy: {
                    weekNumber: 'desc'
                  },
                  take: 4
                }
              }
            }
          }
        }
      }
    });

    if (!user?.athleteProfile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    const isPremium = await isPremiumUser(user.id);

    if (!user.athleteProfile.hasCustomPlan || !user.athleteProfile.customPlan) {
      return NextResponse.json({
        hasSuggestion: false,
        message: 'Nenhum plano ativo para analisar'
      });
    }

    // 🎯 CORREÇÃO: Usar data de criação do plano como referência, não "30 dias atrás"
    // Se o plano foi criado hoje, não faz sentido buscar treinos de 30 dias atrás
    const planCreatedAt = user.athleteProfile.customPlan.createdAt;
    const referenceDate = new Date(Math.max(
      planCreatedAt.getTime(),
      new Date().getTime() - 30 * 24 * 60 * 60 * 1000 // 30 dias atrás
    ));

    const [workoutLogs, feedbacks] = await Promise.all([
      prisma.trainingLog.findMany({
        where: {
          athleteId: user.athleteProfile.id,
          date: { gte: referenceDate }
        },
        orderBy: { date: 'desc' }
      }),
      
      prisma.athleteFeedback.findMany({
        where: {
          userId: user.id,
          date: { gte: referenceDate }
        },
        orderBy: { date: 'desc' }
      })
    ]);

    const recentWeeks = user.athleteProfile.customPlan.weeks.slice(0, 4);
    const totalWorkoutsPlanned = recentWeeks.reduce((sum, week) => sum + week.workouts.length, 0);
    const totalWorkoutsCompleted = workoutLogs.filter(log => log.workoutCompleted === true).length;
    const completionRate = totalWorkoutsPlanned > 0 
      ? Math.round((totalWorkoutsCompleted / totalWorkoutsPlanned) * 100) 
      : 0;

    // 🎯 CORREÇÃO: Se o plano foi criado há menos de 7 dias, não sugerir análise ainda
    const daysSincePlanCreated = Math.floor(
      (new Date().getTime() - planCreatedAt.getTime()) / (24 * 60 * 60 * 1000)
    );
    
    const hasLowCompletion = completionRate < 70;
    const hasNegativeFeedback = feedbacks.some(f => f.type === 'fatiga' || f.type === 'dor');
    const hasRecentFeedback = feedbacks.length > 0;
    const hasSufficientData = workoutLogs.length >= 3 || feedbacks.length >= 2;

    // Só sugerir análise se:
    // 1. Plano tem pelo menos 7 dias (tempo para gerar dados significativos)
    // 2. OU tem dados suficientes E problemas detectados
    const shouldSuggestAnalysis = (
      daysSincePlanCreated >= 7 && hasSufficientData && (
        hasLowCompletion || 
        hasNegativeFeedback || 
        hasRecentFeedback
      )
    ) || (
      // OU se tem mais de 5 treinos completos e feedback negativo (independente do tempo)
      workoutLogs.length >= 5 && hasNegativeFeedback
    );

    if (!isPremium && shouldSuggestAnalysis) {
      return NextResponse.json({
        hasSuggestion: true,
        isPremiumFeature: true,
        completionRate,
        message: 'Identificamos oportunidades de otimização no seu plano baseado no seu progresso recente. Upgrade para Premium para receber análises e ajustes personalizados.',
        teaser: hasLowCompletion 
          ? 'Taxa de conclusão abaixo do ideal - podemos ajustar o volume.'
          : hasNegativeFeedback
          ? 'Detectamos sinais de fadiga - podemos otimizar a recuperação.'
          : 'Baseado no seu progresso, temos sugestões para melhorar seus resultados.'
      });
    }

    if (!isPremium) {
      return NextResponse.json({
        hasSuggestion: false,
        isPremiumFeature: true,
        message: 'Continue treinando e registrando feedbacks. Com o Premium, analisaremos automaticamente seu progresso.'
      });
    }

    console.log('[ANALYZE-PROGRESS] Usuário Premium - executando análise completa');

    const analysisPrompt = `Você é um treinador especialista analisando o progresso de um atleta.

## DADOS DO ATLETA

### Plano Atual
- Nível: ${user.athleteProfile.runningLevel}
- Distância objetivo: ${user.athleteProfile.goalDistance}
- Data da prova: ${user.athleteProfile.targetRaceDate?.toLocaleDateString('pt-BR')}
- VDOT atual: ${user.athleteProfile.currentVDOT || 'N/A'}

### Treinos Completados (últimos 30 dias)
Total: ${totalWorkoutsCompleted} de ${totalWorkoutsPlanned} (${completionRate}%)

### Relatos/Feedbacks Recentes
${workoutLogs.slice(0, 5).map(log => `
- ${new Date(log.date).toLocaleDateString('pt-BR')}: ${log.overallFeeling || 'N/A'}
  Energia: ${log.energyLevel || 'N/A'}/10 | Dificuldade: ${log.trainingDifficulty || 'N/A'}
  ${log.hasPain ? `⚠️ Dor: ${log.painDescription}` : ''}
  ${log.notes ? `Notas: ${log.notes}` : ''}
`).join('\n')}

### Feedbacks do Atleta
${feedbacks.length > 0 ? feedbacks.map(f => `- ${f.type}: ${f.message}`).join('\n') : 'Nenhum'}

Analise e responda em JSON:
{
  "needsAdjustment": boolean,
  "confidence": "high" | "medium" | "low",
  "suggestion": "string",
  "reasons": ["string"],
  "adjustmentType": "volume" | "intensity" | "recovery" | "none"
}`;

    const aiResponse = await callLLM({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Você é um treinador especialista.' },
        { role: 'user', content: analysisPrompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const analysis = JSON.parse(aiResponse);

    return NextResponse.json({
      hasSuggestion: analysis.needsAdjustment,
      isPremiumFeature: false,
      completionRate,
      ...analysis
    });

  } catch (error) {
    console.error('[ANALYZE-PROGRESS] Erro:', error);
    return NextResponse.json({
      error: 'Erro ao analisar progresso',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
