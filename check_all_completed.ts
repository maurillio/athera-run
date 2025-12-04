import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_tNo7USDdOam4@ep-hidden-resonance-adhktxy0-pooler.c-2.us-east-1.aws.neon.tech/maratona?sslmode=require'
    }
  }
});

async function check() {
  console.log('\n=== TODOS TREINOS EXECUTADOS (25/11 a 01/12) ===');
  const runs = await prisma.completedWorkout.findMany({
    where: {
      date: {
        gte: new Date('2025-11-25T00:00:00.000Z'),
        lt: new Date('2025-12-02T00:00:00.000Z')
      }
    },
    orderBy: { date: 'asc' }
  });
  
  runs.forEach(run => {
    console.log(`\n${new Date(run.date).toLocaleDateString('pt-BR')}: ${run.name || run.type} - ${run.distance}km - plannedWorkoutId: ${run.plannedWorkoutId}`);
  });
  
  await prisma.$disconnect();
}

check().catch(console.error);
