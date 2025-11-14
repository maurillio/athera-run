require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function findTables() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 TODAS AS TABELAS NO BANCO:\n');
    
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    tables.forEach(t => console.log(`   📋 ${t.table_name}`));
    
    console.log(`\n   Total: ${tables.length} tabelas\n`);
    
    // Procurar por tabelas relacionadas a planos
    console.log('🔍 TABELAS RELACIONADAS A PLANOS:\n');
    
    const planTables = tables.filter(t => 
      t.table_name.toLowerCase().includes('plan') || 
      t.table_name.toLowerCase().includes('workout')
    );
    
    if (planTables.length > 0) {
      planTables.forEach(t => console.log(`   ✅ ${t.table_name}`));
    } else {
      console.log('   ⚠️  Nenhuma tabela de planos encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findTables();
