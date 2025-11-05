import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true
      }
    });

    console.log('📋 Usuários encontrados:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.name}) ${user.isAdmin ? '[ADMIN]' : ''}`);
    });
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
