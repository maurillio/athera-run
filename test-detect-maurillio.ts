import { prisma } from './lib/db';

async function testDetection() {
  const user = await prisma.user.findUnique({
    where: { email: 'mmaurillio2@gmail.com' },
    select: { id: true, email: true }
  });

  if (!user) {
    console.log('❌ User not found');
    return;
  }

  console.log('✅ User found:', user.id);

  // Buscar treinos completados recentes
  const completed = await prisma.completedWorkout.findMany({
    where: {
      userId: user.id,
      date: {
        gte: new Date('2024-11-28'),
        lte: new Date('2024-12-05')
      }
    },
    orderBy: { date: 'desc' }
  });

  console.log('\n📊 Treinos Completados (últimos 7 dias):');
  completed.forEach(w => {
    console.log(`- ${w.date.toISOString().split('T')[0]}: ${w.type} ${w.distance}km "${w.title}"`);
  });

  // Buscar plano ativo
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: user.id }
  });

  if (!profile) {
    console.log('❌ Profile not found');
    return;
  }

  const plan = await prisma.customTrainingPlan.findFirst({
    where: { athleteProfileId: profile.id },
    orderBy: { createdAt: 'desc' }
  });

  if (!plan) {
    console.log('❌ Plan not found');
    return;
  }

  console.log('\n✅ Plan found:', plan.id);

  // Buscar treinos planejados
  const planned = await prisma.plannedWorkout.findMany({
    where: {
      customTrainingPlanId: plan.id,
      date: {
        gte: new Date('2024-11-28'),
        lte: new Date('2024-12-05')
      }
    },
    orderBy: { date: 'asc' }
  });

  console.log('\n📅 Treinos Planejados (últimos 7 dias):');
  planned.forEach(w => {
    console.log(`- ${w.date.toISOString().split('T')[0]}: ${w.type} ${w.distance}km "${w.title}" [Completo: ${w.isCompleted}]`);
  });

  // Testar API detect-matches
  console.log('\n🔍 Testando detecção de matches...');
  const response = await fetch('http://localhost:3000/api/athera-flex/detect-matches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: user.id,
      minConfidence: 60,
      daysBack: 7
    })
  });

  const result = await response.json();
  console.log('\n📋 Resultado:', JSON.stringify(result, null, 2));
}

testDetection().catch(console.error).finally(() => process.exit());
