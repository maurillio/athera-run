const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSessionAndUpdate() {
  try {
    console.log('🔍 Testando se um usuário existente pode atualizar seu Strava...\n');

    // Procurar um usuário que fez login com Google
    const user = await prisma.user.findFirst({
      take: 1,
      include: {
        athleteProfile: true,
        accounts: true
      }
    });

    if (!user) {
      console.log('❌ Nenhum usuário encontrado');
      return;
    }

    console.log('👤 Usuário encontrado:');
    console.log('  - Email:', user.email);
    console.log('  - ID:', user.id);
    console.log('  - Contas conectadas:');
    user.accounts.forEach(acc => {
      console.log(`    • ${acc.provider}: ${acc.providerAccountId}`);
    });
    console.log('  - AthleteProfile:', user.athleteProfile ? 'Sim' : 'Não', '\n');

    let profile = user.athleteProfile;

    if (!profile) {
      console.log('❌ Usuário não tem AthleteProfile!');
      console.log('   Isso significa que o usuário fez login mas não completou o onboarding?\n');
      return;
    }

    console.log('Current athlete profile state:');
    console.log('  - stravaConnected:', profile.stravaConnected);
    console.log('  - stravaAthleteId:', profile.stravaAthleteId);
    console.log('  - stravaAccessToken:', profile.stravaAccessToken ? '✅ Tem' : '❌ Sem');
    console.log('  - stravaRefreshToken:', profile.stravaRefreshToken ? '✅ Tem' : '❌ Sem\n');

    // Simular tokens do Strava
    const stravaTokens = {
      access_token: 'test_access_token_from_callback_123',
      refresh_token: 'test_refresh_token_from_callback_456',
      athlete_id: 9876543,
      expires_at: Math.floor(Date.now() / 1000) + 21600
    };

    console.log('📦 Tokens Strava a salvar (simulado):');
    console.log('  - access_token:', stravaTokens.access_token);
    console.log('  - refresh_token:', stravaTokens.refresh_token);
    console.log('  - athlete_id:', stravaTokens.athlete_id);
    console.log('  - expires_at:', stravaTokens.expires_at, '\n');

    console.log('🔄 Atualizando perfil com tokens do Strava...');
    const updated = await prisma.athleteProfile.update({
      where: { id: profile.id },
      data: {
        stravaConnected: true,
        stravaAthleteId: stravaTokens.athlete_id.toString(),
        stravaAccessToken: stravaTokens.access_token,
        stravaRefreshToken: stravaTokens.refresh_token,
        stravaTokenExpiry: new Date(stravaTokens.expires_at * 1000)
      }
    });

    console.log('✅ Atualizado com sucesso!\n');

    console.log('📊 Estado após atualização:');
    console.log('  - stravaConnected:', updated.stravaConnected);
    console.log('  - stravaAthleteId:', updated.stravaAthleteId);
    console.log('  - stravaAccessToken:', updated.stravaAccessToken ? '✅ Salvo' : '❌ Não salvo');
    console.log('  - stravaTokenExpiry:', updated.stravaTokenExpiry, '\n');

    // Verificar no componente
    console.log('📱 Verificando como o componente veria isso:');
    console.log('  - profile.stravaConnected seria:', updated.stravaConnected);
    console.log('  - Componente mostraria: ' + (updated.stravaConnected ? '✅ "Conectado"' : '❌ "Não conectado"'));

  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.code === 'P2025') {
      console.error('   (Prisma P2025 = Registro não encontrado)');
    }
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testSessionAndUpdate();
