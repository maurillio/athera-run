// app/api/context/weather/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { weatherService } from '@/lib/athera-flex/context';

/**
 * POST /api/context/weather
 * Analisa condições climáticas para um treino outdoor
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { location, workoutDate, isOutdoor } = body;

    if (!location || !workoutDate) {
      return NextResponse.json(
        { error: 'location and workoutDate são obrigatórios' },
        { status: 400 }
      );
    }

    const context = await weatherService.getWeatherContext(
      location,
      new Date(workoutDate),
      isOutdoor !== false // default true
    );

    return NextResponse.json({
      success: true,
      context,
    });
  } catch (error) {
    console.error('[API] /api/context/weather error:', error);
    return NextResponse.json(
      { error: 'Erro ao analisar clima' },
      { status: 500 }
    );
  }
}
