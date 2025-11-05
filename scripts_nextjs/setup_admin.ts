
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔧 Configurando usuário admin...');

    // Buscar o usuário john@doe.com para torná-lo admin
    const johnUser = await prisma.user.findUnique({
      where: { email: 'john@doe.com' }
    });

    if (johnUser) {
      await prisma.user.update({
        where: { email: 'john@doe.com' },
        data: {
          isAdmin: true,
          isPremium: true
        }
      });
      console.log('✅ john@doe.com configurado como admin');
    }

    // Buscar o usuário Maurillio
    const maurillioUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { contains: 'maurillio', mode: 'insensitive' } },
          { name: { contains: 'maurillio', mode: 'insensitive' } }
        ]
      }
    });

    if (maurillioUser) {
      console.log(`📧 Usuário encontrado: ${maurillioUser.email}`);
      console.log(`📛 Nome: ${maurillioUser.name}`);
      console.log(`👑 Premium antes: ${maurillioUser.isPremium}`);
      
      const updated = await prisma.user.update({
        where: { id: maurillioUser.id },
        data: {
          isPremium: true,
          subscriptionStatus: 'active',
          isAdmin: true // Tornando admin também para facilitar
        }
      });

      console.log(`✅ Usuário atualizado!`);
      console.log(`👑 Premium agora: ${updated.isPremium}`);
      console.log(`🛡️  Admin agora: ${updated.isAdmin}`);
    } else {
      console.log('⚠️  Usuário Maurillio não encontrado');
      console.log('📋 Listando todos os usuários:');
      
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          isPremium: true,
          isAdmin: true,
          createdAt: true
        }
      });

      allUsers.forEach(user => {
        console.log(`  - ${user.email} | ${user.name} | Premium: ${user.isPremium} | Admin: ${user.isAdmin}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
