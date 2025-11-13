import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  try {
    // Query para verificar colunas de custom_workouts
    const customWorkoutsCols = await prisma.$queryRaw<any[]>`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'custom_workouts'
        AND column_name IN (
          'warmUpStructure', 
          'mainWorkoutStruct', 
          'coolDownStructure',
          'objective',
          'scientificBasis',
          'tips',
          'commonMistakes',
          'successCriteria',
          'intensityLevel',
          'expectedRPE',
          'heartRateZones',
          'intervals',
          'expectedDuration'
        )
      ORDER BY column_name;
    `;

    // Query para verificar colunas de athlete_profiles
    const athleteProfilesCols = await prisma.$queryRaw<any[]>`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'athlete_profiles'
        AND column_name IN (
          'hasRunBefore',
          'currentlyInjured',
          'avgSleepHours',
          'tracksMenstrualCycle',
          'avgCycleLength',
          'lastPeriodDate',
          'workDemand',
          'familyDemand'
        )
      ORDER BY column_name;
    `;

    console.log('\n✅ CUSTOM_WORKOUTS - Colunas v2.0.0 + v3.0.0:');
    console.log(`Total: ${customWorkoutsCols.length}/13`);
    customWorkoutsCols.forEach(col => {
      console.log(`  ✓ ${col.column_name} (${col.data_type})`);
    });

    console.log('\n✅ ATHLETE_PROFILES - Colunas v3.0.0:');
    console.log(`Total: ${athleteProfilesCols.length}/8`);
    athleteProfilesCols.forEach(col => {
      console.log(`  ✓ ${col.column_name} (${col.data_type}) - Default: ${col.column_default || 'NULL'}`);
    });

    if (customWorkoutsCols.length === 13 && athleteProfilesCols.length === 8) {
      console.log('\n🎉 MIGRATION 100% COMPLETA!');
    } else {
      console.log('\n⚠️  Algumas colunas podem estar faltando');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
