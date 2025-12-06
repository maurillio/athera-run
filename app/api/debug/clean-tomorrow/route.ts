/**
 * DEBUG API - Clean Tomorrow's Workout
 * 
 * Endpoint de emergência para resetar treino de amanhã marcado incorretamente
 * USAR COM CUIDADO - Apenas para debugging
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    console.log('[CLEAN-TOMORROW] ========== REQUEST RECEIVED ==========');
    
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CLEAN-TOMORROW] User:', session.user.email);

    // Buscar user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { athleteProfile: true }
    });

    if (!user?.athleteProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    console.log('[CLEAN-TOMORROW] Profile ID:', user.athleteProfile.id);

    // Data de amanhã (07/DEZ/2025)
    const tomorrowStart = new Date('2025-12-07T00:00:00Z');
    const tomorrowEnd = new Date('2025-12-08T00:00:00Z');

    // 1. Buscar treinos de amanhã
    const tomorrowWorkouts = await prisma.customWorkout.findMany({
      where: {
        date: {
          gte: tomorrowStart,
          lt: tomorrowEnd
        },
        week: {
          plan: {
            athleteProfile: {
              userId: user.id
            }
          }
        }
      },
      include: {
        executedWorkout: true
      }
    });

    console.log('[CLEAN-TOMORROW] Found workouts:', tomorrowWorkouts.length);

    const cleaned = [];
    const skipped = [];

    for (const workout of tomorrowWorkouts) {
      console.log(`\n[CLEAN-TOMORROW] Workout #${workout.id}:`);
      console.log(`  - Title: ${workout.title}`);
      console.log(`  - isCompleted: ${workout.isCompleted}`);
      console.log(`  - wasSubstitution: ${workout.wasSubstitution}`);
      console.log(`  - executedWorkoutId: ${workout.executedWorkoutId}`);

      if (workout.isCompleted || workout.executedWorkoutId) {
        console.log(`  ⚠️ RESETTING...`);

        const executedId = workout.executedWorkoutId;

        // Resetar CustomWorkout
        await prisma.customWorkout.update({
          where: { id: workout.id },
          data: {
            isCompleted: false,
            wasSubstitution: false,
            executedWorkout: {
              disconnect: true
            }
          }
        });

        console.log(`  ✅ CustomWorkout #${workout.id} reset`);

        // Limpar CompletedWorkout se existia
        if (executedId) {
          await prisma.completedWorkout.update({
            where: { id: executedId },
            data: {
              wasPlanned: false,
              plannedDate: null,
              wasSubstitution: false
            }
          });

          console.log(`  ✅ CompletedWorkout #${executedId} cleaned`);
        }

        cleaned.push({
          workoutId: workout.id,
          title: workout.title,
          executedWorkoutId: executedId
        });
      } else {
        console.log(`  ✅ Already clean`);
        skipped.push({
          workoutId: workout.id,
          title: workout.title
        });
      }
    }

    console.log('\n[CLEAN-TOMORROW] ========== CLEANUP COMPLETE ==========');

    return NextResponse.json({
      success: true,
      message: 'Treinos de amanhã limpos com sucesso',
      summary: {
        total: tomorrowWorkouts.length,
        cleaned: cleaned.length,
        skipped: skipped.length
      },
      details: {
        cleaned,
        skipped
      }
    });

  } catch (error: any) {
    console.error('[CLEAN-TOMORROW] ❌ ERROR:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
