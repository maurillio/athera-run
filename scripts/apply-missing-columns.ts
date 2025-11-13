/**
 * Script para aplicar colunas faltantes via Prisma Raw Query
 * Aplica migration v2.0.0 + v3.0.0 diretamente no banco
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Aplicando colunas faltantes...\n');

  try {
    // Verificar se já existem
    console.log('📋 Verificando colunas existentes...');
    
    const checkCols = await prisma.$queryRaw<any[]>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'custom_workouts' 
      AND column_name IN (
        'warmUpStructure', 'mainWorkoutStruct', 'coolDownStructure',
        'objective', 'scientificBasis', 'tips', 'commonMistakes',
        'successCriteria', 'intensityLevel', 'expectedRPE',
        'heartRateZones', 'intervals', 'expectedDuration'
      );
    `;
    
    console.log(`✅ Encontradas ${checkCols.length} colunas já existentes`);
    
    // Se já tem 13 colunas, tudo OK
    if (checkCols.length >= 13) {
      console.log('✅ Todas as colunas v2.0.0 já existem!');
      return;
    }

    console.log('\n⚙️  Aplicando colunas faltantes...\n');

    // Aplicar em partes pequenas
    const migrations = [
      {
        name: 'warmUpStructure',
        sql: `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "warmUpStructure" JSONB;`
      },
      {
        name: 'mainWorkoutStruct',
        sql: `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "mainWorkoutStruct" JSONB;`
      },
      {
        name: 'coolDownStructure',
        sql: `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "coolDownStructure" JSONB;`
      },
      {
        name: 'objective',
        sql: `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "objective" TEXT;`
      },
      {
        name: 'scientificBasis',
        sql: `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "scientificBasis" TEXT;`
      },
      {
        name: 'tips',
        sql: `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "tips" JSONB;`
      },
      {
        name: 'commonMistakes',
        sql: `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "commonMistakes" JSONB;`
      },
      {
        name: 'successCriteria',
        sql: `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "successCriteria" JSONB;`
      },
      {
        name: 'intensityLevel',
        sql: `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "intensityLevel" INTEGER CHECK ("intensityLevel" >= 1 AND "intensityLevel" <= 5);`
      },
      {
        name: 'expectedRPE',
        sql: `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "expectedRPE" INTEGER CHECK ("expectedRPE" >= 1 AND "expectedRPE" <= 10);`
      },
      {
        name: 'heartRateZones',
        sql: `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "heartRateZones" JSONB;`
      },
      {
        name: 'intervals',
        sql: `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "intervals" JSONB;`
      },
      {
        name: 'expectedDuration',
        sql: `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "expectedDuration" INTEGER;`
      }
    ];

    for (const mig of migrations) {
      try {
        await prisma.$executeRawUnsafe(mig.sql);
        console.log(`  ✅ ${mig.name}`);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          console.log(`  ⏭️  ${mig.name} (já existe)`);
        } else {
          console.error(`  ❌ ${mig.name}: ${error.message}`);
        }
      }
    }

    console.log('\n🎉 Migration aplicada com sucesso!');
    
    // Regenerar client
    console.log('\n🔄 Regenerando Prisma Client...');
    const { execSync } = require('child_process');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('\n✅ Tudo pronto!');

  } catch (error) {
    console.error('\n❌ Erro:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
