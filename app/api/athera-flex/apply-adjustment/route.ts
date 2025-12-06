/**
 * ATHERA FLEX v3.3.0 - Apply Adjustment API
 * POST - Aplica ajuste e marca treino planejado como completo
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { adjustmentEngine } from '@/lib/athera-flex/adjustment-engine';

export const dynamic = 'force-dynamic';

// ============================================================================
// POST - Aplicar ajuste
// ============================================================================

export async function POST(req: Request) {
  try {
    console.log('[apply-adjustment] ========== REQUEST RECEIVED ==========');
    
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      console.log('[apply-adjustment] ❌ Unauthorized: No session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[apply-adjustment] User email:', session.user.email);

    const body = await req.json();
    console.log('[apply-adjustment] Request body:', body);
    
    const {
      completedWorkoutId,
      plannedWorkoutId,
      confidence,
      dateScore,
      typeScore,
      volumeScore,
      intensityScore,
      triggeredBy = 'athlete_manual',
      reason,
    } = body;

    // Validações
    if (!completedWorkoutId || !plannedWorkoutId) {
      console.log('[apply-adjustment] ❌ Missing fields');
      return NextResponse.json(
        { error: 'Missing required fields: completedWorkoutId, plannedWorkoutId' },
        { status: 400 }
      );
    }

    console.log('[apply-adjustment] Applying match:');
    console.log(`  - Completed Workout ID: ${completedWorkoutId}`);
    console.log(`  - Planned Workout ID: ${plannedWorkoutId}`);
    console.log(`  - Confidence: ${confidence}%`);
    console.log(`  - Triggered by: ${triggeredBy}`);

    if (confidence < 0 || confidence > 100) {
      return NextResponse.json(
        { error: 'Confidence must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (!['athlete_manual', 'ai_suggestion', 'ai_auto', 'coach'].includes(triggeredBy)) {
      return NextResponse.json(
        { error: 'Invalid triggeredBy value' },
        { status: 400 }
      );
    }

    // Buscar user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, isPremium: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verificar se treino completado pertence ao usuário
    const completedWorkout = await prisma.completedWorkout.findUnique({
      where: { id: completedWorkoutId },
      include: {
        athlete: {
          select: { userId: true },
        },
      },
    });

    if (!completedWorkout) {
      return NextResponse.json(
        { error: 'Completed workout not found' },
        { status: 404 }
      );
    }

    if (completedWorkout.athlete.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: workout does not belong to user' },
        { status: 403 }
      );
    }

    // Verificar se treino planejado pertence ao usuário
    const plannedWorkout = await prisma.customWorkout.findUnique({
      where: { id: plannedWorkoutId },
      include: {
        week: {
          include: {
            plan: {
              include: {
                athleteProfile: {  // CORRIGIDO: athleteProfile ao invés de athlete
                  select: { userId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!plannedWorkout) {
      return NextResponse.json(
        { error: 'Planned workout not found' },
        { status: 404 }
      );
    }

    if (plannedWorkout.week.plan.athleteProfile.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: planned workout does not belong to user' },
        { status: 403 }
      );
    }

    // Verificar se treino planejado já está completo
    if (plannedWorkout.isCompleted) {
      return NextResponse.json(
        { error: 'Planned workout is already completed' },
        { status: 400 }
      );
    }

    // Verificar Premium para auto-adjust
    if (triggeredBy === 'ai_auto' && !user.isPremium) {
      return NextResponse.json(
        {
          error: 'Premium required',
          message: 'Auto-ajuste automático requer assinatura Premium',
        },
        { status: 403 }
      );
    }

    // HOTFIX: Aplicar match direto sem engine (engine está com erro)
    console.log('[apply-adjustment] HOTFIX: Aplicando match direto...');
    
    try {
      // 1. Atualizar treino planejado usando Prisma Client (não SQL direto)
      await prisma.customWorkout.update({
        where: { id: plannedWorkoutId },
        data: {
          isCompleted: true,
          wasSubstitution: true,
          executedWorkout: {
            connect: { id: completedWorkoutId }
          }
        }
      });

      console.log('[apply-adjustment] ✅ Treino planejado atualizado com Prisma Client');

      // 2. Atualizar treino completado
      await prisma.completedWorkout.update({
        where: { id: completedWorkoutId },
        data: {
          wasPlanned: true,
          plannedDate: plannedWorkout.date,
          wasSubstitution: true,
        },
      });

      console.log('[apply-adjustment] ✅ Treino completado atualizado');

      // 3. Registrar decisão
      await prisma.workoutMatchDecision.create({
        data: {
          userId: user.id,
          completedWorkoutId,
          suggestedWorkoutId: plannedWorkoutId, // Schema usa suggestedWorkoutId
          confidence,
          accepted: true,
          triggeredBy,
          appliedAt: new Date(),
        },
      });

      console.log('[apply-adjustment] ✅ Decisão registrada');

      // Buscar dados atualizados (sem include duplicado)
      const updatedPlanned = await prisma.customWorkout.findUnique({
        where: { id: plannedWorkoutId },
        include: {
          executedWorkout: true, // Apenas executedWorkout
        },
      });

      const updatedCompleted = await prisma.completedWorkout.findUnique({
        where: { id: completedWorkoutId },
      });

      console.log('[apply-adjustment] ✅ Match aplicado com sucesso!');

      return NextResponse.json({
        success: true,
        message: 'Match aplicado com sucesso',
        plannedWorkout: updatedPlanned,
        completedWorkout: updatedCompleted,
      });
    } catch (engineError: any) {
      console.error('[apply-adjustment] ❌ HOTFIX failed:', engineError);
      return NextResponse.json(
        { error: 'Erro ao aplicar match', details: engineError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[Apply Adjustment] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
