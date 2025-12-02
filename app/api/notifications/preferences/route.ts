// app/api/notifications/preferences/route.ts
// ATHERA FLEX v3.3.0 - Preferências de Notificações

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * GET /api/notifications/preferences
 * Busca preferências de notificações do usuário
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let prefs = await db.notification_preferences.findUnique({
      where: { user_id: session.user.id }
    });

    // Se não existe, criar com defaults
    if (!prefs) {
      prefs = await db.notification_preferences.create({
        data: {
          user_id: session.user.id,
          email_enabled: true,
          email_match_found: true,
          email_auto_accepted: true,
          push_enabled: true,
          push_match_found: true,
          in_app_enabled: true
        }
      });
    }

    return NextResponse.json(prefs);
  } catch (error) {
    console.error('[GET /api/notifications/preferences] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/preferences
 * Atualiza preferências de notificações do usuário
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const prefs = await db.notification_preferences.upsert({
      where: { user_id: session.user.id },
      update: {
        email_enabled: body.email_enabled,
        email_match_found: body.email_match_found,
        email_auto_accepted: body.email_auto_accepted,
        push_enabled: body.push_enabled,
        push_match_found: body.push_match_found,
        in_app_enabled: body.in_app_enabled,
        updated_at: new Date()
      },
      create: {
        user_id: session.user.id,
        email_enabled: body.email_enabled ?? true,
        email_match_found: body.email_match_found ?? true,
        email_auto_accepted: body.email_auto_accepted ?? true,
        push_enabled: body.push_enabled ?? true,
        push_match_found: body.push_match_found ?? true,
        in_app_enabled: body.in_app_enabled ?? true
      }
    });

    return NextResponse.json(prefs);
  } catch (error) {
    console.error('[PUT /api/notifications/preferences] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
