import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/ai/chat
 * Chat contextual com a IA sobre o plano de treino
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { message, context, history } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }

    // Gerar resposta contextual
    const reply = await generateContextualReply(message, context, history);

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error: any) {
    console.error('[AI CHAT] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar chat' },
      { status: 500 }
    );
  }
}

async function generateContextualReply(
  message: string,
  context: any,
  history: any[]
): Promise<string> {
  const lowerMessage = message.toLowerCase();

  // Detectar tipo de pergunta e responder contextualmente
  
  // Pergunta sobre longão
  if (lowerMessage.includes('longão') || lowerMessage.includes('longo')) {
    const longestRun = context?.longestRun || 12;
    const goalDistance = context?.goalDistance || '21';
    
    return `Ótima pergunta! 🏃‍♂️

Seu longão atual está baseado em:

📊 **Análise:**
• Seu maior longão recente: ${longestRun}km
• Meta: ${goalDistance}km
• Regra dos 10%: Aumento gradual seguro

📈 **Progressão Planejada:**
O longão aumenta progressivamente ao longo das semanas, respeitando seu corpo e evitando lesões. Cada semana adiciona 10% de distância até atingir 90% da distância meta.

${context?.injuries?.length > 0 ? '⚠️ Como você tem histórico de lesões, a progressão será ainda mais conservadora.' : '✅ Sem lesões recentes, podemos progredir de forma segura.'}

💡 **Dica:** O longão treina resistência aeróbica e adaptações musculares específicas para sua meta!

Posso ajustar se achar necessário. O que você pensa?`;
  }

  // Pergunta sobre VDOT
  if (lowerMessage.includes('vdot') || lowerMessage.includes('ritmo')) {
    const vdot = context?.currentVDOT || 45;
    const bestTimes = context?.bestTimes || {};
    
    return `Excelente pergunta sobre VDOT! 📊

🎯 **Seu VDOT: ${vdot}**

${Object.keys(bestTimes).length > 0 ? `Calculei baseado nos seus melhores tempos:
${Object.entries(bestTimes).map(([dist, time]) => `• ${dist}: ${time}`).join('\n')}` : 'Como ainda não tenho seus recordes, usei valores conservadores.'}

📏 **O que é VDOT?**
É um número que representa sua capacidade aeróbica. Quanto maior, melhor sua forma!

⚙️ **Como uso no seu plano:**
• Define ritmos de treino personalizados
• Calcula zonas de intensidade
• Ajusta conforme você evolui

💪 **Seus Ritmos Atuais:**
• Easy: Recuperação ativa
• Marathon: Ritmo de prova
• Threshold: Limiar anaeróbico
• Interval: Treino de velocidade

Quer saber mais sobre algum ritmo específico?`;
  }

  // Pergunta sobre intervalados
  if (lowerMessage.includes('intervalo') || lowerMessage.includes('rápido') || lowerMessage.includes('velocidade')) {
    return `Treinos intervalados! 🔥

💨 **Por que são importantes:**
• Melhoram VO2 máx (capacidade aeróbica máxima)
• Aumentam economia de corrida
• Treinam sistema anaeróbico
• Preparam para ritmos de prova

📋 **Como estruturo:**
• Aquecimento: 10-15min leve
• Repetições: 400m-1km em ritmo rápido
• Recuperação: Trote leve entre séries
• Desaquecimento: 10min leve

${context?.hasTrackAccess ? '🏃 Como você tem acesso à pista, vai poder fazer com precisão!' : '🛣️ Pode fazer na rua, marcando distância com app GPS.'}

${context?.runningLevel === 'beginner' ? '🔰 Como iniciante, começaremos com poucos intervalos e progrediremos gradualmente.' : '💪 Seu nível permite treinos intervalados mais intensos!'}

Alguma dúvida específica sobre como executar?`;
  }

  // Pergunta sobre progressão
  if (lowerMessage.includes('progressão') || lowerMessage.includes('semana')) {
    const weeks = calculateWeeks(context?.targetRaceDate);
    
    return `Sobre a progressão do plano! 📈

⏱️ **Duração:** ${weeks} semanas até sua prova

📊 **Estrutura das Fases:**

**Fase 1: Base (${Math.floor(weeks * 0.4)} semanas)**
• Construir volume aeróbico
• Fortalecer estrutura musculoesquelética
• Ritmos fáceis e longões progressivos

**Fase 2: Construção (${Math.floor(weeks * 0.35)} semanas)**
• Adicionar treinos de qualidade
• Intervalados e ritmo de prova
• Pico de quilometragem

**Fase 3: Afinamento (${Math.floor(weeks * 0.25)} semanas)**
• Reduzir volume, manter intensidade
• Recuperação otimizada
• Preparar para o dia da prova

${context?.injuries?.length > 0 ? '⚠️ Progressão ajustada pelo seu histórico de lesões - segurança primeiro!' : '✅ Progressão agressiva mas segura!'}

Quer detalhes de alguma fase específica?`;
  }

  // Pergunta sobre descanso
  if (lowerMessage.includes('descanso') || lowerMessage.includes('recuperação') || lowerMessage.includes('folga')) {
    return `Descanso é treino! 💤

🔬 **Por que é crítico:**
• Adaptações acontecem no descanso, não durante o treino
• Previne overtraining e lesões
• Restaura glicogênio muscular
• Repara microlesões musculares

${context?.sleepQuality ? `😴 Você relatou qualidade de sono ${context.sleepQuality}/5. ${context.sleepQuality >= 4 ? 'Excelente! Vai recuperar bem.' : 'Tente melhorar o sono para melhor recuperação.'}` : ''}

📅 **No seu plano:**
• Dias de descanso completo programados
• Dias de recuperação ativa (corrida leve)
• Semanas de redução de carga a cada 3-4 semanas

${context?.stressLevel >= 4 ? '⚠️ Seu nível de estresse está alto. Descanso é ainda mais importante!' : ''}

💡 **Dica:** Se sentir fadiga excessiva, não hesite em pular um treino e descansar!

Alguma dúvida sobre recuperação?`;
  }

  // Pergunta sobre frequência cardíaca
  if (lowerMessage.includes('frequência') || lowerMessage.includes('fc') || lowerMessage.includes('coração') || lowerMessage.includes('cardíaco')) {
    const restingHR = context?.restingHeartRate;
    const maxHR = context?.maxHeartRate || (context?.age ? 220 - context.age : 190);
    
    let hrInfo = '';
    if (restingHR) {
      const hrLevel = restingHR < 60 ? '(Excelente! Bem condicionado)' : restingHR < 70 ? '(Bom condicionamento)' : '(Pode melhorar com treino)';
      hrInfo = `📊 **Seus dados:**\n• FC Repouso: ${restingHR}bpm ${hrLevel}\n• FC Máxima: ~${maxHR}bpm`;
    } else {
      hrInfo = `📊 **Estimativa:**\n• FC Máxima: ~${maxHR}bpm (baseado na idade)`;
    }
    
    return `Sobre Frequência Cardíaca! ❤️

${hrInfo}

🎯 **Zonas de Treino:**
• Zona 1 (50-60%): Recuperação ativa
• Zona 2 (60-70%): Base aeróbica
• Zona 3 (70-80%): Ritmo de prova
• Zona 4 (80-90%): Limiar anaeróbico
• Zona 5 (90-100%): VO2 máx

⚙️ **Como uso no plano:**
Cada treino tem uma zona alvo. Isso garante intensidade correta e adaptações específicas.

${!restingHR ? '💡 **Sugestão:** Adicione sua FC em repouso (meça ao acordar) para zonas mais precisas!' : ''}

Quer entender melhor alguma zona?`;
  }

  // Resposta genérica inteligente
  return `Ótima pergunta! 🤔

Estou aqui para te ajudar a entender cada aspecto do seu plano de treino.

📋 **Posso te explicar sobre:**
• Por que cada treino tem aquela distância ou ritmo
• Como calculei seu VDOT e zonas de treino
• Estratégia de progressão semana a semana
• Importância de cada tipo de treino
• Como adaptei ao seu nível e disponibilidade

${context?.goalDistance && context?.targetRaceDate ? `🎯 Lembre-se: Seu plano foi criado especialmente para você atingir ${context.goalDistance} em ${new Date(context.targetRaceDate).toLocaleDateString('pt-BR')}!` : ''}

Pode reformular sua pergunta ou escolher um dos tópicos acima?`;
}

function calculateWeeks(raceDate?: string): number {
  if (!raceDate) return 16;
  const today = new Date();
  const race = new Date(raceDate);
  const diffTime = race.getTime() - today.getTime();
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7)));
}
