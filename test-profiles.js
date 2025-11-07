const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const testProfiles = [
  {
    name: "Iniciante - Primeiro 5K",
    data: {
      email: `test-beginner-${Date.now()}@test.com`,
      name: "Test Beginner",
      age: 25,
      gender: "female",
      weight: 65,
      height: 165,
      runningLevel: "beginner",
      longestRun: 5,
      goalDistance: "5K",
      targetRaceDate: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000),
      trainingActivities: [1, 3, 6],
      longRunDay: 6,
      sleepQuality: 4,
      stressLevel: 2,
      hasGymAccess: false,
      hasPoolAccess: false,
      hasTrackAccess: false,
      restingHeartRate: 65,
    }
  },
  {
    name: "Intermediário - 10K com Gym",
    data: {
      email: `test-intermediate-${Date.now()}@test.com`,
      name: "Test Intermediate",
      age: 35,
      gender: "male",
      weight: 75,
      height: 178,
      runningLevel: "intermediate",
      runningYears: 1.5,
      longestRun: 15,
      goalDistance: "10K",
      targetRaceDate: new Date(Date.now() + 84 * 24 * 60 * 60 * 1000),
      trainingActivities: [2, 4, 6, 0],
      longRunDay: 0,
      sleepQuality: 3,
      stressLevel: 4,
      hasGymAccess: true,
      restingHeartRate: 55,
      otherSportsExperience: "Ciclismo",
      otherSportsYears: 2,
    }
  }
];

async function runTest(profile, index) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 TESTE ${index + 1}: ${profile.name}`);
  console.log('='.repeat(60));

  try {
    console.log('📝 Criando usuário...');
    const user = await prisma.user.create({
      data: {
        email: profile.data.email,
        name: profile.data.name,
        emailVerified: new Date(),
      }
    });
    console.log(`✅ Usuário: ${user.id}`);

    console.log('📝 Criando perfil...');
    const athleteProfile = await prisma.athleteProfile.create({
      data: {
        userId: user.id,
        ...profile.data,
      }
    });
    console.log(`✅ Perfil: ${athleteProfile.id}`);

    console.log('\n🔍 VALIDAÇÕES:');
    console.log(`  ✅ Nível: ${athleteProfile.runningLevel}`);
    console.log(`  ✅ Objetivo: ${athleteProfile.goalDistance}`);
    console.log(`  ✅ Dias treino: ${athleteProfile.trainingActivities.length}`);
    console.log(`  ✅ Longão: ${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][athleteProfile.longRunDay]}`);
    console.log(`  ✅ Sono: ${athleteProfile.sleepQuality}/5`);
    console.log(`  ✅ Estresse: ${athleteProfile.stressLevel}/5`);
    console.log(`  ✅ Academia: ${athleteProfile.hasGymAccess ? 'Sim' : 'Não'}`);
    
    if (athleteProfile.otherSportsExperience) {
      console.log(`  ✅ Outros esportes: ${athleteProfile.otherSportsExperience}`);
    }

    console.log('\n✅ TESTE PASSOU!\n');
    return { success: true, profile: profile.name };

  } catch (error) {
    console.error(`\n❌ TESTE FALHOU!`);
    console.error(error.message);
    return { success: false, profile: profile.name, error: error.message };
  }
}

async function main() {
  console.log('🧪 TESTE DE SALVAMENTO DE PERFIS\n');

  const results = [];
  for (let i = 0; i < testProfiles.length; i++) {
    const result = await runTest(testProfiles[i], i);
    results.push(result);
    if (i < testProfiles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.success).length;
  console.log(`\n✅ Passados: ${passed}/${results.length}`);
  console.log(`❌ Falhos: ${results.length - passed}/${results.length}`);

  if (passed === results.length) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!\n');
  }

  await prisma.$disconnect();
}

main();
