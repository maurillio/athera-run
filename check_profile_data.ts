import { prisma } from './lib/db';

async function checkProfileData() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'mmaurillio2@gmail.com' },
      include: {
        athleteProfile: true
      }
    });

    if (!user) {
      console.log('Usuário não encontrado');
      return;
    }

    console.log('===== DADOS DO USUÁRIO =====');
    console.log('Email:', user.email);
    console.log('ID:', user.id);
    console.log('\n===== PERFIL DO ATLETA =====');
    
    if (user.athleteProfile) {
      console.log('Perfil existe:',  true);
      console.log('Weight:', user.athleteProfile.weight);
      console.log('Height:', user.athleteProfile.height);
      console.log('Goal Distance:', user.athleteProfile.goalDistance);
      console.log('Running Level:', user.athleteProfile.runningLevel);
      console.log('\n===== TRAINING ACTIVITIES =====');
      console.log('Type:', typeof user.athleteProfile.trainingActivities);
      console.log('Value:', JSON.stringify(user.athleteProfile.trainingActivities, null, 2));
    } else {
      console.log('Perfil não encontrado');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProfileData();
