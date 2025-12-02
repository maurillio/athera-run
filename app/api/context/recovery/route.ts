// app/api/context/recovery/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { recoveryService } from '@/lib/athera-flex/context';

/**
 * GET /api/context/recovery?date=2025-12-02&intensity=moderate
 * Obtém análise de recuperação do atleta
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const intensity = searchParams.get('intensity') || 'moderate';

    if (!date) {
      return NextResponse.json(
        { error: 'date é obrigatório (formato: YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id);
    const context = await recoveryService.getRecoveryContext(
      userId,
      new Date(date),
      intensity
    );

    return NextResponse.json({
      success: true,
      context,
    });
  } catch (error) {
    console.error('[API] /api/context/recovery error:', error);
    return NextResponse.json(
      { error: 'Erro ao analisar recuperação' },
      { status: 500 }
    );
  }
}
