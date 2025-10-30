import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const prisma = new PrismaClient();

async function markUncompletedWorkouts() {
  try {
    console.log('Iniciando job: Marcar treinos não completados...');

    // Definir o fuso horário para São Paulo (ou o fuso horário da aplicação)
    // Para garantir que "ontem" seja consistente
    const appTimezone = 'America/Sao_Paulo'; // Ou o fuso horário configurado para a aplicação

    const yesterday = dayjs().tz(appTimezone).subtract(1, 'day');
    const startOfYesterday = yesterday.startOf('day').toDate();
    const endOfYesterday = yesterday.endOf('day').toDate();

    console.log(`Verificando treinos para o dia: ${yesterday.format('YYYY-MM-DD')}`);

    // Encontrar CustomWorkouts do dia anterior que não foram completados
    const uncompletedWorkouts = await prisma.customWorkout.findMany({
      where: {
        date: {
          gte: startOfYesterday,
          lte: endOfYesterday,
        },
        isCompleted: false,
      },
      include: {
        week: {
          include: {
            plan: true,
          },
        },
      },
    });

    console.log(`Encontrados ${uncompletedWorkouts.length} treinos não completados para o dia anterior.`);

    for (const workout of uncompletedWorkouts) {
      console.log(`Processando treino ID: ${workout.id}, Título: ${workout.title}`);

      // Se houver um CompletedWorkout associado, deletá-lo
      if (workout.completedWorkoutId) {
        await prisma.completedWorkout.delete({
          where: { id: workout.completedWorkoutId },
        });
        console.log(`  - CompletedWorkout ID ${workout.completedWorkoutId} deletado.`);
      }

      // Atualizar o CustomWorkout para garantir isCompleted: false e completedWorkoutId: null
      await prisma.customWorkout.update({
        where: { id: workout.id },
        data: {
          isCompleted: false,
          completedWorkoutId: null,
        },
      });
      console.log(`  - CustomWorkout ID ${workout.id} atualizado para não completado.`);

      // Recalcular a contagem de treinos completados na semana e no plano
      // (Esta lógica precisa ser mais robusta para lidar com increment/decrement)
      // Por simplicidade, vamos re-fetch e recalcular tudo.
      const updatedWeek = await prisma.customWeek.findUnique({
        where: { id: workout.week.id },
        include: {
          workouts: true, // Incluir CustomWorkouts para contar isCompleted
          plan: {
            include: {
              weeks: {
                include: {
                  workouts: true,
                },
              },
            },
          },
        },
      });

      if (updatedWeek) {
        const completedWorkoutsInWeek = updatedWeek.workouts.filter(w => w.isCompleted).length;
        await prisma.customWeek.update({
          where: { id: updatedWeek.id },
          data: {
            completedWorkouts: completedWorkoutsInWeek,
          },
        });
        console.log(`  - CustomWeek ID ${updatedWeek.id} contagem de completados atualizada.`);

        if (updatedWeek.plan) {
          const totalWorkoutsInPlan = updatedWeek.plan.weeks.reduce((sum, week) => sum + week.totalWorkouts, 0);
          const completedWorkoutsInPlan = updatedWeek.plan.weeks.reduce(
            (sum, week) => sum + week.workouts.filter(w => w.isCompleted).length,
            0
          );
          const completionRate = totalWorkoutsInPlan > 0 ? (completedWorkoutsInPlan / totalWorkoutsInPlan) * 100 : 0;

          await prisma.customTrainingPlan.update({
            where: { id: updatedWeek.plan.id },
            data: {
              completionRate,
            },
          });
          console.log(`  - CustomTrainingPlan ID ${updatedWeek.plan.id} taxa de conclusão atualizada.`);
        }
      }
    }

    console.log('Job concluído: Marcar treinos não completados.');
  } catch (error) {
    console.error('Erro no job de marcar treinos não completados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

markUncompletedWorkouts();