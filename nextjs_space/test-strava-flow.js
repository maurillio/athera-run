const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCompleteFlow() {
  try {
    console.log('🔍 Testando fluxo completo de Strava\n');

    // 1. Simular dados recebidos do Strava
    const stravaResponse = {
      token_type: 'Bearer',
      expires_at: Math.floor(Date.now() / 1000) + 21600,
      expires_in: 21600,
      refresh_token: 'real_refresh_token_' + Math.random().toString(36).substring(7),
      access_token: 'real_access_token_' + Math.random().toString(36).substring(7),
      athlete: {
        id: 999888777,
        username: 'mmaurillio2',
        firstname: 'Maurilio',
        lastname: 'Test',
        city: 'São Paulo',
        state: 'SP',
        country: 'Brazil',
        sex: 'M',
        summit: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-10-29T00:00:00Z',
        badge_type_id: 0,
        weight: 75,
        profile_medium: 'https://example.com/avatar.jpg',
        profile: 'https://example.com/avatar.jpg',
        friend: null,
        follower: null
      }
    };

    console.log('📦 Dados Strava simulados:');
    console.log('  - athlete.id:', stravaResponse.athlete.id);
    console.log('  - access_token:', stravaResponse.access_token.substring(0, 20) + '...');
    console.log('  - refresh_token:', stravaResponse.refresh_token.substring(0, 20) + '...\n');

    // 2. Procurar o usuário mmaurillio2@gmail.com
    const user = await prisma.user.findUnique({
      where: { email: 'mmaurillio2@gmail.com' },
      include: { athleteProfile: true }
    });

    if (!user) {
      console.log('❌ Usuário mmaurillio2@gmail.com não encontrado');
      return;
    }

    console.log('👤 Usuário encontrado:');
    console.log('  - Email:', user.email);
    console.log('  - ID:', user.id);
    console.log('  - AthleteProfile:', user.athleteProfile ? 'Sim' : 'Não\n');

    let profile = user.athleteProfile;

    // 3. Se não tiver perfil, criar
    if (!profile) {
      console.log('📝 Criando novo AthleteProfile...');
      profile = await prisma.athleteProfile.create({
        data: {
          userId: user.id,
          weight: 88,
          height: 180,
          currentVDOT: 37.5,
          targetTime: "4:00:00",
          goalDistance: "marathon",
          runningLevel: "intermediate",
          stravaConnected: false
        }
      });
      console.log('✅ Perfil criado: ' + profile.id + '\n');
    }

    // 4. Atualizar com tokens do Strava
    console.log('🔄 Atualizando perfil com tokens do Strava...');
    console.log('  Profile ID:', profile.id);
    console.log('  stravaAthleteId será:', stravaResponse.athlete.id.toString());
    console.log('  stravaAccessToken será salvo: Sim');
    console.log('  stravaRefreshToken será salvo: Sim');
    console.log('  stravaTokenExpiry será:', new Date(stravaResponse.expires_at * 1000).toISOString());

    const updatedProfile = await prisma.athleteProfile.update({
      where: { id: profile.id },
      data: {
        stravaConnected: true,
        stravaAthleteId: stravaResponse.athlete.id.toString(),
        stravaAccessToken: stravaResponse.access_token,
        stravaRefreshToken: stravaResponse.refresh_token,
        stravaTokenExpiry: new Date(stravaResponse.expires_at * 1000)
      }
    });

    console.log('\n✅ Atualização bem-sucedida!\n');

    // 5. Verificar resultado
    console.log('📊 Estado do perfil após atualização:');
    console.log('  - stravaConnected:', updatedProfile.stravaConnected ? '✅ true' : '❌ false');
    console.log('  - stravaAthleteId:', updatedProfile.stravaAthleteId);
    console.log('  - stravaAccessToken:', updatedProfile.stravaAccessToken ? '✅ Salvo' : '❌ Não salvo');
    console.log('  - stravaRefreshToken:', updatedProfile.stravaRefreshToken ? '✅ Salvo' : '❌ Não salvo');
    console.log('  - stravaTokenExpiry:', updatedProfile.stravaTokenExpiry + '\n');

    // 6. Simular o que o componente vai buscar
    console.log('🔍 Simulando chamada do componente /api/profile/create...');
    const componentFetch = await prisma.athleteProfile.findUnique({
      where: { userId: user.id }
    });

    console.log('📱 Dados que o componente receberia:');
    console.log('  - stravaConnected:', componentFetch.stravaConnected ? '✅ true' : '❌ false');
    console.log('  - stravaAthleteId:', componentFetch.stravaAthleteId);
    console.log('\n✅ Componente mostraria: ' + (componentFetch.stravaConnected ? '"✅ Conectado"' : '"❌ Não conectado"'));

  } catch (error) {
    console.error('❌ Erro durante fluxo:', error.message);
    console.error('Tipo:', error.code || error.name);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testCompleteFlow();
