/**
 * Script para aplicar colunas faltantes via Prisma
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Aplicando colunas faltantes v2.0.0...\n');

  try {
    const migrations = [
      `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "warmUpStructure" JSONB`,
      `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "mainWorkoutStruct" JSONB`,
      `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "coolDownStructure" JSONB`,
      `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "objective" TEXT`,
      `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "scientificBasis" TEXT`,
      `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "tips" JSONB`,
      `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "commonMistakes" JSONB`,
      `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "successCriteria" JSONB`,
      `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "intensityLevel" INTEGER`,
      `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "expectedRPE" INTEGER`,
      `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "heartRateZones" JSONB`,
      `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "intervals" JSONB`,
      `ALTER TABLE "custom_workouts" ADD COLUMN IF NOT EXISTS "expectedDuration" INTEGER`,
    ];

    for (const sql of migrations) {
      try {
        await prisma.$executeRawUnsafe(sql);
        console.log(`  ✅ ${sql.match(/ADD COLUMN IF NOT EXISTS "([^"]+)"/)[1]}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`  ⏭️  Já existe`);
        } else {
          console.error(`  ❌ Erro: ${error.message}`);
        }
      }
    }

    console.log('\n✅ Migration aplicada!');
    
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
