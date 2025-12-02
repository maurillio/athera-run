// app/api/context/calendar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { calendarService } from '@/lib/athera-flex/context';

/**
 * GET /api/context/calendar?date=2025-12-02&duration=60
 * Analisa eventos do calendário do usuário
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const duration = parseInt(searchParams.get('duration') || '60');

    if (!date) {
      return NextResponse.json(
        { error: 'date é obrigatório (formato: YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id);
    const context = await calendarService.getCalendarContext(
      userId,
      new Date(date),
      duration
    );

    return NextResponse.json({
      success: true,
      context,
    });
  } catch (error) {
    console.error('[API] /api/context/calendar error:', error);
    return NextResponse.json(
      { error: 'Erro ao analisar calendário' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/context/calendar/sync
 * Sincroniza eventos do Google Calendar
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { accessToken, days = 7 } = body;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'accessToken é obrigatório' },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id);
    await calendarService.syncGoogleCalendarEvents(userId, accessToken, days);

    return NextResponse.json({
      success: true,
      message: 'Eventos sincronizados com sucesso',
    });
  } catch (error) {
    console.error('[API] /api/context/calendar/sync error:', error);
    return NextResponse.json(
      { error: 'Erro ao sincronizar calendário' },
      { status: 500 }
    );
  }
}
