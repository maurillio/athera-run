import prisma from './lib/db';

async function checkTestUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'Teste0101019@teste.com' },
      include: {
        athleteProfile: {
          include: {
            customPlan: {
              include: {
                weeks: {
                  include: {
                    workouts: true
                  },
                  orderBy: { weekNumber: 'asc' },
                  take: 2
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log('✅ Usuário encontrado:', user.email);
    console.log('\n📋 Perfil:');
    console.log('  - hasCustomPlan:', user.athleteProfile?.hasCustomPlan);
    console.log('  - customPlanId:', user.athleteProfile?.customPlanId);
    
    if (user.athleteProfile?.customPlan) {
      const plan = user.athleteProfile.customPlan;
      console.log('\n📅 Plano:');
      console.log('  - ID:', plan.id);
      console.log('  - Goal:', plan.goalDistance);
      console.log('  - Race Date:', plan.targetRaceDate);
      console.log('  - Total Weeks:', plan.totalWeeks);
      console.log('  - Current Week:', plan.currentWeek);
      console.log('  - Weeks count:', plan.weeks?.length || 0);
      
      if (plan.weeks && plan.weeks.length > 0) {
        console.log('\n  Primeira semana:');
        const w = plan.weeks[0];
        console.log('    - Week #:', w.weekNumber);
        console.log('    - Start:', w.startDate);
        console.log('    - End:', w.endDate);
        console.log('    - Workouts:', w.workouts?.length || 0);
      }
    } else {
      console.log('\n❌ Plano não encontrado');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTestUser();
