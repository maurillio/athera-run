import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is premium
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription || subscription.status !== 'active') {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 }
      );
    }

    // Get profile with Strava connection
    const profile = await prisma.athleteProfile.findUnique({
      where: { userEmail: session.user.email },
      select: {
        stravaAccessToken: true,
        stravaRefreshToken: true,
        stravaTokenExpiry: true, // CORRETO: stravaTokenExpiry
        stravaAthleteId: true,
      },
    });

    if (!profile?.stravaAccessToken || !profile?.stravaAthleteId) {
      return NextResponse.json(
        { error: 'Strava not connected' },
        { status: 400 }
      );
    }

    // Check if token needs refresh
    let accessToken = profile.stravaAccessToken;
    const now = Date.now();
    const expiresAt = profile.stravaTokenExpiry ? new Date(profile.stravaTokenExpiry).getTime() : 0; // CORRETO: stravaTokenExpiry

    if (expiresAt < now) {
      // Refresh token
      const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.STRAVA_CLIENT_ID,
          client_secret: process.env.STRAVA_CLIENT_SECRET,
          refresh_token: profile.stravaRefreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!refreshResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to refresh Strava token' },
          { status: 500 }
        );
      }

      const tokens = await refreshResponse.json();
      accessToken = tokens.access_token;

      // Update tokens
      await prisma.athleteProfile.update({
        where: { userEmail: session.user.email },
        data: {
          stravaAccessToken: tokens.access_token,
          stravaRefreshToken: tokens.refresh_token,
          stravaTokenExpiry: new Date(tokens.expires_at * 1000), // CORRETO: stravaTokenExpiry
        },
      });
    }

    // Fetch athlete stats from Strava
    const statsResponse = await fetch(
      `https://www.strava.com/api/v3/athletes/${profile.stravaAthleteId}/stats`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!statsResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch Strava stats' },
        { status: 500 }
      );
    }

    const stravaStats = await statsResponse.json();

    // Extract running totals
    const runTotals = stravaStats.all_run_totals || {};
    
    // Update profile with stats
    const updatedProfile = await prisma.athleteProfile.update({
      where: { userEmail: session.user.email },
      data: {
        totalRuns: runTotals.count || 0,
        totalDistance: Math.round(runTotals.distance || 0),
        totalElevationGain: Math.round(runTotals.elevation_gain || 0),
        stravaLastSync: new Date(),
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
      pr5k: updatedProfile.pr5k,
      pr10k: updatedProfile.pr10k,
      prHalfMarathon: updatedProfile.prHalfMarathon,
      prMarathon: updatedProfile.prMarathon,
      totalRuns: updatedProfile.totalRuns,
      totalDistance: updatedProfile.totalDistance,
      totalElevationGain: updatedProfile.totalElevationGain,
      longestRun: updatedProfile.longestRun,
      totalAchievements: updatedProfile.totalAchievements,
      stravaConnected: updatedProfile.stravaConnected,
      stravaLastSync: updatedProfile.stravaLastSync,
    };

    return NextResponse.json({ stats, message: 'Stats synced successfully' });
  } catch (error) {
    console.error('Error syncing Strava stats:', error);
    return NextResponse.json(
      { error: 'Error syncing stats' },
      { status: 500 }
    );
  }
}
