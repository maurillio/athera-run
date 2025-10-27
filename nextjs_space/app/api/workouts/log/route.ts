
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { triggerAutoAdjustIfEnabled } from '@/lib/auto-adjust-service';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      athleteId,
      date,
      type,
      subtype,
      distance,
      duration,
      avgHeartRate,
      perceivedEffort,
      feeling,
      notes
    } = body;

    // Calcular pace se houver distância e duração
    let pace = null;
    if (distance && duration && type === 'running') {
      const paceMinutes = duration / distance;
      const paceMin = Math.floor(paceMinutes);
      const paceSec = Math.round((paceMinutes - paceMin) * 60);
      pace = `${paceMin}:${paceSec.toString().padStart(2, '0')}/km`;
    }

    // Criar treino completado
    const workout = await prisma.completedWorkout.create({
      data: {
        athleteId,
        source: 'manual',
        date: new Date(date),
        type,
        subtype,
        distance,
        duration,
        pace,
        avgHeartRate,
        perceivedEffort,
        feeling,
        notes
      }
    });

    // Disparar ajuste automático em background (não aguarda)
    triggerAutoAdjustIfEnabled(athleteId).catch(err => 
      console.error('Auto-adjust error:', err)
    );

    return NextResponse.json(workout);
  } catch (error) {
    console.error('Erro ao registrar treino:', error);
    return NextResponse.json(
      { error: 'Erro ao registrar treino' },
      { status: 500 }
    );
  }
}
