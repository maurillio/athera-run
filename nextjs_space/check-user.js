const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'mmaurillio2@gmail.com' },
      include: { athleteProfile: true }
    });

    if (user) {
      console.log('✅ USUÁRIO AINDA EXISTE:');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Name:', user.name);
      console.log('AthleteProfile:', user.athleteProfile);
    } else {
      console.log('❌ USUÁRIO FOI COMPLETAMENTE DELETADO');
    }
  } catch (error) {
    console.error('Erro ao verificar:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
