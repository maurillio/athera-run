const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function addPassword() {
  const prisma = new PrismaClient();

  try {
    const email = 'mmaurillio2@gmail.com';
    const password = '123456789';

    console.log(`🔐 Adicionando senha para ${email}...`);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user with password
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    console.log('✅ Senha adicionada com sucesso!');
    console.log('  Email:', user.email);
    console.log('  ID:', user.id);
    console.log('\n📝 Credenciais:');
    console.log('  Email:', email);
    console.log('  Senha:', password);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addPassword();
