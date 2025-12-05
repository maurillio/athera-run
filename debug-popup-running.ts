/**
 * DEBUG POP-UP RUNNING - Investigar por que pop-up não aparece
 */

import { prisma } from './lib/db';
import dayjs from 'dayjs';

async function debugPopupRunning() {
  console.log('\n🔍 DEBUG POP-UP RUNNING - Athera Flex\n');

  // Buscar perfil do usuário (ajustar email se necessário)
  const userEmail = process.argv[2] || 'maurillio@live.com';
  
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true, email: true },
  });

  if (!user) {
    console.error('❌ Usuário não encontrado:', userEmail);
    return;
  }

  console.log('✅ Usuário:', user.email);

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!profile) {
    console.error('❌ Perfil não encontrado');
    return;
  }

  console.log('✅ Perfil ID:', profile.id);

  // Buscar plano ativo
  const plan = await prisma.customTrainingPlan.findFirst({
    where: {
      athleteProfile: { id: profile.id },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      goalRaceDate: true,
    },
  });

  if (!plan) {
    console.error('❌ Nenhum plano encontrado');
    return;
  }

  console.log('✅ Plano ID:', plan.id);
  console.log('  - Start:', dayjs(plan.startDate).format('DD/MM/YYYY'));
  console.log('  - End:', plan.endDate ? dayjs(plan.endDate).format('DD/MM/YYYY') : 'N/A');
  console.log('  - Goal Race:', plan.goalRaceDate ? dayjs(plan.goalRaceDate).format('DD/MM/YYYY') : 'N/A');

  // Buscar settings do usuário
  const settings = await prisma.userFlexSettings.findUnique({
    where: { userId: user.id },
  });

  console.log('\n📊 CONFIGURAÇÕES ATHERA FLEX:');
  if (settings) {
    console.log('  - Auto Adjust Enabled:', settings.autoAdjustEnabled);
    console.log('  - Auto Adjust Threshold:', settings.autoAdjustThreshold);
    console.log('  - Allow Swaps:', settings.allowWorkoutSwaps);
    console.log('  - Flexibility Days:', settings.flexibilityDays);
  } else {
    console.log('  ⚠️  Nenhuma configuração encontrada (usando defaults)');
  }

  // Buscar treinos completados nos últimos 7 dias SEM match
  const startDate = dayjs().subtract(7, 'day').toDate();
  const completedWorkouts = await prisma.completedWorkout.findMany({
    where: {
      athleteId: profile.id,
      date: { gte: startDate },
      wasPlanned: false,
      type: 'running',
    },
    orderBy: { date: 'desc' },
    select: {
      id: true,
      date: true,
      type: true,
      subtype: true,
      distance: true,
      duration: true,
      pace: true,
      wasPlanned: true,
      plannedDate: true,
    },
  });

  console.log('\n🏃 CORRIDAS ÓRFÃS (últimos 7 dias):');
  console.log(`  Total: ${completedWorkouts.length}\n`);

  if (completedWorkouts.length === 0) {
    console.log('  ⚠️  Nenhuma corrida órfã encontrada!');
    console.log('     Possíveis motivos:');
    console.log('     - Todas corridas têm wasPlanned=true');
    console.log('     - Não há corridas nos últimos 7 dias');
    console.log('     - Tipo diferente de "running"');
  } else {
    completedWorkouts.forEach((w, i) => {
      console.log(`  ${i + 1}. ID: ${w.id}`);
      console.log(`     Data: ${dayjs(w.date).format('DD/MM/YYYY HH:mm')}`);
      console.log(`     Tipo: ${w.type} ${w.subtype ? `(${w.subtype})` : ''}`);
      console.log(`     Distância: ${w.distance ? `${w.distance}km` : 'N/A'}`);
      console.log(`     Duração: ${w.duration ? `${Math.floor(w.duration / 60)}min` : 'N/A'}`);
      console.log(`     Pace: ${w.pace ? `${w.pace} min/km` : 'N/A'}`);
      console.log(`     wasPlanned: ${w.wasPlanned}`);
      console.log(`     plannedDate: ${w.plannedDate ? dayjs(w.plannedDate).format('DD/MM/YYYY') : 'N/A'}`);
      console.log('');
    });
  }

  // Buscar treinos planejados elegíveis para match
  const plannedStartDate = dayjs().subtract(14, 'day').toDate();
  const plannedEndDate = dayjs().add(7, 'day').toDate();

  const plannedWorkouts = await prisma.customWorkout.findMany({
    where: {
      week: { planId: plan.id },
      isCompleted: false,
      isFlexible: true,
      type: 'running',
      date: {
        gte: plannedStartDate,
        lte: plannedEndDate,
      },
    },
    include: {
      week: {
        select: {
          weekNumber: true,
        },
      },
    },
    orderBy: { date: 'asc' },
  });

  console.log('\n📅 TREINOS PLANEJADOS ELEGÍVEIS (±14 dias):');
  console.log(`  Total: ${plannedWorkouts.length}\n`);

  if (plannedWorkouts.length === 0) {
    console.log('  ⚠️  Nenhum treino planejado elegível!');
    console.log('     Possíveis motivos:');
    console.log('     - Todos planejados têm isCompleted=true');
    console.log('     - Todos planejados têm isFlexible=false');
    console.log('     - Tipo diferente de "running"');
    console.log('     - Fora da janela de ±14 dias');
  } else {
    plannedWorkouts.forEach((w, i) => {
      console.log(`  ${i + 1}. ID: ${w.id} - Semana ${w.week.weekNumber}`);
      console.log(`     Data: ${dayjs(w.date).format('DD/MM/YYYY')}`);
      console.log(`     Título: ${w.title}`);
      console.log(`     Tipo: ${w.type} ${w.subtype ? `(${w.subtype})` : ''}`);
      console.log(`     Distância: ${w.distance ? `${w.distance}km` : 'N/A'}`);
      console.log(`     Duração: ${w.duration ? `${Math.floor(w.duration / 60)}min` : 'N/A'}`);
      console.log(`     isCompleted: ${w.isCompleted}`);
      console.log(`     isFlexible: ${w.isFlexible}`);
      console.log(`     canSubstitute: ${w.canSubstitute}`);
      console.log(`     flexibilityWindow: ${w.flexibilityWindow || 'N/A'}`);
      console.log('');
    });
  }

  // Diagnóstico final
  console.log('\n🎯 DIAGNÓSTICO:');
  
  if (completedWorkouts.length === 0) {
    console.log('  ❌ PROBLEMA: Nenhuma corrida órfã encontrada');
    console.log('     Verificar:');
    console.log('     - Todas corridas estão com wasPlanned=true?');
    console.log('     - Corridas foram importadas do Strava nos últimos 7 dias?');
  } else if (plannedWorkouts.length === 0) {
    console.log('  ❌ PROBLEMA: Nenhum treino planejado elegível');
    console.log('     Verificar:');
    console.log('     - Todos planejados estão completos?');
    console.log('     - Treinos planejados têm isFlexible=true?');
    console.log('     - Treinos planejados estão dentro da janela temporal?');
  } else {
    console.log('  ✅ Dados parecem OK para matching!');
    console.log(`     - ${completedWorkouts.length} corrida(s) órfã(s)`);
    console.log(`     - ${plannedWorkouts.length} treino(s) planejado(s) elegível(is)`);
    console.log('\n  🔎 Possíveis causas do pop-up não aparecer:');
    console.log('     1. Confiança < 60% em todos matches');
    console.log('     2. Diferença de data muito grande (>7 dias)');
    console.log('     3. Diferença de volume muito grande');
    console.log('     4. Hook não está rodando (verificar console do browser)');
  }

  console.log('\n✅ Debug concluído!\n');
}

debugPopupRunning()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
