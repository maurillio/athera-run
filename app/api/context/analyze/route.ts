// app/api/context/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ContextAwarenessEngine } from '@/lib/athera-flex/context';

/**
 * POST /api/context/analyze
 * Análise completa de contexto (orquestrador)
 * Combina: weather + calendar + energy + recovery
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { workoutDate, workoutType, isOutdoor = true } = body;

    if (!workoutDate || !workoutType) {
      return NextResponse.json(
        { error: 'workoutDate e workoutType são obrigatórios' },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id);
    const engine = ContextAwarenessEngine.getInstance();

    const decision = await engine.analyzeWorkoutContext(
      userId,
      new Date(workoutDate),
      workoutType,
      isOutdoor
    );

    return NextResponse.json({
      success: true,
      decision,
    });
  } catch (error) {
    console.error('[API] /api/context/analyze error:', error);
    return NextResponse.json(
      { error: 'Erro ao analisar contexto completo' },
      { status: 500 }
    );
  }
}
