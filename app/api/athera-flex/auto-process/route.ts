import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { MLService } from '@/lib/athera-flex/ml/ml-service';
import { AdjustmentEngine } from '@/lib/athera-flex/core/adjustment-engine';

// Background job que processa automaticamente matches de alta confiança
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se usuário é premium
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        subscriptionStatus: true,
        trainingPlan: {
          select: { id: true }
        }
      }
    });

    if (user?.subscriptionStatus !== 'active') {
      return NextResponse.json(
        { error: 'Premium feature - upgrade required', premium: true },
        { status: 403 }
      );
    }

    // Buscar configurações
    const flexSettings = await prisma.userFlexSettings.findUnique({
      where: { userId: session.user.id }
    });

    if (!flexSettings?.enabled || !flexSettings?.autoProcess) {
      return NextResponse.json(
        { error: 'Auto-process not enabled' },
        { status: 403 }
      );
    }

    // Buscar matches pendentes de alta confiança
    const highConfidenceMatches = await prisma.workoutMatchDecision.findMany({
      where: {
        userId: session.user.id,
        status: 'pending',
        confidence: {
          gte: flexSettings.autoAcceptThreshold
        },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // últimas 24h
        }
      },
      include: {
        plannedWorkout: true,
        executedWorkout: true
      },
      orderBy: {
        confidence: 'desc'
      }
    });

    const processed: any[] = [];
    const engine = new AdjustmentEngine();

    for (const match of highConfidenceMatches) {
      try {
        // Aplicar decisão automática
        const result = await engine.applyDecision(
          session.user.id,
          match.id,
          'accept',
          {
            volumeChange: match.volumeDifference || 0
          }
        );

        // Atualizar match
        await prisma.workoutMatchDecision.update({
          where: { id: match.id },
          data: {
            status: 'accepted',
            userDecision: 'accept',
            decidedAt: new Date()
          }
        });

        // Criar adjustment
        await prisma.workoutAdjustment.create({
          data: {
            userId: session.user.id,
            plannedWorkoutId: match.plannedWorkoutId,
            executedWorkoutId: match.executedWorkoutId,
            adjustmentType: 'reschedule',
            volumeAdjustment: match.volumeDifference || 0,
            reason: match.suggestedReason || 'Auto-accepted by AI',
            confidence: match.confidence,
            wasAutomatic: true,
            userConfirmed: false
          }
        });

        // Marcar planejado como completo
        await prisma.customWorkout.update({
          where: { id: match.plannedWorkoutId },
          data: {
            completed: true,
            executedWorkoutId: match.executedWorkoutId,
            wasRescheduled: true,
            rescheduledBy: 'auto',
            rescheduledReason: match.suggestedReason
          }
        });

        // Registrar padrão (ML learning)
        await prisma.userDecisionPattern.create({
          data: {
            userId: session.user.id,
            workoutType: match.plannedWorkout.type,
            suggestedConfidence: match.confidence,
            userDecision: 'accept',
            timeDifference: Math.abs(
              new Date(match.executedWorkout.startDate).getTime() - 
              new Date(match.plannedWorkout.scheduledDate).getTime()
            ) / (1000 * 60 * 60 * 24),
            volumeDifference: match.volumeDifference || 0
          }
        });

        processed.push({
          matchId: match.id,
          plannedWorkout: match.plannedWorkout.type,
          confidence: match.confidence,
          result: 'accepted'
        });

      } catch (error) {
        console.error(`Error processing match ${match.id}:`, error);
        processed.push({
          matchId: match.id,
          result: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Enviar notificação se processou algo
    if (processed.length > 0 && flexSettings.notifyOnAutoAccept) {
      // TODO: Implementar notificação (email/push)
      console.log(`Auto-processed ${processed.length} matches for user ${session.user.id}`);
    }

    return NextResponse.json({
      processed: processed.length,
      details: processed
    }, { status: 200 });

  } catch (error) {
    console.error('Error auto-processing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
