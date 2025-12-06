import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTomorrowWorkout() {
  console.log('🔍 Verificando treino de amanhã (Sábado, Semana 22)...\n');

  try {
    // 1. Buscar treino planejado de amanhã
    const plannedWorkouts = await prisma.workout.findMany({
      where: {
        dayName: 'Sábado',
        weekId: 22
      },
      include: {
        completedWorkouts: {
          orderBy: { completedAt: 'desc' }
        }
      }
    });

    console.log(`📋 Treinos planejados encontrados: ${plannedWorkouts.length}\n`);

    for (const planned of plannedWorkouts) {
      console.log(`\n🏃 TREINO PLANEJADO #${planned.id}:`);
      console.log(`   Dia: ${planned.dayName}`);
      console.log(`   Tipo: ${planned.type}`);
      console.log(`   Distância: ${planned.distance}km`);
      console.log(`   Ritmo: ${planned.pace}`);
      console.log(`   Descrição: ${planned.description.substring(0, 50)}...`);

      if (planned.completedWorkouts.length > 0) {
        console.log(`\n   ⚠️ COMPLETADOS ENCONTRADOS: ${planned.completedWorkouts.length}`);
        
        for (const completed of planned.completedWorkouts) {
          console.log(`\n   📍 Completed #${completed.id}:`);
          console.log(`      - Completado em: ${completed.date}`);
          console.log(`      - isCompleted: ${completed.isCompleted}`);
          console.log(`      - wasManualMatch: ${completed.wasManualMatch}`);
          console.log(`      - wasSubstitution: ${completed.wasSubstitution}`);
          console.log(`      - substitutionReason: ${completed.substitutionReason || 'N/A'}`);
          console.log(`      - originalWorkoutId: ${completed.plannedWorkoutId}`);
          console.log(`      - userId: ${completed.athleteId}`);
          console.log(`      - source: ${completed.source}`);
          console.log(`      - stravaActivityId: ${completed.stravaActivityId || 'N/A'}`);
        }
      } else {
        console.log(`   ✅ Nenhum completado (correto!)`);
      }
    }

    // 2. Buscar CustomWorkouts de amanhã
    console.log('\n\n🎯 CUSTOM WORKOUTS (Sábado):\n');
    
    const customWorkouts = await prisma.customWorkout.findMany({
      where: {
        date: {
          gte: new Date('2025-12-07T00:00:00Z'),
          lt: new Date('2025-12-08T00:00:00Z')
        }
      },
      include: {
        completedWorkout: true,
        executedWorkout: true
      }
    });

    console.log(`📋 Custom Workouts encontrados: ${customWorkouts.length}\n`);

    for (const custom of customWorkouts) {
      console.log(`\n🏃 CUSTOM WORKOUT #${custom.id}:`);
      console.log(`   Data: ${custom.date}`);
      console.log(`   Tipo: ${custom.type}`);
      console.log(`   Título: ${custom.title}`);
      console.log(`   isCompleted: ${custom.isCompleted}`);
      console.log(`   completedWorkoutId: ${custom.completedWorkoutId}`);
      console.log(`   executedWorkoutId: ${custom.executedWorkoutId}`);
      console.log(`   wasSubstitution: ${custom.wasSubstitution}`);

      if (custom.completedWorkout) {
        console.log(`\n   ⚠️ COMPLETED WORKOUT LINKADO:`);
        console.log(`      - ID: ${custom.completedWorkout.id}`);
        console.log(`      - Data: ${custom.completedWorkout.date}`);
        console.log(`      - Tipo: ${custom.completedWorkout.type}`);
        console.log(`      - wasSubstitution: ${custom.completedWorkout.wasSubstitution}`);
      }

      if (custom.executedWorkout) {
        console.log(`\n   🎯 EXECUTED WORKOUT:`);
        console.log(`      - ID: ${custom.executedWorkout.id}`);
        console.log(`      - Data: ${custom.executedWorkout.date}`);
        console.log(`      - Tipo: ${custom.executedWorkout.type}`);
      }
    }

    // 3. Buscar CompletedWorkouts de hoje que podem ter sido usados para substituir amanhã
    console.log('\n\n🔍 COMPLETED WORKOUTS DE HOJE (possível substituição):\n');

    const todayCompleted = await prisma.completedWorkout.findMany({
      where: {
        date: {
          gte: new Date('2025-12-06T00:00:00Z'),
          lt: new Date('2025-12-07T00:00:00Z')
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📋 Completados hoje: ${todayCompleted.length}\n`);

    for (const completed of todayCompleted) {
      console.log(`\n🏃 COMPLETED #${completed.id}:`);
      console.log(`   Data: ${completed.date}`);
      console.log(`   Tipo: ${completed.type}`);
      console.log(`   plannedWorkoutId: ${completed.plannedWorkoutId}`);
      console.log(`   wasSubstitution: ${completed.wasSubstitution}`);
      console.log(`   substitutedWorkoutId: ${completed.substitutedWorkoutId}`);
      console.log(`   source: ${completed.source}`);
      console.log(`   stravaActivityId: ${completed.stravaActivityId || 'N/A'}`);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTomorrowWorkout();
