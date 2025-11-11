import prisma from './lib/db';

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'teste939393@teste.com' },
      include: {
        athleteProfile: {
          include: {
            customPlan: {
              include: {
                weeks: {
                  include: {
                    workouts: {
                      include: {
                        completedWorkout: true,
                      },
                    },
                  },
                  orderBy: { weekNumber: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log('✅ Usuário encontrado:', user.email);
    console.log('✅ Tem perfil:', !!user.athleteProfile);
    console.log('✅ Has custom plan:', user.athleteProfile?.hasCustomPlan);
    console.log('✅ Custom plan exists:', !!user.athleteProfile?.customPlan);
    
    if (user.athleteProfile?.customPlan) {
      const plan = user.athleteProfile.customPlan;
      console.log('\n📋 Plano:');
      console.log('  - ID:', plan.id);
      console.log('  - Semanas:', plan.weeks?.length || 0);
      console.log('  - Goal Distance:', plan.goalDistance);
      console.log('  - Target Race Date:', plan.targetRaceDate);
      console.log('  - Start Date:', plan.startDate);
      
      if (plan.weeks && plan.weeks.length > 0) {
        console.log('\n📅 Primeira semana:');
        const firstWeek = plan.weeks[0];
        console.log('  - Week Number:', firstWeek.weekNumber);
        console.log('  - Start Date:', firstWeek.startDate);
        console.log('  - End Date:', firstWeek.endDate);
        console.log('  - Workouts:', firstWeek.workouts?.length || 0);
        
        if (firstWeek.workouts && firstWeek.workouts.length > 0) {
          console.log('\n🏃 Primeiro treino:');
          const firstWorkout = firstWeek.workouts[0];
          console.log('  - ID:', firstWorkout.id);
          console.log('  - Date:', firstWorkout.date);
          console.log('  - Type:', firstWorkout.type);
          console.log('  - Title:', firstWorkout.title);
          console.log('  - Is Completed:', firstWorkout.isCompleted);
        }
      }
    }
    
    // Test serialization
    console.log('\n🔬 Testando serialização...');
    try {
      const plan = user.athleteProfile?.customPlan;
      if (plan) {
        const serialized = {
          ...plan,
          startDate: plan.startDate?.toISOString(),
          targetRaceDate: plan.targetRaceDate?.toISOString(),
          weeks: plan.weeks?.map((week: any) => ({
            ...week,
            startDate: week.startDate?.toISOString(),
            endDate: week.endDate?.toISOString(),
            workouts: week.workouts?.map((workout: any) => ({
              ...workout,
              date: workout.date?.toISOString(),
            })),
          })),
        };
        
        JSON.stringify(serialized);
        console.log('✅ Serialização bem sucedida');
      }
    } catch (serError) {
      console.error('❌ Erro na serialização:', serError);
      console.error('Detalhes:', serError instanceof Error ? serError.message : 'Unknown');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
    console.error('Detalhes:', error instanceof Error ? error.message : 'Unknown');
    console.error('Stack:', error instanceof Error ? error.stack : '');
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
