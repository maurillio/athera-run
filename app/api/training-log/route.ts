
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { triggerAutoAdjustIfEnabled } from '@/lib/auto-adjust-service';

// GET - Obter relatos do atleta
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { athleteProfile: true }
    });

    if (!user?.athleteProfile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    const logs = await prisma.trainingLog.findMany({
      where: { athleteId: user.athleteProfile.id },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.trainingLog.count({
      where: { athleteId: user.athleteProfile.id }
    });

    return NextResponse.json({ logs, total });
  } catch (error) {
    console.error('Error fetching training logs:', error);
    return NextResponse.json({ error: 'Erro ao buscar relatos' }, { status: 500 });
  }
}

// POST - Criar novo relato
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { athleteProfile: true }
    });

    if (!user?.athleteProfile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    // Criar relato
    const log = await prisma.trainingLog.create({
      data: {
        athleteId: user.athleteProfile.id,
        date: new Date(body.date || new Date()),
        plannedWorkoutId: body.plannedWorkoutId,
        workoutCompleted: body.workoutCompleted ?? false,
        overallFeeling: body.overallFeeling,
        energyLevel: body.energyLevel,
        sleepQuality: body.sleepQuality,
        stressLevel: body.stressLevel,
        motivationLevel: body.motivationLevel,
        trainingDifficulty: body.trainingDifficulty,
        difficultyRating: body.difficultyRating,
        perceivedEffort: body.perceivedEffort,
        hasPain: body.hasPain ?? false,
        painDescription: body.painDescription,
        painLocations: body.painLocations,
        painIntensity: body.painIntensity,
        hasInjury: body.hasInjury ?? false,
        injuryDescription: body.injuryDescription,
        hasIllness: body.hasIllness ?? false,
        illnessDescription: body.illnessDescription,
        notes: body.notes,
      }
    });

    // Disparar ajuste automático em background (não aguarda)
    triggerAutoAdjustIfEnabled(user.athleteProfile.id).catch(err => 
      console.error('Auto-adjust error:', err)
    );

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    console.error('Error creating training log:', error);
    return NextResponse.json({ error: 'Erro ao criar relato' }, { status: 500 });
  }
}
