const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testReconnect() {
  try {
    console.log('🔍 Testando reconexão ao Strava...\n');

    // Simular dados que viriam do Strava
    const stravaData = {
      athlete: {
        id: 888777666  // ID diferente para não ter conflito
      },
      access_token: 'new_token_' + Math.random().toString(36).substring(7),
      refresh_token: 'new_refresh_' + Math.random().toString(36).substring(7),
      expires_at: Math.floor(Date.now() / 1000) + 21600
    };

    // Usuário mmaurillio2@gmail.com tem athleteProfile ID 16
    const profileId = 16;

    console.log('📦 Dados do Strava simulados:');
    console.log('  - athlete.id:', stravaData.athlete.id);
    console.log('  - Profile a atualizar: ID', profileId, '\n');

    // Tentar atualizar
    console.log('🔄 Tentando salvar...');
    const updated = await prisma.athleteProfile.update({
      where: { id: profileId },
      data: {
        stravaConnected: true,
        stravaAthleteId: stravaData.athlete.id.toString(),
        stravaAccessToken: stravaData.access_token,
        stravaRefreshToken: stravaData.refresh_token,
        stravaTokenExpiry: new Date(stravaData.expires_at * 1000)
      }
    });

    console.log('✅ Sucesso!\n');
    console.log('📊 Perfil atualizado:');
    console.log('  - stravaConnected:', updated.stravaConnected);
    console.log('  - stravaAthleteId:', updated.stravaAthleteId);
    console.log('  - stravaAccessToken:', updated.stravaAccessToken ? '✅' : '❌');

    // Verificar se persistiu
    console.log('\n🔍 Verificando persistência...');
    const verified = await prisma.athleteProfile.findUnique({
      where: { id: profileId }
    });

    console.log('✅ Persistência OK:');
    console.log('  - stravaConnected:', verified.stravaConnected);
    console.log('  - stravaAthleteId:', verified.stravaAthleteId);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.code === 'P2002') {
      console.error('   P2002: Unique constraint failed');
      console.error('   Meta:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testReconnect();
