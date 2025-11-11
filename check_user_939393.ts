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
                    workouts: true,
                  },
                  orderBy: { weekNumber: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    console.log('User:', JSON.stringify(user, null, 2));
    
    if (user?.athleteProfile?.customPlan) {
      console.log('\n=== PLAN INFO ===');
      console.log('Plan ID:', user.athleteProfile.customPlan.id);
      console.log('Has weeks?', !!user.athleteProfile.customPlan.weeks);
      console.log('Weeks count:', user.athleteProfile.customPlan.weeks?.length || 0);
      
      if (user.athleteProfile.customPlan.weeks) {
        console.log('\n=== WEEKS ===');
        user.athleteProfile.customPlan.weeks.forEach((week: any) => {
          console.log(`Week ${week.weekNumber}: ${week.workouts?.length || 0} workouts`);
        });
      }
    }

  } catch (error) {
    console.error('ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
