// app/api/athera-flex/proactive/best-days/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { BestDaySuggester } from '@/lib/athera-flex/proactive/BestDaySuggester';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const suggester = new BestDaySuggester();
    const days = await suggester.suggestBestDays(parseInt(session.user.id));

    return NextResponse.json({ days });
  } catch (error: any) {
    console.error('[Best Days Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
