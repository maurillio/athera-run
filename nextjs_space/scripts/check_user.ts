import { prisma } from '../lib/db';
import bcrypt from 'bcryptjs';

async function checkAndFixUser() {
  try {
    console.log('Verificando usuário...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'mmaurillio2@gmail.com' }
    });

    if (user) {
      console.log('✅ Usuário encontrado:', {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        hasPassword: !!user.password
      });
      
      // Verify password
      if (user.password) {
        const isValid = await bcrypt.compare('123456789', user.password);
        console.log('Senha válida:', isValid);
        
        if (!isValid) {
          console.log('Atualizando senha...');
          const hashedPassword = await bcrypt.hash('123456789', 10);
          await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
          });
          console.log('✅ Senha atualizada');
        }
      } else {
        console.log('Criando senha...');
        const hashedPassword = await bcrypt.hash('123456789', 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        });
        console.log('✅ Senha criada');
      }
    } else {
      console.log('❌ Usuário não encontrado. Criando...');
      const hashedPassword = await bcrypt.hash('123456789', 10);
      const newUser = await prisma.user.create({
        data: {
          email: 'mmaurillio2@gmail.com',
          name: 'Maurillio',
          password: hashedPassword,
          isAdmin: true,
          emailVerified: new Date()
        }
      });
      console.log('✅ Usuário criado:', newUser);
    }
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixUser();
