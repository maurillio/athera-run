/**
 * API para buscar corridas completadas
 * Usado no modal de marcação manual de treinos
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

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

    // Buscar athleteProfile do user
    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Data de corte (últimos N dias)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Buscar plano ativo do atleta para verificar dias com treinos planejados
    const activePlan = await prisma.customTrainingPlan.findFirst({
      where: {
        athleteProfileId: profile.id,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        weeks: {
          select: {
            workouts: {
              where: {
                date: {
                  gte: cutoffDate,
                },
                OR: [
                  { type: 'run' },
                  { type: 'running' },
                  { type: 'Run' },
                  { type: 'Running' },
                ],
              },
              select: {
                date: true,
              },
            },
          },
        },
      },
    });

    // Extrair datas que tinham treinos de corrida planejados
    const datesWithPlannedRuns = new Set<string>();
    if (activePlan) {
      activePlan.weeks.forEach(week => {
        week.workouts.forEach(workout => {
          const dateStr = new Date(workout.date).toISOString().split('T')[0];
          datesWithPlannedRuns.add(dateStr);
        });
      });
    }

    // Buscar treinos completados
    // Filtrar APENAS corridas (type = 'run' ou 'running')
    const workouts = await prisma.completedWorkout.findMany({
      where: {
        athleteId: profile.id,
        date: {
          gte: cutoffDate,
        },
        OR: [
          { type: 'run' },
          { type: 'running' },
          { type: 'Run' },
          { type: 'Running' },
        ],
        // NÃO mostrar treinos que já foram usados em matches
        plannedWorkoutId: null,
      },
      orderBy: {
        date: 'desc',
      },
      select: {
        id: true,
        date: true,
        type: true,
        subtype: true,
        distance: true,
        duration: true,
        source: true,
        stravaActivityId: true,
      },
    });

    // Filtrar treinos executados em dias SEM treino planejado
    const availableWorkouts = workouts.filter(workout => {
      const workoutDateStr = new Date(workout.date).toISOString().split('T')[0];
      return !datesWithPlannedRuns.has(workoutDateStr);
    });

    return NextResponse.json({
      success: true,
      workouts: availableWorkouts,
      count: availableWorkouts.length,
    });
  } catch (error) {
    console.error('[API] Error fetching completed runs:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar corridas completadas' },
      { status: 500 }
    );
  }
}
