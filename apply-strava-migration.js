require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function applyMigration() {
  console.log('📦 Aplicando migration Strava Enhancement v2.6.0...\n');
  
  const migrationPath = path.join(__dirname, 'prisma/migrations/20251120_strava_enhancement_v2_6_0/migration.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  // Separar comandos SQL (remover comentários primeiro)
  const cleanSql = sql
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n');
    
  const commands = cleanSql
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0);
  
  try {
    console.log(`📝 Executando ${commands.length} comandos SQL...\n`);
    
    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      if (cmd) {
        try {
          await prisma.$executeRawUnsafe(cmd);
          if (cmd.includes('CREATE TABLE')) {
            const tableName = cmd.match(/CREATE TABLE.*?"(\w+)"/)?.[1];
            console.log(`✅ Tabela criada: ${tableName}`);
          } else if (cmd.includes('CREATE INDEX') || cmd.includes('CREATE UNIQUE INDEX')) {
            const indexName = cmd.match(/INDEX.*?"(\w+)"/)?.[1];
            console.log(`✅ Index criado: ${indexName}`);
          }
        } catch (err) {
          // Ignorar erros de "já existe"
          if (err.message.includes('already exists')) {
            console.log(`⚠️  Já existe, pulando...`);
          } else {
            throw err;
          }
        }
      }
    }
    
    console.log('\n✅ Migration aplicada com sucesso!');
    
    // Verificar tabelas criadas
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename LIKE 'strava_%'
      ORDER BY tablename;
    `;
    
    console.log('\n📋 Tabelas Strava:');
    tables.forEach(t => console.log(`   - ${t.tablename}`));
    
  } catch (error) {
    console.error('❌ Erro ao aplicar migration:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration().catch(console.error);
