import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testQuery() {
  try {
    console.log('Testing race goal query with new filter...');
    
    const raceGoals = await prisma.raceGoal.findMany({
      where: {
        athleteId: 60, // teste47474
        status: {
          in: ['active', 'upcoming']
        }
      },
      orderBy: {
        raceDate: 'asc'
      }
    });
    
    console.log('✅ Query successful!');
    console.log('Found races:', raceGoals.length);
    
    if (raceGoals.length > 0) {
      raceGoals.forEach(race => {
        console.log(`  - ${race.raceName}: ${race.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Query failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testQuery();
