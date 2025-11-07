import prisma from './lib/db';

async function testDeleteProfile() {
  try {
    console.log('🔍 Testando fluxo de exclusão de perfil...\n');

    // 1. Verificar estrutura de dados
    const users = await prisma.user.findMany({
      take: 1,
      include: {
        athleteProfile: {
          include: {
            customPlan: true,
            raceGoals: true
          }
        }
      }
    });

    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado');
      return;
    }

    const user = users[0];
    console.log('👤 Usuário:', user.email);
    console.log('📊 Tem perfil:', !!user.athleteProfile);
    
    if (user.athleteProfile) {
      console.log('  - ID do perfil:', user.athleteProfile.id);
      console.log('  - Tem plano customizado:', !!user.athleteProfile.customPlan);
      console.log('  - Número de corridas:', user.athleteProfile.raceGoals?.length || 0);
      
      if (user.athleteProfile.customPlan) {
        const weeks = await prisma.customWeek.count({
          where: { planId: user.athleteProfile.customPlan.id }
        });
        console.log('  - Semanas do plano:', weeks);
        
        const workouts = await prisma.customWorkout.count({
          where: {
            week: {
              planId: user.athleteProfile.customPlan.id
            }
          }
        });
        console.log('  - Workouts do plano:', workouts);
      }
      
      const completedWorkouts = await prisma.completedWorkout.count({
        where: { athleteId: user.athleteProfile.id }
      });
      console.log('  - Treinos completados:', completedWorkouts);
      
      const feedback = await prisma.athleteFeedback.count({
        where: { userId: user.id }
      });
      console.log('  - Feedbacks:', feedback);
    }

    console.log('\n✅ Análise concluída');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDeleteProfile();
