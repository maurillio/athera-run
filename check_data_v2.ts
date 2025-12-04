import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_tNo7USDdOam4@ep-hidden-resonance-adhktxy0-pooler.c-2.us-east-1.aws.neon.tech/maratona?sslmode=require'
    }
  }
});

async function check() {
  console.log('\n=== DOMINGO 30/11 - Treino Planejado ===');
  const sunday = await prisma.customWorkout.findFirst({
    where: { date: new Date('2025-11-30T12:00:00.000Z') }
  });
  console.log(JSON.stringify(sunday, null, 2));
  
  console.log('\n=== SÁBADO 29/11 - Treino Executado ===');
  const saturdayRun = await prisma.completedWorkout.findFirst({
    where: {
      date: {
        gte: new Date('2025-11-29T00:00:00.000Z'),
        lt: new Date('2025-11-30T00:00:00.000Z')
      },
      type: 'Run'
    }
  });
  console.log(JSON.stringify(saturdayRun, null, 2));
  
  await prisma.$disconnect();
}

check().catch(console.error);
