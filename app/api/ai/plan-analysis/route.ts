import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { analyzeProfileForAI } from '@/lib/ai-transparency/analyzer';

/**
 * GET /api/ai/plan-analysis
 * Retorna análise de como a IA usa os dados do usuário
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar perfil completo do usuário
    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isPremium: true,
          },
        },
        raceGoals: {
          where: { isActive: true },
          orderBy: { targetDate: 'asc' },
          take: 1,
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    // Montar dados para análise
    const profileData = {
      // Basic
      weight: profile.weight,
      height: profile.height,
      age: profile.age,
      gender: profile.gender,
      
      // Experience
      runningLevel: profile.runningLevel,
      currentWeeklyKm: profile.currentWeeklyKm,
      longestRun: profile.longestRun,
      yearsRunning: profile.runningYears,
      
      // Performance
      bestTimes: profile.bestTimes || {},
      currentVDOT: profile.currentVDOT,
      
      // Health
      restingHeartRate: profile.restingHeartRate,
      maxHeartRate: profile.maxHeartRate,
      injuries: profile.injuries,
      currentlyInjured: profile.currentlyInjured,
      sleepQuality: profile.sleepQuality,
      avgSleepHours: profile.avgSleepHours,
      stressLevel: profile.stressLevel,
      tracksMenstrualCycle: profile.tracksMenstrualCycle,
      
      // Goals
      goalDistance: profile.goalDistance || profile.raceGoals[0]?.distance,
      targetRaceDate: profile.targetRaceDate || profile.raceGoals[0]?.targetDate,
      targetTime: profile.targetTime || profile.raceGoals[0]?.targetTime,
      
      // Availability
      trainingSchedule: profile.trainingSchedule,
      longRunDay: profile.longRunDay,
      hasGymAccess: profile.hasGymAccess,
      hasPoolAccess: profile.hasPoolAccess,
      hasTrackAccess: profile.hasTrackAccess,
      
      // Advanced
      stravaConnected: profile.stravaConnected,
      stravaStats: profile.stravaConnected ? {
        totalRuns: profile.totalRuns,
        totalDistance: profile.totalDistance,
      } : null,
    };

    // Analisar
    const analysis = await analyzeProfileForAI(session.user.id, profileData);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('[AI ANALYSIS] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao analisar perfil' },
      { status: 500 }
    );
  }
}
