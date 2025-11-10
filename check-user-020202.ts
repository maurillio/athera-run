import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: { email: 'teste020202@teste.com' },
    include: {
      athleteProfile: {
        include: {
          raceGoals: {
            orderBy: { priority: 'asc' }
          }
        }
      }
    }
  });
  
  if (!user) {
    console.log('❌ User not found');
    return;
  }
  
  console.log('✅ User found:', user.email);
  console.log('User ID:', user.id);
  console.log('\n📋 Profile Data:');
  console.log('  Long Run Day:', user.athleteProfile?.longRunDay);
  console.log('  Running Level:', user.athleteProfile?.runningLevel);
  
  console.log('\n🏁 Race Goals:');
  if (!user.athleteProfile?.raceGoals || user.athleteProfile.raceGoals.length === 0) {
    console.log('  ❌ NO RACE GOALS FOUND!');
  } else {
    user.athleteProfile.raceGoals.forEach((race, idx) => {
      const dayOfWeek = race.raceDate.getDay();
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      console.log(`\n  Race ${idx + 1}:`);
      console.log(`    Name: ${race.raceName}`);
      console.log(`    Date: ${race.raceDate.toISOString()}`);
      console.log(`    Date (local): ${race.raceDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
      console.log(`    Day of week: ${dayNames[dayOfWeek]} (${dayOfWeek})`);
      console.log(`    Priority: ${race.priority}`);
      console.log(`    Distance: ${race.distance}`);
      console.log(`    Target Time: ${race.targetTime || 'N/A'}`);
    });
  }
  
  // Check training plan
  const plan = await prisma.customTrainingPlan.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      weeks: {
        include: {
          workouts: {
            orderBy: { date: 'asc' }
          }
        },
        orderBy: { weekNumber: 'asc' }
      }
    }
  });
  
  if (!plan) {
    console.log('\n❌ NO TRAINING PLAN FOUND');
    await prisma.$disconnect();
    return;
  }
  
  console.log(`\n📅 Training Plan:`);
  console.log(`  Plan ID: ${plan.id}`);
  console.log(`  Created: ${plan.createdAt.toISOString()}`);
  console.log(`  Start: ${plan.startDate.toISOString()}`);
  console.log(`  End: ${plan.endDate.toISOString()}`);
  console.log(`  Total weeks: ${plan.weeks.length}`);
  
  // Find race date and check that week
  if (user.athleteProfile?.raceGoals && user.athleteProfile.raceGoals.length > 0) {
    const raceA = user.athleteProfile.raceGoals.find(r => r.priority === 'A');
    if (raceA) {
      const raceDate = raceA.raceDate;
      console.log(`\n🔍 Looking for week containing race date: ${raceDate.toISOString().split('T')[0]}`);
      
      const raceWeek = plan.weeks.find(week => {
        return week.startDate <= raceDate && week.endDate >= raceDate;
      });
      
      if (!raceWeek) {
        console.log('  ❌ RACE WEEK NOT FOUND IN PLAN!');
      } else {
        console.log(`  ✅ Found in Week ${raceWeek.weekNumber}`);
        console.log(`     Week range: ${raceWeek.startDate.toISOString().split('T')[0]} to ${raceWeek.endDate.toISOString().split('T')[0]}`);
        console.log(`\n  📋 Workouts in race week:`);
        
        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        raceWeek.workouts.forEach(workout => {
          const day = workout.date.getDay();
          const isRaceDay = workout.date.toISOString().split('T')[0] === raceDate.toISOString().split('T')[0];
          const marker = isRaceDay ? '🏁 RACE DAY 🏁' : '';
          console.log(`    ${workout.date.toISOString().split('T')[0]} (${dayNames[day]}): ${workout.type} - ${workout.title} ${marker}`);
        });
        
        // Check if race workout exists
        const raceWorkout = raceWeek.workouts.find(w => w.type === 'race');
        if (!raceWorkout) {
          console.log('\n  ❌ ERROR: NO RACE WORKOUT FOUND IN RACE WEEK!');
          console.log('  This is the bug - race should have type="race"');
        } else {
          console.log('\n  ✅ Race workout found:', raceWorkout.title);
        }
      }
    }
  }
  
  await prisma.$disconnect();
}

checkUser().catch(console.error);
