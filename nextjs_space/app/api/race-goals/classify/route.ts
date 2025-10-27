
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { classifyRaces } from '@/lib/race-classifier';

/**
 * API para classificar automaticamente corridas do atleta
 * POST /api/race-goals/classify
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        raceGoals: {
          where: { status: 'active' },
          orderBy: { raceDate: 'asc' }
        }
      }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    if (profile.raceGoals.length === 0) {
      return NextResponse.json({ 
        message: 'Nenhuma corrida para classificar',
        classifications: []
      });
    }

    // Classificar corridas
    const racesToClassify = profile.raceGoals.map(race => ({
      id: race.id,
      raceName: race.raceName,
      distance: race.distance,
      raceDate: race.raceDate,
      targetTime: race.targetTime || undefined,
      isPrimary: race.isPrimary
    }));

    const classifications = classifyRaces(racesToClassify);

    // Atualizar no banco de dados
    for (const classification of classifications) {
      await prisma.raceGoal.update({
        where: { id: classification.raceId },
        data: {
          priority: classification.priority,
          weeksBeforeA: classification.weeksBeforeA,
          trainingSuggest: classification.trainingSuggest,
          periodPhase: classification.periodPhase,
          autoClassified: true,
        }
      });
    }

    console.log('[CLASSIFY] Classificadas', classifications.length, 'corridas');

    // Marcar plano para re-geração se necessário
    if (profile.hasCustomPlan && profile.customPlanId) {
      await prisma.customTrainingPlan.update({
        where: { id: profile.customPlanId },
        data: {
          needsRegeneration: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      classifications,
      message: `${classifications.length} corridas classificadas com sucesso!`
    });
  } catch (error) {
    console.error('Error classifying races:', error);
    return NextResponse.json({ 
      error: 'Erro ao classificar corridas',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
