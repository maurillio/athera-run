// app/api/athera-flex/proactive/apply-optimization/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ProactiveOrchestrator } from '@/lib/athera-flex/proactive/ProactiveOrchestrator';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { week_start, selected_suggestions } = await request.json();

    const orchestrator = new ProactiveOrchestrator();
    const result = await orchestrator.applyWeekOptimization(
      parseInt(session.user.id),
      new Date(week_start),
      selected_suggestions
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Apply Optimization Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
