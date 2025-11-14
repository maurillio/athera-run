require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function checkPlanGeneration() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Diagnóstico de Geração de Planos\n');
    console.log('═'.repeat(60) + '\n');
    
    // 1. Verificar se tabelas existem
    console.log('📊 1. VERIFICANDO TABELAS...\n');
    
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('custom_workouts', 'athlete_profiles', 'training_plans')
      ORDER BY table_name
    `;
    
    console.log('   Tabelas encontradas:');
    tables.forEach(t => console.log(`   ✅ ${t.table_name}`));
    
    // 2. Verificar campos novos em custom_workouts
    console.log('\n📊 2. VERIFICANDO CAMPOS custom_workouts...\n');
    
    const cwColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'custom_workouts' 
        AND column_name IN ('objective', 'tips', 'intensityLevel', 'expectedRPE')
      ORDER BY column_name
    `;
    
    console.log(`   Campos v3.0: ${cwColumns.length}/4`);
    cwColumns.forEach(c => console.log(`   ✅ ${c.column_name}`));
    
    // 3. Verificar campos novos em athlete_profiles
    console.log('\n📊 3. VERIFICANDO CAMPOS athlete_profiles...\n');
    
    const apColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'athlete_profiles' 
        AND column_name IN ('hasRunBefore', 'currentlyInjured', 'avgSleepHours')
      ORDER BY column_name
    `;
    
    console.log(`   Campos v3.0: ${apColumns.length}/3`);
    apColumns.forEach(c => console.log(`   ✅ ${c.column_name}`));
    
    // 4. Verificar último plano criado
    console.log('\n📊 4. ÚLTIMOS PLANOS CRIADOS...\n');
    
    const recentPlans = await prisma.$queryRaw`
      SELECT 
        id,
        user_id,
        created_at,
        updated_at
      FROM training_plans
      ORDER BY created_at DESC
      LIMIT 3
    `;
    
    if (recentPlans.length > 0) {
      console.log(`   Total: ${recentPlans.length} planos recentes`);
      recentPlans.forEach(p => {
        console.log(`   📅 ${p.created_at.toISOString()} - User: ${p.user_id}`);
      });
    } else {
      console.log('   ⚠️  Nenhum plano encontrado');
    }
    
    // 5. Verificar workouts com campos novos
    console.log('\n📊 5. WORKOUTS COM CAMPOS v3.0...\n');
    
    const workoutsV3 = await prisma.$queryRaw`
      SELECT COUNT(*) as total
      FROM custom_workouts
      WHERE objective IS NOT NULL 
         OR tips IS NOT NULL 
         OR "intensityLevel" IS NOT NULL
    `;
    
    console.log(`   Workouts com campos v3.0: ${workoutsV3[0]?.total || 0}`);
    
    // 6. Testar query que pode estar falhando
    console.log('\n📊 6. TESTANDO QUERY DE PLANOS...\n');
    
    try {
      const testQuery = await prisma.$queryRaw`
        SELECT 
          cw.id,
          cw.type,
          cw.objective,
          cw."intensityLevel",
          cw."expectedRPE"
        FROM custom_workouts cw
        LIMIT 1
      `;
      console.log('   ✅ Query funciona! Estrutura OK.');
      if (testQuery.length > 0) {
        console.log('   Exemplo:', testQuery[0]);
      }
    } catch (err) {
      console.log('   ❌ ERRO na query:', err.message);
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ Diagnóstico completo!\n');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('\nStack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkPlanGeneration();
