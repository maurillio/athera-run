/**
 * ATHERA FLEX v3.3.0 - Undo API
 * POST - Desfaz um ajuste aplicado (até 7 dias)
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { adjustmentEngine } from '@/lib/athera-flex/adjustment-engine';

export const dynamic = 'force-dynamic';

// ============================================================================
// POST - Desfazer ajuste
// ============================================================================

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const adjustmentId = parseInt(params.id);
    if (isNaN(adjustmentId)) {
      return NextResponse.json(
        { error: 'Invalid adjustment ID' },
        { status: 400 }
      );
    }

    // Tentar ler body (pode estar vazio)
    let reason = 'Desfazer via API';
    try {
      const body = await req.json();
      if (body.reason) reason = body.reason;
    } catch (e) {
      // Body vazio, usar reason padrão
    }

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

    // Desfazer usando o engine
    const result = await adjustmentEngine.undoAdjustment({
      adjustmentId,
      userId: user.id,
      reason,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      adjustmentId: result.adjustmentId,
      workoutId: result.workoutId,
    });
  } catch (error: any) {
    console.error('[Undo API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
