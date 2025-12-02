// app/api/notifications/[id]/read/route.ts
// ATHERA FLEX v3.3.0 - Marcar notificação como lida

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notificationService } from '@/lib/notifications/NotificationService';
import { prisma } from '@/lib/db';

/**
 * POST /api/notifications/[id]/read
 * Marca uma notificação como lida
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notificationId = parseInt(params.id);

    // Verificar se a notificação pertence ao usuário
    const notification = await prisma.in_app_notifications.findUnique({
      where: { id: notificationId },
      select: { user_id: true }
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    if (notification.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Marcar como lida
    await notificationService.markAsRead(notificationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/notifications/:id/read] Error:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
