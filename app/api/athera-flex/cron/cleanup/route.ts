// app/api/athera-flex/cron/cleanup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { scheduledTasks } from '@/lib/athera-flex/cron/ScheduledTasks';

/**
 * CRON JOB: Limpeza de dados antigos
 * Configuração Vercel Cron: Roda 1x por semana aos domingos 02:00
 */

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CRON] Cleanup job started');
    const result = await scheduledTasks.cleanupOldNotifications();

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed',
      data: result
    });

  } catch (error: any) {
    console.error('[CRON] Cleanup error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
