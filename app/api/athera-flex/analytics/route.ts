// app/api/athera-flex/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { learningSystem } from '@/lib/athera-flex/ml/LearningSystem';

/**
 * GET /api/athera-flex/analytics
 * Retorna analytics do sistema Athera Flex
 */

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const isAdmin = session.user.subscription_tier === 'admin';

    if (!isAdmin && userId && parseInt(userId) !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const targetUserId = userId ? parseInt(userId) : (isAdmin ? undefined : session.user.id);
    const report = await learningSystem.getAnalyticsReport(targetUserId);

    return NextResponse.json({ success: true, data: report });

  } catch (error: any) {
    console.error('[ATHERA FLEX] Analytics error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
