// app/api/athera-flex/cron/train-models/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { scheduledTasks } from '@/lib/athera-flex/cron/ScheduledTasks';

/**
 * CRON JOB: Treina modelos ML
 * Configuração Vercel Cron: Roda 1x por dia às 00:00
 */

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CRON] Train models job started');
    const result = await scheduledTasks.trainMLModels();

    return NextResponse.json({
      success: true,
      message: 'ML models trained',
      data: result
    });

  } catch (error: any) {
    console.error('[CRON] Train models error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
