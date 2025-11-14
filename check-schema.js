require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function checkSchema() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 SCHEMA DAS TABELAS PRINCIPAIS\n');
    console.log('═'.repeat(70) + '\n');
    
    // 1. custom_training_plans
    console.log('📋 CUSTOM_TRAINING_PLANS:\n');
    
    const planColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'custom_training_plans'
      ORDER BY ordinal_position
    `;
    
    planColumns.forEach(c => {
      console.log(`   ${c.column_name.padEnd(25)} | ${c.data_type.padEnd(20)} | ${c.is_nullable}`);
    });
    
    // 2. custom_workouts (campos v3.0)
    console.log('\n📋 CUSTOM_WORKOUTS (campos v3.0):\n');
    
    const workoutColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'custom_workouts'
        AND column_name IN (
          'objective', 'scientificBasis', 'tips', 'commonMistakes',
          'successCriteria', 'intensityLevel', 'expectedRPE',
          'heartRateZones', 'intervals', 'expectedDuration',
          'warmUpStructure', 'mainWorkoutStruct', 'coolDownStructure'
        )
      ORDER BY column_name
    `;
    
    console.log(`   Total v3.0: ${workoutColumns.length}/13\n`);
    workoutColumns.forEach(c => {
      console.log(`   ✅ ${c.column_name.padEnd(25)} | ${c.data_type.padEnd(20)}`);
    });
    
    // 3. athlete_profiles (campos v3.0)
    console.log('\n📋 ATHLETE_PROFILES (campos v3.0):\n');
    
    const profileColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'athlete_profiles'
        AND column_name IN (
          'hasRunBefore', 'currentlyInjured', 'avgSleepHours',
          'tracksMenstrualCycle', 'avgCycleLength', 'lastPeriodDate',
          'workDemand', 'familyDemand'
        )
      ORDER BY column_name
    `;
    
    console.log(`   Total v3.0: ${profileColumns.length}/8\n`);
    profileColumns.forEach(c => {
      const def = c.column_default ? ` = ${c.column_default}` : '';
      console.log(`   ✅ ${c.column_name.padEnd(25)} | ${c.data_type.padEnd(20)}${def}`);
    });
    
    console.log('\n' + '═'.repeat(70));
    console.log('\n✅ RESUMO:\n');
    console.log(`   custom_workouts:   ${workoutColumns.length}/13 campos v3.0`);
    console.log(`   athlete_profiles:  ${profileColumns.length}/8 campos v3.0`);
    console.log(`   TOTAL:             ${workoutColumns.length + profileColumns.length}/21 campos\n`);
    
    if (workoutColumns.length === 13 && profileColumns.length === 8) {
      console.log('   🎉 TODOS os campos v3.0 estão presentes!\n');
      console.log('   💡 O erro de geração de planos NÃO é no banco.');
      console.log('   💡 Problema está no código ou no deploy Vercel.\n');
    } else {
      console.log(`   ⚠️  Faltam ${21 - (workoutColumns.length + profileColumns.length)} campos\n`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();
