import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createProfile() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'mmaurillio2@gmail.com' },
      include: { athleteProfile: true }
    });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    if (user.athleteProfile) {
      console.log('✅ User already has a profile!');
      return;
    }
    
    // Criar perfil de atleta
    const profile = await prisma.athleteProfile.create({
      data: {
        userId: user.id,
        weight: 75.0,
        height: 175.0,
        age: 35,
        gender: 'male',
        runningLevel: 'intermediate',
        currentWeeklyKm: 30.0,
        longestRun: 15.0,
        goalDistance: 'marathon',
        targetRaceDate: new Date('2026-08-30'),
        targetTime: '4:00:00',
      }
    });
    
    console.log('✅ Profile created successfully!');
    console.log('  Profile ID:', profile.id);
    console.log('  Goal Distance:', profile.goalDistance);
    console.log('  Running Level:', profile.runningLevel);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createProfile();
