const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin() {
  try {
    const email = 'mmaurillio2@gmail.com';

    console.log(`🔐 Tornando ${email} administrador...\n`);

    const user = await prisma.user.update({
      where: { email },
      data: { isAdmin: true }
    });

    console.log('✅ Usuário promovido a administrador!');
    console.log(`  Email: ${user.email}`);
    console.log(`  ID: ${user.id}`);
    console.log(`  isAdmin: ${user.isAdmin}`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
