import { PrismaClient } from '@prisma/client';

const DATABASE_URL = 'postgresql://neondb_owner:npg_tNo7USDdOam4@ep-hidden-resonance-a-pooler.us-east-1.aws.neon.tech/maratona?sslmode=require&channel_binding=require';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

async function cleanTomorrow() {
  console.log('🔧 Limpando treino de amanhã (07/DEZ)...\n');

  try {
    // 1. Verificar estado atual
    console.log('📊 ESTADO ATUAL:');
    const current = await prisma.customWorkout.findMany({
      where: {
        date: {
          gte: new Date('2025-12-07T00:00:00Z'),
          lt: new Date('2025-12-08T00:00:00Z')
        }
      },
      include: {
        executedWorkout: true
      }
    });

    console.log(`Encontrados: ${current.length} treinos\n`);
    
    for (const w of current) {
      console.log(`ID: ${w.id} | ${w.title}`);
      console.log(`  isCompleted: ${w.isCompleted}`);
      console.log(`  wasSubstitution: ${w.wasSubstitution}`);
      console.log(`  executedWorkoutId: ${w.executedWorkoutId}`);
      console.log('');
    }

    // 2. Limpar treinos marcados incorretamente
    let cleaned = 0;
    for (const w of current) {
      if (w.isCompleted || w.executedWorkoutId) {
        console.log(`⚠️ Limpando workout #${w.id}...`);
        
        const executedId = w.executedWorkoutId;
        
        // Limpar CustomWorkout
        await prisma.customWorkout.update({
          where: { id: w.id },
          data: {
            isCompleted: false,
            wasSubstitution: false,
            executedWorkout: executedId ? { disconnect: true } : undefined
          }
        });
        
        // Limpar CompletedWorkout se existir
        if (executedId) {
          await prisma.completedWorkout.update({
            where: { id: executedId },
            data: {
              wasPlanned: false,
              plannedDate: null,
              wasSubstitution: false
            }
          });
        }
        
        cleaned++;
        console.log(`✅ Workout #${w.id} limpo!`);
      }
    }

    console.log(`\n✅ Limpeza concluída! ${cleaned} treinos limpos.`);

    // 3. Verificar resultado final
    console.log('\n📊 ESTADO FINAL:');
    const final = await prisma.customWorkout.findMany({
      where: {
        date: {
          gte: new Date('2025-12-07T00:00:00Z'),
          lt: new Date('2025-12-08T00:00:00Z')
        }
      }
    });

    for (const w of final) {
      console.log(`ID: ${w.id} | ${w.title}`);
      console.log(`  isCompleted: ${w.isCompleted} (deve ser false)`);
      console.log(`  wasSubstitution: ${w.wasSubstitution} (deve ser false)`);
      console.log(`  executedWorkoutId: ${w.executedWorkoutId} (deve ser null)`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanTomorrow()
  .then(() => {
    console.log('\n🎉 Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script falhou:', error);
    process.exit(1);
  });
