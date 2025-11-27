import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        athleteProfile: {
          include: {
            raceGoals: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const response: any = {
      email: user.email,
      hasProfile: !!user.athleteProfile,
    };

    if (user.athleteProfile) {
      const profile = user.athleteProfile;
      response.profile = {
        goalDistance: profile.goalDistance,
        targetRaceDate: profile.targetRaceDate,
        runningLevel: profile.runningLevel,
        trainingSchedule: profile.trainingSchedule,
        trainingActivities: profile.trainingActivities,
        longRunDay: profile.longRunDay,
        customPlanId: profile.customPlanId,
        hasCustomPlan: profile.hasCustomPlan,
        raceGoals: profile.raceGoals.map(race => ({
          id: race.id,
          priority: race.priority,
          raceName: race.raceName,
          distance: race.distance,
          raceDate: race.raceDate,
          status: race.status,
        }))
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[DEBUG] Error:', error);
    return NextResponse.json({ 
      error: 'Internal error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
