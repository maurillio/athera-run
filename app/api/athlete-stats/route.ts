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

    // Buscar dados reais do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        athleteProfile: {
          select: {
            stravaConnected: true,
            stravaLastSync: true,
            longestRun: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const stats = {
      pr5k: null, // PRs estão em bestTimes agora
      pr10k: null,
      prHalfMarathon: null,
      prMarathon: null,
      totalRuns: 0, // Campos não existem no schema atual
      totalDistance: 0,
      totalElevationGain: 0,
      longestRun: user.athleteProfile?.longestRun || 0,
      totalAchievements: 0,
      stravaConnected: user.athleteProfile?.stravaConnected || false,
      stravaLastSync: user.athleteProfile?.stravaLastSync || null,
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

    // These fields don't exist in current schema - return empty response
    // TODO: Migrate these fields or remove this endpoint
    const stats = {
      pr5k: null,
      pr10k: null,
      prHalfMarathon: null,
      prMarathon: null,
      totalRuns: 0,
      totalDistance: 0,
      totalElevationGain: 0,
      longestRun: 0,
      totalAchievements: 0,
      stravaConnected: false,
      stravaLastSync: null,
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
