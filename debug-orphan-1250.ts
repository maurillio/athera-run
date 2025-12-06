import { prisma } from './lib/db';

async function debug() {
  // Buscar treino ID 1250
  const workout = await prisma.completedWorkout.findUnique({
    where: { id: 1250 },
    include: {
      athlete: true,
    }
  });

  console.log('=== TREINO ID 1250 ===');
  console.log('ID:', workout?.id);
  console.log('Data:', workout?.date);
  console.log('Type:', workout?.type);
  console.log('Distance:', workout?.distance);
  console.log('wasPlanned:', workout?.wasPlanned);
  console.log('plannedDate:', workout?.plannedDate);
  console.log('plannedWorkoutId:', workout?.plannedWorkoutId);
  console.log('athleteId:', workout?.athleteId);

  if (workout?.plannedWorkoutId) {
    const planned = await prisma.customWorkout.findUnique({
      where: { id: workout.plannedWorkoutId }
    });
    console.log('\n=== TREINO PLANEJADO VINCULADO ===');
    console.log('ID:', planned?.id);
    console.log('Title:', planned?.title);
    console.log('Date:', planned?.date);
    console.log('Type:', planned?.type);
    console.log('isCompleted:', planned?.isCompleted);
  }

  // Buscar treino de amanhã
  const tomorrow = new Date('2025-12-07T00:00:00.000Z');
  const tomorrowEnd = new Date('2025-12-07T23:59:59.999Z');
  
  const tomorrowWorkouts = await prisma.customWorkout.findMany({
    where: {
      week: {
        plan: {
          athleteProfile: {
            id: 85
          }
        }
      },
      date: {
        gte: tomorrow,
        lte: tomorrowEnd,
      }
    }
  });

  console.log('\n=== TREINOS DE AMANHÃ (07/DEZ) ===');
  console.log('Total:', tomorrowWorkouts.length);
  tomorrowWorkouts.forEach(w => {
    console.log(`- ID ${w.id}: ${w.title}, type=${w.type}, isCompleted=${w.isCompleted}`);
  });

  await prisma.$disconnect();
}

debug().catch(console.error);
