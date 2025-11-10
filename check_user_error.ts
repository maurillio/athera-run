import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'Teste0101019@teste.com' },
      include: {
        athleteProfile: {
          include: {
            raceGoals: true,
          }
        }
      }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log('\n✅ Usuário encontrado:', user.email);
    console.log('\n📋 Perfil:');
    if (user.athleteProfile) {
      const profile = user.athleteProfile;
      console.log('  - Goal Distance:', profile.goalDistance);
      console.log('  - Target Race Date:', profile.targetRaceDate);
      console.log('  - Running Level:', profile.runningLevel);
      console.log('  - Training Schedule:', JSON.stringify(profile.trainingSchedule, null, 2));
      console.log('  - Training Activities:', JSON.stringify(profile.trainingActivities, null, 2));
      console.log('  - Long Run Day:', profile.longRunDay);
      console.log('  - Custom Plan ID:', profile.customPlanId);
      console.log('  - Has Custom Plan:', profile.hasCustomPlan);
      
      console.log('\n🏁 Race Goals:', profile.raceGoals.length);
      profile.raceGoals.forEach(race => {
        console.log(`  - ${race.priority}: ${race.raceName} (${race.distance}) em ${race.raceDate.toISOString().split('T')[0]} - Status: ${race.status}`);
      });
    } else {
      console.log('❌ Sem perfil de atleta');
    }

    // Verificar se existe plano
    if (user.athleteProfile?.customPlanId) {
      const plan = await prisma.customTrainingPlan.findUnique({
        where: { id: user.athleteProfile.customPlanId },
        include: {
          weeks: {
            include: {
              workouts: true
            }
          }
        }
      });

      if (plan) {
        console.log('\n📅 Plano existente:');
        console.log('  - ID:', plan.id);
        console.log('  - Start Date:', plan.startDate);
        console.log('  - Target Race Date:', plan.targetRaceDate);
        console.log('  - Total Weeks:', plan.totalWeeks);
        console.log('  - Weeks no banco:', plan.weeks.length);
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
