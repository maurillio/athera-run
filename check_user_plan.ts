import prisma from './lib/db';

async function checkUser() {
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

    console.log('User found:', !!user);
    console.log('Has profile:', !!user?.athleteProfile);
    console.log('Has custom plan:', !!user?.athleteProfile?.customPlan);
    
    if (user?.athleteProfile?.customPlan) {
      const plan = user.athleteProfile.customPlan;
      console.log('Plan ID:', plan.id);
      console.log('Weeks count:', plan.weeks?.length || 0);
      console.log('Plan data:', JSON.stringify(plan, null, 2));
    }
    
    if (user?.athleteProfile) {
      console.log('Profile data:', JSON.stringify(user.athleteProfile, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
