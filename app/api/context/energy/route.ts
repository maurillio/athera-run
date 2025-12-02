// app/api/context/energy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { energyService } from '@/lib/athera-flex/context';

/**
 * GET /api/context/energy?date=2025-12-02
 * Obtém análise de energia/fadiga do atleta
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'date é obrigatório (formato: YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id);
    const context = await energyService.getEnergyContext(
      userId,
      new Date(date)
    );

    return NextResponse.json({
      success: true,
      context,
    });
  } catch (error) {
    console.error('[API] /api/context/energy error:', error);
    return NextResponse.json(
      { error: 'Erro ao analisar energia' },
      { status: 500 }
    );
  }
}
