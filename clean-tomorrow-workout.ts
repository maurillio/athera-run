/**
 * Script para limpar treino de amanhã (07/DEZ) marcado incorretamente
 * 
 * PROBLEMA: Treino de amanhã (Sábado 07/DEZ) está marcado como completo
 * quando deveria estar como planejado. Match via pop-up não funcionou corretamente.
 * 
 * SOLUÇÃO: Resetar o estado do treino de amanhã
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanTomorrowWorkout() {
  console.log('🔧 Limpando treino de amanhã (Sábado 07/DEZ)...\n');

  try {
    // 1. Buscar treinos de amanhã (Custom Workouts)
    const tomorrowWorkouts = await prisma.customWorkout.findMany({
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

    console.log(`📋 Treinos de amanhã encontrados: ${tomorrowWorkouts.length}\n`);

    for (const workout of tomorrowWorkouts) {
      console.log(`\n🏃 CustomWorkout #${workout.id}:`);
      console.log(`   Título: ${workout.title}`);
      console.log(`   isCompleted: ${workout.isCompleted}`);
      console.log(`   wasSubstitution: ${workout.wasSubstitution}`);
      console.log(`   executedWorkoutId: ${workout.executedWorkoutId}`);

      if (workout.isCompleted || workout.executedWorkoutId) {
        console.log(`\n   ⚠️ TREINO MARCADO INCORRETAMENTE! Resetando...`);

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

        console.log(`   ✅ CustomWorkout #${workout.id} resetado`);

        // Se tinha executedWorkout, limpar metadados
        if (workout.executedWorkoutId) {
          await prisma.completedWorkout.update({
            where: { id: workout.executedWorkoutId },
            data: {
              wasPlanned: false,
              plannedDate: null,
              wasSubstitution: false
            }
          });

          console.log(`   ✅ CompletedWorkout #${workout.executedWorkoutId} limpo`);
        }
      } else {
        console.log(`   ✅ Treino já está correto (não completado)`);
      }
    }

    console.log('\n\n✅ Limpeza concluída com sucesso!');

  } catch (error) {
    console.error('\n❌ Erro durante limpeza:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
cleanTomorrowWorkout()
  .then(() => {
    console.log('\n🎉 Script finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script falhou:', error);
    process.exit(1);
  });
