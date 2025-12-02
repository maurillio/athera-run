// app/api/notifications/route.ts
// ATHERA FLEX v3.3.0 - API de Notificações In-App

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notificationService } from '@/lib/notifications/NotificationService';

/**
 * GET /api/notifications
 * Lista notificações in-app do usuário
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const notifications = await notificationService.getInAppNotifications(session.user.id, limit);
    const unreadCount = await notificationService.getUnreadCount(session.user.id);

    return NextResponse.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('[GET /api/notifications] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
