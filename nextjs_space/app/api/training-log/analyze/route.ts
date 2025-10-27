
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// POST - Analisar relato com IA
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { logId } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        athleteProfile: {
          include: {
            trainingLogs: {
              where: { id: logId },
              take: 1
            }
          }
        }
      }
    });

    if (!user?.athleteProfile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    const log = user.athleteProfile.trainingLogs[0];
    if (!log) {
      return NextResponse.json({ error: 'Relato não encontrado' }, { status: 404 });
    }

    // Buscar últimos 7 relatos para contexto
    const recentLogs = await prisma.trainingLog.findMany({
      where: { athleteId: user.athleteProfile.id },
      orderBy: { date: 'desc' },
      take: 7
    });

    // Preparar contexto para a IA
    const context = {
      currentLog: log,
      recentHistory: recentLogs.map(l => ({
        date: l.date,
        feeling: l.overallFeeling,
        energyLevel: l.energyLevel,
        hasPain: l.hasPain,
        hasInjury: l.hasInjury,
        hasIllness: l.hasIllness,
        workoutCompleted: l.workoutCompleted
      })),
      athleteProfile: {
        runningLevel: user.athleteProfile.runningLevel,
        injuries: user.athleteProfile.injuries,
        medicalConditions: user.athleteProfile.medicalConditions,
      }
    };

    // Chamar IA para análise
    const aiResponse = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [{
          role: 'system',
          content: `Você é um treinador experiente de corrida. Analise o relato diário do atleta e forneça:
1. Uma análise breve do estado atual (2-3 frases)
2. Alertas se houver sinais de overtraining, lesão ou fadiga excessiva
3. Recomendações específicas (descanso, ajuste de treinos, etc)
4. Nível de atenção necessária: "low", "medium", "high"

Seja conciso, empático e prático. Formato da resposta:

ANÁLISE:
[sua análise aqui]

ALERTAS:
[alertas se houver, ou "Nenhum alerta no momento"]

RECOMENDAÇÕES:
[suas recomendações específicas]

ATENÇÃO: [low/medium/high]`
        }, {
          role: 'user',
          content: `Contexto do atleta:
- Nível: ${context.athleteProfile.runningLevel}
- Lesões conhecidas: ${context.athleteProfile.injuries ? JSON.stringify(context.athleteProfile.injuries) : 'Nenhuma registrada'}
- Condições médicas: ${context.athleteProfile.medicalConditions || 'Nenhuma registrada'}

Histórico recente (últimos 7 dias):
${context.recentHistory.map((h, i) => `Dia ${i+1}: Sensação ${h.feeling}, Energia ${h.energyLevel}/10, Dor: ${h.hasPain ? 'Sim' : 'Não'}, Treino: ${h.workoutCompleted ? 'Completado' : 'Não completado'}`).join('\n')}

Relato de hoje:
- Data: ${log.date}
- Treino completado: ${log.workoutCompleted ? 'Sim' : 'Não'}
- Sensação geral: ${log.overallFeeling || 'Não informado'}
- Energia: ${log.energyLevel || 'N/A'}/10
- Qualidade do sono: ${log.sleepQuality || 'N/A'}/10
- Nível de estresse: ${log.stressLevel || 'N/A'}/10
- Motivação: ${log.motivationLevel || 'N/A'}/10
- Dificuldade do treino: ${log.trainingDifficulty || 'N/A'}
- Esforço percebido: ${log.perceivedEffort || 'N/A'}/10
- Tem dor: ${log.hasPain ? 'Sim - ' + log.painDescription : 'Não'}
- Tem lesão: ${log.hasInjury ? 'Sim - ' + log.injuryDescription : 'Não'}
- Tem doença: ${log.hasIllness ? 'Sim - ' + log.illnessDescription : 'Não'}
- Notas: ${log.notes || 'Nenhuma nota adicional'}

Analise este relato e forneça sua avaliação.`
        }],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!aiResponse.ok) {
      throw new Error('Erro ao chamar API de IA');
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0].message.content;

    // Parse da resposta
    const attentionMatch = analysisText.match(/ATENÇÃO:\s*(low|medium|high)/i);
    const attentionLevel = attentionMatch ? attentionMatch[1].toLowerCase() : 'low';
    
    const requiresAttention = attentionLevel === 'high';
    
    // Extrair alertas se houver
    const alertsSection = analysisText.match(/ALERTAS:(.*?)(?=RECOMENDAÇÕES:|$)/s);
    const hasAlerts = alertsSection && !alertsSection[1].toLowerCase().includes('nenhum');

    const alerts = hasAlerts ? [{
      type: 'attention_required',
      severity: attentionLevel,
      message: alertsSection[1].trim()
    }] : [];

    // Atualizar relato com análise
    const updatedLog = await prisma.trainingLog.update({
      where: { id: logId },
      data: {
        analyzed: true,
        aiAnalysis: analysisText,
        aiAlerts: alerts,
        requiresAttention
      }
    });

    return NextResponse.json({ 
      log: updatedLog,
      analysis: analysisText,
      requiresAttention
    });
  } catch (error) {
    console.error('Error analyzing training log:', error);
    return NextResponse.json({ error: 'Erro ao analisar relato' }, { status: 500 });
  }
}
