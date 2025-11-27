import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay } from 'date-fns';

/**
 * AUTO-ADJUST PLAN API (FREE FEATURE)
 * 
 * Ajusta o plano de treino do usuário quando houver mudanças na disponibilidade.
 * SEMPRE preserva o histórico (treinos passados) e ajusta apenas do dia atual em diante.
 * 
 * Estratégia SIMPLES e SEGURA:
 * 1. Deleta apenas workouts futuros (hoje em diante)
 * 2. Usuário deve clicar em "Regenerar Plano" no perfil
 * 3. A regeneração automática respeitará treinos concluídos
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reason, preserveHistory = true } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        athleteProfile: {
          include: {
            customPlan: {
              include: {
                weeks: {
                  include: { workouts: true },
                  orderBy: { weekNumber: 'asc' }
                }
              }
            }
          }
        }
      }
    });

    if (!user?.athleteProfile?.customPlan) {
      return NextResponse.json({ 
        error: 'No training plan found',
        message: 'Você ainda não tem um plano de treino.'
      }, { status: 404 });
    }

    const today = startOfDay(new Date());
    const plan = user.athleteProfile.customPlan;

    if (!preserveHistory) {
      return NextResponse.json({ 
        error: 'Only incremental adjust is supported',
        message: 'Por segurança, apenas ajustes incrementais (preservando histórico) são permitidos.'
      }, { status: 400 });
    }

    // Preservar histórico: deletar apenas futuro
    
    console.log('[AUTO-ADJUST] Starting adjustment');
    console.log('[AUTO-ADJUST] User:', session.user.email);
    console.log('[AUTO-ADJUST] Today:', today.toISOString());
    console.log('[AUTO-ADJUST] Reason:', reason);
    
    // Contar workouts futuros
    const futureWorkouts = await prisma.customWorkout.findMany({
      where: {
        weekId: { in: plan.weeks.map(w => w.id) },
        date: { gte: today },
        isCompleted: false
      },
      orderBy: { date: 'asc' }
    });

    console.log(`[AUTO-ADJUST] Found ${futureWorkouts.length} future workouts`);

    if (futureWorkouts.length === 0) {
      return NextResponse.json({ 
        success: true,
        message: 'Não há treinos futuros para ajustar.',
        deletedWorkouts: 0
      });
    }

    // Deletar workouts futuros (não concluídos)
    const deletedCount = await prisma.customWorkout.deleteMany({
      where: {
        weekId: { in: plan.weeks.map(w => w.id) },
        date: { gte: today },
        isCompleted: false
      }
    });

    console.log(`[AUTO-ADJUST] Deleted ${deletedCount.count} future workouts`);

    // Atualizar data de última regeneração
    await prisma.customTrainingPlan.update({
      where: { id: plan.id },
      data: {
        lastRegenerated: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      message: `${deletedCount.count} treinos futuros foram removidos. Clique em "Regenerar Plano" no seu perfil para criar novos treinos com sua disponibilidade atualizada.`,
      adjustmentType: 'incremental',
      adjustedFrom: today.toISOString(),
      deletedWorkouts: deletedCount.count,
      reason: reason || 'Alteração de disponibilidade',
      action: 'REGENERATE_REQUIRED' // Frontend deve mostrar botão de regenerar
    });

  } catch (error: any) {
    console.error('[AUTO-ADJUST] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to adjust plan',
      details: error.message 
    }, { status: 500 });
  }
}
