const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAdminUser() {
  try {
    console.log('🔧 Restaurando privilégios de administrador...\n');
    
    const email = 'mmaurillio2@gmail.com';
    
    // 1. Buscar dados atuais
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        isPremium: true,
        createdAt: true
      }
    });
    
    if (!user) {
      console.log('❌ Usuário não encontrado!');
      return;
    }
    
    console.log('📊 Dados atuais:');
    console.log('- Email:', user.email);
    console.log('- Nome:', user.name);
    console.log('- isAdmin:', user.isAdmin);
    console.log('- isPremium:', user.isPremium);
    
    // 2. Atualizar para admin
    console.log('\n🔧 Restaurando status de administrador...');
    
    const updated = await prisma.user.update({
      where: { email },
      data: { 
        isAdmin: true,
        isPremium: true  // Garantir premium também
      },
      select: {
        id: true,
        email: true,
        isAdmin: true,
        isPremium: true
      }
    });
    
    console.log('\n✅ ADMINISTRADOR RESTAURADO COM SUCESSO!');
    console.log('- Email:', updated.email);
    console.log('- isAdmin:', updated.isAdmin);
    console.log('- isPremium:', updated.isPremium);
    
    console.log('\n📋 Próximos passos:');
    console.log('1. Fazer logout');
    console.log('2. Fazer login novamente');
    console.log('3. Verificar acesso ao /admin');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminUser();
