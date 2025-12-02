// app/api/context/energy/log/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { energyService } from '@/lib/athera-flex/context';

/**
 * POST /api/context/energy/log
 * Registra log de energia/sono/stress do atleta
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sleepQuality, stressLevel, sorenessLevel, notes } = body;

    // Validação
    if (!sleepQuality || stressLevel === undefined || sorenessLevel === undefined) {
      return NextResponse.json(
        { error: 'sleepQuality, stressLevel e sorenessLevel são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar valores
    const validSleepQualities = ['excellent', 'good', 'fair', 'poor'];
    if (!validSleepQualities.includes(sleepQuality)) {
      return NextResponse.json(
        { error: 'sleepQuality inválido. Use: excellent, good, fair, poor' },
        { status: 400 }
      );
    }

    if (stressLevel < 0 || stressLevel > 10 || sorenessLevel < 0 || sorenessLevel > 10) {
      return NextResponse.json(
        { error: 'stressLevel e sorenessLevel devem estar entre 0 e 10' },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id);
    await energyService.logEnergy(userId, {
      sleepQuality,
      stressLevel,
      sorenessLevel,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: 'Log de energia registrado com sucesso',
    });
  } catch (error) {
    console.error('[API] /api/context/energy/log error:', error);
    return NextResponse.json(
      { error: 'Erro ao registrar log de energia' },
      { status: 500 }
    );
  }
}
