
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * API para re-gerar plano de treinamento quando corridas mudarem
 * POST /api/plan/regenerate
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { reason, description } = await req.json();

    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        raceGoals: {
          where: { status: 'active' },
          orderBy: { raceDate: 'asc' }
        },
        customPlan: true
      }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    if (!profile.customPlanId || !profile.customPlan) {
      return NextResponse.json({ 
        error: 'Nenhum plano existente para re-gerar',
        message: 'Gere um plano primeiro'
      }, { status: 400 });
    }

    const oldPlan = profile.customPlan;

    // Criar revisão no histórico
    await prisma.planRevision.create({
      data: {
        planId: oldPlan.id,
        reason: reason || 'manual_adjustment',
        description: description || 'Re-geração manual do plano',
        changes: {
          before: {
            totalWeeks: oldPlan.totalWeeks,
            raceDate: oldPlan.targetRaceDate,
            needsRegeneration: oldPlan.needsRegeneration
          },
          after: {
            status: 'regenerating'
          },
          affected_weeks: []
        },
        appliedBy: 'manual'
      }
    });

    // Deletar plano antigo (cascade irá deletar semanas e treinos)
    await prisma.customTrainingPlan.delete({
      where: { id: oldPlan.id }
    });

    // Atualizar perfil
    await prisma.athleteProfile.update({
      where: { id: profile.id },
      data: {
        hasCustomPlan: false,
        customPlanId: null
      }
    });

    console.log('[REGENERATE] Plano antigo deletado, pronto para re-gerar');

    return NextResponse.json({
      success: true,
      message: 'Plano marcado para re-geração. Gere um novo plano agora.',
      needsNewPlan: true
    });
  } catch (error) {
    console.error('Error regenerating plan:', error);
    return NextResponse.json({ 
      error: 'Erro ao re-gerar plano',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
