// app/api/athera-flex/proactive/suggestions/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ProactiveOrchestrator } from '@/lib/athera-flex/proactive/ProactiveOrchestrator';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orchestrator = new ProactiveOrchestrator();
    const suggestions = await orchestrator.generateProactiveSuggestions(
      parseInt(session.user.id)
    );

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error('[Proactive Suggestions Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
