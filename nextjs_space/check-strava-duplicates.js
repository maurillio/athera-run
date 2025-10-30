const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDuplicates() {
  try {
    console.log('🔍 Procurando duplicatas de stravaAthleteId...\n');

    // Procurar todos os perfis com stravaAthleteId
    const profiles = await prisma.athleteProfile.findMany({
      where: {
        stravaAthleteId: {
          not: null
        }
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });

    console.log(`📊 Total de perfis com stravaAthleteId: ${profiles.length}\n`);

    // Agrupar por stravaAthleteId
    const grouped = {};
    profiles.forEach(p => {
      if (!grouped[p.stravaAthleteId]) {
        grouped[p.stravaAthleteId] = [];
      }
      grouped[p.stravaAthleteId].push(p);
    });

    console.log('🎯 Análise:');
    Object.entries(grouped).forEach(([athleteId, profs]) => {
      if (profs.length > 1) {
        console.log(`\n❌ DUPLICATA ENCONTRADA - stravaAthleteId: ${athleteId}`);
        profs.forEach((p, i) => {
          console.log(`   ${i + 1}. Perfil ID ${p.id} - User: ${p.user?.email || 'N/A'}`);
        });
      }
    });

    // Mostrar todos os perfis
    console.log('\n\n📋 Todos os perfis com stravaAthleteId:');
    profiles.forEach(p => {
      console.log(`  - Perfil ${p.id} (${p.user?.email}): stravaAthleteId = ${p.stravaAthleteId}, connected = ${p.stravaConnected}`);
    });

    // Mostrar do usuário específico
    console.log('\n\n👤 Estado do usuário mmaurillio2@gmail.com:');
    const user = await prisma.user.findUnique({
      where: { email: 'mmaurillio2@gmail.com' },
      include: { athleteProfile: true }
    });

    if (user) {
      console.log(`  - Email: ${user.email}`);
      console.log(`  - ID: ${user.id}`);
      console.log(`  - AthleteProfile ID: ${user.athleteProfile?.id}`);
      console.log(`  - stravaConnected: ${user.athleteProfile?.stravaConnected}`);
      console.log(`  - stravaAthleteId: ${user.athleteProfile?.stravaAthleteId}`);
      console.log(`  - stravaAccessToken: ${user.athleteProfile?.stravaAccessToken ? '✅' : '❌'}`);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicates();
