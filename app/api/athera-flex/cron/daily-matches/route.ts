// app/api/athera-flex/cron/daily-matches/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { scheduledTasks } from '@/lib/athera-flex/cron/ScheduledTasks';

/**
 * CRON JOB: Processa matches diários
 * Configuração Vercel Cron: Roda a cada 6 horas
 */

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CRON] Daily matches job started');
    const result = await scheduledTasks.processDailyMatches();

    return NextResponse.json({
      success: true,
      message: 'Daily matches processed',
      data: result
    });

  } catch (error: any) {
    console.error('[CRON] Daily matches error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
