require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function testPlanGenerationError() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 DIAGNÓSTICO COMPLETO - Geração de Planos\n');
    console.log('═'.repeat(70) + '\n');
    
    // 1. Verificar último erro em custom_training_plans
    console.log('📊 1. ÚLTIMOS PLANOS (custom_training_plans)...\n');
    
    const recentPlans = await prisma.$queryRaw`
      SELECT 
        id,
        user_id,
        status,
        created_at,
        error_message
      FROM custom_training_plans
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    if (recentPlans.length > 0) {
      console.log(`   Total: ${recentPlans.length} planos recentes\n`);
      recentPlans.forEach(p => {
        console.log(`   📅 ${p.created_at.toISOString()}`);
        console.log(`      User: ${p.user_id}`);
        console.log(`      Status: ${p.status}`);
        if (p.error_message) {
          console.log(`      ❌ Erro: ${p.error_message.substring(0, 100)}...`);
        }
        console.log('');
      });
    } else {
      console.log('   ℹ️  Nenhum plano encontrado\n');
    }
    
    // 2. Verificar custom_workouts recentes
    console.log('📊 2. WORKOUTS RECENTES...\n');
    
    const recentWorkouts = await prisma.$queryRaw`
      SELECT 
        id,
        plan_id,
        type,
        objective,
        "intensityLevel",
        "expectedRPE",
        created_at
      FROM custom_workouts
      ORDER BY created_at DESC
      LIMIT 3
    `;
    
    if (recentWorkouts.length > 0) {
      console.log(`   Total: ${recentWorkouts.length} workouts recentes\n`);
      recentWorkouts.forEach(w => {
        console.log(`   🏃 ${w.type || 'Sem tipo'}`);
        console.log(`      Plan ID: ${w.plan_id || 'N/A'}`);
        console.log(`      Objetivo: ${w.objective ? '✅ Sim' : '❌ Não'}`);
        console.log(`      Intensidade: ${w.intensityLevel || 'N/A'}`);
        console.log(`      RPE: ${w.expectedRPE || 'N/A'}`);
        console.log(`      Criado: ${w.created_at.toISOString()}`);
        console.log('');
      });
    } else {
      console.log('   ℹ️  Nenhum workout encontrado\n');
    }
    
    // 3. Testar se conseguimos criar um workout de teste
    console.log('📊 3. TESTE DE INSERÇÃO...\n');
    
    try {
      const testInsert = await prisma.$executeRaw`
        INSERT INTO custom_workouts 
          (type, objective, "intensityLevel", "expectedRPE", created_at, updated_at)
        VALUES 
          ('test', 'Teste v3.0', 3, 5, NOW(), NOW())
        RETURNING id
      `;
      console.log('   ✅ INSERT funciona! Database OK para v3.0\n');
      
      // Deletar teste
      await prisma.$executeRaw`DELETE FROM custom_workouts WHERE type = 'test'`;
      console.log('   🗑️  Teste removido\n');
      
    } catch (err) {
      console.log('   ❌ ERRO no INSERT:', err.message, '\n');
    }
    
    // 4. Verificar schema de custom_workouts
    console.log('📊 4. SCHEMA custom_workouts...\n');
    
    const schema = await prisma.$queryRaw`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'custom_workouts'
        AND column_name IN (
          'objective', 'scientificBasis', 'tips', 'commonMistakes',
          'intensityLevel', 'expectedRPE', 'warmUpStructure'
        )
      ORDER BY column_name
    `;
    
    console.log(`   Campos v3.0 encontrados: ${schema.length}/7\n`);
    schema.forEach(c => {
      console.log(`   ✅ ${c.column_name.padEnd(20)} | ${c.data_type.padEnd(15)} | Nullable: ${c.is_nullable}`);
    });
    
    console.log('\n' + '═'.repeat(70));
    
    // 5. Verificar se o código está tentando usar campos que não existem
    console.log('\n📊 5. ANÁLISE DO PROBLEMA...\n');
    
    if (schema.length === 7) {
      console.log('   ✅ Todos os campos v3.0 existem no banco');
      console.log('   ✅ Migration foi aplicada com sucesso');
      console.log('\n   💡 POSSÍVEIS CAUSAS DO ERRO:\n');
      console.log('      1. Vercel ainda não recebeu o deploy mais recente');
      console.log('      2. Prisma Client no Vercel não foi regenerado');
      console.log('      3. Cache do Vercel com código antigo');
      console.log('      4. Erro na lógica de geração (não no banco)');
    } else {
      console.log(`   ⚠️  Faltam ${7 - schema.length} campos!`);
      console.log('   ❌ Migration não foi aplicada completamente');
    }
    
    console.log('\n✅ Diagnóstico completo!\n');
    
  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO:', error.message);
    console.error('\nStack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testPlanGenerationError();
