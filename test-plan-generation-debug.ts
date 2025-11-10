import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPlanGeneration() {
  try {
    // Buscar usuário de teste
    const user = await prisma.user.findUnique({
      where: { email: 'teste47474@teste.com' },
      include: {
        athleteProfile: true,
      },
    });

    if (!user) {
      console.error('❌ Usuário não encontrado');
      return;
    }

    console.log('✅ Usuário encontrado:', user.email);
    console.log('✅ Perfil:', {
      goalDistance: user.athleteProfile?.goalDistance,
      targetRaceDate: user.athleteProfile?.targetRaceDate,
      runningLevel: user.athleteProfile?.runningLevel,
      trainingSchedule: user.athleteProfile?.trainingSchedule,
      trainingActivities: user.athleteProfile?.trainingActivities,
    });

    // Buscar corridas cadastradas
    const raceGoals = await prisma.raceGoal.findMany({
      where: {
        athleteId: user.athleteProfile?.id,
        status: {
          in: ['active', 'upcoming']
        }
      },
      orderBy: {
        raceDate: 'asc'
      }
    });

    console.log('\n🏁 Corridas encontradas:', raceGoals.length);
    raceGoals.forEach(race => {
      console.log(`  - ${race.priority}: ${race.raceName} (${race.distance}) em ${race.raceDate.toISOString().split('T')[0]} - Status: ${race.status}`);
    });

    // Verificar plano existente
    const existingPlan = await prisma.trainingPlan.findFirst({
      where: {
        athleteId: user.athleteProfile?.id,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (existingPlan) {
      console.log('\n📋 Plano existente encontrado:');
      console.log('  - ID:', existingPlan.id);
      console.log('  - Criado em:', existingPlan.createdAt);
      console.log('  - Início:', existingPlan.startDate?.toISOString().split('T')[0]);
      console.log('  - Fim:', existingPlan.endDate?.toISOString().split('T')[0]);
      console.log('  - Total semanas:', existingPlan.totalWeeks);

      // Verificar workouts
      const workouts = await prisma.workout.findMany({
        where: {
          planId: existingPlan.id,
        },
        orderBy: {
          date: 'asc'
        },
        take: 20
      });

      console.log(`\n🏋️ Primeiros ${Math.min(workouts.length, 20)} treinos:`);
      workouts.forEach(w => {
        console.log(`  - ${w.date.toISOString().split('T')[0]} (${w.dayOfWeek}): ${w.type} - ${w.title}`);
      });

      // Verificar se tem corrida alvo no dia certo
      const raceDate = raceGoals[0]?.raceDate;
      if (raceDate) {
        const raceWorkouts = workouts.filter(w => {
          const wDate = new Date(w.date);
          wDate.setHours(0, 0, 0, 0);
          const rDate = new Date(raceDate);
          rDate.setHours(0, 0, 0, 0);
          return wDate.getTime() === rDate.getTime();
        });

        console.log(`\n🔍 Treinos no dia da corrida alvo (${raceDate.toISOString().split('T')[0]}):`);
        if (raceWorkouts.length > 0) {
          raceWorkouts.forEach(w => {
            console.log(`  - ${w.type} - ${w.title}`);
            console.log(`    Descrição: ${w.description?.substring(0, 100)}...`);
          });
        } else {
          console.log('  ❌ NENHUM treino encontrado no dia da corrida!');
        }
      }
    } else {
      console.log('\n❌ Nenhum plano encontrado');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPlanGeneration();
