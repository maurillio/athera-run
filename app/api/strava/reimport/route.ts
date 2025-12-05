import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: {
        stravaAccessToken: true,
        stravaRefreshToken: true,
        stravaTokenExpiry: true,
      },
    });

    if (!profile?.stravaAccessToken) {
      return NextResponse.json({ error: 'Strava not connected' }, { status: 400 });
    }

    let accessToken = profile.stravaAccessToken;
    if (profile.stravaTokenExpiry && new Date(profile.stravaTokenExpiry) < new Date()) {
      const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.STRAVA_CLIENT_ID,
          client_secret: process.env.STRAVA_CLIENT_SECRET,
          grant_type: 'refresh_token',
          refresh_token: profile.stravaRefreshToken,
        }),
      });

      if (!refreshResponse.ok) {
        return NextResponse.json({ error: 'Failed to refresh Strava token' }, { status: 500 });
      }

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;

      await prisma.profile.update({
        where: { userId },
        data: {
          stravaAccessToken: refreshData.access_token,
          stravaRefreshToken: refreshData.refresh_token,
          stravaTokenExpiry: new Date(refreshData.expires_at * 1000),
        },
      });
    }

    const sixMonthsAgo = Math.floor(new Date().setMonth(new Date().getMonth() - 6) / 1000);
    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${sixMonthsAgo}&per_page=200`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch Strava activities' }, { status: 500 });
    }

    const activities = await response.json();

    await prisma.completedWorkout.deleteMany({ where: { userId } });

    const created = [];
    for (const activity of activities) {
      const type = activity.type === 'Run' ? 'running' : 
                   activity.type === 'WeightTraining' ? 'strength' : 'other';

      const completedWorkout = await prisma.completedWorkout.create({
        data: {
          userId,
          type,
          distance: activity.distance / 1000,
          duration: activity.moving_time,
          date: new Date(activity.start_date),
          notes: activity.name,
          stravaActivityId: activity.id.toString(),
          wasPlanned: false,
          plannedDate: null,
        },
      });

      created.push(completedWorkout);
    }

    return NextResponse.json({
      status: 'success',
      message: 'Treinos reimportados do Strava!',
      count: created.length,
      activities: created.slice(0, 10),
    });

  } catch (error) {
    console.error('[REIMPORT ERROR]', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
