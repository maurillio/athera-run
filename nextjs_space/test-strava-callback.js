const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCallback() {
  try {
    console.log('🔍 Testando salvar tokens do Strava...\n');

    // Simular dados que viriam da resposta do Strava
    const stravaData = {
      token_type: 'Bearer',
      expires_at: 1729705180,
      expires_in: 21600,
      refresh_token: 'test_refresh_token_123',
      access_token: 'test_access_token_456',
      athlete: {
        id: 123456,
        username: 'test_athlete',
        firstname: 'Test',
        lastname: 'Athlete',
        city: '',
        state: '',
        country: null,
        sex: 'M',
        summit: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        badge_type_id: 0,
        weight: 70,
        profile_medium: 'https://example.com/avatar.jpg',
        profile: 'https://example.com/avatar.jpg',
        friend: null,
        follower: null
      }
    };

    console.log('📦 Dados do Strava simulados:');
    console.log('  - athlete.id:', stravaData.athlete.id);
    console.log('  - access_token:', stravaData.access_token ? 'Tem token' : 'Sem token');
    console.log('  - refresh_token:', stravaData.refresh_token ? 'Tem token' : 'Sem token');
    console.log('  - expires_at:', stravaData.expires_at, '\n');

    // Procurar um usuário com perfil
    const user = await prisma.user.findFirst({
      take: 1,
      include: { athleteProfile: true }
    });

    if (!user) {
      console.log('❌ Nenhum usuário encontrado no banco de dados');
      return;
    }

    console.log('👤 Usuário encontrado:', user.email);
    console.log('  - ID:', user.id);
    console.log('  - AthleteProfile:', user.athleteProfile ? 'Sim' : 'Não', '\n');

    let profile = user.athleteProfile;

    if (!profile) {
      console.log('📝 AthleteProfile não existe, criando novo...');
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
      console.log('✅ Novo perfil criado:', profile.id, '\n');
    }

    console.log('🔄 Atualizando tokens do Strava...');
    console.log('  - Profile ID:', profile.id);
    console.log('  - stravaAthleteId será:', stravaData.athlete.id.toString());

    const updatedProfile = await prisma.athleteProfile.update({
      where: { id: profile.id },
      data: {
        stravaConnected: true,
        stravaAthleteId: stravaData.athlete.id.toString(),
        stravaAccessToken: stravaData.access_token,
        stravaRefreshToken: stravaData.refresh_token,
        stravaTokenExpiry: new Date(stravaData.expires_at * 1000)
      }
    });

    console.log('✅ Tokens salvos com sucesso!\n');
    console.log('📊 Perfil atualizado:');
    console.log('  - stravaConnected:', updatedProfile.stravaConnected);
    console.log('  - stravaAthleteId:', updatedProfile.stravaAthleteId);
    console.log('  - stravaAccessToken:', updatedProfile.stravaAccessToken ? '✅ Salvo' : '❌ Não salvo');
    console.log('  - stravaRefreshToken:', updatedProfile.stravaRefreshToken ? '✅ Salvo' : '❌ Não salvo');
    console.log('  - stravaTokenExpiry:', updatedProfile.stravaTokenExpiry);

    // Verificar se ficou persistido
    console.log('\n🔍 Verificando se foi persistido no banco...');
    const verifiedProfile = await prisma.athleteProfile.findUnique({
      where: { id: profile.id }
    });

    console.log('✅ Verificação:');
    console.log('  - stravaConnected:', verifiedProfile.stravaConnected);
    console.log('  - stravaAthleteId:', verifiedProfile.stravaAthleteId);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testCallback();
