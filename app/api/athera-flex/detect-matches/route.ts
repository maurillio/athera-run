/**
 * ATHERA FLEX v3.3.0 - Detect Matches API
 * POST - Detecta matches entre treinos completados e planejados
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { SmartWorkoutMatcher, createMatcherFromUserSettings } from '@/lib/athera-flex/smart-workout-matcher';
import dayjs from 'dayjs';

export const dynamic = 'force-dynamic';

// ============================================================================
// POST - Detectar matches
// ============================================================================

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { minConfidence = 60, daysBack = 7 } = body;

    // Buscar user e profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Buscar plano ativo
    const plan = await prisma.customTrainingPlan.findFirst({
      where: { 
        athleteProfile: {
          id: profile.id
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!plan) {
      return NextResponse.json({
        success: true,
        suggestions: [],
        message: 'Nenhum plano ativo encontrado',
      });
    }

    // Buscar configurações do usuário
    const settings = await prisma.userFlexSettings.findUnique({
      where: { userId: user.id },
    });

    // Criar matcher com configurações do usuário
    const matcher = createMatcherFromUserSettings(settings);

    // Buscar treinos completados nos últimos N dias SEM match ainda
    const startDate = dayjs().subtract(daysBack, 'day').toDate();
    const completedWorkouts = await prisma.completedWorkout.findMany({
      where: {
        athleteId: profile.id,
        date: {
          gte: startDate,
        },
        wasPlanned: false, // Ainda não foi vinculado a um planejado
      },
      orderBy: {
        date: 'desc',
      },
      take: 20, // Máximo 20 treinos para analisar
    });

    if (completedWorkouts.length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: [],
        message: 'Nenhum treino completado sem match encontrado',
      });
    }

    // Buscar treinos planejados NÃO completados
    const plannedWorkouts = await prisma.customWorkout.findMany({
      where: {
        week: {
          planId: plan.id,
        },
        isCompleted: false,
        isFlexible: true,
        date: {
          gte: dayjs().subtract(14, 'day').toDate(), // Últimos 14 dias
          lte: dayjs().add(7, 'day').toDate(), // Próximos 7 dias
        },
      },
      include: {
        week: true,
      },
    });

    if (plannedWorkouts.length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: [],
        message: 'Nenhum treino planejado elegível encontrado',
      });
    }

    // Processar cada treino completado
    const suggestions = [];

    for (const completed of completedWorkouts) {
      // Buscar matches para este treino
      const matches = await matcher.findBestMatch(
        {
          id: completed.id,
          date: completed.date,
          type: completed.type,
          subtype: completed.subtype,
          distance: completed.distance,
          duration: completed.duration,
          pace: completed.pace,
          avgHeartRate: completed.avgHeartRate,
          perceivedEffort: completed.perceivedEffort,
        },
        plannedWorkouts.map(p => ({
          id: p.id,
          date: p.date,
          type: p.type,
          subtype: p.subtype,
          distance: p.distance,
          duration: p.duration,
          targetPace: p.targetPace,
          targetHeartRate: p.targetHeartRate,
          targetRPE: p.targetRPE,
          isCompleted: p.isCompleted,
          isFlexible: p.isFlexible,
          flexibilityWindow: p.flexibilityWindow,
          canSubstitute: p.canSubstitute,
          minVolumePercent: p.minVolumePercent,
          maxVolumePercent: p.maxVolumePercent,
        }))
      );

      // Se encontrou matches acima do mínimo
      if (matches.length > 0 && matches[0].confidence >= minConfidence) {
        const bestMatch = matches[0];
        const plannedWorkout = plannedWorkouts.find(p => p.id === bestMatch.workoutId);

        suggestions.push({
          completedWorkoutId: completed.id,
          completedWorkout: {
            date: completed.date,
            type: completed.type,
            distance: completed.distance,
            duration: completed.duration,
            pace: completed.pace,
          },
          plannedWorkout: {
            id: plannedWorkout?.id,
            title: plannedWorkout?.title,
            date: plannedWorkout?.date,
            type: plannedWorkout?.type,
            distance: plannedWorkout?.distance,
            duration: plannedWorkout?.duration,
          },
          matches: matches.slice(0, 3), // Top 3 matches
          bestMatch,
          shouldAutoApply: bestMatch.canAutoApply && (settings?.autoAdjustEnabled || false),
        });
      }
    }

    // Ordenar por confidence (maior primeiro)
    suggestions.sort((a, b) => b.bestMatch.confidence - a.bestMatch.confidence);

    return NextResponse.json({
      success: true,
      suggestions,
      count: suggestions.length,
      message: suggestions.length > 0
        ? `${suggestions.length} match${suggestions.length > 1 ? 'es' : ''} encontrado${suggestions.length > 1 ? 's' : ''}`
        : 'Nenhum match encontrado',
      settings: {
        minConfidence,
        daysBack,
        autoAdjustEnabled: settings?.autoAdjustEnabled || false,
        autoAdjustThreshold: settings?.autoAdjustThreshold || 90,
      },
    });
  } catch (error: any) {
    console.error('[Detect Matches] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
