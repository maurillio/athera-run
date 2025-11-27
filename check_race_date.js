const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRaceDate() {
  try {
    const latestRaceGoal = await prisma.raceGoal.findFirst({
      where: {
        athlete: {
          email: 'mmaurillio2@gmail.com'
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        distance: true,
        targetDate: true,
        createdAt: true
      }
    });
    
    console.log('Latest race goal:', JSON.stringify(latestRaceGoal, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRaceDate();
