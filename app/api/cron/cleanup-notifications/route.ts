// app/api/cron/cleanup-notifications/route.ts
// ATHERA FLEX v3.3.0 - Endpoint para Cron Job de Limpeza

import { NextRequest, NextResponse } from 'next/server';
import { cleanupOldNotifications } from '@/lib/cron/notification-cleanup';

/**
 * GET /api/cron/cleanup-notifications
 * Endpoint para Vercel Cron executar diariamente
 * 
 * IMPORTANTE: Adicionar em vercel.json:
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/cleanup-notifications",
 *       "schedule": "0 3 * * *"
 *     }
 *   ]
 * }
 */
export async function GET(request: NextRequest) {
  // Verificar Authorization header (Vercel Cron envia)
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const result = await cleanupOldNotifications();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        deleted: result.deleted,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        { 
          error: result.error,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[Cron API] Error:', error);
    return NextResponse.json(
      { 
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
