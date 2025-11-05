
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import path from 'path';
import { generateAIPlan, validateAIPlan, type AIUserProfile } from '../lib/ai-plan-generator';

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

interface TestUser {
  email: string;
  name: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  distance: '5k' | '10k' | 'half' | 'full';
  raceDate: string;
  trainingDays: string[];
  strengthDays: string[];
  currentWeeklyKm: number;
}

const testUsers: TestUser[] = [
  {
    email: 'test1@test.com',
    name: 'Test User 1 - Iniciante 5K',
    experience: 'beginner',
    distance: '5k',
    raceDate: '2026-03-15',
    trainingDays: ['monday', 'wednesday', 'friday'],
    strengthDays: ['tuesday', 'thursday'],
    currentWeeklyKm: 10
  },
  {
    email: 'test2@test.com',
    name: 'Test User 2 - Intermediário 10K',
    experience: 'intermediate',
    distance: '10k',
    raceDate: '2026-05-20',
    trainingDays: ['monday', 'tuesday', 'thursday', 'saturday'],
    strengthDays: ['wednesday', 'friday'],
    currentWeeklyKm: 30
  },
  {
    email: 'test3@test.com',
    name: 'Test User 3 - Avançado Meia',
    experience: 'advanced',
    distance: 'half',
    raceDate: '2026-08-29',
    trainingDays: ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    strengthDays: ['monday', 'friday'],
    currentWeeklyKm: 60
  },
  {
    email: 'test4@test.com',
    name: 'Test User 4 - Intermediário Maratona',
    experience: 'intermediate',
    distance: 'full',
    raceDate: '2026-12-06',
    trainingDays: ['monday', 'wednesday', 'thursday', 'saturday', 'sunday'],
    strengthDays: ['tuesday', 'friday'],
    currentWeeklyKm: 50
  },
  {
    email: 'test5@test.com',
    name: 'Test User 5 - Iniciante com sexta',
    experience: 'beginner',
    distance: '10k',
    raceDate: '2026-04-10',
    trainingDays: ['monday', 'wednesday', 'friday', 'sunday'],
    strengthDays: ['friday'],
    currentWeeklyKm: 15
  }
];

async function cleanupTestUsers() {
  console.log('\n🧹 Limpando usuários de teste anteriores...');
  for (const testUser of testUsers) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
        include: { athleteProfile: true }
      });
      
      if (user) {
        // Se tem athleteProfile, deletar race goals relacionados
        if (user.athleteProfile) {
          await prisma.raceGoal.deleteMany({ where: { athleteId: user.athleteProfile.id } });
        }
        
        // Deletar athlete profile
        await prisma.athleteProfile.deleteMany({ where: { userId: user.id } });
        
        // Deletar user
        await prisma.user.delete({ where: { id: user.id } });
        console.log(`  ✓ Removido: ${testUser.email}`);
      }
    } catch (error: any) {
      console.log(`  ⚠ Erro ao remover ${testUser.email}: ${error?.message}`);
    }
  }
}

async function createTestUser(testUser: TestUser) {
  console.log(`\n📝 Criando usuário: ${testUser.name}`);
  
  const hashedPassword = await bcrypt.hash('Test123!', 10);
  const user = await prisma.user.create({
    data: {
      email: testUser.email,
      name: testUser.name,
      password: hashedPassword
    }
  });
  console.log(`  ✓ Usuário criado: ${user.id}`);

  // Mapear dias para números
  const dayMap: { [key: string]: number } = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6
  };
  
  const runningDays = testUser.trainingDays.map(d => dayMap[d]);
  const strengthDays = testUser.strengthDays.map(d => dayMap[d]);
  
  const profile = await prisma.athleteProfile.create({
    data: {
      userId: user.id,
      runningLevel: testUser.experience,
      goalDistance: testUser.distance,
      targetRaceDate: new Date(testUser.raceDate),
      currentWeeklyKm: testUser.currentWeeklyKm,
      longestRun: testUser.currentWeeklyKm * 0.4,
      trainingActivities: [
        {
          id: 'running',
          name: 'Corrida',
          availableDays: runningDays,
          preferredTime: 'morning',
          icon: 'Activity'
        },
        {
          id: 'strength',
          name: 'Musculação',
          availableDays: strengthDays,
          preferredTime: 'afternoon',
          icon: 'Dumbbell'
        }
      ],
      weight: 70,
      height: 175,
      age: 35,
      gender: 'male',
      longRunDay: testUser.trainingDays.includes('sunday') ? 0 : 
                  testUser.trainingDays.includes('saturday') ? 6 : dayMap[testUser.trainingDays[0]],
      weeklyAvailability: testUser.trainingDays.length
    }
  });
  console.log(`  ✓ Perfil criado`);

  const raceGoal = await prisma.raceGoal.create({
    data: {
      athleteId: profile.id,
      raceName: `Prova ${testUser.distance} - ${testUser.name}`,
      distance: testUser.distance,
      raceDate: new Date(testUser.raceDate),
      targetTime: testUser.distance === '5k' ? '25:00' :
                  testUser.distance === '10k' ? '50:00' :
                  testUser.distance === 'half' ? '1:50:00' : '4:00:00',
      priority: 'A',
      isPrimary: true
    }
  });
  console.log(`  ✓ Meta de corrida criada`);

  return { user, profile, raceGoal };
}

