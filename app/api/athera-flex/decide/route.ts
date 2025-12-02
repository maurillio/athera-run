import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AdjustmentEngine } from '@/lib/athera-flex/core/adjustment-engine';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { matchId, decision, adjustments } = await request.json();

    if (!matchId || !decision) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verificar se usuário é premium
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionStatus: true }
    });

    if (user?.subscriptionStatus !== 'active') {
      return NextResponse.json(
        { error: 'Premium feature - upgrade required', premium: true },
        { status: 403 }
      );
    }

    // Buscar match decision pendente
    const match = await prisma.workoutMatchDecision.findUnique({
      where: { id: matchId },
      include: {
        plannedWorkout: true,
        executedWorkout: true
      }
    });

    if (!match || match.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    if (match.status !== 'pending') {
      return NextResponse.json(
        { error: 'Match already processed' },
        { status: 400 }
      );
    }

    // Aplicar decisão
    const engine = new AdjustmentEngine();
    const result = await engine.applyDecision(
      session.user.id,
      matchId,
      decision,
      adjustments
    );

    // Atualizar match decision
    await prisma.workoutMatchDecision.update({
      where: { id: matchId },
      data: {
        status: decision === 'accept' ? 'accepted' : 'rejected',
        userDecision: decision,
        decidedAt: new Date()
      }
    });

    // Se aceito, criar workout adjustment
    if (decision === 'accept') {
      await prisma.workoutAdjustment.create({
        data: {
          userId: session.user.id,
          plannedWorkoutId: match.plannedWorkoutId,
          executedWorkoutId: match.executedWorkoutId,
          adjustmentType: 'reschedule',
          volumeAdjustment: adjustments?.volumeChange || 0,
          reason: match.suggestedReason || 'User accepted match',
          confidence: match.confidence,
          wasAutomatic: false,
          userConfirmed: true
        }
      });

      // Marcar treino planejado como completo
      await prisma.customWorkout.update({
        where: { id: match.plannedWorkoutId },
        data: {
          completed: true,
          executedWorkoutId: match.executedWorkoutId,
          wasRescheduled: match.originalDate ? true : false,
          rescheduledBy: 'user',
          rescheduledReason: match.suggestedReason
        }
      });
    }

    // Registrar padrão de decisão do usuário (ML learning)
    await prisma.userDecisionPattern.create({
      data: {
        userId: session.user.id,
        workoutType: match.plannedWorkout.type,
        suggestedConfidence: match.confidence,
        userDecision: decision,
        timeDifference: Math.abs(
          new Date(match.executedWorkout.startDate).getTime() - 
          new Date(match.plannedWorkout.scheduledDate).getTime()
        ) / (1000 * 60 * 60 * 24), // dias
        volumeDifference: match.volumeDifference || 0
      }
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Error processing decision:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
