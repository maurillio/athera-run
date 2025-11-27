
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { callLLM } from '@/lib/llm-client';

// POST - Analisar últimos logs e sugerir/aplicar ajustes automaticamente
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { daysToAnalyze = 7, autoApply = false } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        athleteProfile: {
          include: {
            trainingLogs: {
              where: {
                date: {
                  gte: new Date(Date.now() - daysToAnalyze * 24 * 60 * 60 * 1000)
                }
              },
              orderBy: { date: 'desc' }
            },
            customPlan: {
              include: {
                weeks: {
                  where: {
                    startDate: {
                      gte: new Date()
                    }
                  },
                  orderBy: {
                    weekNumber: 'asc'
                  },
                  take: 2
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

    const profile = user.athleteProfile;
    const logs = profile.trainingLogs;

    // VERIFICAÇÃO: Se o plano foi criado há menos de 7 dias, NÃO sugerir ajustes
    // É NORMAL não ter muitos treinos completados logo após criar o plano!
    if (profile.customPlan?.createdAt) {
      const daysSincePlanCreated = (Date.now() - profile.customPlan.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSincePlanCreated < 7) {
        console.log(`[ANALYZE] Plano muito recente (${Math.floor(daysSincePlanCreated)} dias). Retornando análise positiva.`);
        
        return NextResponse.json({
          analysis: {
            id: Date.now(),
            needsAdjustment: false,
            adjustmentType: null,
            reason: `Seu plano está perfeito! Foi criado há apenas ${Math.floor(daysSincePlanCreated)} dias. Continue seguindo as orientações do plano. 💪`,
            severity: 'low',
            summary: `✅ Plano em andamento - Continue firme! Você começou há poucos dias, é normal estar se adaptando à rotina.`
          },
          adjustmentApplied: false,
          message: 'Plano recente - continue assim!'
        });
      }
    }

    if (logs.length === 0) {
      return NextResponse.json({ 
        message: 'Sem dados suficientes para análise',
        needsAdjustment: false
      });
    }

    // Preparar contexto para IA
    const contextSummary = {
      athleteLevel: profile.runningLevel,
      injuries: profile.injuries,
      medicalConditions: profile.medicalConditions,
      recentLogs: logs.map(log => ({
        date: log.date,
        workoutCompleted: log.workoutCompleted,
        overallFeeling: log.overallFeeling,
        energyLevel: log.energyLevel,
        sleepQuality: log.sleepQuality,
        stressLevel: log.stressLevel,
        motivationLevel: log.motivationLevel,
        hasPain: log.hasPain,
        painDescription: log.painDescription,
        hasInjury: log.hasInjury,
        injuryDescription: log.injuryDescription,
        hasIllness: log.hasIllness,
        illnessDescription: log.illnessDescription,
        trainingDifficulty: log.trainingDifficulty,
        perceivedEffort: log.perceivedEffort,
        notes: log.notes
      })),
      upcomingPlan: profile.customPlan ? {
        hasCustomPlan: true,
        currentWeek: profile.customPlan.currentWeek,
        totalWeeks: profile.customPlan.totalWeeks
      } : { hasCustomPlan: false }
    };

    // Chamar IA para análise profunda
    const aiResponseText = await callLLM({
      messages: [{
        role: 'system',
        content: `Você é um treinador de corrida experiente. Analise os últimos ${daysToAnalyze} dias de treino do atleta e determine se o plano precisa de ajustes.

CRITÉRIOS DE ATENÇÃO:
1. Múltiplos dias de baixa energia (≤4/10) ou sensação ruim
2. Dores ou lesões recorrentes
3. Alta taxa de treinos não completados
4. Sinais de overtraining (sono ruim + stress alto + energia baixa)
5. Doença ou lesão ativa
6. Esforço percebido consistentemente alto (≥8/10) em treinos leves

TIPOS DE AJUSTE:
- reduce_volume: Reduzir 25% do volume se fadiga persistente sem lesão
- increase_rest: Mais dias de recuperação se cansaço acumulado
- skip_intensity: Remover treinos intensos se sinais de overtraining ou dor
- full_rest: Semana completa de descanso se lesão ou doença ativa

Responda APENAS com este formato JSON:
{
  "needsAdjustment": true/false,
  "adjustmentType": "reduce_volume" | "increase_rest" | "skip_intensity" | "full_rest" | null,
  "reason": "explicação breve em 1-2 frases",
  "severity": "low" | "medium" | "high",
  "summary": "resumo da análise em 2-3 frases"
}`
      }, {
        role: 'user',
        content: `Analise estes dados:

${JSON.stringify(contextSummary, null, 2)}

Determine se o plano precisa de ajustes e qual tipo.`
      }],
      max_tokens: 600,
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(aiResponseText);

    // Criar registro da análise
    const aiAnalysisRecord = await prisma.aIAnalysis.create({
      data: {
        athleteId: profile.id,
        analysisType: 'period_review',
        startDate: new Date(Date.now() - daysToAnalyze * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        summary: analysis.summary,
        insights: `Análise automática de ${daysToAnalyze} dias de treino.`,
        recommendations: analysis.needsAdjustment 
          ? `Ajuste recomendado: ${analysis.adjustmentType}\nMotivo: ${analysis.reason}`
          : 'Nenhum ajuste necessário no momento.',
        metrics: {
          daysAnalyzed: daysToAnalyze,
          logsCount: logs.length,
          needsAdjustment: analysis.needsAdjustment,
          adjustmentType: analysis.adjustmentType,
          severity: analysis.severity
        },
        hasAlerts: analysis.needsAdjustment,
        alerts: analysis.needsAdjustment ? `Ajuste recomendado: ${analysis.adjustmentType}` : null
      }
    });

    // Se autoApply estiver ativado E houver necessidade de ajuste, aplicar automaticamente
    let adjustmentResult = null;
    if (autoApply && analysis.needsAdjustment && analysis.adjustmentType && profile.customPlan) {
      const adjustResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/plan/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('Cookie') || ''
        },
        body: JSON.stringify({
          reason: analysis.reason,
          adjustmentType: analysis.adjustmentType
        })
      });

      if (adjustResponse.ok) {
        adjustmentResult = await adjustResponse.json();
      }
    }

    return NextResponse.json({ 
      analysis: {
        id: aiAnalysisRecord.id,
        needsAdjustment: analysis.needsAdjustment,
        adjustmentType: analysis.adjustmentType,
        reason: analysis.reason,
        severity: analysis.severity,
        summary: analysis.summary
      },
      adjustmentApplied: autoApply && adjustmentResult ? true : false,
      adjustmentResult
    });
  } catch (error) {
    console.error('Error in analyze and adjust:', error);
    return NextResponse.json({ error: 'Erro ao analisar dados' }, { status: 500 });
  }
}
