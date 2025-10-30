const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    // Procurar um usuário
    const user = await prisma.user.findFirst({
      take: 1,
      include: { athleteProfile: true }
    });

    if (!user) {
      console.log('Nenhum usuário encontrado');
      return;
    }

    console.log('Usuário encontrado:', user.email);
    console.log('AthleteProfile:', user.athleteProfile);

    if (user.athleteProfile) {
      console.log('\nCampos Strava:');
      console.log('- stravaConnected:', user.athleteProfile.stravaConnected);
      console.log('- stravaAthleteId:', user.athleteProfile.stravaAthleteId);
      console.log('- stravaAccessToken:', user.athleteProfile.stravaAccessToken ? 'Tem token' : 'Sem token');
    }
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
