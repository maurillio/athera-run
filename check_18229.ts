import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_tNo7USDdOam4@ep-hidden-resonance-adhktxy0-pooler.c-2.us-east-1.aws.neon.tech/maratona?sslmode=require'
    }
  }
});

async function check() {
  const workout = await prisma.customWorkout.findUnique({ where: { id: 18229 } });
  console.log('\n=== CustomWorkout ID 18229 ===');
  console.log(JSON.stringify(workout, null, 2));
  
  await prisma.$disconnect();
}

check().catch(console.error);