async function generatePlan(userId: string, profile: any, raceGoal: any) {
  console.log(`\n🏃 Gerando plano de treinamento...`);
  
  try {
    // Extrair running days do trainingActivities
    const runningActivity = profile.trainingActivities?.find((act: any) => act.id === 'running');
    const availableDays = runningActivity?.availableDays || [];
    
    // Converter números de volta para nomes dos dias
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const trainingDays = availableDays.map((d: number) => dayNames[d]);
    
    // Preparar perfil para a IA
    const aiProfile: AIUserProfile = {
      runningLevel: profile.runningLevel,
      goalDistance: raceGoal.distance,
      targetRaceDate: raceGoal.raceDate,
      currentWeeklyKm: profile.currentWeeklyKm,
      longestRun: profile.longestRun,
      currentVDOT: profile.currentVDOT || undefined,
      targetTime: raceGoal.targetTime,
      weight: profile.weight,
      height: profile.height,
      age: profile.age,
      gender: profile.gender,
      trainingActivities: trainingDays,
      longRunDay: profile.longRunDay || 0,
      usualPaces: profile.usualPaces || undefined,
      hasGymAccess: true,
      hasPoolAccess: false,
    };

    // Gerar plano com IA
    const aiPlan = await generateAIPlan(aiProfile);
    console.log(`  ✓ Plano gerado pela IA! Total de semanas: ${aiPlan.totalWeeks}`);

    // Validar plano
    const validation = validateAIPlan(aiPlan);
    if (!validation.valid) {
      console.log(`  ❌ Plano inválido:`, validation.errors);
      return null;
    }

    // Criar plano no banco
    const customPlan = await prisma.customTrainingPlan.create({
      data: {
        goalDistance: aiProfile.goalDistance,
        runningLevel: aiProfile.runningLevel,
        targetRaceDate: aiPlan.targetRaceDate,
        startDate: aiPlan.startDate,
        totalWeeks: aiPlan.totalWeeks,
        baseVDOT: aiPlan.vdot,
        targetPace: aiPlan.paces.marathon,
      },
    });

    // Criar semanas e treinos
    for (const weekData of aiPlan.weeks) {
      const week = await prisma.customWeek.create({
        data: {
          planId: customPlan.id,
          weekNumber: weekData.weekNumber,
          startDate: weekData.startDate,
          endDate: weekData.endDate,
          totalDistance: Math.round(weekData.totalDistance * 10) / 10,
          totalWorkouts: 7,
          phase: weekData.phase,
          focus: weekData.focus,
        },
      });

      const workouts = weekData.workouts.map(workout => ({
        weekId: week.id,
        dayOfWeek: workout.dayOfWeek,
        date: workout.date,
        type: workout.type,
        subtype: workout.subtype || null,
        title: workout.title,
        description: workout.description,
        distance: workout.distance ? Math.round(workout.distance * 10) / 10 : null,
        duration: workout.duration || null,
        targetPace: workout.targetPace || null,
        warmup: workout.warmup || null,
        mainSet: workout.mainSet || null,
        cooldown: workout.cooldown || null,
      }));

      await prisma.customWorkout.createMany({
        data: workouts,
      });
    }

    console.log(`  ✓ Plano salvo no banco de dados`);
    return customPlan;
  } catch (error: any) {
    console.log(`  ❌ Erro ao gerar plano:`, error?.message || error);
    return null;
  }
}

