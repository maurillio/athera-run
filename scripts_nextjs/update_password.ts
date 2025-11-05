import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updatePassword() {
  try {
    const email = 'mmaurillio2@gmail.com';
    const newPassword = '123456789';

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar a senha do usuário
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    console.log(`✅ Senha atualizada com sucesso para o usuário: ${updatedUser.email}`);
    console.log(`Nome: ${updatedUser.name}`);
  } catch (error) {
    console.error('❌ Erro ao atualizar senha:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();
