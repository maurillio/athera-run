import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('[MANUAL MATCH] Starting...');
    
    const session = await getServerSession(authOptions);
    console.log('[MANUAL MATCH] Session:', session?.user?.email);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('[MANUAL MATCH] Request body:', body);
    
    const { plannedWorkoutId, completedWorkoutId } = body;

    if (!plannedWorkoutId || !completedWorkoutId) {
      console.log('[MANUAL MATCH] Missing fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('[MANUAL MATCH] Fetching user...');
    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { athleteProfile: true }
    });

    console.log('[MANUAL MATCH] User found:', !!user, 'Profile:', !!user?.athleteProfile);

    if (!user?.athleteProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    console.log('[MANUAL MATCH] Fetching planned workout...');
    // Verificar se o treino planejado existe
    const plannedWorkout = await prisma.trainingPlanWorkout.findUnique({
      where: { id: plannedWorkoutId }
    });

    console.log('[MANUAL MATCH] Planned workout found:', !!plannedWorkout);

    if (!plannedWorkout) {
      return NextResponse.json(
        { error: 'Planned workout not found' },
        { status: 404 }
      );
    }

    console.log('[MANUAL MATCH] Fetching completed workout...');
    // Verificar se o treino completado existe e pertence ao usuário
    const completedWorkout = await prisma.completedWorkout.findFirst({
      where: {
        id: completedWorkoutId,
        athleteId: user.athleteProfile.id
      }
    });

    console.log('[MANUAL MATCH] Completed workout found:', !!completedWorkout);

    if (!completedWorkout) {
      return NextResponse.json(
        { error: 'Completed workout not found' },
        { status: 404 }
      );
    }

    console.log('[MANUAL MATCH] Updating completed workout...');
    // Atualizar o treino completado com o link ao planejado
    const updated = await prisma.completedWorkout.update({
      where: { id: completedWorkoutId },
      data: {
        plannedWorkoutId: plannedWorkoutId,
        wasPlanned: true,
        plannedDate: plannedWorkout.date
      }
    });

    console.log('[MANUAL MATCH] Updating planned workout...');
    // Atualizar o treino planejado como concluído
    await prisma.trainingPlanWorkout.update({
      where: { id: plannedWorkoutId },
      data: {
        status: 'COMPLETED',
        completedAt: completedWorkout.date
      }
    });

    console.log('[MANUAL MATCH] Successfully matched!');

    return NextResponse.json({
      success: true,
      workout: updated
    });
  } catch (error) {
    console.error('[MANUAL MATCH] Error:', error);
    console.error('[MANUAL MATCH] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { error: 'Failed to match workouts', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
