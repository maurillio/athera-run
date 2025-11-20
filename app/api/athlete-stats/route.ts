import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        pr5k: true,
        pr10k: true,
        prHalfMarathon: true,
        prMarathon: true,
        totalRuns: true,
        totalDistance: true,
        totalElevationGain: true,
        longestRun: true,
        totalAchievements: true,
        stravaConnected: true,
        stravaLastSync: true,
      },
    });

    const stats = {
      pr5k: profile?.pr5k || null,
      pr10k: profile?.pr10k || null,
      prHalfMarathon: profile?.prHalfMarathon || null,
      prMarathon: profile?.prMarathon || null,
      totalRuns: profile?.totalRuns || 0,
      totalDistance: profile?.totalDistance || 0,
      totalElevationGain: profile?.totalElevationGain || 0,
      longestRun: profile?.longestRun || 0,
      totalAchievements: profile?.totalAchievements || 0,
      stravaConnected: profile?.stravaConnected || false,
      stravaLastSync: profile?.stravaLastSync || null,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching athlete stats:', error);
    return NextResponse.json(
      { error: 'Error fetching stats' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pr5k, pr10k, prHalfMarathon, prMarathon } = body;

    const profile = await prisma.athleteProfile.update({
      where: { userId: session.user.id },
      data: {
        pr5k: pr5k || null,
        pr10k: pr10k || null,
        prHalfMarathon: prHalfMarathon || null,
        prMarathon: prMarathon || null,
      },
      select: {
        pr5k: true,
        pr10k: true,
        prHalfMarathon: true,
        prMarathon: true,
        totalRuns: true,
        totalDistance: true,
        totalElevationGain: true,
        longestRun: true,
        totalAchievements: true,
        stravaConnected: true,
        stravaLastSync: true,
      },
    });

    const stats = {
      pr5k: profile.pr5k,
      pr10k: profile.pr10k,
      prHalfMarathon: profile.prHalfMarathon,
      prMarathon: profile.prMarathon,
      totalRuns: profile.totalRuns,
      totalDistance: profile.totalDistance,
      totalElevationGain: profile.totalElevationGain,
      longestRun: profile.longestRun,
      totalAchievements: profile.totalAchievements,
      stravaConnected: profile.stravaConnected,
      stravaLastSync: profile.stravaLastSync,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error updating athlete stats:', error);
    return NextResponse.json(
      { error: 'Error updating stats' },
      { status: 500 }
    );
  }
}
