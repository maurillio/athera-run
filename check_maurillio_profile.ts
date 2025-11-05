import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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

    console.log('✅ Usuário encontrado:');
    console.log('- Email:', user.email);
    console.log('- Nome:', user.name);
    
    if (user.athleteProfile) {
      console.log('\n✅ Perfil de atleta encontrado:');
      console.log('- Nível:', user.athleteProfile.runningLevel);
      console.log('- Objetivo:', user.athleteProfile.goalDistance);
      console.log('- Data da Prova:', user.athleteProfile.targetRaceDate);
      console.log('- KM Semanal Atual:', user.athleteProfile.currentWeeklyKm);
      console.log('- Maior Corrida:', user.athleteProfile.longestRun);
      console.log('- Peso:', user.athleteProfile.weight);
      console.log('- Training Activities:', JSON.stringify(user.athleteProfile.trainingActivities, null, 2));
      console.log('- Usual Paces:', JSON.stringify(user.athleteProfile.usualPaces, null, 2));
    } else {
      console.log('\n❌ Perfil de atleta NÃO encontrado');
      console.log('O usuário precisa completar o onboarding primeiro!');
    }
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
