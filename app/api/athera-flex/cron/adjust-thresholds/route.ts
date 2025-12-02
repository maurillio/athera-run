// app/api/athera-flex/cron/adjust-thresholds/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { scheduledTasks } from '@/lib/athera-flex/cron/ScheduledTasks';

/**
 * CRON JOB: Ajusta thresholds inteligentes
 * Configuração Vercel Cron: Roda 1x por dia às 06:00
 */

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CRON] Adjust thresholds job started');
    const result = await scheduledTasks.adjustIntelligentThresholds();

    return NextResponse.json({
      success: true,
      message: 'Thresholds adjusted',
      data: result
    });

  } catch (error: any) {
    console.error('[CRON] Adjust thresholds error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
