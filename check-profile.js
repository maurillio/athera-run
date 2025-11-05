const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProfile() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'mmaurillio2@gmail.com' },
      include: {
        athleteProfile: true
      }
    });
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    console.log('📊 Status do usuário:');
    console.log('- Email:', user.email);
    console.log('- isAdmin:', user.isAdmin);
    console.log('- isPremium:', user.isPremium);
    console.log('- Tem perfil:', !!user.athleteProfile);
    
    if (user.athleteProfile) {
      console.log('\n✅ Perfil existe!');
      console.log('- ID:', user.athleteProfile.id);
      console.log('- Peso:', user.athleteProfile.weight);
      console.log('- Nível:', user.athleteProfile.runningLevel);
    } else {
      console.log('\n❌ PERFIL NÃO ENCONTRADO - Este é o problema!');
      console.log('Usuário precisa completar onboarding');
    }
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProfile();
