import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay, addDays } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reason, preserveHistory = true } = body;

    const userId = parseInt(session.user.id);

    // Buscar usuário e plano atual
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        trainingPlan: {
          include: {
            weeks: {
              include: { workouts: true },
              orderBy: { weekNumber: 'asc' }
            }
          }
        }
      }
    });

    if (!user?.trainingPlan) {
      return NextResponse.json({ error: 'No training plan found' }, { status: 404 });
    }

    const today = startOfDay(new Date());
    const plan = user.trainingPlan;

    if (preserveHistory) {
      // OPTION 1: Preservar histórico, ajustar apenas futuro
      
      // Encontrar a semana atual
      const currentWeek = plan.weeks.find(week => {
        const weekStart = new Date(week.startDate);
        const weekEnd = addDays(weekStart, 6);
        return today >= weekStart && today <= weekEnd;
      });

      if (!currentWeek) {
        return NextResponse.json({ error: 'Current week not found' }, { status: 404 });
      }

      // Marcar workouts passados como preservados
      const futureWorkouts = currentWeek.workouts.filter(w => {
        const workoutDate = new Date(w.date);
        return workoutDate >= today;
      });

      // Atualizar apenas workouts futuros com nova disponibilidade
      const newRunningDays = user.profile?.availableDays?.running || [];
      
      for (const workout of futureWorkouts) {
        const workoutDate = new Date(workout.date);
        const dayOfWeek = workoutDate.getDay();
        
        // Se workout não está mais nos dias disponíveis, remover
        if (!newRunningDays.includes(dayOfWeek) && workout.type === 'running') {
          await prisma.customWorkout.delete({ where: { id: workout.id } });
        }
      }

      // Redistribuir volume nas próximas semanas
      // (Lógica simplificada - pode ser expandida)
      
      return NextResponse.json({ 
        success: true,
        message: 'Plan adjusted from today forward',
        adjustmentType: 'incremental',
        preservedWorkouts: currentWeek.workouts.filter(w => new Date(w.date) < today).length,
        adjustedFrom: today.toISOString()
      });

    } else {
      // OPTION 2: Regenerar plano completo (não implementado aqui)
      return NextResponse.json({ 
        error: 'Full regeneration not implemented yet',
        suggestion: 'Use preserveHistory: true for now'
      }, { status: 501 });
    }

  } catch (error: any) {
    console.error('Auto-adjust error:', error);
    return NextResponse.json({ 
      error: 'Failed to adjust plan',
      details: error.message 
    }, { status: 500 });
  }
}
