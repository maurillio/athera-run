// app/api/context/recovery/score/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { recoveryService } from '@/lib/athera-flex/context';

/**
 * POST /api/context/recovery/score
 * Salva recovery score de wearable (Whoop, Garmin, etc)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { score, source = 'manual' } = body;

    // Validação
    if (score === undefined) {
      return NextResponse.json(
        { error: 'score é obrigatório' },
        { status: 400 }
      );
    }

    if (score < 0 || score > 100) {
      return NextResponse.json(
        { error: 'score deve estar entre 0 e 100' },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id);
    await recoveryService.saveRecoveryScore(userId, score, source);

    return NextResponse.json({
      success: true,
      message: 'Recovery score salvo com sucesso',
    });
  } catch (error) {
    console.error('[API] /api/context/recovery/score error:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar recovery score' },
      { status: 500 }
    );
  }
}