async function validatePlan(planId: number, testUser: TestUser) {
  console.log(`\n🔍 Validando plano de treinamento...`);
  
  const plan = await prisma.customTrainingPlan.findUnique({
    where: { id: planId },
    include: {
      weeks: {
        include: {
          workouts: true
        },
        orderBy: { weekNumber: 'asc' }
      }
    }
  });

  if (!plan) {
    console.log(`  ❌ Nenhum plano encontrado!`);
    return false;
  }

  console.log(`  📊 Plano: ${plan.weeks.length} semanas`);
  
  const today = new Date();
  const raceDate = new Date(testUser.raceDate);
  const weeksUntilRace = Math.ceil((raceDate.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000));
  
  console.log(`  📅 Semanas até a prova: ${weeksUntilRace}`);
  console.log(`  📋 Semanas no plano: ${plan.weeks.length}`);
  
  let issues = 0;

  if (plan.weeks.length < weeksUntilRace - 2) {
    console.log(`  ⚠ PROBLEMA: Plano muito curto! Esperado ~${weeksUntilRace} semanas, gerado ${plan.weeks.length}`);
    issues++;
  }

  const dayNamesMap: string[] = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const dayMap: { [key: string]: number } = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6
  };

  console.log(`\n  📅 Dias de treino configurados: ${testUser.trainingDays.map(d => dayNamesMap[dayMap[d]]).join(', ')}`);
  console.log(`  💪 Dias de força configurados: ${testUser.strengthDays.map(d => dayNamesMap[dayMap[d]]).join(', ')}`);

  for (let i = 0; i < Math.min(4, plan.weeks.length); i++) {
    const week = plan.weeks[i];
    const workoutDays = week.workouts.map(w => w.dayOfWeek); // dayOfWeek é número (0-6)
    const strengthWorkouts = week.workouts.filter(w => w.type === 'strength');
    
    console.log(`\n  Semana ${week.weekNumber}:`);
    console.log(`    Treinos: ${week.workouts.map(w => `${dayNamesMap[w.dayOfWeek]} (${w.type})`).join(', ')}`);
    
    const fridayNum = dayMap['friday'];
    if (testUser.trainingDays.includes('friday')) {
      const hasFridayWorkout = workoutDays.includes(fridayNum);
      if (!hasFridayWorkout && testUser.strengthDays.includes('friday')) {
        const hasStrengthOnFriday = strengthWorkouts.some(w => w.dayOfWeek === fridayNum);
        if (!hasStrengthOnFriday) {
          console.log(`    ⚠ PROBLEMA: Sexta-feira configurada mas não utilizada!`);
          issues++;
        }
      }
    }

    for (const strengthDay of testUser.strengthDays) {
      const dayNum = dayMap[strengthDay];
      const hasStrengthOnDay = strengthWorkouts.some(w => w.dayOfWeek === dayNum);
      if (!hasStrengthOnDay && workoutDays.includes(dayNum)) {
        console.log(`    ⚠ ${dayNamesMap[dayNum]} configurado para força mas tem outro tipo de treino`);
      }
    }
  }

  const weeklyVolumes = plan.weeks.map(week => {
    const totalKm = week.workouts.reduce((sum, w) => sum + (w.distance || 0), 0);
    return totalKm;
  });

  console.log(`\n  📈 Volume semanal (primeiras 8 semanas):`);
  weeklyVolumes.slice(0, 8).forEach((vol, i) => {
    console.log(`    Semana ${i + 1}: ${vol.toFixed(1)}km`);
  });

  if (issues === 0) {
    console.log(`\n  ✅ Plano validado com sucesso!`);
    return true;
  } else {
    console.log(`\n  ❌ Encontrados ${issues} problemas no plano`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 INICIANDO TESTES ABRANGENTES DO SISTEMA\n');
  console.log('=' .repeat(60));

  await cleanupTestUsers();

  let successCount = 0;
  let failCount = 0;

  for (const testUser of testUsers) {
    console.log('\n' + '='.repeat(60));
    try {
      const { user, profile, raceGoal } = await createTestUser(testUser);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const planResult = await generatePlan(user.id, profile, raceGoal);
      
      if (!planResult) {
        console.log(`❌ Falha ao gerar plano para ${testUser.name}`);
        failCount++;
        continue;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const isValid = await validatePlan(planResult.id, testUser);
      
      if (isValid) {
        console.log(`\n✅ SUCESSO: ${testUser.name}`);
        successCount++;
      } else {
        console.log(`\n❌ FALHA: ${testUser.name} - Plano com problemas`);
        failCount++;
      }
      
    } catch (error: any) {
      console.log(`\n❌ ERRO ao testar ${testUser.name}:`, error?.message || error);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RESUMO DOS TESTES');
  console.log('='.repeat(60));
  console.log(`Total de testes: ${testUsers.length}`);
  console.log(`✅ Sucessos: ${successCount}`);
  console.log(`❌ Falhas: ${failCount}`);
  console.log(`Taxa de sucesso: ${((successCount / testUsers.length) * 100).toFixed(1)}%`);
  
  await prisma.$disconnect();
}

runTests().catch(console.error);
