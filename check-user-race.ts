import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: { email: 'teste932939@teste.com' },
    include: {
      athleteProfile: {
        include: {
          raceGoals: true
        }
      },
      trainingPlan: {
        include: {
          weeks: {
            include: {
              workouts: true
            },
            orderBy: { weekNumber: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });
  
  if (!user) {
    console.log('User not found');
    return;
  }
  
  console.log('User:', user.email);
  console.log('Profile longRunDay:', user.athleteProfile?.longRunDay);
  console.log('\nRace Goals:');
  user.athleteProfile?.raceGoals?.forEach(race => {
    const dayOfWeek = race.raceDate.getDay();
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    console.log(`  - ${race.raceName}`);
    console.log(`    Date: ${race.raceDate.toISOString().split('T')[0]} (${dayNames[dayOfWeek]})`);
    console.log(`    Priority: ${race.priority}, Distance: ${race.distance}`);
  });
  
  if (user.trainingPlan && user.trainingPlan.length > 0) {
    const plan = user.trainingPlan[0];
    console.log(`\nTraining Plan created: ${plan.createdAt.toISOString()}`);
    console.log(`Total weeks: ${plan.weeks.length}`);
    
    // Find week with race
    const raceDate = user.athleteProfile?.raceGoals?.[0]?.raceDate;
    if (raceDate) {
      const raceWeek = plan.weeks.find(week => {
        return week.startDate <= raceDate && week.endDate >= raceDate;
      });
      
      if (raceWeek) {
        console.log(`\nWeek ${raceWeek.weekNumber} (RACE WEEK - ${raceWeek.startDate.toISOString().split('T')[0]} to ${raceWeek.endDate.toISOString().split('T')[0]}):`);
        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        raceWeek.workouts.forEach(workout => {
          const day = workout.date.getDay();
          console.log(`  ${workout.date.toISOString().split('T')[0]} (${dayNames[day]}): ${workout.type} - ${workout.title}`);
        });
      }
    }
  }
  
  await prisma.$disconnect();
}

checkUser().catch(console.error);
