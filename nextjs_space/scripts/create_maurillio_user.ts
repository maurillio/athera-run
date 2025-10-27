import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUser() {
  try {
    const email = 'mmaurillio2@gmail.com';
    const password = '123456789';
    const name = 'Maurillio';

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar o usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        isAdmin: true // Definindo como admin
      }
    });

    console.log('✅ Usuário criado com sucesso!');
    console.log(`Email: ${user.email}`);
    console.log(`Nome: ${user.name}`);
    console.log(`Admin: ${user.isAdmin}`);
    console.log(`Senha: 123456789`);
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
