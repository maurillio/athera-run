// Script para aplicar migration v3.0.0 diretamente no Neon
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applyMigration() {
  console.log('🚀 Iniciando aplicação de migration v3.0.0...\n');

  try {
    // PARTE 1: custom_workouts v2.0.0 fields
    console.log('📦 PARTE 1: Adicionando campos v2.0.0 em custom_workouts...\n');

    const v2Fields = [
      // Estrutura detalhada
      { name: 'warmUpStructure', type: 'JSONB' },
      { name: 'mainWorkoutStruct', type: 'JSONB' },
      { name: 'coolDownStructure', type: 'JSONB' },
      // Enriquecimento educacional
      { name: 'objective', type: 'TEXT' },
      { name: 'scientificBasis', type: 'TEXT' },
      { name: 'tips', type: 'JSONB' },
      { name: 'commonMistakes', type: 'JSONB' },
      { name: 'successCriteria', type: 'JSONB' },
      // Métricas avançadas
      { name: 'intensityLevel', type: 'INTEGER' },
      { name: 'expectedRPE', type: 'INTEGER' },
      { name: 'heartRateZones', type: 'JSONB' },
      { name: 'intervals', type: 'JSONB' },
      { name: 'expectedDuration', type: 'INTEGER' },
    ];

    for (const field of v2Fields) {
      try {
        await prisma.$executeRawUnsafe(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'custom_workouts' AND column_name = '${field.name}'
            ) THEN
              ALTER TABLE custom_workouts ADD COLUMN "${field.name}" ${field.type};
              RAISE NOTICE 'Coluna ${field.name} adicionada';
            END IF;
          END $$;
        `);
        console.log(`✅ ${field.name}`);
      } catch (error: any) {
        console.log(`⚠️  ${field.name}: ${error.message}`);
      }
    }

    // PARTE 2: athlete_profiles v3.0.0 fields
    console.log('\n📦 PARTE 2: Adicionando campos v3.0.0 em athlete_profiles...\n');

    const v3Fields = [
      { name: 'hasRunBefore', type: 'BOOLEAN', default: 'DEFAULT true' },
      { name: 'currentlyInjured', type: 'BOOLEAN', default: 'DEFAULT false' },
      { name: 'avgSleepHours', type: 'DOUBLE PRECISION', default: '' },
      { name: 'tracksMenstrualCycle', type: 'BOOLEAN', default: 'DEFAULT false' },
      { name: 'avgCycleLength', type: 'INTEGER', default: '' },
      { name: 'lastPeriodDate', type: 'TIMESTAMP', default: '' },
      { name: 'workDemand', type: 'TEXT', default: '' },
      { name: 'familyDemand', type: 'TEXT', default: '' },
    ];

    for (const field of v3Fields) {
      try {
        await prisma.$executeRawUnsafe(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'athlete_profiles' AND column_name = '${field.name}'
            ) THEN
              ALTER TABLE athlete_profiles ADD COLUMN "${field.name}" ${field.type} ${field.default};
              RAISE NOTICE 'Coluna ${field.name} adicionada';
            END IF;
          END $$;
        `);
        console.log(`✅ ${field.name}`);
      } catch (error: any) {
        console.log(`⚠️  ${field.name}: ${error.message}`);
      }
    }

    // PARTE 3: Criar índices
    console.log('\n📦 PARTE 3: Criando índices...\n');

    const indexes = [
      'CREATE INDEX IF NOT EXISTS custom_workouts_intensity_idx ON custom_workouts("intensityLevel")',
      'CREATE INDEX IF NOT EXISTS custom_workouts_type_idx ON custom_workouts("type")',
      'CREATE INDEX IF NOT EXISTS custom_workouts_date_idx ON custom_workouts("date")',
    ];

    for (const idx of indexes) {
      try {
        await prisma.$executeRawUnsafe(idx);
        console.log(`✅ Índice criado`);
      } catch (error: any) {
        console.log(`⚠️  Índice: ${error.message}`);
      }
    }

    // PARTE 4: Verificação
    console.log('\n📦 PARTE 4: Verificando colunas criadas...\n');

    const verifyCustomWorkouts: any = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'custom_workouts'
        AND column_name IN (
          'warmUpStructure', 'mainWorkoutStruct', 'coolDownStructure',
          'objective', 'scientificBasis', 'tips', 'commonMistakes', 
          'successCriteria', 'intensityLevel', 'expectedRPE', 
          'heartRateZones', 'intervals', 'expectedDuration'
        )
      ORDER BY column_name
    `);

    console.log('\n✅ custom_workouts:');
    verifyCustomWorkouts.forEach((col: any) => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });

    const verifyAthleteProfiles: any = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'athlete_profiles'
        AND column_name IN (
          'hasRunBefore', 'currentlyInjured', 'avgSleepHours',
          'tracksMenstrualCycle', 'avgCycleLength', 'lastPeriodDate',
          'workDemand', 'familyDemand'
        )
      ORDER BY column_name
    `);

    console.log('\n✅ athlete_profiles:');
    verifyAthleteProfiles.forEach((col: any) => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });

    console.log('\n✅ Migration v3.0.0 aplicada com sucesso!\n');
  } catch (error: any) {
    console.error('\n❌ Erro ao aplicar migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
