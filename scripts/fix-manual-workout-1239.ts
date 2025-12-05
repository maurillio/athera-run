import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Corrigindo treino manual ID 1239...\n');
  
  const result = await prisma.completedWorkout.update({
    where: { id: 1239 },
    data: {
      wasPlanned: false,
      plannedDate: null
    }
  });
  
  console.log('✅ Treino corrigido:', result);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
