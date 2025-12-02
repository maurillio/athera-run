// app/api/notifications/read-all/route.ts
// ATHERA FLEX v3.3.0 - Marcar todas notificações como lidas

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notificationService } from '@/lib/notifications/NotificationService';

/**
 * POST /api/notifications/read-all
 * Marca todas as notificações do usuário como lidas
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await notificationService.markAllAsRead(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/notifications/read-all] Error:', error);
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}
