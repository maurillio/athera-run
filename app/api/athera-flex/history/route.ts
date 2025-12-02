/**
 * ATHERA FLEX v3.3.0 - History API
 * GET - Busca histórico de ajustes do usuário
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { adjustmentEngine } from '@/lib/athera-flex/adjustment-engine';

export const dynamic = 'force-dynamic';

// ============================================================================
// GET - Buscar histórico
// ============================================================================

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Buscar user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Buscar histórico usando o engine
    const adjustments = await adjustmentEngine.getAdjustmentHistory(user.id, limit);

    return NextResponse.json({
      success: true,
      adjustments,
      count: adjustments.length,
    });
  } catch (error: any) {
    console.error('[History API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
